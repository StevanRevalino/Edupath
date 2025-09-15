import TokenManager from "./tokenManager";
import toast from "react-hot-toast";

// Helper function untuk handle fetch dengan auto-logout
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = TokenManager.getToken();

  // Auto-attach token ke headers jika ada
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401/403 - token expired atau unauthorized
    if (response.status === 401 || response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || "Session expired";

      if (
        errorMessage.includes("expired") ||
        errorMessage.includes("Invalid")
      ) {
        toast.error("Session expired. Silakan login kembali.");
        TokenManager.logout();

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
};
