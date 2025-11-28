import { Router } from "express";
import { NotificationController } from "../controllers/notificationController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();
const notificationController = new NotificationController();

// All routes require authentication
router.use(authenticateToken);

// Get all notifications
router.get("/", notificationController.getNotifications);

// Get unread count
router.get("/count", notificationController.getUnreadCount);

// Mark notification as read
router.patch("/:notificationId/read", notificationController.markAsRead);

// Mark all as read
router.patch("/read-all", notificationController.markAllAsRead);

// Delete notification
router.delete("/:notificationId", notificationController.deleteNotification);

// Delete all notifications
router.delete("/", notificationController.deleteAllNotifications);

export default router;
