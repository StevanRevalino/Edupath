import React, { useEffect, useRef } from "react";
import { User } from "lucide-react";

interface MainContainerProps {
  children: React.ReactNode;
  isProfilePage?: boolean;
  onHeightChange?: (height: number) => void;
}

export default function MainContainer({
  children,
  isProfilePage,
  onHeightChange,
}: MainContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const height = entry.contentRect.height;
          onHeightChange?.(height);
        }
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [onHeightChange]);

  return (
    <div className="flex-1 pt-[180px] pb-10">
      {/* Container dengan position relative untuk avatar yang menonjol */}
      <div className="relative max-w-4xl mx-auto">
        {/* Profile Avatar - Positioned absolutely to protrude from container */}
        {isProfilePage && (
          <div className="absolute -top-15 left-1/2 transform -translate-x-1/2 z-20">
            <div className="w-30 h-30 bg-gray-200 rounded-full border-4 border-[#00437A] flex items-center justify-center shadow-xl">
              <User size={75} className="text-gray-500" />
            </div>
          </div>
        )}

        {/* Main Content Container */}
        <div
          ref={containerRef}
          className="bg-white rounded-t-[75px] shadow-2xl p-10 pt-15 border-[#00437A] border-3 border-b-0 min-h-[600px] relative z-[2]"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
