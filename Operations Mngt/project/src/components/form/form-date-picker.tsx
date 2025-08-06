import React, { useEffect } from "react";
import DatePicker from "react-datepicker";
import { useFormContext } from "react-hook-form";
import { FormFieldWrapper } from "./form-field-wrapper";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import "react-datepicker/dist/react-datepicker.css";

interface FormDatePickerProps {
  name: string;
  label: string;
  description?: string;
  minDate?: Date;
  maxDate?: Date;
  showTimeSelect?: boolean;
  dateFormat?: string;
  className?: string;
  placeholderText?: string;
  disabled?: boolean;
  isClearable?: boolean;
}

export function FormDatePicker({
  name,
  label,
  description,
  minDate,
  maxDate,
  showTimeSelect = false,
  dateFormat = "MM/dd/yyyy",
  className,
  placeholderText = "Select date",
  disabled,
  isClearable = false,
}: FormDatePickerProps) {
  const { getValues, setValue, register } = useFormContext();
  
  if (!getValues || !setValue || !register) {
    console.error(`FormDatePicker: No form context found for field "${name}". Make sure this component is used within a FormProvider.`);
    return null;
  }
  
  // Register the field to ensure it's part of form validation
  useEffect(() => {
    register(name);
  }, [register, name]);

  return (
    <FormFieldWrapper name={name} label={label} description={description} className={className}>
      <div className="relative">
        <DatePicker
          selected={getValues(name)}
          onChange={(date) => setValue(name, date, { shouldValidate: true, shouldDirty: true })}
          minDate={minDate}
          maxDate={maxDate}
          showTimeSelect={showTimeSelect}
          dateFormat={dateFormat}
          placeholderText={placeholderText}
          disabled={disabled}
          isClearable={isClearable}
          className={cn(
            "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          customInput={
            <div className="relative w-full">
              <input className="w-full pr-10" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                tabIndex={-1}
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
          }
        />
      </div>
    </FormFieldWrapper>
  );
}