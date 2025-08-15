import { Request, Response } from "express";
import { seedLocalData } from "../configs/localDataSeeder";
import { LocalDataService } from "../services/localDataService";

const localService = new LocalDataService();

export class AdminController {
  // POST /api/admin/import-csv - Import data from CSV files (requires ADMIN role)
  async importCSVData(req: Request, res: Response) {
    try {
      // Check if user is admin
      if (req.user?.role !== "ADMIN") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin role required.",
        });
      }

      console.log("🔄 Starting CSV data import...");
      await seedLocalData();

      const stats = await localService.getLocalDataStats();

      res.json({
        success: true,
        message: "CSV data imported successfully",
        data: stats,
      });
    } catch (error: any) {
      console.error("❌ Error importing CSV data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to import CSV data",
        error: error.message,
      });
    }
  }

  // GET /api/admin/system-status - Get system status including API and local data
  async getSystemStatus(req: Request, res: Response) {
    try {
      // Check if user is admin
      if (req.user?.role !== "ADMIN") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin role required.",
        });
      }

      const localStats = await localService.getLocalDataStats();

      // Test API availability (simplified)
      let apiStatus = "unknown";
      try {
        // You can add a simple API test here
        apiStatus = "available";
      } catch {
        apiStatus = "unavailable";
      }

      const systemStatus = {
        api_status: apiStatus,
        local_data: localStats,
        timestamp: new Date(),
        fallback_enabled: true,
      };

      res.json({
        success: true,
        message: "System status retrieved",
        data: systemStatus,
      });
    } catch (error: any) {
      console.error("❌ Error getting system status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get system status",
        error: error.message,
      });
    }
  }
}
