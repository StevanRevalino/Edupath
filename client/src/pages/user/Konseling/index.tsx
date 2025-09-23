import { useState, useEffect } from "react";
import TokenManager from "../../../utils/tokenManager";
import toast from "react-hot-toast";
import {
  consultationService,
  type Consultation,
} from "../../../services/consultationService";
import ModalJadwalkanKonseling from "./components/ModalJadwalkanKonseling";
import ConsultationCard from "./components/ConsultationCard";
import ConsultationInfo from "./components/ConsultationInfo";
import ChatView from "./components/ChatView";
import ScheduleConsultation from "./components/ScheduleConsultation";

const Konseling = () => {
  const [showModal, setShowModal] = useState(false);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] =
    useState<Consultation | null>(null);
  const [loading, setLoading] = useState(false);

  // Chat state
  const [showChat, setShowChat] = useState(false);
  const currentUserId = TokenManager.getUserData().userId || "";

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

  // Reset chat state when selected consultation changes
  useEffect(() => {
    if (selectedConsultation) {
      setShowChat(false);
    }
  }, [selectedConsultation]);

  // Open chat for accepted consultations
  const openChat = async (consultation: Consultation) => {
    if (consultation.status !== "ACCEPTED") {
      toast.error("Chat hanya tersedia untuk konsultasi yang sudah diterima");
      return;
    }

    setShowChat(true);
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
              <ScheduleConsultation onSchedule={() => setShowModal(true)} />

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
                      <ConsultationCard
                        key={consultation.consultation_id}
                        consultation={consultation}
                        isSelected={
                          selectedConsultation?.consultation_id ===
                          consultation.consultation_id
                        }
                        onClick={setSelectedConsultation}
                      />
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

            {/* Right Column - Info Panel or Chat */}
            <div className="bg-white rounded-xl shadow-md p-6 h-fit">
              {!showChat ? (
                <>
                  <h3 className="text-3xl font-bold text-gray-800 text-center mb-6">
                    Info tentang sesi
                  </h3>
                  <ConsultationInfo
                    consultation={selectedConsultation}
                    onOpenChat={openChat}
                  />
                </>
              ) : selectedConsultation ? (
                <ChatView
                  consultation={selectedConsultation}
                  currentUserId={currentUserId}
                  onBack={() => setShowChat(false)}
                />
              ) : null}
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
