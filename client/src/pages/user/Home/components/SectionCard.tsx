import { type ReactNode } from "react";

interface SectionCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  headerVariant?: "normal" | "info";
}

const SectionCard = ({
  title,
  children,
  className = "",
}: SectionCardProps) => {
  const containerClass =
    "shadow-[0_6px_12px_rgba(0,0,0,0.15)] rounded-br-[40px] lg:rounded-br-[60px] rounded-tl-[40px] lg:rounded-tl-[60px] bg-[#e6f3ff] px-4 lg:px-10 py-4 lg:py-6";

  const headerPositionClass =
    "absolute -top-4 lg:-top-6 left-8 lg:left-16 bg-[#31A4FF] rounded-4xl px-3 lg:px-4 py-1 font-bold text-sm lg:text-lg";

  return (
    <div className={`relative ${containerClass} ${className}`}>
      <div className={headerPositionClass}>{title}</div>
      <div className={"mt-2"}>
        {children}
      </div>
    </div>
  );
};

export default SectionCard;
