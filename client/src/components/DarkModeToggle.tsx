import { useDarkMode } from "../contexts/DarkModeContext";

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="flex items-center gap-2">
      {/* Toggle Switch */}
      <button
        onClick={toggleDarkMode}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white ${
          isDarkMode ? "bg-blue-600" : "bg-gray-300"
        }`}
        role="switch"
        aria-checked={isDarkMode}
        aria-label="Toggle dark mode"
      >
        {/* Slider Circle */}
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
            isDarkMode ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>

      {/* Optional Label */}
      <span className="text-white text-sm font-medium hidden lg:inline">
        {isDarkMode ? "Dark" : "Light"}
      </span>
    </div>
  );
};

export default DarkModeToggle;
