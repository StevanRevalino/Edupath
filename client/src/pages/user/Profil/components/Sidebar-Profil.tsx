import { LogOut, Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isActive = (path: string) => location.pathname === path;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Close menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { label: "Profil saya", path: "/profil" },
    { label: "Tentang kami", path: "/about-us" },
    { label: "Hubungi kami", path: "/contact-us" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className="hidden lg:flex w-[400px] p-6 relative flex-col"
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
                ? "bg-white border-primary-dark text-primary-dark"
                : "bg-white/90 border-white text-primary-dark hover:bg-white"
            }`}
            onClick={() => navigate("/profil")}
          >
            Profil saya
          </button>
          <button
            className={`w-full text-left border-3 rounded-full px-6 py-2.5 font-medium shadow-lg cursor-pointer transition-all ${
              isActive("/about-us")
                ? "bg-white border-primary-dark text-primary-dark"
                : "bg-white/90 border-white text-primary-dark hover:bg-white"
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
                ? "bg-white border-primary-dark text-primary-dark"
                : "bg-white/90 border-white text-primary-dark hover:bg-white"
            }`}
            onClick={() => navigate("/contact-us")}
          >
            Hubungi kami
          </button>
          <button
            onClick={onLogout}
            className="w-full border-3 border-white bg-white/90 rounded-full px-6 py-2.5 text-primary-dark font-medium shadow-lg flex items-center gap-2 cursor-pointer hover:bg-white transition-all"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </div>

      {/* Mobile Hamburger Menu Button */}
      <button
        ref={buttonRef}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-24 left-4 z-50 bg-primary-dark text-white p-3 rounded-full shadow-lg hover:bg-primary-hover transition-colors"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div
          ref={menuRef}
          className="lg:hidden fixed top-40 left-4 right-4 bg-white rounded-2xl shadow-2xl z-40 p-4 space-y-3 border-2 border-primary-dark"
        >
          <h2 className="text-primary-dark text-xl font-bold mb-2 px-2">
            Menu
          </h2>

          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`w-full text-left border-2 rounded-full px-6 py-2.5 font-medium shadow-md cursor-pointer transition-all ${
                isActive(item.path)
                  ? "bg-primary-dark border-primary-dark text-white"
                  : "bg-white border-primary-dark text-primary-dark hover:bg-primary-dark/10"
              }`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}

          <button
            onClick={onLogout}
            className="w-full border-2 border-red-500 bg-white rounded-full px-6 py-2.5 text-red-500 font-medium shadow-md flex items-center justify-center gap-2 cursor-pointer hover:bg-red-50 transition-all"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      )}
    </>
  );
}
