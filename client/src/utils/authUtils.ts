// Auth utility functions for managing authentication state

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
