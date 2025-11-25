import axios from "axios";
import TokenManager from "../utils/tokenManager";

const API_URL = import.meta.env.VITE_API_URL;

interface Universitas {
  id_universitas: string;
  nama: string;
  akreditasi: string | null;
  tipe: string | null;
  alamat: string | null;
  kota: string | null;
  provinsi: string | null;
  website: string | null;
  telepon: string | null;
  email: string | null;
  logo_url: string | null;
  deskripsi: string | null;
}

interface UniversitasResponse {
  success: boolean;
  data: Universitas[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class UniversitasService {
  private handleAuthError(status: number) {
    if (status === 401 || status === 403) {
      TokenManager.logout();
      window.location.href = "/login";
    }
  }

  async getAllUniversitas(limit?: number): Promise<UniversitasResponse> {
    try {
      const token = TokenManager.getToken();
      const url = limit
        ? `${API_URL}/api/universitas?limit=${limit}`
        : `${API_URL}/api/universitas`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status) this.handleAuthError(status);
      }
      throw error;
    }
  }

  async getUniversitasById(
    id: string
  ): Promise<{ success: boolean; data: Universitas }> {
    try {
      const token = TokenManager.getToken();

      const response = await axios.get(`${API_URL}/api/universitas/${id}`, {
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
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status) this.handleAuthError(status);
      }
      throw error;
    }
  }

  async searchUniversitas(query: string): Promise<UniversitasResponse> {
    try {
      const token = TokenManager.getToken();

      const response = await axios.get(
        `${API_URL}/api/universitas?search=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status) this.handleAuthError(status);
      }
      throw error;
    }
  }
}

export const universitasService = new UniversitasService();
export type { Universitas, UniversitasResponse };
