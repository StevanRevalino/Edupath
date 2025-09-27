// Define the Test interface similar to Consultation
export interface TesSession {
  test_id: string;
  murid_id: string;
  test_date: string;
  status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  score?: number;
  result_summary?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface InfoTesProps {
  tesSession: TesSession | null;
  onViewResult?: (tesSession: TesSession) => void;
}

const InfoTes = ({ tesSession }: InfoTesProps) => {
  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Selesai";
      case "IN_PROGRESS":
        return "Sedang Berlangsung";
      case "SCHEDULED":
        return "Terjadwal";
      default:
        return "Dibatalkan";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-600";
      case "IN_PROGRESS":
        return "text-blue-600";
      case "SCHEDULED":
        return "text-yellow-600";
      default:
        return "text-red-600";
    }
  };

  if (!tesSession) {
    return (
      <div className="min-h-[815px] -mb-24">
        <h4 className="text-lg font-semibold text-gray-800 text-center mb-8">
          tes minat & bakat #
          {Array(8)
            .fill(0)
            .map(() => "x")
            .join("")}
        </h4>

        {/* Placeholder content for test info */}
        <div className="space-y-4 text-center text-gray-500">
          <p className="text-sm">
            Pilih sesi tes dari riwayat untuk melihat detail informasi
          </p>
          <div className="bg-gray-100 rounded-lg p-8 min-h-[600px] flex items-center justify-center">
            <p className="text-xs">Detail sesi akan ditampilkan di sini</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[800px] -mb-24">
      <h4 className="text-lg font-semibold text-gray-800 text-center mb-8">
        tes minat & bakat #{tesSession.test_id}
      </h4>

      <div className="space-y-4 min-h-[600px]">
        <div className="border-b pb-3">
          <label className="text-base font-semibold text-gray-600">
            Status:
          </label>
          <p
            className={`text-sm font-semibold ${getStatusColor(
              tesSession.status
            )}`}
          >
            {getStatusText(tesSession.status)}
          </p>
        </div>

        <div className="border-b pb-3">
          <label className="text-base font-semibold text-gray-600">
            Tanggal & Waktu:
          </label>
          <p className="text-sm text-gray-800">
            {new Date(tesSession.test_date).toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-sm text-gray-800">
            {new Date(tesSession.test_date).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            WIB
          </p>
        </div>

        {tesSession.score !== undefined && (
          <div className="border-b pb-3">
            <label className="text-base font-semibold text-gray-600">
              Skor:
            </label>
            <p className="text-sm text-gray-800">{tesSession.score}/100</p>
          </div>
        )}

        {tesSession.result_summary && (
          <div className="border-b pb-3">
            <label className="text-base font-semibold text-gray-600">
              Ringkasan Hasil:
            </label>
            <p className="text-sm text-gray-800">{tesSession.result_summary}</p>
          </div>
        )}

        {tesSession.notes && (
          <div>
            <label className="text-base font-semibold text-gray-600">
              Catatan:
            </label>
            <p className="text-sm text-gray-800">{tesSession.notes}</p>
          </div>
        )}
      </div>

      <div className="pt-4 text-xs text-gray-500 text-center">
        Dibuat: {new Date(tesSession.created_at).toLocaleDateString("id-ID")}
      </div>
    </div>
  );
};

export default InfoTes;
