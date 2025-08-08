import React from "react";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useFormContext, Controller } from "react-hook-form";

interface FormFieldWrapperProps {
  name: string;
  label: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
  labelClassName?: string;
  descriptionClassName?: string;
  messageClassName?: string;
}

export function FormFieldWrapper({
  name,
  label,
  description,
  className,
  children,
  labelClassName,
  descriptionClassName,
  messageClassName,
}: FormFieldWrapperProps) {
  console.log(`FormFieldWrapper: Rendering field "${name}"`);
  
  try {
    const { control } = useFormContext();
    console.log(`FormFieldWrapper: Form context available for "${name}"`);

    if (!control) {
      console.error(`FormFieldWrapper: No form context found for field "${name}". Make sure this component is used within a FormProvider.`);
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="text-sm font-medium text-red-800">Form Context Error</div>
          <div className="text-xs text-red-700">Field: {name} - No form context available</div>
        </div>
      );
    }

    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => {
          console.log(`FormFieldWrapper: Field "${name}" render called with value:`, field.value);
          
          return (
            <FormItem className={cn("space-y-2", className)}>
              <FormLabel className={cn("text-sm font-medium", labelClassName)}>
                {label}
              </FormLabel>
              <FormControl>
                {React.isValidElement(children)
                  ? React.cloneElement(children, {
                      ...field,
                      ...children.props,
                      // Ensure the value is properly passed
                      value: field.value || '',
                    })
                  : children}
              </FormControl>
              {description && (
                <FormDescription className={cn("text-xs text-muted-foreground", descriptionClassName)}>
                  {description}
                </FormDescription>
              )}
              <FormMessage className={cn("text-xs text-destructive", messageClassName)} />
            </FormItem>
          );
        }}
      />
    );
  } catch (error) {
    console.error(`FormFieldWrapper: Error rendering field "${name}":`, error);
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="text-sm font-medium text-red-800">Rendering Error</div>
        <div className="text-xs text-red-700">Field: {name} - {error instanceof Error ? error.message : 'Unknown error'}</div>
      </div>
    );
  }
}