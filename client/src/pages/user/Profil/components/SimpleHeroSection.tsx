import EduPathLogo from "../../../../assets/edupath-logo.png";
import HeaderProfil from "../../../../assets/Header-Profil.png";

interface SimpleHeroSectionProps {
  title: string;
}

export default function SimpleHeroSection({ title }: SimpleHeroSectionProps) {
  return (
    <div className="absolute -top-40 left-0 w-full z-[1]">
      {/* Background Image */}
      <img src={HeaderProfil} alt="Header Profil" className="w-full h-auto" />

      {/* Overlay Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex pt-20 pl-50 items-center gap-4">
          {/* Title */}
          <h1 className="text-white text-7xl font-bold drop-shadow-lg">
            {title}
          </h1>

          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src={EduPathLogo}
              alt="EduPath Logo"
              className="w-32 h-32 object-contain drop-shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
