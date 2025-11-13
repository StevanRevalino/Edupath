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
          control: (base) => ({
            ...base,
            borderColor: error ? "#ef4444" : "white",
            minHeight: "40px",
            borderRadius: "full",
            paddingTop: "9px",
            paddingBottom: "9px",
            paddingLeft: "6px",
            paddingRight: "6px",
          }),
          placeholder: (base) => ({
            ...base,
            color: "gray",
          }),
          valueContainer: (base) => ({
            ...base,
          }),
        }}
        isSearchable={false}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
