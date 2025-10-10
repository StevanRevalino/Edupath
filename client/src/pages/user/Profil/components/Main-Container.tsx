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
    <div className="flex-1 pt-[240px] pb-10">
      {/* Container dengan position relative untuk avatar yang menonjol */}
      <div className="relative max-w-4xl mx-auto">

        {/* Main Content Container */}
        <div
          ref={containerRef}
          className="rounded-t-[75px] p-10 pt-15 border-b-0 min-h-[600px] relative z-[2]"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
