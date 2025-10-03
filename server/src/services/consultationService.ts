import { ConsultationStatus } from "@prisma/client";
import { ConsultationRepository } from "../repositories/consultationRepository";
import { UserRepository } from "../repositories/userRepository";

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

export class ConsultationService {
  private consultationRepository: ConsultationRepository;
  private userRepository: UserRepository;

  constructor() {
    this.consultationRepository = new ConsultationRepository();
    this.userRepository = new UserRepository();
  }

  private async generateCustomConsultationId(): Promise<string> {
    const lastConsultation =
      await this.consultationRepository.findLastConsultation();

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
  // Create new consultation
  async createConsultation(data: CreateConsultationData) {
    try {
      // Verify that murid exists and has STUDENT role
      const murid = await this.userRepository.findById(data.murid_id);

      if (!murid) {
        throw new Error("Murid tidak ditemukan");
      }

      if (murid.role !== "STUDENT") {
        throw new Error(
          "User harus berperan sebagai student untuk membuat konseling"
        );
      }

      // Verify that admin exists and has ADMIN role
      const admin = await this.userRepository.findById(data.admin_id);

      if (!admin) {
        throw new Error("Admin tidak ditemukan");
      }

      if (admin.role !== "ADMIN") {
        throw new Error(
          "User harus berperan sebagai admin untuk menerima konseling"
        );
      }

      const customId = await this.generateCustomConsultationId();

      const consultation = await this.consultationRepository.create({
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
      const consultations = await this.consultationRepository.findMany(filters);
      return consultations;
    } catch (error) {
      throw error;
    }
  }

  // Get students with accepted consultations for live chat
  async getStudentsWithAcceptedConsultations() {
    try {
      const acceptedConsultations = await this.consultationRepository.findMany({
        status: ConsultationStatus.ACCEPTED,
      });

      // Extract unique murid_ids
      const uniqueMuridIds = [
        ...new Set(acceptedConsultations.map((c) => c.murid_id)),
      ];

      // Get student details for each unique murid
      const students = await Promise.all(
        uniqueMuridIds.map(async (muridId) => {
          const student = await this.userRepository.findById(muridId);
          if (student) {
            // Get the latest accepted consultation for this student
            const latestConsultation = acceptedConsultations
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
      return students.filter((student) => student !== null);
    } catch (error) {
      throw error;
    }
  }

  // Get consultation by ID
  async getConsultationById(consultation_id: string) {
    try {
      const consultation = await this.consultationRepository.findById(
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
      const existingConsultation = await this.consultationRepository.findById(
        data.consultation_id
      );

      if (!existingConsultation) {
        throw new Error("Konseling tidak ditemukan");
      }

      const updatedConsultation =
        await this.consultationRepository.updateStatus({
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
      return await this.consultationRepository.findByStatus(status);
    } catch (error) {
      throw error;
    }
  }

  // Get consultations for a specific student
  async getConsultationsForStudent(murid_id: string) {
    try {
      return await this.consultationRepository.findByMuridId(murid_id);
    } catch (error) {
      throw error;
    }
  }

  // Get consultations for a specific admin
  async getConsultationsForAdmin(admin_id: string) {
    try {
      return await this.consultationRepository.findByAdminId(admin_id);
    } catch (error) {
      throw error;
    }
  }

  // Get consultations for students by name
  async getConsultationsForStudentByName(firstname: string, lastname?: string) {
    try {
      // Find students with matching name
      const students = await this.userRepository.findByName(
        firstname,
        lastname
      );

      if (students.length === 0) {
        throw new Error("Tidak ada siswa ditemukan dengan nama tersebut");
      }

      // Get consultations for all matching students
      const consultationsPromises = students.map((student) =>
        this.consultationRepository.findByMuridId(student.user_id)
      );

      const allConsultations = await Promise.all(consultationsPromises);

      // Flatten the results and add student info
      const consultations = allConsultations.flat().map((consultation) => ({
        ...consultation,
        student_info: students.find((s) => s.user_id === consultation.murid_id),
      }));

      return {
        students: students,
        consultations: consultations,
      };
    } catch (error) {
      throw error;
    }
  }

  // Delete consultation (optional - in case you need it)
  async deleteConsultation(consultation_id: string) {
    try {
      const existingConsultation = await this.consultationRepository.findById(
        consultation_id
      );

      if (!existingConsultation) {
        throw new Error("Konseling tidak ditemukan");
      }

      await this.consultationRepository.delete(consultation_id);

      return { message: "Konseling berhasil dihapus" };
    } catch (error) {
      throw error;
    }
  }

  // Get consultation statistics (optional - useful for admin dashboard)
  async getConsultationStats() {
    try {
      return await this.consultationRepository.getStats();
    } catch (error) {
      throw error;
    }
  }

  // Check if student has an active consultation
  async hasActiveConsultation(murid_id: string): Promise<boolean> {
    try {
      const activeConsultation =
        await this.consultationRepository.findActiveByMuridId(murid_id);
      return !!activeConsultation;
    } catch (error) {
      throw error;
    }
  }

  // End consultation (set is_active to false)
  async endConsultation(consultation_id: string) {
    try {
      const existingConsultation = await this.consultationRepository.findById(
        consultation_id
      );

      if (!existingConsultation) {
        throw new Error("Konseling tidak ditemukan");
      }

      if (!existingConsultation.is_active) {
        throw new Error("Konseling sudah tidak aktif");
      }

      const updatedConsultation = await this.consultationRepository.setInactive(
        consultation_id
      );

      return updatedConsultation;
    } catch (error) {
      throw error;
    }
  }
}
