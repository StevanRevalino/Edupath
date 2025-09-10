import axios from "axios";
import toast from "react-hot-toast";

const API_BASE =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

// Create axios instance with interceptors for automatic token handling
const apiClient = axios.create({
  baseURL: `${API_BASE}/api`,
});

// Function to clear all auth data
const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user_id");
  localStorage.removeItem("role");
};

// Function to check if token is expired (client-side check)
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    return true; // If we can't decode, consider it expired
  }
};

// Request interceptor to add token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    
    if (token) {
      // Check if token is expired before making request
      if (isTokenExpired(token)) {
        console.log("🕒 Token expired on client side, clearing auth data");
        clearAuthData();
        toast.error("Session expired. Please login again.");
        window.location.href = "/login";
        return Promise.reject(new Error("Token expired"));
      }
      
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log("🚫 Auth error from server:", error.response?.data?.message);
      
      // Token expired or invalid, clear data and redirect to login
      clearAuthData();
      toast.error("Session expired. Please login again.");
      
      // Only redirect if not already on login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
