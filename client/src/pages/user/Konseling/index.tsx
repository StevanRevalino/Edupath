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
import HeroSection from "../../../components/HeroSection";
import InfoSection from "../../../components/InfoSection";
import HeroSectionBG from "../../../assets/hero-section.png";
import ConselingIcon from "../../../assets/icons/conseling-icon.png";
import conseling1 from "../../../assets/conseling-1.png";
import conseling2 from "../../../assets/conseling-2.png";
import conseling3 from "../../../assets/conseling-3.png";

const Konseling = () => {
  const [showModal, setShowModal] = useState(false);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] =
    useState<Consultation | null>(null);
  const [loading, setLoading] = useState(false);

  // Chat state
  const [showChat, setShowChat] = useState(false);
  const currentUserId = TokenManager.getUserData().userId || "";

  // Check if there's any active consultation
  const hasActiveConsultation = consultations.some((c) => c.is_active);

  const items = [
    {
      img: conseling1,
      title: "Kesesuaian antara Minat, Bakat, dan Jurusan",
      desc: "Ahli dapat menggunakan tes psikologi atau asesmen minat bakat untuk membantumu memahami kekuatan, kelemahan, dan kecenderungan alami kamu.",
    },
    {
      img: conseling2,
      title: "Wawasan Karier Jangka Panjang",
      desc: "Seorang konselor berpengalaman tidak hanya membahas jurusan, tapi juga prospek kerja, tren industri, dan bagaimana sebuah jurusan bisa mengarahkanmu ke karier tertentu.",
    },
    {
      img: conseling3,
      title: "Tidak Ada Penyesalan di Tengah Jalan",
      desc: "Dengan sesi konsultasi, kamu bisa lebih siap membuat keputusan sejak awal, menghemat waktu, tenaga, dan biaya selama masa studi.",
    },
  ];

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

  const handleOpenModal = () => {
    if (hasActiveConsultation) {
      toast.error(
        "Anda masih memiliki konsultasi yang sedang aktif. Harap selesaikan konsultasi tersebut terlebih dahulu."
      );
      return;
    }
    setShowModal(true);
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
    <div className="min-h-screen bg-gray-100 relative">
      {/* Hero Section */}
      <HeroSection
        backgroundImage={HeroSectionBG}
        title="Konseling"
        description={
          <>
            Bicara dengan pihak profesional sekarang. <br />
            Pastikan bahwa jurusanmu sesuai!
          </>
        }
        icon={ConselingIcon}
      >
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center rounded-full bg-[#6CCBFF] px-4 py-2
             text-sm font-semibold text-[#063E6B] shadow-[0_6px_16px_rgba(0,0,0,0.15)]
             hover:brightness-95 active:brightness-90 transition"
        >
          Jadwalkan sesi
        </button>
      </HeroSection>

      {/* Info Section */}
      <InfoSection title="Mengapa Konseling?" items={items} />

      {/* Sesi Konseling Section */}
      <section className="min-h-screen bg-gray-100 pt-8 sm:pt-12 lg:pt-24 relative px-5 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-2 md:mb-6 lg:mb-12">
            Sesi Konseling
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Jadwalkan Konseling */}
              <ScheduleConsultation
                onSchedule={handleOpenModal}
                hasPending={hasActiveConsultation}
              />{" "}
              {/* Riwayat Konseling */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Riwayat Konseling
                </h3>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 overscroll-contain pt-3">
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
      </section>

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
