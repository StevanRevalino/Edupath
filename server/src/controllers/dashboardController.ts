import { Request, Response } from "express";
import { autoCompleteExpiredConsultations } from "../services/consultationScheduler";
import { DashboardService } from "../services/dashboardService";

const dashboardService = new DashboardService();

// Get Dashboard Statistics
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const data = await dashboardService.getDashboardStats();

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
    const consultations = await dashboardService.getUpcomingConsultations();

    return res.status(200).json({
      success: true,
      data: consultations,
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
    const recentChats = await dashboardService.getRecentChats();

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

    const weeklyData = await dashboardService.getWeeklyConsultations(
      start,
      end
    );

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
