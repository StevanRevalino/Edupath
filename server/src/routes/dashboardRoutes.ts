import express from "express";
import { DashboardController } from "../controllers/dashboardController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();
const controller = new DashboardController();

// All dashboard routes require authentication
router.use(authenticateToken);

// Get dashboard statistics
router.get("/stats", controller.getDashboardStats);

// Get upcoming consultations
router.get("/upcoming-consultations", controller.getUpcomingConsultations);

// Get recent chats
router.get("/recent-chats", controller.getRecentChats);

// Get weekly consultations
router.get("/weekly-consultations", controller.getWeeklyConsultations);

// Manual trigger auto-complete (for testing/admin purposes)
router.post("/auto-complete", controller.triggerAutoComplete);

export default router;
