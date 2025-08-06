import React from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-6", className)}>
      {(title || description) && (
        <div className="mb-6">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {description && (
            <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2">{children}</div>
    </div>
  );
}