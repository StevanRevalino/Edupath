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
      <section className="absolute hidden sm:block -top-20 left-0 w-full h-64 sm:h-80 lg:h-[520px] z-[1]">
        {/* Gambar background */}
        <img
          src={HeroSectionBG}
          alt="Hero Konseling"
          className="w-full h-full object-cover rounded-b-4xl"
        />

        {/* Overlay konten */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-20 lg:px-12 pt-10">
            {/* Konten */}
            <div className="flex items-center">
              {/* Kiri: teks */}
              <div className="flex-1/2 pl-8 md:pl-10 lg:pl-12 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold">
                  Konseling
                </h1>
                <p className="mt-3 text-sm sm:text-base lg:text-lg opacity-95">
                  Bicara dengan pihak profesional sekarang. <br />
                  Pastikan bahwa jurusanmu sesuai!
                </p>

                <button
                  onClick={() => setShowModal(true)}
                  className="mt-5 inline-flex items-center rounded-full bg-[#6CCBFF] px-4 py-2
                     text-sm font-semibold text-[#063E6B] shadow-[0_6px_16px_rgba(0,0,0,0.15)]
                     hover:brightness-95 active:brightness-90 transition"
                >
                  Jadwalkan sesi
                </button>
              </div>

              {/* Kanan: ikon */}
              <div className="flex flex-1/2 justify-center">
                <img
                  src={ConselingIcon}
                  alt="Ilustrasi Konseling"
                  className="w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mengapa Konseling (setelah hero) */}
      <section className="relative px-[52px] md:px-[120px] lg:px-[180px] xl:px-[240px] pt-8 sm:pt-80 lg:pt-[520px] pb-6">
        <div
          className="relative rounded-[24px] bg-[#EDF5FF] backdrop-blur-[1px]
                  px-5 py-6 md:px-8 md:py-8 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        >
          {/* corner accents */}
          <div
            className="pointer-events-none absolute -top-6 -left-6 h-12 w-12
                    border-t-2 border-l-2 border-[#0B4F85] rounded-tl-[20px]"
          />
          <div
            className="pointer-events-none absolute -bottom-6 -right-6 h-12 w-12
                    border-b-2 border-r-2 border-[#0B4F85] rounded-br-[20px]"
          />

          <h3 className="text-2xl md:text-3xl font-extrabold text-center text-black mb-8">
            Mengapa Konseling?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {items.map((it, i) => (
              <div key={i} className="text-center px-2">
                <img
                  src={it.img}
                  alt={it.title}
                  className="mx-auto w-24 h-24 md:w-32 md:h-32 object-contain"
                  loading="lazy"
                  decoding="async"
                />
                <h4 className="mt-4 font-extrabold text-[#0B4F85]">
                  {it.title}
                </h4>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {it.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
