import { PrismaClient } from "@prisma/client";

export class ChatRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findChatRoomByConsultationId(consultationId: string) {
    return this.prisma.chatRoom.findUnique({
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
  }

  async createChatRoom(data: {
    consultation_id: string;
    murid_id: string;
    admin_id: string;
  }) {
    return this.prisma.chatRoom.create({
      data,
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

  async findChatRoomsByAdminId(adminId: string) {
    return this.prisma.chatRoom.findMany({
      where: {
        admin_id: adminId,
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
  }

  async findChatRoomByIdAndUserId(roomId: string, userId: string) {
    return this.prisma.chatRoom.findFirst({
      where: {
        room_id: roomId,
        OR: [{ murid_id: userId }, { admin_id: userId }],
      },
    });
  }

  async findMessagesByRoomId(roomId: string) {
    return this.prisma.chatMessage.findMany({
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
  }

  async markMessagesAsRead(roomId: string, userId: string) {
    return this.prisma.chatMessage.updateMany({
      where: {
        room_id: roomId,
        sender_id: { not: userId },
        is_read: false,
      },
      data: { is_read: true },
    });
  }

  async createMessage(data: {
    room_id: string;
    sender_id: string;
    message: string;
  }) {
    return this.prisma.chatMessage.create({
      data,
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
  }

  async updateChatRoomTimestamp(roomId: string) {
    return this.prisma.chatRoom.update({
      where: { room_id: roomId },
      data: { updated_at: new Date() },
    });
  }

  async createNotification(data: {
    user_id: string;
    type: string;
    title: string;
    message: string;
    related_id?: string;
    link?: string;
  }) {
    return this.prisma.notification.create({
      data,
    });
  }

  async countUnreadMessages(roomId: string, excludeUserId: string) {
    return this.prisma.chatMessage.count({
      where: {
        room_id: roomId,
        is_read: false,
        sender_id: { not: excludeUserId },
      },
    });
  }
}
