import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
  type?: 'text' | 'image' | 'card';
}

export function SkeletonLoader({ className = '', count = 1, type = 'text' }: SkeletonLoaderProps) {
  const getSkeletonClass = () => {
    switch (type) {
      case 'image':
        return 'h-48 w-full rounded-lg';
      case 'card':
        return 'h-64 w-full rounded-lg';
      case 'text':
      default:
        return 'h-4 w-full rounded';
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-gray-200 ${getSkeletonClass()} ${className}`}
          role="status"
          aria-label="loading"
        />
      ))}
    </>
  );
}
