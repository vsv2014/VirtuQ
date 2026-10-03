import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { discountPercent, formatINR } from '../lib/format';
import { useWishlist } from '../context/useWishlist';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(product.id);
  const discount = discountPercent(product.price, product.originalPrice);

  return (
    <div className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md">
      {/*
        The wishlist button used to sit INSIDE the <Link>, which is invalid
        HTML and made the heart navigate instead of saving. It is now a sibling.
      */}
      <Link
        to={`/product/${product.id}`}
        className="block"
        aria-label={`View ${product.name}`}
      >
        <div className="relative aspect-[3/4]">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      <button
        type="button"
        onClick={() => toggle(product)}
        aria-pressed={saved}
        aria-label={
          saved
            ? `Remove ${product.name} from wishlist`
            : `Save ${product.name} to wishlist`
        }
        className="absolute right-4 top-4 rounded-full bg-white p-2 shadow-sm transition-colors hover:bg-gray-50"
      >
        <Heart
          className={`h-5 w-5 ${saved ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
        />
      </button>

      <Link to={`/product/${product.id}`} className="block p-4">
        <h3 className="mb-1 font-medium text-gray-900">{product.name}</h3>
        <p className="mb-2 text-sm text-gray-500">{product.brand}</p>
        <div className="flex items-center space-x-2">
          <span className="font-semibold">{formatINR(product.price)}</span>
          <span className="text-sm text-gray-500 line-through">
            {formatINR(product.originalPrice)}
          </span>
          {discount > 0 ? (
            <span className="text-sm text-green-600">{discount}% off</span>
          ) : null}
        </div>
      </Link>
    </div>
  );
}
