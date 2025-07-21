import { Router } from "express";
import { AuthController } from "../controllers/authController";

const router = Router();
const controller = new AuthController();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/send-otp", controller.sendOTP);
router.post("/verify-otp", controller.verifyOTP);

export default router;
