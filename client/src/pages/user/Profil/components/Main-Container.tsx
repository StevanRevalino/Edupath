import React, { useEffect, useRef } from "react";

interface MainContainerProps {
  children: React.ReactNode;
  isProfilePage?: boolean;
  onHeightChange?: (height: number) => void;
}

export default function MainContainer({
  children,
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
    <div className="flex-1 pt-32 sm:pt-44 md:pt-56 lg:pt-[240px] pb-10">
      {/* Container dengan position relative untuk avatar yang menonjol */}
      <div
        className="relative max-w-screen mx-auto lg:pt-20 lg:pr-20"
        ref={containerRef}
      >
        {children}
      </div>
    </div>
  );
}
