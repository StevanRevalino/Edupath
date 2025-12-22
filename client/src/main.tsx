import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "react-hot-toast";
import { DarkModeProvider } from "./contexts/DarkModeContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DarkModeProvider>
      <App />
      <Toaster position="top-right" />
    </DarkModeProvider>
  </StrictMode>
);
