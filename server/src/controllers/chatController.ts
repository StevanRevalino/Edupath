import { Request, Response } from "express";
import prisma from "../configs/prisma";

export class ChatController {
  constructor() {
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
      const adminId = req.user?.user_id;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // Get current time in Indonesia (WIB - UTC+7)
      const now = new Date();
      const indonesiaTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
      );
      const oneHourAgo = new Date(indonesiaTime.getTime() - 60 * 60 * 1000);

      const acceptedConsultations = await prisma.consultation.findMany({
        where: {
          admin_id: adminId,
          status: "ACCEPTED",
          is_active: true,
          consultation_date: {
            gte: oneHourAgo,
            lte: indonesiaTime,
          },
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
                      sender: { role: "STUDENT" },
                    },
                  },
                },
              },
            },
          },
        },
      });

      const students = acceptedConsultations.map((consultation: any) => ({
        user_id: consultation.murid.user_id,
        firstname: consultation.murid.firstname,
        lastname: consultation.murid.lastname,
        kelas: consultation.murid.kelas,
        consultation_id: consultation.consultation_id,
        consultation_date: consultation.consultation_date?.toISOString(),
        consultation_status: consultation.status,
        latestConsultationTopic: consultation.topic,
        room_id: consultation.chatRoom?.room_id,
        lastMessage:
          consultation.chatRoom?.messages[0]?.message || consultation.topic,
        lastMessageTime:
          consultation.chatRoom?.messages[0]?.created_at.toISOString() ||
          consultation.created_at.toISOString(),
        unreadCount: consultation.chatRoom?._count.messages || 0,
      }));

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

      // First, get the consultation details
      const consultation = await prisma.consultation.findUnique({
        where: { consultation_id: consultationId },
      });

      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: "Consultation not found",
        });
      }

      // Check if user has access to this consultation
      if (
        consultation.murid_id !== userId &&
        consultation.admin_id !== userId
      ) {
        return res.status(403).json({
          success: false,
          message: "You don't have access to this consultation",
        });
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

      return res.status(200).json({
        success: true,
        message: "Berhasil mengambil chat room",
        data: chatRoom,
      });
    } catch (error: any) {
      console.error("Error in getChatRoom:", error);
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

      // Verify user has access to this chat room
      const chatRoom = await prisma.chatRoom.findFirst({
        where: {
          room_id: roomId,
          OR: [{ murid_id: userId }, { admin_id: userId }],
        },
      });

      if (!chatRoom) {
        return res.status(403).json({
          success: false,
          message: "Access denied or chat room not found",
        });
      }

      const dbMessages = await prisma.chatMessage.findMany({
        where: { room_id: roomId },
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

      const messages = dbMessages.map((msg: any) => ({
        id: msg.message_id,
        message: msg.message,
        senderId: msg.sender_id,
        senderName: `${msg.sender.firstname} ${msg.sender.lastname}`,
        timestamp: msg.created_at.toISOString(),
        isFromAdmin: msg.sender.role === "ADMIN",
        isRead: msg.is_read,
      }));

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

      // Verify user has access to this chat room
      const chatRoom = await prisma.chatRoom.findFirst({
        where: {
          room_id: roomId,
          OR: [{ murid_id: userId }, { admin_id: userId }],
        },
      });

      if (!chatRoom) {
        return res.status(403).json({
          success: false,
          message: "Access denied or chat room not found",
        });
      }

      const newMessage = await prisma.chatMessage.create({
        data: {
          room_id: roomId,
          sender_id: userId,
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

      // Create notification if message is from admin to student
      if (newMessage.sender.role === "ADMIN") {
        const receiverId = chatRoom.murid_id; // Student is the receiver

        // Only create notification if message is not a Zoom meeting message
        const isZoomMessage = message.includes("🎥 Zoom Meeting Dibuat");

        if (!isZoomMessage) {
          await prisma.notification.create({
            data: {
              user_id: receiverId,
              type: "CHAT_MESSAGE",
              title: "Pesan Baru dari Admin",
              message: `${newMessage.sender.firstname} ${
                newMessage.sender.lastname
              }: ${message.slice(0, 50)}${message.length > 50 ? "..." : ""}`,
              related_id: chatRoom.consultation_id,
            },
          });
        }
      }

      return res.status(201).json({
        success: true,
        message: "Pesan berhasil dikirim",
        data: {
          id: newMessage.message_id,
          message: newMessage.message,
          senderId: newMessage.sender_id,
          senderName: `${newMessage.sender.firstname} ${newMessage.sender.lastname}`,
          timestamp: newMessage.created_at.toISOString(),
          isFromAdmin: newMessage.sender.role === "ADMIN",
          isRead: newMessage.is_read,
        },
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

      const chatRooms = await prisma.chatRoom.findMany({
        where: {
          admin_id: userId,
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
              messages: true,
            },
          },
        },
        orderBy: { updated_at: "desc" },
      });

      const roomsWithUnreadCounts = await Promise.all(
        chatRooms.map(async (room: any) => {
          const unreadCount = await prisma.chatMessage.count({
            where: {
              room_id: room.room_id,
              is_read: false,
              sender_id: { not: userId },
            },
          });

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

      return res.status(200).json({
        success: true,
        message: "Berhasil mengambil chat rooms",
        data: roomsWithUnreadCounts,
        count: roomsWithUnreadCounts.length,
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
      const adminId = req.user?.user_id;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const inactiveConsultations = await prisma.consultation.findMany({
        where: {
          admin_id: adminId,
          is_active: false,
          chatRoom: {
            isNot: null,
          },
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
          admin: {
            select: {
              user_id: true,
              firstname: true,
              lastname: true,
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
                  messages: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: "desc" },
      });

      const chatHistory = inactiveConsultations.map((consultation: any) => ({
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

      const chatRooms = await prisma.chatRoom.findMany({
        where: {
          admin_id: userId,
        },
        include: {
          messages: {
            where: {
              sender_id: {
                not: userId, // Messages not from admin
              },
              is_read: false,
            },
          },
        },
      });

      // Count total unread messages
      const unreadCount = chatRooms.reduce(
        (total: number, room: any) => total + room.messages.length,
        0
      );

      const data = {
        unreadCount,
        roomsWithUnread: chatRooms
          .filter((room: any) => room.messages.length > 0)
          .map((room: any) => ({
            room_id: room.room_id,
            unreadCount: room.messages.length,
          })),
      };

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
