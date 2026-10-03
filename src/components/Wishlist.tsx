import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

import { ProductCard } from './ProductCard';
import { useWishlist } from '../context/useWishlist';

export function Wishlist() {
  const { items, clear } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <h2 className="mb-4 text-2xl font-bold">Your wishlist is empty</h2>
        <p className="mb-8 text-gray-600">Save items you love to your wishlist</p>
        <Link to="/" className="btn btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        <button
          type="button"
          onClick={clear}
          className="text-sm text-gray-500 hover:text-red-600"
        >
          Clear wishlist
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
