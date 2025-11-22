import { zoomRepository } from "../repositories/zoomRepository";
import { ConsultationRepository } from "../repositories/consultationRepository";
import { UserRepository } from "../repositories/userRepository";
import { notificationRepository } from "../repositories/notificationRepository";
import zoomService from "./zoomService";

export class ZoomMeetingService {
  private zoomRepository = zoomRepository;
  private consultationRepository = new ConsultationRepository();
  private userRepository = new UserRepository();
  private notificationRepository = notificationRepository;

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

  // Create Zoom meeting
  async createZoomMeeting(data: {
    adminId: string;
    consultationId: string;
    userId: string;
    topic: string;
    scheduledDate: string;
    scheduledTime: string;
    description?: string;
  }) {
    const {
      adminId,
      consultationId,
      userId,
      topic,
      scheduledDate,
      scheduledTime,
      description,
    } = data;

    // Verify consultation exists and belongs to admin
    const consultation = await this.consultationRepository.findById(
      consultationId
    );

    if (!consultation || consultation.admin_id !== adminId) {
      throw new Error("Consultation not found or unauthorized");
    }

    // Get user info
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
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
    const dbZoomMeeting = await this.zoomRepository.create({
      meeting_id: meetingId,
      consultation_id: consultationId,
      host_id: adminId,
      topic: topic,
      scheduled_time: scheduledDateTime,
      description: description,
      meeting_password: meetingPassword,
      join_url: joinUrl,
      start_url: startUrl,
    });

    // Create notification for student
    await this.notificationRepository.create({
      user_id: userId,
      type: "zoom_meeting",
      title: "Zoom Meeting Dibuat",
      message: `Admin telah membuat Zoom meeting: ${topic}\nJadwal: ${scheduledDate} ${scheduledTime}`,
      related_id: dbZoomMeeting.zoom_meeting_id,
      link: joinUrl,
    });

    return {
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
    };
  }

  // Get Zoom meetings for consultation
  async getZoomMeetings(
    consultationId: string,
    userId: string,
    userRole: string
  ) {
    const meetings = await this.zoomRepository.findByConsultationId(
      consultationId
    );

    // Format response based on user role
    return meetings.map((meeting) => {
      const isHost = userRole === "ADMIN" || userId === meeting.host_id;
      const meetingUrl = isHost ? meeting.start_url : meeting.join_url;

      return {
        ...meeting,
        meetingUrl,
        isHost,
      };
    });
  }

  // Delete Zoom meeting
  async deleteZoomMeeting(meetingId: string, userId: string) {
    // Check if meeting exists and user is host
    const meeting = await this.zoomRepository.findByIdAndHost(
      meetingId,
      userId
    );

    if (!meeting) {
      throw new Error("Meeting not found or unauthorized");
    }

    // Delete the meeting
    await this.zoomRepository.delete(meetingId);

    return { success: true };
  }
}
