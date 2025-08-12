import axios, { AxiosInstance } from "axios";

interface PDDIKTIConfig {
  baseURL?: string;
  timeout?: number;
}

interface SearchResponse {
  data?: any;
  [key: string]: any;
}

export class PDDIKTIClient {
  private client: AxiosInstance;
  private readonly baseURL: string;

  constructor(config?: PDDIKTIConfig) {
    this.baseURL =
      config?.baseURL ||
      process.env.PDDIKTI_BASE_URL ||
      "https://api-pddikti.kemdiktisaintek.go.id";

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: config?.timeout || 10000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Setup interceptors
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add any request modifications here (auth headers, logging, etc.)
        console.log(
          `PDDIKTI Request: ${config.method?.toUpperCase()} ${config.url}`
        );
        return config;
      },
      (error) => {
        console.error("PDDIKTI Request Error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error("PDDIKTI Response Error:", error.message);
        return Promise.reject(error);
      }
    );
  }

  private sanitizeKeyword(keyword: string): string {
    return encodeURIComponent(keyword.trim());
  }

  /**
   * Search for Perguruan Tinggi (Universities)
   */
  async searchPerguruanTinggi(keyword: string): Promise<SearchResponse> {
    try {
      const sanitized = this.sanitizeKeyword(keyword);
      const response = await this.client.get(`/pencarian/pt/${sanitized}`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to search Perguruan Tinggi: ${error.message}`);
    }
  }

  /**
   * Get detailed information about a Perguruan Tinggi
   */
  async getPerguruanTinggiDetail(idPt: string): Promise<SearchResponse> {
    try {
      const sanitized = encodeURIComponent(idPt);
      const response = await this.client.get(`/pt/detail/${sanitized}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to get Perguruan Tinggi detail: ${error.message}`
      );
    }
  }

  /**
   * Search for Program Studi (Study Programs)
   */
  async searchProdi(keyword: string): Promise<SearchResponse> {
    try {
      const sanitized = this.sanitizeKeyword(keyword);
      const response = await this.client.get(`/pencarian/prodi/${sanitized}`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to search Program Studi: ${error.message}`);
    }
  }

  /**
   * Get detailed information about a Program Studi
   */
  async getProdiDetail(idProdi: string): Promise<SearchResponse> {
    try {
      const sanitized = encodeURIComponent(idProdi);
      const response = await this.client.get(`/prodi/detail/${sanitized}`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get Program Studi detail: ${error.message}`);
    }
  }

  /**
   * Get base URL being used
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Update timeout configuration
   */
  setTimeout(timeout: number): void {
    this.client.defaults.timeout = timeout;
  }
}

// Create default instance for backward compatibility
const defaultClient = new PDDIKTIClient();

// Export functions for backward compatibility
export const searchPerguruanTinggi = (keyword: string) =>
  defaultClient.searchPerguruanTinggi(keyword);

export const getPerguruanTinggiDetail = (idPt: string) =>
  defaultClient.getPerguruanTinggiDetail(idPt);

export const searchProdi = (keyword: string) =>
  defaultClient.searchProdi(keyword);

export const getProdiDetail = (idProdi: string) =>
  defaultClient.getProdiDetail(idProdi);

// Export the default instance
export default defaultClient;
