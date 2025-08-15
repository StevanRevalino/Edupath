import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

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
  lintang?: number | null;
  bujur?: number | null;
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

const API_BASE =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

const Universitas: React.FC = () => {
  const location = useLocation();
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

  const canSearch = useMemo(() => query.trim().length >= 2, [query]);

  const fetchUniversitasDetail = useCallback(async (universityId: string) => {
    setDetailLoading(true);
    setDetailError("");
    try {
      const url = `${API_BASE}/api/universitas/${universityId}`;
      const res = await axios.get(url);
      const data = res.data?.data as UniversitasDetailType;
      console.log("Universitas Detail:", data);
      setSelectedUniversitas(data);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Terjadi kesalahan saat memuat detail";
      setDetailError(msg);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleUniversitasClick = useCallback(
    (universityId: string) => {
      fetchUniversitasDetail(universityId);
    },
    [fetchUniversitasDetail]
  );

  const search = useCallback(
    async (q: string, autoSelectExactMatch = false) => {
      if (!q.trim()) return;
      // Cancel previous request if still in-flight
      if (controllerRef.current) controllerRef.current.abort();
      const ctrl = new AbortController();
      controllerRef.current = ctrl;
      setLoading(true);
      setError("");
      try {
        const url = `${API_BASE}/api/universitas/search/nama`;
        const res = await axios.get(url, {
          params: { nama: q.trim() },
          signal: ctrl.signal,
        });
        const data = (res.data?.data || []) as UniversitasItem[];
        const source = res.data?.source || "api";
        setResults(data);
        setDataSource(source);

        // Auto-select exact match if requested (from Home.tsx navigation)
        if (autoSelectExactMatch && data.length > 0) {
          const exactMatch = data.find(
            (univ) => univ.nama.toLowerCase() === q.trim().toLowerCase()
          );
          if (exactMatch) {
            // Automatically fetch detail for exact match
            setTimeout(() => {
              fetchUniversitasDetail(exactMatch.university_id);
            }, 100);
          }
        }
      } catch (e: any) {
        if (axios.isCancel(e)) return; // silently ignore canceled
        const msg =
          e?.response?.data?.message || e?.message || "Terjadi kesalahan";
        setError(msg);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [fetchUniversitasDetail]
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
    setSelectedUniversitas(null);
    setDetailError("");
    setDataSource(null);
  }, []);

  // Handle selected university from Home.tsx navigation
  useEffect(() => {
    const selectedUniversityName = location.state?.selectedUniversity;
    if (selectedUniversityName) {
      // Set the query to the selected university name and search for it
      setQuery(selectedUniversityName);
      search(selectedUniversityName, true); // true = autoSelectExactMatch
    }
  }, [location.state, search]);

  // Function to clean province name by removing "Prov." prefix
  const cleanProvinceName = (provinsi: string | null | undefined) => {
    if (!provinsi) return "-";
    return provinsi.replace(/^Prov\.\s*/i, "");
  };

  return (
    <div className="pt-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Cari Universitas</h1>

        <div className="flex gap-6">
          {/* Left Side - Search Panel */}
          <div className="flex-1">
            <form onSubmit={onSubmit} className="flex gap-2 mb-6">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ketik minimal 2 huruf nama universitas…"
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

            {!query && (
              <p className="text-gray-500 text-sm mb-4">
                Mulai dengan mengetik nama universitas, misalnya: "Gadjah Mada".
              </p>
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
                        <th className="px-4 py-2">Nama</th>
                        <th className="px-4 py-2">Provinsi</th>
                        <th className="px-4 py-2">Akreditasi</th>
                        <th className="px-4 py-2">Email</th>
                        <th className="px-4 py-2">Telepon</th>
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
                              <div className="h-3 bg-gray-300 rounded w-full"></div>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="animate-pulse">
                              <div className="h-6 bg-gray-300 rounded-full w-12"></div>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="animate-pulse">
                              <div className="h-3 bg-gray-300 rounded w-full"></div>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="animate-pulse">
                              <div className="h-3 bg-gray-300 rounded w-2/3"></div>
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
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                  <span className="inline-flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    Klik pada universitas untuk melihat detail
                  </span>
                  {dataSource && (
                    <span className="inline-flex items-center text-xs">
                      {dataSource === "api" ? (
                        <>
                          <svg
                            className="w-3 h-3 mr-1 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-green-600">Data PDDIKTI</span>
                        </>
                      ) : dataSource === "local" ? (
                        <>
                          <svg
                            className="w-3 h-3 mr-1 text-blue-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-blue-600">Data Lokal</span>
                        </>
                      ) : null}
                    </span>
                  )}
                </div>
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
                    {results.map((u) => (
                      <tr
                        key={u.university_id}
                        onClick={() => handleUniversitasClick(u.university_id)}
                        className={`border-t border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors duration-150 ${
                          selectedUniversitas?.university_id === u.university_id
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

            {query && !loading && !error && results.length === 0 && (
              <p className="text-gray-500">Tidak ada universitas yang cocok.</p>
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
                    Memuat detail universitas...
                  </p>
                </div>
              </div>
            ) : selectedUniversitas ? (
              // Detail View
              <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                {/* Detail Header */}
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
                        Nama Lengkap
                      </dt>
                      <dd className="text-gray-900">
                        {selectedUniversitas.nama}
                      </dd>
                    </div>

                    {selectedUniversitas.kelompok && (
                      <div>
                        <dt className="font-medium text-gray-500">Kelompok</dt>
                        <dd className="text-gray-900">
                          {selectedUniversitas.kelompok}
                        </dd>
                      </div>
                    )}

                    {selectedUniversitas.provinsi && (
                      <div>
                        <dt className="font-medium text-gray-500">Provinsi</dt>
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

                {/* Contact Information */}
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
                          <dt className="font-medium text-gray-500">Telepon</dt>
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
                          <dt className="font-medium text-gray-500">Website</dt>
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

                {/* Rankings */}
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
                {selectedUniversitas.lintang && selectedUniversitas.bujur && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <a
                      href={`https://www.google.com/maps?q=${selectedUniversitas.lintang},${selectedUniversitas.bujur}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <p className="text-lg font-medium mb-2">Detail Universitas</p>
                  <p className="text-sm">
                    Pilih universitas dari daftar di sebelah kiri untuk melihat
                    detail
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

export default Universitas;
