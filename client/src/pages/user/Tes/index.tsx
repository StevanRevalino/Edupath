import { useRef, useState } from "react";
import HeroSectionBG from "../../../assets/hero-section.png";
import TesIcon from "../../../assets/icons/tes-header-icon.png";
import TestInfoIcon1 from "../../../assets/test-info-icon-1.png";
import TestInfoIcon2 from "../../../assets/test-info-icon-2.png";
import TestInfoIcon3 from "../../../assets/test-info-icon-3.png";
import ScheduleTes from "./Components/ScheduleTes";
import InfoTes, { type TesSession } from "./Components/InfoTes";
import TesCard from "./Components/RiwayatTesCard";
import { useNavigate } from "react-router-dom";

// Dummy data for test sessions
const dummyTesSessions: TesSession[] = [
  {
    test_id: "TES001",
    murid_id: "MRD001",
    test_date: "2024-01-15T10:00:00Z",
    status: "COMPLETED",
    score: 85,
    result_summary:
      "Anda memiliki minat yang kuat di bidang teknologi dan sains, dengan bakat analitis yang baik.",
    notes:
      "Hasil tes menunjukkan kesesuaian dengan jurusan Teknik Informatika atau Sistem Informasi.",
    created_at: "2024-01-10T08:00:00Z",
    updated_at: "2024-01-15T11:30:00Z",
  },
  {
    test_id: "TES002",
    murid_id: "MRD001",
    test_date: "2024-02-20T14:00:00Z",
    status: "COMPLETED",
    score: 78,
    result_summary: "Minat tinggi pada bidang komunikasi dan media.",
    created_at: "2024-02-18T09:00:00Z",
    updated_at: "2024-02-20T15:00:00Z",
  },
  {
    test_id: "TES003",
    murid_id: "MRD001",
    test_date: "2024-03-25T09:00:00Z",
    status: "CANCELLED",
    created_at: "2024-03-20T10:00:00Z",
    updated_at: "2024-03-20T10:00:00Z",
  },
];

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
  const [tesSessions] = useState<TesSession[]>(dummyTesSessions);
  const [selectedTesSession, setSelectedTesSession] =
    useState<TesSession | null>(null);

  const handleViewResult = (tesSession: TesSession) => {
    console.log("Viewing result for test:", tesSession.test_id);
    // Here you would implement the logic to show test results
  };

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
      <section className="absolute hidden sm:block -top-20 left-0 w-full h-64 sm:h-80 lg:h-[520px] z-[1]">
        <img
          src={HeroSectionBG}
          alt="Hero Konseling"
          className="w-full h-full object-cover rounded-b-4xl"
        />

        {/* Overlay konten */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-20 lg:px-12 pt-10">
            <div className="flex items-center">
              <div className="flex-1/2 pl-8 md:pl-10 lg:pl-12 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-1">
                  Uji Tes Minat
                </h1>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold">
                  & Bakat
                </h1>
                <p className="mt-3 text-sm sm:text-base lg:text-lg opacity-95">
                  Lakukan tes minat dan bakat sekarang. <br />
                  Cari tahu bidang kesukaanmu!
                </p>

                <button
                  onClick={handleLakukanTes}
                  className="mt-5 inline-flex items-center rounded-full bg-[#6CCBFF] px-4 py-2
                     text-sm font-semibold text-[#063E6B] shadow-[0_6px_16px_rgba(0,0,0,0.15)]
                     hover:brightness-95 active:brightness-90 transition"
                >
                  Lakukan Tes
                </button>
              </div>

              <div className="flex flex-1/2 justify-center">
                <img
                  src={TesIcon}
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

      {/* Info Card Section */}
      <section className="relative px-[52px] md:px-[120px] lg:px-[180px] xl:px-[240px] pt-8 sm:pt-80 lg:pt-[520px] pb-6">
        <div
          className="relative rounded-[24px] bg-[#EDF5FF] backdrop-blur-[1px]
                  px-5 py-6 md:px-8 md:py-8 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        >
          <div
            className="pointer-events-none absolute -top-6 -left-6 h-12 w-12
                    border-t-2 border-l-2 border-[#0B4F85] rounded-tl-[20px]"
          />
          <div
            className="pointer-events-none absolute -bottom-6 -right-6 h-12 w-12
                    border-b-2 border-r-2 border-[#0B4F85] rounded-br-[20px]"
          />

          <h3 className="text-2xl md:text-3xl font-extrabold text-center text-[#0B4F85] mb-8">
            Mengapa Tes Minat & Bakat?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 overscroll-contain">
                  {tesSessions.length > 0 ? (
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
              <InfoTes
                tesSession={selectedTesSession}
                onViewResult={handleViewResult}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Placeholder for Modal - you can implement actual modal later */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">Jadwalkan Tes</h3>
            <p className="text-gray-600 mb-4">
              Fitur penjadwalan tes akan segera tersedia.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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
