import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();
const controller = new AuthController();

router.get("/me", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/send-otp", controller.sendOtp);
router.post("/send-verification-otp", controller.sendVerificationOtp);
router.post("/forgot-password", controller.forgotPassword);
router.put("/update-profile", authenticateToken, controller.updateProfile);

export default router;
