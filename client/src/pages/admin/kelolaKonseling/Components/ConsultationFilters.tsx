import type { FC } from "react";

interface ConsultationFiltersProps {
  activeTab: "pending" | "active" | "completed" | "declined";
  setActiveTab: (tab: "pending" | "active" | "completed" | "declined") => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  counts: {
    pending: number;
    active: number;
    completed: number;
    declined: number;
  };
}

const ConsultationFilters: FC<ConsultationFiltersProps> = ({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  counts,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
      {/* Tab Navigation with Inline Stats */}
      <div className="grid grid-cols-4">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-5 transition-all duration-200 relative ${
            activeTab === "pending"
              ? "bg-gradient-to-b from-blue-50 to-white"
              : "bg-gray-50 hover:bg-gray-100"
          }`}
        >
          <div className="flex flex-col items-center space-y-1.5">
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${
                activeTab === "pending" ? "text-yellow-700" : "text-gray-500"
              }`}
            >
              Pending
            </span>
            <span
              className={`text-3xl font-bold transition-colors ${
                activeTab === "pending" ? "text-yellow-600" : "text-gray-400"
              }`}
            >
              {counts.pending}
            </span>
          </div>
          {activeTab === "pending" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
          )}
        </button>

        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-5 transition-all duration-200 relative ${
            activeTab === "active"
              ? "bg-gradient-to-b from-blue-50 to-white"
              : "bg-gray-50 hover:bg-gray-100"
          }`}
        >
          <div className="flex flex-col items-center space-y-1.5">
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${
                activeTab === "active" ? "text-blue-700" : "text-gray-500"
              }`}
            >
              Active
            </span>
            <span
              className={`text-3xl font-bold transition-colors ${
                activeTab === "active" ? "text-blue-600" : "text-gray-400"
              }`}
            >
              {counts.active}
            </span>
          </div>
          {activeTab === "active" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>
          )}
        </button>

        <button
          onClick={() => setActiveTab("completed")}
          className={`px-4 py-5 transition-all duration-200 relative ${
            activeTab === "completed"
              ? "bg-gradient-to-b from-green-50 to-white"
              : "bg-gray-50 hover:bg-gray-100"
          }`}
        >
          <div className="flex flex-col items-center space-y-1.5">
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${
                activeTab === "completed" ? "text-green-700" : "text-gray-500"
              }`}
            >
              Completed
            </span>
            <span
              className={`text-3xl font-bold transition-colors ${
                activeTab === "completed" ? "text-green-600" : "text-gray-400"
              }`}
            >
              {counts.completed}
            </span>
          </div>
          {activeTab === "completed" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500"></div>
          )}
        </button>

        <button
          onClick={() => setActiveTab("declined")}
          className={`px-4 py-5 transition-all duration-200 relative ${
            activeTab === "declined"
              ? "bg-gradient-to-b from-red-50 to-white"
              : "bg-gray-50 hover:bg-gray-100"
          }`}
        >
          <div className="flex flex-col items-center space-y-1.5">
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${
                activeTab === "declined" ? "text-red-700" : "text-gray-500"
              }`}
            >
              Declined
            </span>
            <span
              className={`text-3xl font-bold transition-colors ${
                activeTab === "declined" ? "text-red-600" : "text-gray-400"
              }`}
            >
              {counts.declined}
            </span>
          </div>
          {activeTab === "declined" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500"></div>
          )}
        </button>
      </div>

      {/* Integrated Search Bar */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="relative">
          <svg
            className="absolute left-3.5 top-3 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Cari nama murid atau topik konseling..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultationFilters;
