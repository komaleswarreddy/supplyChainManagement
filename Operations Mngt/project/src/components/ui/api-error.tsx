import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './alert';

interface ApiErrorProps {
  message?: string;
  statusCode?: number;
  details?: string;
  className?: string;
}

export const ApiError: React.FC<ApiErrorProps> = ({
  message = 'An unexpected error occurred.',
  statusCode,
  details,
  className = ''
}) => {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error {statusCode ? `(${statusCode})` : ''}</AlertTitle>
      <AlertDescription>
        {message}
        {details && <p className="mt-2 text-sm opacity-80">{details}</p>}
      </AlertDescription>
    </Alert>
  );
};

export default ApiError;


