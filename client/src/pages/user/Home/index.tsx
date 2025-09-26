import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TokenManager from "../../../utils/tokenManager";
import SectionCard from "./components/SectionCard";
import UnivAndProdiTag from "../../../components/UnivAndProdiTag";
import HeroSectionBG from "../../../assets/hero-section.png";

const Home = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // User data state
  const [user, setUser] = useState<{
    firstname: string;
    lastname: string;
    kelas: number | null;
  } | null>(null);

  // Prodi/Jurusan data state
  const [allMajors, setAllMajors] = useState<string[]>([]);
  const [majorsLoading, setMajorsLoading] = useState(true);

  // Universitas data state
  const [allUniversities, setAllUniversities] = useState<string[]>([]);
  const [universitiesLoading, setUniversitiesLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!TokenManager.isAuthenticated()) {
          navigate("/login");
          return;
        }

        const token = TokenManager.getToken();
        const { userId } = TokenManager.getUserData();

        const response = await axios.get(`${API_URL}/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setUser(response.data.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (
          axios.isAxiosError(error) &&
          (error.response?.status === 401 || error.response?.status === 403)
        ) {
          TokenManager.logout();
          navigate("/login");
        }
      }
    };

    fetchUserData();
  }, [navigate, API_URL]);

  // Fetch prodi data
  useEffect(() => {
    const fetchProdiData = async () => {
      try {
        if (!TokenManager.isAuthenticated()) {
          return;
        }

        const token = TokenManager.getToken();

        const response = await axios.get(`${API_URL}/api/prodi?limit=679`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const prodiNames = response.data.data.map(
          (prodi: any) => prodi.nama_prodi
        );
        setAllMajors(prodiNames);
      } catch (error) {
        console.error("Error fetching prodi data:", error);
        setAllMajors([]);
      } finally {
        setMajorsLoading(false);
      }
    };

    fetchProdiData();
  }, [API_URL]);

  // Fetch universitas data
  useEffect(() => {
    const fetchUniversitasData = async () => {
      try {
        if (!TokenManager.isAuthenticated()) {
          return;
        }

        const token = TokenManager.getToken();

        const response = await axios.get(
          `${API_URL}/api/universitas?limit=645`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const universitasNames = response.data.data.map(
          (univ: any) => univ.nama
        );
        setAllUniversities(universitasNames);
      } catch (error) {
        console.error("Error fetching universitas data:", error);
        setAllUniversities([]);
      } finally {
        setUniversitiesLoading(false);
      }
    };

    fetchUniversitasData();
  }, [API_URL]);

  const infoItems = [
    { label: "Tentang Kami" },
    { label: "Telusuri Jurusan" },
    { label: "Rekomendasi Universitas" },
    { label: "Apa itu Tes Minat Bakat?" },
    { label: "Informasi Beasiswa" },
    { label: "Hubungi Kami" },
  ];

  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [universitySearchQuery, setUniversitySearchQuery] = useState("");

  const historyTags = allMajors.slice(0, 8);
  const displayedTags = showAll ? historyTags : historyTags.slice(0, 5);
  const hasMore = historyTags.length > 5 && !showAll;

  // placeholder analytics
  const totalTests = 0;
  const tesTerakhir = "12/12/2025";
  const topRecommendationMajor =
    allMajors.length > 0 ? allMajors[0] : "Belum ada data";
  const topRecommendationPercentage = 0;

  // filters
  const filteredExploreMajors = allMajors.filter((m) =>
    m.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const displayedExploreMajors = filteredExploreMajors.slice(0, 8);
  const hasMoreExplore = filteredExploreMajors.length > 8;

  const filteredUniversities = allUniversities.filter((u) =>
    u.toLowerCase().includes(universitySearchQuery.toLowerCase())
  );
  const displayedUniversities = filteredUniversities.slice(0, 8);
  const hasMoreUniversities = filteredUniversities.length > 8;

  const getKelasText = (kelas: number | null) => `${kelas}`;
  const handleUniversityClick = (name: string) =>
    navigate("/universitas", { state: { selectedUniversity: name } });
  const handleMajorClick = (name: string) =>
    navigate("/jurusan", { state: { selectedMajor: name } });

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* HERO SECTION */}
      <section className="hidden sm:block absolute -top-10 lg:-top-20 left-0 w-full h-64 sm:h-80 lg:h-[520px] z-[1]">
        {/* Gambar background */}
        <img
          src={HeroSectionBG}
          alt="Hero Home"
          className="w-full h-full object-cover rounded-b-4xl"
        />

        {/* Overlay konten */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-6 lg:px-12">
            {/* Grid kiri-kanan: kiri (greeting), kanan (kartu info) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
              {/* Kiri: avatar + sapaan + deskripsi + tombol */}
              <div className="max-w-lg text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white/95 shadow-inner ring-2 ring-white/50" />
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold">
                      Hello, {user?.firstname ? `${user.firstname}!` : "Name!"}
                    </h1>
                    <p className="text-white/95 font-semibold -mt-0.5">
                      Kelas {user ? getKelasText(user.kelas) : "XX"}
                    </p>
                  </div>
                </div>

                <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg opacity-95">
                  Yuk, jelajahi minat dan bakatmu, temukan jurusan dan
                  universitas terbaik untuk masa depanmu bersama{" "}
                  <strong>EduPath</strong>!
                </p>

                <button
                  className="mt-5 inline-flex items-center rounded-full bg-[#6CCBFF] px-4 py-2
                       text-sm font-semibold text-[#063E6B] shadow-[0_6px_16px_rgba(0,0,0,0.15)]
                       hover:brightness-95 active:brightness-90 transition"
                >
                  Ubah profil
                </button>
              </div>

              {/* Kanan: grid 2×3 kartu info */}
              <div className="hidden lg:grid grid-cols-3 gap-x-6 gap-y-8 content-start">
                {infoItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="h-20 w-20 lg:h-24 lg:w-24 rounded-2xl bg-white/95 shadow-md" />
                    <span className="mt-2 text-[11px] lg:text-xs font-semibold text-white drop-shadow">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Gradient gelap tipis dari kiri biar teks lebih kontras */}
        <div
          className="absolute inset-0 pointer-events-none rounded-b-4xl
               bg-gradient-to-r from-[rgba(0,0,0,0.25)] via-transparent to-transparent"
        />
      </section>

      <div className="relative px-4 sm:px-8 lg:px-10 xl:px-24  sm:pt-80 lg:pt-[520px] pb-6">
        {/* INFO (mobile only) */}
        <SectionCard title="Info" className="block lg:hidden w-full mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {infoItems.map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white shadow-md" />
                <span className="mt-1 sm:mt-2 text-[10px] sm:text-[11px] font-semibold text-gray-700">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
        {/* ANALYTICS */}
        <SectionCard title="Analytics" className="mt-8 lg:mt-12 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-4 lg:gap-6">
            {/* Total Tes */}
            <div>
              <div className="text-2xl lg:text-3xl font-bold mb-2">
                Total tes diselesaikan
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="text-[#780000] text-4xl lg:text-6xl font-bold">
                    {totalTests}
                  </div>
                  <div className="text-lg lg:text-xl font-bold">Tes</div>
                </div>
                <div className="text-sm lg:text-base">
                  Kamu telah mengerjakan <br /> tes minat bakat sebanyak <br />
                  <strong>{totalTests} kali!</strong>
                </div>
              </div>
            </div>

            {/* Riwayat Penjurusan + Rekomendasi */}
            <div>
              <div className="text-base lg:text-lg font-bold mb-3">
                Riwayat Penjurusan
              </div>
              <div className="flex flex-wrap justify-start gap-2 lg:gap-3">
                {majorsLoading ? (
                  <div className="text-gray-500 text-sm">Memuat data...</div>
                ) : displayedTags.length > 0 ? (
                  <>
                    {displayedTags.map((tag, idx) => (
                      <UnivAndProdiTag
                        key={idx}
                        text={tag}
                        onClick={() => {}}
                      />
                    ))}
                    {hasMore && (
                      <>
                        <span className="text-white text-xs lg:text-sm px-2 lg:px-3 py-1 rounded-full font-semibold bg-gray-500">
                          ...
                        </span>
                        <button
                          onClick={() => setShowAll(true)}
                          className="text-white text-xs lg:text-sm px-2 lg:px-3 py-1 rounded-full font-semibold bg-gray-500 cursor-pointer"
                        >
                          Lihat lainnya...
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-gray-500 text-sm">Belum ada riwayat</div>
                )}
              </div>

              <div className="text-end mt-4">
                <div className="text-lg lg:text-2xl font-bold">
                  ({topRecommendationPercentage}%) Jurusan paling cocok
                </div>
                <div className="text-green-700 text-2xl lg:text-4xl font-bold">
                  {topRecommendationMajor}
                </div>
                <div className="text-xs lg:text-sm mt-1">
                  Rekomendasi tertinggimu saat ini!
                </div>
              </div>
            </div>

            {/* Tes Terakhir */}
            <div>
              <div className="text-2xl lg:text-3xl font-bold mb-2">
                Tes terakhir
              </div>
              <div className="flex flex-col gap-4">
                <div className="text-sm lg:text-base">
                  Terakhir kali kamu mengerjakan <br />
                  tes minat bakat adalah pada:
                </div>
                <div className="text-[#180085] text-3xl lg:text-5xl font-bold">
                  {tesTerakhir}
                </div>
              </div>
            </div>

            {/* Riwayat Tes */}
            <div>
              <div className="text-base lg:text-lg font-bold mb-3">
                Riwayat Tes
              </div>
              <div className="flex flex-wrap gap-4 lg:gap-6 w-full">
                <div className="bg-white rounded-3xl shadow-md p-3 lg:p-4 flex-1 min-w-[180px] sm:min-w-[200px] lg:min-w-[200px] max-w-[280px] sm:max-w-[300px] lg:max-w-[280px] text-center">
                  <div className="text-gray-500 text-sm lg:text-base">
                    Belum ada riwayat tes
                  </div>
                  <div className="text-xs lg:text-sm mt-2">
                    Mulai tes pertama Anda untuk melihat riwayat di sini
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* BOTTOM SECTIONS */}
        <div className="flex flex-col mt-8 lg:mt-12 gap-8 lg:gap-16">
          {/* Jurusan + Ujian */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-32">
            <SectionCard title="Jurusan" className="w-full lg:w-[60%] h-fit">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Jelajahi jurusan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 lg:py-3 border-2 border-[#003B73] rounded-full text-sm lg:text-base focus:outline-none bg-white"
                />
              </div>

              <div className="flex flex-wrap gap-2 lg:gap-3 mb-4">
                {majorsLoading ? (
                  <div className="text-gray-500 text-sm lg:text-base">
                    Memuat data jurusan...
                  </div>
                ) : displayedExploreMajors.length > 0 ? (
                  <>
                    {displayedExploreMajors.map((major, idx) => (
                      <UnivAndProdiTag
                        key={idx}
                        text={major}
                        onClick={() => handleMajorClick(major)}
                      />
                    ))}
                    {hasMoreExplore && (
                      <button
                        onClick={() => navigate("/jurusan")}
                        className="text-white text-xs lg:text-sm px-3 py-1 rounded-full font-semibold bg-gray-500 cursor-pointer hover:bg-gray-600 transition-colors"
                      >
                        Lihat semua jurusan...
                      </button>
                    )}
                  </>
                ) : searchQuery ? (
                  <div className="text-gray-500 text-sm lg:text-base italic">
                    Tidak ada jurusan yang ditemukan untuk "{searchQuery}"
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm lg:text-base">
                    Belum ada data jurusan
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Ujian"
              className="w-full lg:w-[40%] h-fit pt-6 lg:pt-8 pb-4 lg:pb-5"
            >
              <div className="flex items-center justify-start h-full min-h-[120px]">
                <button
                  className="bg-white rounded-2xl p-3 text-center w-full h-fit cursor-pointer"
                  onClick={() => navigate("/tes")}
                >
                  <div className="flex items-center gap-5 h-full justify-start">
                    <div className="p-6 bg-[#E9E9E9] rounded-md">
                      <Plus
                        size={32}
                        className="text-[#7E7E7E]"
                        strokeWidth={2}
                      />
                    </div>
                    <div className="text-gray-500 text-lg italic">
                      Lakukan tes baru...
                    </div>
                  </div>
                </button>
              </div>
            </SectionCard>
          </div>

          {/* Universitas + Konseling */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-32">
            <SectionCard
              title="Universitas"
              className="w-full lg:w-[60%] h-fit"
            >
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Jelajahi universitas..."
                  value={universitySearchQuery}
                  onChange={(e) => setUniversitySearchQuery(e.target.value)}
                  className="w-full px-4 py-2 lg:py-3 border-2 border-[#003B73] rounded-full text-sm lg:text-base focus:outline-none bg-white"
                />
              </div>

              <div className="flex flex-wrap gap-2 lg:gap-3 mb-4">
                {universitiesLoading ? (
                  <div className="text-gray-500 text-sm lg:text-base">
                    Memuat data universitas...
                  </div>
                ) : displayedUniversities.length > 0 ? (
                  <>
                    {displayedUniversities.map((u, idx) => (
                      <UnivAndProdiTag
                        key={idx}
                        text={u}
                        onClick={() => handleUniversityClick(u)}
                      />
                    ))}
                    {hasMoreUniversities && (
                      <button
                        onClick={() => navigate("/universitas")}
                        className="text-white text-xs lg:text-sm px-3 py-1 rounded-full font-semibold bg-gray-500 cursor-pointer hover:bg-gray-600 transition-colors"
                      >
                        Lihat semua universitas...
                      </button>
                    )}
                  </>
                ) : universitySearchQuery ? (
                  <div className="text-gray-500 text-sm lg:text-base italic">
                    Tidak ada universitas yang ditemukan untuk "
                    {universitySearchQuery}"
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm lg:text-base">
                    Belum ada data universitas
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Konseling"
              className="w-full lg:w-[40%] h-fit pt-6 lg:pt-8 pb-4 lg:pb-5"
            >
              <div className="flex items-center justify-start h-full min-h-[120px]">
                <button
                  className="bg-white rounded-2xl p-3 text-center w-full h-fit cursor-pointer"
                  onClick={() => navigate("/konseling")}
                >
                  <div className="flex items-center gap-5 h-full justify-start">
                    <div className="p-6 bg-[#E9E9E9] rounded-md">
                      <Plus
                        size={32}
                        className="text-[#7E7E7E]"
                        strokeWidth={2}
                      />
                    </div>
                    <div className="text-[#7E7E7E] text-lg italic">
                      Jadwalkan sesi konseling...
                    </div>
                  </div>
                </button>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
