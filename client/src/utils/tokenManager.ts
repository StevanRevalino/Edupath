interface TokenData {
  token: string;
  timestamp: number;
  expiresIn: number; // dalam detik
}

class TokenManager {
  private static readonly TOKEN_KEY = "token";
  private static readonly USER_ID_KEY = "user_id";
  private static readonly ROLE_KEY = "role";
  private static readonly TOKEN_DATA_KEY = "token_data";

  // Set token dengan timestamp dan expiry
  static setToken(token: string, expiresInDays: number = 1): void {
    const timestamp = Date.now();
    const expiresIn = expiresInDays * 24 * 60 * 60 * 1000; // convert to milliseconds

    const tokenData: TokenData = {
      token,
      timestamp,
      expiresIn,
    };

    // Hanya simpan di token_data untuk menghindari duplikasi
    localStorage.setItem(this.TOKEN_DATA_KEY, JSON.stringify(tokenData));
  }

  // Set token untuk testing dengan durasi dalam detik
  static setTokenForTesting(token: string, expiresInSeconds: number): void {
    const timestamp = Date.now();
    const expiresIn = expiresInSeconds * 1000; // convert to milliseconds

    const tokenData: TokenData = {
      token,
      timestamp,
      expiresIn,
    };

    // Hanya simpan di token_data untuk menghindari duplikasi
    localStorage.setItem(this.TOKEN_DATA_KEY, JSON.stringify(tokenData));
  }

  // Get token jika masih valid
  static getToken(): string | null {
    if (!this.isTokenValid()) {
      this.clearAllAuthData();
      return null;
    }

    try {
      const tokenDataStr = localStorage.getItem(this.TOKEN_DATA_KEY);
      if (!tokenDataStr) return null;

      const tokenData: TokenData = JSON.parse(tokenDataStr);
      return tokenData.token;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  // Cek apakah token masih valid berdasarkan timestamp
  static isTokenValid(): boolean {
    try {
      const tokenDataStr = localStorage.getItem(this.TOKEN_DATA_KEY);
      if (!tokenDataStr) return false;

      const tokenData: TokenData = JSON.parse(tokenDataStr);
      const now = Date.now();
      const tokenAge = now - tokenData.timestamp;

      return tokenAge < tokenData.expiresIn;
    } catch (error) {
      console.error("Error validating token:", error);
      return false;
    }
  }

  // Set user data
  static setUserData(userId: string, role: string): void {
    localStorage.setItem(this.USER_ID_KEY, userId);
    localStorage.setItem(this.ROLE_KEY, role);
  }

  // Get user data jika token valid
  static getUserData(): { userId: string | null; role: string | null } {
    if (!this.isTokenValid()) {
      this.clearAllAuthData();
      return { userId: null, role: null };
    }

    return {
      userId: localStorage.getItem(this.USER_ID_KEY),
      role: localStorage.getItem(this.ROLE_KEY),
    };
  }

  // Clear semua data auth
  static clearAllAuthData(): void {
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem(this.TOKEN_DATA_KEY);
  }

  // Check apakah user sedang login dan token valid
  static isAuthenticated(): boolean {
    const token = this.getToken();
    const { userId } = this.getUserData();
    return !!token && !!userId;
  }

  // Logout dengan clear semua data
  static logout(): void {
    this.clearAllAuthData();
  }
}

export default TokenManager;
