import React, { memo } from 'react';
import { cn } from '../../lib/utils';

interface ErrorMessageProps {
  message?: string;
  className?: string;
  retry?: () => void;
}

export const ErrorMessage = memo(function ErrorMessage({ 
  message = 'An error occurred. Please try again later.',
  className,
  retry
}: ErrorMessageProps) {
  return (
    <div 
      className={cn(
        'rounded-lg bg-red-50 p-4 border border-red-200',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">{message}</p>
        </div>
      </div>
      {retry && (
        <div className="mt-4">
          <button
            onClick={retry}
            className="text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none focus:underline"
            type="button"
            aria-label="Try loading the content again"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
});
