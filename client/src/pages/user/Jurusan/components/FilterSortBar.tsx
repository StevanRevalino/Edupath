import React, { useState } from "react";
import { ChevronDown, Filter, X } from "lucide-react";

interface FilterSortBarProps {
  // Filter states
  selectedJenjang: string;
  onJenjangChange: (value: string) => void;
  selectedAkreditasi: string;
  onAkreditasiChange: (value: string) => void;

  // Data untuk dropdown options
  jenjangOptions: string[];
  akreditasiOptions: string[];

  // Callbacks
  onReset: () => void;
}

const FilterSortBar: React.FC<FilterSortBarProps> = ({
  selectedJenjang,
  onJenjangChange,
  selectedAkreditasi,
  onAkreditasiChange,
  jenjangOptions,
  akreditasiOptions,
  onReset,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const akreditasiAllOptions = ["Semua", "Unggul", "Baik Sekali", "Baik"];

  // Count active filters
  const activeFilterCount = [
    selectedJenjang !== "Semua",
    selectedAkreditasi !== "Semua",
  ].filter(Boolean).length;

  return (
    <div className="mb-4">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium transition-all ${
            showFilters
              ? "bg-secondary-light border-secondary text-primary-dark"
              : "bg-white border-gray-300 text-gray-700 hover:border-blue-400"
          }`}
        >
          <Filter size={18} />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 bg-primary text-white text-xs rounded-full px-2 py-0.5">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            size={16}
            className={`transition-transform ${
              showFilters ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Reset Button */}
        {activeFilterCount > 0 && (
          <button
            onClick={onReset}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 border-2 border-red-300 text-red-700 rounded-lg text-sm font-medium transition-colors"
          >
            <X size={16} />
            Reset
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Filter size={16} />
            Filter Pencarian
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Jenjang Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Jenjang
              </label>
              <select
                value={selectedJenjang}
                onChange={(e) => onJenjangChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="Semua">Semua Jenjang</option>
                {jenjangOptions.map((jenjang) => (
                  <option key={jenjang} value={jenjang}>
                    {jenjang}
                  </option>
                ))}
              </select>
            </div>

            {/* Akreditasi Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Akreditasi
              </label>
              <select
                value={selectedAkreditasi}
                onChange={(e) => onAkreditasiChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              >
                {akreditasiAllOptions.map((akred) => (
                  <option key={akred} value={akred}>
                    {akred}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Summary */}
          {activeFilterCount > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                <span className="font-semibold">{activeFilterCount}</span>{" "}
                filter aktif
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterSortBar;
