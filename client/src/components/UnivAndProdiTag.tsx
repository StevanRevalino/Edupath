interface UnivAndProdiTagProps {
  text: string;
  onClick?: () => void;
  className?: string;
}

const UnivAndProdiTag = ({
  text,
  onClick,
  className = "",
}: UnivAndProdiTagProps) => {
  const baseClasses =
    "text-white text-xs lg:text-sm px-2 lg:px-3 py-1 rounded-full font-semibold bg-primary-dark";
  const interactiveClasses = onClick
    ? "cursor-pointer hover:opacity-80 transition-opacity"
    : "";

  return (
    <span
      className={`${baseClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
    >
      {text}
    </span>
  );
};

export default UnivAndProdiTag;
