import { Calendar, Clock, Eye, MessageCircle } from "lucide-react";
import AdminDataTable from "../../components/AdminDataTable";

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

interface ConsultationTableProps {
  consultations: Consultation[];
  onViewDetails: (consultation: Consultation) => void;
  onAccept: (id: string) => void;
  onDecline: (consultation: Consultation) => void;
  onReschedule: (consultation: Consultation) => void;
  onCancel: (id: string) => void;
  onOpenLiveChat?: (consultation: Consultation) => void;
  onViewChatHistory?: (consultation: Consultation) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

const ConsultationTable = ({
  consultations,
  onViewDetails,
  onAccept,
  onDecline,
  onReschedule,
  onCancel,
  onOpenLiveChat,
  onViewChatHistory,
  getStatusColor,
  getStatusText,
}: ConsultationTableProps) => {
  return (
    <AdminDataTable
      columns={[
        {
          header: "Murid",
          accessor: (consultation) => (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {consultation.murid.firstname.charAt(0).toUpperCase()}
                  {consultation.murid.lastname.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <div className="font-medium text-gray-900">
                  {consultation.murid.firstname} {consultation.murid.lastname}
                </div>
                <div className="text-xs text-gray-500">
                  {consultation.murid.email}
                </div>
              </div>
            </div>
          ),
        },
        {
          header: "Topik",
          accessor: "topic",
        },
        {
          header: "Jadwal",
          accessor: (consultation) => (
            <div className="flex flex-col gap-1">
              <div className="flex items-center text-sm text-gray-700">
                <Calendar className="w-4 h-4 mr-2 text-primary" />
                {new Date(consultation.consultation_date).toLocaleDateString(
                  "id-ID",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <Clock className="w-4 h-4 mr-2 text-primary" />
                {new Date(consultation.consultation_date).toLocaleTimeString(
                  "id-ID",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}{" "}
                -{" "}
                {new Date(
                  new Date(consultation.consultation_date).getTime() +
                    1 * 60 * 60 * 1000 // +1 jam (dalam ms)
                ).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ),
        },
        {
          header: "Status",
          accessor: (consultation) => (
            <span
              className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusColor(
                consultation.status
              )}`}
            >
              {getStatusText(consultation.status)}
            </span>
          ),
        },
        {
          header: "Aksi",
          accessor: (consultation) => (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(consultation);
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Eye size={14} />
                Detail
              </button>
              {consultation.status === "PENDING" && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAccept(consultation.consultation_id);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Terima
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDecline(consultation);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Tolak
                  </button>
                </>
              )}
              {consultation.status === "ACCEPTED" &&
                (() => {
                  const consultationStartTime = new Date(
                    consultation.consultation_date
                  );
                  const now = new Date();
                  const indonesiaTime = new Date(
                    now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
                  );
                  const hasStarted = indonesiaTime >= consultationStartTime;

                  return (
                    <>
                      {hasStarted && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenLiveChat?.(consultation);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
                        >
                          <MessageCircle size={14} />
                          Chat
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReschedule(consultation);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                      >
                        Reschedule
                      </button>
                      {!hasStarted && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCancel(consultation.consultation_id);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Batalkan
                        </button>
                      )}
                    </>
                  );
                })()}
              {consultation.status === "COMPLETED" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewChatHistory?.(consultation);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
                >
                  <MessageCircle size={14} />
                  Lihat riwayat chat
                </button>
              )}
            </div>
          ),
        },
      ]}
      data={consultations}
      keyExtractor={(consultation) => consultation.consultation_id}
      emptyMessage="Tidak ada data konseling"
    />
  );
};

export default ConsultationTable;
