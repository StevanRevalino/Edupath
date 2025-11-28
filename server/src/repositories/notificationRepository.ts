import prisma from "../configs/prisma";

interface CreateNotificationDTO {
  user_id: string;
  type: string;
  title: string;
  message: string;
  related_id?: string;
  link?: string;
}

export class NotificationRepository {
  constructor() {
    // Using singleton prisma instance
  }

  // Create notification
  async create(data: CreateNotificationDTO) {
    return prisma.notification.create({
      data: {
        user_id: data.user_id,
        type: data.type,
        title: data.title,
        message: data.message,
        related_id: data.related_id || null,
        link: data.link || null,
        is_read: false,
      },
    });
  }

  // Find all by user ID
  async findByUserId(userId: string) {
    return prisma.notification.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }

  // Find by ID and user ID
  async findByIdAndUserId(notificationId: string, userId: string) {
    return prisma.notification.findFirst({
      where: {
        notification_id: notificationId,
        user_id: userId,
      },
    });
  }

  // Mark as read
  async markAsRead(notificationId: string) {
    return prisma.notification.update({
      where: {
        notification_id: notificationId,
      },
      data: {
        is_read: true,
      },
    });
  }

  // Mark all as read for user
  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        user_id: userId,
        is_read: false,
      },
      data: {
        is_read: true,
      },
    });
  }

  // Delete notification
  async delete(notificationId: string) {
    return prisma.notification.delete({
      where: {
        notification_id: notificationId,
      },
    });
  }

  // Delete all notifications for user
  async deleteAll(userId: string) {
    return prisma.notification.deleteMany({
      where: {
        user_id: userId,
      },
    });
  }

  // Count unread notifications
  async countUnread(userId: string) {
    return prisma.notification.count({
      where: {
        user_id: userId,
        is_read: false,
      },
    });
  }

  // Get notification stats
  async getStats(userId: string) {
    const notifications = await this.findByUserId(userId);

    const total = notifications.length;
    const unread = notifications.filter((n) => !n.is_read).length;
    const consultation_new = notifications.filter(
      (n) => n.type === "CONSULTATION_NEW"
    ).length;
    const consultation_cancel = notifications.filter(
      (n) => n.type === "CONSULTATION_CANCEL"
    ).length;
    const chat_message = notifications.filter(
      (n) => n.type === "CHAT_MESSAGE"
    ).length;

    return {
      total,
      unread,
      consultation_new,
      consultation_cancel,
      chat_message,
    };
  }
}

export const notificationRepository = new NotificationRepository();
