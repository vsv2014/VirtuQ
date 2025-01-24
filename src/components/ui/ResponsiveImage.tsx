import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  mobileSrc?: string;
  tabletSrc?: string;
  desktopSrc: string;
  alt: string;
  aspectRatio?: '1:1' | '4:3' | '16:9' | '21:9';
}

export function ResponsiveImage({
  mobileSrc,
  tabletSrc,
  desktopSrc,
  alt,
  aspectRatio = '16:9',
  className,
  ...props
}: ResponsiveImageProps) {
  const [error, setError] = useState(false);
  
  const aspectRatios = {
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-video',
    '21:9': 'aspect-[21/9]'
  };

  const handleError = () => {
    setError(true);
  };

  if (error) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-gray-100 dark:bg-gray-800',
        aspectRatios[aspectRatio],
        className
      )}>
        <span className="text-gray-400">Image not available</span>
      </div>
    );
  }

  return (
    <picture className={cn('block w-full', aspectRatios[aspectRatio], className)}>
      {mobileSrc && (
        <source media="(max-width: 640px)" srcSet={mobileSrc} />
      )}
      {tabletSrc && (
        <source media="(max-width: 1024px)" srcSet={tabletSrc} />
      )}
      <source srcSet={desktopSrc} />
      <img
        src={desktopSrc}
        alt={alt}
        onError={handleError}
        className="w-full h-full object-cover"
        loading="lazy"
        {...props}
      />
    </picture>
  );
}
