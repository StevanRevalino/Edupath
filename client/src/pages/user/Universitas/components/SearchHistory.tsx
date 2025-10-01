import React from "react";

interface SearchHistoryProps {
  searches: string[];
  onSearchClick: (term: string) => void;
  onRemove: (term: string) => void;
  onClearAll: () => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({
  searches,
  onSearchClick,
  onRemove,
  onClearAll,
}) => {
  return (
    <div className="mt-6 sm:mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl sm:text-2xl font-extrabold text-[#0B0B0B]">
          Pencarian terakhir
        </h3>
        {searches.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs sm:text-sm underline text-gray-500 hover:text-gray-700 transition-colors"
          >
            Hapus riwayat
          </button>
        )}
      </div>

      <ul className="divide-y divide-gray-100 bg-white rounded-lg border border-gray-100">
        {searches.length === 0 ? (
          <li className="px-4 py-3 sm:py-4 text-gray-400 text-sm sm:text-base">
            Belum ada riwayat
          </li>
        ) : (
          searches.map((term) => (
            <li
              key={term}
              className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <button
                type="button"
                className="text-left text-sm sm:text-[15px] text-gray-800 hover:text-blue-600 hover:underline flex-1 truncate pr-2 transition-colors"
                onClick={() => onSearchClick(term)}
              >
                {term}
              </button>
              <button
                type="button"
                onClick={() => onRemove(term)}
                className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl leading-none flex-shrink-0 w-6 h-6 flex items-center justify-center transition-colors"
                aria-label={`Hapus ${term}`}
                title="Hapus"
              >
                ×
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default SearchHistory;
