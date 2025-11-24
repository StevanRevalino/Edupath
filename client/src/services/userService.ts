import axios from "axios";
import TokenManager from "../utils/tokenManager";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export interface User {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  kelas?: number;
  created_at?: string;
  updated_at?: string;
}

class UserService {
  private getAuthHeader() {
    const token = TokenManager.getToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    try {
      const response = await axios.get(
        `${API_URL}/api/users/${userId}`,
        this.getAuthHeader()
      );
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          TokenManager.logout();
          window.location.href = "/login";
        }
        throw new Error(
          error.response?.data?.message || "Gagal mengambil data user"
        );
      }
      throw error;
    }
  }
}

export const userService = new UserService();
