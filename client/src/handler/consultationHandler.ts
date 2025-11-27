import axios from "axios";
import TokenManager from "../utils/tokenManager";

const API_URL = import.meta.env.VITE_API_URL;

export interface CreateConsultationRequest {
  murid_id: string;
  admin_id: string;
  topic: string;
  consultation_date: string; // ISO string format
  notes?: string;
}

export interface Consultation {
  consultation_id: string;
  murid_id: string;
  admin_id: string;
  topic: string;
  consultation_date: string;
  consultation_time: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED";
  is_active: boolean;
  description?: string; // Catatan dari murid
  admin_notes?: string; // Catatan dari admin (reschedule/decline)
  notes?: string;
  created_at: string;
  updated_at: string;
  murid?: {
    firstname: string;
    lastname: string;
    email: string;
    kelas: number | null;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ChatMessage {
  id: string;
  message: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isFromAdmin: boolean;
}

export interface ChatRoom {
  room_id: string;
  consultation_id: string;
}

class ConsultationHandler {
  private handleAuthError(status: number) {
    if (status === 401 || status === 403) {
      TokenManager.logout();
      window.location.href = "/login";
    }
  }

  async autoCompleteExpired(): Promise<{ success: boolean }> {
    try {
      const token = TokenManager.getToken();
      await axios.post(
        `${API_URL}/api/consultations/auto-complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return { success: true };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        this.handleAuthError(error.response.status);
      }
      throw error;
    }
  }

  async getConsultations(): Promise<ApiResponse<Consultation[]>> {
    try {
      const token = TokenManager.getToken();
      const response = await axios.get(`${API_URL}/api/consultations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        this.handleAuthError(error.response.status);
      }
      throw error;
    }
  }

  async updateStatus(
    consultationId: string,
    status: string,
    adminNotes?: string
  ): Promise<ApiResponse<Consultation>> {
    try {
      const token = TokenManager.getToken();
      const response = await axios.patch(
        `${API_URL}/api/consultations/${consultationId}/status`,
        { status, admin_notes: adminNotes },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        this.handleAuthError(error.response.status);
      }
      throw error;
    }
  }

  async reschedule(
    consultationId: string,
    newDate: string,
    rescheduleReason: string
  ): Promise<ApiResponse<Consultation>> {
    try {
      const token = TokenManager.getToken();
      const response = await axios.patch(
        `${API_URL}/api/consultations/${consultationId}/reschedule`,
        { newDate, rescheduleReason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        this.handleAuthError(error.response.status);
      }
      throw error;
    }
  }

  async cancelConsultation(
    consultationId: string,
    cancelReason?: string
  ): Promise<{ success: boolean }> {
    try {
      const token = TokenManager.getToken();

      if (cancelReason) {
        // PATCH with reason (for ACCEPTED consultations)
        await axios.patch(
          `${API_URL}/api/consultations/${consultationId}/cancel`,
          { cancelReason },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // DELETE (for PENDING consultations or old behavior)
        await axios.delete(`${API_URL}/api/consultations/${consultationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }

      return { success: true };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        this.handleAuthError(error.response.status);
      }
      throw error;
    }
  }

  async getChatRoom(consultationId: string): Promise<ApiResponse<ChatRoom>> {
    try {
      const token = TokenManager.getToken();
      const response = await axios.get(
        `${API_URL}/api/chat/room/${consultationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        this.handleAuthError(error.response.status);
      }
      throw error;
    }
  }

  async getChatMessages(roomId: string): Promise<ApiResponse<ChatMessage[]>> {
    try {
      const token = TokenManager.getToken();
      const response = await axios.get(
        `${API_URL}/api/chat/messages/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        this.handleAuthError(error.response.status);
      }
      throw error;
    }
  }

  // Legacy methods for backward compatibility
  async createConsultation(
    consultationData: CreateConsultationRequest
  ): Promise<ApiResponse<Consultation>> {
    try {
      const token = TokenManager.getToken();
      const response = await axios.post(
        `${API_URL}/api/consultations`,
        consultationData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        this.handleAuthError(error.response.status);
      }
      throw error;
    }
  }

  async getConsultationsByStatus(
    status: string
  ): Promise<ApiResponse<Consultation[]>> {
    try {
      const token = TokenManager.getToken();
      const response = await axios.get(
        `${API_URL}/api/consultations/status/${status}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        this.handleAuthError(error.response.status);
      }
      throw error;
    }
  }

  async endConsultation(
    consultation_id: string
  ): Promise<ApiResponse<Consultation>> {
    try {
      const token = TokenManager.getToken();
      const response = await axios.patch(
        `${API_URL}/api/consultations/${consultation_id}/end`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        this.handleAuthError(error.response.status);
      }
      throw error;
    }
  }

  async hasActiveConsultation(): Promise<boolean> {
    try {
      const response = await this.getConsultations();
      if (response.success && response.data) {
        return response.data.some((c) => c.is_active);
      }
      return false;
    } catch (error) {
      console.error("Error checking active consultation:", error);
      return false;
    }
  }

  async getBookedSlotsForDate(
    date: string | Date,
    adminId?: string
  ): Promise<ApiResponse<Array<{ startTime: string; endTime: string }>>> {
    try {
      const token = TokenManager.getToken();
      const dateString = typeof date === "string" ? date : date.toISOString();

      let url = `${API_URL}/api/consultations/booked-slots?date=${dateString}`;
      if (adminId) {
        url += `&adminId=${adminId}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        this.handleAuthError(error.response.status);
      }
      throw error;
    }
  }
}

export const consultationHandler = new ConsultationHandler();
