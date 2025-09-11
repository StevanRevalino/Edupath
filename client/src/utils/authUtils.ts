// Auth utility functions for managing authentication state
import toast from "react-hot-toast";

export const clearAuthData = () => {
  console.log("🧹 Clearing all authentication data...");

  const hadToken = !!localStorage.getItem("token");
  const hadUserId = !!localStorage.getItem("user_id");
  const hadRole = !!localStorage.getItem("role");

  localStorage.removeItem("token");
  localStorage.removeItem("user_id");
  localStorage.removeItem("role");

  console.log("📊 Auth data cleared:", {
    hadToken,
    hadUserId,
    hadRole,
    nowHasToken: !!localStorage.getItem("token"),
  });

  return { hadToken, hadUserId, hadRole };
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");

  return !!(token && userId);
};

export const getUserRole = (): string | null => {
  return localStorage.getItem("role");
};

export const getUserId = (): string | null => {
  return localStorage.getItem("user_id");
};

export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const setAuthData = (token: string, userId: string, role: string) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user_id", userId);
  localStorage.setItem("role", role);

  console.log("✅ Auth data set:", {
    hasToken: !!token,
    userId,
    role,
  });
};

// Function to check if token is expired (client-side check)
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    return true; // If we can't decode, consider it expired
  }
};

// Function to handle auth errors and redirect
export const handleAuthError = (message?: string) => {
  console.log("🚫 Auth error:", message);

  // Clear auth data
  clearAuthData();

  // Show error message
  toast.error(message || "Session expired. Please login again.");

  // Only redirect if not already on login page
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};
