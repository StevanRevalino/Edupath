import prisma from "../configs/prisma";

interface CreateZoomMeetingDTO {
  meeting_id: string;
  consultation_id: string;
  host_id: string;
  topic: string;
  scheduled_time: Date;
  description?: string;
  meeting_password: string;
  join_url: string;
  start_url: string;
}

export class ZoomRepository {
  constructor() {
    // Using singleton prisma instance
  }

  // Create zoom meeting
  async create(data: CreateZoomMeetingDTO) {
    return prisma.zoomMeeting.create({
      data: {
        meeting_id: data.meeting_id,
        consultation_id: data.consultation_id,
        host_id: data.host_id,
        topic: data.topic,
        scheduled_time: data.scheduled_time,
        description: data.description || null,
        meeting_password: data.meeting_password,
        join_url: data.join_url,
        start_url: data.start_url,
      },
    });
  }

  // Find by consultation ID
  async findByConsultationId(consultationId: string) {
    return prisma.zoomMeeting.findMany({
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
  }

  // Find by ID and host
  async findByIdAndHost(zoomMeetingId: string, hostId: string) {
    return prisma.zoomMeeting.findFirst({
      where: {
        zoom_meeting_id: zoomMeetingId,
        host_id: hostId,
      },
    });
  }

  // Delete zoom meeting
  async delete(zoomMeetingId: string) {
    return prisma.zoomMeeting.delete({
      where: {
        zoom_meeting_id: zoomMeetingId,
      },
    });
  }
}

export const zoomRepository = new ZoomRepository();
