import { type ReactNode } from "react";
import loginBackground from "../assets/login-background.png";

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
    <div className="flex flex-col lg:flex-row min-h-screen bg-white lg:bg-blue-100">
      {/* Kiri: Logo */}
      <div className="hidden lg:flex w-1/2 items-center justify-center">
        <img
          src={loginBackground}
          alt="Auth Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Kanan: Form */}
      <div
        className="w-full lg:w-1/2 bg-white flex flex-col justify-center py-6 sm:py-8 lg:py-10 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-20 2xl:px-40 min-h-screen lg:min-h-auto"
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
        <div className="w-full flex flex-col gap-4 sm:gap-5 bg-[#f5f5f5] px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10 rounded-2xl sm:rounded-3xl lg:rounded-4xl">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
