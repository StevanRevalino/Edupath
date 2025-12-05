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
import axios from "axios";
import TokenManager from "../../../utils/tokenManager";
import type { AssessmentHistory } from "../../../types/holland";
import LoadingSpinner from "../../../components/LoadingSpinner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SESSION_KEY = "holland_test_session";

interface TestSession {
  questions: any[];
  answers: Record<number, number>;
  currentPage: number;
  timestamp: number;
}

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
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [savedSession, setSavedSession] = useState<TestSession | null>(null);
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
        const token = TokenManager.getToken();
        const response = await axios.get(`${API_URL}/api/holland/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const assessments = response.data.data;
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

  // Check for saved session on mount
  useEffect(() => {
    checkForSavedSession();
  }, []);

  const checkForSavedSession = () => {
    try {
      const savedData = localStorage.getItem(SESSION_KEY);
      if (savedData) {
        const session: TestSession = JSON.parse(savedData);
        const hoursSinceStart =
          (Date.now() - session.timestamp) / (1000 * 60 * 60);

        if (hoursSinceStart < 24) {
          setSavedSession(session);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch (err) {
      console.error("Error checking saved session:", err);
      localStorage.removeItem(SESSION_KEY);
    }
  };

  const handleContinue = () => {
    // Check if there's a saved session
    if (savedSession) {
      setShowSessionModal(true);
    } else {
      tesSessionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleContinueSession = () => {
    setShowSessionModal(false);
    navigate("/tes/pertanyaan");
  };

  const handleStartNewTest = () => {
    localStorage.removeItem(SESSION_KEY);
    setSavedSession(null);
    setShowSessionModal(false);
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
          onClick={handleContinue}
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
              <ScheduleTes
                onSchedule={() => {
                  if (savedSession) {
                    setShowSessionModal(true);
                  } else {
                    navigate("tutorial");
                  }
                }}
              />

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

      {/* Session Resume Modal */}
      {showSessionModal && savedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Sesi Tes Ditemukan
              </h3>
              <p className="text-gray-600 text-sm">
                Anda memiliki sesi tes yang belum selesai dengan{" "}
                {Object.keys(savedSession.answers).length} jawaban tersimpan.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress:</span>
                <span className="font-semibold text-gray-800">
                  {Object.keys(savedSession.answers).length} /{" "}
                  {savedSession.questions.length} pertanyaan
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      (Object.keys(savedSession.answers).length /
                        savedSession.questions.length) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleContinueSession}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
              >
                Lanjutkan Tes
              </button>
              <button
                onClick={handleStartNewTest}
                className="w-full bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold border-2 border-gray-300 hover:bg-gray-50 transition"
              >
                Mulai Tes Baru
              </button>
              <button
                onClick={() => setShowSessionModal(false)}
                className="w-full text-gray-500 text-sm hover:text-gray-700 transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

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
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-hover"
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
