import React from "react";

interface HeroSectionProps {
  backgroundImage: string;
  title: string;
  description: string | React.ReactNode;
  icon?: string;
  children?: React.ReactNode;
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  backgroundImage,
  title,
  description,
  icon,
  children,
  className = "",
}) => {
  return (
    <section
      className={`absolute hidden sm:block -top-20 left-0 w-full h-64 sm:h-80 lg:h-[520px] z-[1] ${className}`}
    >
      {/* Background Image */}
      <img
        src={backgroundImage}
        alt={`Hero ${title}`}
        className="w-full h-full object-cover rounded-b-4xl"
      />

      {/* Overlay Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-20 lg:px-12 pt-10">
          <div className="flex items-center">
            {/* Left: Text Content */}
            <div className="flex-1/2 pl-8 md:pl-10 lg:pl-12 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold">
                {title}
              </h1>

              {typeof description === "string" ? (
                <p className="mt-3 text-sm sm:text-base lg:text-lg opacity-95">
                  {description}
                </p>
              ) : (
                <div className="mt-3 text-sm sm:text-base lg:text-lg opacity-95">
                  {description}
                </div>
              )}

              {/* Custom Children (e.g., Search Bar, Buttons) */}
              {children && <div className="mt-5">{children}</div>}
            </div>

            {/* Right: Icon */}
            {icon && (
              <div className="flex flex-1/2 justify-center">
                <img
                  src={icon}
                  alt={`${title} Icon`}
                  className="w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
