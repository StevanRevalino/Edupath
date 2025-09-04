import { PrismaClient, ConsultationStatus } from "@prisma/client";

const prisma = new PrismaClient();

interface CreateConsultationDTO {
  consultation_id: string;
  murid_id: string;
  admin_id: string;
  topic: string;
  consultation_date: Date;
  notes?: string;
}

interface UpdateConsultationStatusDTO {
  consultation_id: string;
  status: ConsultationStatus;
  notes?: string;
}

interface ConsultationFilters {
  status?: ConsultationStatus;
  murid_id?: string;
  admin_id?: string;
  limit?: number;
  offset?: number;
}

export class ConsultationRepository {
  // Create consultation
  async create(data: CreateConsultationDTO) {
    return prisma.consultation.create({
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
    return prisma.consultation.findUnique({
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

    return prisma.consultation.findMany({
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
    return prisma.consultation.update({
      where: { consultation_id: data.consultation_id },
      data: {
        status: data.status,
        notes: data.notes,
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
    return prisma.consultation.delete({
      where: { consultation_id },
    });
  }

  // Get statistics
  async getStats() {
    const [total, pending, accepted, declined] = await Promise.all([
      prisma.consultation.count(),
      prisma.consultation.count({
        where: { status: ConsultationStatus.PENDING },
      }),
      prisma.consultation.count({
        where: { status: ConsultationStatus.ACCEPTED },
      }),
      prisma.consultation.count({
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
    return prisma.consultation.findFirst({
      orderBy: { consultation_id: "desc" },
      where: {
        consultation_id: {
          startsWith: "CS",
        },
      },
      select: { consultation_id: true },
    });
  }
}
