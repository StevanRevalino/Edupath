import { forwardRef, useState } from "react";
import { CheckCircle } from "lucide-react";

interface AuthEmailInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isVerified?: boolean;
  onVerify?: () => void;
  verifyButtonText?: string;
}

const AuthEmailInput = forwardRef<HTMLInputElement, AuthEmailInputProps>(
  (
    {
      label = "",
      error,
      isVerified = false,
      onVerify,
      verifyButtonText = "Verifikasi",
      className = "",
      ...props
    },
    ref
  ) => {
    const [disableOtp, setDisableOtp] = useState(false);
    const handleVerify = async () => {
      if (onVerify) {
        setDisableOtp(true);
        await onVerify();
      }
      // setTimeout(()=>{
      setDisableOtp(false);
      // }, 3000);
    };
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {label}
          </label>
        )}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
          <input
            ref={ref}
            type="email"
            className={`w-full px-3 py-2.5 rounded-full shadow-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm sm:text-base placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 border border-gray-200 dark:border-gray-600 transition-colors duration-300 ${
              error ? "border-red-500 dark:border-red-400" : ""
            } ${className}`}
            {...props}
          />

          {!isVerified && onVerify ? (
            <button
              type="button"
              disabled={disableOtp}
              onClick={handleVerify}
              className="bg-primary hover:bg-primary-hoverer text-white px-4 sm:px-3 py-2.5 sm:py-2 rounded-full text-sm sm:text-lg font-semibold cursor-pointer whitespace-nowrap flex-shrink-0 disabled:opacity-50 transition-all"
            >
              {verifyButtonText}
            </button>
          ) : isVerified ? (
            <div className="flex items-center justify-center sm:justify-start w-fit h-fit">
              <CheckCircle className="text-green-500 dark:text-green-400 w-8 h-8" />
            </div>
          ) : null}
        </div>

        {error && (
          <p className="text-red-500 dark:text-red-400 text-xs mt-1">{error}</p>
        )}
      </div>
    );
  }
);

AuthEmailInput.displayName = "AuthEmailInput";

export default AuthEmailInput;
