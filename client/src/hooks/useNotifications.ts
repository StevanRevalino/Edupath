import { useState, useEffect, useCallback } from "react";
import {
  notificationHandler,
  type Notification,
  type NotificationStats,
} from "../handler/notificationHandler";

interface UseNotificationsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const { autoRefresh = true, refreshInterval = 10000 } = options; // Default 10 detik

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    consultation_new: 0,
    consultation_cancel: 0,
    consultation_starting: 0,
    chat_message: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await notificationHandler.getNotifications();
      if (response.success) {
        setNotifications(response.data);
        setStats(response.stats);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = async (notificationId: string) => {
    const success = await notificationHandler.markAsRead(notificationId);
    if (success) {
      await fetchNotifications();
    }
    return success;
  };

  const markAllAsRead = async () => {
    const success = await notificationHandler.markAllAsRead();
    if (success) {
      await fetchNotifications();
    }
    return success;
  };

  const deleteNotification = async (notificationId: string) => {
    const success = await notificationHandler.deleteNotification(
      notificationId
    );
    if (success) {
      await fetchNotifications();
    }
    return success;
  };

  const deleteAllNotifications = async () => {
    const success = await notificationHandler.deleteAllNotifications();
    if (success) {
      await fetchNotifications();
    }
    return success;
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchNotifications]);

  return {
    notifications,
    stats,
    loading,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  };
};
