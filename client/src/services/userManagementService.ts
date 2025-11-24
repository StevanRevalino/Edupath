import axios from "axios";
import TokenManager from "../utils/tokenManager";

const API_URL = import.meta.env.VITE_API_URL;

interface Student {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  kelas: number | null;
  created_at: string;
}

interface UpdateStudentData {
  firstname: string;
  lastname: string;
  kelas: number;
}

class UserManagementService {
  private handleAuthError(status: number) {
    if (status === 401 || status === 403) {
      TokenManager.logout();
      window.location.href = "/login";
    }
  }

  async getAllStudents(): Promise<{ success: boolean; data: Student[] }> {
    try {
      const token = TokenManager.getToken();
      const response = await axios.get(`${API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        this.handleAuthError(error.response.status);
      }
      throw error;
    }
  }

  async updateStudent(
    userId: string,
    data: UpdateStudentData
  ): Promise<{ success: boolean; data: Student }> {
    try {
      const token = TokenManager.getToken();
      const response = await axios.put(`${API_URL}/api/users/${userId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        this.handleAuthError(error.response.status);
      }
      throw error;
    }
  }

  async deleteStudent(userId: string): Promise<{ success: boolean }> {
    try {
      const token = TokenManager.getToken();
      await axios.delete(`${API_URL}/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return {
        success: true,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        this.handleAuthError(error.response.status);
      }
      throw error;
    }
  }
}

export const userManagementService = new UserManagementService();
