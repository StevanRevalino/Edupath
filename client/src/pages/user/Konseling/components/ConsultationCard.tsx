import { type Consultation } from "../../../../services/consultationService";

interface ConsultationCardProps {
  consultation: Consultation;
  isSelected?: boolean;
  onClick: (consultation: Consultation) => void;
}

const ConsultationCard = ({
  consultation,
  isSelected,
  onClick,
}: ConsultationCardProps) => {
  const getStatusText = (status: string, isActive: boolean) => {
    // Jika konsultasi sudah tidak aktif, tampilkan "Selesai"
    if (!isActive) {
      return "Selesai";
    }

    switch (status) {
      case "COMPLETED":
        return "Sesi telah dilakukan";
      case "ACCEPTED":
        return "Sesi diterima";
      case "PENDING":
        return "Menunggu konfirmasi";
      default:
        return "Sesi ditolak";
    }
  };

  const getStatusColor = (status: string, isActive: boolean) => {
    // Jika konsultasi sudah tidak aktif, tampilkan warna abu-abu
    if (!isActive) {
      return "bg-gray-600";
    }

    switch (status) {
      case "COMPLETED":
        return "bg-green-600";
      case "ACCEPTED":
        return "bg-blue-600";
      case "PENDING":
        return "bg-yellow-600";
      default:
        return "bg-red-600";
    }
  };

  return (
    <div
      onClick={() => onClick(consultation)}
      className={`border-2 rounded-tl-3xl rounded-br-3xl p-4 transition-colors cursor-pointer relative ${
        isSelected
          ? "bg-blue-100 border-blue-500"
          : !consultation.is_active
          ? "bg-gray-50 border-gray-300 opacity-75"
          : "bg-blue-50 border-[#00437A] hover:bg-blue-100"
      }`}
    >
      {/* Badge "Selesai" untuk konsultasi yang tidak aktif */}
      {!consultation.is_active && (
        <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
          <span>✓</span>
          <span>Selesai</span>
        </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <span
          className={`text-white text-xs font-semibold px-2 py-1 rounded ${getStatusColor(
            consultation.status,
            consultation.is_active
          )}`}
        >
          {getStatusText(consultation.status, consultation.is_active)}
        </span>
        <span className="text-xs text-gray-500">
          #{consultation.consultation_id}
        </span>
      </div>
      <h4 className="font-semibold text-gray-800 mb-1">
        {consultation.admin_id}
      </h4>
      <p className="text-xs text-gray-600">
        {new Date(consultation.consultation_date).toLocaleDateString("id-ID")} -{" "}
        {new Date(consultation.consultation_date).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
};

export default ConsultationCard;
