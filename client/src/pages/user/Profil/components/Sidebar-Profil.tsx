import React from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SidebarProfilProps {
  onLogout: () => void;
}

export default function SidebarProfil({ onLogout }: SidebarProfilProps) {
  const navigate = useNavigate();

  return (
    <div className="w-100 p-6 relative">
      <h2 className="text-white text-2xl font-bold mb-8">Menu</h2>
      <div className="space-y-4">
        <button
          className="w-full text-left border-2 border-[#00437A] bg-white rounded-full px-5 py-2 text-[#00437A] font-medium shadow-lg cursor-pointer hover:bg-gray-200"
          onClick={() => {
            navigate("/profil");
          }}
        >
          Profil saya
        </button>
        <button
          className="w-full text-left border-2 border-[#00437A] bg-white rounded-full px-5 py-2 text-[#00437A] font-medium shadow-lg cursor-pointer hover:bg-gray-200"
          onClick={() => {
            navigate("/about-us");
          }}
        >
          Tentang kami
        </button>
      </div>

      {/* Bottom buttons */}
      <div className="absolute bottom-6 left-6 space-y-3">
        <button
          className=" border-2 border-[#00437A] bg-white rounded-full px-5 py-2 text-[#00437A] font-medium shadow-l cursor-pointer hover:bg-gray-200"
          onClick={() => {
            navigate("/contact-us");
          }}
        >
          Hubungi kami
        </button>
        <button
          onClick={onLogout}
          className="border-2 border-[#00437A] bg-white rounded-full px-5 py-2 text-[#00437A] font-medium shadow-lg flex items-center gap-2 cursor-pointer hover:bg-gray-200"
        >
          <LogOut size={16} />
          Keluar
        </button>
      </div>
    </div>
  );
}
