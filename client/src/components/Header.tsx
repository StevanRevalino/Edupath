import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import logo from "../assets/edupath-logo.png";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const menuItems = [
    { label: "Home", path: "home" },
    { label: "Tes", path: "tes" },
    { label: "Jurusan", path: "jurusan" },
    { label: "Universitas", path: "universitas" },
    { label: "Konseling", path: "konseling" },
    { label: "Profil", path: "profil" },
  ];

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-[#6CCBFF] flex items-center justify-between px-8 md:px-12 z-10 h-16 md:h-20 lg:h-22 md:rounded-b-3xl shadow-lg">
        {/* Logo */}
        <div
          className="flex items-center space-x-4 cursor-pointer"
          onClick={() => navigate("home")}
        >
          <img
            src={logo}
            alt="Edupath Logo"
            className="h-12 md:h-16 xl:h-20 w-auto mb-4"
          />
        </div>

        {/* Menu Desktop */}
        <nav className="hidden md:flex flex-1 justify-center space-x-8 md:space-x-8 lg:space-x-16 xl:space-x-24 text-white text-lg md:text-xl xl:text-2xl">
          {menuItems
            .filter((item) => item.label !== "Profil")
            .map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`cursor-pointer transition ${
                  location.pathname === item.path ? "font-bold" : ""
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
          ref={hamburgerRef}
          className="md:hidden text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={36} /> : <Menu size={36} />}
        </button>
      </header>

      {/* Dropdown Menu Mobile */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="fixed top-16 left-0 w-full bg-[#6CCBFF] flex flex-col items-center z-10 md:hidden text-lg font-semibold"
        >
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setMenuOpen(false);
              }}
              className={`py-2 border-t w-full text-center text-white ${
                location.pathname === item.path ? "font-bold bg-[#5AB6E8]" : ""
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default Header;
