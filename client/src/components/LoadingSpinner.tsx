import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div
      className={`flex items-center justify-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300 ${className}`}
    >
      <div className="text-center">
        <div
          className={`inline-block animate-spin rounded-full border-b-2 border-blue-500 dark:border-blue-400 mx-auto ${sizeClasses[size]}`}
        ></div>
        {message && (
          <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
