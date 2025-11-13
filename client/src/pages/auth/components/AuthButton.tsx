import { type ReactNode } from "react";

interface AuthButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
  loading?: boolean;
}

const AuthButton = ({
  children,
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  ...props
}: AuthButtonProps) => {
  const baseClasses =
    "w-full py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseClasses} ${
        isDisabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default AuthButton;
