import { useState, useEffect } from "react";
import axios from "axios";
import TokenManager from "../utils/tokenManager";
import { NOTIFICATION_EVENTS } from "../utils/notificationEvents";

interface NotificationCount {
  pendingConsultations: number;
  unreadChats: number;
}

export const useNotificationCount = () => {
  const [counts, setCounts] = useState<NotificationCount>({
    pendingConsultations: 0,
    unreadChats: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchCounts = async () => {
    try {
      const token = TokenManager.getToken();
      const API_URL = import.meta.env.VITE_API_URL;

      // Fetch pending consultations count
      const consultationsResponse = await axios.get(
        `${API_URL}/api/consultations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (consultationsResponse.data.success) {
        const consultations = consultationsResponse.data.data || [];
        const pendingCount = consultations.filter(
          (c: any) => c.status === "PENDING"
        ).length;

        setCounts((prev) => ({
          ...prev,
          pendingConsultations: pendingCount,
        }));
      }

      // TODO: Fetch unread chats count when chat feature is ready
      // For now, set to 0
      setCounts((prev) => ({
        ...prev,
        unreadChats: 0,
      }));
    } catch (error) {
      console.error("Error fetching notification counts:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearBadge = (menuId: string) => {
    // Clear badge when user clicks on the menu
    if (menuId === "kelola-data-konseling") {
      setCounts((prev) => ({
        ...prev,
        pendingConsultations: 0,
      }));
    } else if (menuId === "kelola-live-chat") {
      setCounts((prev) => ({
        ...prev,
        unreadChats: 0,
      }));
    }
  };

  useEffect(() => {
    fetchCounts();

    // Refresh counts every 30 seconds
    const interval = setInterval(fetchCounts, 30000);

    // Listen for custom events to refresh immediately
    const handleConsultationUpdate = () => {
      fetchCounts();
    };

    window.addEventListener(
      NOTIFICATION_EVENTS.CONSULTATION_UPDATED,
      handleConsultationUpdate
    );

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        NOTIFICATION_EVENTS.CONSULTATION_UPDATED,
        handleConsultationUpdate
      );
    };
  }, []);

  return { counts, loading, refreshCounts: fetchCounts, clearBadge };
};
