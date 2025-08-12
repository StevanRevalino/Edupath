import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

type UniversitasDetailType = {
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

              {universitas.rank_qs && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Ranking QS
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {universitas.rank_qs}
                  </dd>
                </div>
              )}

              {universitas.rank_country && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Ranking Nasional
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {universitas.rank_country}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Contact Information */}
        {(universitas.email || universitas.telepon) && (
          <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Kontak</h2>
            </div>

            <div className="px-6 py-4">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {universitas.email && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1">
                      <a
                        href={`mailto:${universitas.email}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
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
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {universitas.telepon}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversitasDetail;
