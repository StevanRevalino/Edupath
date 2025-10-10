import React, { useState, useRef, useEffect } from "react";
import { Clock, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder: string;
  canSearch: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  // Search history props
  recentSearches?: string[];
  onSearchClick?: (term: string) => void;
  onRemoveHistory?: (term: string) => void;
  onClearAllHistory?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder,
  canSearch,
  inputRef,
  recentSearches = [],
  onSearchClick,
  onRemoveHistory,
  onClearAllHistory,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isUserInteractionRef = useRef(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputFocus = () => {
    // Only show dropdown if user manually clicked/focused (not programmatic)
    if (
      recentSearches.length > 0 &&
      !value.trim() &&
      isUserInteractionRef.current
    ) {
      setShowDropdown(true);
    }
    // Reset flag after check
    isUserInteractionRef.current = false;
  };

  const handleInputClick = () => {
    // Mark as user interaction when user clicks
    isUserInteractionRef.current = true;
    if (recentSearches.length > 0 && !value.trim()) {
      setShowDropdown(true);
    }
  };

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    if (newValue.trim()) {
      setShowDropdown(false);
    } else if (recentSearches.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleHistoryClick = (term: string) => {
    setShowDropdown(false);
    if (onSearchClick) {
      onSearchClick(term);
    }
  };

  return (
    <div ref={dropdownRef} className="relative my-4">
      <form onSubmit={onSubmit}>
        <div className="flex w-full items-center gap-2">
          <div className="relative flex-1">
            {/* Search Icon */}
            <span className="pointer-events-none absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 opacity-40">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="sm:w-6 sm:h-6"
              >
                <path
                  d="M21 21l-4.35-4.35"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </span>

            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={handleInputFocus}
              onClick={handleInputClick}
              placeholder={placeholder}
              className="w-full rounded-full bg-neutral-200 text-gray-800 placeholder-gray-400 pl-10 sm:pl-14 pr-4 sm:pr-5 py-2.5 sm:py-3 text-sm sm:text-base shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>

          <button
            type="submit"
            disabled={!canSearch}
            className="rounded-full px-4 sm:px-6 py-2.5 sm:py-3 bg-sky-600 text-white font-semibold text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-95 transition-all"
          >
            Telusuri
          </button>
        </div>
      </form>

      {/* Search History Dropdown (Google-style) */}
      {showDropdown && recentSearches.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-64 overflow-y-auto z-50">
          <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Pencarian Terakhir
            </span>
            {onClearAllHistory && (
              <button
                onClick={onClearAllHistory}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Hapus Semua
              </button>
            )}
          </div>
          <div className="py-1">
            {recentSearches.map((term, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 cursor-pointer group"
              >
                <div
                  onClick={() => handleHistoryClick(term)}
                  className="flex items-center gap-3 flex-1"
                >
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{term}</span>
                </div>
                {onRemoveHistory && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveHistory(term);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-full transition-opacity"
                  >
                    <X className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
