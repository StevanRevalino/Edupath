import { LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface SidebarProfilProps {
  onLogout: () => void;
  mainSectionHeight?: number;
}

export default function SidebarProfil({
  onLogout,
  mainSectionHeight = 600,
}: SidebarProfilProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div
      className="w-[500px] p-6 relative flex flex-col"
      style={{ minHeight: `${mainSectionHeight}px` }}
    >
      {/* Menu Title & Top Buttons - Absolute position with high z-index */}
      <div className="absolute -top-6 left-6 z-10 space-y-4">
        <h2 className="text-white text-2xl font-bold mb-4 drop-shadow-lg">
          Menu
        </h2>
        <button
          className={`min-w-full text-left border-3 rounded-full px-6 py-2.5 font-medium shadow-lg cursor-pointer transition-all ${
            isActive("/profil")
              ? "bg-white border-[#00437A] text-[#00437A]"
              : "bg-white/90 border-white text-[#00437A] hover:bg-white"
          }`}
          onClick={() => navigate("/profil")}
        >
          Profil saya
        </button>
        <button
          className={`w-full text-left border-3 rounded-full px-6 py-2.5 font-medium shadow-lg cursor-pointer transition-all ${
            isActive("/about-us")
              ? "bg-white border-[#00437A] text-[#00437A]"
              : "bg-white/90 border-white text-[#00437A] hover:bg-white"
          }`}
          onClick={() => navigate("/about-us")}
        >
          Tentang kami
        </button>
      </div>

      {/* Bottom buttons - Positioned at bottom of main section */}
      <div className="absolute left-6 space-y-3" style={{ bottom: "24px" }}>
        <button
          className={`w-full text-left border-3 rounded-full px-6 py-2.5 font-medium shadow-lg cursor-pointer transition-all ${
            isActive("/contact-us")
              ? "bg-white border-[#00437A] text-[#00437A]"
              : "bg-white/90 border-white text-[#00437A] hover:bg-white"
          }`}
          onClick={() => navigate("/contact-us")}
        >
          Hubungi kami
        </button>
        <button
          onClick={onLogout}
          className="w-fullborder-3 border-white bg-white/90 rounded-full px-6 py-2.5 text-[#00437A] font-medium shadow-lg flex items-center gap-2 cursor-pointer hover:bg-white transition-all"
        >
          <LogOut size={16} />
          Keluar
        </button>
      </div>
    </div>
  );
}
