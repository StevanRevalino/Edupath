import type { FC } from "react";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminSidebar: FC<AdminSidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    {
      id: "kelola-data-murid",
      label: "Kelola Data Murid",
      icon: "👥",
    },
    {
      id: "kelola-data-konseling",
      label: "Kelola Data Konseling",
      icon: "💬",
    },
  ];

  return (
    <div className="bg-blue-500 text-white w-64 min-h-screen p-4">
      {/* Logo Section */}
      <div className="flex items-center mb-8">
        <img
          src="/src/assets/edupath-logo.png"
          alt="EduPath Logo"
          className="w-10 h-10 mr-3"
        />
        <h2 className="text-xl font-bold">EduPath Admin</h2>
      </div>

      {/* Navigation Menu */}
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 hover:bg-blue-600 ${
                  activeTab === item.id
                    ? "bg-blue-600 border-l-4 border-white"
                    : "bg-transparent"
                }`}
              >
                <span className="text-xl mr-3">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-4 w-56">
        <button className="w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 hover:bg-blue-600 border-t border-blue-400 pt-4">
          <span className="text-xl mr-3">🚪</span>
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
