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
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email dan password wajib diisi" });

    const result = await authService.login(email, password);

    if (!result)
      return res.status(401).json({ message: "Email atau password salah" });

    res.json(result); // token + user
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
}
