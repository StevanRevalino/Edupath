import prisma from "../configs/prisma";

export class DashboardRepository {
  constructor() {
    // Using singleton prisma instance
  }

  // Count total students
  async countStudents() {
    return prisma.user.count({
      where: { role: "STUDENT" },
    });
  }

  // Count consultations with optional filter
  async countConsultations(where?: any) {
    return prisma.consultation.count({ where });
  }

  // Count scholarships
  async countScholarships() {
    return prisma.beasiswa.count();
  }

  // Count chat rooms
  async countChatRooms() {
    return prisma.chatRoom.count();
  }

  // Get chat rooms with unread messages
  async getChatRoomsWithUnreadMessages() {
    return prisma.chatRoom.findMany({
      include: {
        messages: {
          where: {
            is_read: false,
          },
        },
        murid: {
          select: {
            role: true,
          },
        },
      },
    });
  }

  // Get consultations in date range
  async getConsultationsByDateRange(startDate: Date, endDate: Date) {
    return prisma.consultation.findMany({
      where: {
        consultation_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        consultation_date: true,
      },
    });
  }

  // Get holland assessments in date range
  async getHollandAssessmentsByDateRange(startDate: Date) {
    return prisma.hollandAssessment.findMany({
      where: {
        completed_at: {
          gte: startDate,
        },
      },
      select: {
        completed_at: true,
        user_id: true,
      },
    });
  }

  // Get upcoming consultations
  async getUpcomingConsultations(currentTime: Date, limit: number = 10) {
    return prisma.consultation.findMany({
      where: {
        OR: [
          {
            consultation_date: {
              gte: currentTime,
            },
            status: {
              in: ["PENDING", "ACCEPTED"],
            },
          },
          {
            status: "ACCEPTED",
            is_active: true,
          },
        ],
      },
      include: {
        murid: {
          select: {
            firstname: true,
            lastname: true,
          },
        },
      },
      orderBy: {
        consultation_date: "asc",
      },
      take: limit,
    });
  }

  // Get recent chat rooms
  async getRecentChatRooms(limit: number = 10) {
    return prisma.chatRoom.findMany({
      include: {
        murid: {
          select: {
            firstname: true,
            lastname: true,
          },
        },
        messages: {
          orderBy: {
            created_at: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        updated_at: "desc",
      },
      take: limit,
    });
  }

  // Count unread messages in chat room
  async countUnreadMessagesInRoom(roomId: string, muridId: string) {
    return prisma.chatMessage.count({
      where: {
        room_id: roomId,
        is_read: false,
        sender_id: muridId,
      },
    });
  }
}

export const dashboardRepository = new DashboardRepository();
