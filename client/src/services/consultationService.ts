import TokenManager from "../utils/tokenManager";

const API_BASE_URL = "http://localhost:3000/api"; // Adjust based on your server configuration

export interface CreateConsultationRequest {
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
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

class ConsultationService {
  private getAuthHeaders() {
    const token = TokenManager.getToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async createConsultation(
    consultationData: CreateConsultationRequest
  ): Promise<ApiResponse<Consultation>> {
    try {
      const response = await fetch(`${API_BASE_URL}/consultations`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(consultationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create consultation");
      }

      return data;
    } catch (error) {
      console.error("Error creating consultation:", error);
      throw error;
    }
  }

  async getConsultations(): Promise<ApiResponse<Consultation[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/consultations`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch consultations");
      }

      return data;
    } catch (error) {
      console.error("Error fetching consultations:", error);
      throw error;
    }
  }

  async getConsultationsByStatus(
    status: string
  ): Promise<ApiResponse<Consultation[]>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/consultations/status/${status}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch consultations");
      }

      return data;
    } catch (error) {
      console.error("Error fetching consultations by status:", error);
      throw error;
    }
  }
}

export const consultationService = new ConsultationService();
