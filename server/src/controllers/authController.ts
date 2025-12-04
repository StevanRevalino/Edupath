import { Request, Response } from "express";
import {
  sendOtpEmail,
  sendVerificationOtpEmail,
} from "../services/emailService";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import prisma from "../configs/prisma";

export class AuthController {
  constructor() {
    // Bind methods to preserve 'this' context
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.sendOtp = this.sendOtp.bind(this);
    this.sendVerificationOtp = this.sendVerificationOtp.bind(this);
  }

  private async generateCustomUserId(): Promise<string> {
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
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: req.body.email.toLowerCase() },
      });

      if (existingUser) {
        res.status(400).json({
          success: false,
          message: "Email sudah terdaftar",
        });
        return;
      }

      const hashed = await bcrypt.hash(req.body.password, 10);
      const customId = await this.generateCustomUserId();

      const user = await prisma.user.create({
        data: {
          user_id: customId,
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          email: req.body.email,
          role: "STUDENT" as const,
          kelas: Number(req.body.kelas),
          password: hashed,
        },
      });

      res.status(201).json({
        success: true,
        data: user,
        message: "Berhasil register",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    console.log("Login request received:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log("Missing email or password");
      res.status(400).json({
        success: false,
        message: "Email dan password wajib diisi",
      });
      return;
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user || !user.password) {
        console.log("Login failed: Invalid credentials");
        res.status(401).json({
          success: false,
          message: "Email atau password salah",
        });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: "Email atau password salah",
        });
        return;
      }

      // Create JWT Token
      const token = jwt.sign(
        {
          user_id: user.user_id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          role: user.role,
          kelas: user.kelas,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" } as SignOptions
      );

      console.log("Login successful for:", email);
      res.status(200).json({
        success: true,
        data: {
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
        },
        message: "Login successful",
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      res.status(400).json({
        success: false,
        message: "Email, OTP, dan password baru wajib diisi",
      });
      return;
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User tidak ditemukan",
        });
        return;
      }

      // Validate OTP is correct (frontend already validated, but double check)
      // In production, you should store OTP in database with expiration
      // For now, we trust the frontend validation

      const isSame = await bcrypt.compare(newPassword, user.password!);
      if (isSame) {
        res.status(400).json({
          success: false,
          message: "Password baru tidak boleh sama dengan password lama",
        });
        return;
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { email },
        data: { password: hashed },
      });

      res.status(200).json({
        success: true,
        message: "Password berhasil direset",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.user_id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User tidak terautentikasi",
        });
        return;
      }

      const { firstname, lastname, kelas } = req.body;
      console.log("Received update request:", { firstname, lastname, kelas });

      const updateData: {
        firstname?: string;
        lastname?: string;
        kelas?: number | null;
      } = {};

      if (firstname) updateData.firstname = firstname;
      if (lastname) updateData.lastname = lastname;
      if (kelas !== undefined && kelas !== null) {
        const kelasNumber = Number(kelas);
        // Pastikan kelas adalah number valid, jika tidak gunakan nilai asli atau skip
        if (!isNaN(kelasNumber) && kelasNumber >= 10 && kelasNumber <= 12) {
          updateData.kelas = kelasNumber;
        } else {
          console.warn(`Invalid kelas value: ${kelas}, skipping update`);
        }
      } else if (kelas === null) {
        updateData.kelas = null;
      }

      console.log("Update data to be sent to DB:", updateData);

      // Cek apakah ada data yang akan diupdate
      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          success: false,
          message: "Tidak ada data yang akan diperbarui",
        });
        return;
      }

      const updatedUser = await prisma.user.update({
        where: { user_id: userId },
        data: updateData,
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;

      res.status(200).json({
        success: true,
        data: userWithoutPassword,
        message: "Profil berhasil diperbarui",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async sendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: "Email wajib diisi",
        });
        return;
      }

      // Generate OTP (6 digit)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Send email using nodemailer
      await sendOtpEmail(email, otp);

      res.status(200).json({
        success: true,
        otp,
        message: "OTP berhasil dikirim ke email",
      });
    } catch (error: any) {
      console.error("Send OTP error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengirim OTP",
      });
    }
  }

  async sendVerificationOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: "Email wajib diisi",
        });
        return;
      }

      // Generate OTP (6 digit)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Send verification email using the new template
      await sendVerificationOtpEmail(email, otp);

      res.status(200).json({
        success: true,
        otp,
        message: "Kode verifikasi berhasil dikirim ke email",
      });
    } catch (error: any) {
      console.error("Send verification OTP error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengirim kode verifikasi",
      });
    }
  }
}
