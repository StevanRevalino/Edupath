import { notificationRepository } from "../repositories/notificationRepository";

export class NotificationService {
  private notificationRepository = notificationRepository;

  // Get all notifications for user
  async getNotifications(userId: string) {
    const notifications = await this.notificationRepository.findByUserId(
      userId
    );
    const stats = await this.notificationRepository.getStats(userId);

    return {
      notifications,
      stats,
    };
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string) {
    // Verify notification belongs to user
    const notification = await this.notificationRepository.findByIdAndUserId(
      notificationId,
      userId
    );

    if (!notification) {
      throw new Error("Notification not found");
    }

    return this.notificationRepository.markAsRead(notificationId);
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string) {
    return this.notificationRepository.markAllAsRead(userId);
  }

  // Delete notification
  async deleteNotification(notificationId: string, userId: string) {
    // Verify notification belongs to user
    const notification = await this.notificationRepository.findByIdAndUserId(
      notificationId,
      userId
    );

    if (!notification) {
      throw new Error("Notification not found");
    }

    return this.notificationRepository.delete(notificationId);
  }

  // Get unread count
  async getUnreadCount(userId: string) {
    return this.notificationRepository.countUnread(userId);
  }
}
