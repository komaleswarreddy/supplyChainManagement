import React, { useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FormFieldWrapper } from "./form-field-wrapper";
import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";

interface FormCheckboxProps extends React.ComponentPropsWithoutRef<typeof Checkbox> {
  name: string;
  label: string;
  description?: string;
  checkboxLabel?: string;
  className?: string;
  wrapperClassName?: string;
  value?: string;
}

export function FormCheckbox({
  name,
  label,
  description,
  checkboxLabel,
  className,
  wrapperClassName,
  value,
  ...props
}: FormCheckboxProps) {
  const { getValues, setValue, register } = useFormContext();
  
  // Handle array values (for multiple checkboxes with the same name)
  const handleCheckboxChange = (checked: boolean) => {
    if (value) {
      const currentValues = getValues(name) || [];
      
      if (Array.isArray(currentValues)) {
        if (checked) {
          setValue(name, [...currentValues, value], { shouldValidate: true });
        } else {
          setValue(
            name, 
            currentValues.filter((val: string) => val !== value),
            { shouldValidate: true }
          );
        }
      } else {
        setValue(name, checked ? [value] : [], { shouldValidate: true });
      }
    } else {
      setValue(name, checked, { shouldValidate: true });
    }
  };
  
  // Determine if checkbox is checked
  const isChecked = () => {
    const currentValues = getValues(name);
    
    if (value) {
      return Array.isArray(currentValues) ? currentValues.includes(value) : false;
    }
    
    return !!currentValues;
  };
  
  // Register the field to ensure it's part of form validation
  useEffect(() => {
    register(name);
  }, [register, name]);

  return (
    <FormFieldWrapper
      name={name}
      label={label}
      description={description}
      className={cn("flex flex-row items-start space-x-3 space-y-0 p-4", wrapperClassName)}
    >
      <div className="flex items-center space-x-2">
        <Checkbox 
          className={className} 
          checked={isChecked()}
          onCheckedChange={handleCheckboxChange}
          value={value}
          {...props} 
        />
        {checkboxLabel && (
          <label
            htmlFor={name}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {checkboxLabel}
          </label>
        )}
      </div>
    </FormFieldWrapper>
  );
}