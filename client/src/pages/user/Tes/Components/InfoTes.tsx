import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TokenManager from "../../../../utils/tokenManager";
import type { AssessmentResult, HollandType } from "../../../../types/holland";
import LoadingSpinner from "../../../../components/LoadingSpinner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Define the Test interface similar to Consultation
export interface TesSession {
  test_id: string;
  murid_id: string;
  test_date: string;
  status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  result_summary?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface InfoTesProps {
  tesSession: TesSession | null;
}

const InfoTes = ({ tesSession }: InfoTesProps) => {
  const navigate = useNavigate();
  const [assessmentDetail, setAssessmentDetail] =
    useState<AssessmentResult | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (tesSession?.status === "COMPLETED") {
      fetchAssessmentDetail();
    } else {
      setAssessmentDetail(null);
    }
  }, [tesSession?.test_id]);

  const fetchAssessmentDetail = async () => {
    if (!tesSession) return;

    try {
      setLoadingDetail(true);
      const token = TokenManager.getToken();
      const response = await axios.get(
        `${API_URL}/api/holland/result/${tesSession.test_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = response.data.data;
      setAssessmentDetail(result);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        TokenManager.logout();
        window.location.href = "/login";
      }
      console.error("Error fetching assessment detail:", error);
      setAssessmentDetail(null);
    } finally {
      setLoadingDetail(false);
    }
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
  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Selesai";
      case "IN_PROGRESS":
        return "Sedang Berlangsung";
      case "SCHEDULED":
        return "Terjadwal";
      default:
        return "Dibatalkan";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-600";
      case "IN_PROGRESS":
        return "text-primary";
      case "SCHEDULED":
        return "text-yellow-600";
      default:
        return "text-red-600";
    }
  };

  if (!tesSession) {
    return (
      <div className="h-full">
        <h4 className="text-lg font-semibold text-gray-800 text-center mb-8">
          tes minat & bakat
        </h4>

        {/* Placeholder content for test info */}
        <div className="space-y-4 text-center text-gray-500">
          <p className="text-sm">
            Pilih sesi tes dari riwayat untuk melihat detail informasi
          </p>
          <div className="bg-gray-100 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
            <p className="text-xs">Detail sesi akan ditampilkan di sini</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <h4 className="text-lg font-semibold text-gray-800 text-center mb-6">
        Detail sesi tes
      </h4>

      <div className="space-y-6 flex-1 overflow-y-auto pr-2 max-h-full">
        {/* Status & Date */}
        <div className="border-b pb-4">
          <label className="text-base font-semibold text-gray-600 block mb-1">
            Status:
          </label>
          <p
            className={`text-sm font-semibold ${getStatusColor(
              tesSession.status
            )}`}
          >
            {getStatusText(tesSession.status)}
          </p>
        </div>

        <div className="border-b pb-4">
          <label className="text-base font-semibold text-gray-600 block mb-1">
            Tanggal & Waktu:
          </label>
          <p className="text-sm text-gray-800">
            {new Date(tesSession.test_date).toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-sm text-gray-600">
            {new Date(tesSession.test_date).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            WIB
          </p>
        </div>

        {/* Holland Code & Primary Type */}
        {loadingDetail ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : assessmentDetail ? (
          <>
            {/* Holland Code */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
              <label className="text-sm font-semibold text-white/80 block mb-2">
                Kode Kepribadian:
              </label>
              <div className="text-4xl font-black tracking-wider mb-2">
                {assessmentDetail.holland_code}
              </div>
              <p className="text-sm text-white/90">
                {getHollandTypeName(assessmentDetail.primary_type)}
                {assessmentDetail.secondary_type &&
                  ` • ${getHollandTypeName(assessmentDetail.secondary_type)}`}
              </p>
            </div>

            {/* Holland Scores Preview */}
            <div className="border-b pb-4">
              <label className="text-base font-semibold text-gray-600 block mb-3">
                Skor Holland:
              </label>
              <div className="space-y-2">
                {Object.entries(assessmentDetail.scores).map(
                  ([type, score]) => {
                    const hollandType = type.toUpperCase() as HollandType;
                    const percentage = (score / 50) * 100;

                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700">
                            {getHollandTypeName(hollandType)} (
                            {type[0].toUpperCase()})
                          </span>
                          <span className="text-xs font-bold text-gray-900">
                            {score}/50
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getHollandTypeColor(
                              hollandType
                            )}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Recommendations Count */}
            <div className="border-b pb-4">
              <label className="text-base font-semibold text-gray-600 block mb-1">
                Rekomendasi Program Studi:
              </label>
              <p className="text-sm text-gray-800">
                {assessmentDetail.recommendations.length} program studi yang
                cocok
              </p>
            </div>
          </>
        ) : (
          tesSession.result_summary && (
            <div className="border-b pb-4">
              <label className="text-base font-semibold text-gray-600 block mb-1">
                Ringkasan Hasil:
              </label>
              <p className="text-sm text-gray-800">
                {tesSession.result_summary}
              </p>
            </div>
          )
        )}

        {/* View Detail Button */}
        {tesSession.status === "COMPLETED" && (
          <div className="pt-4 sticky bottom-0 bg-white">
            <button
              onClick={() => navigate(`/tes/hasil/${tesSession.test_id}`)}
              className="w-full bg-primary-dark text-white py-3 rounded-lg font-semibold hover:bg-primary-hover transition-colors shadow-lg"
            >
              Lihat Detail Lengkap
            </button>
          </div>
        )}
      </div>

      <div className="pt-4 text-xs text-gray-500 text-center flex-shrink-0">
        Dibuat: {new Date(tesSession.created_at).toLocaleDateString("id-ID")}
      </div>
    </div>
  );
};

export default InfoTes;
