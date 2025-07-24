import React from "react";
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
    <div className={`flex flex-col mt-2 ${className}`}>
      <Select
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        classNames={{
          control: () => "rounded-md text-sm",
          menu: () => "rounded-md shadow-md mt-1 z-20",
        }}
        styles={{
          control: (base) => ({
            ...base,
            borderColor: error ? "#ef4444" : "#ffffff",
            minHeight: "40px",
          }),
          placeholder: (base) => ({
            ...base,
            color: "#757575", // Tailwind gray-400
          }),
          valueContainer: (base) => ({
            ...base,
            marginLeft: "0.3rem",
          }),
        }}
        isSearchable={false}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
