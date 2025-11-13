import { Plus } from "lucide-react";
import toast from "react-hot-toast";

interface ScheduleConsultationProps {
  onSchedule: () => void;
  hasPending?: boolean;
}

const ScheduleConsultation = ({
  onSchedule,
  hasPending = false,
}: ScheduleConsultationProps) => {
  const handleClick = () => {
    if (hasPending) {
      toast.error(
        "Anda masih memiliki konsultasi yang sedang aktif. Harap selesaikan konsultasi tersebut terlebih dahulu."
      );
    } else {
      onSchedule();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Jadwalkan Konseling
      </h3>

      <button
        onClick={handleClick}
        className="w-full bg-gray-100 border-2 border-dashed border-primary-dark rounded-tl-3xl rounded-br-3xl p-6 hover:bg-gray-50 transition-colors flex items-center justify-center text-gray-600 gap-2 cursor-pointer"
      >
        <div className="p-2 lg:p-4 bg-gray-200 rounded-md flex">
          <Plus
            size={24}
            className="lg:hidden text-gray-500"
            strokeWidth={2}
          />
          <Plus
            size={32}
            className="hidden lg:block text-gray-500"
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
