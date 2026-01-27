import { type TesSession } from "./InfoTes";

interface TesCardProps {
  tesSession: TesSession;
  index: number;
  totalTests: number;
  isSelected?: boolean;
  onClick: (tesSession: TesSession) => void;
}

const TesCard = ({ tesSession, index, totalTests, isSelected, onClick }: TesCardProps) => {
  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Tes telah selesai";
      case "IN_PROGRESS":
        return "Sedang berlangsung";
      case "SCHEDULED":
        return "Terjadwal";
      default:
        return "Dibatalkan";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-600";
      case "IN_PROGRESS":
        return "bg-primary";
      case "SCHEDULED":
        return "bg-yellow-600";
      default:
        return "bg-red-600";
    }
  };

  return (
    <div
      onClick={() => onClick(tesSession)}
      className={`border-2 rounded-tl-3xl rounded-br-3xl p-4 transition-colors cursor-pointer ${
        isSelected
          ? "bg-secondary-light border-secondary"
          : "bg-secondary-lighter border-primary-dark hover:bg-secondary-light"
      } min-h-[125px]`}
    >
      <div className="flex justify-between items-start mb-2">
        <span
          className={`text-white text-xs font-semibold px-2 py-1 rounded ${getStatusColor(
            tesSession.status
          )}`}
        >
          {getStatusText(tesSession.status)}
        </span>
      </div>
      <h4 className="font-semibold text-gray-800 mb-1">Test {totalTests - index}</h4>
      <p className="text-xs text-gray-600">
        {new Date(tesSession.test_date).toLocaleDateString("id-ID")} -{" "}
        {new Date(tesSession.test_date).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
};

export default TesCard;
