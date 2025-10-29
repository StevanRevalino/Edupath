/**
 * Career Assessment Result Page
 * Displays assessment results and program recommendations
 */

import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getAssessmentResult } from "../../../services/riasecService";
import type { AssessmentResult, RiasecType } from "../../../types/riasec";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { toast } from "react-hot-toast";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const HasilTes: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState<AssessmentResult | null>(
    location.state?.result || null
  );
  const [loading, setLoading] = useState(!result);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!result && assessmentId) {
      fetchResult();
    }
  }, [assessmentId]);

  const fetchResult = async () => {
    if (!assessmentId) return;

    try {
      setLoading(true);
      const data = await getAssessmentResult(assessmentId);
      setResult(data);
    } catch (err: any) {
      console.error("Error fetching result:", err);
      setError(err.response?.data?.message || "Gagal memuat hasil");
      toast.error("Gagal memuat hasil tes");
    } finally {
      setLoading(false);
    }
  };

  const getRiasecTypeColor = (type: RiasecType): string => {
    const colors: Record<RiasecType, string> = {
      REALISTIC: "bg-blue-500",
      INVESTIGATIVE: "bg-purple-500",
      ARTISTIC: "bg-pink-500",
      SOCIAL: "bg-green-500",
      ENTERPRISING: "bg-orange-500",
      CONVENTIONAL: "bg-gray-500",
    };
    return colors[type];
  };

  const getRiasecTypeName = (type: RiasecType): string => {
    const names: Record<RiasecType, string> = {
      REALISTIC: "Realistis",
      INVESTIGATIVE: "Investigatif",
      ARTISTIC: "Artistik",
      SOCIAL: "Sosial",
      ENTERPRISING: "Enterprising",
      CONVENTIONAL: "Konvensional",
    };
    return names[type];
  };

  const getRiasecTypeDescription = (type: RiasecType): string => {
    const descriptions: Record<RiasecType, string> = {
      REALISTIC:
        "Kamu adalah tipe orang yang suka hal-hal nyata dan praktis. Kamu lebih suka bekerja langsung dengan alat, mesin, atau kegiatan yang melibatkan keterampilan tangan.",
      INVESTIGATIVE:
        "Kamu senang berpikir kritis dan mencari tahu cara sesuatu bekerja. Kamu menikmati kegiatan seperti meneliti, menganalisis, atau memecahkan masalah.",
      ARTISTIC:
        "Kamu kreatif dan imajinatif. Kamu suka mengekspresikan ide dan perasaan melalui seni, musik, tulisan, atau desain.",
      SOCIAL:
        "Kamu peduli dengan orang lain dan senang membantu. Kamu menikmati kegiatan yang melibatkan mengajar, membimbing, atau melayani sesama.",
      ENTERPRISING:
        "Kamu percaya diri, suka memimpin, dan punya jiwa wirausaha. Kamu tertarik dengan dunia bisnis, manajemen, atau hal-hal yang melibatkan pengambilan keputusan.",
      CONVENTIONAL:
        "Kamu rapi, teliti, dan teratur. Kamu suka bekerja dengan data, angka, atau sistem yang jelas dan terstruktur.",
    };
    return descriptions[type];
  };

  // Prepare Radar Chart Data
  const getRadarChartData = () => {
    const labels = [
      "Realistis (R)",
      "Investigatif (I)",
      "Artistik (A)",
      "Sosial (S)",
      "Enterprising (E)",
      "Konvensional (C)",
    ];

    const borderColors = [
      "rgb(59, 130, 246)",
      "rgb(168, 85, 247)",
      "rgb(236, 72, 153)",
      "rgb(34, 197, 94)",
      "rgb(249, 115, 22)",
      "rgb(107, 114, 128)",
    ];

    const data = [
      result?.scores.realistic || 0,
      result?.scores.investigative || 0,
      result?.scores.artistic || 0,
      result?.scores.social || 0,
      result?.scores.enterprising || 0,
      result?.scores.conventional || 0,
    ];

    return {
      labels,
      datasets: [
        {
          label: "Skor RIASEC",
          data,
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 2,
          pointBackgroundColor: borderColors,
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: borderColors,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    };
  };

  const radarChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        beginAtZero: true,
        max: 50,
        min: 0,
        ticks: {
          stepSize: 10,
          font: {
            size: 12,
          },
        },
        pointLabels: {
          font: {
            size: 14,
            weight: "bold" as const,
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        angleLines: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `Skor: ${context.parsed.r}/50`;
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Terjadi Kesalahan</h3>
          <p className="text-red-600 mb-4">
            {error || "Hasil tidak ditemukan"}
          </p>
          <button
            onClick={() => navigate("/tes-jurusan")}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hasil Tes Minat & Bakat Karier
          </h1>
          <p className="text-gray-600">
            Berikut adalah hasil analisis kepribadian dan rekomendasi program
            studi untukmu
          </p>
        </div>

        {/* Holland Code */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md p-8 mb-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Kode Kepribadian Kamu</h2>
          <div className="text-6xl font-black mb-4 tracking-wider">
            {result.holland_code}
          </div>
          <p className="text-white/90 text-lg">
            Tipe Utama: {getRiasecTypeName(result.primary_type)}
            {result.secondary_type &&
              ` • Tipe Sekunder: ${getRiasecTypeName(result.secondary_type)}`}
          </p>
        </div>

        {/* Primary Type Description */}
        <div
          className={`${getRiasecTypeColor(
            result.primary_type
          )} rounded-lg shadow-md p-6 mb-6 text-white`}
        >
          <h2 className="text-2xl font-bold mb-3">
            Kepribadian Utama: {getRiasecTypeName(result.primary_type)}
          </h2>
          <p className="text-lg text-white/95">
            {getRiasecTypeDescription(result.primary_type)}
          </p>
        </div>

        {/* Scores Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Skor RIASEC Kamu
          </h2>

          <div className="max-w-2xl mx-auto">
            <Radar data={getRadarChartData()} options={radarChartOptions} />
          </div>

          {/* Score Legend */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
            {Object.entries(result.scores).map(([type, score]) => {
              const riasecType = type.toUpperCase() as RiasecType;

              return (
                <div
                  key={type}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    className={`w-4 h-4 rounded-full ${getRiasecTypeColor(
                      riasecType
                    )}`}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700">
                      {getRiasecTypeName(riasecType)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {type[0].toUpperCase()}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-900">{score}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Rekomendasi Program Studi ({result.recommendations.length})
          </h2>
          <p className="text-gray-600 mb-6">
            Berdasarkan hasil tes, berikut adalah program studi yang paling
            cocok untukmu
          </p>

          {result.recommendations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Belum ada rekomendasi program studi. Data sedang dalam proses
                pengembangan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.recommendations.map((rec) => (
                <div
                  key={rec.prodi_id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/prodi/${rec.prodi_id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {rec.nama_prodi}
                      </h3>
                      {rec.jenjang && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {rec.jenjang}
                        </span>
                      )}
                    </div>
                    <div className="text-right ml-2">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(rec.match_percentage)}%
                      </div>
                      <div className="text-xs text-gray-500">Match</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs px-2 py-1 rounded text-white ${getRiasecTypeColor(
                        rec.primary_type
                      )}`}
                    >
                      {getRiasecTypeName(rec.primary_type)}
                    </span>
                    {rec.secondary_type && (
                      <span
                        className={`text-xs px-2 py-1 rounded text-white ${getRiasecTypeColor(
                          rec.secondary_type
                        )}`}
                      >
                        {getRiasecTypeName(rec.secondary_type)}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 text-sm text-gray-600">
                    📍 Tersedia di {rec.university_count} universitas
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/jurusan")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Jelajahi Semua Program Studi
            </button>
            <button
              onClick={() => navigate("/universitas")}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Cari Universitas
            </button>
            <button
              onClick={() => navigate("/tes")}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
            >
              Ulangi Tes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HasilTes;
