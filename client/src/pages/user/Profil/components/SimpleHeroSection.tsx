import EduPathLogo from "../../../../assets/edupath-logo.png";
import HeaderProfil from "../../../../assets/Header-Profil.png";

interface SimpleHeroSectionProps {
  title: string;
}

export default function SimpleHeroSection({ title }: SimpleHeroSectionProps) {
  return (
    <div className="absolute -top-20 left-0 w-full h-48 sm:h-64 md:h-80 lg:h-96 z-[1]">
      {/* Background Image */}
      <img
        src={HeaderProfil}
        alt="Header Profil"
        className="w-full h-full object-cover rounded-b-4xl"
      />

      {/* Overlay Content */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="flex pt-10 sm:pt-16 md:pt-20 items-center gap-2 sm:gap-4 md:gap-6">
          {/* Title */}
          <h1 className="text-white text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold drop-shadow-lg text-center sm:text-left">
            {title}
          </h1>

          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src={EduPathLogo}
              alt="EduPath Logo"
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 object-contain drop-shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
