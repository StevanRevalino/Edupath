import React, { useCallback, useMemo, useRef, useState } from "react";
import axios from "axios";

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

const API_BASE =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

const Jurusan: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [results, setResults] = useState<ProdiItem[]>([]);
  const [selectedProdi, setSelectedProdi] = useState<ProdiDetailType | null>(
    null
  );
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string>("");
  const controllerRef = useRef<AbortController | null>(null);

  const canSearch = useMemo(() => query.trim().length >= 2, [query]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) return;
    // Cancel previous request if still in-flight
    if (controllerRef.current) controllerRef.current.abort();
    const ctrl = new AbortController();
    controllerRef.current = ctrl;
    setLoading(true);
    setError("");
    try {
      const url = `${API_BASE}/api/prodi/search/nama/${encodeURIComponent(
        q.trim()
      )}`;
      const res = await axios.get(url, {
        signal: ctrl.signal,
      });
      const data = (res.data?.data || []) as ProdiItem[];
      setResults(data);
    } catch (e: any) {
      if (axios.isCancel(e)) return; // silently ignore canceled
      const msg =
        e?.response?.data?.message || e?.message || "Terjadi kesalahan";
      setError(msg);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
  }, []);

  const fetchProdiDetail = useCallback(async (prodiId: string) => {
    setDetailLoading(true);
    setDetailError("");
    try {
      const url = `${API_BASE}/api/prodi/detail/${prodiId}`;
      const res = await axios.get(url);
      const data = res.data?.data as ProdiDetailType;
      setSelectedProdi(data);
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

  const handleProdiClick = useCallback(
    (prodiId: string) => {
      fetchProdiDetail(prodiId);
    },
    [fetchProdiDetail]
  );

  return (
    <div className="pt-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Cari Program Studi</h1>

        <div className="flex gap-6">
          {/* Left Side - Search Panel */}
          <div className="flex-1">
            <form onSubmit={onSubmit} className="flex gap-2 mb-6">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ketik minimal 2 huruf nama program studi…"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!canSearch || loading}
                className="rounded-md bg-blue-600 text-white px-4 py-2 disabled:opacity-50"
              >
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
                Mulai dengan mengetik nama program studi, misalnya: "Teknik
                Informatika".
              </p>
            )}

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 mb-4">
                {error}
              </div>
            )}

            {results.length > 0 && (
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="mb-2 text-sm text-gray-600">
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
                    Klik pada program studi untuk melihat detail
                  </span>
                </div>
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
                    {results.map((p) => (
                      <tr
                        key={p.prodi_id}
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
                                p.akreditasi === "A" ||
                                p.akreditasi === "Unggul"
                                  ? "bg-green-100 text-green-800"
                                  : p.akreditasi === "B" ||
                                    p.akreditasi === "Baik Sekali"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : p.akreditasi === "C" ||
                                    p.akreditasi === "Baik"
                                  ? "bg-red-100 text-red-800"
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
