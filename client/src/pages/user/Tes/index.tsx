import { useRef, useState, useEffect } from "react";
import HeroSection from "../../../components/HeroSection";
import InfoSection from "../../../components/InfoSection";
import HeroSectionBG from "../../../assets/hero-section.png";
import TesIcon from "../../../assets/icons/tes-header-icon.png";
import TestInfoIcon1 from "../../../assets/tes-info-1.png";
import TestInfoIcon2 from "../../../assets/tes-info-2.png";
import TestInfoIcon3 from "../../../assets/tes-info-3.png";
import ScheduleTes from "./Components/ScheduleTes";
import InfoTes, { type TesSession } from "./Components/InfoTes";
import TesCard from "./Components/RiwayatTesCard";
import { useNavigate } from "react-router-dom";
import { getAssessmentHistory } from "../../../services/hollandService";
import type { AssessmentHistory } from "../../../types/holland";
import LoadingSpinner from "../../../components/LoadingSpinner";

// Helper function to map AssessmentHistory to TesSession
const mapAssessmentToTesSession = (
  assessment: AssessmentHistory
): TesSession => {
  return {
    test_id: assessment.assessment_id,
    murid_id: "", // Not needed for display
    test_date: assessment.completed_at,
    status: "COMPLETED",
    result_summary: `Holland Code: ${assessment.holland_code} (${
      assessment.primary_type
    }${assessment.secondary_type ? ` - ${assessment.secondary_type}` : ""})`,
    created_at: assessment.completed_at,
    updated_at: assessment.completed_at,
  };
};

const items = [
  {
    img: TestInfoIcon1,
    title: "Mengenal Diri Secara Objektif dan Terukur",
    desc: "Tes minat dan bakat membantu kamu memahami potensi dirimu secara lebih ilmiah, bukan hanya berdasarkan perasaan atau opini orang lain.",
  },
  {
    img: TestInfoIcon2,
    title: "Mempersempit Pilihan Jurusan atau Karier",
    desc: "Daripada bingung dengan banyaknya pilihan jurusan, hasil tes bisa mengarahkanmu pada bidang-bidang yang memang cocok dengan kepribadian dan kemampuanmu.",
  },
  {
    img: TestInfoIcon3,
    title: "Basis Diskusi dengan Orang Tua / Konselor",
    desc: "Dengan hasil tes sebagai referensi, kamu bisa berdiskusi dengan orang tua atau konselor pendidikan secara lebih konstruktif.",
  },
];

const Tes = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [tesSessions, setTesSessions] = useState<TesSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTesSession, setSelectedTesSession] =
    useState<TesSession | null>(null);

  // Fetch assessment history on component mount
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const assessments = await getAssessmentHistory();
        const mappedSessions = assessments.map(mapAssessmentToTesSession);
        setTesSessions(mappedSessions);
      } catch (err: any) {
        console.error("Error fetching assessment history:", err);
        setError(err.response?.data?.message || "Gagal memuat riwayat tes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  const tesSessionRef = useRef<HTMLElement>(null);

  const handleLakukanTes = () => {
    tesSessionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Hero Section */}
      <HeroSection
        backgroundImage={HeroSectionBG}
        title="Uji Tes Minat & Bakat"
        description={
          <>
            Lakukan tes minat dan bakat sekarang. <br />
            Cari tahu bidang kesukaanmu!
          </>
        }
        icon={TesIcon}
      >
        <button
          onClick={handleLakukanTes}
          className="inline-flex items-center rounded-full bg-primary px-4 py-2
             text-sm font-semibold text-primary-dark shadow-[0_6px_16px_rgba(0,0,0,0.15)]
             hover:brightness-95 active:brightness-90 transition"
        >
          Lakukan Tes
        </button>
      </HeroSection>

      {/* Info Section */}
      <InfoSection title="Mengapa Tes Minat & Bakat?" items={items} />

      {/* Sesi Tes Minat & Bakat Section */}
      <section
        className="min-h-screen bg-gray-100 pt-8 sm:pt-12 lg:pt-24 relative px-5 lg:px-10"
        ref={tesSessionRef}
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-2 md:mb-6 lg:mb-12">
            Sesi Tes Minat & Bakat
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              {/* Jadwalkan Tes */}
              <ScheduleTes onSchedule={() => navigate("tutorial")} />

              {/* Riwayat Tes */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Riwayat Tes
                </h3>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 overscroll-contain pt-3">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : error ? (
                    <div className="text-center text-red-500 py-8">
                      <p className="text-sm">{error}</p>
                    </div>
                  ) : tesSessions.length > 0 ? (
                    tesSessions.map((tesSession, index) => (
                      <TesCard
                        key={tesSession.test_id}
                        tesSession={tesSession}
                        index={index}
                        isSelected={
                          selectedTesSession?.test_id === tesSession.test_id
                        }
                        onClick={setSelectedTesSession}
                      />
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <p className="text-sm">Belum ada riwayat tes</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Info Panel */}
            <div className="bg-white rounded-xl shadow-md p-6 h-fit">
              <InfoTes tesSession={selectedTesSession} />
            </div>
          </div>
        </div>
      </section>

      {/* Placeholder for Modal - you can implement actual modal later */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">Jadwalkan Tes</h3>
            <p className="text-gray-600 mb-4">
              Fitur penjadwalan tes akan segera tersedia.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-light"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tes;
