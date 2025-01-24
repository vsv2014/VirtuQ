import React from 'react';
import { ThumbsUp, Check } from 'lucide-react';
import { Review } from '../types/review';
import { RatingStars } from './ui/RatingStars';

interface ReviewCardProps {
  review: Review;
  onHelpful?: (reviewId: string) => void;
}

export const ReviewCard = ({ review, onHelpful }: ReviewCardProps) => {
  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="border-b border-gray-200 py-6 last:border-0">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {review.userAvatar ? (
            <img
              src={review.userAvatar}
              alt={review.userName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-lg font-medium">
                {review.userName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{review.userName}</p>
            {review.verified && (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <Check className="w-4 h-4" />
                <span>Verified Purchase</span>
              </div>
            )}
          </div>
        </div>
        <time className="text-sm text-gray-500" dateTime={review.createdAt}>
          {formattedDate}
        </time>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2">
          <RatingStars rating={review.rating} size="sm" />
          <h4 className="font-medium text-gray-900">{review.title}</h4>
        </div>
        <p className="mt-2 text-gray-600 whitespace-pre-line">{review.comment}</p>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={() => onHelpful?.(review.id)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
        >
          <ThumbsUp className="w-4 h-4" />
          <span>Helpful ({review.helpful})</span>
        </button>
      </div>
    </div>
  );
};
