import { Request, Response } from "express";
import { ConsultationStatus } from "@prisma/client";
import prisma from "../configs/prisma";

export class ConsultationController {
  constructor() {
    // Bind methods to preserve 'this' context
    this.createConsultation = this.createConsultation.bind(this);
    this.getAllConsultations = this.getAllConsultations.bind(this);
    this.getStudentsWithAcceptedConsultations =
      this.getStudentsWithAcceptedConsultations.bind(this);
    this.getConsultationById = this.getConsultationById.bind(this);
    this.updateConsultationStatus = this.updateConsultationStatus.bind(this);
    this.cancelConsultation = this.cancelConsultation.bind(this);
    this.rescheduleConsultation = this.rescheduleConsultation.bind(this);
    this.getConsultationsByStatus = this.getConsultationsByStatus.bind(this);
    this.getConsultationsForStudent =
      this.getConsultationsForStudent.bind(this);
    this.getConsultationsForAdmin = this.getConsultationsForAdmin.bind(this);
    this.getConsultationsForStudentByName =
      this.getConsultationsForStudentByName.bind(this);
    this.deleteConsultation = this.deleteConsultation.bind(this);
    this.getConsultationStats = this.getConsultationStats.bind(this);
    this.endConsultation = this.endConsultation.bind(this);
    this.getBookedSlotsForDate = this.getBookedSlotsForDate.bind(this);
    this.autoCompleteExpiredConsultations =
      this.autoCompleteExpiredConsultations.bind(this);
  }

  // Helper: Generate custom consultation ID
  private async generateCustomConsultationId(): Promise<string> {
    const lastConsultation = await prisma.consultation.findFirst({
      orderBy: { consultation_id: "desc" },
      where: { consultation_id: { startsWith: "CS" } },
      select: { consultation_id: true },
    });

    let lastNumber = 0;
    if (lastConsultation) {
      const numPart = parseInt(
        lastConsultation.consultation_id.replace("CS", "")
      );
      lastNumber = isNaN(numPart) ? 0 : numPart;
    }

    const nextNumber = lastNumber + 1;
    return `CS${String(nextNumber).padStart(3, "0")}`;
  }

  // Helper: Check if there's a scheduling conflict
  private async checkScheduleConflict(
    consultationDate: Date,
    excludeConsultationId?: string
  ): Promise<boolean> {
    const startTime = new Date(consultationDate);
    const endTime = new Date(consultationDate);
    endTime.setHours(endTime.getHours() + 1);

    const allConsultations = await prisma.consultation.findMany({});

    for (const consultation of allConsultations) {
      if (
        excludeConsultationId &&
        consultation.consultation_id === excludeConsultationId
      ) {
        continue;
      }

      if (consultation.status === ConsultationStatus.DECLINED) {
        continue;
      }

      if (
        consultation.status === ConsultationStatus.COMPLETED &&
        !consultation.is_active
      ) {
        continue;
      }

      const existingStart = new Date(consultation.consultation_date);
      const existingEnd = new Date(consultation.consultation_date);
      existingEnd.setHours(existingEnd.getHours() + 1);

      if (startTime < existingEnd && endTime > existingStart) {
        return true;
      }
    }

    return false;
  }
  // Create a new consultation
  async createConsultation(req: Request, res: Response) {
    try {
      const { murid_id, admin_id, topic, consultation_date, description } =
        req.body;

      // Basic validation
      if (!murid_id || !admin_id || !topic || !consultation_date) {
        return res.status(400).json({
          success: false,
          message:
            "Murid ID, Admin ID, topic, dan tanggal konseling wajib diisi",
        });
      }

      // Verify that murid exists and has STUDENT role
      const murid = await prisma.user.findUnique({
        where: { user_id: murid_id },
      });

      if (!murid) {
        return res.status(400).json({
          success: false,
          message: "Murid tidak ditemukan",
        });
      }

      if (murid.role !== "STUDENT") {
        return res.status(400).json({
          success: false,
          message:
            "User harus berperan sebagai student untuk membuat konseling",
        });
      }

      // Verify that admin exists and has ADMIN role
      const admin = await prisma.user.findUnique({
        where: { user_id: admin_id },
      });

      if (!admin) {
        return res.status(400).json({
          success: false,
          message: "Admin tidak ditemukan",
        });
      }

      if (admin.role !== "ADMIN") {
        return res.status(400).json({
          success: false,
          message: "User harus berperan sebagai admin untuk menerima konseling",
        });
      }

      // Check if student has an active consultation
      const activeConsultation = await prisma.consultation.findFirst({
        where: {
          murid_id,
          is_active: true,
          status: {
            in: [ConsultationStatus.PENDING, ConsultationStatus.ACCEPTED],
          },
        },
      });

      if (activeConsultation) {
        return res.status(400).json({
          success: false,
          message:
            "Anda masih memiliki konsultasi yang sedang aktif. Harap selesaikan konsultasi tersebut terlebih dahulu.",
        });
      }

      // Validate date format
      const consultationDate = new Date(consultation_date);
      if (isNaN(consultationDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Format tanggal tidak valid",
        });
      }

      // Check if consultation date is in the future (with 5 minute margin to account for processing time)
      const now = new Date();
      const indonesiaTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
      );
      const fiveMinutesFromNow = new Date(
        indonesiaTime.getTime() + 5 * 60 * 1000
      );

      if (consultationDate < fiveMinutesFromNow) {
        return res.status(400).json({
          success: false,
          message: "Tanggal konseling harus minimal 5 menit dari sekarang",
        });
      }

      // Check for scheduling conflicts
      const hasConflict = await this.checkScheduleConflict(consultationDate);
      if (hasConflict) {
        return res.status(409).json({
          success: false,
          message:
            "Jadwal konseling bentrok dengan konseling lain. Silakan pilih waktu yang berbeda.",
        });
      }

      const customId = await this.generateCustomConsultationId();

      const consultation = await prisma.consultation.create({
        data: {
          consultation_id: customId,
          murid_id,
          admin_id,
          topic,
          consultation_date: consultationDate,
          description,
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

      return res.status(201).json({
        success: true,
        message: "Konseling berhasil dibuat",
        data: consultation,
      });
    } catch (error: any) {
      // Check for specific error messages
      if (error.message && error.message.includes("bertabrakan")) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message || "Terjadi kesalahan saat membuat konseling",
      });
    }
  }

  // Get all consultations with optional filters
  async getAllConsultations(req: Request, res: Response) {
    try {
      const { status, murid_id, admin_id, limit, offset } = req.query;
      const user = req.user; // Get authenticated user from JWT

      const filters: any = {};

      // Filter based on user role
      if (user?.role === "STUDENT") {
        // If user is a student, only show their own consultations
        filters.murid_id = user.user_id;
      } else if (user?.role === "ADMIN") {
        // Admin only sees consultations assigned to them
        filters.admin_id = user.user_id;

        // Admin can additionally filter by specific murid_id if provided
        if (murid_id) {
          filters.murid_id = murid_id as string;
        }
      }

      if (status) {
        filters.status = status as string;
      }

      const where: any = {};
      if (filters.status) where.status = filters.status;
      if (filters.murid_id) where.murid_id = filters.murid_id;
      if (filters.admin_id) where.admin_id = filters.admin_id;

      const consultations = await prisma.consultation.findMany({
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
        orderBy: { created_at: "desc" },
        take: filters.limit || undefined,
        skip: filters.offset || undefined,
      });

      return res.status(200).json({
        success: true,
        message: "Berhasil mengambil data konseling",
        data: consultations,
        count: consultations.length,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message:
          error.message || "Terjadi kesalahan saat mengambil data konseling",
      });
    }
  }

  // Get students with accepted consultations for live chat
  async getStudentsWithAcceptedConsultations(req: Request, res: Response) {
    try {
      // Get current time in Indonesia (WIB - UTC+7)
      const now = new Date();
      const indonesiaTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
      );

      const acceptedConsultations = await prisma.consultation.findMany({
        where: { status: ConsultationStatus.ACCEPTED },
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
        },
      });

      // Filter consultations that are currently ongoing (started and not yet ended)
      const ongoingConsultations = acceptedConsultations.filter(
        (consultation) => {
          const consultationStart = new Date(consultation.consultation_date);
          const consultationEnd = new Date(
            consultationStart.getTime() + 60 * 60 * 1000
          ); // +1 hour

          // Check if current time (Indonesia) is between start and end time
          return (
            indonesiaTime >= consultationStart &&
            indonesiaTime < consultationEnd &&
            consultation.is_active
          );
        }
      );

      // Extract unique murid_ids from ongoing consultations only
      const uniqueMuridIds = [
        ...new Set(ongoingConsultations.map((c) => c.murid_id)),
      ];

      // Get student details for each unique murid
      const students = await Promise.all(
        uniqueMuridIds.map(async (muridId) => {
          const student = await prisma.user.findUnique({
            where: { user_id: muridId },
          });

          if (student) {
            // Get the latest ongoing consultation for this student
            const latestConsultation = ongoingConsultations
              .filter((c) => c.murid_id === muridId)
              .sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )[0];

            return {
              user_id: student.user_id,
              firstname: student.firstname,
              lastname: student.lastname,
              kelas: student.kelas,
              latestConsultationTopic: latestConsultation?.topic,
              latestConsultationDate: latestConsultation?.consultation_date,
            };
          }
          return null;
        })
      );

      // Filter out null values
      const validStudents = students.filter((student) => student !== null);

      return res.status(200).json({
        success: true,
        message: "Berhasil mengambil data murid dengan konseling ter-accept",
        data: validStudents,
        count: validStudents.length,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Terjadi kesalahan saat mengambil data murid",
      });
    }
  }

  // Get consultation by ID
  async getConsultationById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "ID konseling wajib diisi",
        });
      }

      const consultation = await prisma.consultation.findUnique({
        where: { consultation_id: id },
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

      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: "Konseling tidak ditemukan",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Berhasil mengambil data konseling",
        data: consultation,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || "Konseling tidak ditemukan",
      });
    }
  }

  // Update consultation status (accept/decline)
  async updateConsultationStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, admin_notes } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "ID konseling wajib diisi",
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status wajib diisi",
        });
      }

      // Validate status value
      const validStatuses = Object.values(ConsultationStatus);
      if (!validStatuses.includes(status as ConsultationStatus)) {
        return res.status(400).json({
          success: false,
          message:
            "Status harus salah satu dari: PENDING, ACCEPTED, DECLINED, COMPLETED",
        });
      }

      const existingConsultation = await prisma.consultation.findUnique({
        where: { consultation_id: id },
      });

      if (!existingConsultation) {
        return res.status(404).json({
          success: false,
          message: "Konseling tidak ditemukan",
        });
      }

      // Automatically set is_active to false for DECLINED and COMPLETED status
      let isActive = existingConsultation.is_active;
      if (
        status === ConsultationStatus.DECLINED ||
        status === ConsultationStatus.COMPLETED
      ) {
        isActive = false;
      }

      const updatedConsultation = await prisma.consultation.update({
        where: { consultation_id: id },
        data: {
          status: status as ConsultationStatus,
          admin_notes:
            admin_notes || existingConsultation.admin_notes || undefined,
          is_active: isActive,
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

      // Create notification for student
      if (status === ConsultationStatus.ACCEPTED) {
        await prisma.notification.create({
          data: {
            user_id: updatedConsultation.murid_id,
            type: "CONSULTATION_ACCEPTED",
            title: "Konsultasi Diterima",
            message: `Konsultasi Anda tentang "${updatedConsultation.topic}" telah diterima oleh ${updatedConsultation.admin.firstname} ${updatedConsultation.admin.lastname}.`,
            related_id: updatedConsultation.consultation_id,
            is_read: false,
          },
        });
      } else if (status === ConsultationStatus.DECLINED) {
        await prisma.notification.create({
          data: {
            user_id: updatedConsultation.murid_id,
            type: "CONSULTATION_REJECTED",
            title: "Konsultasi Ditolak",
            message: `Konsultasi Anda tentang "${
              updatedConsultation.topic
            }" ditolak. ${admin_notes ? `Alasan: ${admin_notes}` : ""}`,
            related_id: updatedConsultation.consultation_id,
            is_read: false,
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: "Status konseling berhasil diperbarui",
        data: updatedConsultation,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Terjadi kesalahan saat memperbarui status konseling",
      });
    }
  }

  // Cancel consultation (by student)
  async cancelConsultation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { cancelReason } = req.body;
      const user = (req as any).user;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "ID konseling wajib diisi",
        });
      }

      if (!cancelReason || cancelReason.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Alasan pembatalan wajib diisi",
        });
      }

      // Get consultation to verify it belongs to the user
      const consultation = await prisma.consultation.findUnique({
        where: { consultation_id: id },
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

      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: "Konseling tidak ditemukan",
        });
      }

      // Verify user is the owner (murid)
      if (consultation.murid_id !== user.user_id) {
        return res.status(403).json({
          success: false,
          message: "Anda tidak memiliki akses untuk membatalkan konseling ini",
        });
      }

      // Only allow canceling PENDING or ACCEPTED consultations
      if (
        consultation.status !== ConsultationStatus.PENDING &&
        consultation.status !== ConsultationStatus.ACCEPTED
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Hanya konseling dengan status PENDING atau ACCEPTED yang dapat dibatalkan",
        });
      }

      // Update consultation to inactive (is_active = false) instead of deleting
      const updatedConsultation = await prisma.consultation.update({
        where: { consultation_id: id },
        data: {
          status: ConsultationStatus.DECLINED,
          admin_notes: `[DIBATALKAN OLEH MURID] ${cancelReason}`,
          is_active: false,
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

      return res.status(200).json({
        success: true,
        message: "Konseling berhasil dibatalkan",
        data: updatedConsultation,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message:
          error.message || "Terjadi kesalahan saat membatalkan konseling",
      });
    }
  }

  // Reschedule consultation (by admin)
  async rescheduleConsultation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { newDate, rescheduleReason } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "ID konseling wajib diisi",
        });
      }

      if (!newDate) {
        return res.status(400).json({
          success: false,
          message: "Tanggal baru wajib diisi",
        });
      }

      if (!rescheduleReason || rescheduleReason.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Alasan reschedule wajib diisi",
        });
      }

      // Validate date format
      const newConsultationDate = new Date(newDate);
      if (isNaN(newConsultationDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Format tanggal tidak valid",
        });
      }

      // Check if new date is in the future
      const now = new Date();
      const indonesiaTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
      );
      const fiveMinutesFromNow = new Date(
        indonesiaTime.getTime() + 5 * 60 * 1000
      );

      if (newConsultationDate < fiveMinutesFromNow) {
        return res.status(400).json({
          success: false,
          message: "Tanggal konseling harus minimal 5 menit dari sekarang",
        });
      }

      // Get consultation to verify it exists and is ACCEPTED
      const consultation = await prisma.consultation.findUnique({
        where: { consultation_id: id },
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

      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: "Konseling tidak ditemukan",
        });
      }

      // Only allow rescheduling ACCEPTED consultations
      if (consultation.status !== ConsultationStatus.ACCEPTED) {
        return res.status(400).json({
          success: false,
          message:
            "Hanya konseling dengan status ACCEPTED yang dapat di-reschedule",
        });
      }

      // Check for scheduling conflict (exclude current consultation)
      const hasConflict = await this.checkScheduleConflict(
        newConsultationDate,
        id
      );

      if (hasConflict) {
        return res.status(409).json({
          success: false,
          message:
            "Jadwal konseling bentrok dengan konseling lain. Silakan pilih waktu lain.",
        });
      }

      // Update consultation with new date and reschedule note
      const updatedConsultation = await prisma.consultation.update({
        where: { consultation_id: id },
        data: {
          consultation_date: newConsultationDate,
          admin_notes: `[DIJADWALKAN ULANG] ${rescheduleReason}`,
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

      return res.status(200).json({
        success: true,
        message: "Konseling berhasil di-reschedule",
        data: updatedConsultation,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Terjadi kesalahan saat reschedule konseling",
      });
    }
  }

  // Get consultations by status
  async getConsultationsByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status wajib diisi",
        });
      }

      const validStatuses = Object.values(ConsultationStatus);
      if (!validStatuses.includes(status.toUpperCase() as ConsultationStatus)) {
        return res.status(400).json({
          success: false,
          message: "Status harus salah satu dari: pending, accepted, declined",
        });
      }

      const consultations = await prisma.consultation.findMany({
        where: { status: status.toUpperCase() as ConsultationStatus },
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
        orderBy: { created_at: "desc" },
      });

      return res.status(200).json({
        success: true,
        message: `Berhasil mengambil konseling dengan status ${status}`,
        data: consultations,
        count: consultations.length,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message:
          error.message || "Terjadi kesalahan saat mengambil data konseling",
      });
    }
  }

  // Get consultations for a specific student
  async getConsultationsForStudent(req: Request, res: Response) {
    try {
      const { student_id } = req.params;

      if (!student_id) {
        return res.status(400).json({
          success: false,
          message: "ID siswa wajib diisi",
        });
      }

      const consultations = await prisma.consultation.findMany({
        where: { murid_id: student_id },
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
        orderBy: { created_at: "desc" },
      });

      return res.status(200).json({
        success: true,
        message: "Berhasil mengambil konseling untuk siswa",
        data: consultations,
        count: consultations.length,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message:
          error.message || "Terjadi kesalahan saat mengambil data konseling",
      });
    }
  }

  // Get consultations for a specific admin
  async getConsultationsForAdmin(req: Request, res: Response) {
    try {
      const { admin_id } = req.params;

      if (!admin_id) {
        return res.status(400).json({
          success: false,
          message: "ID admin wajib diisi",
        });
      }

      const consultations = await prisma.consultation.findMany({
        where: { admin_id: admin_id },
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
        orderBy: { created_at: "desc" },
      });

      return res.status(200).json({
        success: true,
        message: "Berhasil mengambil konseling untuk admin",
        data: consultations,
        count: consultations.length,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message:
          error.message || "Terjadi kesalahan saat mengambil data konseling",
      });
    }
  }

  // Get consultations for students by name
  async getConsultationsForStudentByName(req: Request, res: Response) {
    try {
      const { firstname } = req.params;
      const { lastname } = req.query;

      if (!firstname) {
        return res.status(400).json({
          success: false,
          message: "Nama depan siswa wajib diisi",
        });
      }

      // Find students with matching name
      const whereClause: any = {
        firstname: { contains: firstname, mode: "insensitive" },
        role: "STUDENT",
      };

      if (lastname) {
        whereClause.lastname = {
          contains: lastname as string,
          mode: "insensitive",
        };
      }

      const students = await prisma.user.findMany({
        where: whereClause,
      });

      if (students.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Tidak ada siswa ditemukan dengan nama tersebut",
        });
      }

      // Get consultations for all matching students
      const consultationsPromises = students.map((student) =>
        prisma.consultation.findMany({
          where: { murid_id: student.user_id },
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
          orderBy: { created_at: "desc" },
        })
      );

      const allConsultations = await Promise.all(consultationsPromises);

      // Flatten the results and add student info
      const consultations = allConsultations.flat().map((consultation) => ({
        ...consultation,
        student_info: students.find((s) => s.user_id === consultation.murid_id),
      }));

      return res.status(200).json({
        success: true,
        message: "Berhasil mengambil konseling berdasarkan nama siswa",
        data: {
          students: students,
          consultations: consultations,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message:
          error.message || "Terjadi kesalahan saat mengambil data konseling",
      });
    }
  }

  // Delete consultation
  async deleteConsultation(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "ID konseling wajib diisi",
        });
      }

      const existingConsultation = await prisma.consultation.findUnique({
        where: { consultation_id: id },
      });

      if (!existingConsultation) {
        return res.status(404).json({
          success: false,
          message: "Konseling tidak ditemukan",
        });
      }

      await prisma.consultation.delete({
        where: { consultation_id: id },
      });

      return res.status(200).json({
        success: true,
        message: "Konseling berhasil dihapus",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Terjadi kesalahan saat menghapus konseling",
      });
    }
  }

  // Get consultation statistics
  async getConsultationStats(req: Request, res: Response) {
    try {
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

      const stats = {
        total,
        pending,
        accepted,
        declined,
      };

      return res.status(200).json({
        success: true,
        message: "Berhasil mengambil statistik konseling",
        data: stats,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Terjadi kesalahan saat mengambil statistik konseling",
      });
    }
  }

  // End consultation (set is_active to false)
  async endConsultation(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "ID konseling wajib diisi",
        });
      }

      const existingConsultation = await prisma.consultation.findUnique({
        where: { consultation_id: id },
      });

      if (!existingConsultation) {
        return res.status(404).json({
          success: false,
          message: "Konseling tidak ditemukan",
        });
      }

      if (!existingConsultation.is_active) {
        return res.status(400).json({
          success: false,
          message: "Konseling sudah tidak aktif",
        });
      }

      const updatedConsultation = await prisma.consultation.update({
        where: { consultation_id: id },
        data: {
          is_active: false,
          status: ConsultationStatus.COMPLETED,
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

      return res.status(200).json({
        success: true,
        message: "Konseling berhasil diakhiri",
        data: updatedConsultation,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Terjadi kesalahan saat mengakhiri konseling",
      });
    }
  }

  // Get booked slots for a specific date and admin
  async getBookedSlotsForDate(req: Request, res: Response) {
    try {
      const { date, adminId } = req.query;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: "Tanggal wajib diisi",
        });
      }

      if (!adminId) {
        return res.status(400).json({
          success: false,
          message: "Admin ID wajib diisi",
        });
      }

      const targetDate = new Date(date as string);
      if (isNaN(targetDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Format tanggal tidak valid",
        });
      }

      // Extract year, month, day from the input date in UTC
      const targetYear = targetDate.getUTCFullYear();
      const targetMonth = targetDate.getUTCMonth();
      const targetDay = targetDate.getUTCDate();

      // Get all consultations for this specific admin
      const allConsultations = await prisma.consultation.findMany({
        where: { admin_id: adminId as string },
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
        orderBy: { created_at: "desc" },
      });

      // Filter for consultations on this specific date
      const bookedSlots = allConsultations
        .filter((consultation) => {
          // Skip declined consultations
          if (consultation.status === ConsultationStatus.DECLINED) {
            return false;
          }

          // Skip completed and inactive consultations
          if (
            consultation.status === ConsultationStatus.COMPLETED &&
            !consultation.is_active
          ) {
            return false;
          }

          const consultationDate = new Date(consultation.consultation_date);

          // Compare using UTC date components to match input format
          const consultationYear = consultationDate.getUTCFullYear();
          const consultationMonth = consultationDate.getUTCMonth();
          const consultationDay = consultationDate.getUTCDate();

          // Compare year, month, day in UTC
          return (
            consultationYear === targetYear &&
            consultationMonth === targetMonth &&
            consultationDay === targetDay
          );
        })
        .map((consultation) => {
          const consultationDate = new Date(consultation.consultation_date);

          // Get hours and minutes in LOCAL timezone for display
          const startHour = consultationDate.getHours();
          const startMinute = consultationDate.getMinutes();
          const startTime = `${startHour
            .toString()
            .padStart(2, "0")}:${startMinute.toString().padStart(2, "0")}`;

          const endHour = startHour + 1;
          const endTime = `${endHour.toString().padStart(2, "0")}:${startMinute
            .toString()
            .padStart(2, "0")}`;

          return {
            startTime,
            endTime,
            consultation_id: consultation.consultation_id,
            status: consultation.status,
          };
        });

      return res.status(200).json({
        success: true,
        message: "Berhasil mengambil data slot yang sudah terisi",
        data: bookedSlots,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Terjadi kesalahan saat mengambil data slot yang terisi",
      });
    }
  }

  // Auto-complete expired consultations
  async autoCompleteExpiredConsultations(req: Request, res: Response) {
    try {
      // Get current time in Indonesia (WIB - UTC+7)
      const now = new Date();
      const indonesiaTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
      );

      // Get all accepted consultations (they should be active)
      const activeConsultations = await prisma.consultation.findMany({
        where: { status: ConsultationStatus.ACCEPTED },
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

      // Filter only active consultations that have passed their end time
      const expiredConsultations = activeConsultations.filter(
        (consultation) => {
          if (!consultation.is_active) return false;

          const consultationDate = new Date(consultation.consultation_date);
          const endTime = new Date(consultationDate.getTime() + 60 * 60 * 1000); // +1 hour

          // Check if current time (Indonesia) is past the end time
          return indonesiaTime >= endTime;
        }
      );

      const completedConsultations = [];

      // Update each expired consultation to COMPLETED
      for (const consultation of expiredConsultations) {
        const updated = await prisma.consultation.update({
          where: { consultation_id: consultation.consultation_id },
          data: {
            status: ConsultationStatus.COMPLETED,
            is_active: false,
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

        completedConsultations.push(updated);
      }

      return res.status(200).json({
        success: true,
        message: `${completedConsultations.length} konseling berhasil diselesaikan otomatis`,
        data: {
          count: completedConsultations.length,
          consultations: completedConsultations,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Terjadi kesalahan saat menyelesaikan konseling otomatis",
      });
    }
  }
}
