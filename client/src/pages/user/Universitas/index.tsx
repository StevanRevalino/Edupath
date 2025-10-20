import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import TokenManager from "../../../utils/tokenManager";
import UnivAndProdiTag from "@/components/UnivAndProdiTag";

import HeroSectionBG from "../../../assets/hero-section2.png";

import universitasIcon1 from "../../../assets/universitas-info-1.png";
import universitasIcon2 from "../../../assets/universitas-info-2.png";
import universitasIcon3 from "../../../assets/universitas-info-3.png";

import SearchBar from "@/components/SearchBar";
import FilterSortBar from "./components/FilterSortBar";
import { ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";

type UniversitasItem = {
  university_id: string;
  nama: string;
  nama_singkat?: string | null;
  kota?: string | null;
  provinsi?: string | null;
  akreditasi?: string | null;
  email?: string | null;
  telepon?: string | null;
  rank_qs?: number | null;
  rank_country?: number | null;
};

type UniversitasDetailType = {
  university_id: string;
  nama: string;
  nama_singkat?: string | null;
  kode_pos?: string | null;
  telepon?: string | null;
  fax?: string | null;
  email?: string | null;
  alamat?: string | null;
  kota?: string | null;
  provinsi?: string | null;
  akreditasi?: string | null;
  rank_qs?: number | null;
  rank_country?: number | null;
};

const Universitas: React.FC = () => {
  const location = useLocation();
  const [heroQuery, setHeroQuery] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [results, setResults] = useState<UniversitasItem[]>([]);
  const [selectedUniversitas, setSelectedUniversitas] =
    useState<UniversitasDetailType | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string>("");
  const controllerRef = useRef<AbortController | null>(null);

  // ===== Filter & Sort States =====
  const [selectedProvinsi, setSelectedProvinsi] = useState<string>("Semua");
  const [selectedKota, setSelectedKota] = useState<string>("Semua");
  const [selectedAkreditasi, setSelectedAkreditasi] = useState<string>("Semua");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isFullDataLoaded, setIsFullDataLoaded] = useState<boolean>(false); // Track if all data is loaded

  // ===== Search Cache =====
  const searchCacheRef = useRef<Map<string, UniversitasItem[]>>(new Map());

  // ===== Riwayat pencarian (localStorage) =====
  const HISTORY_KEY = "edupath:univSearchHistory";
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const heroSearchRef = useRef<HTMLInputElement | null>(null);
  const mainSearchRef = useRef<HTMLInputElement | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const canSearch = useMemo(() => query.trim().length >= 2, [query]);
  const heroCanSearch = useMemo(
    () => heroQuery.trim().length >= 2,
    [heroQuery]
  );

  const items = [
    {
      img: universitasIcon1,
      title: "Kualitas Pendidikan dan Fasilitas",
      desc: "Universitas yang tepat akan menyediakan dosen berpengalaman, kurikulum relevan, serta fasilitas pendukung seperti laboratorium, perpustakaan, dan program magang yang membantu perkembangan akademik dan profesionalmu.",
    },
    {
      img: universitasIcon2,
      title: "Lingkungan dan Budaya Belajar yang Sesuai",
      desc: "Setiap kampus punya budaya, kegiatan mahasiswa, dan sistem pembelajaran berbeda. Memilih universitas yang sesuai kepribadian dan gaya belajarmu akan membuat pengalaman kuliah lebih nyaman dan menyenangkan.",
    },
    {
      img: universitasIcon3,
      title: "Peluang Karier dan Jaringan Alumni",
      desc: "Universitas dengan reputasi baik dan jaringan alumni yang luas bisa membuka kesempatan kerja lebih besar melalui job fair, kerjasama industri, atau rekomendasi dari senior.",
    },
  ];

  // === Fix lag pakai requestId untuk search ===
  const searchRequestIdRef = useRef(0);
  const detailRequestIdRef = useRef(0);

  const fetchUniversitasDetail = useCallback(async (universityId: string) => {
    const currentId = ++detailRequestIdRef.current;
    setDetailLoading(true);
    setDetailError("");
    try {
      const API_URL =
        (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";
      const url = `${API_URL}/api/universitas/${universityId}`;
      const token = TokenManager.getToken();
      const res = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (currentId !== detailRequestIdRef.current) return; // abaikan response lama

      const data = res.data?.data as UniversitasDetailType;
      setSelectedUniversitas(data);
    } catch (e: any) {
      if (currentId !== detailRequestIdRef.current) return;
      if (e?.response?.status === 401 || e?.response?.status === 403) {
        TokenManager.logout();
        window.location.href = "/login";
        return;
      }
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Terjadi kesalahan saat memuat detail";
      setDetailError(msg);
    } finally {
      if (currentId === detailRequestIdRef.current) {
        setDetailLoading(false);
      }
    }
  }, []);

  const handleUniversitasClick = useCallback(
    (universityId: string) => {
      setDetailLoading(true);
      fetchUniversitasDetail(universityId);
    },
    [fetchUniversitasDetail]
  );

  // Fetch default universities (top N universities)
  const fetchDefaultUniversities = useCallback(async () => {
    const currentId = ++searchRequestIdRef.current;
    setLoading(true);
    setError("");

    try {
      const API_URL =
        (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";
      const url = `${API_URL}/api/universitas`;
      const token = TokenManager.getToken();
      const res = await axios.get(url, {
        params: { limit: 20 }, // Get top 20 universities for initial display
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (currentId !== searchRequestIdRef.current) return;

      const data = (res.data?.data || []) as UniversitasItem[];
      setResults(data);
      setHasSearched(true);
      setIsFullDataLoaded(false); // Partial data loaded
    } catch (e: any) {
      if (currentId !== searchRequestIdRef.current) return;
      if (e?.response?.status === 401 || e?.response?.status === 403) {
        TokenManager.logout();
        window.location.href = "/login";
        return;
      }
      const msg =
        e?.response?.data?.message || e?.message || "Terjadi kesalahan";
      setError(msg);
      setResults([]);
      setIsFullDataLoaded(false);
    } finally {
      if (currentId === searchRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Fetch ALL universities for sorting/filtering
  const fetchAllUniversities = useCallback(async () => {
    const currentId = ++searchRequestIdRef.current;
    setLoading(true);
    setError("");

    try {
      const API_URL =
        (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";
      const url = `${API_URL}/api/universitas`;
      const token = TokenManager.getToken();
      const res = await axios.get(url, {
        params: { limit: 10000 }, // Get ALL universities for accurate sorting
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (currentId !== searchRequestIdRef.current) return;

      const data = (res.data?.data || []) as UniversitasItem[];
      setResults(data);
      setHasSearched(true);
      setIsFullDataLoaded(true); // Full data loaded
    } catch (e: any) {
      if (currentId !== searchRequestIdRef.current) return;
      if (e?.response?.status === 401 || e?.response?.status === 403) {
        TokenManager.logout();
        window.location.href = "/login";
        return;
      }
      const msg =
        e?.response?.data?.message || e?.message || "Terjadi kesalahan";
      setError(msg);
      setResults([]);
      setIsFullDataLoaded(false);
    } finally {
      if (currentId === searchRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const search = useCallback(
    async (q: string, autoSelectExactMatch = false) => {
      if (!q.trim()) return;

      const searchKey = q.trim().toLowerCase();

      // Check cache first
      if (searchCacheRef.current.has(searchKey)) {
        console.log("Using cached search results for:", searchKey);
        const cachedData = searchCacheRef.current.get(searchKey)!;
        setResults(cachedData);
        setIsFullDataLoaded(false);

        if (autoSelectExactMatch && cachedData.length > 0) {
          const exactMatch = cachedData.find(
            (univ) => univ.nama.toLowerCase() === searchKey
          );
          if (exactMatch) {
            fetchUniversitasDetail(exactMatch.university_id);
          }
        }
        return;
      }

      // Cancel previous request
      if (controllerRef.current) controllerRef.current.abort();
      const ctrl = new AbortController();
      controllerRef.current = ctrl;

      const currentId = ++searchRequestIdRef.current;
      setLoading(true);
      setError("");

      try {
        const API_URL =
          (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";
        const url = `${API_URL}/api/universitas/search`;
        const token = TokenManager.getToken();
        const res = await axios.get(url, {
          params: { nama: q.trim() },
          signal: ctrl.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (currentId !== searchRequestIdRef.current) return; // abaikan response lama

        const data = (res.data?.data || []) as UniversitasItem[];

        // Cache the results
        searchCacheRef.current.set(searchKey, data);

        setResults(data);
        setIsFullDataLoaded(false);

        if (autoSelectExactMatch && data.length > 0) {
          const exactMatch = data.find(
            (univ) => univ.nama.toLowerCase() === q.trim().toLowerCase()
          );
          if (exactMatch) {
            fetchUniversitasDetail(exactMatch.university_id);
          }
        }
      } catch (e: any) {
        if (axios.isCancel(e)) return;
        if (e?.response?.status === 401 || e?.response?.status === 403) {
          TokenManager.logout();
          window.location.href = "/login";
          return;
        }
        if (currentId === searchRequestIdRef.current) {
          const msg =
            e?.response?.data?.message || e?.message || "Terjadi kesalahan";
          setError(msg);
          setResults([]);
        }
      } finally {
        if (currentId === searchRequestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [fetchUniversitasDetail]
  );

  const pushHistory = useCallback((term: string) => {
    const t = term.trim();
    if (!t) return;
    setRecentSearches((prev) => {
      const next = [
        t,
        ...prev.filter((x) => x.toLowerCase() !== t.toLowerCase()),
      ].slice(0, 10);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const clearHistory = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {}
  };

  const removeHistoryItem = (term: string) => {
    const next = recentSearches.filter((x) => x !== term);
    setRecentSearches(next);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {}
  };

  const cleanProvinceName = (provinsi: string | null | undefined) => {
    if (!provinsi) return "-";
    return provinsi.replace(/^Prov\.\s*/i, "");
  };

  // ===== Extract unique options for filters =====
  const provinsiOptions = useMemo(() => {
    const uniqueProvinsi = new Set<string>();
    results.forEach((u) => {
      if (u.provinsi) {
        uniqueProvinsi.add(cleanProvinceName(u.provinsi));
      }
    });
    return Array.from(uniqueProvinsi).sort();
  }, [results]);

  const kotaOptions = useMemo(() => {
    const uniqueKota = new Set<string>();
    results.forEach((u) => {
      if (u.kota) {
        uniqueKota.add(u.kota);
      }
    });
    return Array.from(uniqueKota).sort();
  }, [results]);

  // ===== Filter & Sort Logic =====
  const filteredAndSortedResults = useMemo(() => {
    let filtered = [...results];

    // Apply filters
    if (selectedProvinsi !== "Semua") {
      filtered = filtered.filter(
        (u) => cleanProvinceName(u.provinsi) === selectedProvinsi
      );
    }

    if (selectedKota !== "Semua") {
      filtered = filtered.filter((u) => u.kota === selectedKota);
    }

    if (selectedAkreditasi !== "Semua") {
      filtered = filtered.filter((u) => u.akreditasi === selectedAkreditasi);
    }

    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        let aVal: any = a[sortBy as keyof UniversitasItem];
        let bVal: any = b[sortBy as keyof UniversitasItem];

        // For number fields (rank_qs, rank_country), handle null as Infinity for sorting
        if (sortBy === "rank_qs" || sortBy === "rank_country") {
          const aNum = aVal === null || aVal === undefined ? Infinity : aVal;
          const bNum = bVal === null || bVal === undefined ? Infinity : bVal;
          return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
        }

        // Handle null/undefined values for string fields
        if (aVal === null || aVal === undefined) aVal = "";
        if (bVal === null || bVal === undefined) bVal = "";

        // Clean provinsi names for sorting
        if (sortBy === "provinsi") {
          aVal = cleanProvinceName(aVal);
          bVal = cleanProvinceName(bVal);
        }

        // Compare strings
        if (typeof aVal === "string" && typeof bVal === "string") {
          const comparison = aVal.localeCompare(bVal);
          return sortOrder === "asc" ? comparison : -comparison;
        }

        // Compare numbers
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }

        return 0;
      });
    }

    return filtered;
  }, [
    results,
    selectedProvinsi,
    selectedKota,
    selectedAkreditasi,
    sortBy,
    sortOrder,
  ]);

  // Reset filters function
  const handleResetFilters = useCallback(() => {
    setSelectedProvinsi("Semua");
    setSelectedKota("Semua");
    setSelectedAkreditasi("Semua");
    setSortBy("");
    setSortOrder("asc");
  }, []);

  // Handle table header click for sorting
  const handleHeaderClick = useCallback(
    async (column: string) => {
      // If clicking the same column, toggle order
      if (sortBy === column) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        // New column, set it and default to ascending
        setSortBy(column);
        setSortOrder("asc");

        // Fetch all data when sorting (if not already loaded)
        if (!isFullDataLoaded) {
          await fetchAllUniversities();
        }
      }
    },
    [sortBy, isFullDataLoaded, fetchAllUniversities]
  );

  // scroll ke search input
  const focusSearch = () => {
    if (mainSearchRef.current) {
      mainSearchRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      mainSearchRef.current.focus();
      const val = mainSearchRef.current.value;
      mainSearchRef.current.setSelectionRange(val.length, val.length);
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setRecentSearches(JSON.parse(raw));
    } catch {}
  }, []);

  // Load default universities on mount
  useEffect(() => {
    const selectedUniversityName = (location.state as any)?.selectedUniversity;
    if (selectedUniversityName) {
      // auto-select dari navigation state
      setQuery(selectedUniversityName);
      search(selectedUniversityName, true);
    } else {
      // Load default universities
      fetchDefaultUniversities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Auto-reload default universities when query is cleared
  useEffect(() => {
    if (query.trim() === "" && hasSearched && results.length > 0) {
      // User cleared the search, reload defaults
      setHasSearched(false);
      fetchDefaultUniversities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]); // Only depend on query changes

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* === Hero Section (mirip Konseling) === */}
      <section className="absolute hidden sm:block -top-20 left-0 w-full h-64 sm:h-80 lg:h-[520px] z-[1]">
        <img
          src={HeroSectionBG}
          alt="Hero Universitas"
          className="w-full h-full object-cover rounded-b-4xl"
        />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-20 lg:px-12 pt-10">
            <div className="flex items-center">
              {/* Kiri: judul + search + tags */}
              <div className="lg:col-span-7 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)] flex flex-col w-full items-center">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
                  Telusuri Universitas
                </h1>

                {/* SEARCH BAR di Hero */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (heroCanSearch) {
                      setQuery(heroQuery);
                      setHasSearched(true);
                      search(heroQuery);
                      focusSearch();
                    }
                  }}
                  className="mt-5 flex min-w-2xl items-center gap-3"
                >
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M21 21l-4.35-4.35"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="11"
                          cy="11"
                          r="7"
                          stroke="white"
                          strokeWidth="2"
                        />
                      </svg>
                    </span>
                    <input
                      ref={heroSearchRef}
                      type="text"
                      value={heroQuery}
                      onChange={(e) => setHeroQuery(e.target.value)}
                      placeholder="Telusuri..."
                      className="w-full rounded-full bg-white/95 text-gray-800 placeholder-gray-400 pr-4 pl-11 py-3
                           shadow-[0_8px_24px_rgba(0,0,0,0.15)] focus:outline-none focus:ring-2 focus:ring-sky-300"
                    />
                  </div>
                </form>
                <button
                  type="submit"
                  disabled={!heroCanSearch || loading}
                  className="rounded-full px-5 py-3 bg-sky-300 text-[#FFFFFF] font-semibold
                         shadow-[0_6px_16px_rgba(0,0,0,0.15)] disabled:opacity-60 disabled:cursor-not-allowed
                         hover:brightness-95 active:brightness-90 transition mt-5"
                  onClick={() => {
                    if (canSearch) {
                      setQuery(heroQuery);
                      setHasSearched(true);
                      search(heroQuery);
                      focusSearch();
                    }
                  }}
                >
                  {loading ? "Mencari…" : "Telusuri"}
                </button>

                {/* TAG REKOMENDASI di Hero */}
                <div className="mt-5 flex flex-wrap max-w-2xl justify-center gap-2">
                  {[
                    "UGM",
                    "UI",
                    "ITB",
                    "Binus",
                    "ITS",
                    "UNPAD",
                    "UNAIR",
                    "UPH",
                    "UMN",
                    "Telkom University",
                    "Universitas Brawijaya",
                  ].map((label, i) => (
                    <UnivAndProdiTag
                      key={i}
                      text={label}
                      className="cursor-pointer hover:opacity-90"
                      onClick={() => {
                        setQuery(label);
                        setHasSearched(true);
                        pushHistory(label);
                        search(label);
                        focusSearch();
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

          <h3 className="text-2xl md:text-3xl font-extrabold text-center text-black mb-8">
            Mengapa harus Mencari Universitas yang Cocok?
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

      {/* === Main Section === */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-8 mt-8 lg:mt-12 pb-12">
        <div className="mx-auto max-w-[1500px]">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B0B0B] mb-4">
            Daftar Universitas
          </h2>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Left: Search + Results */}
            <div className="flex-1 w-full lg:w-auto">
              <SearchBar
                value={query}
                onChange={setQuery}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (canSearch) {
                    setHasSearched(true);
                    search(query);
                    pushHistory(query);
                  }
                }}
                placeholder="Cari universitas..."
                canSearch={canSearch}
                inputRef={mainSearchRef}
                recentSearches={recentSearches}
                onSearchClick={(term) => {
                  setQuery(term);
                  setHasSearched(true);
                  search(term);
                }}
                onRemoveHistory={removeHistoryItem}
                onClearAllHistory={clearHistory}
              />

              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 mb-4 text-sm">
                  {error}
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Mencari...</p>
                  </div>
                </div>
              )}

              {!loading && results.length > 0 && (
                <>
                  {/* Filter Bar */}
                  <FilterSortBar
                    selectedProvinsi={selectedProvinsi}
                    onProvinsiChange={setSelectedProvinsi}
                    selectedKota={selectedKota}
                    onKotaChange={setSelectedKota}
                    selectedAkreditasi={selectedAkreditasi}
                    onAkreditasiChange={setSelectedAkreditasi}
                    provinsiOptions={provinsiOptions}
                    kotaOptions={kotaOptions}
                    onReset={handleResetFilters}
                  />

                  {/* Results Table with Sortable Headers - Modern Design */}
                  <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white relative">
                    <table className="w-full text-left text-sm rtl:text-right text-gray-500">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 uppercase">
                        <tr className="border-b-2 border-gray-200">
                          <th
                            className="px-6 py-3 hover:bg-gray-200/50 select-none transition-colors font-semibold text-gray-700"
                            onClick={() => handleHeaderClick("nama")}
                            scope="col"
                          >
                            <div className="flex items-center gap-1.5">
                              Nama
                              {sortBy === "nama" ? (
                                sortOrder === "asc" ? (
                                  <ChevronUp
                                    size={14}
                                    className="text-blue-600"
                                  />
                                ) : (
                                  <ChevronDown
                                    size={14}
                                    className="text-blue-600"
                                  />
                                )
                              ) : (
                                <ChevronsUpDown
                                  size={14}
                                  className="text-gray-400"
                                />
                              )}
                            </div>
                          </th>
                          <th
                            className="px-6 py-3 hover:bg-gray-200/50 select-none transition-colors font-semibold text-gray-700"
                            onClick={() => handleHeaderClick("kota")}
                            scope="col"
                          >
                            <div className="flex items-center gap-1.5">
                              Kota
                              {sortBy === "kota" ? (
                                sortOrder === "asc" ? (
                                  <ChevronUp
                                    size={14}
                                    className="text-blue-600"
                                  />
                                ) : (
                                  <ChevronDown
                                    size={14}
                                    className="text-blue-600"
                                  />
                                )
                              ) : (
                                <ChevronsUpDown
                                  size={14}
                                  className="text-gray-400"
                                />
                              )}
                            </div>
                          </th>
                          <th
                            className="px-6 py-3 hover:bg-gray-200/50 select-none transition-colors font-semibold text-gray-700"
                            onClick={() => handleHeaderClick("provinsi")}
                            scope="col"
                          >
                            <div className="flex items-center gap-1.5">
                              Provinsi
                              {sortBy === "provinsi" ? (
                                sortOrder === "asc" ? (
                                  <ChevronUp
                                    size={14}
                                    className="text-blue-600"
                                  />
                                ) : (
                                  <ChevronDown
                                    size={14}
                                    className="text-blue-600"
                                  />
                                )
                              ) : (
                                <ChevronsUpDown
                                  size={14}
                                  className="text-gray-400"
                                />
                              )}
                            </div>
                          </th>
                          <th
                            className="px-6 py-3 hover:bg-gray-200/50 select-none transition-colors font-semibold text-gray-700"
                            onClick={() => handleHeaderClick("akreditasi")}
                            scope="col"
                          >
                            <div className="flex items-center gap-1.5">
                              Akreditasi
                              {sortBy === "akreditasi" ? (
                                sortOrder === "asc" ? (
                                  <ChevronUp
                                    size={14}
                                    className="text-blue-600"
                                  />
                                ) : (
                                  <ChevronDown
                                    size={14}
                                    className="text-blue-600"
                                  />
                                )
                              ) : (
                                <ChevronsUpDown
                                  size={14}
                                  className="text-gray-400"
                                />
                              )}
                            </div>
                          </th>
                          <th
                            className="px-6 py-3 hover:bg-gray-200/50 select-none transition-colors font-semibold text-gray-700"
                            onClick={() => handleHeaderClick("rank_country")}
                            scope="col"
                          >
                            <div className="flex items-center gap-1.5">
                              Rank Country
                              {sortBy === "rank_country" ? (
                                sortOrder === "asc" ? (
                                  <ChevronUp
                                    size={14}
                                    className="text-blue-600"
                                  />
                                ) : (
                                  <ChevronDown
                                    size={14}
                                    className="text-blue-600"
                                  />
                                )
                              ) : (
                                <ChevronsUpDown
                                  size={14}
                                  className="text-gray-400"
                                />
                              )}
                            </div>
                          </th>
                          <th
                            className="px-6 py-3 hover:bg-gray-200/50 select-none transition-colors font-semibold text-gray-700"
                            onClick={() => handleHeaderClick("rank_qs")}
                            scope="col"
                          >
                            <div className="flex items-center gap-1.5">
                              Rank QS
                              {sortBy === "rank_qs" ? (
                                sortOrder === "asc" ? (
                                  <ChevronUp
                                    size={14}
                                    className="text-blue-600"
                                  />
                                ) : (
                                  <ChevronDown
                                    size={14}
                                    className="text-blue-600"
                                  />
                                )
                              ) : (
                                <ChevronsUpDown
                                  size={14}
                                  className="text-gray-400"
                                />
                              )}
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredAndSortedResults.length > 0 ? (
                          filteredAndSortedResults.map((u, index) => (
                            <tr
                              key={`${u.university_id}-${index}`}
                              onClick={() =>
                                handleUniversitasClick(u.university_id)
                              }
                              className={`hover:bg-blue-50/50 cursor-pointer transition-all duration-200 odd:bg-white even:bg-gray-50 ${
                                selectedUniversitas?.university_id ===
                                u.university_id
                                  ? "bg-blue-50 ring-2 ring-inset ring-blue-200"
                                  : "bg-white"
                              }`}
                            >
                              <th className="px-6 py-4" scope="row">
                                <div className="font-semibold text-blue-700 hover:text-blue-900 transition-colors">
                                  {u.nama}
                                </div>
                                {u.nama_singkat && (
                                  <div className="text-gray-500 text-xs mt-0.5">
                                    {u.nama_singkat}
                                  </div>
                                )}
                              </th>
                              <td className="px-6 py-4 text-gray-700">
                                {u.kota || "-"}
                              </td>
                              <td className="px-6 py-4 text-gray-700">
                                {cleanProvinceName(u.provinsi)}
                              </td>
                              <td className="px-6 py-4">
                                {u.akreditasi ? (
                                  <span
                                    className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                                      u.akreditasi === "Unggul"
                                        ? "bg-green-100 text-green-800 ring-1 ring-green-600/20"
                                        : u.akreditasi === "Baik Sekali"
                                        ? "bg-blue-100 text-blue-800 ring-1 ring-blue-600/20"
                                        : u.akreditasi === "Baik"
                                        ? "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-600/20"
                                        : "bg-gray-100 text-gray-800 ring-1 ring-gray-600/20"
                                    }`}
                                  >
                                    {u.akreditasi}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {u.rank_country ? (
                                  <span className="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold ring-1 ring-purple-600/20">
                                    #{u.rank_country}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {u.rank_qs ? (
                                  <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold ring-1 ring-indigo-600/20">
                                    #{u.rank_qs}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center">
                              <div className="text-gray-400 text-sm">
                                <svg
                                  className="mx-auto h-12 w-12 text-gray-300 mb-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                  />
                                </svg>
                                <p className="font-medium text-gray-500">
                                  Tidak ada universitas yang sesuai dengan
                                  filter
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Coba ubah filter atau reset pencarian
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {!loading && !error && results.length === 0 && (
                <p className="text-gray-500">
                  Tidak ada universitas yang cocok.
                </p>
              )}
            </div>

            {/* Right Side - Detail Panel */}
            <div className="flex-1">
              {detailLoading ? (
                <div className="flex items-center justify-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                      Memuat detail universitas...
                    </p>
                  </div>
                </div>
              ) : selectedUniversitas ? (
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedUniversitas.nama}
                    </h2>
                    {selectedUniversitas.nama_singkat && (
                      <p className="text-sm text-gray-600 mt-1">
                        ({selectedUniversitas.nama_singkat})
                      </p>
                    )}
                  </div>

                  {detailError && (
                    <div className="mx-6 mt-4 rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2">
                      {detailError}
                    </div>
                  )}

                  <div className="px-6 py-4">
                    <h3 className="text-md font-medium text-gray-900 mb-3">
                      Informasi Umum
                    </h3>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-3 text-sm">
                      <div>
                        <dt className="font-medium text-gray-500">
                          Nama Lengkap
                        </dt>
                        <dd className="text-gray-900">
                          {selectedUniversitas.nama}
                        </dd>
                      </div>

                      {selectedUniversitas.provinsi && (
                        <div>
                          <dt className="font-medium text-gray-500">
                            Provinsi
                          </dt>
                          <dd className="text-gray-900">
                            {cleanProvinceName(selectedUniversitas.provinsi)}
                          </dd>
                        </div>
                      )}

                      {selectedUniversitas.kota && (
                        <div>
                          <dt className="font-medium text-gray-500">Kota</dt>
                          <dd className="text-gray-900">
                            {selectedUniversitas.kota}
                          </dd>
                        </div>
                      )}

                      {selectedUniversitas.akreditasi && (
                        <div>
                          <dt className="font-medium text-gray-500">
                            Akreditasi
                          </dt>
                          <dd>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                selectedUniversitas.akreditasi === "Unggul" ||
                                selectedUniversitas.akreditasi === "A"
                                  ? "bg-green-100 text-green-800"
                                  : selectedUniversitas.akreditasi ===
                                      "Baik Sekali" ||
                                    selectedUniversitas.akreditasi === "B"
                                  ? "bg-blue-100 text-blue-800"
                                  : selectedUniversitas.akreditasi === "Baik" ||
                                    selectedUniversitas.akreditasi === "C"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {selectedUniversitas.akreditasi}
                            </span>
                          </dd>
                        </div>
                      )}

                      {selectedUniversitas.alamat && (
                        <div>
                          <dt className="font-medium text-gray-500">Alamat</dt>
                          <dd className="text-gray-900">
                            {selectedUniversitas.alamat}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {(selectedUniversitas.email ||
                    selectedUniversitas.telepon) && (
                    <div className="px-6 py-4 border-t border-gray-200">
                      <h3 className="text-md font-medium text-gray-900 mb-3">
                        Kontak
                      </h3>
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-3 text-sm">
                        {selectedUniversitas.email && (
                          <div>
                            <dt className="font-medium text-gray-500">Email</dt>
                            <dd>
                              <a
                                href={`mailto:${selectedUniversitas.email}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {selectedUniversitas.email}
                              </a>
                            </dd>
                          </div>
                        )}

                        {selectedUniversitas.telepon && (
                          <div>
                            <dt className="font-medium text-gray-500">
                              Telepon
                            </dt>
                            <dd>
                              <a
                                href={`tel:${selectedUniversitas.telepon}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {selectedUniversitas.telepon}
                              </a>
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}

                  {(selectedUniversitas.rank_qs ||
                    selectedUniversitas.rank_country) && (
                    <div className="px-6 py-4 border-t border-gray-200">
                      <h3 className="text-md font-medium text-gray-900 mb-3">
                        Peringkat
                      </h3>
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-3 text-sm">
                        {selectedUniversitas.rank_qs && (
                          <div>
                            <dt className="font-medium text-gray-500">
                              Ranking QS
                            </dt>
                            <dd className="text-gray-900">
                              #{selectedUniversitas.rank_qs}
                            </dd>
                          </div>
                        )}

                        {selectedUniversitas.rank_country && (
                          <div>
                            <dt className="font-medium text-gray-500">
                              Ranking Nasional
                            </dt>
                            <dd className="text-gray-900">
                              #{selectedUniversitas.rank_country}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}

                  {/* Map Link */}
                  {selectedUniversitas?.alamat && (
                    <div className="px-6 py-4 border-t border-gray-200 space-y-4">
                      <iframe
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(
                          selectedUniversitas.alamat
                        )}&z=15&output=embed`}
                        width="100%"
                        height="300"
                        className="rounded-lg border"
                        title="Lokasi Universitas"
                      ></iframe>

                      <a
                        href={`https://www.google.com/maps?q=${encodeURIComponent(
                          selectedUniversitas.alamat
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Lihat di Google Maps
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 bg-gray-50 rounded-lg border border-gray-200 min-h-96">
                  <div className="text-center text-gray-500">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <p className="text-lg font-medium mb-2">
                      Detail Universitas
                    </p>
                    <p className="text-sm">
                      Pilih universitas dari daftar di sebelah kiri untuk
                      melihat detail
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Universitas;
