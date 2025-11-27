import { MessageCircle } from "lucide-react";
import {
  type Consultation,
  consultationService,
} from "../../../../handler/consultationHandler";
import { useState } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

interface ConsultationInfoProps {
  consultation: Consultation | null;
  onOpenChat: (consultation: Consultation) => void;
  onCancelSuccess?: () => void;
}

const ConsultationInfo = ({
  consultation,
  onOpenChat,
  onCancelSuccess,
}: ConsultationInfoProps) => {
  const [canceling, setCanceling] = useState(false);

  // Check if chat is available (only check status and active state)
  const isChatAvailable = () => {
    if (
      !consultation ||
      consultation.status !== "ACCEPTED" ||
      !consultation.is_active
    ) {
      return false;
    }

    // Chat is available anytime as long as consultation is accepted and active
    return true;
  };

  const handleCancelConsultation = async () => {
    if (!consultation) return;

    // If PENDING, just confirm without reason (will be deleted)
    // If ACCEPTED, ask for reason (will be marked as DECLINED)
    const isPending = consultation.status === "PENDING";

    if (isPending) {
      const result = await Swal.fire({
        title: "Batalkan Konseling?",
        text: "Apakah Anda yakin ingin membatalkan konseling ini?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "var(--primary)",
        confirmButtonText: "Ya, Batal",
        cancelButtonText: "Batal",
      });

      if (!result.isConfirmed) return;
    } else {
      const result = await Swal.fire({
        title: "Batalkan Konseling?",
        html: `
          <div class="text-left">
            <p class="text-sm text-gray-600 mb-3">Apakah Anda yakin ingin membatalkan konseling yang sudah diterima ini?</p>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Alasan pembatalan <span class="text-red-500">*</span>
            </label>
            <textarea
              id="cancel-reason"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows="4"
              placeholder="Masukkan alasan mengapa Anda membatalkan konseling ini..."
            ></textarea>
          </div>
        `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6CCBFF",
        confirmButtonText: "Ya, Batalkan",
        cancelButtonText: "Batal",
        preConfirm: () => {
          const reason = (
            document.getElementById("cancel-reason") as HTMLTextAreaElement
          )?.value;
          if (!reason || reason.trim() === "") {
            Swal.showValidationMessage("Alasan pembatalan harus diisi");
            return false;
          }
          return reason;
        },
      });

      if (!result.isConfirmed || !result.value) return;

      try {
        setCanceling(true);

        await consultationService.cancelConsultation(
          consultation.consultation_id,
          result.value
        );

        toast.success("Konseling berhasil dibatalkan");

        if (onCancelSuccess) {
          onCancelSuccess();
        }
      } catch (error: any) {
        console.error("Error canceling consultation:", error);
        toast.error(
          error.response?.data?.message || "Gagal membatalkan konseling"
        );
      } finally {
        setCanceling(false);
      }
      return;
    }

    // Handle PENDING cancellation (no reason needed)
    try {
      setCanceling(true);

      await consultationService.cancelConsultation(
        consultation.consultation_id,
        "Dibatalkan oleh murid"
      );

      toast.success("Konseling berhasil dibatalkan");

      if (onCancelSuccess) {
        onCancelSuccess();
      }
    } catch (error: any) {
      console.error("Error canceling consultation:", error);
      toast.error(
        error.response?.data?.message || "Gagal membatalkan konseling"
      );
    } finally {
      setCanceling(false);
    }
  };

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
    // Special case: DECLINED always shows as "Ditolak" regardless of isActive
    if (status === "DECLINED") {
      return "Ditolak";
    }

    // Jika konsultasi sudah tidak aktif dan bukan DECLINED, tampilkan "Selesai"
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
    // Special case: DECLINED always shows red regardless of isActive
    if (status === "DECLINED") {
      return "text-red-600";
    }

    // Jika konsultasi sudah tidak aktif dan bukan DECLINED, tampilkan warna abu-abu
    if (!isActive) {
      return "text-gray-600";
    }

    switch (status) {
      case "COMPLETED":
        return "text-green-600";
      case "ACCEPTED":
        return "text-primary font-semibold";
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

        {/* Show decline reason prominently if declined */}
        {consultation.status === "DECLINED" && consultation.admin_notes && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <label className="text-base font-semibold text-red-700 flex items-center gap-2">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              {consultation.admin_notes.includes("[DIBATALKAN OLEH MURID]")
                ? "Alasan Pembatalan (Anda):"
                : "Alasan Penolakan:"}
            </label>
            <p className="text-sm text-red-800 mt-2 leading-relaxed">
              {consultation.admin_notes.replace("[DIBATALKAN OLEH MURID] ", "")}
            </p>
          </div>
        )}

        {/* Show reschedule info prominently if rescheduled */}
        {consultation.admin_notes?.includes("[DIJADWALKAN ULANG]") && (
          <div className="bg-secondary-light border border-secondary rounded-lg p-4">
            <label className="text-base font-semibold text-primary-dark flex items-center gap-2">
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
              Konseling Dijadwalkan Ulang:
            </label>
            <p className="text-sm text-gray-700 mt-2 leading-relaxed">
              {consultation.admin_notes.replace("[DIJADWALKAN ULANG] ", "")}
            </p>
          </div>
        )}

        {/* Show description from user (catatan saat buat konsultasi) */}
        {consultation.description && (
          <div className="border-b pb-3">
            <label className="text-base font-semibold text-gray-600">
              Deskripsi Anda:
            </label>
            <p className="text-sm text-gray-800">{consultation.description}</p>
          </div>
        )}

        {/* Chat Button - Available anytime for accepted and active consultations */}
        {consultation.status === "ACCEPTED" && consultation.is_active && (
          <div className="pt-4 border-t">
            {isChatAvailable() ? (
              <button
                onClick={() => onOpenChat(consultation)}
                className="w-full bg-primary hover:bg-primary-light text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                Buka Chat Konseling
              </button>
            ) : (
              <div className="w-full bg-gray-100 border border-gray-300 text-gray-600 py-2 px-4 rounded-lg flex items-center justify-center gap-2">
                <MessageCircle size={20} />
                <div className="text-center">
                  <div className="font-semibold">Chat Belum Tersedia</div>
                  <div className="text-xs">
                    {new Date() < new Date(consultation.consultation_date)
                      ? "Chat akan dibuka saat konseling dimulai"
                      : "Sesi konseling telah berakhir"}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cancel Button - Show for PENDING or ACCEPTED consultations */}
        {(consultation.status === "PENDING" ||
          consultation.status === "ACCEPTED") && (
          <div
            className={
              consultation.status === "ACCEPTED" && consultation.is_active
                ? "pt-2"
                : "pt-4 border-t"
            }
          >
            <button
              onClick={handleCancelConsultation}
              disabled={canceling}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {canceling ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Membatalkan...
                </>
              ) : (
                "Batalkan Konseling"
              )}
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
