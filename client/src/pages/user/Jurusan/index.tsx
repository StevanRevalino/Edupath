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

type ProdiItem = {
  prodi_id: string;
  nama_prodi: string;
  jenjang?: string | null;
  kode_prodi?: string | null;
  bidang?: string | null;
  akreditasi?: string | null;
  status?: string;
  gelar?: string | null;
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
  kode_prodi?: string | null;
  bidang?: string | null;
  akreditasi?: string | null;
  status_akreditasi?: string | null;
  tanggal_berdiri?: string | null;
  tanggal_tutup?: string | null;
  status?: string;
  gelar?: string | null;
  singkatan_gelar?: string | null;
  deskripsi?: string | null;
};

type SearchHistoryItem = {
  id: string;
  query: string;
  type: string;
  created_at: string;
};

const Jurusan: React.FC = () => {
  const location = useLocation();
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [results, setResults] = useState<ProdiItem[]>([]);
  const [selectedProdi, setSelectedProdi] = useState<ProdiDetailType | null>(
    null
  );
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string>("");
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<"api" | "local" | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const canSearch = useMemo(() => query.trim().length >= 2, [query]);

  // Fetch search history from localStorage
  const fetchSearchHistory = useCallback(async () => {
    try {
      const stored = localStorage.getItem("search-history-prodi");
      if (stored) {
        const history = JSON.parse(stored) as SearchHistoryItem[];
        // Sort by created_at desc and take latest 5
        const sortedHistory = history
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .slice(0, 5);
        setSearchHistory(sortedHistory);
      }
    } catch (e) {
      console.warn("Failed to fetch search history:", e);
    }
  }, []);

  // Save search to localStorage
  const saveSearchHistory = useCallback(async (searchQuery: string) => {
    try {
      const stored = localStorage.getItem("search-history-prodi");
      let history: SearchHistoryItem[] = [];

      if (stored) {
        history = JSON.parse(stored);
      }

      // Check if query already exists
      const existingIndex = history.findIndex(
        (item) => item.query.toLowerCase() === searchQuery.toLowerCase()
      );

      if (existingIndex >= 0) {
        // Update timestamp and move to front
        history[existingIndex].created_at = new Date().toISOString();
        const item = history.splice(existingIndex, 1)[0];
        history.unshift(item);
      } else {
        // Add new search to front
        const newItem: SearchHistoryItem = {
          id: Date.now().toString(),
          query: searchQuery,
          type: "PRODI",
          created_at: new Date().toISOString(),
        };
        history.unshift(newItem);
      }

      // Keep only last 10 searches
      history = history.slice(0, 10);

      localStorage.setItem("search-history-prodi", JSON.stringify(history));
    } catch (e) {
      console.warn("Failed to save search history:", e);
    }
  }, []);

  const fetchProdiDetail = useCallback(async (prodiId: string) => {
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
      const data = res.data?.data as ProdiDetailType;
      console.log("Prodi Detail:", data);
      setSelectedProdi(data);
    } catch (e: any) {
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
      setDetailLoading(false);
    }
  }, []);

  const search = useCallback(
    async (q: string, autoSelectExactMatch = false) => {
      if (!q.trim()) return;
      // Cancel previous request if still in-flight
      if (controllerRef.current) controllerRef.current.abort();
      const ctrl = new AbortController();
      controllerRef.current = ctrl;
      setLoading(true);
      setError("");
      setShowHistory(false); // Hide history when searching
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
        const data = (res.data?.data || []) as ProdiItem[];
        const source = res.data?.source || "api";
        setResults(data);
        setDataSource(source);

        // Save search to history (don't await to avoid blocking)
        saveSearchHistory(q.trim());

        // Refresh search history after saving
        setTimeout(() => fetchSearchHistory(), 500); // Auto-select exact match if requested (from Home.tsx navigation)
        if (autoSelectExactMatch && data.length > 0) {
          const exactMatch = data.find(
            (prodi) => prodi.nama_prodi.toLowerCase() === q.trim().toLowerCase()
          );
          if (exactMatch) {
            // Automatically fetch detail for exact match
            setTimeout(() => {
              fetchProdiDetail(exactMatch.prodi_id);
            }, 100);
          }
        }
      } catch (e: any) {
        if (axios.isCancel(e)) return; // silently ignore canceled
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
        setLoading(false);
      }
    },
    [fetchProdiDetail, saveSearchHistory, fetchSearchHistory]
  );

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
    setShowHistory(false);
    setDataSource(null);
  }, []);

  const handleInputFocus = useCallback(() => {
    if (!query.trim() && searchHistory.length > 0) {
      setShowHistory(true);
    }
  }, [query, searchHistory]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);

      // Show history dropdown if input is empty or very short
      if (!value.trim() && searchHistory.length > 0) {
        setShowHistory(true);
      } else {
        setShowHistory(false);
      }
    },
    [searchHistory]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Hide history on Escape
      if (e.key === "Escape") {
        setShowHistory(false);
      }
      // Show history on ArrowDown when input is empty
      if (e.key === "ArrowDown" && !query.trim() && searchHistory.length > 0) {
        setShowHistory(true);
      }
    },
    [query, searchHistory]
  );

  const handleInputBlur = useCallback(() => {
    // Delay hiding to allow clicks on history items
    setTimeout(() => setShowHistory(false), 200);
  }, []);

  const handleHistoryClick = useCallback(
    (historyQuery: string) => {
      setQuery(historyQuery);
      setShowHistory(false);
      search(historyQuery);
    },
    [search]
  );

  const clearAllHistory = useCallback(() => {
    localStorage.removeItem("search-history-prodi");
    setSearchHistory([]);
  }, []);

  const removeHistoryItem = useCallback((itemId: string) => {
    try {
      const stored = localStorage.getItem("search-history-prodi");
      if (stored) {
        const history = JSON.parse(stored) as SearchHistoryItem[];
        const filtered = history.filter((item) => item.id !== itemId);
        localStorage.setItem("search-history-prodi", JSON.stringify(filtered));
        setSearchHistory(filtered);
      }
    } catch (e) {
      console.warn("Failed to remove history item:", e);
    }
  }, []);

  const handleProdiClick = useCallback(
    (prodiId: string) => {
      fetchProdiDetail(prodiId);
    },
    [fetchProdiDetail]
  );

  // Handle selected major from Home.tsx navigation
  useEffect(() => {
    const selectedMajorName = location.state?.selectedMajor;
    if (selectedMajorName) {
      // Set the query to the selected major name and search for it
      setQuery(selectedMajorName);
      search(selectedMajorName, true); // true = autoSelectExactMatch
    }
  }, [location.state, search]);

  // Fetch search history when component mounts
  useEffect(() => {
    fetchSearchHistory();
  }, [fetchSearchHistory]);

  return (
    <div className="pt-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Cari Program Studi</h1>

        <div className="flex gap-6">
          {/* Left Side - Search Panel */}
          <div className="flex-1">
            <div className="relative">
              <form onSubmit={onSubmit} className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="Cari program studi atau universitas (mis: Film Binus, Informatika ITB, Akuntansi)…"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!canSearch || loading}
                  className="rounded-md bg-blue-600 text-white px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[80px] justify-center"
                >
                  {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {loading ? "Mencari…" : "Cari"}
                </button>
                {query && (
                  <button
                    type="button"
                    onClick={onClear}
                    className="rounded-md border border-gray-300 px-3 py-2"
                  >
                    Hapus
                  </button>
                )}
              </form>

              {/* Search History Dropdown */}
              {showHistory && searchHistory.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                  <div className="px-3 py-2 bg-gray-50 flex justify-between items-center">
                    <p className="text-sm text-gray-600 font-medium">
                      Pencarian Terakhir
                    </p>
                    <button
                      onClick={clearAllHistory}
                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      Hapus Semua
                    </button>
                  </div>
                  <div className="py-1">
                    {searchHistory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center hover:bg-blue-50 group"
                      >
                        <button
                          onClick={() => handleHistoryClick(item.query)}
                          className="flex-1 px-3 py-2 text-left flex items-center gap-2 text-sm"
                        >
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-gray-700">{item.query}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeHistoryItem(item.id);
                          }}
                          className="px-2 py-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Hapus dari riwayat"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Popular Search Tags */}
            {!query && !loading && searchHistory.length === 0 && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">Pencarian populer:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      label: "Sistem Informasi",
                      color: "bg-red-100 text-red-800",
                      icon: "💻",
                    },
                    {
                      label: "Teknik Sipil",
                      color: "bg-blue-100 text-blue-800",
                      icon: "🏗️",
                    },
                    {
                      label: "Film Binus",
                      color: "bg-purple-100 text-purple-800",
                      icon: "�",
                    },
                    {
                      label: "Informatika ITB",
                      color: "bg-green-100 text-green-800",
                      icon: "💻",
                    },
                    {
                      label: "Akuntansi",
                      color: "bg-yellow-100 text-yellow-800",
                      icon: "📊",
                    },
                    {
                      label: "Kedokteran",
                      color: "bg-red-100 text-red-800",
                      icon: "⚕️",
                    },
                    {
                      label: "Manajemen",
                      color: "bg-pink-100 text-pink-800",
                      icon: "📈",
                    },
                  ].map((tag, index) => (
                    <button
                      key={tag.label}
                      onClick={() => handleHistoryClick(tag.label)}
                      className={`px-3 py-2 rounded-full text-xs font-medium hover:opacity-80 hover:scale-105 transition-all duration-200 flex items-center gap-1 animate-fade-in ${tag.color}`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span className="text-sm">{tag.icon}</span>
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Search History Tags */}
            {!query && !loading && searchHistory.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm text-gray-600">Pencarian terakhir:</p>
                  <button
                    onClick={clearAllHistory}
                    className="text-xs text-gray-400 hover:text-red-600 font-medium transition-colors"
                  >
                    Hapus semua
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.slice(0, 7).map((item, index) => (
                    <div
                      key={item.id}
                      className="group relative animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <button
                        onClick={() => handleHistoryClick(item.query)}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-800 transition-all duration-200 flex items-center gap-1 group-hover:pr-8"
                      >
                        <svg
                          className="w-3 h-3 text-gray-500 group-hover:text-blue-600 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {item.query}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeHistoryItem(item.id);
                        }}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-gray-300 hover:bg-red-500 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center"
                        title="Hapus dari riwayat"
                      >
                        <svg
                          className="w-2 h-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!query && searchHistory.length === 0 && !loading && (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm mb-4">
                  Mulai dengan mengetik nama program studi atau pilih dari
                  pencarian populer di atas.
                </p>
                <div className="text-xs text-gray-400">
                  💡 Tips: Riwayat pencarian akan tersimpan untuk memudahkan
                  pencarian berikutnya
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 mb-4">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="space-y-4">
                {/* Skeleton Loading for Table */}
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
                      {[1, 2, 3, 4, 5].map((index) => (
                        <tr key={index} className="border-t border-gray-100">
                          <td className="px-4 py-2">
                            <div className="animate-pulse">
                              <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="animate-pulse">
                              <div className="h-6 bg-gray-300 rounded-full w-16"></div>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="animate-pulse">
                              <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
                              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="animate-pulse">
                              <div className="h-6 bg-gray-300 rounded-full w-12"></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {results.length > 0 && !loading && (
              <div className="rounded-lg border border-gray-200 overflow-hidden relative">
                <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2">Nama Program Studi</th>
                      <th className="px-4 py-2">Jenjang</th>
                      <th className="px-4 py-2">Universitas</th>
                      <th className="px-4 py-2">akreditasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((p, index) => (
                      <tr
                        key={`${p.prodi_id}-${
                          p.universitas?.university_id || "no-univ"
                        }-${index}`}
                        onClick={() => handleProdiClick(p.prodi_id)}
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
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                p.akreditasi === "Unggul" ||
                                p.akreditasi === "A"
                                  ? "bg-green-100 text-green-800"
                                  : p.akreditasi === "Baik Sekali" ||
                                    p.akreditasi === "B"
                                  ? "bg-blue-100 text-blue-800"
                                  : p.akreditasi === "Baik" ||
                                    p.akreditasi === "C"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
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

            {query && !loading && !error && results.length === 0 && (
              <p className="text-gray-500">
                Tidak ada program studi yang cocok.
              </p>
            )}
          </div>

          {/* Right Side - Detail Panel */}
          <div className="flex-1">
            {detailLoading ? (
              // Loading Detail View
              <div className="flex items-center justify-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">
                    Memuat detail program studi...
                  </p>
                </div>
              </div>
            ) : selectedProdi ? (
              // Detail View
              <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                {/* Detail Header */}
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

                {/* Detail Error */}
                {detailError && (
                  <div className="mx-6 mt-4 rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2">
                    {detailError}
                  </div>
                )}

                {/* Basic Information */}
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

                    {selectedProdi.kode_prodi && (
                      <div>
                        <dt className="font-medium text-gray-500">
                          Kode Prodi
                        </dt>
                        <dd className="text-gray-900">
                          {selectedProdi.kode_prodi}
                        </dd>
                      </div>
                    )}

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
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              selectedProdi.akreditasi === "Unggul" ||
                              selectedProdi.akreditasi === "A"
                                ? "bg-green-100 text-green-800"
                                : selectedProdi.akreditasi === "Baik Sekali" ||
                                  selectedProdi.akreditasi === "B"
                                ? "bg-blue-100 text-blue-800"
                                : selectedProdi.akreditasi === "Baik" ||
                                  selectedProdi.akreditasi === "C"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
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
                          {new Date(
                            selectedProdi.tanggal_berdiri
                          ).toLocaleDateString("id-ID")}
                        </dd>
                      </div>
                    )}

                    {selectedProdi.deskripsi && (
                      <div>
                        <dt className="font-medium text-gray-500">Deskripsi</dt>
                        <dd className="text-gray-900">
                          {selectedProdi.deskripsi}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            ) : (
              // Empty Detail State
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
    </div>
  );
};

export default Jurusan;
