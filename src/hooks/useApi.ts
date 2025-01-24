import { useState, useCallback } from 'react';

interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

interface UseApiOptions {
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {}
) {
  const [state, setState] = useState<ApiResponse<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setState({ data: null, error: null, loading: true });
        const response = await apiFunction(...args);
        setState({ data: response, error: null, loading: false });
        options.onSuccess?.(response);
        return response;
      } catch (error) {
        const errorObject = error instanceof Error ? error : new Error('An unknown error occurred');
        setState({ data: null, error: errorObject, loading: false });
        options.onError?.(errorObject);
        throw errorObject;
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, loading: false });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Helper function to format error messages
export function formatErrorMessage(error: Error): string {
  if (error.message.includes('Network Error')) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  
  if (error.message.includes('404')) {
    return 'The requested resource was not found.';
  }
  
  if (error.message.includes('401')) {
    return 'You are not authorized to access this resource.';
  }
  
  if (error.message.includes('403')) {
    return 'Access forbidden. You don\'t have permission to access this resource.';
  }
  
  if (error.message.includes('500')) {
    return 'An internal server error occurred. Please try again later.';
  }
  
  return 'An unexpected error occurred. Please try again later.';
}
