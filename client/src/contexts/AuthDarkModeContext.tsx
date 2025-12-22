import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface AuthDarkModeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const AuthDarkModeContext = createContext<AuthDarkModeContextType | undefined>(
  undefined
);

export const useAuthDarkMode = () => {
  const context = useContext(AuthDarkModeContext);
  if (!context) {
    throw new Error(
      "useAuthDarkMode must be used within an AuthDarkModeProvider"
    );
  }
  return context;
};

interface AuthDarkModeProviderProps {
  children: ReactNode;
}

export const AuthDarkModeProvider = ({
  children,
}: AuthDarkModeProviderProps) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Load from localStorage or default to false
    const savedMode = localStorage.getItem("auth_dark_mode");
    return savedMode === "true";
  });

  useEffect(() => {
    // Save to localStorage only, don't add dark class to document
    localStorage.setItem("auth_dark_mode", isDarkMode.toString());
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <AuthDarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <div className={isDarkMode ? "dark" : ""}>{children}</div>
    </AuthDarkModeContext.Provider>
  );
};
