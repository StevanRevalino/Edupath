import { Request, Response } from "express";
import prisma from "../configs/prisma";

// Helper function for auto-completing expired consultations
async function autoCompleteExpiredConsultations() {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const expiredConsultations = await prisma.consultation.findMany({
      where: {
        status: "ACCEPTED",
        is_active: true,
        consultation_date: {
          lt: oneHourAgo,
        },
      },
    });

    if (expiredConsultations.length > 0) {
      const consultationIds = expiredConsultations.map(
        (c) => c.consultation_id
      );
      const result = await prisma.consultation.updateMany({
        where: {
          consultation_id: {
            in: consultationIds,
          },
        },
        data: {
          is_active: false,
          status: "COMPLETED",
        },
      });

      return {
        success: true,
        count: result.count,
        consultations: expiredConsultations.map((c) => ({
          id: c.consultation_id,
          startTime: c.consultation_date,
        })),
      };
    }

    return { success: true, count: 0, consultations: [] };
  } catch (error) {
    console.error("[Scheduler] Error auto-completing consultations:", error);
    throw error;
  }
}

// Get Dashboard Statistics
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.user_id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Run all counts in parallel for faster response
    const [
      totalStudents,
      totalConsultations,
      pendingConsultations,
      activeConsultations,
      completedConsultations,
      declinedConsultations,
      totalScholarships,
      totalChats,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.consultation.count({ where: { admin_id: adminId } }),
      prisma.consultation.count({
        where: { status: "PENDING", admin_id: adminId },
      }),
      prisma.consultation.count({
        where: { status: "ACCEPTED", admin_id: adminId },
      }),
      prisma.consultation.count({
        where: { status: "COMPLETED", admin_id: adminId },
      }),
      prisma.consultation.count({
        where: { status: "DECLINED", admin_id: adminId },
      }),
      prisma.beasiswa.count(),
      prisma.chatRoom.count({ where: { admin_id: adminId } }),
    ]);

    // Count unread chats
    const chatRooms = await prisma.chatRoom.findMany({
      where: { admin_id: adminId },
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

    const unreadChats = chatRooms.filter((room) =>
      room.messages.some(
        (msg: any) => msg.sender_id === room.murid_id && !msg.is_read
      )
    ).length;

    // Get weekly consultations (last 7 days)
    const now = new Date();
    const today = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    const weeklyConsultations = await prisma.consultation.findMany({
      where: {
        admin_id: adminId,
        consultation_date: {
          gte: sevenDaysAgo,
          lte: today,
        },
      },
      select: {
        consultation_date: true,
      },
    });

    // Group by day
    const daysOfWeek = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const weeklyData = Array(7).fill(0);

    weeklyConsultations.forEach((consultation) => {
      const date = new Date(consultation.consultation_date);
      const dayIndex = date.getDay();
      weeklyData[dayIndex]++;
    });

    // Get monthly trends (last 6 months)
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(today.getMonth() - 5);

    const monthlyConsultations = await prisma.consultation.findMany({
      where: {
        admin_id: adminId,
        consultation_date: {
          gte: sixMonthsAgo,
          lte: today,
        },
      },
      select: {
        consultation_date: true,
      },
    });

    // Group by month
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agt",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];
    const monthlyData = Array(6).fill(0);
    const monthLabels: string[] = [];

    // Calculate month labels
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(today.getMonth() - i);
      monthLabels.push(monthNames[date.getMonth()]);
    }

    // Count consultations per month
    monthlyConsultations.forEach((consultation) => {
      const date = new Date(consultation.consultation_date);
      const monthDiff =
        (today.getFullYear() - date.getFullYear()) * 12 +
        (today.getMonth() - date.getMonth());
      if (monthDiff >= 0 && monthDiff < 6) {
        monthlyData[5 - monthDiff]++;
      }
    });

    // Get active students count per month
    const monthlyActiveStudents = Array(6).fill(0);
    const assessments = await prisma.hollandAssessment.findMany({
      where: {
        completed_at: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        completed_at: true,
        user_id: true,
      },
    });

    // Count unique students per month
    for (let i = 0; i < 6; i++) {
      const monthStart = new Date(today);
      monthStart.setMonth(today.getMonth() - (5 - i));
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const uniqueStudents = new Set(
        assessments
          .filter((a: any) => {
            const date = new Date(a.completed_at);
            return date >= monthStart && date < monthEnd;
          })
          .map((a: any) => a.user_id)
      );

      monthlyActiveStudents[i] = uniqueStudents.size;
    }

    const data = {
      stats: {
        totalStudents,
        totalConsultations,
        pendingConsultations,
        activeConsultations,
        completedConsultations,
        totalScholarships,
        totalChats,
        unreadChats,
      },
      weeklyConsultations: {
        labels: daysOfWeek,
        data: weeklyData,
      },
      consultationStatus: {
        pending: pendingConsultations,
        active: activeConsultations,
        completed: completedConsultations,
        declined: declinedConsultations,
      },
      monthlyTrends: {
        labels: monthLabels,
        consultations: monthlyData,
        activeStudents: monthlyActiveStudents,
      },
    };

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil statistik dashboard",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get Upcoming Consultations
export const getUpcomingConsultations = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.user_id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const now = new Date();
    const indonesiaTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );

    const consultations = await prisma.consultation.findMany({
      where: {
        admin_id: adminId,
        OR: [
          {
            consultation_date: {
              gte: indonesiaTime,
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
      take: 10,
    });

    const formattedConsultations = consultations.map((consultation) => ({
      consultation_id: consultation.consultation_id,
      murid_name: `${consultation.murid.firstname} ${consultation.murid.lastname}`,
      topic: consultation.topic,
      consultation_date: consultation.consultation_date,
      status: consultation.status,
    }));

    return res.status(200).json({
      success: true,
      data: formattedConsultations,
    });
  } catch (error) {
    console.error("Error fetching upcoming consultations:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil jadwal konseling mendatang",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get Recent Chats
export const getRecentChats = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.user_id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const chatRooms = await prisma.chatRoom.findMany({
      where: {
        admin_id: adminId,
        consultation: {
          is_active: true,
        },
      },
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
      take: 10,
    });

    const recentChats = await Promise.all(
      chatRooms.map(async (room) => {
        const unreadCount = await prisma.chatMessage.count({
          where: {
            room_id: room.room_id,
            is_read: false,
            sender_id: room.murid_id,
          },
        });

        return {
          room_id: room.room_id,
          murid_name: `${room.murid.firstname} ${room.murid.lastname}`,
          last_message: room.messages[0]?.message || "Belum ada pesan",
          last_message_time: room.messages[0]?.created_at || room.created_at,
          unread_count: unreadCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: recentChats,
    });
  } catch (error) {
    console.error("Error fetching recent chats:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil chat terbaru",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get Weekly Consultations
export const getWeeklyConsultations = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate dan endDate harus disertakan",
      });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const consultations = await prisma.consultation.findMany({
      where: {
        consultation_date: {
          gte: start,
          lte: end,
        },
      },
      select: {
        consultation_date: true,
      },
    });

    // Group by day of week (0 = Sunday, 6 = Saturday)
    const weeklyData = Array(7).fill(0);

    consultations.forEach((consultation) => {
      const date = new Date(consultation.consultation_date);
      const dayIndex = date.getDay();
      weeklyData[dayIndex]++;
    });

    return res.status(200).json({
      success: true,
      data: weeklyData,
    });
  } catch (error) {
    console.error("Error fetching weekly consultations:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data konsultasi mingguan",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Manual trigger to auto-complete expired consultations
export const triggerAutoComplete = async (req: Request, res: Response) => {
  try {
    const result = await autoCompleteExpiredConsultations();

    return res.status(200).json({
      success: true,
      message: `Auto-completed ${result.count} expired consultations`,
      data: result,
    });
  } catch (error) {
    console.error("Error triggering auto-complete:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal melakukan auto-complete konsultasi",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
