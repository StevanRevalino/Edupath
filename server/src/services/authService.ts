import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/userRepository";
import axios from "axios";

const userRepository = new UserRepository();

export class AuthService {
  async register(data: any) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("Email sudah terdaftar");
    }
    const hashed = await bcrypt.hash(data.password, 10);
    const formatedUser = {
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
}
