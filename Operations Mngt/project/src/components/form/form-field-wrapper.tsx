import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";

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
  const { control } = useFormContext();

  if (!control) {
    console.error(`FormFieldWrapper: No form context found for field "${name}". Make sure this component is used within a FormProvider.`);
    return null;
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("space-y-2", className)}>
          <FormLabel className={cn("text-sm font-medium", labelClassName)}>
            {label}
          </FormLabel>
          <FormControl>
            {React.isValidElement(children)
              ? React.cloneElement(children, {
                  ...field,
                  ...children.props,
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
      )}
    />
  );
}