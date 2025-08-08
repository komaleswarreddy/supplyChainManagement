import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { FormFieldWrapper } from "./form-field-wrapper";
import { useFormContext } from "react-hook-form";

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label: string;
  description?: string;
}

export function FormTextarea({
  name,
  label,
  description,
  className,
  ...props
}: FormTextareaProps) {
  const { register } = useFormContext();

  return (
    <FormFieldWrapper name={name} label={label} description={description} className={className}>
      <Textarea 
        {...props}
        // Ensure proper value handling
        defaultValue={props.defaultValue || ''}
      />
    </FormFieldWrapper>
  );
}