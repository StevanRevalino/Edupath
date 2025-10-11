import { type ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import TokenManager from "../../../../utils/tokenManager";
import SimpleHeroSection from "./SimpleHeroSection";
import SidebarProfil from "./Sidebar-Profil";
import MainContainer from "./Main-Container";

interface ProfilePageLayoutProps {
  children?: ReactNode;
  isProfilePage?: boolean;
  showLoading?: boolean;
  pageTitle?: string;
}

const ProfilePageLayout = ({
  children,
  isProfilePage = false,
  showLoading = false,
  pageTitle = "",
}: ProfilePageLayoutProps) => {
  const navigate = useNavigate();
  const [mainSectionHeight, setMainSectionHeight] = useState(600);

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
    <div className="bg-gray-100 relative -mb-24 min-h-screen">
      {/* Hero Section */}
      <SimpleHeroSection title={pageTitle} />

      {/* Main Content */}
      <div className="relative z-[1] flex pt-8 sm:pt-12 md:pt-16 lg:pt-20">
        <SidebarProfil
          onLogout={handleLogout}
          mainSectionHeight={mainSectionHeight}
        />
        <MainContainer
          isProfilePage={isProfilePage}
          onHeightChange={setMainSectionHeight}
        >
          {children}
        </MainContainer>
      </div>
    </div>
  );
};

export default ProfilePageLayout;
