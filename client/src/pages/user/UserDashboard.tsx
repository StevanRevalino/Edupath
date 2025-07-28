import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "../../assets/edupath-logo.png";

const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { label: "Home", path: "/home" },
    { label: "Tes", path: "/tes" },
    { label: "Jurusan", path: "/jurusan" },
    { label: "Universitas", path: "/universitas" },
    { label: "Konseling", path: "/konseling" },
    { label: "Profil", path: "/profil" }, // sekarang profil jadi menu
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-[#6CCBFF] flex items-center justify-between px-4 md:px-6 z-10 h-16">
        {/* Logo */}
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate("/home")}
        >
          <img src={logo} alt="Edupath Logo" className="h-14 w-auto mb-3" />
        </div>

        {/* Menu Desktop */}
        <nav className="hidden md:flex flex-1 justify-center space-x-6 text-white">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`cursor-pointer ${
                location.pathname === item.path ? "font-bold" : ""
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Profil untuk Desktop */}
        <div className="hidden md:flex flex-col items-center text-white cursor-pointer">
          <div className="w-8 h-8 bg-white rounded-full"></div>
          <span className="text-xs">Profil</span>
        </div>

        {/* Hamburger Menu untuk Mobile */}
        <button
          className="md:hidden text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      {/* Dropdown Menu Mobile */}
      {menuOpen && (
        <div className="fixed top-16 left-0 w-full bg-sky-500 flex flex-col items-center py-4 z-10 md:hidden">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setMenuOpen(false);
              }}
              className={`py-2 w-full text-center text-white ${
                location.pathname === item.path ? "font-bold bg-[#5AB6E8]" : ""
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Konten */}
      <main className="">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
