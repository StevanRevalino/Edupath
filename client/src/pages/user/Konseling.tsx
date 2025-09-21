import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import {
  consultationService,
  type Consultation,
} from "../../services/consultationService";
import ModalJadwalkanKonseling from "../../components/ModalJadwalkanKonseling";

const Konseling = () => {
  const [showModal, setShowModal] = useState(false);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] =
    useState<Consultation | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch consultations when component mounts
  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const response = await consultationService.getConsultations();
      if (response.success && response.data) {
        setConsultations(response.data);
      }
    } catch (error) {
      console.error("Error fetching consultations:", error);
      // You can add a toast notification here
      // toast.error("Gagal memuat data konsultasi");
    } finally {
      setLoading(false);
    }
  };

  const handleModalSuccess = () => {
    fetchConsultations(); // Refresh consultations when modal succeeds
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sesi Konseling Section */}
      <div className="min-h-screen bg-gray-100 px-4 sm:px-6 md:px-12 pt-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-12">
            Sesi Konseling
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Jadwalkan Konseling */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Jadwalkan Konseling
                </h3>
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full bg-gray-100 border-2 border-dashed border-[#00437A] rounded-tl-3xl rounded-br-3xl p-6 hover:bg-gray-100 transition-colors flex items-center justify-center text-gray-600 gap-2 cursor-pointer"
                >
                  <div className="p-2 lg:p-4 bg-[#E9E9E9] rounded-md flex">
                    <Plus
                      size={24}
                      className="lg:hidden text-[#7E7E7E]"
                      strokeWidth={2}
                    />
                    <Plus
                      size={32}
                      className="hidden lg:block text-[#7E7E7E]"
                      strokeWidth={2}
                    />
                  </div>
                  <span className="text-sm lg:text-base">
                    Jadwalkan sesi bimbingan konseling baru...
                  </span>
                </button>
              </div>

              {/* Riwayat Konseling */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Riwayat Konseling
                </h3>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 overscroll-contain">
                  {loading ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Loading consultations...</p>
                    </div>
                  ) : consultations.length > 0 ? (
                    consultations.map((consultation) => (
                      <div
                        key={consultation.consultation_id}
                        onClick={() => setSelectedConsultation(consultation)}
                        className="bg-blue-50 border-[#00437A] border-2 rounded-tl-3xl rounded-br-3xl p-4 hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className={`text-white text-xs font-semibold px-2 py-1 rounded ${
                              consultation.status === "COMPLETED"
                                ? "bg-green-600"
                                : consultation.status === "ACCEPTED"
                                ? "bg-blue-600"
                                : consultation.status === "PENDING"
                                ? "bg-yellow-600"
                                : "bg-red-600"
                            }`}
                          >
                            {consultation.status === "COMPLETED"
                              ? "Sesi telah dilakukan"
                              : consultation.status === "ACCEPTED"
                              ? "Sesi diterima"
                              : consultation.status === "PENDING"
                              ? "Menunggu konfirmasi"
                              : "Sesi ditolak"}
                          </span>
                          <span className="text-xs text-gray-500">
                            #{consultation.consultation_id}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-1">
                          {consultation.admin_id}{" "}
                          {/* You might want to fetch admin name */}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {new Date(
                            consultation.consultation_date
                          ).toLocaleDateString("id-ID")}{" "}
                          -{" "}
                          {new Date(
                            consultation.consultation_date
                          ).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        Belum ada riwayat konseling
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Info Panel */}
            <div className="bg-white rounded-xl shadow-md p-6 h-fit">
              <h3 className="text-3xl font-bold text-gray-800 text-center mb-6">
                Info tentang sesi
              </h3>

              {selectedConsultation ? (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 text-center mb-8">
                    konseling #{selectedConsultation.consultation_id}
                  </h4>

                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <label className="text-base font-semibold text-gray-600">
                        Status:
                      </label>
                      <p
                        className={`text-sm font-semibold ${
                          selectedConsultation.status === "COMPLETED"
                            ? "text-green-600"
                            : selectedConsultation.status === "ACCEPTED"
                            ? "text-blue-600"
                            : selectedConsultation.status === "PENDING"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {selectedConsultation.status === "COMPLETED"
                          ? "Selesai"
                          : selectedConsultation.status === "ACCEPTED"
                          ? "Diterima"
                          : selectedConsultation.status === "PENDING"
                          ? "Menunggu"
                          : "Ditolak"}
                      </p>
                    </div>

                    <div className="border-b pb-3">
                      <label className="text-base font-semibold text-gray-600">
                        Tanggal & Waktu:
                      </label>
                      <p className="text-sm text-gray-800">
                        {new Date(
                          selectedConsultation.consultation_date
                        ).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-gray-800">
                        {new Date(
                          selectedConsultation.consultation_date
                        ).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        WIB
                      </p>
                    </div>

                    <div className="border-b pb-3">
                      <label className="text-base font-semibold text-gray-600">
                        Konselor:
                      </label>
                      <p className="text-sm text-gray-800">
                        {selectedConsultation.admin_id}
                      </p>
                    </div>

                    <div className="border-b pb-3">
                      <label className="text-base font-semibold text-gray-600">
                        Topik:
                      </label>
                      <p className="text-sm text-gray-800">
                        {selectedConsultation.topic}
                      </p>
                    </div>

                    {selectedConsultation.notes && (
                      <div>
                        <label className="text-base font-semibold text-gray-600">
                          Deskripsi:
                        </label>
                        <p className="text-sm text-gray-800">
                          {selectedConsultation.notes}
                        </p>
                      </div>
                    )}

                    <div className="pt-4 text-xs text-gray-500 text-center">
                      Dibuat:{" "}
                      {new Date(
                        selectedConsultation.created_at
                      ).toLocaleDateString("id-ID")}
                    </div>
                  </div>
                </div>
              ) : (
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
                      Pilih sesi konseling dari riwayat untuk melihat detail
                      informasi
                    </p>
                    <div className="bg-gray-100 rounded-lg p-8">
                      <p className="text-xs">
                        Detail sesi akan ditampilkan di sini
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Jadwalkan Konseling */}
      <ModalJadwalkanKonseling
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default Konseling;
