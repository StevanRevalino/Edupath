import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/userRepository";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";

const userRepository = new UserRepository();
const generateCustomUserId = async (): Promise<string> => {
  const lastUser = await prisma.user.findFirst({
    orderBy: { user_id: "desc" },
    where: {
      user_id: {
        startsWith: "US",
      },
    },
  });

  let lastNumber = 0;

  if (lastUser) {
    const numPart = parseInt(lastUser.user_id.replace("US", ""));
    lastNumber = isNaN(numPart) ? 0 : numPart;
  }

  const nextNumber = lastNumber + 1;
  return `US${String(nextNumber).padStart(3, "0")}`;
};

export class AuthService {
  async register(data: any) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("Email sudah terdaftar");
    }
    const hashed = await bcrypt.hash(data.password, 10);
    const customId = await generateCustomUserId();
    const formatedUser = {
      user_id: customId,
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      role: "STUDENT" as const,
      kelas: Number(data.kelas),
      password: hashed,
    };
    const user = await userRepository.create(formatedUser);
    return user;
  }

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);

    if (!user || !user.password) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    // ✅ Buat JWT Token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role, // Menggunakan role dari database
        kelas: user.kelas,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" } // expire dalam 1 jam
    );

    // Kirim token + data user (jangan kirim password!)
    return {
      message: "Login berhasil",
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
        kelas: user.kelas,
      },
    };
  }

  async forgotPassword(email: string, newPassword: string) {
    const user = await userRepository.findByEmail(email);

    if (!user) throw new Error("User not found");

    const isSame = await bcrypt.compare(newPassword, user.password!);
    if (isSame)
      throw new Error("Password baru tidak boleh sama dengan sebelumnya");

    const hashed = await bcrypt.hash(newPassword, 10);
    await userRepository.updatePassword(email, hashed);
  }

  async updateProfile(
    userId: string,
    data: { firstname?: string; lastname?: string; kelas?: number }
  ) {
    // Update profil user
    const updatedUser = await userRepository.updateProfile(userId, data);

    if (!updatedUser) {
      throw new Error("User tidak ditemukan");
    }

    // Return user tanpa password
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
}
