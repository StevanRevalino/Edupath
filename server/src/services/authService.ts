import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/userRepository";
import axios from "axios";
import { generateOTP } from "../utils/otp";
const userRepository = new UserRepository();

export class AuthService {
  async register(data: any) {
    const hashed = await bcrypt.hash(data.password, 10);
    const user = await userRepository.create({ ...data, password: hashed });
    return user;
  }

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);

    if (!user || !user.password) return null; // Tambahkan pengecekan ini

    const isMatch = await bcrypt.compare(password, user.password); // pastikan password ada
    if (!isMatch) return null;

    return user;
  }

  async sendOTP(email: string) {
    const otp = generateOTP();
    const expires = new Date(Date.now() + 5 * 60 * 1000);
    await userRepository.updateOTP(email, otp, expires);
    return otp;
  }

  async verifyOTP(email: string, otp: string) {
    return await userRepository.verifyOTP(email, otp);
  }
}
