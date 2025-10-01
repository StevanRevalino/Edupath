import React from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder: string;
  canSearch: boolean;
  loading: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder,
  canSearch,
  loading,
  inputRef,
}) => {
  return (
    <form onSubmit={onSubmit} className="my-4">
      <div className="flex w-full items-center gap-2">
        <div className="relative flex-1">
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
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-full bg-neutral-200 text-gray-800 placeholder-gray-400 pl-10 sm:pl-14 pr-4 sm:pr-5 py-2.5 sm:py-3 text-sm sm:text-base shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
        </div>

        <button
          type="submit"
          disabled={!canSearch || loading}
          className="rounded-full px-4 sm:px-6 py-2.5 sm:py-3 bg-sky-600 text-white font-semibold text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-95 transition-all"
        >
          {loading ? "Mencari…" : "Telusuri"}
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
