import { PrismaClient, ConsultationStatus } from "@prisma/client";

interface CreateConsultationDTO {
  consultation_id: string;
  murid_id: string;
  admin_id: string;
  topic: string;
  consultation_date: Date;
  description?: string; // Catatan dari murid
}

interface UpdateConsultationStatusDTO {
  consultation_id: string;
  status: ConsultationStatus;
  admin_notes?: string; // Catatan dari admin (alasan decline/accept)
  is_active?: boolean; // Flag untuk soft delete
}

interface RescheduleConsultationDTO {
  consultation_id: string;
  newDate: Date;
  rescheduleReason: string; // Akan disimpan ke admin_notes
}

interface ConsultationFilters {
  status?: ConsultationStatus;
  murid_id?: string;
  admin_id?: string;
  limit?: number;
  offset?: number;
}

export class ConsultationRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }
  // Create consultation
  async create(data: CreateConsultationDTO) {
    return this.prisma.consultation.create({
      data,
      include: {
        murid: {
          select: {
            user_id: true,
            firstname: true,
            lastname: true,
            email: true,
            kelas: true,
          },
        },
        admin: {
          select: {
            user_id: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
    });
  }

  // Find by ID
  async findById(consultation_id: string) {
    return this.prisma.consultation.findUnique({
      where: { consultation_id },
      include: {
        murid: {
          select: {
            user_id: true,
            firstname: true,
            lastname: true,
            email: true,
            kelas: true,
          },
        },
        admin: {
          select: {
            user_id: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
    });
  }

  // Find many with filters
  async findMany(filters: ConsultationFilters = {}) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.murid_id) {
      where.murid_id = filters.murid_id;
    }

    if (filters.admin_id) {
      where.admin_id = filters.admin_id;
    }

    return this.prisma.consultation.findMany({
      where,
      include: {
        murid: {
          select: {
            user_id: true,
            firstname: true,
            lastname: true,
            email: true,
            kelas: true,
          },
        },
        admin: {
          select: {
            user_id: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      take: filters.limit || undefined,
      skip: filters.offset || undefined,
    });
  }

  // Find by status
  async findByStatus(status: ConsultationStatus) {
    return this.findMany({ status });
  }

  // Find by student ID
  async findByMuridId(murid_id: string) {
    return this.findMany({ murid_id });
  }

  // Find by admin ID
  async findByAdminId(admin_id: string) {
    return this.findMany({ admin_id });
  }

  // Update status
  async updateStatus(data: UpdateConsultationStatusDTO) {
    const updatedConsultation = await this.prisma.consultation.update({
      where: { consultation_id: data.consultation_id },
      data: {
        status: data.status,
        admin_notes: data.admin_notes,
        // Allow explicit is_active override, otherwise auto-set based on status
        is_active:
          data.is_active !== undefined
            ? data.is_active
            : data.status === ConsultationStatus.DECLINED
            ? false
            : undefined,
      },
      include: {
        murid: {
          select: {
            user_id: true,
            firstname: true,
            lastname: true,
            email: true,
            kelas: true,
          },
        },
        admin: {
          select: {
            user_id: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
    });

    // ✨ Create notification for student
    if (data.status === ConsultationStatus.ACCEPTED) {
      await this.prisma.notification.create({
        data: {
          user_id: updatedConsultation.murid_id,
          type: "CONSULTATION_ACCEPTED",
          title: "Konsultasi Diterima",
          message: `Konsultasi Anda tentang "${updatedConsultation.topic}" telah diterima oleh ${updatedConsultation.admin.firstname} ${updatedConsultation.admin.lastname}.`,
          related_id: updatedConsultation.consultation_id,
          is_read: false,
        },
      });
    } else if (data.status === ConsultationStatus.DECLINED) {
      await this.prisma.notification.create({
        data: {
          user_id: updatedConsultation.murid_id,
          type: "CONSULTATION_REJECTED",
          title: "Konsultasi Ditolak",
          message: `Konsultasi Anda tentang "${
            updatedConsultation.topic
          }" ditolak. ${data.admin_notes ? `Alasan: ${data.admin_notes}` : ""}`,
          related_id: updatedConsultation.consultation_id,
          is_read: false,
        },
      });
    }

    return updatedConsultation;
  }

  // Reschedule consultation
  async reschedule(data: RescheduleConsultationDTO) {
    return this.prisma.consultation.update({
      where: { consultation_id: data.consultation_id },
      data: {
        consultation_date: data.newDate,
        admin_notes: `[DIJADWALKAN ULANG] ${data.rescheduleReason}`,
      },
      include: {
        murid: {
          select: {
            user_id: true,
            firstname: true,
            lastname: true,
            email: true,
            kelas: true,
          },
        },
        admin: {
          select: {
            user_id: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
    });
  }

  // Delete consultation
  async delete(consultation_id: string) {
    return this.prisma.consultation.delete({
      where: { consultation_id },
    });
  }

  // Get statistics
  async getStats() {
    const [total, pending, accepted, declined] = await Promise.all([
      this.prisma.consultation.count(),
      this.prisma.consultation.count({
        where: { status: ConsultationStatus.PENDING },
      }),
      this.prisma.consultation.count({
        where: { status: ConsultationStatus.ACCEPTED },
      }),
      this.prisma.consultation.count({
        where: { status: ConsultationStatus.DECLINED },
      }),
    ]);

    return {
      total,
      pending,
      accepted,
      declined,
    };
  }

  // Find last consultation for generating ID
  async findLastConsultation() {
    return this.prisma.consultation.findFirst({
      orderBy: { consultation_id: "desc" },
      where: {
        consultation_id: {
          startsWith: "CS",
        },
      },
      select: { consultation_id: true },
    });
  }

  // Find active consultation by student ID
  async findActiveByMuridId(murid_id: string) {
    return this.prisma.consultation.findFirst({
      where: {
        murid_id,
        is_active: true,
        status: {
          in: [ConsultationStatus.PENDING, ConsultationStatus.ACCEPTED],
        },
      },
      include: {
        murid: {
          select: {
            user_id: true,
            firstname: true,
            lastname: true,
            email: true,
            kelas: true,
          },
        },
        admin: {
          select: {
            user_id: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
    });
  }

  // Set consultation as inactive
  async setInactive(consultation_id: string) {
    return this.prisma.consultation.update({
      where: { consultation_id },
      data: {
        is_active: false,
        status: "COMPLETED",
      },
      include: {
        murid: {
          select: {
            user_id: true,
            firstname: true,
            lastname: true,
            email: true,
            kelas: true,
          },
        },
        admin: {
          select: {
            user_id: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
    });
  }

  // Find active accepted consultations within timeframe
  async findActiveAcceptedConsultations(startTime: Date, endTime: Date) {
    return this.prisma.consultation.findMany({
      where: {
        status: "ACCEPTED",
        is_active: true,
        consultation_date: {
          gte: startTime,
          lte: endTime,
        },
      },
      include: {
        murid: {
          select: {
            user_id: true,
            firstname: true,
            lastname: true,
            kelas: true,
          },
        },
        chatRoom: {
          include: {
            messages: {
              orderBy: { created_at: "desc" },
              take: 1,
            },
            _count: {
              select: {
                messages: {
                  where: {
                    is_read: false,
                    sender: { role: "STUDENT" },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { consultation_date: "desc" },
    });
  }

  // Find inactive consultations with chat rooms
  async findInactiveConsultationsWithChat() {
    return this.prisma.consultation.findMany({
      where: {
        is_active: false,
        chatRoom: {
          isNot: null,
        },
      },
      include: {
        murid: {
          select: {
            user_id: true,
            firstname: true,
            lastname: true,
            kelas: true,
          },
        },
        admin: {
          select: {
            user_id: true,
            firstname: true,
            lastname: true,
          },
        },
        chatRoom: {
          include: {
            messages: {
              orderBy: { created_at: "desc" },
              take: 1,
            },
            _count: {
              select: {
                messages: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
  }

  // Find expired consultations (for scheduler)
  async findExpiredConsultations(oneHourAgo: Date) {
    return this.prisma.consultation.findMany({
      where: {
        status: "ACCEPTED",
        is_active: true,
        consultation_date: {
          lt: oneHourAgo,
        },
      },
    });
  }

  // Bulk update consultation status (for scheduler)
  async bulkUpdateStatus(
    consultationIds: string[],
    status: ConsultationStatus,
    isActive: boolean
  ) {
    return this.prisma.consultation.updateMany({
      where: {
        consultation_id: {
          in: consultationIds,
        },
      },
      data: {
        is_active: isActive,
        status: status,
      },
    });
  }
}
