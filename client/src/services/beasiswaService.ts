import axios from "axios";
import TokenManager from "../utils/tokenManager";

const API_URL = import.meta.env.VITE_API_URL;

interface Beasiswa {
  beasiswa_id: string;
  title: string;
  image_url: string;
  link: string;
  created_at: string;
  updated_at: string;
}

interface CreateBeasiswaData {
  title: string;
  link: string;
  image_url: string;
}

interface UpdateBeasiswaData {
  title: string;
  link: string;
  image_url: string;
}

class BeasiswaService {
  private handleAuthError(status: number) {
    if (status === 401 || status === 403) {
      TokenManager.logout();
      window.location.href = "/login";
    }
  }

  async getAllBeasiswa(): Promise<{ success: boolean; data: Beasiswa[] }> {
    try {
      const response = await axios.get(`${API_URL}/api/beasiswa`);
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

  async createBeasiswa(
    data: CreateBeasiswaData
  ): Promise<{ success: boolean; data: Beasiswa }> {
    try {
      const token = TokenManager.getToken();
      const response = await axios.post(`${API_URL}/api/beasiswa`, data, {
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

  async updateBeasiswa(
    id: string,
    data: UpdateBeasiswaData
  ): Promise<{ success: boolean; data: Beasiswa }> {
    try {
      const token = TokenManager.getToken();
      const response = await axios.put(`${API_URL}/api/beasiswa/${id}`, data, {
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

  async deleteBeasiswa(id: string): Promise<{ success: boolean }> {
    try {
      const token = TokenManager.getToken();
      await axios.delete(`${API_URL}/api/beasiswa/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
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

export const beasiswaService = new BeasiswaService();
