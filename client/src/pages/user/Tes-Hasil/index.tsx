/**
 * Career Assessment Result Page
 * Displays assessment results and program recommendations
 */

import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getAssessmentResult } from "../../../services/hollandService";
import type { AssessmentResult, HollandType } from "../../../types/holland";
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

  const getHollandTypeColor = (type: HollandType): string => {
    const colors: Record<HollandType, string> = {
      REALISTIC: "bg-primary",
      INVESTIGATIVE: "bg-purple-500",
      ARTISTIC: "bg-pink-500",
      SOCIAL: "bg-green-500",
      ENTERPRISING: "bg-orange-500",
      CONVENTIONAL: "bg-gray-500",
    };
    return colors[type];
  };

  const getHollandTypeName = (type: HollandType): string => {
    const names: Record<HollandType, string> = {
      REALISTIC: "Realistis",
      INVESTIGATIVE: "Investigatif",
      ARTISTIC: "Artistik",
      SOCIAL: "Sosial",
      ENTERPRISING: "Enterprising",
      CONVENTIONAL: "Konvensional",
    };
    return names[type];
  };

  const getHollandTypeDescription = (type: HollandType): string => {
    const descriptions: Record<HollandType, string> = {
      REALISTIC:
        "Kamu adalah orang yang praktis dan suka bekerja dengan alat, mesin, atau hal-hal teknis. Kamu lebih nyaman dengan pekerjaan yang melibatkan aktivitas fisik dan hasil yang nyata.",
      INVESTIGATIVE:
        "Kamu adalah orang yang analitis dan suka berpikir. Kamu senang memecahkan masalah, melakukan riset, dan memahami bagaimana sesuatu bekerja secara mendalam.",
      ARTISTIC:
        "Kamu adalah orang yang kreatif dan imajinatif. Kamu senang mengekspresikan diri melalui seni, desain, musik, atau bentuk kreativitas lainnya.",
      SOCIAL:
        "Kamu adalah orang yang empatik dan suka membantu. Kamu senang berinteraksi dengan orang lain, mengajar, membimbing, atau melayani masyarakat.",
      ENTERPRISING:
        "Kamu adalah orang yang persuasif dan ambisius. Kamu senang memimpin, berbisnis, dan mempengaruhi orang lain untuk mencapai tujuan.",
      CONVENTIONAL:
        "Kamu adalah orang yang terorganisir dan detail-oriented. Kamu senang bekerja dengan data, sistem, dan prosedur yang terstruktur.",
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
          label: "Skor Holland",
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
            Tipe Utama: {getHollandTypeName(result.primary_type)}
            {result.secondary_type &&
              ` • Tipe Sekunder: ${getHollandTypeName(result.secondary_type)}`}
          </p>
        </div>

        {/* Primary Type Description */}
        <div
          className={`${getHollandTypeColor(
            result.primary_type
          )} rounded-lg shadow-md p-6 mb-6 text-white`}
        >
          <h2 className="text-2xl font-bold mb-3">
            Kepribadian Utama: {getHollandTypeName(result.primary_type)}
          </h2>
          <p className="text-lg text-white/95">
            {getHollandTypeDescription(result.primary_type)}
          </p>
        </div>

        {/* Scores Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Skor Holland Kamu
          </h2>
          <p className="text-gray-600 mb-6">
            Grafik ini menunjukkan profil kepribadian kariermu berdasarkan
            Holland's Theory
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                <Radar data={getRadarChartData()} options={radarChartOptions} />
              </div>
            </div>

            {/* Score Details */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              <h3 className="font-semibold text-gray-800 mb-4 sticky top-0 bg-white pb-2">
                Detail Skor (Rentang 10-50)
              </h3>
              {Object.entries(result.scores).map(([type, score]) => {
                const hollandType = type.toUpperCase() as HollandType;
                const percentage = ((score - 10) / 40) * 100; // Normalized to 10-50 range

                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${getHollandTypeColor(
                            hollandType
                          )}`}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {getHollandTypeName(hollandType)}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {score}/50
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${getHollandTypeColor(
                          hollandType
                        )} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Holland Type Descriptions */}
          <div className="mt-6 p-4 bg-secondary-light border border-secondary rounded-lg">
            <h4 className="font-semibold text-2xl text-primary-dark mb-3">
              Pengertian Tipe Holland (RIASEC)
            </h4>
            <div className="space-y-2 text-sm text-primary-dark">
              <p>
                <strong className="text-primary-dark">R - Realistis:</strong>{" "}
                <span className="text-gray-700">
                  Praktis, suka bekerja dengan alat/mesin, aktivitas fisik, dan
                  hasil nyata
                </span>
              </p>
              <p>
                <strong className="text-purple-700">I - Investigatif:</strong>{" "}
                <span className="text-gray-700">
                  Analitis, suka berpikir, memecahkan masalah, dan melakukan
                  riset
                </span>
              </p>
              <p>
                <strong className="text-pink-700">A - Artistik:</strong>{" "}
                <span className="text-gray-700">
                  Kreatif, imajinatif, suka mengekspresikan diri melalui seni
                  dan desain
                </span>
              </p>
              <p>
                <strong className="text-green-700">S - Sosial:</strong>{" "}
                <span className="text-gray-700">
                  Empatik, suka membantu, berinteraksi, mengajar, dan melayani
                  orang lain
                </span>
              </p>
              <p>
                <strong className="text-orange-700">E - Enterprising:</strong>{" "}
                <span className="text-gray-700">
                  Persuasif, ambisius, suka memimpin, berbisnis, dan
                  mempengaruhi orang
                </span>
              </p>
              <p>
                <strong className="text-gray-700">C - Konvensional:</strong>{" "}
                <span className="text-gray-700">
                  Terorganisir, detail-oriented, suka bekerja dengan data dan
                  sistem terstruktur
                </span>
              </p>
            </div>
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
                        <span className="inline-block bg-secondary-light text-primary-dark text-xs px-2 py-1 rounded">
                          {rec.jenjang}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs px-2 py-1 rounded text-white ${getHollandTypeColor(
                        rec.primary_type
                      )}`}
                    >
                      {getHollandTypeName(rec.primary_type)}
                    </span>
                    {rec.secondary_type && (
                      <span
                        className={`text-xs px-2 py-1 rounded text-white ${getHollandTypeColor(
                          rec.secondary_type
                        )}`}
                      >
                        {getHollandTypeName(rec.secondary_type)}
                      </span>
                    )}
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
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-light font-medium"
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
