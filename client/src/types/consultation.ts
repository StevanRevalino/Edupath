// Type definition untuk Consultation setelah refactoring
// notes → description (catatan dari murid)
// admin_notes (baru) → catatan dari admin untuk reschedule/decline

export interface Consultation {
  consultation_id: string;
  murid_id: string;
  admin_id: string;
  topic: string;
  consultation_date: string;
  description?: string; // Catatan dari murid saat buat konsultasi
  admin_notes?: string; // Catatan dari admin (reschedule/decline reason)
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED";
  is_active: boolean;
  created_at: string;
  murid?: {
    user_id: string;
    firstname: string;
    lastname: string;
    email: string;
    kelas: number | null;
  };
  admin?: {
    user_id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
}

/**
 * MIGRATION NOTES:
 *
 * 1. Database schema sudah diupdate:
 *    - Kolom `notes` → `description`
 *    - Tambah kolom baru `admin_notes`
 *
 * 2. Backend sudah diupdate:
 *    - Repository interfaces: CreateConsultationDTO, UpdateConsultationStatusDTO
 *    - Service interfaces: CreateConsultationData, UpdateConsultationStatusData
 *    - Controller: createConsultation(), updateConsultationStatus(), cancelConsultation()
 *
 * 3. Frontend yang perlu diupdate:
 *    a. ModalJadwalkanKonseling.tsx:
 *       - formData.notes → formData.description
 *       - API call: notes → description
 *
 *    b. KelolaDataKonseling.tsx (Admin):
 *       - consultation.notes (untuk reschedule/decline) → consultation.admin_notes
 *       - consultation.notes (regular notes dari murid) → consultation.description
 *       - API call saat update status: notes → admin_notes
 *
 *    c. ConsultationInfo.tsx (User):
 *       - consultation.notes untuk reschedule/decline → consultation.admin_notes
 *       - consultation.notes untuk description murid → consultation.description
 *
 * 4. Pattern pencarian di frontend:
 *    - Reschedule/Decline related: .includes("[DIJADWALKAN ULANG]") → gunakan admin_notes
 *    - Declined by student: .includes("[DIBATALKAN OLEH MURID]") → gunakan admin_notes
 *    - Regular notes dari murid → gunakan description
 */
