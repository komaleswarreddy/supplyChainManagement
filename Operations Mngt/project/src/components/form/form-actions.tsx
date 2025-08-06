import React from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface FormActionsProps {
  submitText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
  showReset?: boolean;
  resetText?: string;
  className?: string;
  submitProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  cancelProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  resetProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

export function FormActions({
  submitText = "Submit",
  cancelText = "Cancel",
  isSubmitting = false,
  onCancel,
  showReset = false,
  resetText = "Reset",
  className = "flex items-center gap-4",
  submitProps,
  cancelProps,
  resetProps,
}: FormActionsProps) {
  const { formState, reset } = useFormContext();

  if (!formState) {
    console.error("FormActions: No form context found. Make sure this component is used within a FormProvider.");
    return null;
  }

  return (
    <div className={className}>
      <Button
        type="submit"
        disabled={isSubmitting || !formState.isDirty}
        className="min-w-[120px]"
        {...submitProps}
      >
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Submitting...
          </>
        ) : (
          submitText
        )}
      </Button>
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          {...cancelProps}
        >
          {cancelText}
        </Button>
      )}
      {showReset && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => reset()}
          disabled={!formState.isDirty}
          {...resetProps}
        >
          {resetText}
        </Button>
      )}
    </div>
  );
}