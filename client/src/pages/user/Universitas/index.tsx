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

type UniversitasItem = {
  university_id: string;
  nama: string;
  nama_singkat?: string | null;
  kota?: string | null;
  provinsi?: string | null;
  akreditasi?: string | null;
  email?: string | null;
  telepon?: string | null;
};

type UniversitasDetailType = {
  university_id: string;
  nama: string;
  nama_singkat?: string | null;
  kelompok?: string | null;
  pembina?: string | null;
  alamat?: string | null;
  kecamatan?: string | null;
  kota?: string | null;
  provinsi?: string | null;
  kode_pos?: string | null;
  email?: string | null;
  telepon?: string | null;
  fax?: string | null;
  website?: string | null;
  tanggal_berdiri?: string | null;
  akreditasi?: string | null;
  status_akreditasi?: string | null;
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
  const [dataSource, setDataSource] = useState<"api" | "local" | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

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
  const showResults = hasSearched && query.trim().length > 0;

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

  const search = useCallback(
    async (q: string, autoSelectExactMatch = false) => {
      if (!q.trim()) return;
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
        setResults(data);
        setDataSource(res.data?.source || "api");

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

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (canSearch) {
        search(query);
        setHasSearched(true);
        pushHistory(query);
      }
    },
    [canSearch, query, search, pushHistory]
  );

  const cleanProvinceName = (provinsi: string | null | undefined) => {
    if (!provinsi) return "-";
    return provinsi.replace(/^Prov\.\s*/i, "");
  };

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

  // auto-select dari navigation state
  useEffect(() => {
    const selectedUniversityName = (location.state as any)?.selectedUniversity;
    if (selectedUniversityName) {
      setQuery(selectedUniversityName);
      search(selectedUniversityName, true);
    }
  }, [location.state, search]);

  useEffect(() => {
    if (query.trim() === "") {
      setHasSearched(false);
    }
  }, [query]);

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
                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    "UGM",
                    "UI",
                    "ITB",
                    "Binus",
                    "ITS",
                    "UNPAD",
                    "UNAIR",
                    "UPH",
                  ].map((label, i) => (
                    <UnivAndProdiTag
                      key={i}
                      text={label}
                      className="cursor-pointer hover:opacity-90"
                      onClick={() => {
                        setQuery(label);
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

      {/* === Main Section === */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-8 sm:pt-80 lg:pt-[520px] pb-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-extrabold text-[#0B0B0B]">Telusuri</h2>
          {/* Search Panel + Detail */}
          <div className="flex gap-6">
            <div className="flex-1">
              {/* Search bar besar ala mockup */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (canSearch) {
                    setHasSearched(true);
                    search(query);
                    pushHistory(query);
                  }
                }}
                className="my-4"
              >
                <div className="flex w-full items-center gap-2">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 opacity-40">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M21 21l-4.35-4.35"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="11"
                          cy="11"
                          r="7"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </span>
                    <input
                      ref={mainSearchRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Telusuri..."
                      className="w-full rounded-full bg-neutral-200 text-gray-800 placeholder-gray-400 pl-14 pr-5 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-300"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!canSearch || loading}
                    className="rounded-full px-6 py-3 bg-sky-600 text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-95"
                  >
                    {loading ? "Mencari…" : "Telusuri"}
                  </button>
                </div>
              </form>

              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 mb-4">
                  {error}
                </div>
              )}

              {!showResults ? (
                // ===== RIWAYAT =====
                <div className="mt-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-extrabold text-[#0B0B0B]">
                      Pencarian terakhir
                    </h3>
                    {recentSearches.length > 0 && (
                      <button
                        onClick={clearHistory}
                        className="text-sm underline text-gray-500 hover:text-gray-700"
                      >
                        Hapus riwayat
                      </button>
                    )}
                  </div>

                  <ul className="mt-4 divide-y divide-gray-100">
                    {recentSearches.length === 0 ? (
                      <li className="py-3 text-gray-400">Belum ada riwayat</li>
                    ) : (
                      recentSearches.map((term) => (
                        <li
                          key={term}
                          className="py-3 flex items-center justify-between"
                        >
                          <button
                            type="button"
                            className="text-left text-[15px] text-gray-800 hover:underline"
                            onClick={() => {
                              setQuery(term);
                              pushHistory(term);
                              search(term);
                            }}
                          >
                            {term}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeHistoryItem(term)}
                            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                            aria-label={`Hapus ${term}`}
                            title="Hapus"
                          >
                            ×
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              ) : (
                // ===== HASIL SEARCH =====
                <>
                  {loading && (
                    <div className="flex items-center justify-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Mencari...</p>
                      </div>
                    </div>
                  )}
                  {!loading && results.length > 0 && (
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2">Nama</th>
                            <th className="px-4 py-2">Provinsi</th>
                            <th className="px-4 py-2">Akreditasi</th>
                            <th className="px-4 py-2">Email</th>
                            <th className="px-4 py-2">Telepon</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.map((u, index) => (
                            <tr
                              key={`${u.university_id}-${index}`}
                              onClick={() =>
                                handleUniversitasClick(u.university_id)
                              }
                              className={`border-t border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors duration-150 ${
                                selectedUniversitas?.university_id ===
                                u.university_id
                                  ? "bg-blue-100"
                                  : ""
                              }`}
                            >
                              <td className="px-4 py-2">
                                <div className="font-medium text-blue-600 hover:text-blue-800">
                                  {u.nama}
                                </div>
                                {u.nama_singkat && (
                                  <div className="text-gray-500 text-xs">
                                    {u.nama_singkat}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-2">
                                {cleanProvinceName(u.provinsi)}
                              </td>
                              <td className="px-4 py-2">
                                {u.akreditasi ? (
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      u.akreditasi === "A" ||
                                      u.akreditasi === "Unggul"
                                        ? "bg-green-100 text-green-800"
                                        : u.akreditasi === "Baik Sekali"
                                        ? "bg-blue-100 text-blue-800"
                                        : u.akreditasi === "B" ||
                                          u.akreditasi === "Baik"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : u.akreditasi === "C"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {u.akreditasi}
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="px-4 py-2">
                                {u.email ? (
                                  <a
                                    href={`mailto:${u.email}`}
                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {u.email.length > 20
                                      ? `${u.email.substring(0, 20)}...`
                                      : u.email}
                                  </a>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="px-4 py-2">
                                {u.telepon ? (
                                  <a
                                    href={`tel:${u.telepon}`}
                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {u.telepon}
                                  </a>
                                ) : (
                                  "-"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {!loading && !error && results.length === 0 && (
                    <p className="text-gray-500">
                      Tidak ada universitas yang cocok.
                    </p>
                  )}
                </>
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

                      {selectedUniversitas.kelompok && (
                        <div>
                          <dt className="font-medium text-gray-500">
                            Kelompok
                          </dt>
                          <dd className="text-gray-900">
                            {selectedUniversitas.kelompok}
                          </dd>
                        </div>
                      )}

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

                      {selectedUniversitas.tanggal_berdiri && (
                        <div>
                          <dt className="font-medium text-gray-500">
                            Tanggal Berdiri
                          </dt>
                          <dd className="text-gray-900">
                            {new Date(
                              selectedUniversitas.tanggal_berdiri
                            ).toLocaleDateString("id-ID")}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {(selectedUniversitas.email ||
                    selectedUniversitas.telepon ||
                    selectedUniversitas.website) && (
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

                        {selectedUniversitas.website && (
                          <div>
                            <dt className="font-medium text-gray-500">
                              Website
                            </dt>
                            <dd>
                              <a
                                href={
                                  selectedUniversitas.website.startsWith("http")
                                    ? selectedUniversitas.website
                                    : `https://${selectedUniversitas.website}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {selectedUniversitas.website}
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
