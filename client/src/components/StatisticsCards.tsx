interface StatisticCardProps {
  label: string;
  value: number | string;
  color?: "default" | "yellow" | "green" | "red" | "blue";
}

interface StatisticsCardsProps {
  statistics: StatisticCardProps[];
  className?: string;
}

const StatisticsCards = ({
  statistics,
  className = "",
}: StatisticsCardsProps) => {
  const getColorClass = (color: StatisticCardProps["color"]) => {
    switch (color) {
      case "yellow":
        return "text-yellow-600";
      case "green":
        return "text-green-600";
      case "red":
        return "text-red-600";
      case "blue":
        return "text-primary";
      default:
        return "text-gray-800";
    }
  };

  return (
    <div
      className={`grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 mb-3 sm:mb-4 flex-shrink-0 ${className}`}
    >
      {statistics.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-2 sm:p-3">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1 font-bold">{stat.label}</p>
            <p className={`text-lg font-bold ${getColorClass(stat.color)}`}>
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatisticsCards;
