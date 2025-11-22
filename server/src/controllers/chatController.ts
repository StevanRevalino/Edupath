import { Request, Response } from "express";
import { ChatService } from "../services/chatService";

export class ChatController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();

    // Bind methods to preserve 'this' context
    this.getChatUsers = this.getChatUsers.bind(this);
    this.getChatRoom = this.getChatRoom.bind(this);
    this.getChatMessages = this.getChatMessages.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.getAdminChatRooms = this.getAdminChatRooms.bind(this);
    this.getChatHistory = this.getChatHistory.bind(this);
    this.getUnreadCount = this.getUnreadCount.bind(this);
  }

  // Get chat users for admin (students with accepted consultations)
  async getChatUsers(req: Request, res: Response) {
    try {
      const students =
        await this.chatService.getStudentsWithAcceptedConsultations();

      return res.status(200).json({
        success: true,
        message: "Berhasil mengambil data chat users",
        data: students,
        count: students.length,
      });
    } catch (error: any) {
      console.error("Error in getChatUsers:", error);
      return res.status(500).json({
        success: false,
        message:
          error.message || "Terjadi kesalahan saat mengambil data chat users",
      });
    }
  }

  // Get or create chat room for a consultation
  async getChatRoom(req: Request, res: Response) {
    try {
      const { consultationId } = req.params;
      const userId = req.user?.user_id;

      if (!consultationId) {
        return res.status(400).json({
          success: false,
          message: "Consultation ID is required",
        });
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const chatRoom = await this.chatService.getOrCreateChatRoom(
        consultationId,
        userId
      );

      return res.status(200).json({
        success: true,
        message: "Berhasil mengambil chat room",
        data: chatRoom,
      });
    } catch (error: any) {
      console.error("Error in getChatRoom:", error);

      if (error.message === "Consultation not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message === "You don't have access to this consultation") {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message || "Terjadi kesalahan saat mengambil chat room",
      });
    }
  }

  // Get chat messages for a room
  async getChatMessages(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      const userId = req.user?.user_id;

      if (!roomId) {
        return res.status(400).json({
          success: false,
          message: "Room ID is required",
        });
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const messages = await this.chatService.getChatMessages(roomId, userId);

      return res.status(200).json({
        success: true,
        message: "Berhasil mengambil pesan chat",
        data: messages,
        count: messages.length,
      });
    } catch (error: any) {
      console.error("Error in getChatMessages:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Terjadi kesalahan saat mengambil pesan chat",
      });
    }
  }

  // Send a new message
  async sendMessage(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      const { message } = req.body;
      const userId = req.user?.user_id;

      if (!roomId) {
        return res.status(400).json({
          success: false,
          message: "Room ID is required",
        });
      }

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: "Message is required",
        });
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const newMessage = await this.chatService.sendMessage(
        roomId,
        userId,
        message
      );

      return res.status(201).json({
        success: true,
        message: "Pesan berhasil dikirim",
        data: newMessage,
      });
    } catch (error: any) {
      console.error("Error in sendMessage:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Terjadi kesalahan saat mengirim pesan",
      });
    }
  }

  // Get chat rooms for admin
  async getAdminChatRooms(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const chatRooms = await this.chatService.getChatRoomsForAdmin(userId);

      return res.status(200).json({
        success: true,
        message: "Berhasil mengambil chat rooms",
        data: chatRooms,
        count: chatRooms.length,
      });
    } catch (error: any) {
      console.error("Error in getAdminChatRooms:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Terjadi kesalahan saat mengambil chat rooms",
      });
    }
  }

  // ✨ NEW: Get chat history (inactive consultations)
  async getChatHistory(req: Request, res: Response) {
    try {
      const chatHistory = await this.chatService.getChatHistory();

      return res.status(200).json({
        success: true,
        message: "Berhasil mengambil chat history",
        data: chatHistory,
        count: chatHistory.length,
      });
    } catch (error: any) {
      console.error("Error in getChatHistory:", error);
      return res.status(500).json({
        success: false,
        message:
          error.message || "Terjadi kesalahan saat mengambil chat history",
      });
    }
  }

  // ✨ NEW: Get unread messages count for admin
  async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const data = await this.chatService.getUnreadCountForAdmin(userId);

      return res.status(200).json({
        success: true,
        message: "Berhasil mengambil unread count",
        data,
      });
    } catch (error: any) {
      console.error("Error in getUnreadCount:", error);
      return res.status(500).json({
        success: false,
        message:
          error.message || "Terjadi kesalahan saat mengambil unread count",
      });
    }
  }
}
