import { useMemo, useState, useEffect, type FC } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Menu, X, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Swal from "sweetalert2";
import questionIcon from "../assets/question-logo.png";
import axios from "axios";
import TokenManager from "../utils/tokenManager";
import { NOTIFICATION_EVENTS } from "../utils/notificationEvents";

// Import all admin icons
import edupathLogo from "../assets/edupath-logo.png";
import adminDashboardIcon from "../assets/icons/admin-dashboard.png";
import kelolaDataMuridIcon from "../assets/icons/kelola-data-murid.png";
import kelolaDataKonselingIcon from "../assets/icons/kelola-data-konseling.png";
import kelolaChatMuridIcon from "../assets/icons/kelola-chat-murid.png";
import kelolaDataBeasiswaIcon from "../assets/icons/kelola-data-beasiswa.png";
import logOutIcon from "../assets/icons/log-out.png";
import logOutSmallIcon from "../assets/icons/logout-small-icon.png";

const API_URL = import.meta.env.VITE_API_URL;

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface NotificationCount {
  pendingConsultations: number;
  unreadChats: number;
}

const AdminSidebar: FC<AdminSidebarProps> = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [counts, setCounts] = useState<NotificationCount>({
    pendingConsultations: 0,
    unreadChats: 0,
  });

  const fetchCounts = async () => {
    try {
      // Fetch pending consultations
      const token = TokenManager.getToken();
      const consultationsResponse = await axios.get(
        `${API_URL}/api/consultations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (
        consultationsResponse.data.success &&
        consultationsResponse.data.data
      ) {
        const pendingCount = consultationsResponse.data.data.filter(
          (c: any) => c.status === "PENDING",
        ).length;

        setCounts((prev) => ({
          ...prev,
          pendingConsultations: pendingCount,
        }));
      }

      // Fetch unread chat notifications
      try {
        const token = TokenManager.getToken();
        const notificationsResponse = await axios.get(
          `${API_URL}/api/notifications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (notificationsResponse.data) {
          const unreadChatNotifications = (
            notificationsResponse.data.data || []
          ).filter((n: any) => n.type === "CHAT_MESSAGE" && !n.is_read).length;

          setCounts((prev) => ({
            ...prev,
            unreadChats: unreadChatNotifications,
          }));
        }
      } catch (chatError) {
        console.log("Chat notifications not available yet");
        setCounts((prev) => ({
          ...prev,
          unreadChats: 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching notification counts:", error);
    }
  };

  const clearBadge = (menuId: string) => {
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

    // Refresh counts every 15 seconds
    const interval = setInterval(fetchCounts, 15000);

    // Listen for custom events
    const handleConsultationUpdate = () => fetchCounts();
    const handleChatUpdate = () => fetchCounts();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchCounts();
      }
    };

    window.addEventListener(
      NOTIFICATION_EVENTS.CONSULTATION_UPDATED,
      handleConsultationUpdate,
    );
    if (NOTIFICATION_EVENTS.CHAT_UPDATED) {
      window.addEventListener(
        NOTIFICATION_EVENTS.CHAT_UPDATED,
        handleChatUpdate,
      );
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", fetchCounts);

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        NOTIFICATION_EVENTS.CONSULTATION_UPDATED,
        handleConsultationUpdate,
      );
      if (NOTIFICATION_EVENTS.CHAT_UPDATED) {
        window.removeEventListener(
          NOTIFICATION_EVENTS.CHAT_UPDATED,
          handleChatUpdate,
        );
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", fetchCounts);
    };
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "Yakin ingin logout?",
      imageUrl: questionIcon,
      imageWidth: 80,
      imageHeight: 90,
      showCancelButton: true,
      confirmButtonColor: "var(--primary)",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        // Hapus token dari localStorage
        localStorage.removeItem("token_data");
        localStorage.removeItem("role");
        localStorage.removeItem("user_id");

        toast.success("Berhasil logout");
        navigate("/login");
      }
    });
  };

  const handleMenuItemClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    clearBadge(tabId); // Clear badge when menu is clicked
  };
  const menuItems = useMemo(
    () => [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: adminDashboardIcon,
        badgeCount: 0,
      },
      {
        id: "kelola-data-murid",
        label: "Kelola Data Murid",
        icon: kelolaDataMuridIcon,
        badgeCount: 0,
      },
      {
        id: "kelola-data-konseling",
        label: "Kelola Data Konseling",
        icon: kelolaDataKonselingIcon,
        badgeCount: counts.pendingConsultations,
      },
      {
        id: "kelola-live-chat",
        label: "Chat Murid",
        icon: kelolaChatMuridIcon,
        badgeCount: counts.unreadChats,
      },
      {
        id: "kelola-data-beasiswa",
        label: "Kelola Data Beasiswa",
        icon: kelolaDataBeasiswaIcon,
        badgeCount: 0,
      },
    ],
    [counts],
  );

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <div
        className={`hidden lg:block transition-all duration-300 ${
          isCollapsed ? "w-24" : "w-64"
        }`}
      >
        <div className="sticky top-0 h-screen bg-primary dark:bg-blue-900/40 text-white flex flex-col rounded-br-2xl rounded-tr-2xl">
          {/* Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-4 top-6 z-10 w-8 h-8 bg-white dark:bg-gray-800 text-primary dark:text-blue-400 rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            title={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen size={20} />
            ) : (
              <PanelLeftClose size={20} />
            )}
          </button>

          <div className="p-4 flex-1">
            {/* Logo Section */}
            <div className="flex items-center justify-center mb-2">
              <img
                src={edupathLogo}
                alt="EduPath Logo"
                className={`transition-all duration-300 ${
                  isCollapsed ? "w-[60px] h-[52px]" : "w-[110px] h-[95px]"
                }`}
              />
            </div>

            {/* Navigation Menu */}
            <nav>
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        clearBadge(item.id);
                      }}
                      className={`w-full flex items-center ${
                        isCollapsed ? "justify-center px-2" : "px-4"
                      } py-3 text-left cursor-pointer rounded-lg transition-all duration-200 hover:bg-primary-hoverer ${
                        activeTab === item.id
                          ? "bg-primary-hoverer"
                          : "bg-transparent"
                      } relative group`}
                      title={isCollapsed ? item.label : ""}
                    >
                      <div className="relative">
                        <img
                          src={item.icon}
                          alt={`${item.label} Icon`}
                          className={`transition-all duration-300 ${
                            isCollapsed ? "w-8 h-9" : "w-12 h-14 mr-3"
                          }`}
                        />
                        {/* Tompel merah kecil - hanya muncul saat collapsed */}
                        {item.badgeCount > 0 && isCollapsed && (
                          <span className="absolute w-2 h-2 -top-1 -right-1 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                      </div>
                      {!isCollapsed && (
                        <>
                          <span className="font-medium flex-1">
                            {item.label}
                          </span>
                          {item.badgeCount > 0 && (
                            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                          )}
                        </>
                      )}

                      {/* Tooltip on hover when collapsed */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                          {item.label}
                          {item.badgeCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                              {item.badgeCount}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Logout Button - Fixed at bottom */}
          <div className="p-4">
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center px-2 py-3" : "justify-center p-4"
              } cursor-pointer rounded-lg hover:bg-primary-hoverer transition-colors duration-200 relative group`}
              title={isCollapsed ? "Logout" : ""}
            >
              <img
                src={isCollapsed ? logOutSmallIcon : logOutIcon}
                alt="Logout Icon"
                className={`transition-all duration-300 object-contain ${
                  isCollapsed ? "w-8 h-8" : "w-40 h-12"
                }`}
              />

              {/* Tooltip on hover when collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 bottom-4">
                  Logout
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Floating Menu Button - Hidden on desktop */}
      <div className="lg:hidden">
        {/* Floating Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#4BB8FF] transition-colors duration-200"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu */}
            <div className="fixed bottom-24 right-6 z-50 bg-primary text-white rounded-2xl shadow-xl p-4 min-w-[280px]">
              {/* Logo Section */}
              <div className="flex items-center justify-center mb-4">
                <img
                  src={edupathLogo}
                  alt="EduPath Logo"
                  className="w-[80px] h-[68px]"
                />
              </div>

              {/* Navigation Menu */}
              <nav>
                <ul className="space-y-2">
                  {menuItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => handleMenuItemClick(item.id)}
                        className={`w-full flex items-center px-3 py-2 text-left cursor-pointer rounded-lg transition-colors duration-200 hover:bg-[#4BB8FF] ${
                          activeTab === item.id
                            ? "bg-[#4BB8FF]"
                            : "bg-transparent"
                        }`}
                      >
                        <img
                          src={item.icon}
                          alt={`${item.label} Icon`}
                          className="w-8 h-9 mr-3"
                        />
                        <span className="font-medium text-sm flex-1">
                          {item.label}
                        </span>
                        {/* Tompel merah kecil - muncul jika ada notifikasi */}
                        {item.badgeCount > 0 && (
                          <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Logout Button */}
              <div className="mt-4 pt-4 border-t border-[#4BB8FF] space-y-2">
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 cursor-pointer rounded-lg hover:bg-[#4BB8FF] transition-colors duration-200"
                >
                  <img
                    src={logOutIcon}
                    alt="Logout Icon"
                    className="w-48 mx-auto"
                  />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AdminSidebar;
