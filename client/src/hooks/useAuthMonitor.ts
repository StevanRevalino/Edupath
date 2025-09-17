import { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TokenManager from "../utils/tokenManager";
import toast from "react-hot-toast";

const useAuthMonitor = () => {
  const navigate = useNavigate();
  const hasShownToast = useRef<{
    unauthorized: boolean;
    expired: boolean;
  }>({
    unauthorized: false,
    expired: false,
  });

  const handleAuthFailure = useCallback(
    (authStatus: "expired" | "unauthorized") => {
      console.log("🔴 handleAuthFailure called, status:", authStatus);
      TokenManager.logout();

      // Show appropriate toast based on auth status
      if (authStatus === "expired" && !hasShownToast.current.expired) {
        hasShownToast.current.expired = true;
        toast.error("Session expired. Silakan login kembali.");
      } else if (
        authStatus === "unauthorized" &&
        !hasShownToast.current.unauthorized
      ) {
        hasShownToast.current.unauthorized = true;
        toast.error("Unauthorized. Silakan login terlebih dahulu.");
      }

      navigate("/login");
    },
    [navigate]
  );

  const checkTokenExpiry = useCallback(() => {
    const authStatus = TokenManager.getAuthStatus();

    if (authStatus !== "authenticated") {
      handleAuthFailure(authStatus);
      return false;
    }
    return true;
  }, [handleAuthFailure]);

  const isAuthenticated = useCallback(() => {
    const authStatus = TokenManager.getAuthStatus();

    // If not authenticated, trigger appropriate action
    if (authStatus !== "authenticated") {
      handleAuthFailure(authStatus);
      return false;
    }

    return true;
  }, [handleAuthFailure]);

  // Reset toast flags when component mounts (new session)
  useEffect(() => {
    hasShownToast.current = {
      unauthorized: false,
      expired: false,
    };
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
    handleAuthFailure,
  };
};

export default useAuthMonitor;
