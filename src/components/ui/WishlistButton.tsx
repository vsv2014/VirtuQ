import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { Product } from '../../types';
import { cn } from '../../lib/utils';

interface WishlistButtonProps {
  product: Product;
  className?: string;
  onClick?: () => Promise<void>;
}

export function WishlistButton({ product, className, onClick }: WishlistButtonProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'p-2 bg-white rounded-full shadow-sm transition-colors',
        isWishlisted ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:bg-gray-50',
        className
      )}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={cn(
          'w-5 h-5',
          isWishlisted ? 'fill-current' : 'fill-none'
        )}
      />
    </button>
  );
}
