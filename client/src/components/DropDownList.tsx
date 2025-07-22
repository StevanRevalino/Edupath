import React from "react";

type DropdownOption = {
  value: string | number;
  label: string;
};

interface DropdownListProps {
  label?: string;
  options: DropdownOption[];
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  error?: string;
  placeholder?: string;
  className?: string;
}

export default function DropdownList({
  options,
  value,
  onChange,
  error,
  placeholder,
  className,
}: DropdownListProps) {
  return (
    <div className="flex flex-col mt-2">
      <select
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 rounded-md bg-white text-sm border ${
          value == "" ? "text-gray-500" : "text-black"
        } border-gray-300 ${className || ""}`}
      >
        <option value="" disabled selected hidden>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
