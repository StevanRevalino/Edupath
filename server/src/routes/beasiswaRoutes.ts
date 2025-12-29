import express from "express";
import {BeasiswaController} from "../controllers/beasiswaController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();
const controller = new BeasiswaController();

// Public routes - anyone can view beasiswa
router.get("/", controller.getAllBeasiswa);
router.get("/:id", controller.getBeasiswaById);

// Protected routes - only authenticated users (admin) can create, update, delete
router.post("/", authenticateToken, controller.createBeasiswa);
router.put("/:id", authenticateToken, controller.updateBeasiswa);
router.delete("/:id", authenticateToken, controller.deleteBeasiswa);

export default router;
