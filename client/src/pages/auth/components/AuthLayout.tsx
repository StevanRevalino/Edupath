import { type ReactNode } from "react";
import loginRegisterBackground from "../../../assets/login-register-bg.png";

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
    <div className="relative flex min-h-screen bg-white">
      {/* Background Image - Full Width */}
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
          className="w-full bg-white flex flex-col justify-center py-6 sm:py-8 lg:py-10 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-20 2xl:px-40 min-h-screen lg:rounded-l-[80px] shadow-2xl"
          onKeyDown={onKeyDown}
        >
          <div className="w-full mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold text-center mb-2">
              {title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-2 text-gray-900 text-center">
              {subtitle}
            </p>
          </div>

          {/* Form Container */}
          <div className="w-full flex flex-col gap-4 sm:gap-5 bg-gray-100 px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10 rounded-2xl sm:rounded-3xl lg:rounded-4xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
