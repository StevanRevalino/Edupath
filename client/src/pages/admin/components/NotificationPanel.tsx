import { useState } from "react";
import {
  Bell,
  X,
  MessageCircle,
  Calendar,
  AlertCircle,
  Trash2,
  CheckCheck,
} from "lucide-react";
import { useNotifications } from "../../../hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface NotificationPanelProps {
  onNotificationClick?: (referenceId: string, type: string) => void;
}

const NotificationPanel = ({ onNotificationClick }: NotificationPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    stats,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications({
    autoRefresh: false, // Nonaktifkan auto-refresh sampai backend siap
    refreshInterval: 10000, // 10 detik
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "CONSULTATION_NEW":
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case "CONSULTATION_CANCEL":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "CHAT_MESSAGE":
        return <MessageCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationBgColor = (type: string, isRead: boolean) => {
    if (isRead) return "bg-white";

    switch (type) {
      case "CONSULTATION_NEW":
        return "bg-blue-50";
      case "CONSULTATION_CANCEL":
        return "bg-red-50";
      case "CHAT_MESSAGE":
        return "bg-green-50";
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

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {stats.unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
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
          <div className="absolute left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-800">Notifikasi</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Stats */}
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  Total: {stats.total}
                </span>
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full">
                  Belum Dibaca: {stats.unread}
                </span>
              </div>

              {/* Mark All as Read Button */}
              {stats.unread > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="mt-2 w-full px-3 py-1.5 text-xs font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                >
                  <CheckCheck className="w-4 h-4" />
                  Tandai Semua Dibaca
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
                  <p className="text-sm">Tidak ada notifikasi</p>
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
                          {notification.metadata?.student_name && (
                            <p className="text-xs text-gray-500 mt-1">
                              Dari: {notification.metadata.student_name}
                            </p>
                          )}
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
