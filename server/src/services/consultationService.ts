import { ConsultationStatus } from "@prisma/client";
import { ConsultationRepository } from "../repositories/consultationRepository";
import { UserRepository } from "../repositories/userRepository";

const consultationRepository = new ConsultationRepository();
const userRepository = new UserRepository();

interface CreateConsultationData {
  murid_id: string;
  admin_id: string;
  topic: string;
  consultation_date: Date;
  notes?: string;
}

interface UpdateConsultationStatusData {
  consultation_id: string;
  status: ConsultationStatus;
  notes?: string;
}

const generateCustomConsultationId = async (): Promise<string> => {
  const lastConsultation = await consultationRepository.findLastConsultation();

  let lastNumber = 0;

  if (lastConsultation) {
    const numPart = parseInt(
      lastConsultation.consultation_id.replace("CS", "")
    );
    lastNumber = isNaN(numPart) ? 0 : numPart;
  }

  const nextNumber = lastNumber + 1;
  return `CS${String(nextNumber).padStart(3, "0")}`;
};

export class ConsultationService {
  // Create new consultation
  async createConsultation(data: CreateConsultationData) {
    try {
      // Verify that murid exists and has STUDENT role
      const murid = await userRepository.findById(data.murid_id);

      if (!murid) {
        throw new Error("Murid tidak ditemukan");
      }

      if (murid.role !== "STUDENT") {
        throw new Error(
          "User harus berperan sebagai student untuk membuat konseling"
        );
      }

      // Verify that admin exists and has ADMIN role
      const admin = await userRepository.findById(data.admin_id);

      if (!admin) {
        throw new Error("Admin tidak ditemukan");
      }

      if (admin.role !== "ADMIN") {
        throw new Error(
          "User harus berperan sebagai admin untuk menerima konseling"
        );
      }

      const customId = await generateCustomConsultationId();

      const consultation = await consultationRepository.create({
        consultation_id: customId,
        murid_id: data.murid_id,
        admin_id: data.admin_id,
        topic: data.topic,
        consultation_date: data.consultation_date,
        notes: data.notes,
      });

      return consultation;
    } catch (error) {
      throw error;
    }
  }

  // Get all consultations with optional filters
  async getAllConsultations(
    filters: {
      status?: ConsultationStatus;
      murid_id?: string;
      admin_id?: string;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    try {
      const consultations = await consultationRepository.findMany(filters);
      return consultations;
    } catch (error) {
      throw error;
    }
  }

  // Get consultation by ID
  async getConsultationById(consultation_id: string) {
    try {
      const consultation = await consultationRepository.findById(
        consultation_id
      );

      if (!consultation) {
        throw new Error("Konseling tidak ditemukan");
      }

      return consultation;
    } catch (error) {
      throw error;
    }
  }

  // Update consultation status (accept/decline)
  async updateConsultationStatus(data: UpdateConsultationStatusData) {
    try {
      const existingConsultation = await consultationRepository.findById(
        data.consultation_id
      );

      if (!existingConsultation) {
        throw new Error("Konseling tidak ditemukan");
      }

      const updatedConsultation = await consultationRepository.updateStatus({
        consultation_id: data.consultation_id,
        status: data.status,
        notes: data.notes || existingConsultation.notes || undefined,
      });

      return updatedConsultation;
    } catch (error) {
      throw error;
    }
  }

  // Get consultations by status
  async getConsultationsByStatus(status: ConsultationStatus) {
    try {
      return await consultationRepository.findByStatus(status);
    } catch (error) {
      throw error;
    }
  }

  // Get consultations for a specific student
  async getConsultationsForStudent(murid_id: string) {
    try {
      return await consultationRepository.findByMuridId(murid_id);
    } catch (error) {
      throw error;
    }
  }

  // Get consultations for a specific admin
  async getConsultationsForAdmin(admin_id: string) {
    try {
      return await consultationRepository.findByAdminId(admin_id);
    } catch (error) {
      throw error;
    }
  }

  // Delete consultation (optional - in case you need it)
  async deleteConsultation(consultation_id: string) {
    try {
      const existingConsultation = await consultationRepository.findById(
        consultation_id
      );

      if (!existingConsultation) {
        throw new Error("Konseling tidak ditemukan");
      }

      await consultationRepository.delete(consultation_id);

      return { message: "Konseling berhasil dihapus" };
    } catch (error) {
      throw error;
    }
  }

  // Get consultation statistics (optional - useful for admin dashboard)
  async getConsultationStats() {
    try {
      return await consultationRepository.getStats();
    } catch (error) {
      throw error;
    }
  }
}
