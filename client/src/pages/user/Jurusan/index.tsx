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

import HeroSectionBG from "../../../assets/hero-section2.png";

import jurusanInfo1 from "../../../assets/jurusan-info-1.png";
import jurusanInfo2 from "../../../assets/jurusan-info-2.png";
import jurusanInfo3 from "../../../assets/jurusan-info-3.png";
import UnivAndProdiTag from "@/components/UnivAndProdiTag";
import SearchBar from "@/components/SearchBar";
import FilterSortBar from "./components/FilterSortBar";
import { ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";

type ProdiItem = {
  prodi_id: string;
  nama_prodi: string;
  jenjang?: string | null;
  bidang?: string | null;
  akreditasi?: string | null;
  universitas?: {
    university_id: string | null;
    nama: string | null;
    provinsi: string | null;
  };
};

type ProdiDetailType = {
  prodi_id: string;
  nama_prodi: string;
  jenjang?: string | null;
  status?: string;
};

const Jurusan: React.FC = () => {
  const location = useLocation();
  const [heroQuery, setHeroQuery] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<ProdiItem[]>([]);
  const [selectedProdi, setSelectedProdi] = useState<ProdiDetailType | null>(
    null
  );
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // ===== Filter & Sort States =====
  const [selectedJenjang, setSelectedJenjang] = useState<string>("Semua");
  const [selectedAkreditasi, setSelectedAkreditasi] = useState<string>("Semua");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // ===== Search Cache =====
  const searchCacheRef = useRef<Map<string, ProdiItem[]>>(new Map());

  const controllerRef = useRef<AbortController | null>(null);
  const searchRequestIdRef = useRef(0);
  const detailRequestIdRef = useRef(0);

  const heroSearchRef = useRef<HTMLInputElement | null>(null);
  const mainSearchRef = useRef<HTMLInputElement | null>(null);

  const HISTORY_KEY = "edupath:prodiSearchHistory";

  const canSearch = useMemo(() => query.trim().length >= 2, [query]);
  const heroCanSearch = useMemo(
    () => heroQuery.trim().length >= 2,
    [heroQuery]
  );

  const items = [
    {
      img: jurusanInfo1,
      title: "Meningkatkan Peluang Sukses Akademik dan Karier",
      desc: "Jurusan yang sesuai dengan minat dan kemampuanmu akan membuat proses belajar lebih menyenangkan dan hasilnya lebih optimal. Hal ini juga mempermudahmu membangun keahlian yang relevan dengan karier impianmu.",
    },
    {
      img: jurusanInfo2,
      title: "Mengurangi Risiko Stres dan Kebingungan di Masa Depan",
      desc: "Jurusan yang tidak cocok sering membuat mahasiswa merasa terbebani, kehilangan motivasi, bahkan ingin pindah jurusan. Dengan memilih yang tepat sejak awal, kamu bisa meminimalkan tekanan psikologis dan kebingungan soal masa depan.",
    },
    {
      img: jurusanInfo3,
      title: "Mendukung pengembangan diri jangka panjang",
      desc: "Jurusan yang sesuai akan memberi ruang untuk mengembangkan potensi diri, membangun koneksi, dan menemukan passion yang bisa bertahan hingga ke dunia kerja dan kehidupan profesional.",
    },
  ];

  const badgeClass = (value?: string | null) => {
    const v = (value || "").toLowerCase();
    if (v === "unggul" || v === "a") return "bg-green-100 text-green-800";
    if (v === "baik sekali" || v === "b") return "bg-blue-100 text-blue-800";
    if (v === "baik" || v === "c") return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  const removeHistoryItem = (term: string) => {
    const next = recentSearches.filter((x) => x !== term);
    setRecentSearches(next);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {}
  };

  const fetchProdiDetail = useCallback(
    async (prodiId: string, rowIndex?: number) => {
      const currentId = ++detailRequestIdRef.current;
      setDetailLoading(true);
      setDetailError("");
      if (rowIndex !== undefined) {
        setSelectedRowIndex(rowIndex);
      }
      try {
        const API_URL =
          (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";
        const url = `${API_URL}/api/prodi/detail/${prodiId}`;
        const token = TokenManager.getToken();
        const res = await axios.get(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (currentId !== detailRequestIdRef.current) return;
        setSelectedProdi(res.data?.data as ProdiDetailType);
      } catch (e: any) {
        if (currentId !== detailRequestIdRef.current) return;
        if (e?.response?.status === 401 || e?.response?.status === 403) {
          TokenManager.logout();
          window.location.href = "/login";
          return;
        }
        setDetailError(
          e?.response?.data?.message ||
            e?.message ||
            "Terjadi kesalahan saat memuat detail"
        );
      } finally {
        if (currentId === detailRequestIdRef.current) setDetailLoading(false);
      }
    },
    []
  );

  // Fetch default prodi (top N prodi)
  const fetchDefaultProdi = useCallback(async () => {
    const currentId = ++searchRequestIdRef.current;
    setLoading(true);
    setError("");

    try {
      const API_URL =
        (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";
      const url = `${API_URL}/api/prodi`;
      const token = TokenManager.getToken();
      const res = await axios.get(url, {
        params: { limit: 15 }, // Get top 15 prodi for initial display
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (currentId !== searchRequestIdRef.current) return;

      const data = (res.data?.data || []) as ProdiItem[];
      // Filter: Only show prodi with universitas.nama
      const filtered = data.filter((p) => p.universitas?.nama);
      setResults(filtered);
      setHasSearched(true);
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
    } finally {
      if (currentId === searchRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const search = useCallback(
    async (q: string, autoSelectExactMatch = false) => {
      if (!q.trim()) return;

      // Check cache first
      const cacheKey = q.trim().toLowerCase();
      if (searchCacheRef.current.has(cacheKey)) {
        const cachedData = searchCacheRef.current.get(cacheKey)!;
        setResults(cachedData);
        setHasSearched(true);
        return;
      }

      if (controllerRef.current) controllerRef.current.abort();
      const ctrl = new AbortController();
      controllerRef.current = ctrl;

      const currentId = ++searchRequestIdRef.current;
      setLoading(true);
      setError("");

      try {
        const API_URL =
          (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";
        const url = `${API_URL}/api/prodi/search/nama/${encodeURIComponent(
          q.trim()
        )}`;
        const token = TokenManager.getToken();
        const res = await axios.get(url, {
          signal: ctrl.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (currentId !== searchRequestIdRef.current) return;
        const data = (res.data?.data || []) as ProdiItem[];

        // Filter: Only show prodi with universitas.nama
        const filtered = data.filter((p) => p.universitas?.nama);

        // Cache the filtered results
        searchCacheRef.current.set(cacheKey, filtered);

        setResults(filtered);
        setHasSearched(true);

        if (autoSelectExactMatch && filtered.length > 0) {
          const exact = filtered.find(
            (p) => p.nama_prodi.toLowerCase() === q.trim().toLowerCase()
          );
          if (exact) {
            const exactIndex = filtered.indexOf(exact);
            fetchProdiDetail(exact.prodi_id, exactIndex);
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
          setError(
            e?.response?.data?.message || e?.message || "Terjadi kesalahan"
          );
          setResults([]);
        }
      } finally {
        if (currentId === searchRequestIdRef.current) setLoading(false);
      }
    },
    [fetchProdiDetail]
  );

  // ===== Search History =====
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setRecentSearches(JSON.parse(raw));
    } catch {}
  }, []);

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

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (canSearch) {
        setHasSearched(true);
        search(query);
        pushHistory(query);
      }
    },
    [canSearch, query, search]
  );

  const focusSearch = () => {
    if (mainSearchRef.current) {
      mainSearchRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      mainSearchRef.current.focus();
    }
  };

  // ===== Extract unique filter options =====
  const jenjangOptions = useMemo(() => {
    const unique = new Set<string>();
    results.forEach((p) => {
      if (p.jenjang) unique.add(p.jenjang);
    });
    return Array.from(unique).sort();
  }, [results]);

  const akreditasiOptions = useMemo(() => {
    const unique = new Set<string>();
    results.forEach((p) => {
      if (p.akreditasi) unique.add(p.akreditasi);
    });
    return Array.from(unique).sort();
  }, [results]);

  // ===== Filtered and Sorted Results =====
  const filteredAndSortedResults = useMemo(() => {
    let filtered = [...results];

    // Apply filters
    if (selectedJenjang !== "Semua") {
      filtered = filtered.filter((p) => p.jenjang === selectedJenjang);
    }

    if (selectedAkreditasi !== "Semua") {
      filtered = filtered.filter((p) => p.akreditasi === selectedAkreditasi);
    }

    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        let aVal: any = a[sortBy as keyof ProdiItem];
        let bVal: any = b[sortBy as keyof ProdiItem];

        // Handle nested universitas properties
        if (sortBy === "universitas") {
          aVal = a.universitas?.nama || "";
          bVal = b.universitas?.nama || "";
        }

        // Handle null/undefined values
        if (aVal === null || aVal === undefined) aVal = "";
        if (bVal === null || bVal === undefined) bVal = "";

        // Compare strings
        if (typeof aVal === "string" && typeof bVal === "string") {
          const comparison = aVal.localeCompare(bVal);
          return sortOrder === "asc" ? comparison : -comparison;
        }

        return 0;
      });
    }

    return filtered;
  }, [results, selectedJenjang, selectedAkreditasi, sortBy, sortOrder]);

  // Reset filters function
  const handleResetFilters = useCallback(() => {
    setSelectedJenjang("Semua");
    setSelectedAkreditasi("Semua");
    setSortBy("");
    setSortOrder("asc");
  }, []);

  // Handle table header click for sorting
  const handleHeaderClick = useCallback(
    (column: string) => {
      // If clicking the same column, toggle order
      if (sortBy === column) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        // New column, set it and default to ascending
        setSortBy(column);
        setSortOrder("asc");
      }
    },
    [sortBy]
  );

  // ===== Search History =====
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setRecentSearches(JSON.parse(raw));
    } catch {}
  }, []);

  // auto-select dari navigation state
  useEffect(() => {
    const selectedMajorName = (location.state as any)?.selectedMajor;
    if (selectedMajorName) {
      setQuery(selectedMajorName);
      setHasSearched(true);
      search(selectedMajorName, true);
    } else {
      // Load default prodi on mount
      fetchDefaultProdi();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Auto-reload default prodi when query is cleared
  useEffect(() => {
    if (query.trim() === "" && hasSearched && results.length > 0) {
      // User cleared the search, reload defaults
      setHasSearched(false);
      fetchDefaultProdi();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]); // Only depend on query changes

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* === Hero Section === */}
      <section className="absolute hidden sm:block -top-20 left-0 w-full h-64 sm:h-80 lg:h-[520px] z-[1]">
        <img
          src={HeroSectionBG}
          alt="Hero Jurusan"
          className="w-full h-full object-cover rounded-b-4xl"
        />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-20 lg:px-12 pt-10">
            <div className="flex items-center">
              <div className="lg:col-span-7 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)] flex flex-col w-full items-center">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
                  Telusuri Program Studi
                </h1>

                {/* Search di Hero */}
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
                      placeholder="Cari Program Studi"
                      className="w-full rounded-full bg-white/95 text-gray-800 placeholder-gray-400 pr-4 pl-11 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.15)] focus:outline-none focus:ring-2 focus:ring-sky-300"
                    />
                  </div>
                </form>

                <button
                  type="button"
                  disabled={!heroCanSearch || loading}
                  className="rounded-full px-5 py-3 bg-sky-300 text-white font-semibold shadow-[0_6px_16px_rgba(0,0,0,0.15)] 
                  disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-95 active:brightness-90 transition mt-5"
                  onClick={() => {
                    if (heroCanSearch) {
                      setQuery(heroQuery);
                      setHasSearched(true);
                      search(heroQuery);
                      focusSearch();
                    }
                  }}
                >
                  {loading ? "Mencari…" : "Telusuri"}
                </button>
                <div className="mt-5 flex flex-wrap max-w-2xl justify-center gap-2">
                  {[
                    "Teknik Informatika",
                    "Sistem Informasi",
                    "Teknologi Informasi",
                    "Manajemen",
                    "Akuntansi",
                    "Psikologi",
                    "Hukum",
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
          className="relative rounded-[24px] bg-secondary-lighter backdrop-blur-[1px]
                  px-5 py-6 md:px-8 md:py-8 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        >
          <div
            className="pointer-events-none absolute -top-6 -left-6 h-12 w-12
                    border-t-2 border-l-2 border-primary-dark rounded-tl-[20px]"
          />
          <div
            className="pointer-events-none absolute -bottom-6 -right-6 h-12 w-12
                    border-b-2 border-r-2 border-primary-dark rounded-br-[20px]"
          />

          <h3 className="text-2xl md:text-3xl font-extrabold text-center text-black mb-8">
            Mengapa harus Mencari Jurusan yang Cocok?
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
                <h4 className="mt-4 font-extrabold text-primary-dark">
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
        <div className="max-w-[1500px] mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">
            Daftar Program Studi
          </h2>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Left: Search + Results */}
            <div className="flex-1 w-full lg:w-auto">
              <SearchBar
                value={query}
                onChange={setQuery}
                onSubmit={onSubmit}
                placeholder="Cari Program Studi..."
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
                    selectedJenjang={selectedJenjang}
                    onJenjangChange={setSelectedJenjang}
                    selectedAkreditasi={selectedAkreditasi}
                    onAkreditasiChange={setSelectedAkreditasi}
                    jenjangOptions={jenjangOptions}
                    akreditasiOptions={akreditasiOptions}
                    onReset={handleResetFilters}
                  />

                  {/* Results Table with Sortable Headers - Modern Design */}
                  <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white relative">
                    <table className="w-full text-left text-sm rtl:text-right text-gray-500">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 uppercase">
                        <tr className="border-b-2 border-gray-200">
                          <th
                            className="px-6 py-3 cursor-pointer hover:bg-gray-200/50 select-none transition-colors font-semibold text-gray-700"
                            onClick={() => handleHeaderClick("nama_prodi")}
                            scope="col"
                          >
                            <div className="flex items-center gap-1.5">
                              Nama Program Studi
                              {sortBy === "nama_prodi" ? (
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
                            className="px-6 py-3 cursor-pointer hover:bg-gray-200/50 select-none transition-colors font-semibold text-gray-700"
                            onClick={() => handleHeaderClick("jenjang")}
                            scope="col"
                          >
                            <div className="flex items-center gap-1.5">
                              Jenjang
                              {sortBy === "jenjang" ? (
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
                            className="px-6 py-3 cursor-pointer hover:bg-gray-200/50 select-none transition-colors font-semibold text-gray-700"
                            onClick={() => handleHeaderClick("universitas")}
                            scope="col"
                          >
                            <div className="flex items-center gap-1.5">
                              Universitas
                              {sortBy === "universitas" ? (
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
                            className="px-6 py-3 cursor-pointer hover:bg-gray-200/50 select-none transition-colors font-semibold text-gray-700"
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
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredAndSortedResults.length > 0 ? (
                          filteredAndSortedResults.map((p, index) => (
                            <tr
                              key={`${p.prodi_id}-${
                                p.universitas?.university_id || "no-univ"
                              }-${index}`}
                              onClick={() =>
                                fetchProdiDetail(p.prodi_id, index)
                              }
                              className={`hover:bg-blue-50/50 cursor-pointer transition-all duration-200 ${
                                selectedRowIndex === index
                                  ? "bg-blue-50 ring-2 ring-inset ring-blue-200"
                                  : "bg-white"
                              }`}
                            >
                              <th className="px-6 py-4" scope="row">
                                <div className="font-semibold text-blue-700 hover:text-blue-900 transition-colors">
                                  {p.nama_prodi}
                                </div>
                                {p.bidang && (
                                  <div className="text-gray-500 text-xs mt-0.5">
                                    {p.bidang}
                                  </div>
                                )}
                              </th>
                              <td className="px-6 py-4">
                                {p.jenjang ? (
                                  <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 ring-1 ring-blue-600/20">
                                    {p.jenjang}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {p.universitas?.nama ? (
                                  <div>
                                    <div className="font-medium text-gray-900 text-sm">
                                      {p.universitas.nama}
                                    </div>
                                    {p.universitas.provinsi && (
                                      <div className="text-gray-500 text-xs mt-0.5">
                                        {p.universitas.provinsi}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {p.akreditasi ? (
                                  <span
                                    className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${badgeClass(
                                      p.akreditasi
                                    )} ring-1`}
                                  >
                                    {p.akreditasi}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center">
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
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                  />
                                </svg>
                                <p className="font-medium text-gray-500">
                                  Tidak ada program studi yang sesuai dengan
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
                  Tidak ada program studi yang cocok.
                </p>
              )}
            </div>

            {/* Right: Detail Panel */}
            <div className="flex-1">
              {detailLoading ? (
                <div className="flex items-center justify-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                      Memuat detail program studi...
                    </p>
                  </div>
                </div>
              ) : selectedProdi ? (
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedProdi.nama_prodi}
                    </h2>
                    {selectedProdi.jenjang && (
                      <p className="text-sm text-gray-600 mt-1">
                        Jenjang {selectedProdi.jenjang}
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
                          Nama Program Studi
                        </dt>
                        <dd className="text-gray-900">
                          {selectedProdi.nama_prodi}
                        </dd>
                      </div>

                      {selectedProdi.jenjang && (
                        <div>
                          <dt className="font-medium text-gray-500">Jenjang</dt>
                          <dd>
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {selectedProdi.jenjang}
                            </span>
                          </dd>
                        </div>
                      )}

                      {selectedProdi.status && (
                        <div>
                          <dt className="font-medium text-gray-500">Status</dt>
                          <dd>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                selectedProdi.status === "Aktif"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {selectedProdi.status}
                            </span>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
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
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <p className="text-lg font-medium mb-2">
                      Detail Program Studi
                    </p>
                    <p className="text-sm">
                      Pilih program studi dari daftar di sebelah kiri untuk
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

export default Jurusan;
