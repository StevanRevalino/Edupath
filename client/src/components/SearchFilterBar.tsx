interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  filterLabel?: string;
  filterWidth?: string;
  className?: string;
}

const SearchFilterBar = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Cari...",
  filterValue,
  onFilterChange,
  filterOptions = [],
  filterLabel,
  filterWidth = "lg:w-40",
  className = "",
}: SearchFilterBarProps) => {
  return (
    <div
      className={`bg-white rounded-lg shadow p-3 sm:p-4 mb-3 sm:mb-4 flex-shrink-0 ${className}`}
    >
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {filterOptions.length > 0 && onFilterChange && (
          <div className={filterWidth}>
            {filterLabel && (
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {filterLabel}
              </label>
            )}
            <select
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0"
              value={filterValue}
              onChange={(e) => onFilterChange(e.target.value)}
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilterBar;
