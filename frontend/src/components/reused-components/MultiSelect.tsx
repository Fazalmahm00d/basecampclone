import { useState } from "react";
import Select, { MultiValue } from "react-select";

interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[]; // Store only the value (IDs)
  onChange: (selectedValues: string[]) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ options, value, onChange }) => {
  // Convert selected value IDs into option objects
  const selectedOptions = options.filter((option) => value.includes(option.value));

  return (
    <Select
      options={options}
      isMulti
      value={selectedOptions}
      onChange={(selected) => onChange(selected.map((option) => option.value))}
      placeholder="Select members"
      className="w-full"
      styles={{
        control: (base) => ({
          ...base,
          borderColor: "hsl(220, 13%, 91%)",
          "&:hover": { borderColor: "hsl(220, 13%, 80%)" },
        }),
      }}
    />
  );
};

export default MultiSelect;
