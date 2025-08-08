import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/useToast';
import { FormActions } from './form-actions';
import { cn } from '@/lib/utils';

interface FormContainerProps<T extends z.ZodType> {
  title?: string;
  description?: string;
  schema: T;
  defaultValues?: z.infer<T>;
  onSubmit: (values: z.infer<T>) => Promise<void> | void;
  submitText?: string;
  cancelText?: string;
  showReset?: boolean;
  resetText?: string;
  onCancel?: () => void;
  className?: string;
  children: ((methods: ReturnType<typeof useForm>) => React.ReactNode) | React.ReactNode;
}

export function FormContainer<T extends z.ZodType>({
  title,
  description,
  schema,
  defaultValues,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  showReset = false,
  resetText = 'Reset',
  onCancel,
  className,
  children,
}: FormContainerProps<T>) {
  const { toast } = useToast();
  
  // Add debugging for form initialization
  console.log('FormContainer: Initializing form with defaultValues:', defaultValues);

  const methods = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onBlur',
  });

  const handleSubmit = async (values: z.infer<T>) => {
    try {
      console.log('FormContainer: Submitting form with values:', values);
      await onSubmit(values);
      toast.success('Form submitted successfully');
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {(title || description) && (
        <div className="space-y-2">
          {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-6">
            {typeof children === 'function' ? children(methods) : children}
          </div>

          <FormActions
            submitText={submitText}
            cancelText={cancelText}
            showReset={showReset}
            resetText={resetText}
            onCancel={onCancel}
            isSubmitting={methods.formState.isSubmitting}
          />
        </form>
      </FormProvider>
    </div>
  );
}