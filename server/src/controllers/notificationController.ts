import { Request, Response } from "express";
import { NotificationService } from "../services/notificationService";

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();

    // Bind methods to preserve 'this' context
    this.getNotifications = this.getNotifications.bind(this);
    this.markAsRead = this.markAsRead.bind(this);
    this.markAllAsRead = this.markAllAsRead.bind(this);
    this.deleteNotification = this.deleteNotification.bind(this);
    this.deleteAllNotifications = this.deleteAllNotifications.bind(this);
    this.getUnreadCount = this.getUnreadCount.bind(this);
  }

  // Get all notifications for current user
  async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { notifications, stats } =
        await this.notificationService.getNotifications(userId);

      // Map to match frontend interface
      const mappedNotifications = notifications.map((n) => ({
        notification_id: n.notification_id,
        type: n.type,
        title: n.title,
        message: n.message,
        reference_id: n.related_id || "",
        is_read: n.is_read,
        created_at: n.created_at.toISOString(),
        metadata: {},
      }));

      return res.status(200).json({
        success: true,
        data: mappedNotifications,
        stats,
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch notifications",
      });
    }
  }

  // Mark notification as read
  async markAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;
      const { notificationId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      await this.notificationService.markAsRead(notificationId, userId);

      return res.status(200).json({
        success: true,
        message: "Notification marked as read",
      });
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to mark notification as read",
      });
    }
  }

  // Mark all notifications as read
  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      await this.notificationService.markAllAsRead(userId);

      return res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to mark all notifications as read",
      });
    }
  }

  // Delete notification
  async deleteNotification(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;
      const { notificationId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      await this.notificationService.deleteNotification(notificationId, userId);

      return res.status(200).json({
        success: true,
        message: "Notification deleted",
      });
    } catch (error: any) {
      console.error("Error deleting notification:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to delete notification",
      });
    }
  }

  // Delete all notifications
  async deleteAllNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      await this.notificationService.deleteAllNotifications(userId);

      return res.status(200).json({
        success: true,
        message: "All notifications deleted",
      });
    } catch (error: any) {
      console.error("Error deleting all notifications:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to delete all notifications",
      });
    }
  }

  // Get unread count
  async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const count = await this.notificationService.getUnreadCount(userId);

      return res.status(200).json({
        success: true,
        count,
      });
    } catch (error) {
      console.error("Error getting unread count:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get unread count",
      });
    }
  }
}
