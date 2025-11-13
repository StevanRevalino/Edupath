import { useMemo, useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Menu, X, LayoutDashboard } from "lucide-react";
import Swal from "sweetalert2";
import questionIcon from "../assets/question-logo.png";
import { useNotificationCount } from "../hooks/useNotificationCount";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminSidebar: FC<AdminSidebarProps> = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { counts, clearBadge } = useNotificationCount();

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
        icon: "/src/assets/icons/admin-dashboard.png",
        badgeCount: 0,
      },
      {
        id: "kelola-data-murid",
        label: "Kelola Data Murid",
        icon: "/src/assets/icons/kelola-data-murid.png",
        badgeCount: 0,
      },
      {
        id: "kelola-data-konseling",
        label: "Kelola Data Konseling",
        icon: "/src/assets/icons/kelola-data-konseling.png",
        badgeCount: counts.pendingConsultations,
      },
      {
        id: "kelola-live-chat",
        label: "Chat Murid",
        icon: "/src/assets/icons/kelola-chat-murid.png",
        badgeCount: counts.unreadChats,
      },
      {
        id: "kelola-data-beasiswa",
        label: "Kelola Data Beasiswa",
        icon: "/src/assets/icons/kelola-data-beasiswa.png",
        badgeCount: 0,
      },
    ],
    [counts]
  );

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:flex bg-primary text-white w-64 min-h-screen flex-col rounded-br-2xl rounded-tr-2xl">
        <div className="p-4 flex-1">
          {/* Logo Section */}
          <div className="flex items-center justify-center mb-2">
            <img
              src="/src/assets/edupath-logo.png"
              alt="EduPath Logo"
              className="w-[110px] h-[95px]"
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
                    className={`w-full flex items-center px-4 py-3 text-left cursor-pointer rounded-lg transition-colors duration-200 hover:bg-primary-lighter ${
                      activeTab === item.id
                        ? "bg-primary-lighter"
                        : "bg-transparent"
                    }`}
                  >
                    <img
                      src={item.icon}
                      alt={`${item.label} Icon`}
                      className="w-12 h-14 mr-3"
                    />
                    <span className="font-medium flex-1">{item.label}</span>
                    {/* Tompel merah kecil - muncul jika ada notifikasi */}
                    {item.badgeCount > 0 && (
                      <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Logout Button - Fixed at bottom */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full p-4 cursor-pointer rounded-lg hover:bg-primary-lighter transition-colors duration-200"
          >
            <img
              src="/src/assets/icons/log-out.png"
              alt="Logout Icon"
              className="w-full h-15"
            />
          </button>
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
                  src="/src/assets/edupath-logo.png"
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
              <div className="mt-4 pt-4 border-t border-[#4BB8FF]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 cursor-pointer rounded-lg hover:bg-[#4BB8FF] transition-colors duration-200"
                >
                  <img
                    src="/src/assets/icons/log-out.png"
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
