import Select from "react-select";

type OptionType = {
  value: string | number;
  label: string;
};

interface DropdownListProps {
  value: OptionType | null;
  onChange: (value: OptionType | null) => void;
  options: OptionType[];
  placeholder?: string;
  error?: string;
  className?: string;
}

export default function DropdownList({
  value,
  onChange,
  options,
  placeholder = "Pilih...",
  error,
  className = "",
}: DropdownListProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <Select
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        classNames={{
          control: () => "rounded-full text-lg shadow-md",
          menu: () => "rounded-full shadow-md z-20",
        }}
        styles={{
          control: (base, state) => ({
            ...base,
            borderColor: error ? "#ef4444" : "white",
            minHeight: "40px",
            borderRadius: "full",
            paddingTop: "9px",
            paddingBottom: "9px",
            paddingLeft: "6px",
            paddingRight: "6px",
            backgroundColor: document.documentElement.classList.contains("dark")
              ? "#4B5563"
              : "white",
            color: document.documentElement.classList.contains("dark")
              ? "white"
              : "#111827",
          }),
          placeholder: (base) => ({
            ...base,
            color: document.documentElement.classList.contains("dark")
              ? "#9CA3AF"
              : "gray",
          }),
          singleValue: (base) => ({
            ...base,
            color: document.documentElement.classList.contains("dark")
              ? "white"
              : "#111827",
          }),
          menu: (base) => ({
            ...base,
            backgroundColor: document.documentElement.classList.contains("dark")
              ? "#374151"
              : "white",
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused
              ? document.documentElement.classList.contains("dark")
                ? "#4B5563"
                : "#E5E7EB"
              : document.documentElement.classList.contains("dark")
              ? "#374151"
              : "white",
            color: document.documentElement.classList.contains("dark")
              ? "white"
              : "#111827",
            ":active": {
              backgroundColor: document.documentElement.classList.contains(
                "dark"
              )
                ? "#1F2937"
                : "#D1D5DB",
            },
          }),
          valueContainer: (base) => ({
            ...base,
          }),
        }}
        isSearchable={false}
      />
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
