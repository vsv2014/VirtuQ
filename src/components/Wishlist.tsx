import { Link } from 'react-router-dom';
import { ProductCard } from './ProductCard';
import { motion } from 'framer-motion';

const MOCK_WISHLIST = [
  {
    id: '1',
    name: 'Classic White T-Shirt',
    brand: 'Essential Wear',
    price: 599,
    originalPrice: 999,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80'
  },
  // Add more mock wishlist items as needed
];

export function Wishlist() {
  if (MOCK_WISHLIST.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
        <p className="text-gray-600 mb-8">Save items you love to your wishlist</p>
        <Link
          to="/"
          className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">My Wishlist</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MOCK_WISHLIST.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}