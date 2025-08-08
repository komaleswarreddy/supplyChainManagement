import React from "react";
import { Input } from "@/components/ui/input";
import { FormFieldWrapper } from "./form-field-wrapper";
import { useFormContext } from "react-hook-form";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  description?: string;
}

export function FormInput({ name, label, description, className, ...props }: FormInputProps) {
  console.log(`FormInput: Rendering field "${name}"`);
  
  try {
    const { register } = useFormContext();
    console.log(`FormInput: Form context available for "${name}"`);

    return (
      <FormFieldWrapper name={name} label={label} description={description} className={className}>
        <Input 
          {...props}
          // Ensure proper value handling
          defaultValue={props.defaultValue || ''}
        />
      </FormFieldWrapper>
    );
  } catch (error) {
    console.error(`FormInput: Error rendering field "${name}":`, error);
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="text-sm font-medium text-red-800">FormInput Error</div>
        <div className="text-xs text-red-700">Field: {name} - {error instanceof Error ? error.message : 'Unknown error'}</div>
      </div>
    );
  }
}