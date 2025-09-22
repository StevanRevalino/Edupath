import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ChatService {
  // Get or create chat room for a consultation
  async getOrCreateChatRoom(consultationId: string) {
    try {
      // First, get the consultation details
      const consultation = await prisma.consultation.findUnique({
        where: { consultation_id: consultationId },
        include: {
          murid: true,
          admin: true,
        },
      });

      if (!consultation) {
        throw new Error("Consultation not found");
      }

      // Check if chat room already exists
      let chatRoom = await prisma.chatRoom.findUnique({
        where: { consultation_id: consultationId },
        include: {
          murid: true,
          admin: true,
          messages: {
            orderBy: { created_at: "asc" },
            include: {
              sender: {
                select: {
                  user_id: true,
                  firstname: true,
                  lastname: true,
                  role: true,
                },
              },
            },
          },
        },
      });

      // If chat room doesn't exist, create it
      if (!chatRoom) {
        chatRoom = await prisma.chatRoom.create({
          data: {
            consultation_id: consultationId,
            murid_id: consultation.murid_id,
            admin_id: consultation.admin_id,
          },
          include: {
            murid: true,
            admin: true,
            messages: {
              orderBy: { created_at: "asc" },
              include: {
                sender: {
                  select: {
                    user_id: true,
                    firstname: true,
                    lastname: true,
                    role: true,
                  },
                },
              },
            },
          },
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
      const chatRooms = await prisma.chatRoom.findMany({
        where: {
          admin_id: adminId,
          is_active: true,
        },
        include: {
          murid: {
            select: {
              user_id: true,
              firstname: true,
              lastname: true,
              kelas: true,
            },
          },
          consultation: {
            select: {
              topic: true,
              consultation_date: true,
              status: true,
            },
          },
          messages: {
            orderBy: { created_at: "desc" },
            take: 1,
            include: {
              sender: {
                select: {
                  firstname: true,
                  lastname: true,
                  role: true,
                },
              },
            },
          },
          _count: {
            select: {
              messages: {
                where: {
                  is_read: false,
                  sender_id: { not: adminId },
                },
              },
            },
          },
        },
        orderBy: { updated_at: "desc" },
      });

      return chatRooms.map((room) => ({
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
      }));
    } catch (error) {
      console.error("Error in getChatRoomsForAdmin:", error);
      throw error;
    }
  }

  // Get chat messages for a specific room
  async getChatMessages(roomId: string, userId: string) {
    try {
      // Verify user has access to this chat room
      const chatRoom = await prisma.chatRoom.findFirst({
        where: {
          room_id: roomId,
          OR: [{ murid_id: userId }, { admin_id: userId }],
        },
      });

      if (!chatRoom) {
        throw new Error("Access denied or chat room not found");
      }

      const messages = await prisma.chatMessage.findMany({
        where: { room_id: roomId },
        include: {
          sender: {
            select: {
              user_id: true,
              firstname: true,
              lastname: true,
              role: true,
            },
          },
        },
        orderBy: { created_at: "asc" },
      });

      // Mark messages as read for the current user
      await prisma.chatMessage.updateMany({
        where: {
          room_id: roomId,
          sender_id: { not: userId },
          is_read: false,
        },
        data: { is_read: true },
      });

      return messages.map((msg) => ({
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
      const chatRoom = await prisma.chatRoom.findFirst({
        where: {
          room_id: roomId,
          OR: [{ murid_id: senderId }, { admin_id: senderId }],
        },
      });

      if (!chatRoom) {
        throw new Error("Access denied or chat room not found");
      }

      const newMessage = await prisma.chatMessage.create({
        data: {
          room_id: roomId,
          sender_id: senderId,
          message: message.trim(),
        },
        include: {
          sender: {
            select: {
              user_id: true,
              firstname: true,
              lastname: true,
              role: true,
            },
          },
        },
      });

      // Update chat room's updated_at timestamp
      await prisma.chatRoom.update({
        where: { room_id: roomId },
        data: { updated_at: new Date() },
      });

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

  // Get students with accepted consultations (for chat user list)
  async getStudentsWithAcceptedConsultations() {
    try {
      const acceptedConsultations = await prisma.consultation.findMany({
        where: {
          status: "ACCEPTED",
        },
        include: {
          murid: {
            select: {
              user_id: true,
              firstname: true,
              lastname: true,
              kelas: true,
            },
          },
          chatRoom: {
            include: {
              messages: {
                orderBy: { created_at: "desc" },
                take: 1,
              },
              _count: {
                select: {
                  messages: {
                    where: {
                      is_read: false,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { consultation_date: "desc" },
      });

      return acceptedConsultations.map((consultation) => ({
        user_id: consultation.murid.user_id,
        firstname: consultation.murid.firstname,
        lastname: consultation.murid.lastname,
        kelas: consultation.murid.kelas,
        consultation_id: consultation.consultation_id, // Add this field
        latestConsultationTopic: consultation.topic,
        room_id: consultation.chatRoom?.room_id,
        lastMessage:
          consultation.chatRoom?.messages[0]?.message || consultation.topic,
        lastMessageTime:
          consultation.chatRoom?.messages[0]?.created_at.toISOString() ||
          consultation.created_at.toISOString(),
        unreadCount: consultation.chatRoom?._count.messages || 0,
      }));
    } catch (error) {
      console.error("Error in getStudentsWithAcceptedConsultations:", error);
      throw error;
    }
  }
}
