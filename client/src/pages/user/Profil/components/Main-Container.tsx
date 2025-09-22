import React from "react";
import { User } from "lucide-react";

interface MainContainerProps {
  children: React.ReactNode;
  isProfilePage?: boolean;
}

export default function MainContainer({
  children,
  isProfilePage,
}: MainContainerProps) {
  return (
    <div className="flex-1 pt-20">
      {/* Container dengan position relative untuk avatar yang menonjol */}
      <div className="relative max-w-4xl mx-auto">
        {/* Profile Avatar - Positioned absolutely to protrude from container */}
        {isProfilePage && (
          <div className="absolute -top-15 left-1/2 transform -translate-x-1/2 z-1">
            <div className="w-30 h-30 bg-gray-200 rounded-full border-3 border-[#00437A] flex items-center justify-center shadow-lg">
              <User size={75} className="text-gray-500" />
            </div>
          </div>
        )}

        {/* Main Content Container */}
        <div className="bg-white rounded-t-[75px] shadow-xl p-10 pt-15 border-[#00437A] border-3 border-b-0 min-h-[600px]">
          {children}
        </div>
      </div>
    </div>
  );
}
