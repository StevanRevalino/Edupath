import axios from "axios";
import TokenManager from "../utils/tokenManager";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Message {
  message_id: string;
  message: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isFromAdmin: boolean;
}

// Chat service for real-time chat functionality
class ChatService {
  private pollingInterval: NodeJS.Timeout | null = null;
  private messageHandlers: ((messages: Message[]) => void)[] = [];
  private errorHandlers: ((error: string) => void)[] = [];
  private currentRoomId: string | null = null;

  // Get or create chat room for consultation
  async getOrCreateRoom(consultationId: string): Promise<string | null> {
    try {
      const token = TokenManager.getToken();
      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await axios.get(
        `${API_URL}/api/chat/room/${consultationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success && response.data.data.room_id) {
        this.currentRoomId = response.data.data.room_id;
        return response.data.data.room_id;
      }
      throw new Error("Failed to get room ID");
    } catch (error) {
      console.error("Error getting room:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          this.notifyErrorHandlers("Session expired. Silakan login ulang.");
          TokenManager.logout();
          window.location.href = "/login";
        } else {
          this.notifyErrorHandlers("Gagal membuat ruang chat");
        }
      } else {
        this.notifyErrorHandlers("Gagal membuat ruang chat");
      }
      return null;
    }
  }

  // Load messages from room
  async loadMessages(roomId: string): Promise<Message[]> {
    try {
      const token = TokenManager.getToken();
      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await axios.get(
        `${API_URL}/api/chat/messages/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        return response.data.data || [];
      }
      throw new Error("Failed to load messages");
    } catch (error) {
      console.error("Error loading messages:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          this.notifyErrorHandlers("Session expired. Silakan login ulang.");
          TokenManager.logout();
          window.location.href = "/login";
        } else {
          this.notifyErrorHandlers("Gagal memuat pesan");
        }
      } else {
        this.notifyErrorHandlers("Gagal memuat pesan");
      }
      return [];
    }
  }

  // Send message to room
  async sendMessage(roomId: string, message: string): Promise<Message | null> {
    try {
      const token = TokenManager.getToken();
      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await axios.post(
        `${API_URL}/api/chat/messages/${roomId}`,
        {
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success && response.data.data) {
        // Return the new message data directly from the response
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error sending message:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          this.notifyErrorHandlers("Session expired. Silakan login ulang.");
          TokenManager.logout();
          window.location.href = "/login";
        } else {
          this.notifyErrorHandlers("Gagal mengirim pesan");
        }
      } else {
        this.notifyErrorHandlers("Gagal mengirim pesan");
      }
      return null;
    }
  }

  // Start polling for new messages
  startPolling(roomId: string, intervalMs: number = 3000) {
    // Reduced from 5s to 3s for better responsiveness
    this.stopPolling();
    this.currentRoomId = roomId;

    this.pollingInterval = setInterval(async () => {
      try {
        const messages = await this.loadMessages(roomId);
        this.notifyMessageHandlers(messages);
      } catch (error) {
        console.error("Error during polling:", error);
        // Don't notify error handlers for polling errors to avoid spam
      }
    }, intervalMs);
  }

  // Stop polling for messages
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Subscribe to message updates
  onMessages(handler: (messages: Message[]) => void) {
    this.messageHandlers.push(handler);
  }

  // Subscribe to error notifications
  onError(handler: (error: string) => void) {
    this.errorHandlers.push(handler);
  }

  // Remove message handler
  removeMessageHandler(handler: (messages: Message[]) => void) {
    this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
  }

  // Remove error handler
  removeErrorHandler(handler: (error: string) => void) {
    this.errorHandlers = this.errorHandlers.filter((h) => h !== handler);
  }

  private notifyMessageHandlers(messages: Message[]) {
    this.messageHandlers.forEach((handler) => handler(messages));
  }

  private notifyErrorHandlers(error: string) {
    this.errorHandlers.forEach((handler) => handler(error));
  }

  // Clean up when service is no longer needed
  disconnect() {
    this.stopPolling();
    this.messageHandlers = [];
    this.errorHandlers = [];
    this.currentRoomId = null;
  }

  // Check if currently polling
  isPolling(): boolean {
    return this.pollingInterval !== null;
  }

  // Add message optimistically to avoid reload
  addMessageOptimistic(message: Message) {
    this.notifyMessageHandlers([message]); // This will trigger handlers with new message
  }

  // Get current room ID
  getCurrentRoomId(): string | null {
    return this.currentRoomId;
  }
}

export const chatService = new ChatService();
export default ChatService;
