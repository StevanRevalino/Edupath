import axios from "axios";
import TokenManager from "../utils/tokenManager";

const API_BASE_URL = "http://localhost:5000/api"; // Adjust based on your server configuration

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = TokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";
  is_active: boolean;
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
  async createConsultation(
    consultationData: CreateConsultationRequest
  ): Promise<ApiResponse<Consultation>> {
    try {
      const response = await axiosInstance.post(
        "/consultations",
        consultationData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating consultation:", error);
      throw error;
    }
  }

  async getConsultations(): Promise<ApiResponse<Consultation[]>> {
    try {
      const response = await axiosInstance.get("/consultations");
      return response.data;
    } catch (error) {
      console.error("Error fetching consultations:", error);
      throw error;
    }
  }

  async getConsultationsByStatus(
    status: string
  ): Promise<ApiResponse<Consultation[]>> {
    try {
      const response = await axiosInstance.get(
        `/consultations/status/${status}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching consultations by status:", error);
      throw error;
    }
  }

  async endConsultation(
    consultation_id: string
  ): Promise<ApiResponse<Consultation>> {
    try {
      const response = await axiosInstance.patch(
        `/consultations/${consultation_id}/end`
      );
      return response.data;
    } catch (error) {
      console.error("Error ending consultation:", error);
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
}

export const consultationService = new ConsultationService();
