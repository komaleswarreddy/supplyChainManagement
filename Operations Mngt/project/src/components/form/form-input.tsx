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
  const { register } = useFormContext();
  
  if (!register) {
    console.error(`FormInput: No form context found for field "${name}". Make sure this component is used within a FormProvider.`);
    return null;
  }

  return (
    <FormFieldWrapper name={name} label={label} description={description} className={className}>
      <Input {...register(name)} {...props} />
    </FormFieldWrapper>
  );
}