import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { Heart } from 'lucide-react';
import { ResponsiveImage } from './ui/ResponsiveImage';
// import { useWishlist } from '../hooks/useWishlist';
import { CompareButton } from './ui/CompareButton';
import { RatingStars } from './ui/RatingStars';
import { useWishlist } from '@/context/WishlistContext';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: FC<ProductCardProps> = ({ 
  product, 
  viewMode = 'grid' 
}) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  const isGridView = viewMode === 'grid';

  const renderQuickActions = () => (
    <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={handleWishlistToggle}
        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
        title="Add to Wishlist"
      >
        <Heart 
          className={`w-5 h-5 ${
            isInWishlist(product.id)
              ? 'fill-red-500 text-red-500'
              : 'text-gray-600'
          }`}
        />
      </button>
      <CompareButton product={product} />
    </div>
  );

  return (
    <div 
      className={`group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ${
        isGridView ? '' : 'flex gap-6'
      }`}
    >
      <div className={`relative ${isGridView ? '' : 'w-48 flex-shrink-0'}`}>
        <Link to={`/product/${product.id}`}>
          <ResponsiveImage
            desktopSrc={product.images?.[0] || product.imageUrl}
            alt={product.name}
            className={`w-full object-cover ${
              isGridView ? 'h-48' : 'h-full'
            }`}
          />
        </Link>
        {renderQuickActions()}
      </div>

      <div className={`p-4 ${isGridView ? '' : 'flex-1'}`}>
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            {product.name}
          </h3>
          {product.brand && (
            <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-900">
                ₹{product.price.toFixed(2)}
              </p>
              {product.originalPrice && product.originalPrice > product.price && (
                <p className="text-sm text-gray-500 line-through">
                  ₹{product.originalPrice.toFixed(2)}
                </p>
              )}
            </div>
            {product.rating && (
              <div className="flex items-center">
                <RatingStars rating={product.rating.average || 0} />
                <span className="ml-1 text-sm text-gray-600">
                  ({product.rating.total})
                </span>
              </div>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
};