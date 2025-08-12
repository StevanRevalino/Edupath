import axios from "axios";

// Determine the best base URL for the current platform
const getBaseURL = () => {
  // If VITE_API_URL is set, use it (for network access)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // For development, try different localhost variations
  const possibleHosts = [
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://[::1]:5000",
  ];

  // Use localhost by default
  return possibleHosts[0];
};

// Create axios instance with default config
const api = axios.create({
  baseURL: `${getBaseURL()}/api`,
  timeout: 15000, // Increased timeout for slower networks
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // Set to false to avoid CORS issues
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 Making request to: ${config.baseURL}${config.url}`);
    console.log("📦 Request data:", config.data);
    console.log("🏷️ Headers:", config.headers);
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log("✅ Response received:", response.status, response.data);
    return response;
  },
  (error) => {
    console.error("❌ Response error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      },
    });

    // If localhost fails, suggest alternative
    if (
      error.code === "ECONNREFUSED" ||
      error.message.includes("Network Error")
    ) {
      console.log(
        "💡 Hint: Try using 127.0.0.1:5000 instead of localhost:5000"
      );
      console.log("💡 Or check if the server is running on the correct port");
    }

    return Promise.reject(error);
  }
);

export default api;
