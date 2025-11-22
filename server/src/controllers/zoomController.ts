import { Request, Response } from "express";
import { ZoomMeetingService } from "../services/zoomMeetingService";

export class ZoomController {
  private zoomMeetingService: ZoomMeetingService;

  constructor() {
    this.zoomMeetingService = new ZoomMeetingService();

    // Bind methods to preserve 'this' context
    this.createZoomMeeting = this.createZoomMeeting.bind(this);
    this.getZoomMeetings = this.getZoomMeetings.bind(this);
    this.deleteZoomMeeting = this.deleteZoomMeeting.bind(this);
  }

  // Create Zoom Meeting
  async createZoomMeeting(req: Request, res: Response) {
    try {
      const adminId = req.user?.user_id;
      const {
        consultationId,
        userId,
        topic,
        scheduledDate,
        scheduledTime,
        description,
      } = req.body;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // Validate required fields
      if (
        !consultationId ||
        !userId ||
        !topic ||
        !scheduledDate ||
        !scheduledTime
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      const result = await this.zoomMeetingService.createZoomMeeting({
        adminId,
        consultationId,
        userId,
        topic,
        scheduledDate,
        scheduledTime,
        description,
      });

      return res.status(201).json({
        success: true,
        message: "Zoom meeting berhasil dibuat",
        data: result,
      });
    } catch (error: any) {
      console.error("Error creating Zoom meeting:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Gagal membuat Zoom meeting",
      });
    }
  }

  // Get Zoom meetings for a consultation
  async getZoomMeetings(req: Request, res: Response) {
    try {
      const { consultationId } = req.params;
      const userId = req.user?.user_id;
      const userRole = req.user?.role;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const meetings = await this.zoomMeetingService.getZoomMeetings(
        consultationId,
        userId,
        userRole || "MURID"
      );

      return res.status(200).json({
        success: true,
        message: "Berhasil mengambil data Zoom meetings",
        data: meetings,
      });
    } catch (error: any) {
      console.error("Error getting Zoom meetings:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Gagal mengambil data Zoom meetings",
      });
    }
  }

  // Delete/Cancel Zoom meeting
  async deleteZoomMeeting(req: Request, res: Response) {
    try {
      const { meetingId } = req.params;
      const userId = req.user?.user_id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      await this.zoomMeetingService.deleteZoomMeeting(meetingId, userId);

      return res.status(200).json({
        success: true,
        message: "Zoom meeting berhasil dihapus",
      });
    } catch (error: any) {
      console.error("Error deleting Zoom meeting:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Gagal membatalkan Zoom meeting",
      });
    }
  }
}
