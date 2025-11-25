import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import logo from "../assets/edupath-logo.png";
import TokenManager from "@/utils/tokenManager";
import { userService } from "../services/userService";
import NotificationPanel from "../pages/user/notification";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  // User data state
  const [user, setUser] = useState<{
    firstname: string;
    lastname: string;
  } | null>(null);

  const menuItems = [
    { label: "Home", path: "/home" },
    { label: "Tes", path: "/tes" },
    { label: "Jurusan", path: "/jurusan" },
    { label: "Universitas", path: "/universitas" },
    { label: "Konseling", path: "/konseling" },
    { label: "Beasiswa", path: "/beasiswa" },
    { label: "Profil", path: "/profil" },
  ];

  // Ambil 1 huruf pertama firstname + lastname (fallback: 2 huruf pertama firstname)
  const getInitials = (u: { firstname: string; lastname: string } | null) => {
    const f = (u?.firstname || "").trim();
    const l = (u?.lastname || "").trim();
    const a = f ? f[0] : "";
    const b = l ? l[0] : "";
    const initials = a + b || f.slice(0, 2) || "...";
    return initials.toUpperCase();
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!TokenManager.isAuthenticated()) {
          navigate("/login");
          return;
        }

        const { userId } = TokenManager.getUserData();
        if (!userId) return;

        const userData = await userService.getUserById(userId);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();

    // Listen for profile update event
    const handleProfileUpdate = () => {
      fetchUserData();
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, [navigate]);

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
      <header className="fixed top-0 left-0 w-full bg-primary flex items-center justify-between px-4 lg:px-12 z-10 h-16 md:h-20 lg:h-22 md:rounded-b-3xl shadow-lg">
        {/* Logo */}
        <div
          className="flex items-center space-x-4 cursor-pointer"
          onClick={() => navigate("/home")}
        >
          <img
            src={logo}
            alt="Edupath Logo"
            className="h-12 md:h-16 xl:h-20 w-auto"
          />
        </div>

        {/* Menu Desktop */}
        <nav className="hidden md:flex flex-1 justify-center sm:space-x-2 md:space-x-4 lg:space-x-8 xl:space-x-16 text-white text-lg md:text-lg xl:text-2xl">
          {menuItems
            .filter((item) => item.label !== "Profil")
            .map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`cursor-pointer transition ${
                    isActive ? "font-bold" : ""
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
        </nav>

        {/* Profil untuk Desktop */}
        <div className="hidden md:flex flex-row gap-3 items-center">
          {/* Notification Panel */}
          <NotificationPanel
            onNotificationClick={(_referenceId, type) => {
              // Handle notification click - navigate based on type
              if (
                type === "CONSULTATION_ACCEPTED" ||
                type === "CONSULTATION_REJECTED"
              ) {
                navigate("/konseling");
              } else if (type === "CHAT_MESSAGE") {
                // Navigate to konseling page and trigger chat open
                navigate("/konseling", {
                  state: { openChatForConsultation: _referenceId },
                });
              } else if (type === "ZOOM_MEETING") {
                navigate("/konseling");
              }
            }}
          />

          {/* Profile */}
          <div
            className="flex flex-row gap-2 items-center text-white cursor-pointer"
            onClick={() => navigate("/profil")}
          >
            <div
              className="w-10 h-10 rounded-full bg-white/90 shadow-inner ring-2 flex items-center justify-center select-none"
              aria-label={`Avatar ${
                user ? `${user.firstname} ${user.lastname}`.trim() : "User"
              }`}
            >
              <span className="text-primary-dark font-extrabold text-xl tracking-wide">
                {getInitials(user)}
              </span>
            </div>
            <span className="text-base font-semibold">
              {user ? `${user.firstname} ${user.lastname}`.trim() : "User"}
            </span>
          </div>
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
          className="fixed top-16 left-0 w-full bg-primary flex flex-col items-center z-10 md:hidden text-lg font-semibold"
        >
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setMenuOpen(false);
              }}
              className={`py-2 border-t w-full text-center text-white ${
                location.pathname === item.path ? "font-bold bg-secondary" : ""
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
