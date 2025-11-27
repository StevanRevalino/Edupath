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

interface UpdateProfileData {
  firstname: string;
  lastname: string;
  kelas: number;
}

type OtpType = "verification" | "reset";

class AuthHandler {
  /**
   * Unified method untuk mengirim OTP
   * @param email - Email tujuan
   * @param type - Jenis OTP: 'verification' untuk registrasi, 'reset' untuk reset password
   */
  async sendOtp(
    email: string,
    type: OtpType = "reset"
  ): Promise<{ success: boolean; data: SendOtpResponse }> {
    try {
      const endpoint =
        type === "verification"
          ? `${API_URL}/api/auth/send-verification-otp`
          : `${API_URL}/api/auth/send-otp`;

      const response = await axios.post(endpoint, { email });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * @deprecated Use sendOtp(email, 'verification') instead
   */
  async sendVerificationOtp(
    email: string
  ): Promise<{ success: boolean; data: SendOtpResponse }> {
    return this.sendOtp(email, "verification");
  }

  /**
   * @deprecated Use sendOtp(email, 'reset') instead
   */
  async sendResetOtp(
    email: string
  ): Promise<{ success: boolean; data: SendOtpResponse }> {
    return this.sendOtp(email, "reset");
  }
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

  async updateProfile(
    data: UpdateProfileData,
    token: string
  ): Promise<{ success: boolean }> {
    try {
      await axios.put(`${API_URL}/api/auth/update-profile`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return { success: true };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          // Let the caller handle auth errors
          throw new Error("AUTH_ERROR");
        }
      }
      throw error;
    }
  }
}

export const authHandler = new AuthHandler();
export type { UpdateProfileData };
