import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class NotificationController {
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

      // Fetch notifications
      const notifications = await prisma.notification.findMany({
        where: {
          user_id: userId,
        },
        orderBy: {
          created_at: "desc",
        },
      });

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

      // Calculate stats
      const stats = {
        total: mappedNotifications.length,
        unread: mappedNotifications.filter((n) => !n.is_read).length,
        consultation_new: mappedNotifications.filter(
          (n) => n.type === "CONSULTATION_ACCEPTED"
        ).length,
        consultation_cancel: mappedNotifications.filter(
          (n) => n.type === "CONSULTATION_REJECTED"
        ).length,
        chat_message: mappedNotifications.filter(
          (n) => n.type === "CHAT_MESSAGE"
        ).length,
      };

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

      // Verify notification belongs to user
      const notification = await prisma.notification.findFirst({
        where: {
          notification_id: notificationId,
          user_id: userId,
        },
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      // Mark as read
      await prisma.notification.update({
        where: {
          notification_id: notificationId,
        },
        data: {
          is_read: true,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Notification marked as read",
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to mark notification as read",
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

      await prisma.notification.updateMany({
        where: {
          user_id: userId,
          is_read: false,
        },
        data: {
          is_read: true,
        },
      });

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

      // Verify notification belongs to user
      const notification = await prisma.notification.findFirst({
        where: {
          notification_id: notificationId,
          user_id: userId,
        },
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      // Delete notification
      await prisma.notification.delete({
        where: {
          notification_id: notificationId,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Notification deleted",
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete notification",
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

      const count = await prisma.notification.count({
        where: {
          user_id: userId,
          is_read: false,
        },
      });

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
