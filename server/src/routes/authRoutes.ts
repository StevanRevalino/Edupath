import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();
const controller = new AuthController();

router.get("/me", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

router.post("/register", controller.register.bind(controller));
router.post("/login", controller.login.bind(controller));
router.post("/send-otp", controller.sendOtp.bind(controller));
router.post(
  "/send-verification-otp",
  controller.sendVerificationOtp.bind(controller)
);
router.post("/reset-password", controller.resetPassword.bind(controller));
router.put(
  "/update-profile",
  authenticateToken,
  controller.updateProfile.bind(controller)
);

export default router;
