import { Request, Response } from "express";
import { ConsultationService } from "../services/consultationService";
import { ConsultationStatus } from "@prisma/client";

export class ConsultationController {
  private consultationService: ConsultationService;

  constructor() {
    this.consultationService = new ConsultationService();
  }
  // Create a new consultation
  async createConsultation(req: Request, res: Response) {
    try {
      const { murid_id, admin_id, topic, consultation_date, notes } = req.body;

      // Basic validation
      if (!murid_id || !admin_id || !topic || !consultation_date) {
        return res.status(400).json({
          success: false,
          message:
            "Murid ID, Admin ID, topic, dan tanggal konseling wajib diisi",
        });
      }

      // Check if student has an active consultation
      const hasActiveConsultation =
        await this.consultationService.hasActiveConsultation(murid_id);
      if (hasActiveConsultation) {
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
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

      if (consultationDate < fiveMinutesFromNow) {
        return res.status(400).json({
          success: false,
          message: "Tanggal konseling harus minimal 5 menit dari sekarang",
        });
      }

      const consultation = await this.consultationService.createConsultation({
        murid_id,
        admin_id,
        topic,
        consultation_date: consultationDate,
        notes,
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

      if (limit) {
        filters.limit = parseInt(limit as string);
      }

      if (offset) {
        filters.offset = parseInt(offset as string);
      }

      const consultations = await this.consultationService.getAllConsultations(
        filters
      );

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
      const students =
        await this.consultationService.getStudentsWithAcceptedConsultations();

      return res.status(200).json({
        success: true,
        message: "Berhasil mengambil data murid dengan konseling ter-accept",
        data: students,
        count: students.length,
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

      const consultation = await this.consultationService.getConsultationById(
        id
      );

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
      const { status, notes } = req.body;

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

      const updatedConsultation =
        await this.consultationService.updateConsultationStatus({
          consultation_id: id,
          status: status as ConsultationStatus,
          notes,
        });

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

      const consultations =
        await this.consultationService.getConsultationsByStatus(
          status.toUpperCase() as ConsultationStatus
        );

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

      const consultations =
        await this.consultationService.getConsultationsForStudent(student_id);

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

      const consultations =
        await this.consultationService.getConsultationsForAdmin(admin_id);

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

      const result =
        await this.consultationService.getConsultationsForStudentByName(
          firstname,
          lastname as string
        );

      return res.status(200).json({
        success: true,
        message: "Berhasil mengambil konseling berdasarkan nama siswa",
        data: result,
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

      const result = await this.consultationService.deleteConsultation(id);

      return res.status(200).json({
        success: true,
        message: result.message,
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
      const stats = await this.consultationService.getConsultationStats();

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

      const updatedConsultation =
        await this.consultationService.endConsultation(id);

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

      const bookedSlots = await this.consultationService.getBookedSlotsForDate(
        targetDate,
        adminId as string
      );

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
}
