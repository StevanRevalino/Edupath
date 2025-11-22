import { dashboardRepository } from "../repositories/dashboardRepository";

export class DashboardService {
  private dashboardRepository = dashboardRepository;

  // Get dashboard statistics
  async getDashboardStats() {
    const totalStudents = await this.dashboardRepository.countStudents();
    const totalConsultations =
      await this.dashboardRepository.countConsultations();
    const pendingConsultations =
      await this.dashboardRepository.countConsultations({
        status: "PENDING",
      });
    const activeConsultations =
      await this.dashboardRepository.countConsultations({
        status: "ACCEPTED",
      });
    const completedConsultations =
      await this.dashboardRepository.countConsultations({
        status: "COMPLETED",
      });
    const declinedConsultations =
      await this.dashboardRepository.countConsultations({
        status: "DECLINED",
      });
    const totalScholarships =
      await this.dashboardRepository.countScholarships();
    const totalChats = await this.dashboardRepository.countChatRooms();

    // Count unread chats
    const chatRooms =
      await this.dashboardRepository.getChatRoomsWithUnreadMessages();
    const unreadChats = chatRooms.filter((room) =>
      room.messages.some(
        (msg) => msg.sender_id === room.murid_id && !msg.is_read
      )
    ).length;

    // Get weekly consultations (last 7 days)
    const now = new Date();
    const today = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    const weeklyConsultations =
      await this.dashboardRepository.getConsultationsByDateRange(
        sevenDaysAgo,
        today
      );

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

    const monthlyConsultations =
      await this.dashboardRepository.getConsultationsByDateRange(
        sixMonthsAgo,
        today
      );

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
    const assessments =
      await this.dashboardRepository.getHollandAssessmentsByDateRange(
        sixMonthsAgo
      );

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

    return {
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
  }

  // Get upcoming consultations
  async getUpcomingConsultations() {
    const now = new Date();
    const indonesiaTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );

    const upcomingConsultations =
      await this.dashboardRepository.getUpcomingConsultations(
        indonesiaTime,
        10
      );

    return upcomingConsultations.map((consultation) => ({
      consultation_id: consultation.consultation_id,
      murid_name: `${consultation.murid.firstname} ${consultation.murid.lastname}`,
      topic: consultation.topic,
      consultation_date: consultation.consultation_date,
      status: consultation.status,
    }));
  }

  // Get recent chats
  async getRecentChats() {
    const chatRooms = await this.dashboardRepository.getRecentChatRooms(10);

    return Promise.all(
      chatRooms.map(async (room) => {
        const unreadCount =
          await this.dashboardRepository.countUnreadMessagesInRoom(
            room.room_id,
            room.murid_id
          );

        return {
          room_id: room.room_id,
          murid_name: `${room.murid.firstname} ${room.murid.lastname}`,
          last_message: room.messages[0]?.message || "Belum ada pesan",
          last_message_time: room.messages[0]?.created_at || room.created_at,
          unread_count: unreadCount,
        };
      })
    );
  }

  // Get weekly consultations by date range
  async getWeeklyConsultations(startDate: Date, endDate: Date) {
    const consultations =
      await this.dashboardRepository.getConsultationsByDateRange(
        startDate,
        endDate
      );

    // Group by day of week (0 = Sunday, 6 = Saturday)
    const weeklyData = Array(7).fill(0);

    consultations.forEach((consultation) => {
      const date = new Date(consultation.consultation_date);
      const dayIndex = date.getDay();
      weeklyData[dayIndex]++;
    });

    return weeklyData;
  }
}
