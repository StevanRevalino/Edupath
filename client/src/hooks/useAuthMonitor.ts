import { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TokenManager from "../utils/tokenManager";
import toast from "react-hot-toast";

const useAuthMonitor = () => {
  const navigate = useNavigate();
  const hasShownLogoutToast = useRef(false);

  const handleLogout = useCallback(() => {
    console.log(
      "🔴 handleLogout called, hasShownLogoutToast:",
      hasShownLogoutToast.current
    );
    TokenManager.logout();

    // Only show toast if not already shown in this session
    if (!hasShownLogoutToast.current) {
      hasShownLogoutToast.current = true;
      console.log("🍞 Showing logout toast");
      toast.error("Session expired. Silakan login kembali.");
    } else {
      console.log("🚫 Toast already shown, skipping");
    }

    navigate("/login");
  }, [navigate]);

  const checkTokenExpiry = useCallback(() => {
    if (!TokenManager.isTokenValid()) {
      handleLogout();
      return false;
    }
    return true;
  }, [handleLogout]);

  const isAuthenticated = useCallback(() => {
    const isAuth = TokenManager.isAuthenticated();

    // If not authenticated and haven't shown logout toast yet, trigger logout
    if (!isAuth && !hasShownLogoutToast.current) {
      handleLogout();
    }

    return isAuth;
  }, [handleLogout]);

  // Reset toast flag when component mounts (new session)
  useEffect(() => {
    hasShownLogoutToast.current = false;
  }, []);

  // Monitor token expiry setiap 30 detik
  useEffect(() => {
    const interval = setInterval(() => {
      if (!checkTokenExpiry()) {
        clearInterval(interval);
      }
    }, 30000); // Check every 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [checkTokenExpiry]);

  return {
    isAuthenticated,
    checkTokenExpiry,
    handleLogout,
  };
};

export default useAuthMonitor;
