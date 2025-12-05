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
import {
  Building2,
  Award,
  Phone,
  Mail,
  Globe,
  MapPin,
  Hash,
  ExternalLink,
  FileText,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

interface Universitas {
  id_universitas: string;
  nama: string;
  akreditasi: string | null;
  tipe: string | null;
  alamat: string | null;
  kota: string | null;
  provinsi: string | null;
  website: string | null;
  telepon: string | null;
  email: string | null;
  logo_url: string | null;
  deskripsi: string | null;
}

import HeroSectionBG from "../../../assets/hero-section2.png";

import universitasIcon1 from "../../../assets/universitas-info-1.png";
import universitasIcon2 from "../../../assets/universitas-info-2.png";
import universitasIcon3 from "../../../assets/universitas-info-3.png";

import SearchBar from "@/components/SearchBar";
import FilterSortBar from "./components/FilterSortBar";
import { ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";

type UniversitasItem = Universitas & {
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

type UniversitasDetailType = Universitas & {
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

  // ===== Pagination States =====
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ===== Persistent Filter Options =====
  const [allProvinsiOptions, setAllProvinsiOptions] = useState<string[]>([]);
  const [allAkreditasiOptions, setAllAkreditasiOptions] = useState<string[]>(
    []
  );

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
      const token = TokenManager.getToken();
      const response = await axios.get(
        `${API_URL}/api/universitas/${universityId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (currentId !== detailRequestIdRef.current) return; // abaikan response lama

      // Handle response data structure (check if data is nested or direct)
      const data = response.data.data || response.data;
      setSelectedUniversitas(data as UniversitasDetailType);
    } catch (e: any) {
      if (currentId !== detailRequestIdRef.current) return;
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
      console.log("Clicked university ID:", universityId);
      setDetailLoading(true);
      fetchUniversitasDetail(universityId);
    },
    [fetchUniversitasDetail]
  );

  // Fetch default universities (top N universities)
  // Unified fetch function:
  // 1. Search keyword -> limit 15 best matches
  // 2. Filter only (no search) -> get all matching data
  // 3. No filter, no search -> limit 15 sorted by QS rank ascending
  const fetchUniversitasWithFilters = useCallback(
    async (searchKeyword: string = "") => {
      const currentId = ++searchRequestIdRef.current;
      setLoading(true);
      setError("");

      try {
        const hasFilter =
          selectedProvinsi !== "Semua" || selectedAkreditasi !== "Semua";

        const token = TokenManager.getToken();
        let url: string;
        let queryParams: any = {};

        if (searchKeyword && searchKeyword.trim().length > 0) {
          url = `${API_URL}/api/universitas/search?nama=${encodeURIComponent(
            searchKeyword.trim()
          )}`;
        } else {
          url = `${API_URL}/api/universitas`;

          if (selectedProvinsi !== "Semua") {
            queryParams.provinsi = selectedProvinsi;
          }
          if (selectedAkreditasi !== "Semua") {
            queryParams.akreditasi = selectedAkreditasi;
          }
          if (!searchKeyword && !hasFilter) {
            queryParams.limit = 15;
          }
        }

        const response = await axios.get(url, {
          params: queryParams,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (currentId !== searchRequestIdRef.current) return; // abaikan response lama

        setResults(response.data.data as UniversitasItem[]);
        setHasSearched(true);
      } catch (e: any) {
        if (currentId !== searchRequestIdRef.current) return;
        const msg =
          e?.response?.data?.message || e?.message || "Terjadi kesalahan";
        setError(msg);
        setResults([]);
      } finally {
        if (currentId === searchRequestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [selectedProvinsi, selectedAkreditasi]
  );

  const search = useCallback(
    async (q: string, autoSelectExactMatch = false) => {
      if (!q.trim()) return;

      const searchKey = q.trim().toLowerCase();

      // Check cache first
      if (searchCacheRef.current.has(searchKey)) {
        console.log("Using cached search results for:", searchKey);
        const cachedData = searchCacheRef.current.get(searchKey)!;
        setResults(cachedData);

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
        const token = TokenManager.getToken();
        const response = await axios.get(`${API_URL}/api/universitas/search`, {
          params: { nama: q.trim() },
          signal: ctrl.signal,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (currentId !== searchRequestIdRef.current) return; // abaikan response lama

        const data = (response.data.data || []) as UniversitasItem[];

        // Cache the results
        searchCacheRef.current.set(searchKey, data);

        setResults(data);

        if (autoSelectExactMatch && data.length > 0) {
          const exactMatch = data.find(
            (univ) => univ.nama.toLowerCase() === q.trim().toLowerCase()
          );
          if (exactMatch) {
            fetchUniversitasDetail(exactMatch.university_id);
          }
        }
      } catch (e: any) {
        if ((e as any).code === "ERR_CANCELED") return;
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

  // ===== Update filter options from results (persistent across loading states) =====
  useEffect(() => {
    if (results.length > 0) {
      // Update provinsi options
      const uniqueProvinsi = new Set<string>(allProvinsiOptions);
      results.forEach((u) => {
        if (u.provinsi) {
          uniqueProvinsi.add(cleanProvinceName(u.provinsi));
        }
      });
      const sortedProvinsi = Array.from(uniqueProvinsi).sort();
      if (
        JSON.stringify(sortedProvinsi) !== JSON.stringify(allProvinsiOptions)
      ) {
        setAllProvinsiOptions(sortedProvinsi);
      }

      // Update akreditasi options
      const uniqueAkreditasi = new Set<string>(allAkreditasiOptions);
      results.forEach((u) => {
        if (u.akreditasi) {
          uniqueAkreditasi.add(u.akreditasi);
        }
      });
      const sortedAkreditasi = Array.from(uniqueAkreditasi).sort();
      if (
        JSON.stringify(sortedAkreditasi) !==
        JSON.stringify(allAkreditasiOptions)
      ) {
        setAllAkreditasiOptions(sortedAkreditasi);
      }
    }
  }, [results]); // eslint-disable-line react-hooks/exhaustive-deps

  // ===== Extract unique options for filters =====
  const provinsiOptions = useMemo(() => {
    return allProvinsiOptions;
  }, [allProvinsiOptions]);

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

  // Pagination
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedResults.slice(startIndex, endIndex);
  }, [filteredAndSortedResults, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedResults.length / itemsPerPage);

  // Reset filters function
  const handleResetFilters = useCallback(() => {
    setSelectedProvinsi("Semua");
    setSelectedKota("Semua");
    setSelectedAkreditasi("Semua");
    setSortBy("");
    setSortOrder("asc");
    setCurrentPage(1);
    // Trigger refetch with no filters
    fetchUniversitasWithFilters(query);
  }, [fetchUniversitasWithFilters, query]);

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
      }
    },
    [sortBy]
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
      // Auto scroll to search section after navigation
      setTimeout(() => {
        focusSearch();
      }, 100);
    } else {
      // Load default universities (15 items sorted by QS rank)
      fetchUniversitasWithFilters("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Auto-reload when query is cleared
  useEffect(() => {
    if (query.trim() === "" && hasSearched) {
      setHasSearched(false);
      fetchUniversitasWithFilters("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]); // Only depend on query changes

  // When filter changes, refetch with new filters
  useEffect(() => {
    if (hasSearched) {
      setCurrentPage(1); // Reset to first page
      fetchUniversitasWithFilters(query);
    }
  }, [selectedProvinsi, selectedAkreditasi]); // Only trigger on filter change // Only trigger on filter change

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
                  className="rounded-full px-5 py-3 bg-sky-300 text-white font-semibold
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
        <div className="mx-auto max-w-[1500px]">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">
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
                  <div className="rounded-t-xl border border-gray-200 overflow-hidden shadow-sm bg-white relative">
                    <div className="max-h-[600px] overflow-y-auto overflow-x-hidden">
                      <table className="w-full text-left text-sm rtl:text-right text-gray-500">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 uppercase sticky top-0 z-1">
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
                                      className="text-primary"
                                    />
                                  ) : (
                                    <ChevronDown
                                      size={14}
                                      className="text-primary"
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
                                      className="text-primary"
                                    />
                                  ) : (
                                    <ChevronDown
                                      size={14}
                                      className="text-primary"
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
                                      className="text-primary"
                                    />
                                  ) : (
                                    <ChevronDown
                                      size={14}
                                      className="text-primary"
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
                                      className="text-primary"
                                    />
                                  ) : (
                                    <ChevronDown
                                      size={14}
                                      className="text-primary"
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
                                      className="text-primary"
                                    />
                                  ) : (
                                    <ChevronDown
                                      size={14}
                                      className="text-primary"
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
                                      className="text-primary"
                                    />
                                  ) : (
                                    <ChevronDown
                                      size={14}
                                      className="text-primary"
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
                          {paginatedResults.length > 0 ? (
                            paginatedResults.map((u, index) => (
                              <tr
                                key={`${u.university_id}-${index}`}
                                onClick={() =>
                                  handleUniversitasClick(u.university_id)
                                }
                                className={`hover:bg-secondary-lighter cursor-pointer transition-all duration-200 odd:bg-white even:bg-gray-50 ${
                                  selectedUniversitas?.university_id ===
                                  u.university_id
                                    ? "bg-secondary-light ring-2 ring-inset ring-secondary"
                                    : "bg-white"
                                }`}
                              >
                                <th className="px-6 py-4" scope="row">
                                  <div className="font-semibold text-primary-dark hover:text-primary transition-colors">
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
                                          ? "bg-secondary-light text-primary-dark ring-1 ring-primary/20"
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
                              <td
                                colSpan={6}
                                className="px-6 py-12 text-center"
                              >
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
                  </div>

                  {/* Pagination */}
                  {filteredAndSortedResults.length > itemsPerPage && (
                    <div className="bg-white rounded-b-xl px-4 py-4 border-b border-l border-r border-gray-200">
                      {/* Mobile Pagination */}
                      <div className="flex items-center justify-between sm:hidden">
                        <button
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <svg
                            className="h-5 w-5 mr-1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Prev
                        </button>
                        <span className="text-sm text-gray-700">
                          Hal <span className="font-medium">{currentPage}</span>{" "}
                          dari <span className="font-medium">{totalPages}</span>
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPages, currentPage + 1)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          Next
                          <svg
                            className="h-5 w-5 ml-1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Desktop Pagination */}
                      <div className="hidden sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Menampilkan{" "}
                            <span className="font-semibold text-primary-dark">
                              {(currentPage - 1) * itemsPerPage + 1}
                            </span>{" "}
                            -{" "}
                            <span className="font-semibold text-primary-dark">
                              {Math.min(
                                currentPage * itemsPerPage,
                                filteredAndSortedResults.length
                              )}
                            </span>{" "}
                            dari{" "}
                            <span className="font-semibold text-primary-dark">
                              {filteredAndSortedResults.length}
                            </span>{" "}
                            hasil
                          </p>
                        </div>
                        <nav
                          className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px"
                          aria-label="Pagination"
                        >
                          {/* Previous Button */}
                          <button
                            onClick={() =>
                              setCurrentPage(Math.max(1, currentPage - 1))
                            }
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            <span className="sr-only">Sebelumnya</span>
                            <svg
                              className="h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>

                          {/* Page Numbers with Ellipsis */}
                          {(() => {
                            const pages = [];
                            const showEllipsis = totalPages > 7;

                            if (!showEllipsis) {
                              // Show all pages if 7 or less
                              for (let i = 1; i <= totalPages; i++) {
                                pages.push(i);
                              }
                            } else {
                              // Smart pagination with ellipsis
                              if (currentPage <= 3) {
                                // Near start: 1 2 3 4 ... last
                                pages.push(1, 2, 3, 4, "...", totalPages);
                              } else if (currentPage >= totalPages - 2) {
                                // Near end: 1 ... last-3 last-2 last-1 last
                                pages.push(
                                  1,
                                  "...",
                                  totalPages - 3,
                                  totalPages - 2,
                                  totalPages - 1,
                                  totalPages
                                );
                              } else {
                                // Middle: 1 ... current-1 current current+1 ... last
                                pages.push(
                                  1,
                                  "...",
                                  currentPage - 1,
                                  currentPage,
                                  currentPage + 1,
                                  "...",
                                  totalPages
                                );
                              }
                            }

                            return pages.map((page, idx) => {
                              if (page === "...") {
                                return (
                                  <span
                                    key={`ellipsis-${idx}`}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                                  >
                                    ...
                                  </span>
                                );
                              }

                              return (
                                <button
                                  key={page}
                                  onClick={() => setCurrentPage(page as number)}
                                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition ${
                                    page === currentPage
                                      ? "z-10 bg-primary border-primary text-white shadow-sm"
                                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            });
                          })()}

                          {/* Next Button */}
                          <button
                            onClick={() =>
                              setCurrentPage(
                                Math.min(totalPages, currentPage + 1)
                              )
                            }
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            <span className="sr-only">Selanjutnya</span>
                            <svg
                              className="h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </nav>
                      </div>
                    </div>
                  )}
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
                  {/* Header */}
                  <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      {selectedUniversitas.nama}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {selectedUniversitas.nama_singkat && (
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          <Hash className="w-3 h-3 mr-1" />
                          {selectedUniversitas.nama_singkat}
                        </span>
                      )}
                      {selectedUniversitas.akreditasi && (
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ring-1 ring-inset ${
                            selectedUniversitas.akreditasi === "Unggul" ||
                            selectedUniversitas.akreditasi === "A"
                              ? "bg-green-50 text-green-700 ring-green-600/20"
                              : selectedUniversitas.akreditasi ===
                                  "Baik Sekali" ||
                                selectedUniversitas.akreditasi === "B"
                              ? "bg-blue-50 text-blue-700 ring-blue-700/10"
                              : selectedUniversitas.akreditasi === "Baik" ||
                                selectedUniversitas.akreditasi === "C"
                              ? "bg-yellow-50 text-yellow-800 ring-yellow-600/20"
                              : "bg-gray-50 text-gray-600 ring-gray-500/10"
                          }`}
                        >
                          <Award className="w-3 h-3 mr-1" />
                          {selectedUniversitas.akreditasi}
                        </span>
                      )}
                      {selectedUniversitas.tipe && (
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-700/10">
                          <Building2 className="w-3 h-3 mr-1" />
                          {selectedUniversitas.tipe}
                        </span>
                      )}
                    </div>
                  </div>

                  {detailError && (
                    <div className="mx-6 mt-4 rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2">
                      {detailError}
                    </div>
                  )}

                  {/* Scrollable Content */}
                  <div className="px-6 py-4 max-h-full overflow-y-auto space-y-6">
                    {/* Informasi Umum */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        <h3 className="text-md font-semibold text-gray-900">
                          Informasi Umum
                        </h3>
                      </div>
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-4 text-sm">
                        <div>
                          <dt className="flex items-center gap-2 font-medium text-gray-500 mb-1">
                            <FileText className="w-4 h-4" />
                            Nama Lengkap
                          </dt>
                          <dd className="text-gray-900 ml-6">
                            {selectedUniversitas.nama}
                          </dd>
                        </div>

                        {selectedUniversitas.nama_singkat && (
                          <div>
                            <dt className="flex items-center gap-2 font-medium text-gray-500 mb-1">
                              <Hash className="w-4 h-4" />
                              Nama Singkat
                            </dt>
                            <dd className="text-gray-900 ml-6">
                              {selectedUniversitas.nama_singkat}
                            </dd>
                          </div>
                        )}

                        {selectedUniversitas.tipe && (
                          <div>
                            <dt className="flex items-center gap-2 font-medium text-gray-500 mb-1">
                              <Building2 className="w-4 h-4" />
                              Tipe
                            </dt>
                            <dd className="text-gray-900 ml-6">
                              {selectedUniversitas.tipe}
                            </dd>
                          </div>
                        )}

                        {selectedUniversitas.provinsi && (
                          <div>
                            <dt className="flex items-center gap-2 font-medium text-gray-500 mb-1">
                              <MapPin className="w-4 h-4" />
                              Provinsi
                            </dt>
                            <dd className="text-gray-900 ml-6">
                              {cleanProvinceName(selectedUniversitas.provinsi)}
                            </dd>
                          </div>
                        )}

                        {selectedUniversitas.kota && (
                          <div>
                            <dt className="flex items-center gap-2 font-medium text-gray-500 mb-1">
                              <MapPin className="w-4 h-4" />
                              Kota
                            </dt>
                            <dd className="text-gray-900 ml-6">
                              {selectedUniversitas.kota}
                            </dd>
                          </div>
                        )}

                        {selectedUniversitas.alamat && (
                          <div>
                            <dt className="flex items-center gap-2 font-medium text-gray-500 mb-1">
                              <MapPin className="w-4 h-4" />
                              Alamat
                            </dt>
                            <dd className="text-gray-900 ml-6">
                              {selectedUniversitas.alamat}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    {/* Informasi Kontak */}
                    {(selectedUniversitas.email ||
                      selectedUniversitas.telepon ||
                      selectedUniversitas.website) && (
                      <div className="pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                          <Phone className="w-5 h-5 text-blue-600" />
                          <h3 className="text-md font-semibold text-gray-900">
                            Informasi Kontak
                          </h3>
                        </div>
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 text-sm">
                          {selectedUniversitas.email && (
                            <div>
                              <dt className="flex items-center gap-2 font-medium text-gray-500 mb-1">
                                <Mail className="w-4 h-4" />
                                Email
                              </dt>
                              <dd className="ml-6">
                                <a
                                  href={`mailto:${selectedUniversitas.email}`}
                                  className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                                >
                                  {selectedUniversitas.email}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </dd>
                            </div>
                          )}

                          {selectedUniversitas.telepon && (
                            <div>
                              <dt className="flex items-center gap-2 font-medium text-gray-500 mb-1">
                                <Phone className="w-4 h-4" />
                                Telepon
                              </dt>
                              <dd className="ml-6">
                                <a
                                  href={`tel:${selectedUniversitas.telepon}`}
                                  className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                                >
                                  {selectedUniversitas.telepon}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </dd>
                            </div>
                          )}

                          {selectedUniversitas.website && (
                            <div>
                              <dt className="flex items-center gap-2 font-medium text-gray-500 mb-1">
                                <Globe className="w-4 h-4" />
                                Website
                              </dt>
                              <dd className="ml-6">
                                <a
                                  href={
                                    selectedUniversitas.website.startsWith(
                                      "http"
                                    )
                                      ? selectedUniversitas.website
                                      : `https://${selectedUniversitas.website}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                                >
                                  {selectedUniversitas.website}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    )}

                    {/* Peringkat */}
                    {(selectedUniversitas.rank_qs ||
                      selectedUniversitas.rank_country) && (
                      <div className="pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                          <Award className="w-5 h-5 text-blue-600" />
                          <h3 className="text-md font-semibold text-gray-900">
                            Peringkat
                          </h3>
                        </div>
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 text-sm">
                          {selectedUniversitas.rank_qs && (
                            <div>
                              <dt className="flex items-center gap-2 font-medium text-gray-500 mb-1">
                                <Hash className="w-4 h-4" />
                                Ranking QS
                              </dt>
                              <dd className="ml-6">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                  #{selectedUniversitas.rank_qs}
                                </span>
                              </dd>
                            </div>
                          )}

                          {selectedUniversitas.rank_country && (
                            <div>
                              <dt className="flex items-center gap-2 font-medium text-gray-500 mb-1">
                                <Hash className="w-4 h-4" />
                                Ranking Nasional
                              </dt>
                              <dd className="ml-6">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
                                  #{selectedUniversitas.rank_country}
                                </span>
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    )}

                    {/* Lokasi */}
                    {selectedUniversitas?.alamat && (
                      <div className="pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          <h3 className="text-md font-semibold text-gray-900">
                            Lokasi
                          </h3>
                        </div>
                        <div className="space-y-4">
                          <iframe
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(
                              selectedUniversitas.alamat
                            )}&z=15&output=embed`}
                            width="100%"
                            height="300"
                            className="rounded-lg border border-gray-200"
                            title="Lokasi Universitas"
                          ></iframe>

                          <a
                            href={`https://www.google.com/maps?q=${encodeURIComponent(
                              selectedUniversitas.alamat
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <MapPin className="w-4 h-4" />
                            Lihat di Google Maps
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    )}
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
