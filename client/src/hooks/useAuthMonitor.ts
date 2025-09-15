import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TokenManager from "../utils/tokenManager";
import toast from "react-hot-toast";

const useAuthMonitor = () => {
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    TokenManager.logout();
    toast.error("Session expired. Silakan login kembali.");
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
    return TokenManager.isAuthenticated();
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
