interface ColoredTagProps {
  text: string;
  onClick?: () => void;
  getColor: (str: string) => string;
  className?: string;
}

const ColoredTag = ({
  text,
  onClick,
  getColor,
  className = "",
}: ColoredTagProps) => {
  const baseClasses =
    "text-white text-xs lg:text-sm px-2 lg:px-3 py-1 rounded-full font-semibold";
  const interactiveClasses = onClick
    ? "cursor-pointer hover:opacity-80 transition-opacity"
    : "";

  return (
    <span
      className={`${baseClasses} ${interactiveClasses} ${getColor(
        text
      )} ${className}`}
      onClick={onClick}
    >
      {text}
    </span>
  );
};

export default ColoredTag;
