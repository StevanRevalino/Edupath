import { type ReactNode } from "react";
import loginRegisterBackground from "../../../assets/login-register-bg.png";
import AuthDarkModeToggle from "./AuthDarkModeToggle";
import { AuthDarkModeProvider } from "../../../contexts/AuthDarkModeContext";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const AuthLayout = ({
  children,
  title,
  subtitle,
  onKeyDown,
}: AuthLayoutProps) => {
  return (
    <AuthDarkModeProvider>
      <div className="relative flex min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        {/* Dark Mode Toggle - Posisi di kanan atas */}
        <AuthDarkModeToggle />

        {/* Background Image - Full Width dengan overlay gelap di dark mode */}
        <div className="hidden lg:block absolute inset-0 w-full h-full">
          <img
            src={loginRegisterBackground}
            alt="Auth Background"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Form Container - Right Half with Higher Z-Index */}
        <div className="w-full lg:w-1/2 lg:ml-auto relative z-10">
          <div
            className="w-full bg-white dark:bg-gray-800 flex flex-col justify-center py-6 sm:py-8 lg:py-10 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-20 2xl:px-40 min-h-screen lg:rounded-l-[80px] shadow-2xl transition-colors duration-300"
            onKeyDown={onKeyDown}
          >
            <div className="w-full mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold text-center mb-2 text-gray-900 dark:text-white transition-colors duration-300">
                {title}
              </h1>
              <p className="text-base sm:text-lg md:text-xl mb-2 text-gray-900 dark:text-gray-300 text-center transition-colors duration-300">
                {subtitle}
              </p>
            </div>

            {/* Form Container */}
            <div className="w-full flex flex-col gap-4 sm:gap-5 bg-gray-100 dark:bg-gray-700 px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10 rounded-2xl sm:rounded-3xl lg:rounded-4xl transition-colors duration-300">
              {children}
            </div>
          </div>
        </div>
      </div>
    </AuthDarkModeProvider>
  );
};

export default AuthLayout;
