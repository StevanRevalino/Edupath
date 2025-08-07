import React from "react";
import { ChevronLeft } from "lucide-react";
import conselingHeroIcon from "../../assets/icons/Conseling-hero-icon.png";

const Konseling = () => {
  return (
    <div className="-mt-16 sm:-mt-20 md:-mt-24">
      {/* Hero Section */}
      <div className="min-h-screen bg-gradient-to-b from-[#D0E5FF] via-[#81ABDE] to-[#3975BF] overflow-hidden px-4 sm:px-6 md:px-12 flex flex-col md:rounded-b-3xl">
        {/* Back Button */}
        <div className="flex-shrink-0 pt-20 sm:pt-24 md:pt-32">
          <button className="flex items-center text-white hover:text-blue-200 transition-colors">
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            <span className="text-base sm:text-lg font-medium">Kembali</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center px-2 md:px-6 lg:px-32 gap-8 lg:gap-32 py-8 lg:py-0">
          {/* Left Content */}
          <div className="w-full lg:max-w-2xl flex flex-col justify-center text-center lg:text-left lg:pr-24">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 lg:mb-4 text-shadow-lg/10">
              Konseling
            </h1>
            <div className="text-base sm:text-lg md:text-xl text-white mb-6 lg:mb-6 leading-relaxed font-light px-4 sm:px-0">
              Bicara dengan pihak profesional sekarang.
              <br />
              Pastikan bahwa jurusanmu sesuai!
            </div>
            <div className="flex justify-center lg:justify-start">
              <button className="bg-[#6CCBFF] hover:bg-[#6CCBFF]/80 text-white font-semibold py-3 px-6 sm:px-8 rounded-2xl cursor-pointer text-base sm:text-lg shadow-md shadow-black/50 transition-all">
                Jadwalkan sesi
              </button>
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="hidden lg:flex justify-center items-center mt-8 lg:mt-0">
            <img
              src={conselingHeroIcon}
              alt="Konseling Hero"
              className="w-48 md:w-56 lg:w-64 xl:w-72 2xl:w-80 h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Konseling;
