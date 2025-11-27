import axios from "axios";
import TokenManager from "../utils/tokenManager";

const API_URL = import.meta.env.VITE_API_URL;

export interface Notification {
  notification_id: string;
  type: "CONSULTATION_NEW" | "CONSULTATION_CANCEL" | "CHAT_MESSAGE";
  title: string;
  message: string;
  reference_id: string; // consultation_id or chat_id
  is_read: boolean;
  created_at: string;
  metadata?: {
    student_name?: string;
    topic?: string;
    status?: string;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  consultation_new: number;
  consultation_cancel: number;
  chat_message: number;
}

class NotificationHandler {
  private getAuthHeader() {
    const token = TokenManager.getToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  }

  // Get all notifications
  async getNotifications(): Promise<{
    success: boolean;
    data: Notification[];
    stats: NotificationStats;
  }> {
    try {
      const response = await axios.get(
        `${API_URL}/api/notifications`,
        this.getAuthHeader()
      );
      return {
        success: true,
        data: response.data.data || [],
        stats: response.data.stats || {
          total: 0,
          unread: 0,
          consultation_new: 0,
          consultation_cancel: 0,
          chat_message: 0,
        },
      };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return {
        success: false,
        data: [],
        stats: {
          total: 0,
          unread: 0,
          consultation_new: 0,
          consultation_cancel: 0,
          chat_message: 0,
        },
      };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      await axios.patch(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {},
        this.getAuthHeader()
      );
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<boolean> {
    try {
      await axios.patch(
        `${API_URL}/api/notifications/read-all`,
        {},
        this.getAuthHeader()
      );
      return true;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      await axios.delete(
        `${API_URL}/api/notifications/${notificationId}`,
        this.getAuthHeader()
      );
      return true;
    } catch (error) {
      console.error("Error deleting notification:", error);
      return false;
    }
  }
}

export const notificationHandler = new NotificationHandler();
