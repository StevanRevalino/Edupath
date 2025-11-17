import express from "express";
import {
  getDashboardStats,
  getUpcomingConsultations,
  getRecentChats,
  getWeeklyConsultations,
  triggerAutoComplete,
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

// Get weekly consultations
router.get("/weekly-consultations", getWeeklyConsultations);

// Manual trigger auto-complete (for testing/admin purposes)
router.post("/auto-complete", triggerAutoComplete);

export default router;
