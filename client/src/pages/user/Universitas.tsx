import React, { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

type UniversitasItem = {
  university_id: string;
  nama: string;
  nama_singkat?: string | null;
  kota?: string | null;
  provinsi?: string | null;
  akreditasi?: string | null;
  status?: string | null;
  rank_qs?: number | null;
  rank_country?: number | null;
  email?: string | null;
  telepon?: string | null;
};

const API_BASE =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

const Universitas: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [results, setResults] = useState<UniversitasItem[]>([]);
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
      const url = `${API_BASE}/api/universitas/search/nama`;
      const res = await axios.get(url, {
        params: { nama: q.trim() },
        signal: ctrl.signal,
      });
      const data = (res.data?.data || []) as UniversitasItem[];
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
  }, []);

  const handleUniversitasClick = useCallback(
    (universityId: string) => {
      navigate(`/universitas/${universityId}`);
    },
    [navigate]
  );

  return (
    <div className="pt-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Cari Universitas</h1>

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
          <p className="text-gray-500 text-sm">
            Mulai dengan mengetik nama universitas, misalnya: "Gadjah Mada".
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
                Klik pada universitas untuk melihat detail
              </span>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2">Nama</th>
                  <th className="px-4 py-2">Provinsi</th>
                  <th className="px-4 py-2">Akreditasi</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((u) => (
                  <tr
                    key={u.university_id}
                    onClick={() => handleUniversitasClick(u.university_id)}
                    className="border-t border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors duration-150"
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
                    <td className="px-4 py-2">{u.provinsi || "-"}</td>
                    <td className="px-4 py-2">
                      {u.akreditasi ? (
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            u.akreditasi === "A"
                              ? "bg-green-100 text-green-800"
                              : u.akreditasi === "B"
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
                    <td className="px-4 py-2">{u.status || "-"}</td>
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
    </div>
  );
};

export default Universitas;
