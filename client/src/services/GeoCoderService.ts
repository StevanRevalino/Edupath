// src/services/geocodeService.ts
import axios from "axios";
import TokenManager from "../utils/tokenManager";

const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

export async function geocode(query: string) {
  const token = TokenManager.getToken();
  const res = await axios.post(
    `${API_URL}/api/geocode`,
    { query },
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  return res.data as {
    success: boolean;
    source?: "live" | "cache";
    data: null | {
      latitude: number;
      longitude: number;
      formattedAddress: string;
    };
  };
}