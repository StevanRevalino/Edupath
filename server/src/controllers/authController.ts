import { Request, Response } from "express";
import { AuthService } from "../services/authService";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const user = await authService.login(email, password);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    res.json(user);
  }

  async sendOTP(req: Request, res: Response) {
    const { email } = req.body;

    try {
      const otp = await authService.sendOTP(email);
      res.json({ message: "OTP sent", otp });
    } catch (error) {
      console.error("Send OTP Error:", error);
      res
        .status(500)
        .json({
          message: "Failed to send OTP",
          error: (error as Error).message,
        });
    }
  }

  async verifyOTP(req: Request, res: Response) {
    const { email, otp } = req.body;
    const user = await authService.verifyOTP(email, otp);
    if (!user)
      return res.status(400).json({ message: "Invalid or expired OTP" });
    res.json({ message: "OTP verified", user });
  }
}
