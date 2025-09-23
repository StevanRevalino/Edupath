import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TokenManager from "../../../utils/tokenManager";
import SectionCard from "./components/SectionCard";
import ColoredTag from "./components/ColoredTag";
import { getColorForString } from "../../../utils/colorUtils";

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

        // Extract prodi names for display
        const prodiNames = response.data.data.map(
          (prodi: any) => prodi.nama_prodi
        );
        setAllMajors(prodiNames);
      } catch (error) {
        console.error("Error fetching prodi data:", error);
        // If API fails, keep empty array and show error state
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

        // Extract universitas names for display
        const universitasNames = response.data.data.map(
          (univ: any) => univ.nama
        );
        setAllUniversities(universitasNames);
      } catch (error) {
        console.error("Error fetching universitas data:", error);
        // If API fails, keep empty array and show error state
        setAllUniversities([]);
      } finally {
        setUniversitiesLoading(false);
      }
    };

    fetchUniversitasData();
  }, [API_URL]);

  const infoItems = [
    { label: "Tentang kami" },
    { label: "Apa itu tes minat & bakat?" },
    { label: "Telusuri jurusan" },
    { label: "Hubungi kami" },
    { label: "Rekomendasi Universitas" },
    { label: "Info beasiswa" },
  ];

  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [universitySearchQuery, setUniversitySearchQuery] = useState("");

  // Use first 8 majors for history tags display
  const historyTags = allMajors.slice(0, 8);
  const displayedTags = showAll ? historyTags : historyTags.slice(0, 5);
  const hasMore = historyTags.length > 5 && !showAll;

  // Simple placeholder data for analytics (to be replaced with real API data later)
  const totalTests = 0;
  const topRecommendationMajor =
    allMajors.length > 0 ? allMajors[0] : "Belum ada data";
  const topRecommendationPercentage = 0;

  // Filter majors based on search query
  const filteredExploreMajors = allMajors.filter((major) =>
    major.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Always show only 8 items for home page preview
  const displayedExploreMajors = filteredExploreMajors.slice(0, 8);
  const hasMoreExplore = filteredExploreMajors.length > 8;

  // Filter universities based on search query
  const filteredUniversities = allUniversities.filter((university) =>
    university.toLowerCase().includes(universitySearchQuery.toLowerCase())
  );

  // Always show only 8 items for home page preview
  const displayedUniversities = filteredUniversities.slice(0, 8);
  const hasMoreUniversities = filteredUniversities.length > 8;

  // Helper function to get kelas text
  const getKelasText = (kelas: number | null) => {
    return `${kelas}`;
  };

  const handleUniversityClick = (universityName: string) => {
    navigate("/universitas", { state: { selectedUniversity: universityName } });
  };

  // Handle major click - navigate to jurusan page with selected major
  const handleMajorClick = (majorName: string) => {
    navigate("/jurusan", { state: { selectedMajor: majorName } });
  };

  return (
    <div className="px-4 sm:px-8 lg:px-16 xl:px-24">
      <div className="flex flex-col items-start px-4 sm:px-8 lg:px-20 pt-6 lg:pt-10 gap-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
          Hello, {user?.firstname || "User"}!
        </h1>

        {/* Header Section */}
        <div className="flex flex-col 2xl:flex-row lg:justify-between w-full justify-start lg:items-center space-y-8 lg:space-y-2">
          {/* Profile Section */}
          <div className="flex flex-col items-start lg:items-start justify-start w-full ">
            <div className="flex flex-col w-fit items-start mb-2 lg:mb-0">
              <div className="relative flex items-center py-4 lg:py-6">
                <div className="absolute left-0 w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full bg-white border-3 border-[#003B73]" />
                <div className="flex items-start border-3 border-[#003B73] rounded-full pl-28 sm:pl-32 lg:pl-34 pr-6 lg:pr-8 py-4 lg:py-6 min-w-[300px] sm:min-w-[350px] lg:min-w-[380px]">
                  <div className="ml-2 lg:ml-4 flex flex-col items-center">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold">
                      {user
                        ? `${user.firstname} ${user.lastname}`.trim()
                        : "Nama Lengkap"}
                    </div>
                    <div className="text-lg sm:text-xl font-semibold text-gray-700">
                      Kelas {user ? getKelasText(user.kelas) : "XX"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center lg:justify-start w-full ml-0 lg:ml-3">
                <button className="bg-[#003B73] text-white px-4 lg:px-6 py-2 lg:py-3 rounded-md font-semibold text-sm lg:mb-10 xl:mb-0 cursor-pointer">
                  Ubah profil
                </button>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <SectionCard
            title="Info"
            headerVariant="info"
            className="w-full lg:w-auto justify-start"
          >
            <div className="grid grid-cols-3 sm:grid-cols-6 lg:flex lg:flex-row gap-2 lg:gap-4 items-start">
              {infoItems.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center text-xs lg:text-[13px] font-bold w-full lg:w-[110px] mt-1 cursor-pointer"
                >
                  <div className="w-16 h-12 sm:w-20 sm:h-16 lg:w-24 lg:h-20 bg-white rounded-2xl lg:rounded-3xl border-1 border-[#003B73] mb-1" />
                  <span className="leading-tight">{item.label}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Analytics Section */}
      <SectionCard title="Analytics" className="mt-8 lg:mt-16 w-full">
        {/* Content Grid - Stack on mobile, grid on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-4 lg:gap-x-6 lg:gap-y-2">
          {/* Total Tes */}
          <div className="lg:row-span-1">
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
                Kamu telah mengerjakan <br />
                tes minat bakat sebanyak <br />
                <strong>{totalTests} kali!</strong>
              </div>
            </div>
          </div>

          {/* Riwayat Penjurusan + Rekomendasi */}
          <div className="lg:row-span-1">
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
                      <ColoredTag
                        key={idx}
                        text={tag}
                        getColor={getColorForString}
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
          <div className="lg:row-span-1">
            <div className="text-2xl lg:text-3xl font-bold mb-2">
              Tes terakhir
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="text-[#180085] text-4xl lg:text-6xl font-bold">
                  {totalTests}
                </div>
                <div className="text-lg lg:text-xl font-bold">Hari</div>
              </div>
              <div className="text-sm lg:text-base">
                Terakhir kali kamu mengerjakan <br />
                tes minat bakat adalah pada: <br />
                <strong>Belum ada data.</strong>
              </div>
            </div>
          </div>

          {/* Riwayat Tes */}
          <div className="lg:row-span-1">
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

      {/* Bottom Sections */}
      <div className="flex flex-col mt-8 lg:mt-16 gap-8 lg:gap-16">
        {/* First Row: Jurusan + Ujian */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-32">
          {/* Jurusan Section */}
          <SectionCard title="Jurusan" className="w-full lg:w-[60%] h-fit">
            {/* Search Bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Jelajahi jurusan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 border-2 border-[#003B73] rounded-full text-sm lg:text-base focus:outline-none bg-white"
              />
            </div>

            {/* Major Tags */}
            <div className="flex flex-wrap gap-2 lg:gap-3 mb-4">
              {majorsLoading ? (
                <div className="text-gray-500 text-sm lg:text-base">
                  Memuat data jurusan...
                </div>
              ) : displayedExploreMajors.length > 0 ? (
                <>
                  {displayedExploreMajors.map((major, idx) => (
                    <ColoredTag
                      key={idx}
                      text={major}
                      getColor={getColorForString}
                      onClick={() => handleMajorClick(major)}
                    />
                  ))}
                  {hasMoreExplore && (
                    <button
                      onClick={() => navigate("/jurusan")}
                      className="text-white text-xs lg:text-sm px-2 lg:px-3 py-1 rounded-full font-semibold bg-gray-500 cursor-pointer hover:bg-gray-600 transition-colors"
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

          {/* Ujian Section */}
          <SectionCard
            title="Ujian"
            className="w-full lg:w-[40%] h-fit pt-6 lg:pt-8 pb-4 lg:pb-5"
          >
            <div className="flex items-center justify-start h-full min-h-[120px]">
              <button
                className="bg-white rounded-2xl p-3 text-center w-full h-fit cursor-pointer"
                onClick={() => navigate("/tes")}
              >
                <div className="flex items-center gap-3 lg:gap-5 h-full justify-start">
                  <div className="p-4 lg:p-6 bg-[#E9E9E9] rounded-md">
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
                  <div className="text-gray-500 text-base lg:text-lg italic">
                    Lakukan tes baru...
                  </div>
                </div>
              </button>
            </div>
          </SectionCard>
        </div>

        {/* Second Row: Universitas + Konseling */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-32">
          {/* Universitas Section */}
          <SectionCard title="Universitas" className="w-full lg:w-[60%] h-fit">
            {/* Search Bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Jelajahi universitas..."
                value={universitySearchQuery}
                onChange={(e) => setUniversitySearchQuery(e.target.value)}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 border-2 border-[#003B73] rounded-full text-sm lg:text-base focus:outline-none bg-white"
              />
            </div>

            {/* University Tags */}
            <div className="flex flex-wrap gap-2 lg:gap-3 mb-4">
              {universitiesLoading ? (
                <div className="text-gray-500 text-sm lg:text-base">
                  Memuat data universitas...
                </div>
              ) : displayedUniversities.length > 0 ? (
                <>
                  {displayedUniversities.map((university, idx) => (
                    <ColoredTag
                      key={idx}
                      text={university}
                      getColor={getColorForString}
                      onClick={() => handleUniversityClick(university)}
                    />
                  ))}
                  {hasMoreUniversities && (
                    <button
                      onClick={() => navigate("/universitas")}
                      className="text-white text-xs lg:text-sm px-2 lg:px-3 py-1 rounded-full font-semibold bg-gray-500 cursor-pointer hover:bg-gray-600 transition-colors"
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

          {/* Konseling Section */}
          <SectionCard
            title="Konseling"
            className="w-full lg:w-[40%] h-fit pt-6 lg:pt-8 pb-4 lg:pb-5"
          >
            <div className="flex items-center justify-start h-full min-h-[120px]">
              <button
                className="bg-white rounded-2xl p-3 text-center w-full h-fit cursor-pointer"
                onClick={() => navigate("/konseling")}
              >
                <div className="flex items-center gap-3 lg:gap-5 h-full justify-start">
                  <div className="p-4 lg:p-6 bg-[#E9E9E9] rounded-md">
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
                  <div className="text-[#7E7E7E] text-base lg:text-lg italic">
                    Jadwalkan sesi konseling...
                  </div>
                </div>
              </button>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default Home;
