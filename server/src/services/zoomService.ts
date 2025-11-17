import axios from "axios";

interface ZoomMeetingConfig {
  topic: string;
  start_time: string; // ISO 8601 format
  duration: number; // in minutes
  timezone: string;
  password?: string;
  agenda?: string;
}

interface ZoomMeetingResponse {
  id: number;
  uuid: string;
  host_id: string;
  topic: string;
  start_time: string;
  duration: number;
  timezone: string;
  join_url: string;
  password: string;
  start_url: string;
}

class ZoomService {
  private accountId: string;
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.accountId = process.env.ZOOM_ACCOUNT_ID || "";
    this.clientId = process.env.ZOOM_CLIENT_ID || "";
    this.clientSecret = process.env.ZOOM_CLIENT_SECRET || "";

    if (!this.accountId || !this.clientId || !this.clientSecret) {
      console.warn(
        "⚠️ Zoom credentials not configured. Zoom integration will not work."
      );
    }
  }

  /**
   * Get Zoom OAuth Access Token using Server-to-Server OAuth
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const credentials = Buffer.from(
        `${this.clientId}:${this.clientSecret}`
      ).toString("base64");

      const response = await axios.post(
        `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${this.accountId}`,
        {},
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry to 5 minutes before actual expiry for safety
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

      return this.accessToken!;
    } catch (error: any) {
      console.error(
        "❌ Error getting Zoom access token:",
        error.response?.data || error.message
      );
      throw new Error("Failed to authenticate with Zoom API");
    }
  }

  /**
   * Create a Zoom Meeting
   */
  async createMeeting(config: ZoomMeetingConfig): Promise<ZoomMeetingResponse> {
    try {
      const token = await this.getAccessToken();

      // Get user ID (usually 'me' for the authenticated user)
      const userId = "me";

      const meetingData = {
        topic: config.topic,
        type: 2, // Scheduled meeting
        start_time: config.start_time,
        duration: config.duration,
        timezone: config.timezone,
        password: config.password || this.generatePassword(),
        agenda: config.agenda || "",
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          watermark: false,
          use_pmi: false,
          approval_type: 2, // No registration required
          audio: "both",
          auto_recording: "none",
          waiting_room: true,
        },
      };

      const response = await axios.post(
        `https://api.zoom.us/v2/users/${userId}/meetings`,
        meetingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        id: response.data.id,
        uuid: response.data.uuid,
        host_id: response.data.host_id,
        topic: response.data.topic,
        start_time: response.data.start_time,
        duration: response.data.duration,
        timezone: response.data.timezone,
        join_url: response.data.join_url,
        password: response.data.password,
        start_url: response.data.start_url,
      };
    } catch (error: any) {
      console.error(
        "❌ Error creating Zoom meeting:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to create Zoom meeting"
      );
    }
  }

  /**
   * Get Meeting Details
   */
  async getMeeting(meetingId: number): Promise<ZoomMeetingResponse> {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `https://api.zoom.us/v2/meetings/${meetingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Error getting Zoom meeting:",
        error.response?.data || error.message
      );
      throw new Error("Failed to get Zoom meeting details");
    }
  }

  /**
   * Delete a Zoom Meeting
   */
  async deleteMeeting(meetingId: number): Promise<void> {
    try {
      const token = await this.getAccessToken();

      await axios.delete(`https://api.zoom.us/v2/meetings/${meetingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      console.error(
        "❌ Error deleting Zoom meeting:",
        error.response?.data || error.message
      );
      throw new Error("Failed to delete Zoom meeting");
    }
  }

  /**
   * Update a Zoom Meeting
   */
  async updateMeeting(
    meetingId: number,
    updates: Partial<ZoomMeetingConfig>
  ): Promise<void> {
    try {
      const token = await this.getAccessToken();

      await axios.patch(
        `https://api.zoom.us/v2/meetings/${meetingId}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error: any) {
      console.error(
        "❌ Error updating Zoom meeting:",
        error.response?.data || error.message
      );
      throw new Error("Failed to update Zoom meeting");
    }
  }

  /**
   * Generate random 6-digit password
   */
  private generatePassword(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Check if Zoom is configured
   */
  isConfigured(): boolean {
    return !!(this.accountId && this.clientId && this.clientSecret);
  }
}

export default new ZoomService();
