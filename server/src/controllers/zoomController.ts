import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export class ZoomController {
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

      // Verify consultation exists and belongs to the admin
      const consultation = await prisma.consultation.findFirst({
        where: {
          consultation_id: consultationId,
          admin_id: adminId,
        },
      });

      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: "Consultation not found or unauthorized",
        });
      }

      // Get user info
      const user = await prisma.user.findUnique({
        where: {
          user_id: userId,
        },
        select: {
          user_id: true,
          firstname: true,
          lastname: true,
          email: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Combine date and time
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);

      // Generate Zoom-like meeting ID (11 digits, format: XXX XXXX XXXX)
      const generateZoomMeetingId = () => {
        const part1 = Math.floor(100 + Math.random() * 900); // 3 digits
        const part2 = Math.floor(1000 + Math.random() * 9000); // 4 digits
        const part3 = Math.floor(1000 + Math.random() * 9000); // 4 digits
        return `${part1}${part2}${part3}`;
      };

      const meetingId = generateZoomMeetingId();
      const meetingPassword = Math.floor(
        100000 + Math.random() * 900000
      ).toString(); // 6 digit password

      // Create Zoom meeting record in database
      const zoomMeeting = await prisma.zoomMeeting.create({
        data: {
          meeting_id: meetingId,
          consultation_id: consultationId,
          host_id: adminId,
          topic: topic,
          scheduled_time: scheduledDateTime,
          description: description || null,
          meeting_password: meetingPassword,
          status: "scheduled",
        },
      });

      // Generate join URL in Zoom format
      const joinUrl = `https://zoom.us/j/${meetingId}?pwd=${meetingPassword}`;
      const startUrl = `https://zoom.us/s/${meetingId}?pwd=${meetingPassword}`;

      // Create notification for student
      await prisma.notification.create({
        data: {
          user_id: userId,
          type: "zoom_meeting",
          title: "Zoom Meeting Dibuat",
          message: `Admin telah membuat Zoom meeting: ${topic}\nJadwal: ${scheduledDate} ${scheduledTime}`,
          related_id: zoomMeeting.zoom_meeting_id,
          link: joinUrl,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Zoom meeting berhasil dibuat",
        data: {
          meetingId: zoomMeeting.zoom_meeting_id,
          zoomMeetingId: meetingId,
          topic: topic,
          scheduledTime: scheduledDateTime,
          joinUrl: joinUrl,
          startUrl: startUrl,
          password: meetingPassword,
          status: "scheduled",
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

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // Get meetings
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

  // Update Zoom meeting status
  async updateZoomMeetingStatus(req: Request, res: Response) {
    try {
      const { meetingId } = req.params;
      const { status } = req.body;
      const userId = req.user?.user_id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // Validate status
      if (!["scheduled", "started", "ended", "cancelled"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      // Update meeting
      const updatedMeeting = await prisma.zoomMeeting.update({
        where: {
          zoom_meeting_id: meetingId,
        },
        data: {
          status: status,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Status Zoom meeting berhasil diupdate",
        data: updatedMeeting,
      });
    } catch (error: any) {
      console.error("Error updating Zoom meeting status:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Gagal mengupdate status Zoom meeting",
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

      // Update status to cancelled instead of deleting
      await prisma.zoomMeeting.update({
        where: {
          zoom_meeting_id: meetingId,
        },
        data: {
          status: "cancelled",
        },
      });

      return res.status(200).json({
        success: true,
        message: "Zoom meeting berhasil dibatalkan",
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
