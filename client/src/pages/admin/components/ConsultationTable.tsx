import { Calendar, Clock, ChevronRight } from "lucide-react";

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
  getStatusColor,
  getStatusText,
}: ConsultationTableProps) => {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 shadow-lg">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
              Murid
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
              Topik
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
              Jadwal
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">
              Aksi
            </th>
            <th className="px-4 py-4 w-12"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {consultations.map((consultation) => (
            <tr
              key={consultation.consultation_id}
              onClick={() => onViewDetails(consultation)}
              className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-200 cursor-pointer group"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                    <span className="text-white font-bold text-lg">
                      {consultation.murid.firstname[0]}
                      {consultation.murid.lastname[0]}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {consultation.murid.firstname}{" "}
                      {consultation.murid.lastname}
                    </div>
                    {consultation.murid.kelas && (
                      <div className="text-xs text-gray-500">
                        Kelas {consultation.murid.kelas}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm font-medium text-gray-900">
                  {consultation.topic}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1.5 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">
                      {new Date(
                        consultation.consultation_date
                      ).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-cyan-600" />
                    <span className="font-medium">
                      {new Date(
                        consultation.consultation_date
                      ).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${getStatusColor(
                    consultation.status
                  )}`}
                >
                  {getStatusText(consultation.status)}
                </span>
              </td>
              <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-center gap-2">
                  {consultation.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => onAccept(consultation.consultation_id)}
                        className="px-3 py-1.5 text-xs font-semibold bg-green-500 text-white rounded-lg hover:bg-green-600 hover:shadow-md transition-all"
                      >
                        Terima
                      </button>
                      <button
                        onClick={() => onDecline(consultation)}
                        className="px-3 py-1.5 text-xs font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 hover:shadow-md transition-all"
                      >
                        Tolak
                      </button>
                    </>
                  )}
                  {consultation.status === "ACCEPTED" && (
                    <>
                      <button
                        onClick={() => onReschedule(consultation)}
                        className="px-3 py-1.5 text-xs font-semibold bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 hover:shadow-md transition-all"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => onCancel(consultation.consultation_id)}
                        className="px-3 py-1.5 text-xs font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 hover:shadow-md transition-all"
                      >
                        Batalkan
                      </button>
                    </>
                  )}
                </div>
              </td>
              <td className="px-4 py-4">
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ConsultationTable;
