import type { FC } from "react";
import { Calendar, Clock, Eye } from "lucide-react";

interface Consultation {
  consultation_id: string;
  murid_id: string;
  topic: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED";
  consultation_date: string;
  consultation_time: string;
  notes?: string;
  description?: string;
  admin_notes?: string;
  created_at: string;
  is_active: boolean;
  murid: {
    firstname: string;
    lastname: string;
    email: string;
    kelas: number | null;
  };
}

interface ConsultationCardsProps {
  consultations: Consultation[];
  onViewDetails: (consultation: Consultation) => void;
  onAccept: (id: string) => void;
  onDecline: (consultation: Consultation) => void;
  onReschedule: (consultation: Consultation) => void;
  onCancel: (id: string) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

const ConsultationCards: FC<ConsultationCardsProps> = ({
  consultations,
  onViewDetails,
  onAccept,
  onDecline,
  onReschedule,
  onCancel,
  getStatusColor,
  getStatusText,
}) => {
  return (
    <div className="space-y-4">
      {consultations.map((consultation) => (
        <div
          key={consultation.consultation_id}
          className="bg-white rounded-xl shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow"
        >
          {/* Header: Student Info & Status */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-semibold shadow-md">
                {consultation.murid.firstname[0]}
                {consultation.murid.lastname[0]}
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  {consultation.murid.firstname} {consultation.murid.lastname}
                </div>
                {consultation.murid.kelas && (
                  <div className="text-xs text-gray-500">
                    Kelas {consultation.murid.kelas}
                  </div>
                )}
              </div>
            </div>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusColor(
                consultation.status
              )}`}
            >
              {getStatusText(consultation.status)}
            </span>
          </div>

          {/* ID & Topic */}
          <div className="mb-4 space-y-2">
            <div className="text-xs text-gray-500 font-mono">
              ID: {consultation.consultation_id.slice(0, 8)}
            </div>
            <div className="text-sm font-semibold text-gray-900">
              {consultation.topic}
            </div>
          </div>

          {/* Schedule Info */}
          <div className="flex flex-col gap-2 mb-4 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>
                {new Date(consultation.consultation_date).toLocaleDateString(
                  "id-ID",
                  {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>
                {new Date(consultation.consultation_date).toLocaleTimeString(
                  "id-ID",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            {/* View Details Button */}
            <button
              onClick={() => onViewDetails(consultation)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Lihat Detail
            </button>

            {/* Status-specific actions */}
            {consultation.status === "PENDING" && (
              <div className="flex gap-2">
                <button
                  onClick={() => onAccept(consultation.consultation_id)}
                  className="flex-1 px-4 py-2.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
                >
                  Terima
                </button>
                <button
                  onClick={() => onDecline(consultation)}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                >
                  Tolak
                </button>
              </div>
            )}

            {consultation.status === "ACCEPTED" && (
              <div className="flex gap-2">
                <button
                  onClick={() => onReschedule(consultation)}
                  className="flex-1 px-4 py-2.5 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Reschedule
                </button>
                <button
                  onClick={() => onCancel(consultation.consultation_id)}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                >
                  Batalkan
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConsultationCards;
