import { useMemo, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthData } from "../utils/authUtils";
import toast from "react-hot-toast";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminSidebar: FC<AdminSidebarProps> = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      // Clear authentication data
      clearAuthData();

      // Show success message
      toast.success("Berhasil logout");

      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Terjadi kesalahan saat logout");
    }
  };
  const menuItems = useMemo(
    () => [
      {
        id: "kelola-data-murid",
        label: "Kelola Data Murid",
        icon: "/src/assets/icons/kelola-data-murid.png",
      },
      {
        id: "kelola-data-konseling",
        label: "Kelola Data Konseling",
        icon: "/src/assets/icons/kelola-data-konseling.png",
      },
    ],
    []
  );

  return (
    <div className="bg-[#6CCBFF] text-white w-64 min-h-screen flex flex-col rounded-br-2xl rounded-tr-2xl">
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
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-left cursor-pointer rounded-lg transition-colors duration-200 hover:bg-[#4BB8FF] ${
                    activeTab === item.id ? "bg-[#4BB8FF]" : "bg-transparent"
                  }`}
                >
                  <img
                    src={item.icon}
                    alt={`${item.label} Icon`}
                    className="w-12 h-12 mr-3"
                  />
                  <span className="font-medium">{item.label}</span>
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
          className="w-full p-4 cursor-pointer rounded-lg hover:bg-[#4BB8FF] transition-colors duration-200"
        >
          <img
            src="/src/assets/icons/log-out.png"
            alt="Logout Icon"
            className="w-full h-15"
          />
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
