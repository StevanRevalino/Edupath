import type { FC } from "react";

interface Consultation {
  consultation_id: string;
  murid_id: string;
  topic: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED";
  consultation_date: string;
  consultation_time: string;
  notes?: string;
  admin_notes?: string;
  description?: string;
  created_at: string;
  is_active: boolean;
  murid: {
    firstname: string;
    lastname: string;
    email: string;
    kelas: number | null;
  };
}

interface ConsultationDetailModalProps {
  isOpen: boolean;
  consultation: Consultation | null;
  onClose: () => void;
  onReschedule?: (consultation: Consultation) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

const ConsultationDetailModal: FC<ConsultationDetailModalProps> = ({
  isOpen,
  consultation,
  onClose,
  onReschedule,
  getStatusColor,
  getStatusText,
}) => {
  if (!isOpen || !consultation) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Detail Konseling
          </h2>
          <div className="h-1 w-20 bg-blue-500 rounded-full"></div>
        </div>

        {/* Modal Content */}
        <div className="space-y-6">
          {/* Student Info */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Informasi Murid
            </h3>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-[#6CCBFF] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[#050051] font-bold text-2xl">
                  {consultation.murid.firstname.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">
                  {`${consultation.murid.firstname} ${consultation.murid.lastname}`.trim()}
                </div>
                <div className="text-sm text-gray-600">
                  {consultation.murid.email}
                </div>
                <div className="text-sm text-gray-600">
                  Kelas: {consultation.murid.kelas || "-"}
                </div>
              </div>
            </div>
          </div>

          {/* Consultation Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Status
              </div>
              <span
                className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  consultation.status
                )}`}
              >
                <span className="w-2 h-2 bg-current rounded-full opacity-60"></span>
                <span>{getStatusText(consultation.status)}</span>
              </span>
            </div>

            {/* Consultation ID */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                ID Konseling
              </div>
              <div className="text-lg font-mono font-semibold text-gray-900">
                {consultation.consultation_id}
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Jadwal Konseling
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-600 mb-1">Tanggal</div>
                <div className="flex items-center space-x-2 text-gray-900">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-semibold">
                    {new Date(
                      consultation.consultation_date
                    ).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Waktu</div>
                <div className="flex items-center space-x-2 text-gray-900">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-semibold">
                    {(() => {
                      const startTime = new Date(
                        consultation.consultation_date
                      );
                      const endTime = new Date(
                        startTime.getTime() + 60 * 60 * 1000
                      );
                      return `${startTime.toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })} - ${endTime.toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`;
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Topic */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Topik Konseling
            </div>
            <div className="text-base text-gray-900">{consultation.topic}</div>
          </div>

          {/* Description from Student */}
          {consultation.description && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Deskripsi dari Murid
              </div>
              <div className="text-base text-gray-700">
                {consultation.description}
              </div>
            </div>
          )}

          {/* Admin Notes (Reschedule/Decline reason) */}
          {consultation.admin_notes && (
            <div
              className={`rounded-lg p-4 ${
                consultation.admin_notes.includes("[DIBATALKAN OLEH MURID]")
                  ? "bg-red-50 border border-red-200"
                  : consultation.admin_notes.includes("[DIJADWALKAN ULANG]")
                  ? "bg-blue-50 border border-blue-200"
                  : consultation.status === "DECLINED"
                  ? "bg-red-50 border border-red-200"
                  : "bg-gray-50"
              }`}
            >
              <div
                className={`text-sm font-semibold uppercase tracking-wide mb-2 ${
                  consultation.admin_notes.includes(
                    "[DIBATALKAN OLEH MURID]"
                  ) || consultation.status === "DECLINED"
                    ? "text-red-700"
                    : consultation.admin_notes.includes("[DIJADWALKAN ULANG]")
                    ? "text-blue-700"
                    : "text-gray-500"
                }`}
              >
                {consultation.admin_notes.includes("[DIBATALKAN OLEH MURID]")
                  ? "Alasan Pembatalan (Oleh Murid)"
                  : consultation.admin_notes.includes("[DIJADWALKAN ULANG]")
                  ? "Alasan Reschedule"
                  : consultation.status === "DECLINED"
                  ? "Alasan Penolakan"
                  : "Catatan Admin"}
              </div>
              <div
                className={`text-base ${
                  consultation.admin_notes.includes(
                    "[DIBATALKAN OLEH MURID]"
                  ) || consultation.status === "DECLINED"
                    ? "text-red-700"
                    : consultation.admin_notes.includes("[DIJADWALKAN ULANG]")
                    ? "text-blue-700"
                    : "text-gray-700"
                }`}
              >
                {consultation.admin_notes
                  .replace("[DIBATALKAN OLEH MURID] ", "")
                  .replace("[DIJADWALKAN ULANG] ", "")}
              </div>
            </div>
          )}

          {/* Legacy notes support (backward compatibility) */}
          {consultation.notes && !consultation.admin_notes && (
            <div
              className={`rounded-lg p-4 ${
                consultation.notes.includes("[DIBATALKAN OLEH MURID]")
                  ? "bg-red-50 border border-red-200"
                  : consultation.notes.includes("[DIJADWALKAN ULANG]")
                  ? "bg-blue-50 border border-blue-200"
                  : consultation.status === "DECLINED"
                  ? "bg-red-50 border border-red-200"
                  : "bg-gray-50"
              }`}
            >
              <div
                className={`text-sm font-semibold uppercase tracking-wide mb-2 ${
                  consultation.notes.includes("[DIBATALKAN OLEH MURID]") ||
                  consultation.status === "DECLINED"
                    ? "text-red-700"
                    : consultation.notes.includes("[DIJADWALKAN ULANG]")
                    ? "text-blue-700"
                    : "text-gray-500"
                }`}
              >
                {consultation.notes.includes("[DIBATALKAN OLEH MURID]")
                  ? "Alasan Pembatalan (Oleh Murid)"
                  : consultation.notes.includes("[DIJADWALKAN ULANG]")
                  ? "Alasan Reschedule"
                  : consultation.status === "DECLINED"
                  ? "Alasan Penolakan"
                  : "Catatan"}
              </div>
              <div
                className={`text-base ${
                  consultation.notes.includes("[DIBATALKAN OLEH MURID]") ||
                  consultation.status === "DECLINED"
                    ? "text-red-700"
                    : consultation.notes.includes("[DIJADWALKAN ULANG]")
                    ? "text-blue-700"
                    : "text-gray-700"
                }`}
              >
                {consultation.notes
                  .replace("[DIBATALKAN OLEH MURID] ", "")
                  .replace("[DIJADWALKAN ULANG] ", "")}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end gap-3">
          {consultation.status === "ACCEPTED" && onReschedule && (
            <button
              onClick={() => onReschedule(consultation)}
              className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Reschedule
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsultationDetailModal;
