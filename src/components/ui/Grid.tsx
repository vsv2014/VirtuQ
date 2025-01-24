import React from 'react';
import { cn } from '@/lib/utils';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'none' | 'sm' | 'md' | 'lg';
}

export function Grid({
  children,
  className,
  cols = { default: 1 },
  gap = 'md',
  ...props
}: GridProps) {
  const getGridCols = () => {
    const colClasses = [];
    
    // Default columns (mobile first)
    colClasses.push(`grid-cols-${cols.default}`);
    
    // Responsive columns
    if (cols.sm) colClasses.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) colClasses.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) colClasses.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) colClasses.push(`xl:grid-cols-${cols.xl}`);
    
    return colClasses.join(' ');
  };

  const gaps = {
    none: 'gap-0',
    sm: 'gap-2 sm:gap-4',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8'
  };

  return (
    <div
      className={cn(
        'grid',
        getGridCols(),
        gaps[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
