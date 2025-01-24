import React from 'react';
import { ProductRating } from '../types/review';
import { RatingStars } from './ui/RatingStars';

interface RatingDistributionProps {
  rating: ProductRating;
}

export const RatingDistribution = ({ rating }: RatingDistributionProps) => {
  return (
    <div className="space-y-3">
      {[5, 4, 3, 2, 1].map((stars) => {
        const count = rating.distribution[stars as keyof typeof rating.distribution];
        const percentage = (count / rating.total) * 100;
        
        return (
          <div key={stars} className="flex items-center gap-2 text-sm">
            <div className="w-12">
              <button className="hover:underline">
                {stars} star{stars !== 1 ? 's' : ''}
              </button>
            </div>
            <div className="flex-1">
              <div className="h-2 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-yellow-400"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
            <div className="w-12 text-right text-gray-600">
              {Math.round(percentage)}%
            </div>
          </div>
        );
      })}
    </div>
  );
};
