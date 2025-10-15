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

      // Fetch unread chats count
      try {
        const chatsResponse = await axios.get(
          `${API_URL}/api/chat/unread-count`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (chatsResponse.data.success) {
          setCounts((prev) => ({
            ...prev,
            unreadChats: chatsResponse.data.data.unreadCount || 0,
          }));
        }
      } catch (chatError) {
        // If chat endpoint not ready, set to 0
        console.log("Chat unread count not available yet");
        setCounts((prev) => ({
          ...prev,
          unreadChats: 0,
        }));
      }
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

    // Refresh counts every 15 seconds (instead of 30)
    const interval = setInterval(fetchCounts, 15000);

    // Listen for custom events to refresh immediately
    const handleConsultationUpdate = () => {
      fetchCounts();
    };

    const handleChatUpdate = () => {
      fetchCounts();
    };

    // Listen for visibility change - refresh when user comes back to tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchCounts();
      }
    };

    window.addEventListener(
      NOTIFICATION_EVENTS.CONSULTATION_UPDATED,
      handleConsultationUpdate
    );
    
    // Add chat update listener if available
    if (NOTIFICATION_EVENTS.CHAT_UPDATED) {
      window.addEventListener(
        NOTIFICATION_EVENTS.CHAT_UPDATED,
        handleChatUpdate
      );
    }

    // Listen for tab visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Listen for window focus (when user switches back to this window)
    window.addEventListener("focus", fetchCounts);

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        NOTIFICATION_EVENTS.CONSULTATION_UPDATED,
        handleConsultationUpdate
      );
      if (NOTIFICATION_EVENTS.CHAT_UPDATED) {
        window.removeEventListener(
          NOTIFICATION_EVENTS.CHAT_UPDATED,
          handleChatUpdate
        );
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", fetchCounts);
    };
  }, []);

  return { counts, loading, refreshCounts: fetchCounts, clearBadge };
};
