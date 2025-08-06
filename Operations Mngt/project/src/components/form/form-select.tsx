import React from "react";
import { SimpleSelect } from "@/components/ui/select";
import { FormFieldWrapper } from "./form-field-wrapper";
import { useFormContext } from "react-hook-form";

interface Option {
  label: string;
  value: string | number;
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  label: string;
  description?: string;
  options: Option[];
  placeholder?: string;
}

export function FormSelect({
  name,
  label,
  description,
  options,
  placeholder,
  className,
  onChange,
  ...props
}: FormSelectProps) {
  const { setValue, register } = useFormContext();
  
  if (!register || !setValue) {
    console.error(`FormSelect: No form context found for field "${name}". Make sure this component is used within a FormProvider.`);
    return null;
  }
  
  // Handle both the form context and any custom onChange handler
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(name, e.target.value, { shouldValidate: true });
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <FormFieldWrapper name={name} label={label} description={description} className={className}>
      <SimpleSelect 
        {...register(name)}
        onChange={handleChange}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SimpleSelect>
    </FormFieldWrapper>
  );
}