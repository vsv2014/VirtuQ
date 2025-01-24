import { useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { useLoading } from '@/context/LoadingContext';

interface AsyncActionOptions {
  successMessage?: string;
  errorMessage?: string;
  showLoadingToast?: boolean;
}

export function useAsyncAction<T>(
  asyncFn: (...args: any[]) => Promise<T>,
  options: AsyncActionOptions = {}
) {
  const [error, setError] = useState<Error | null>(null);
  const { showToast } = useToast();
  const { startLoading, stopLoading } = useLoading();

  const execute = async (...args: any[]): Promise<T | undefined> => {
    try {
      setError(null);
      startLoading();
      
      if (options.showLoadingToast) {
        showToast('Processing...', 'info');
      }

      const result = await asyncFn(...args);

      if (options.successMessage) {
        showToast(options.successMessage, 'success');
      }

      return result;
    } catch (err) {
      const errorMessage = options.errorMessage || 
        (err instanceof Error ? err.message : 'An error occurred');
      showToast(errorMessage, 'error');
      setError(err instanceof Error ? err : new Error(errorMessage));
      return undefined;
    } finally {
      stopLoading();
    }
  };

  return {
    execute,
    error,
    setError,
  };
}
