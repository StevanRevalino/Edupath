import axios from "axios";
import { getToken, isTokenExpired, handleAuthError } from "./authUtils";

const API_BASE =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

// Create axios instance with interceptors for automatic token handling
const apiClient = axios.create({
  baseURL: `${API_BASE}/api`,
});

// Request interceptor to add token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      // Check if token is expired before making request
      if (isTokenExpired(token)) {
        console.log("🕒 Token expired on client side, clearing auth data");
        handleAuthError("Session expired. Please login again.");
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

export default apiClient;
