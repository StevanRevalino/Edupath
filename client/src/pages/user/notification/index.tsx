import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  X,
  MessageCircle,
  Calendar,
  AlertCircle,
  Trash2,
  CheckCheck,
  Video,
  Award,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { NOTIFICATION_EVENTS } from "../../../utils/notificationEvents";
import axios from "axios";
import TokenManager from "../../../utils/tokenManager";

const API_URL = import.meta.env.VITE_API_URL;

export interface Notification {
  notification_id: string;
  type:
    | "CONSULTATION_NEW"
    | "CONSULTATION_CANCEL"
    | "CONSULTATION_STARTING"
    | "CHAT_MESSAGE"
    | "BEASISWA_NEW";
  title: string;
  message: string;
  reference_id: string;
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
  consultation_starting: number;
  chat_message: number;
  beasiswa_new: number;
}

interface NotificationPanelProps {
  onNotificationClick?: (referenceId: string, type: string) => void;
}

const NotificationPanel = ({ onNotificationClick }: NotificationPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    consultation_new: 0,
    consultation_cancel: 0,
    consultation_starting: 0,
    chat_message: 0,
    beasiswa_new: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const token = TokenManager.getToken();
      const response = await axios.get(`${API_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data) {
        setNotifications(response.data.data || []);
        setStats(
          response.data.stats || {
            total: 0,
            unread: 0,
            consultation_new: 0,
            consultation_cancel: 0,
            consultation_starting: 0,
            chat_message: 0,
            beasiswa_new: 0,
          }
        );
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      const token = TokenManager.getToken();
      await axios.patch(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      await fetchNotifications();
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = TokenManager.getToken();
      await axios.patch(
        `${API_URL}/api/notifications/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      await fetchNotifications();
      return true;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = TokenManager.getToken();
      await axios.delete(`${API_URL}/api/notifications/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      await fetchNotifications();
      return true;
    } catch (error) {
      console.error("Error deleting notification:", error);
      return false;
    }
  };

  const deleteAllNotifications = async () => {
    try {
      const token = TokenManager.getToken();
      await axios.delete(`${API_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      await fetchNotifications();
      return true;
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      return false;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);

    // Listen for beasiswa update events
    const handleBeasiswaUpdate = () => {
      fetchNotifications();
    };

    window.addEventListener(
      NOTIFICATION_EVENTS.BEASISWA_UPDATED,
      handleBeasiswaUpdate
    );

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        NOTIFICATION_EVENTS.BEASISWA_UPDATED,
        handleBeasiswaUpdate
      );
    };
  }, [fetchNotifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "CONSULTATION_ACCEPTED":
        return <Calendar className="w-5 h-5 text-green-500" />;
      case "CONSULTATION_REJECTED":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "CONSULTATION_STARTING":
        return <Bell className="w-5 h-5 text-orange-500 animate-pulse" />;
      case "CHAT_MESSAGE":
        return <MessageCircle className="w-5 h-5 text-primary" />;
      case "ZOOM_MEETING":
        return <Video className="w-5 h-5 text-purple-500" />;
      case "BEASISWA_NEW":
        return <Award className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationBgColor = (type: string, isRead: boolean) => {
    if (isRead) return "bg-white";

    switch (type) {
      case "CONSULTATION_ACCEPTED":
        return "bg-green-50";
      case "CONSULTATION_REJECTED":
        return "bg-red-50";
      case "CONSULTATION_STARTING":
        return "bg-orange-50";
      case "CHAT_MESSAGE":
        return "bg-secondary-lighter";
      case "ZOOM_MEETING":
        return "bg-purple-50";
      case "BEASISWA_NEW":
        return "bg-yellow-50";
      default:
        return "bg-gray-50";
    }
  };

  const handleNotificationClick = async (
    notificationId: string,
    referenceId: string,
    type: string,
    isRead: boolean
  ) => {
    if (!isRead) {
      await markAsRead(notificationId);
    }

    if (onNotificationClick) {
      onNotificationClick(referenceId, type);
    }

    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const handleDeleteAll = async () => {
    if (notifications.length === 0) return;

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus semua ${notifications.length} notifikasi?`
    );

    if (confirmed) {
      await deleteAllNotifications();
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-secondary-lighter transition-colors"
        title="Notifikasi"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {stats.unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {stats.unread > 99 ? "99+" : stats.unread}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notifikasi
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white rounded transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Stats */}
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 bg-white text-primary-dark rounded-full font-semibold">
                  Total: {stats.total}
                </span>
                <span className="px-2 py-1 bg-red-500 text-white rounded-full font-semibold">
                  Belum Dibaca: {stats.unread}
                </span>
              </div>

              {/* Mark All as Read Button */}
              {stats.unread > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="mt-2 w-full px-3 py-2 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary-light transition-colors flex items-center justify-center gap-1 shadow-sm"
                >
                  <CheckCheck className="w-4 h-4" />
                  Tandai Semua Dibaca
                </button>
              )}

              {/* Delete All Button */}
              {stats.total > 0 && (
                <button
                  onClick={handleDeleteAll}
                  className="mt-2 w-full px-3 py-2 text-xs font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-1 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus Semua Notifikasi
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto flex-1">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-sm">Memuat notifikasi...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium">Tidak ada notifikasi</p>
                  <p className="text-xs mt-1">Notifikasi akan muncul di sini</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.notification_id}
                      onClick={() =>
                        handleNotificationClick(
                          notification.notification_id,
                          notification.reference_id,
                          notification.type,
                          notification.is_read
                        )
                      }
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${getNotificationBgColor(
                        notification.type,
                        notification.is_read
                      )}`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-sm font-semibold ${
                                notification.is_read
                                  ? "text-gray-700"
                                  : "text-gray-900"
                              }`}
                            >
                              {notification.title}
                            </p>
                            <button
                              onClick={(e) =>
                                handleDelete(e, notification.notification_id)
                              }
                              className="flex-shrink-0 p-1 hover:bg-red-100 rounded transition-colors"
                              title="Hapus notifikasi"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </button>
                          </div>
                          <p
                            className={`text-xs mt-1 ${
                              notification.is_read
                                ? "text-gray-500"
                                : "text-gray-700"
                            }`}
                          >
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDistanceToNow(
                              new Date(notification.created_at),
                              {
                                addSuffix: true,
                                locale: id,
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationPanel;
