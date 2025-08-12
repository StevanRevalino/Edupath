import { Request, Response } from "express";
import { AuthService } from "../services/authService";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({ message: "Berhasil register", user });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  constructor() {
    this.login = this.login.bind(this);
  }

  async login(req: Request, res: Response) {
    console.log("Login request received:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log("Missing email or password");
      return res
        .status(400)
        .json({ message: "Email dan password wajib diisi" });
    }

    try {
      const result = await authService.login(email, password);

      if (!result) {
        console.log("Login failed: Invalid credentials");
        return res.status(401).json({ message: "Email atau password salah" });
      }

      console.log("Login successful for:", email);
      res.json(result); // token + user
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    const { email, newPassword } = req.body;

    if (!email || !newPassword)
      return res
        .status(400)
        .json({ message: "Email dan password baru wajib diisi" });

    try {
      await authService.forgotPassword(email, newPassword);
      res.status(200).json({ message: "Password berhasil direset" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;

      if (!userId) {
        return res.status(401).json({ message: "User tidak terautentikasi" });
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
        return res.status(400).json({
          message: "Tidak ada data yang akan diperbarui",
        });
      }

      const updatedUser = await authService.updateProfile(userId, updateData);

      res.status(200).json({
        message: "Profil berhasil diperbarui",
        user: updatedUser,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
