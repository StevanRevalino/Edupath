import { type ReactNode } from "react";

interface SectionCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const SectionCard = ({
  title,
  children,
  className = "",
}: SectionCardProps) => {
  const containerClass =
    "shadow-[0_6px_12px_rgba(0,0,0,0.15)] rounded-br-2xl lg:rounded-br-4xl rounded-tl-2xl lg:rounded-tl-4xl bg-secondary-lighter px-4 lg:px-10 py-4 lg:py-6";

  const headerPositionClass =
    "absolute -top-4 lg:-top-6 left-8 lg:left-16 bg-secondary rounded-4xl px-3 lg:px-4 py-1 font-bold text-sm lg:text-lg";

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
