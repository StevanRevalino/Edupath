import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

interface LoginResponse {
  token: string;
  user: {
    user_id: string;
    email: string;
    role: "ADMIN" | "USER";
    firstname: string;
    lastname: string;
    kelas: number | null;
  };
}

interface RegisterData {
  firstname: string;
  lastname: string;
  kelas: number;
  email: string;
  password: string;
}

interface SendOtpResponse {
  otp: string;
  message: string;
}

interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

class AuthService {
  async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; data: LoginResponse }> {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      throw error;
    }
  }

  async register(data: RegisterData): Promise<{ success: boolean }> {
    try {
      await axios.post(`${API_URL}/api/auth/register`, {
        firstname: data.firstname,
        lastname: data.lastname,
        kelas: Number(data.kelas),
        email: data.email,
        password: data.password,
      });
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  async sendOtp(
    email: string
  ): Promise<{ success: boolean; data: SendOtpResponse }> {
    try {
      const response = await axios.post(`${API_URL}/api/auth/send-otp`, {
        email,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      throw error;
    }
  }

  async sendVerificationOtp(
    email: string
  ): Promise<{ success: boolean; data: SendOtpResponse }> {
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/send-verification-otp`,
        {
          email,
        }
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<{ success: boolean }> {
    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email: data.email,
        otp: data.otp,
        newPassword: data.newPassword,
      });
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}

export const authService = new AuthService();
