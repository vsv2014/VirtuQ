import { motion } from 'framer-motion';
import { Star, Heart } from 'lucide-react';
import { Product } from '../hooks/useRecommendations';
import { Link } from 'react-router-dom';

interface RecommendationCardProps {
  product: Product;
  index: number;
}

export function RecommendationCard({ product, index }: RecommendationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <img
            src={product.image}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
          {product.discount && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
              {product.discount}% OFF
            </div>
          )}
          <button
            className="absolute top-2 left-2 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 transition-colors duration-200"
            aria-label="Add to wishlist"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.brand}</div>
          <h3 className="font-medium text-sm mb-1 line-clamp-2 text-gray-900 dark:text-white">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < product.rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({product.rating}/5)
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              ₹{product.price.toLocaleString()}
            </span>
            {product.discount && (
              <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
                ₹{Math.floor(product.price * (1 + product.discount / 100)).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
