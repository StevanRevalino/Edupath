/**
 * Holland Assessment Handler
 * API calls untuk Holland career assessment
 */

import axios from "axios";
import TokenManager from "../utils/tokenManager";
import type {
  HollandQuestion,
  HollandResponse,
  AssessmentResult,
  AssessmentHistory,
} from "../types/holland";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

class HollandHandler {
  private handleAuthError(status: number) {
    if (status === 401 || status === 403) {
      TokenManager.logout();
      window.location.href = "/login";
    }
  }

  /**
   * Get all assessment questions
   */
  async getQuestions(): Promise<HollandQuestion[]> {
    try {
      const token = TokenManager.getToken();
      const response = await axios.get(`${API_URL}/api/holland/questions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        this.handleAuthError(error.response.status);
      }
      throw error;
    }
  }

  /**
   * Submit assessment responses
   */
  async submitAssessment(
    responses: HollandResponse[]
  ): Promise<AssessmentResult> {
    try {
      const token = TokenManager.getToken();
      const response = await axios.post(
        `${API_URL}/api/holland/submit`,
        { responses },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        this.handleAuthError(error.response.status);
      }
      throw error;
    }
  }

  /**
   * Get assessment history
   */
  async getAssessmentHistory(): Promise<AssessmentHistory[]> {
    try {
      const token = TokenManager.getToken();
      const response = await axios.get(`${API_URL}/api/holland/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        this.handleAuthError(error.response.status);
      }
      throw error;
    }
  }

  /**
   * Get detailed assessment result by ID
   */
  async getAssessmentResult(assessmentId: string): Promise<AssessmentResult> {
    try {
      const token = TokenManager.getToken();
      const response = await axios.get(
        `${API_URL}/api/holland/result/${assessmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        this.handleAuthError(error.response.status);
      }
      throw error;
    }
  }
}

export const hollandHandler = new HollandHandler();
