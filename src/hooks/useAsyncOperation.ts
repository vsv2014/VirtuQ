import { useState } from 'react';
import { useLoading } from '@/context/LoadingContext';

export function useAsyncOperation<T>(asyncFn: (...args: any[]) => Promise<T>) {
  const [error, setError] = useState<Error | null>(null);
  const { startLoading, stopLoading } = useLoading();

  const execute = async (...args: any[]): Promise<T | undefined> => {
    try {
      setError(null);
      startLoading();
      const result = await asyncFn(...args);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
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
