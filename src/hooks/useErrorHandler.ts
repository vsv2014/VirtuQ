import { useState, useCallback } from 'react';

interface ErrorState {
  message: string;
  code?: string;
  details?: unknown;
}

export const useErrorHandler = (initialError: ErrorState | null = null) => {
  const [error, setError] = useState<ErrorState | null>(initialError);

  const handleError = useCallback((error: unknown) => {
    if (error instanceof Error) {
      setError({
        message: error.message,
        details: error,
      });
    } else if (typeof error === 'string') {
      setError({
        message: error,
      });
    } else {
      setError({
        message: 'An unexpected error occurred',
        details: error,
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    setError,
    handleError,
    clearError,
  };
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};
