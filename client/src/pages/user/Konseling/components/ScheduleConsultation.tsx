import { Plus } from "lucide-react";

interface ScheduleConsultationProps {
  onSchedule: () => void;
  hasPending?: boolean;
}

const ScheduleConsultation = ({
  onSchedule,
  hasPending = false,
}: ScheduleConsultationProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Jadwalkan Konseling
      </h3>

      {hasPending && (
        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⏳ Anda masih memiliki konsultasi yang sedang aktif. Harap
            selesaikan konsultasi tersebut terlebih dahulu.
          </p>
        </div>
      )}

      <button
        onClick={onSchedule}
        disabled={hasPending}
        className="w-full bg-gray-100 border-2 border-dashed border-[#00437A] rounded-tl-3xl rounded-br-3xl p-6 hover:bg-gray-100 transition-colors flex items-center justify-center text-gray-600 gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
        title={hasPending ? "Tunggu hingga konsultasi sebelumnya diproses" : ""}
      >
        <div className="p-2 lg:p-4 bg-[#E9E9E9] rounded-md flex">
          <Plus
            size={24}
            className="lg:hidden text-[#7E7E7E]"
            strokeWidth={2}
          />
          <Plus
            size={32}
            className="hidden lg:block text-[#7E7E7E]"
            strokeWidth={2}
          />
        </div>
        <span className="text-sm lg:text-base">
          Jadwalkan sesi bimbingan konseling baru...
        </span>
      </button>
    </div>
  );
};

export default ScheduleConsultation;
