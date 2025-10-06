import express from "express";
import * as beasiswaController from "../controllers/beasiswaController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

// Public routes - anyone can view beasiswa
router.get("/", beasiswaController.getAllBeasiswa);
router.get("/:id", beasiswaController.getBeasiswaById);

// Protected routes - only authenticated users (admin) can create, update, delete
router.post("/", authenticateToken, beasiswaController.createBeasiswa);
router.put("/:id", authenticateToken, beasiswaController.updateBeasiswa);
router.delete("/:id", authenticateToken, beasiswaController.deleteBeasiswa);

export default router;
