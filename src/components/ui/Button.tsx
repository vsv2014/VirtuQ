import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';
    
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/50',
      secondary: 'bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary/50',
      outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary/50',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500/50',
      link: 'text-primary underline-offset-4 hover:underline focus:ring-primary/50'
    };

    const sizes = {
      sm: 'text-sm px-3 py-1.5',
      md: 'text-base px-4 py-2',
      lg: 'text-lg px-6 py-3'
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          isLoading && 'relative text-transparent hover:text-transparent',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        <span className={cn(
          'inline-flex items-center gap-2',
          isLoading && 'invisible'
        )}>
          {leftIcon}
          {children}
          {rightIcon}
        </span>
        
        {isLoading && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <LoadingSpinner size="sm" className="text-current" />
          </span>
        )}
      </button>
    );
  }
);
