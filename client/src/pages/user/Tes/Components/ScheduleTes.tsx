import { Plus } from "lucide-react";

interface ScheduleTesProps {
  onSchedule: () => void;
}

const ScheduleTes = ({ onSchedule }: ScheduleTesProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Jadwalkan Tes Minat & Bakat
      </h3>
      <button
        onClick={onSchedule}
        className="w-full bg-gray-100 border-2 border-dashed border-primary-dark rounded-tl-3xl rounded-br-3xl p-6 hover:bg-gray-100 transition-colors flex items-center justify-center text-gray-600 gap-2 cursor-pointer"
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
          Jadwalkan sesi tes minat dan bakat baru...
        </span>
      </button>
    </div>
  );
};

export default ScheduleTes;
