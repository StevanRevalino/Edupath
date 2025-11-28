import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { userHanndler, type User } from "../../../handler/userHandler";
import { prodiHandler } from "../../../handler/prodiHandler";
import { universitasHandler } from "../../../handler/universitasHandler";
import { hollandHandler } from "../../../handler/hollandHandler";
import SectionCard from "./components/SectionCard";
import UnivAndProdiTag from "../../../components/UnivAndProdiTag";
import HeroSectionBG from "../../../assets/hero-section.png";

//icon info
import infoHome1 from "../../../assets/icons/info-home-1.png";
import infoHome2 from "../../../assets/icons/info-home-2.png";
import infoHome3 from "../../../assets/icons/info-home-3.png";
import infoHome4 from "../../../assets/icons/info-home-4.png";
import infoHome5 from "../../../assets/icons/info-home-5.png";
import infoHome6 from "../../../assets/icons/info-home-6.png";

const Home = () => {
  const navigate = useNavigate();

  // User data state
  const [user, setUser] = useState<User | null>(null);

  // Prodi/Jurusan data state
  const [allMajors, setAllMajors] = useState<string[]>([]);
  const [majorsLoading, setMajorsLoading] = useState(true);

  // Universitas data state
  const [allUniversities, setAllUniversities] = useState<string[]>([]);
  const [universitiesLoading, setUniversitiesLoading] = useState(true);

  // Holland Assessment data state
  const [assessmentStats, setAssessmentStats] = useState<{
    totalTests: number;
    lastTestDate: string | null;
    topRecommendation: {
      major: string;
      percentage: number;
    } | null;
    latestTestDetails: {
      scores: {
        realistic: number;
        investigative: number;
        artistic: number;
        social: number;
        enterprising: number;
        conventional: number;
      } | null;
      recommendations: Array<{
        nama_prodi: string;
        match_percentage: number;
        jenjang: string | null;
      }>;
      completed_at: string | null;
    } | null;
    allTests: Array<{
      assessment_id: string;
      completed_at: string;
      dominant_type: string;
    }>;
  }>({
    totalTests: 0,
    lastTestDate: null,
    topRecommendation: null,
    latestTestDetails: null,
    allTests: [],
  });
  const [assessmentLoading, setAssessmentLoading] = useState(true);

  // Ambil 1 huruf pertama firstname + lastname (fallback: 2 huruf pertama firstname)
  const getInitials = (u: User | null) => {
    const f = (u?.firstname || "").trim();
    const l = (u?.lastname || "").trim();
    const a = f ? f[0] : "";
    const b = l ? l[0] : "";
    const initials = a + b || f.slice(0, 2) || "...";
    return initials.toUpperCase();
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await userHanndler.getUserById();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Fetch prodi data
  useEffect(() => {
    const fetchProdiData = async () => {
      try {
        const response = await prodiHandler.getAllProdi(679);
        if (response.success) {
          const prodiNames = response.data.map((prodi) => prodi.nama_prodi);
          setAllMajors(prodiNames);
        }
      } catch (error) {
        console.error("Error fetching prodi data:", error);
        setAllMajors([]);
      } finally {
        setMajorsLoading(false);
      }
    };

    fetchProdiData();
  }, []);

  // Fetch universitas data
  useEffect(() => {
    const fetchUniversitasData = async () => {
      try {
        const response = await universitasHandler.getAllUniversitas(645);
        if (response.success) {
          const universitasNames = response.data.map((univ) => univ.nama);
          setAllUniversities(universitasNames);
        }
      } catch (error) {
        console.error("Error fetching universitas data:", error);
        setAllUniversities([]);
      } finally {
        setUniversitiesLoading(false);
      }
    };

    fetchUniversitasData();
  }, []);

  // Fetch Holland assessment data
  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        // Fetch assessment history
        const assessments = await hollandHandler.getAssessmentHistory();
        const assessmentsArray = assessments || [];
        const totalTests = assessments.length;

        if (totalTests > 0) {
          // Get the latest assessment (most recent)
          const latestAssessment = assessments[0]; // Assuming sorted by date desc
          const lastTestDate = latestAssessment.completed_at
            ? new Date(latestAssessment.completed_at).toLocaleDateString(
                "id-ID",
                {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }
              )
            : null;

          // Fetch detailed result for latest assessment to get recommendations
          const result = await hollandHandler.getAssessmentResult(
            latestAssessment.assessment_id
          );

          const recommendations = result.recommendations || [];
          const scores = result.scores || null;

          // Get top recommendation (first one with highest score)
          const topRecommendation =
            recommendations.length > 0
              ? {
                  major: recommendations[0].nama_prodi || "Belum ada data",
                  percentage: Math.round(recommendations[0].match_percentage),
                }
              : null;

          setAssessmentStats({
            totalTests,
            lastTestDate,
            topRecommendation,
            latestTestDetails: {
              scores,
              recommendations: recommendations.slice(0, 5), // Top 5 recommendations
              completed_at: latestAssessment.completed_at,
            },
            allTests: assessmentsArray.map((a: any) => {
              // Combine primary and secondary type (e.g., "R + I")
              const primaryCode = a.primary_type
                ? a.primary_type.charAt(0).toUpperCase()
                : "";
              const secondaryCode = a.secondary_type
                ? a.secondary_type.charAt(0).toUpperCase()
                : "";
              const displayType =
                primaryCode && secondaryCode
                  ? `${primaryCode} + ${secondaryCode}`
                  : a.holland_code || "Belum tersedia";

              return {
                assessment_id: a.assessment_id,
                completed_at: a.completed_at,
                dominant_type: displayType,
              };
            }),
          });
        } else {
          setAssessmentStats({
            totalTests: 0,
            lastTestDate: null,
            topRecommendation: null,
            latestTestDetails: null,
            allTests: [],
          });
        }
      } catch (error) {
        console.error("Error fetching assessment data:", error);
        setAssessmentStats({
          totalTests: 0,
          lastTestDate: null,
          topRecommendation: null,
          latestTestDetails: null,
          allTests: [],
        });
      } finally {
        setAssessmentLoading(false);
      }
    };

    fetchAssessmentData();
  }, []);

  const infoItems = [
    {
      label: "Tentang Kami",
      icons: infoHome1,
      onclick: () => navigate("/about-us"),
    },
    {
      label: "Telusuri Jurusan",
      icons: infoHome2,
      onclick: () => navigate("/jurusan"),
    },
    {
      label: "Rekomendasi Universitas",
      icons: infoHome3,
      onclick: () => navigate("/universitas"),
    },
    {
      label: "Apa itu Tes Minat Bakat?",
      icons: infoHome4,
      onclick: () => navigate("/tes"),
    },
    {
      label: "Informasi Beasiswa",
      icons: infoHome5,
      onclick: () => navigate("/beasiswa"),
    },
    {
      label: "Hubungi Kami",
      icons: infoHome6,
      onclick: () => navigate("/contact-us"),
    },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [universitySearchQuery, setUniversitySearchQuery] = useState("");

  // Horizontal scroll ref for test history
  const testHistoryRef = useRef<HTMLDivElement>(null);

  // Horizontal scroll functions for test history
  const scrollTestHistory = (direction: "left" | "right") => {
    if (testHistoryRef.current) {
      const scrollAmount = 300;
      const newPosition =
        direction === "left"
          ? testHistoryRef.current.scrollLeft - scrollAmount
          : testHistoryRef.current.scrollLeft + scrollAmount;

      testHistoryRef.current.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });
    }
  };

  // Use real assessment data
  const totalTests = assessmentStats.totalTests;
  const tesTerakhir = assessmentStats.lastTestDate || "Belum ada tes";

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

  const getKelasText = (kelas: number | null | undefined) => `${kelas || "-"}`;
  const handleUniversityClick = (name: string) =>
    navigate("/universitas", { state: { selectedUniversity: name } });
  const handleMajorClick = (name: string) =>
    navigate("/jurusan", { state: { selectedMajor: name } });

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* HERO SECTION */}
      <section className="hidden sm:block absolute -top-10 lg:-top-20 left-0 w-full h-64 sm:h-80 md:h-[540px] lg:h-[780px] z-[1]">
        {/* Background */}
        <img
          src={HeroSectionBG}
          alt="Hero Home"
          className="w-full h-full object-cover rounded-b-4xl"
        />

        {/* Overlay content */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-6 lg:px-12">
            {/* >>> FLEX layout, bukan grid <<< */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-10">
              {/* KIRI: avatar + sapaan + deskripsi + tombol */}
              <div className="flex-1 max-w-xl lg:max-w-2xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
                <div className="flex items-center gap-4 lg:gap-5">
                  <div
                    className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-full bg-white/90 shadow-inner ring-2 ring-white/60 flex items-center justify-center select-none"
                    aria-label={`Avatar ${
                      user
                        ? `${user.firstname} ${user.lastname}`.trim()
                        : "User"
                    }`}
                  >
                    <span className="text-primary-dark font-extrabold text-lg sm:text-2xl md:text-3xl tracking-wide">
                      {getInitials(user)}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                      Hello, {user?.firstname ? `${user.firstname}!` : "..."}
                    </h1>
                    <p className="text-white/95 font-semibold -mt-0.5">
                      Kelas {user ? getKelasText(user.kelas) : "..."}
                    </p>
                  </div>
                </div>

                <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg opacity-95 leading-relaxed">
                  Yuk, jelajahi minat dan bakatmu, temukan jurusan dan
                  universitas terbaik untuk masa depanmu bersama{" "}
                  <strong>EduPath</strong>!
                </p>

                <button
                  className="mt-5 inline-flex items-center rounded-full bg-primary px-4 py-2
                       text-sm font-semibold text-primary-dark shadow-[0_6px_16px_rgba(0,0,0,0.15)]
                       hover:brightness-95 active:brightness-90 transition"
                  onClick={() => navigate("/profil")}
                >
                  Ubah profil
                </button>
              </div>

              {/* KANAN: ikon info (pakai flex + wrap), hidden di <lg> */}
              <div className="hidden lg:flex flex-1 justify-end">
                <div className="grid grid-cols-3 lg:gap-1 xl:gap-2 auto-rows-auto">
                  {infoItems.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={item.onclick}
                      className="group flex flex-col items-center text-center focus:outline-none cursor-pointer"
                    >
                      <div className="overflow-hidden grid place-items-center transition-transform group-hover:-translate-y-1">
                        <img
                          src={item.icons}
                          alt={item.label}
                          className="w-24 h-24 xl:w-40 xl:h-40 object-contain"
                          loading="lazy"
                          decoding="async"
                        />
                        <span className="text-[11px] xl:text-base font-semibold text-white drop-shadow">
                          {item.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* <<< end FLEX layout >>> */}
          </div>
        </div>
      </section>

      <div className="relative px-4 sm:px-8 lg:px-10 xl:px-24 sm:pt-80 md:pt-[540px] lg:pt-[720px] pb-6">
        {/* INFO (mobile only) */}
        <SectionCard title="Info" className="block lg:hidden w-full mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {infoItems.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => item.onclick && item.onclick()}
                className="group flex flex-col items-center text-center focus:outline-none cursor-pointer disabled:opacity-60"
                disabled={!item.onclick}
              >
                <div className="w-full grid place-items-center">
                  <img
                    src={item.icons}
                    alt={item.label}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain transition-transform group-active:scale-95"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <span className="mt-1 sm:mt-2 text-[11px] sm:text-[12px] font-semibold text-gray-700">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </SectionCard>

        {/* ANALYTICS */}
        <SectionCard title="Analytics" className="mt-8 lg:mt-12 w-full">
          {assessmentLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat data analytics...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4 lg:gap-6">
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
                    Kamu telah mengerjakan <br /> tes minat bakat sebanyak{" "}
                    <br />
                    <strong>{totalTests} kali!</strong>
                  </div>
                </div>

                {/* Tes Terakhir */}
                <div className="mt-6">
                  <div className="text-xl lg:text-2xl font-bold mb-2">
                    Tes terakhir
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="text-xs lg:text-sm">
                      Terakhir kali kamu mengerjakan tes minat bakat:
                    </div>
                    <div className="text-[#180085] text-2xl lg:text-4xl font-bold">
                      {tesTerakhir}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hasil Tes terakhir dengan Diagram dan Rekomendasi */}
              <div>
                <div className="text-base lg:text-lg font-bold mb-3">
                  Hasil tes terakhir
                </div>

                {assessmentStats.latestTestDetails ? (
                  <div className="space-y-4">
                    {/* Holland Scores Diagram */}
                    {assessmentStats.latestTestDetails.scores && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-sm mb-3">
                          Holland Scores:
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(
                            assessmentStats.latestTestDetails.scores
                          ).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-3">
                              <div className="w-24 text-xs font-medium capitalize text-gray-700">
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                              </div>
                              <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                                  style={{ width: `${value}%` }}
                                >
                                  <span className="text-xs font-bold text-white">
                                    {value}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Top Recommendations */}
                    {assessmentStats.latestTestDetails.recommendations.length >
                      0 && (
                      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <h4 className="font-semibold text-sm mb-3 text-green-800">
                          Top 5 Rekomendasi Jurusan:
                        </h4>
                        <div className="space-y-2">
                          {assessmentStats.latestTestDetails.recommendations.map(
                            (rec, idx) => (
                              <div
                                key={idx}
                                className="p-2 bg-white rounded-lg hover:shadow-sm transition-shadow"
                              >
                                <div className="font-semibold text-sm text-gray-800">
                                  {idx + 1}. {rec.nama_prodi}
                                </div>
                                {rec.jenjang && (
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {rec.jenjang}
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6 text-center">
                    <div className="text-gray-500 text-sm">
                      Belum ada data tes
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      Mulai tes pertama Anda untuk melihat statistik di sini
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </SectionCard>

        {/* RIWAYAT TES - Scrollable Horizontal */}
        {!assessmentLoading && assessmentStats.allTests.length > 0 && (
          <SectionCard title="Riwayat Tes" className="mt-8 lg:mt-12 w-full">
            <div className="relative">
              {/* Scroll Buttons */}
              {assessmentStats.allTests.length > 3 && (
                <>
                  <button
                    onClick={() => scrollTestHistory("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-1 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                  </button>
                  <button
                    onClick={() => scrollTestHistory("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-1 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                  </button>
                </>
              )}

              {/* Scrollable Container */}
              <div
                ref={testHistoryRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide px-8 py-2"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {assessmentStats.allTests.map((test, idx) => (
                  <div
                    key={test.assessment_id}
                    onClick={() => navigate(`/tes/hasil/${test.assessment_id}`)}
                    className="bg-white rounded-2xl shadow-md p-4 min-w-[280px] flex-shrink-0 border-2 border-gray-100 hover:border-primary hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-bold text-gray-700">
                        Tes #{assessmentStats.allTests.length - idx}
                      </div>
                      <div className="bg-primary-lighter text-primary-dark px-3 py-1 rounded-full text-xs font-semibold">
                        {test.dominant_type}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Dikerjakan pada:
                    </div>
                    <div className="text-lg font-bold text-primary mt-1">
                      {new Date(test.completed_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(test.completed_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        )}

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
                  className="w-full px-4 py-2 lg:py-3 border-2 border-primary-dark rounded-full text-sm lg:text-base focus:outline-none bg-white"
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
                    <div className="p-6 bg-gray-200 rounded-md">
                      <Plus
                        size={32}
                        className="text-gray-500"
                        strokeWidth={2}
                      />
                    </div>
                    <div className="text-gray-500 text-lg italic">
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
