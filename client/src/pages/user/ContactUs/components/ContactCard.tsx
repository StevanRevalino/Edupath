import type { ReactNode } from "react";

interface ContactCardProps {
  title: string;
  contact: string;
  description: string;
  icon: ReactNode;
  gradientFrom: string;
  gradientTo: string;
  gradientVia?: string;
  accentGradient: string;
  badgeGradient: string;
  badgeBorder: string;
  decorativeGradient: string;
  buttonText: string;
  buttonIcon: ReactNode;
  onButtonClick: () => void;
}

export default function ContactCard({
  title,
  contact,
  description,
  icon,
  gradientFrom,
  gradientTo,
  gradientVia,
  accentGradient,
  badgeGradient,
  badgeBorder,
  decorativeGradient,
  buttonText,
  buttonIcon,
  onButtonClick,
}: ContactCardProps) {
  return (
    <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
      {/* Gradient Accent Line */}
      <div
        className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${accentGradient} rounded-t-2xl`}
      ></div>

      {/* Decorative Background */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${decorativeGradient} to-transparent rounded-full blur-2xl`}
      ></div>

      <div className="relative flex flex-col items-center text-center">
        {/* Icon Container */}
        <div className="mb-6 relative">
          <div
            className="absolute inset-0 bg-gradient-to-br from-current/20 to-transparent rounded-full blur-xl"
            style={{
              color: gradientFrom,
            }}
          ></div>
          <div
            className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300`}
            style={{
              background: gradientVia
                ? `linear-gradient(to bottom right, ${gradientFrom}, ${gradientVia}, ${gradientTo})`
                : `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`,
            }}
          >
            {icon}
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
          {title}
        </h2>
        <div
          className={`inline-block px-4 py-2 bg-gradient-to-r ${badgeGradient} border ${badgeBorder} rounded-full mb-4`}
        >
          <p className="text-sm sm:text-base font-semibold text-gray-700">
            {contact}
          </p>
        </div>
        <p className="text-sm text-gray-600 mb-6 px-4">{description}</p>
        <button
          onClick={onButtonClick}
          className="group relative text-white font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          style={{
            background: gradientVia
              ? `linear-gradient(to right, ${gradientFrom}, ${gradientVia}, ${gradientTo})`
              : `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`,
          }}
        >
          <span className="flex items-center gap-2">
            {buttonIcon}
            {buttonText}
          </span>
        </button>
      </div>
    </div>
  );
}
