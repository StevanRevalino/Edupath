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
    { label: "Profil", path: "/profil" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 text-lg"> {/* text diperbesar */}
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-[#6CCBFF] flex items-center justify-between px-8 md:px-12 z-10 h-24 rounded-b-3xl shadow-lg">
        {/* Logo */}
        <div
          className="flex items-center space-x-4 cursor-pointer"
          onClick={() => navigate("/home")}
        >
          <img src={logo} alt="Edupath Logo" className="h-20 w-auto mb-4" />
        </div>

        {/* Menu Desktop */}
        <nav className="hidden md:flex flex-1 justify-center space-x-24 text-white text-2xl">
          {menuItems
            .filter((item) => item.label !== "Profil")
            .map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`cursor-pointer transition ${
                  location.pathname === item.path
                    ? "font-bold"
                    : ""
                }`}
              >
                {item.label}
              </button>
            ))}
        </nav>

        {/* Profil untuk Desktop */}
        <div
          className="hidden md:flex flex-col items-center text-white cursor-pointer"
          onClick={() => navigate("/profil")}
        >
          <div className="w-12 h-12 bg-white rounded-full mb-1"></div>
          <span className="text-sm">Profil</span>
        </div>

        {/* Hamburger Menu untuk Mobile */}
        <button
          className="md:hidden text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={36} /> : <Menu size={36} />}
        </button>
      </header>

      {/* Dropdown Menu Mobile */}
      {menuOpen && (
        <div className="fixed top-24 left-0 w-full bg-sky-500 flex flex-col items-center py-6 z-10 md:hidden text-xl">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setMenuOpen(false);
              }}
              className={`py-4 w-full text-center text-white ${
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
