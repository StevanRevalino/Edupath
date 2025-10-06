import { MessageCircle } from "lucide-react";
import { type Consultation } from "../../../../services/consultationService";

interface ConsultationInfoProps {
  consultation: Consultation | null;
  onOpenChat: (consultation: Consultation) => void;
}

const ConsultationInfo = ({
  consultation,
  onOpenChat,
}: ConsultationInfoProps) => {
  if (!consultation) {
    return (
      <div>
        <h4 className="text-lg font-semibold text-gray-800 text-center mb-8">
          konseling #
          {Array(8)
            .fill(0)
            .map(() => "x")
            .join("")}
        </h4>

        {/* Placeholder content for session info */}
        <div className="space-y-4 text-center text-gray-500">
          <p className="text-sm">
            Pilih sesi konseling dari riwayat untuk melihat detail informasi
          </p>
          <div className="bg-gray-100 rounded-lg p-8">
            <p className="text-xs">Detail sesi akan ditampilkan di sini</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusText = (status: string, isActive: boolean) => {
    // Jika konsultasi sudah tidak aktif, tampilkan "Selesai"
    if (!isActive) {
      return "Selesai";
    }

    switch (status) {
      case "COMPLETED":
        return "Selesai";
      case "ACCEPTED":
        return "Diterima";
      case "PENDING":
        return "Menunggu";
      default:
        return "Ditolak";
    }
  };

  const getStatusColor = (status: string, isActive: boolean) => {
    // Jika konsultasi sudah tidak aktif, tampilkan warna abu-abu
    if (!isActive) {
      return "text-gray-600";
    }

    switch (status) {
      case "COMPLETED":
        return "text-green-600";
      case "ACCEPTED":
        return "text-blue-600";
      case "PENDING":
        return "text-yellow-600";
      default:
        return "text-red-600";
    }
  };

  return (
    <div>
      <h4 className="text-lg font-semibold text-gray-800 text-center mb-8">
        konseling #{consultation.consultation_id}
      </h4>

      <div className="space-y-4">
        <div className="border-b pb-3">
          <label className="text-base font-semibold text-gray-600">
            Status:
          </label>
          <p
            className={`text-sm font-semibold ${getStatusColor(
              consultation.status,
              consultation.is_active
            )}`}
          >
            {getStatusText(consultation.status, consultation.is_active)}
          </p>
          {!consultation.is_active && (
            <p className="text-xs text-gray-500 mt-1 italic">
              Konsultasi ini telah selesai. Anda dapat membuat konsultasi baru.
            </p>
          )}
        </div>

        <div className="border-b pb-3">
          <label className="text-base font-semibold text-gray-600">
            Tanggal & Waktu:
          </label>
          <p className="text-sm text-gray-800">
            {new Date(consultation.consultation_date).toLocaleDateString(
              "id-ID",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )}
          </p>
          <p className="text-sm text-gray-800">
            {new Date(consultation.consultation_date).toLocaleTimeString(
              "id-ID",
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )}{" "}
            WIB
          </p>
        </div>

        <div className="border-b pb-3">
          <label className="text-base font-semibold text-gray-600">
            Konselor:
          </label>
          <p className="text-sm text-gray-800">{consultation.admin_id}</p>
        </div>

        <div className="border-b pb-3">
          <label className="text-base font-semibold text-gray-600">
            Topik:
          </label>
          <p className="text-sm text-gray-800">{consultation.topic}</p>
        </div>

        {consultation.notes && (
          <div>
            <label className="text-base font-semibold text-gray-600">
              Deskripsi:
            </label>
            <p className="text-sm text-gray-800">{consultation.notes}</p>
          </div>
        )}

        {/* Chat Button - Only show for ACCEPTED and ACTIVE consultations */}
        {consultation.status === "ACCEPTED" && consultation.is_active && (
          <div className="pt-4 border-t">
            <button
              onClick={() => onOpenChat(consultation)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle size={20} />
              Buka Chat Konseling
            </button>
          </div>
        )}

        <div className="pt-4 text-xs text-gray-500 text-center">
          Dibuat:{" "}
          {new Date(consultation.created_at).toLocaleDateString("id-ID")}
        </div>
      </div>
    </div>
  );
};

export default ConsultationInfo;
