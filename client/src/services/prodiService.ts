import axios from "axios";
import TokenManager from "../utils/tokenManager";

const API_URL = import.meta.env.VITE_API_URL;

interface Prodi {
  id_prodi: string;
  nama_prodi: string;
  bidang: string | null;
  deskripsi: string | null;
  jenjang: string | null;
  prospek_kerja: string | null;
  passing_grade: number | null;
  biaya_kuliah_min: number | null;
  biaya_kuliah_max: number | null;
}

interface ProdiWithUniversity {
  prodi_id: string;
  nama_prodi: string;
  jenjang?: string | null;
  bidang?: string | null;
  akreditasi?: string | null;
  universitas?: {
    university_id: string | null;
    nama: string | null;
    provinsi: string | null;
  };
}

interface ProdiDetail {
  prodi_id: string;
  nama_prodi: string;
  jenjang?: string | null;
  status?: string;
}

interface ProdiResponse {
  success: boolean;
  data: Prodi[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ProdiSearchResponse {
  success: boolean;
  data: ProdiWithUniversity[];
}

class ProdiService {
  private handleAuthError(status: number) {
    if (status === 401 || status === 403) {
      TokenManager.logout();
      window.location.href = "/login";
    }
  }

  async getAllProdi(limit?: number): Promise<ProdiResponse> {
    try {
      const token = TokenManager.getToken();
      const url = limit
        ? `${API_URL}/api/prodi?limit=${limit}`
        : `${API_URL}/api/prodi`;

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

  async getProdiById(id: string): Promise<{ success: boolean; data: Prodi }> {
    try {
      const token = TokenManager.getToken();

      const response = await axios.get(`${API_URL}/api/prodi/${id}`, {
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

  async searchProdi(query: string): Promise<ProdiResponse> {
    try {
      const token = TokenManager.getToken();

      const response = await axios.get(
        `${API_URL}/api/prodi?search=${encodeURIComponent(query)}`,
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

  async getProdiDetail(prodiId: string): Promise<ProdiDetail> {
    try {
      const token = TokenManager.getToken();

      const response = await axios.get(
        `${API_URL}/api/prodi/detail/${prodiId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status) this.handleAuthError(status);
      }
      throw error;
    }
  }

  async searchProdiByName(
    name: string,
    signal?: AbortSignal
  ): Promise<ProdiSearchResponse> {
    try {
      const token = TokenManager.getToken();

      const response = await axios.get(
        `${API_URL}/api/prodi/search/nama/${encodeURIComponent(name)}`,
        {
          signal,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        data: response.data.data || [],
      };
    } catch (error) {
      if (axios.isCancel(error)) {
        throw error; // Re-throw cancel errors
      }
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status) this.handleAuthError(status);
      }
      throw error;
    }
  }

  async getProdiWithFilters(params: {
    searchKeyword?: string;
    jenjang?: string;
    akreditasi?: string;
    limit?: number;
  }): Promise<ProdiSearchResponse> {
    try {
      const token = TokenManager.getToken();
      const { searchKeyword, jenjang, akreditasi, limit } = params;

      let url: string;
      let queryParams: any = {};

      if (searchKeyword && searchKeyword.trim().length > 0) {
        // Search with keyword
        url = `${API_URL}/api/prodi/search/nama/${encodeURIComponent(
          searchKeyword.trim()
        )}`;
      } else {
        // Get prodi with filters
        url = `${API_URL}/api/prodi`;

        if (jenjang && jenjang !== "Semua") {
          queryParams.jenjang = jenjang;
        }
        if (akreditasi && akreditasi !== "Semua") {
          queryParams.akreditasi = akreditasi;
        }
        if (limit) {
          queryParams.limit = limit;
        }
      }

      const response = await axios.get(url, {
        params: queryParams,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return {
        success: true,
        data: response.data.data || [],
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

export const prodiService = new ProdiService();
export type {
  Prodi,
  ProdiResponse,
  ProdiWithUniversity,
  ProdiDetail,
  ProdiSearchResponse,
};
