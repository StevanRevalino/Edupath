import { ChatRepository } from "../repositories/chatRepository";
import { ConsultationRepository } from "../repositories/consultationRepository";

export class ChatService {
  private chatRepository: ChatRepository;
  private consultationRepository: ConsultationRepository;

  constructor() {
    this.chatRepository = new ChatRepository();
    this.consultationRepository = new ConsultationRepository();
  }

  // Get or create chat room for a consultation
  async getOrCreateChatRoom(consultationId: string, userId: string) {
    try {
      // First, get the consultation details
      const consultation = await this.consultationRepository.findById(
        consultationId
      );

      if (!consultation) {
        throw new Error("Consultation not found");
      }

      // Check if user has access to this consultation
      if (
        consultation.murid_id !== userId &&
        consultation.admin_id !== userId
      ) {
        throw new Error("You don't have access to this consultation");
      }

      // Check if chat room already exists
      let chatRoom = await this.chatRepository.findChatRoomByConsultationId(
        consultationId
      );

      // If chat room doesn't exist, create it
      if (!chatRoom) {
        chatRoom = await this.chatRepository.createChatRoom({
          consultation_id: consultationId,
          murid_id: consultation.murid_id,
          admin_id: consultation.admin_id,
        });
      }

      return chatRoom;
    } catch (error) {
      console.error("Error in getOrCreateChatRoom:", error);
      throw error;
    }
  }

  // Get all active chat rooms for an admin
  async getChatRoomsForAdmin(adminId: string) {
    try {
      const chatRooms = await this.chatRepository.findChatRoomsByAdminId(
        adminId
      );

      const roomsWithUnreadCounts = await Promise.all(
        chatRooms.map(async (room: any) => {
          const unreadCount = await this.chatRepository.countUnreadMessages(
            room.room_id,
            adminId
          );

          return {
            room_id: room.room_id,
            user_id: room.murid.user_id,
            firstname: room.murid.firstname,
            lastname: room.murid.lastname,
            kelas: room.murid.kelas,
            lastMessage: room.messages[0]?.message || room.consultation.topic,
            lastMessageTime: room.messages[0]
              ? room.messages[0].created_at.toISOString()
              : room.created_at.toISOString(),
            unreadCount: room._count.messages,
            consultation: room.consultation,
          };
        })
      );

      return roomsWithUnreadCounts;
    } catch (error) {
      console.error("Error in getChatRoomsForAdmin:", error);
      throw error;
    }
  }

  // Get chat messages for a specific room
  async getChatMessages(roomId: string, userId: string) {
    try {
      // Verify user has access to this chat room
      const chatRoom = await this.chatRepository.findChatRoomByIdAndUserId(
        roomId,
        userId
      );

      if (!chatRoom) {
        throw new Error("Access denied or chat room not found");
      }

      const messages = await this.chatRepository.findMessagesByRoomId(roomId);

      // Mark messages as read for the current user
      await this.chatRepository.markMessagesAsRead(roomId, userId);

      return messages.map((msg: any) => ({
        id: msg.message_id,
        message: msg.message,
        senderId: msg.sender_id,
        senderName: `${msg.sender.firstname} ${msg.sender.lastname}`,
        timestamp: msg.created_at.toISOString(),
        isFromAdmin: msg.sender.role === "ADMIN",
        isRead: msg.is_read,
      }));
    } catch (error) {
      console.error("Error in getChatMessages:", error);
      throw error;
    }
  }

  // Send a new message
  async sendMessage(roomId: string, senderId: string, message: string) {
    try {
      // Verify user has access to this chat room
      const chatRoom = await this.chatRepository.findChatRoomByIdAndUserId(
        roomId,
        senderId
      );

      if (!chatRoom) {
        throw new Error("Access denied or chat room not found");
      }

      const newMessage = await this.chatRepository.createMessage({
        room_id: roomId,
        sender_id: senderId,
        message: message.trim(),
      });

      // Update chat room's updated_at timestamp
      await this.chatRepository.updateChatRoomTimestamp(roomId);

      // ✨ Create notification if message is from admin to student
      if (newMessage.sender.role === "ADMIN") {
        const receiverId = chatRoom.murid_id; // Student is the receiver

        // Only create notification if message is not a Zoom meeting message
        const isZoomMessage = message.includes("🎥 Zoom Meeting Dibuat");

        if (!isZoomMessage) {
          await this.chatRepository.createNotification({
            user_id: receiverId,
            type: "CHAT_MESSAGE",
            title: "Pesan Baru dari Admin",
            message: `${newMessage.sender.firstname} ${
              newMessage.sender.lastname
            }: ${message.slice(0, 50)}${message.length > 50 ? "..." : ""}`,
            related_id: chatRoom.consultation_id,
          });
        }
      }

      return {
        id: newMessage.message_id,
        message: newMessage.message,
        senderId: newMessage.sender_id,
        senderName: `${newMessage.sender.firstname} ${newMessage.sender.lastname}`,
        timestamp: newMessage.created_at.toISOString(),
        isFromAdmin: newMessage.sender.role === "ADMIN",
        isRead: newMessage.is_read,
      };
    } catch (error) {
      console.error("Error in sendMessage:", error);
      throw error;
    }
  }

  // Get students with accepted AND ACTIVE consultations (for live chat user list)
  async getStudentsWithAcceptedConsultations() {
    try {
      const now = new Date();
      // Calculate time 1 hour ago (consultation should have started within last 1 hour)
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const acceptedConsultations =
        await this.consultationRepository.findActiveAcceptedConsultations(
          oneHourAgo,
          now
        );

      return acceptedConsultations.map((consultation: any) => {
        return {
          user_id: consultation.murid.user_id,
          firstname: consultation.murid.firstname,
          lastname: consultation.murid.lastname,
          kelas: consultation.murid.kelas,
          consultation_id: consultation.consultation_id,
          consultation_date: consultation.consultation_date?.toISOString(),
          latestConsultationTopic: consultation.topic,
          room_id: consultation.chatRoom?.room_id,
          lastMessage:
            consultation.chatRoom?.messages[0]?.message || consultation.topic,
          lastMessageTime:
            consultation.chatRoom?.messages[0]?.created_at.toISOString() ||
            consultation.created_at.toISOString(),
          unreadCount: consultation.chatRoom?._count.messages || 0,
        };
      });
    } catch (error) {
      console.error("Error in getStudentsWithAcceptedConsultations:", error);
      throw error;
    }
  }

  // ✨ NEW: Get chat history (inactive consultations)
  async getChatHistory() {
    try {
      const inactiveConsultations =
        await this.consultationRepository.findInactiveConsultationsWithChat();

      return inactiveConsultations.map((consultation: any) => ({
        consultation_id: consultation.consultation_id,
        user_id: consultation.murid.user_id,
        firstname: consultation.murid.firstname,
        lastname: consultation.murid.lastname,
        kelas: consultation.murid.kelas,
        admin_name: `${consultation.admin.firstname} ${consultation.admin.lastname}`,
        topic: consultation.topic,
        consultation_date: consultation.consultation_date.toISOString(),
        status: consultation.status,
        room_id: consultation.chatRoom?.room_id,
        lastMessage: consultation.chatRoom?.messages[0]?.message || "",
        lastMessageTime:
          consultation.chatRoom?.messages[0]?.created_at.toISOString() ||
          consultation.created_at.toISOString(),
        messageCount: consultation.chatRoom?._count.messages || 0,
      }));
    } catch (error) {
      console.error("Error in getChatHistory:", error);
      throw error;
    }
  }

  // Get unread messages count for admin
  async getUnreadCountForAdmin(adminId: string) {
    try {
      const chatRooms =
        await this.chatRepository.findChatRoomsWithUnreadForAdmin(adminId);

      // Count total unread messages
      const unreadCount = chatRooms.reduce(
        (total: number, room: any) => total + room.messages.length,
        0
      );

      return {
        unreadCount,
        roomsWithUnread: chatRooms
          .filter((room: any) => room.messages.length > 0)
          .map((room: any) => ({
            room_id: room.room_id,
            unreadCount: room.messages.length,
          })),
      };
    } catch (error) {
      console.error("Error in getUnreadCountForAdmin:", error);
      throw error;
    }
  }
}
