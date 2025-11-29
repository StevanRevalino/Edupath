import { Request, Response } from "express";
import prisma from "../configs/prisma";
import zoomService from "../services/zoomService";

export class ZoomController {
  constructor() {
    // Bind methods to preserve 'this' context
    this.createZoomMeeting = this.createZoomMeeting.bind(this);
    this.getZoomMeetings = this.getZoomMeetings.bind(this);
    this.deleteZoomMeeting = this.deleteZoomMeeting.bind(this);
  }

  // Generate placeholder Zoom meeting ID
  private generateZoomMeetingId(): string {
    const part1 = Math.floor(100 + Math.random() * 900);
    const part2 = Math.floor(1000 + Math.random() * 9000);
    const part3 = Math.floor(1000 + Math.random() * 9000);
    return `${part1}${part2}${part3}`;
  }

  // Generate meeting password
  private generatePassword(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
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

      // Verify consultation exists and belongs to admin
      const consultation = await prisma.consultation.findUnique({
        where: { consultation_id: consultationId },
      });

      if (!consultation || consultation.admin_id !== adminId) {
        return res.status(404).json({
          success: false,
          message: "Consultation not found or unauthorized",
        });
      }

      // Get user info
      const user = await prisma.user.findUnique({
        where: { user_id: userId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Combine date and time
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);

      let meetingId: string;
      let meetingPassword: string;
      let joinUrl: string;
      let startUrl: string;
      let zoomMeetingId: number | null = null;

      // Try to create real Zoom meeting if configured
      if (zoomService.isConfigured()) {
        try {
          const zoomMeeting = await zoomService.createMeeting({
            topic: topic,
            start_time: scheduledDateTime.toISOString(),
            duration: 60, // Default 60 minutes
            timezone: "Asia/Jakarta",
            password: undefined,
            agenda:
              description ||
              `Konsultasi dengan ${user.firstname} ${user.lastname}`,
          });

          meetingId = zoomMeeting.id.toString();
          meetingPassword = zoomMeeting.password;
          joinUrl = zoomMeeting.join_url;
          startUrl = zoomMeeting.start_url;
          zoomMeetingId = zoomMeeting.id;
        } catch (zoomError: any) {
          console.error(
            "❌ Failed to create Zoom meeting, falling back to placeholder:",
            zoomError.message
          );

          // Fallback to placeholder
          meetingId = this.generateZoomMeetingId();
          meetingPassword = this.generatePassword();
          joinUrl = `https://zoom.us/j/${meetingId}?pwd=${meetingPassword}`;
          startUrl = `https://zoom.us/s/${meetingId}?pwd=${meetingPassword}`;
        }
      } else {
        // Generate placeholder
        meetingId = this.generateZoomMeetingId();
        meetingPassword = this.generatePassword();
        joinUrl = `https://zoom.us/j/${meetingId}?pwd=${meetingPassword}`;
        startUrl = `https://zoom.us/s/${meetingId}?pwd=${meetingPassword}`;
      }

      // Create Zoom meeting record in database
      const dbZoomMeeting = await prisma.zoomMeeting.create({
        data: {
          meeting_id: meetingId,
          consultation_id: consultationId,
          host_id: adminId,
          topic: topic,
          scheduled_time: scheduledDateTime,
          description: description,
          meeting_password: meetingPassword,
          join_url: joinUrl,
          start_url: startUrl,
        },
      });

      // Create notification for student
      await prisma.notification.create({
        data: {
          user_id: userId,
          type: "zoom_meeting",
          title: "Zoom Meeting Dibuat",
          message: `Admin telah membuat Zoom meeting: ${topic}\nJadwal: ${scheduledDate} ${scheduledTime}`,
          related_id: dbZoomMeeting.zoom_meeting_id,
          link: joinUrl,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Zoom meeting berhasil dibuat",
        data: {
          meetingId: dbZoomMeeting.zoom_meeting_id,
          zoomMeetingId: meetingId,
          realZoomMeetingId: zoomMeetingId,
          topic: topic,
          scheduledTime: scheduledDateTime,
          joinUrl: joinUrl,
          startUrl: startUrl,
          password: meetingPassword,
          status: "scheduled",
          isRealZoom: zoomMeetingId !== null,
        },
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

      const meetings = await prisma.zoomMeeting.findMany({
        where: {
          consultation_id: consultationId,
        },
        include: {
          host: {
            select: {
              user_id: true,
              firstname: true,
              lastname: true,
            },
          },
        },
        orderBy: {
          scheduled_time: "desc",
        },
      });

      // Format response based on user role
      const formattedMeetings = meetings.map((meeting) => {
        const isHost = userRole === "ADMIN" || userId === meeting.host_id;
        const meetingUrl = isHost ? meeting.start_url : meeting.join_url;

        return {
          ...meeting,
          meetingUrl,
          isHost,
        };
      });

      return res.status(200).json({
        success: true,
        message: "Berhasil mengambil data Zoom meetings",
        data: formattedMeetings,
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

      // Check if meeting exists and user is host
      const meeting = await prisma.zoomMeeting.findFirst({
        where: {
          zoom_meeting_id: meetingId,
          host_id: userId,
        },
      });

      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: "Meeting not found or unauthorized",
        });
      }

      // Delete the meeting
      await prisma.zoomMeeting.delete({
        where: {
          zoom_meeting_id: meetingId,
        },
      });

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
