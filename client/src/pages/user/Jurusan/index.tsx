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
  bidang?: string | null;
  akreditasi?: string | null;
  status?: string;
  gelar?: string | null;
  singkatan_gelar?: string | null;
  tanggal_berdiri?: string | null;
  deskripsi?: string | null;
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
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [dataSource, setDataSource] = useState<"api" | "local" | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const searchRequestIdRef = useRef(0);
  const detailRequestIdRef = useRef(0);

  const heroSearchRef = useRef<HTMLInputElement | null>(null);
  const mainSearchRef = useRef<HTMLInputElement | null>(null);

  const HISTORY_KEY = "edupath:prodiSearchHistory";
  const canSearch = useMemo(() => query.trim().length >= 2, [query]);
  const showResults = query.trim().length > 0;

  const badgeClass = (value?: string | null) => {
    const v = (value || "").toLowerCase();
    if (v === "unggul" || v === "a") return "bg-green-100 text-green-800";
    if (v === "baik sekali" || v === "b") return "bg-blue-100 text-blue-800";
    if (v === "baik" || v === "c") return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  const formatDate = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleDateString("id-ID") : "-";

  const removeHistoryItem = (term: string) => {
    const next = recentSearches.filter((x) => x !== term);
    setRecentSearches(next);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {}
  };

  // ===== Search & Detail with requestId (anti spam) =====
  const fetchProdiDetail = useCallback(async (prodiId: string) => {
    const currentId = ++detailRequestIdRef.current;
    setDetailLoading(true);
    setDetailError("");
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
  }, []);

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
        setResults(data);
        setDataSource(res.data?.source || "api");

        pushHistory(q.trim());

        if (autoSelectExactMatch && data.length > 0) {
          const exact = data.find(
            (p) => p.nama_prodi.toLowerCase() === q.trim().toLowerCase()
          );
          if (exact) fetchProdiDetail(exact.prodi_id);
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

  const pushHistory = (term: string) => {
    const t = term.trim();
    if (!t) return;
    const next = [
      t,
      ...recentSearches.filter((x) => x.toLowerCase() !== t.toLowerCase()),
    ].slice(0, 10);
    setRecentSearches(next);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {}
  };

  const clearHistory = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {}
  };

  // auto-select dari navigation state
  useEffect(() => {
    const selectedMajorName = (location.state as any)?.selectedMajor;
    if (selectedMajorName) {
      setQuery(selectedMajorName);
      search(selectedMajorName, true);
    }
  }, [location.state, search]);

  // untuk input search (debounce 400ms)
  useEffect(() => {
    if (query.trim().length >= 2) {
      const id = setTimeout(() => {
        search(query);
      }, 400);
      return () => clearTimeout(id);
    }
  }, [query, search]);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (canSearch) search(query);
    },
    [canSearch, query, search]
  );

  const onClear = useCallback(() => {
    setQuery("");
    setResults([]);
    setError("");
    setSelectedProdi(null);
    setDetailError("");
    setDataSource(null);
  }, []);

  const focusSearch = () => {
    if (mainSearchRef.current) {
      mainSearchRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      mainSearchRef.current.focus();
    }
  };

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
                    if (heroQuery.trim().length >= 2) {
                      setQuery(heroQuery);
                      pushHistory(heroQuery);
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
                      placeholder="Contoh: Informatika ITB, Film Binus, Akuntansi..."
                      className="w-full rounded-full bg-white/95 text-gray-800 placeholder-gray-400 pr-4 pl-11 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.15)] focus:outline-none focus:ring-2 focus:ring-sky-300"
                    />
                  </div>
                </form>

                <button
                  type="button"
                  disabled={!canSearch || loading}
                  className="rounded-full px-5 py-3 bg-sky-300 text-white font-semibold shadow-[0_6px_16px_rgba(0,0,0,0.15)] disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-95 active:brightness-90 transition mt-5"
                  onClick={() => {
                    if (canSearch) focusSearch();
                  }}
                >
                  {loading ? "Mencari…" : "Telusuri"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === Main Section === */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-8 sm:pt-80 lg:pt-[520px] pb-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-extrabold text-[#0B0B0B]">Telusuri</h2>

          <div className="flex gap-6">
            {/* Left: Search + Results */}
            <div className="flex-1">
              <form onSubmit={onSubmit} className="my-4">
                <div className="relative w-full">
                  <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 opacity-40">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
                    placeholder="Cari program studi atau universitas (mis: Film Binus, Informatika ITB, Akuntansi)…"
                    className="w-full rounded-full bg-neutral-200 text-gray-800 placeholder-gray-400 pr-5 pl-14 py-4 shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                  <button type="submit" className="hidden">
                    Telusuri
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
                            <th className="px-4 py-2">Nama Program Studi</th>
                            <th className="px-4 py-2">Jenjang</th>
                            <th className="px-4 py-2">Universitas</th>
                            <th className="px-4 py-2">Akreditasi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.map((p, index) => (
                            <tr
                              key={`${p.prodi_id}-${
                                p.universitas?.university_id || "no-univ"
                              }-${index}`}
                              onClick={() => fetchProdiDetail(p.prodi_id)}
                              className={`border-t border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors duration-150 ${
                                selectedProdi?.prodi_id === p.prodi_id
                                  ? "bg-blue-100"
                                  : ""
                              }`}
                            >
                              <td className="px-4 py-2">
                                <div className="font-medium text-blue-600 hover:text-blue-800">
                                  {p.nama_prodi}
                                </div>
                                {p.bidang && (
                                  <div className="text-gray-500 text-xs">
                                    {p.bidang}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-2">
                                {p.jenjang ? (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {p.jenjang}
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="px-4 py-2">
                                {p.universitas?.nama ? (
                                  <div>
                                    <div className="font-medium text-gray-900 text-xs">
                                      {p.universitas.nama}
                                    </div>
                                    {p.universitas.provinsi && (
                                      <div className="text-gray-500 text-xs">
                                        {p.universitas.provinsi}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="px-4 py-2">
                                {p.akreditasi ? (
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badgeClass(
                                      p.akreditasi
                                    )}`}
                                  >
                                    {p.akreditasi}
                                  </span>
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
                      Tidak ada program studi yang cocok.
                    </p>
                  )}
                </>
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

                      {selectedProdi.bidang && (
                        <div>
                          <dt className="font-medium text-gray-500">
                            Bidang Ilmu
                          </dt>
                          <dd className="text-gray-900">
                            {selectedProdi.bidang}
                          </dd>
                        </div>
                      )}

                      {selectedProdi.akreditasi && (
                        <div>
                          <dt className="font-medium text-gray-500">
                            Akreditasi
                          </dt>
                          <dd>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badgeClass(
                                selectedProdi.akreditasi
                              )}`}
                            >
                              {selectedProdi.akreditasi}
                            </span>
                          </dd>
                        </div>
                      )}

                      {selectedProdi.gelar && (
                        <div>
                          <dt className="font-medium text-gray-500">Gelar</dt>
                          <dd className="text-gray-900">
                            {selectedProdi.gelar}
                            {selectedProdi.singkatan_gelar && (
                              <span className="text-gray-500">
                                {" "}
                                ({selectedProdi.singkatan_gelar})
                              </span>
                            )}
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

                      {selectedProdi.tanggal_berdiri && (
                        <div>
                          <dt className="font-medium text-gray-500">
                            Tanggal Berdiri
                          </dt>
                          <dd className="text-gray-900">
                            {formatDate(selectedProdi.tanggal_berdiri)}
                          </dd>
                        </div>
                      )}

                      {selectedProdi.deskripsi && (
                        <div>
                          <dt className="font-medium text-gray-500">
                            Deskripsi
                          </dt>
                          <dd className="text-gray-900">
                            {selectedProdi.deskripsi}
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
