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