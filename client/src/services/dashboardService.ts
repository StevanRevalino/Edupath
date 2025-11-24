import axios from "axios";
import TokenManager from "../utils/tokenManager";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface DashboardStats {
  totalStudents: number;
  totalConsultations: number;
  pendingConsultations: number;
  activeConsultations: number;
  completedConsultations: number;
  totalScholarships: number;
  totalChats: number;
  unreadChats: number;
}

interface UpcomingConsultation {
  consultation_id: string;
  murid_name: string;
  topic: string;
  consultation_date: string;
  status: string;
}

interface RecentChat {
  room_id: string;
  murid_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface WeeklyConsultationsParams {
  startDate: string;
  endDate: string;
}

class DashboardService {
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
   * Get dashboard statistics
   */
  async getStats(): Promise<{
    success: boolean;
    data: {
      stats: DashboardStats;
      weeklyConsultations?: { data: number[] };
    };
  }> {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/dashboard/stats`,
        this.getAuthHeader()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          TokenManager.logout();
          window.location.href = "/login";
        }
        throw new Error(
          error.response?.data?.message || "Gagal mengambil statistik dashboard"
        );
      }
      throw error;
    }
  }

  /**
   * Get upcoming consultations
   */
  async getUpcomingConsultations(): Promise<{
    success: boolean;
    data: UpcomingConsultation[];
  }> {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/dashboard/upcoming-consultations`,
        this.getAuthHeader()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          TokenManager.logout();
          window.location.href = "/login";
        }
        throw new Error(
          error.response?.data?.message || "Gagal mengambil jadwal konsultasi"
        );
      }
      throw error;
    }
  }

  /**
   * Get recent chats
   */
  async getRecentChats(): Promise<{
    success: boolean;
    data: RecentChat[];
  }> {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/dashboard/recent-chats`,
        this.getAuthHeader()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          TokenManager.logout();
          window.location.href = "/login";
        }
        throw new Error(
          error.response?.data?.message || "Gagal mengambil data chat"
        );
      }
      throw error;
    }
  }

  /**
   * Get weekly consultations data for chart
   */
  async getWeeklyConsultations(params: WeeklyConsultationsParams): Promise<{
    success: boolean;
    data: number[];
  }> {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/dashboard/weekly-consultations`,
        {
          params,
          ...this.getAuthHeader(),
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          TokenManager.logout();
          window.location.href = "/login";
        }
        throw new Error(
          error.response?.data?.message ||
            "Gagal mengambil data konsultasi mingguan"
        );
      }
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
