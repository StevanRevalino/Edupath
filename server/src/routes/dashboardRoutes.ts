import express from "express";
import {
  getDashboardStats,
  getUpcomingConsultations,
  getRecentChats,
} from "../controllers/dashboardController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticateToken);

// Get dashboard statistics
router.get("/stats", getDashboardStats);

// Get upcoming consultations
router.get("/upcoming-consultations", getUpcomingConsultations);

// Get recent chats
router.get("/recent-chats", getRecentChats);

export default router;
