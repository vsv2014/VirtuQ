import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RatingStarsProps {
  rating: number | { average: number; total: number };
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export const RatingStars = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  className,
}: RatingStarsProps) => {
  const ratingValue = typeof rating === 'number' ? rating : rating.average;
  const [hoverRating, setHoverRating] = React.useState(0);

  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (interactive) {
      setHoverRating(index + 1);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  return (
    <div 
      className={cn('flex items-center gap-0.5', className)}
      onMouseLeave={handleMouseLeave}
    >
      {[...Array(maxRating)].map((_, index) => {
        const filled = index < (hoverRating || ratingValue);
        return (
          <button
            key={index}
            type={interactive ? 'button' : 'submit'}
            className={cn(
              'focus:outline-none',
              interactive && 'cursor-pointer hover:scale-110 transition-transform'
            )}
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            disabled={!interactive}
          >
            <Star
              className={cn(
                sizes[size],
                'transition-colors',
                filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
