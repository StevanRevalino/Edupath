import { Moon, Sun } from "lucide-react";
import { useAuthDarkMode } from "../../../contexts/AuthDarkModeContext";

const AuthDarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useAuthDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="fixed top-6 right-6 z-50 p-3 sm:p-4 rounded-full bg-white dark:bg-gray-700 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 border-2 border-gray-300 dark:border-gray-600"
      aria-label="Toggle dark mode"
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDarkMode ? (
        <Sun className="w-6 h-6 text-yellow-400 animate-pulse" />
      ) : (
        <Moon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      )}
    </button>
  );
};

export default AuthDarkModeToggle;
