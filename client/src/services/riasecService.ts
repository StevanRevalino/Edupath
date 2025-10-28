/**
 * RIASEC Assessment Service
 * API calls untuk RIASEC career assessment
 */

import axios from "axios";
import TokenManager from "../utils/tokenManager";
import type {
  RiasecQuestion,
  RiasecResponse,
  AssessmentResult,
  AssessmentHistory,
} from "../types/riasec";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Get all assessment questions
 */
export const getQuestions = async (): Promise<RiasecQuestion[]> => {
  const token = TokenManager.getToken();
  const response = await axios.get(`${API_URL}/api/riasec/questions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data;
};

/**
 * Submit assessment responses
 */
export const submitAssessment = async (
  responses: RiasecResponse[]
): Promise<AssessmentResult> => {
  const token = TokenManager.getToken();
  const response = await axios.post(
    `${API_URL}/api/riasec/submit`,
    { responses },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data.data;
};

/**
 * Get assessment history
 */
export const getAssessmentHistory = async (): Promise<AssessmentHistory[]> => {
  const token = TokenManager.getToken();
  const response = await axios.get(`${API_URL}/api/riasec/history`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data;
};

/**
 * Get detailed assessment result by ID
 */
export const getAssessmentResult = async (
  assessmentId: string
): Promise<AssessmentResult> => {
  const token = TokenManager.getToken();
  const response = await axios.get(
    `${API_URL}/api/riasec/result/${assessmentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.data;
};
