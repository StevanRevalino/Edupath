import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/userRepository";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

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
  return `US${String(nextNumber).padStart(3, "0")}`; // US001, US002, ...
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
      kelas: Number(data.kelas),
      password: hashed,
    };
    const user = await userRepository.create(formatedUser);
    return user;
  }

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);

    if (!user || !user.password) return null; // Tambahkan pengecekan ini

    const isMatch = await bcrypt.compare(password, user.password); // pastikan password ada
    if (!isMatch) return null;

    return user;
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
}
