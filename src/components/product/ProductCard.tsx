import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/products/${product.id}`} className="group">
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="mt-4 space-y-1">
        <div className="flex justify-between">
          <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
          {product.inStock ? (
            <span className="text-xs text-green-600">In Stock</span>
          ) : (
            <span className="text-xs text-red-600">Out of Stock</span>
          )}
        </div>
        {product.brand && (
          <p className="text-sm text-gray-500">{product.brand}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-900">
              ${product.price.toFixed(2)}
            </p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-sm text-gray-500 line-through">
                ${product.originalPrice.toFixed(2)}
              </p>
            )}
          </div>
          {product.rating && (
            <div className="flex items-center">
              <Star
                className="h-4 w-4 text-yellow-400 fill-current"
                aria-hidden="true"
              />
              <span className="ml-1 text-sm text-gray-500">
                {product.rating.average.toFixed(1)}
              </span>
              {product.rating.total > 0 && (
                <span className="ml-1 text-sm text-gray-400">
                  ({product.rating.total})
                </span>
              )}
            </div>
          )}
        </div>
        {product.variations && product.variations.length > 0 && (
          <div className="mt-2">
            <div className="flex flex-wrap gap-1">
              {product.variations.map((v, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {v.size} / {v.color}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
