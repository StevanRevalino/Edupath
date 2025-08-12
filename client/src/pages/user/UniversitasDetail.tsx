import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

type UniversitasDetailType = {
  university_id: string;
  nama: string;
  nama_singkat?: string | null;
  npsn?: string | null;
  kota?: string | null;
  provinsi?: string | null;
  alamat?: string | null;
  kode_pos?: string | null;
  akreditasi?: string | null;
  status?: string | null;
  rank_qs?: number | null;
  rank_country?: number | null;
  email?: string | null;
  telepon?: string | null;
  fax?: string | null;
  website?: string | null;
  tanggal_berdiri?: string | null;
  sk_pendirian?: string | null;
  jumlah_mahasiswa?: number | null;
  jumlah_dosen?: number | null;
  kecamatan?: string | null;
  lintang?: number | null;
  bujur?: number | null;
  tanggal_sk?: string | null;
  status_akreditasi?: string | null;
};

const API_BASE =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

const UniversitasDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [universitas, setUniversitas] = useState<UniversitasDetailType | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchUniversitasDetail = async () => {
      if (!id) {
        setError("ID universitas tidak valid");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const url = `${API_BASE}/api/universitas/${id}`;
        const res = await axios.get(url);
        const data = res.data?.data as UniversitasDetailType;
        setUniversitas(data);
      } catch (e: any) {
        const msg =
          e?.response?.data?.message || e?.message || "Terjadi kesalahan";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversitasDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat detail universitas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-4">
            {error}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="rounded-md bg-gray-600 text-white px-4 py-2 hover:bg-gray-700"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!universitas) {
    return (
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <p className="text-gray-600">Universitas tidak ditemukan</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 rounded-md bg-gray-600 text-white px-4 py-2 hover:bg-gray-700"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Kembali
          </button>

          <div className="border-b border-gray-200 pb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {universitas.nama}
            </h1>
            {universitas.nama_singkat && (
              <p className="text-lg text-gray-600 mt-1">
                ({universitas.nama_singkat})
              </p>
            )}
          </div>
        </div>

        {/* Detail Information */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Informasi Universitas
            </h2>
          </div>

          <div className="px-6 py-4">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Nama Lengkap
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {universitas.nama}
                </dd>
              </div>

              {universitas.nama_singkat && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Nama Singkat
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {universitas.nama_singkat}
                  </dd>
                </div>
              )}

              {universitas.npsn && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">NPSN</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {universitas.npsn}
                  </dd>
                </div>
              )}

              {universitas.kota && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Kota</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {universitas.kota}
                  </dd>
                </div>
              )}

              {universitas.provinsi && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Provinsi
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {universitas.provinsi}
                  </dd>
                </div>
              )}

              {universitas.alamat && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Alamat</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {universitas.alamat}
                  </dd>
                </div>
              )}

              {universitas.kode_pos && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Kode Pos
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {universitas.kode_pos}
                  </dd>
                </div>
              )}

              {universitas.kecamatan && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Kecamatan
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {universitas.kecamatan}
                  </dd>
                </div>
              )}

              {universitas.akreditasi && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Akreditasi
                  </dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        universitas.akreditasi === "A"
                          ? "bg-green-100 text-green-800"
                          : universitas.akreditasi === "B"
                          ? "bg-yellow-100 text-yellow-800"
                          : universitas.akreditasi === "C"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {universitas.akreditasi}
                    </span>
                  </dd>
                </div>
              )}

              {universitas.status && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {universitas.status}
                  </dd>
                </div>
              )}

              {universitas.tanggal_berdiri && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Tanggal Berdiri
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(universitas.tanggal_berdiri).toLocaleDateString(
                      "id-ID"
                    )}
                  </dd>
                </div>
              )}

              {universitas.sk_pendirian && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    SK Pendirian
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {universitas.sk_pendirian}
                  </dd>
                </div>
              )}

              {universitas.tanggal_sk && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Tanggal SK Pendirian
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(universitas.tanggal_sk).toLocaleDateString(
                      "id-ID"
                    )}
                  </dd>
                </div>
              )}

              {universitas.status_akreditasi && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Status Akreditasi
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {universitas.status_akreditasi}
                  </dd>
                </div>
              )}

              {universitas.rank_qs && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Ranking QS
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    #{universitas.rank_qs}
                  </dd>
                </div>
              )}

              {universitas.rank_country && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Ranking Nasional
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    #{universitas.rank_country}
                  </dd>
                </div>
              )}

              {universitas.jumlah_mahasiswa && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Jumlah Mahasiswa
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {universitas.jumlah_mahasiswa.toLocaleString("id-ID")} orang
                  </dd>
                </div>
              )}

              {universitas.jumlah_dosen && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Jumlah Dosen
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {universitas.jumlah_dosen.toLocaleString("id-ID")} orang
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Contact Information */}
        {(universitas.email ||
          universitas.telepon ||
          universitas.fax ||
          universitas.website) && (
          <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Kontak & Website
              </h2>
            </div>

            <div className="px-6 py-4">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {universitas.email && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1">
                      <a
                        href={`mailto:${universitas.email}`}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
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
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        {universitas.email}
                      </a>
                    </dd>
                  </div>
                )}

                {universitas.telepon && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Telepon
                    </dt>
                    <dd className="mt-1">
                      <a
                        href={`tel:${universitas.telepon}`}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
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
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        {universitas.telepon}
                      </a>
                    </dd>
                  </div>
                )}

                {universitas.fax && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Fax</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
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
                          d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4v16a1 1 0 001 1h8a1 1 0 001-1V4m-5 8h.01M12 16h.01"
                        />
                      </svg>
                      {universitas.fax}
                    </dd>
                  </div>
                )}

                {universitas.website && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Website
                    </dt>
                    <dd className="mt-1">
                      <a
                        href={
                          universitas.website.startsWith("http")
                            ? universitas.website
                            : `https://${universitas.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
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
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        {universitas.website}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        )}

        {/* Location Coordinates */}
        {universitas.lintang && universitas.bujur && (
          <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Koordinat Lokasi
              </h2>
            </div>

            <div className="px-6 py-4">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Lintang</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">
                    {universitas.lintang}°
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Bujur</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">
                    {universitas.bujur}°
                  </dd>
                </div>

                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">
                    Lihat di Peta
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={`https://www.google.com/maps?q=${universitas.lintang},${universitas.bujur}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Buka di Google Maps
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversitasDetail;
