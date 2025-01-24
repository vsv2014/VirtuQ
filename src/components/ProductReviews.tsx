import React, { useState } from 'react';
import { Review, ProductRating } from '../types/review';
import { RatingStars } from './ui/RatingStars';
import { RatingDistribution } from './RatingDistribution';
import { ReviewCard } from './ReviewCard';
import { ErrorMessage } from './ui/ErrorMessage';
import { useErrorHandler } from '../hooks/useErrorHandler';

interface ProductReviewsProps {
  productId: string;
  initialRating?: ProductRating;
  initialReviews?: Review[];
}

export const ProductReviews = ({
  productId,
  initialRating,
  initialReviews = [],
}: ProductReviewsProps) => {
  const [rating, setRating] = useState<ProductRating | undefined>(initialRating);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');
  const { error, handleError, clearError } = useErrorHandler();
  const [isLoading, setIsLoading] = useState(false);

  const handleSortChange = async (newSortBy: 'recent' | 'helpful') => {
    try {
      setIsLoading(true);
      setSortBy(newSortBy);
      // In a real app, you would fetch sorted reviews here
      // const response = await fetch(`/api/products/${productId}/reviews?sort=${newSortBy}`);
      // const data = await response.json();
      // setReviews(data.reviews);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      // In a real app, you would make an API call here
      // await fetch(`/api/reviews/${reviewId}/helpful`, { method: 'POST' });
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { ...review, helpful: review.helpful + 1 }
          : review
      ));
    } catch (err) {
      handleError(err);
    }
  };

  if (error) {
    return (
      <ErrorMessage
        message={error.message}
        retry={clearError}
      />
    );
  }

  if (!rating || reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-gray-900">
              {rating.average.toFixed(1)}
            </div>
            <div>
              <RatingStars rating={rating.average} size="lg" />
              <p className="text-sm text-gray-500 mt-1">
                Based on {rating.total} reviews
              </p>
            </div>
          </div>
        </div>
        <div>
          <RatingDistribution rating={rating} />
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Product Reviews ({reviews.length})
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as 'recent' | 'helpful')}
            className="text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="animate-pulse space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onHelpful={handleHelpful}
            />
          ))
        )}
      </div>
    </div>
  );
};
