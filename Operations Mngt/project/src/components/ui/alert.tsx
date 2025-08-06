import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  icon?: React.ReactNode;
}

const variantIcon = {
  default: Info,
  destructive: XCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
};

const variantClass = {
  default: "bg-blue-50 text-blue-900 border-blue-200",
  destructive: "bg-red-50 text-red-900 border-red-200",
  success: "bg-green-50 text-green-900 border-green-200",
  warning: "bg-yellow-50 text-yellow-900 border-yellow-200",
  info: "bg-blue-50 text-blue-900 border-blue-200",
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", icon, children, ...props }, ref) => {
    const Icon = icon || variantIcon[variant] || Info;
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-lg border p-4 flex items-start gap-3",
          variantClass[variant],
          className
        )}
        {...props}
      >
        <span className="mt-0.5">
          <Icon className="h-5 w-5" />
        </span>
        <div className="flex-1">{children}</div>
      </div>
    );
  }
);
Alert.displayName = "Alert";

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm leading-relaxed", className)} {...props} />
  )
);
AlertDescription.displayName = "AlertDescription";

export default Alert; 