import { useMemo, type FC } from "react";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminSidebar: FC<AdminSidebarProps> = ({ activeTab, setActiveTab }) => {
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
    <div className="bg-[#6CCBFF] text-white w-64 min-h-screen p-4 rounded-br-2xl rounded-tr-2xl">
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

      {/* Logout Button */}
      <div className="absolute bottom-4 w-56">
        <button className="w-full p-4 cursor-pointer">
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
