import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import {
  sendOtpEmail,
  sendVerificationOtpEmail,
} from "../services/emailService";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }
  async register(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.authService.register(req.body);
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
      const result = await this.authService.login(email, password);

      if (!result) {
        console.log("Login failed: Invalid credentials");
        res.status(401).json({
          success: false,
          message: "Email atau password salah",
        });
        return;
      }

      console.log("Login successful for:", email);
      res.status(200).json({
        success: true,
        data: result,
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

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      res.status(400).json({
        success: false,
        message: "Email dan password baru wajib diisi",
      });
      return;
    }

    try {
      await this.authService.forgotPassword(email, newPassword);
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
      const updateData: {
        firstname?: string;
        lastname?: string;
        kelas?: number;
      } = {};

      if (firstname) updateData.firstname = firstname;
      if (lastname) updateData.lastname = lastname;
      if (kelas !== undefined) updateData.kelas = Number(kelas);

      // Cek apakah ada data yang akan diupdate
      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          success: false,
          message: "Tidak ada data yang akan diperbarui",
        });
        return;
      }

      const updatedUser = await this.authService.updateProfile(
        userId,
        updateData
      );

      res.status(200).json({
        success: true,
        data: updatedUser,
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
        data: { otp },
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
        data: { otp },
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
