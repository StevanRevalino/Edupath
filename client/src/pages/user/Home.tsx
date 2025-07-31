import { Plus } from "lucide-react";
import React, { useState } from "react";

const Home = () => {
  const infoItems = [
    { label: "Tentang kami" },
    { label: "Apa itu tes minat & bakat?" },
    { label: "Telusuri jurusan" },
    { label: "Hubungi kami" },
    { label: "Rekomendasi Universitas" },
    { label: "Info beasiswa" },
  ];

  const historyTags = [
    "Sistem Informasi",
    "Akuntansi",
    "Teknik Sipil",
    "Food Tech",
    "Manajemen",
    "Arsitektur",
    "Aktuaria",
    "Pendidikan",
    "Agroteknologi",
    "Teknik Informatika",
    "Psikologi",
    "Kedokteran",
    "Farmasi",
    "Hukum",
    "Ekonomi",
    "Matematika",
    "Fisika",
    "Kimia",
    "Biologi",
    "Sastra Inggris",
  ];

  const testHistories = [
    { date: "15 Jan 2024", major: "Computer Science", score: "95.5" },
    { date: "28 Des 2023", major: "Sistem Informasi", score: "88.2" },
    { date: "10 Nov 2023", major: "Teknik Informatika", score: "92.1" },
    { date: "22 Okt 2023", major: "Manajemen", score: "78.9" },
    { date: "05 Sep 2023", major: "Akuntansi", score: "85.7" },
    { date: "22 Okt 2023", major: "Manajemen", score: "78.9" },
    { date: "05 Sep 2023", major: "Akuntansi", score: "85.7" },
  ];

  // Dummy data untuk analytics
  const analyticsData = {
    totalTests: 12,
    lastTestDate: "15 Jan 2024",
    topRecommendation: {
      major: "Computer Science",
      percentage: 87,
    },
    lastTestNumber: 12,
  };

  // Dummy data untuk explore majors
  const exploreMajors = [
    "Sistem Informasi",
    "Akuntansi",
    "Teknik Sipil",
    "Food Tech",
    "Manajemen",
    "Arsitektur",
    "Aktuaria",
    "Pendidikan",
    "Agroteknologi",
    "Teknik Informatika",
    "Psikologi",
    "Kedokteran",
    "Farmasi",
    "Hukum",
    "Ekonomi",
    "Matematika",
    "Fisika",
    "Kimia",
    "Biologi",
    "Sastra Inggris",
  ];

  // Dummy data untuk universitas
  const universities = [
    "Bina Nusantara",
    "Univ. Pelita Harapan",
    "Univ. Indonesia",
    "Univ. Tarumanagara",
    "Atma Jaya",
    "Institut Teknologi Bandung",
    "Univ. Gadjah Mada",
    "Prasetiya Mulya",
    "Univ. Airlangga",
    "Univ. Brawijaya",
    "Institut Teknologi Sepuluh Nopember",
    "Univ. Diponegoro",
    "Univ. Padjadjaran",
    "Univ. Hasanuddin",
    "Univ. Sebelas Maret",
    "Univ. Negeri Yogyakarta",
    "Institut Pertanian Bogor",
    "Univ. Sumatera Utara",
    "Univ. Andalas",
    "Univ. Riau",
  ];

  const colorMap: Record<string, string> = {
    Akuntansi: "bg-[#3C3782]",
    Mikrobiologi: "bg-[#B31507]",
    "Teknik Sipil": "bg-[#B7D200]",
    Aktuaria: "bg-[#00B7F3]",
    Manajemen: "bg-[#FF00E5]",
    "Food Tech": "bg-[#F0544F]",
    "Sistem Informasi": "bg-[#8B0000]",
    Arsitektur: "bg-[#7C3AED]",
    Pendidikan: "bg-[#F59E0B]",
    Agroteknologi: "bg-[#EF4444]",
    "Teknik Informatika": "bg-[#1E40AF]",
    Psikologi: "bg-[#DC2626]",
    Kedokteran: "bg-[#059669]",
    Farmasi: "bg-[#7C2D12]",
    Hukum: "bg-[#1F2937]",
    Ekonomi: "bg-[#0891B2]",
    Matematika: "bg-[#5B21B6]",
    Fisika: "bg-[#BE123C]",
    Kimia: "bg-[#047857]",
    Biologi: "bg-[#C2410C]",
    "Sastra Inggris": "bg-[#7E22CE]",

    // Universities colors
    "Bina Nusantara": "bg-[#1E3A8A]",
    "Univ. Pelita Harapan": "bg-[#7C2D12]",
    "Univ. Indonesia": "bg-[#B91C1C]",
    "Univ. Tarumanagara": "bg-[#059669]",
    "Atma Jaya": "bg-[#7C3AED]",
    "Institut Teknologi Bandung": "bg-[#BE123C]",
    "Univ. Gadjah Mada": "bg-[#C2410C]",
    "Prasetiya Mulya": "bg-[#0891B2]",
    "Univ. Airlangga": "bg-[#5B21B6]",
    "Univ. Brawijaya": "bg-[#047857]",
    "Institut Teknologi Sepuluh Nopember": "bg-[#1F2937]",
    "Univ. Diponegoro": "bg-[#DC2626]",
    "Univ. Padjadjaran": "bg-[#F59E0B]",
    "Univ. Hasanuddin": "bg-[#EF4444]",
    "Univ. Sebelas Maret": "bg-[#8B0000]",
    "Univ. Negeri Yogyakarta": "bg-[#B31507]",
    "Institut Pertanian Bogor": "bg-[#3C3782]",
    "Univ. Sumatera Utara": "bg-[#00B7F3]",
    "Univ. Andalas": "bg-[#FF00E5]",
    "Univ. Riau": "bg-[#F0544F]",
  };

  const [showAll, setShowAll] = useState(false);
  const [showAllExplore, setShowAllExplore] = useState(false);
  const [showAllUniversities, setShowAllUniversities] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [universitySearchQuery, setUniversitySearchQuery] = useState("");

  const displayedTags = showAll ? historyTags : historyTags.slice(0, 5);
  const hasMore = historyTags.length > 5 && !showAll;

  // Filter majors based on search query
  const filteredExploreMajors = exploreMajors.filter((major) =>
    major.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedExploreMajors = showAllExplore
    ? filteredExploreMajors
    : filteredExploreMajors.slice(0, 9);
  const hasMoreExplore = filteredExploreMajors.length > 9 && !showAllExplore;

  // Filter universities based on search query
  const filteredUniversities = universities.filter((university) =>
    university.toLowerCase().includes(universitySearchQuery.toLowerCase())
  );

  const displayedUniversities = showAllUniversities
    ? filteredUniversities
    : filteredUniversities.slice(0, 8);
  const hasMoreUniversities =
    filteredUniversities.length > 8 && !showAllUniversities;

  return (
    <div className="px-4 sm:px-8 lg:px-16 xl:px-24">
      <div className="flex flex-col items-start px-4 sm:px-8 lg:px-20 pt-6 lg:pt-10 gap-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
          Hello, Name!
        </h1>

        {/* Header Section */}
        <div className="flex flex-col 2xl:flex-row lg:justify-between w-full lg:items-center space-y-8 lg:space-y-2">
          {/* Profile Section */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="flex flex-col w-fit items-start mb-4 lg:mb-0">
              <div className="relative flex items-center py-4 lg:py-6">
                <div className="absolute left-0 w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full bg-white border-3 border-[#003B73]" />
                <div className="flex items-center border-3 border-[#003B73] rounded-full pl-28 sm:pl-32 lg:pl-34 pr-6 lg:pr-8 py-4 lg:py-6 min-w-[300px] sm:min-w-[350px] lg:min-w-[380px]">
                  <div className="ml-2 lg:ml-4 flex flex-col items-center">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold">
                      Nama Lengkap
                    </div>
                    <div className="text-lg sm:text-xl font-semibold text-gray-700">
                      Kelas XX
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center lg:justify-start w-full ml-0 lg:ml-3">
                <button className="bg-[#003B73] text-white px-4 lg:px-6 py-2 lg:py-3 rounded-md text-sm lg:mb-10 xl:mb-0 cursor-pointer">
                  Ubah profil
                </button>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-[#e6f3ff] border-3 border-[#003B73] rounded-tl-[30px] lg:rounded-tl-[50px] rounded-br-[30px] lg:rounded-br-[50px] pl-3 lg:pl-4 pr-2 lg:pr-3 pt-3 lg:pt-4 pb-2 lg:pb-3 w-full lg:w-auto">
            <div className="relative mb-2 lg:mb-3">
              <div className="absolute -top-6 lg:-top-9 left-6 lg:left-10 bg-white px-4 lg:px-8 py-0.5 border-3 border-[#003B73] rounded-4xl text-sm lg:text-lg font-bold">
                Info
              </div>
            </div>
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
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mt-8 lg:mt-16 w-full border-3 border-red-700 rounded-br-[40px] lg:rounded-br-[60px] rounded-tl-[40px] lg:rounded-tl-[60px] bg-[#FFEEEE] px-4 lg:px-10 py-4 lg:py-6 relative">
        <div className="absolute -top-4 lg:-top-6 left-8 lg:left-16 bg-white border-3 border-red-700 rounded-4xl px-3 lg:px-4 py-1 font-bold text-sm lg:text-lg">
          Analytics
        </div>

        {/* Content Grid - Stack on mobile, grid on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-4 lg:gap-x-6 lg:gap-y-2 mt-2">
          {/* Total Tes */}
          <div className="lg:row-span-1">
            <div className="text-2xl lg:text-3xl font-bold mb-2">
              Total tes diselesaikan
            </div>
            <div className="flex gap-4">
              <div>
                <div className="text-[#780000] text-4xl lg:text-6xl font-bold">
                  {analyticsData.totalTests}
                </div>
                <div className="text-lg lg:text-xl font-bold ml-3">Tes</div>
              </div>
              <div className="text-sm lg:text-base">
                Kamu telah mengerjakan <br />
                tes minat bakat sebanyak <br />
                <strong>{analyticsData.totalTests} kali!</strong>
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
                {displayedTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className={`text-white text-xs lg:text-sm px-2 lg:px-3 py-1 rounded-full font-semibold hover:opacity-80 cursor-pointer ${
                      colorMap[tag] || "bg-[#888]"
                    }`}
                  >
                    {tag}
                  </span>
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
              </div>
            </div>
            <div className="text-end mt-4">
              <div className="text-lg lg:text-2xl font-bold">
                ({analyticsData.topRecommendation.percentage}%) Jurusan paling
                cocok
              </div>
              <div className="text-green-700 text-2xl lg:text-4xl font-bold">
                {analyticsData.topRecommendation.major}
              </div>
              <div className="text-xs lg:text-sm mt-1">
                Rekomendasi tertinggimu saat ini!
              </div>
            </div>
          </div>

          {/* Tes Terakhir */}
          <div className="lg:row-span-1">
            <div className="text-xl lg:text-2xl font-bold mb-2">
              Tes terakhir
            </div>
            <div className="flex gap-4">
              <div>
                <div className="text-[#180085] text-4xl lg:text-6xl font-bold">
                  {analyticsData.lastTestNumber}
                </div>
                <div className="text-lg lg:text-xl font-bold ml-3">Tes</div>
              </div>
              <div className="text-sm lg:text-base">
                Terakhir kali kamu mengerjakan <br />
                tes minat bakat adalah pada: <br />
                <strong>{analyticsData.lastTestDate}.</strong>
              </div>
            </div>
          </div>

          {/* Riwayat Tes */}
          <div className="lg:row-span-1">
            <div className="text-xl lg:text-2xl font-bold mb-3">
              Riwayat Tes
            </div>
            <div className="flex flex-wrap gap-4 lg:gap-6 w-full">
              {testHistories.slice(0, 4).map((test, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl shadow-md p-3 lg:p-4 hover:shadow-lg transition-shadow
                    cursor-pointer flex-1 min-w-[180px] sm:min-w-[200px] lg:min-w-[200px] max-w-[280px]
                    sm:max-w-[300px] lg:max-w-[280px]"
                >
                  <div className="text-xs lg:text-base font-bold mb-2">
                    {test.date}
                  </div>
                  <div className="text-xs lg:text-sm mb-1">
                    <div className="text-gray-700">Hasil penjurusan:</div>
                    <div className="font-bold text-gray-900 text-sm lg:text-base">
                      {test.major}
                    </div>
                  </div>
                  <div className="text-xs lg:text-sm mb-1">
                    <div className="text-gray-700 font-bold">
                      Skor akhir: {test.score}
                    </div>
                  </div>
                  <div className="text-xs lg:text-sm underline transition-colors">
                    Lihat rincian &gt;&gt;
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sections */}
      <div className="flex flex-col mt-8 lg:mt-16 gap-8 lg:gap-16">
        {/* First Row: Jurusan + Ujian */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-32">
          {/* Jurusan Section */}
          <div className="w-full lg:w-[60%] h-fit border-3 border-[#90007D] rounded-br-[40px] lg:rounded-br-[60px] rounded-tl-[40px] lg:rounded-tl-[60px] bg-[#FFE6FC] px-4 lg:px-10 py-4 lg:py-6 relative">
            <div className="absolute -top-4 lg:-top-6 left-8 lg:left-16 bg-white border-3 border-[#90007D] rounded-4xl px-3 lg:px-5 py-1 font-bold text-sm lg:text-lg">
              Jurusan
            </div>

            <div className="mt-2">
              {/* Search Bar */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Jelajahi jurusan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 lg:px-4 py-2 lg:py-3 border-2 border-[#90007D] rounded-full text-sm lg:text-base focus:outline-none bg-white"
                />
              </div>

              {/* Major Tags */}
              <div className="flex flex-wrap gap-2 lg:gap-3 mb-4">
                {displayedExploreMajors.map((major, idx) => (
                  <span
                    key={idx}
                    className={`text-white text-xs lg:text-sm px-2 lg:px-3 py-1 rounded-full font-semibold cursor-pointer hover:opacity-80 transition-opacity ${
                      colorMap[major] || "bg-[#888]"
                    }`}
                  >
                    {major}
                  </span>
                ))}
                {hasMoreExplore && (
                  <>
                    <button
                      onClick={() => setShowAllExplore(true)}
                      className="text-white text-xs lg:text-sm px-2 lg:px-3 py-1 rounded-full font-semibold bg-gray-500 cursor-pointer hover:bg-gray-600 transition-colors"
                    >
                      Lihat lainnya...
                    </button>
                  </>
                )}
                {filteredExploreMajors.length === 0 && searchQuery && (
                  <div className="text-gray-500 text-sm lg:text-base italic">
                    Tidak ada jurusan yang ditemukan untuk "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ujian Section */}
          <div className="w-full lg:w-[40%] h-fit border-3 border-yellow-500 rounded-br-[40px] lg:rounded-br-[60px] rounded-tl-[40px] lg:rounded-tl-[60px] bg-[#FFFBEB] px-4 lg:px-10 pt-6 lg:pt-8 pb-4 lg:pb-5 relative">
            <div className="absolute -top-4 lg:-top-6 left-8 lg:left-16 bg-white border-3 border-yellow-500 rounded-4xl px-3 lg:px-4 py-1 font-bold text-sm lg:text-lg outline-none">
              Ujian
            </div>

            <div className="flex items-center justify-start h-full min-h-[120px]">
              <button className="bg-white rounded-2xl p-3 text-center w-full h-fit cursor-pointer">
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
          </div>
        </div>

        {/* Second Row: Universitas + Konseling */}
        <div className="flex flex-col lg:flex-row gap-32">
          {/* Universitas Section */}
          <div className="w-full lg:w-[60%] h-fit border-3 border-[#007B3A] rounded-br-[40px] lg:rounded-br-[60px] rounded-tl-[40px] lg:rounded-tl-[60px] bg-[#E8F5E8] px-4 lg:px-10 py-4 lg:py-6 relative">
            <div className="absolute -top-4 lg:-top-6 left-8 lg:left-16 bg-white border-3 border-[#007B3A] rounded-4xl px-3 lg:px-5 py-1 font-bold text-sm lg:text-lg">
              Universitas
            </div>

            <div className="mt-2">
              {/* Search Bar */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Jelajahi universitas..."
                  value={universitySearchQuery}
                  onChange={(e) => setUniversitySearchQuery(e.target.value)}
                  className="w-full px-3 lg:px-4 py-2 lg:py-3 border-2 border-[#007B3A] rounded-full text-sm lg:text-base focus:outline-none bg-white"
                />
              </div>

              {/* University Tags */}
              <div className="flex flex-wrap gap-2 lg:gap-3 mb-4">
                {displayedUniversities.map((university, idx) => (
                  <span
                    key={idx}
                    className={`text-white text-xs lg:text-sm px-2 lg:px-3 py-1 rounded-full font-semibold cursor-pointer hover:opacity-80 transition-opacity ${
                      colorMap[university] || "bg-[#007B3A]"
                    }`}
                  >
                    {university}
                  </span>
                ))}
                {hasMoreUniversities && (
                  <>
                    <button
                      onClick={() => setShowAllUniversities(true)}
                      className="text-white text-xs lg:text-sm px-2 lg:px-3 py-1 rounded-full font-semibold bg-gray-500 cursor-pointer hover:bg-gray-600 transition-colors"
                    >
                      Lihat lainnya...
                    </button>
                  </>
                )}
                {filteredUniversities.length === 0 && universitySearchQuery && (
                  <div className="text-gray-500 text-sm lg:text-base italic">
                    Tidak ada universitas yang ditemukan untuk "
                    {universitySearchQuery}"
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Konseling Section */}
          <div className="w-full lg:w-[40%] h-fit border-3 border-[#FF6B35] rounded-br-[40px] lg:rounded-br-[60px] rounded-tl-[40px] lg:rounded-tl-[60px] bg-[#FFF4F0] px-4 lg:px-10 pt-6 lg:pt-8 pb-4 lg:pb-5 relative">
            <div className="absolute -top-4 lg:-top-6 left-8 lg:left-16 bg-white border-3 border-[#FF6B35] rounded-4xl px-3 lg:px-4 py-1 font-bold text-sm lg:text-lg">
              Konseling
            </div>

            <div className="flex items-center justify-start h-full min-h-[120px]">
              <button className="bg-white rounded-2xl p-3 text-center w-full h-fit cursor-pointer">
                <div className="flex items-center gap-3 lg:gap-5 h-full justify-start">
                  <div className="p-4 lg:p-6 bg-[#FFF4F0] rounded-md">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
