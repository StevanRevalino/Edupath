import { type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import TokenManager from "../utils/tokenManager";
import HeaderProfil from "../assets/icons/Header-Profil.png";
import SidebarProfil from "../pages/user/Profil/components/Sidebar-Profil";
import MainContainer from "../pages/user/Profil/components/Main-Container";

interface ProfilePageLayoutProps {
  children?: ReactNode;
  isProfilePage?: boolean;
  showLoading?: boolean;
}

const ProfilePageLayout = ({
  children,
  isProfilePage = false,
  showLoading = false,
}: ProfilePageLayoutProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    TokenManager.logout();
    toast.success("Berhasil logout");
    navigate("/login");
  };

  if (showLoading) {
    return (
      <div className="bg-gray-100 relative -mb-24 w-full min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-3 border-[#00437A]"></div>
        <div className="font-semibold text-[#00437A] flex justify-center">
          Loading
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 relative -mb-24">
      {/* Header Background */}
      <div className="absolute -top-20">
        <img src={HeaderProfil} alt="Header Profil" className="w-full h-auto" />
      </div>

      {/* Main Content */}
      <div className="relative z-1 flex">
        <SidebarProfil onLogout={handleLogout} />
        <MainContainer isProfilePage={isProfilePage}>{children}</MainContainer>
      </div>
    </div>
  );
};

export default ProfilePageLayout;
