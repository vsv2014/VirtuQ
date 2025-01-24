import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProductReviews } from './ProductReviews';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { productService } from '../services/product.service';
import { Product } from '../types';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) return;
        const data = await productService.getProductById(id);
        setProduct(data);
        setMainImage(data.images[0]);
        setLoading(false);
      } catch (err) {
        setError('Failed to load product details');
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error || !product) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error || 'Product not found'}</div>;
  }

  const handleAddToCart = () => {
    // Add to cart logic
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
    };
    console.log('Adding to cart:', cartItem);
  };

  const handleTryOn = () => {
    if (!mainImage) return;
    navigate(`/virtual-try-on?image=${encodeURIComponent(mainImage)}`);
  };

  const handleWishlistToggle = () => {
    if (!user) {
      // Show login prompt
      return;
    }
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-center object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setMainImage(image)}
                  className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden ${
                    mainImage === image ? 'ring-2 ring-sky-500' : ''
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-center object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">{product.brand}</p>
            </div>

            <div className="flex items-center space-x-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{product.price}</p>
              {product.originalPrice > product.price && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500 dark:text-gray-400 line-through">₹{product.originalPrice}</span>
                  <span className="text-green-500">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                  </span>
                </div>
              )}
            </div>

            <div>
              <p className="text-gray-600 dark:text-gray-300">{product.description}</p>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Size</h3>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {product.sizes?.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      selectedSize === size
                        ? 'bg-sky-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {size}
                  </button>
                )) ?? null}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Color</h3>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {product && product.colors?.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      selectedColor === color
                        ? 'bg-sky-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize || !selectedColor}
                className="flex-1 bg-sky-600 text-white px-6 py-3 rounded-md font-medium hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>

              <button
                onClick={handleTryOn}
                className="bg-purple-600 text-white px-6 py-3 rounded-md font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center"
              >
                <Camera className="w-5 h-5 mr-2" />
                Try On
              </button>

              <button
                onClick={handleWishlistToggle}
                disabled={!user}
                className={`p-3 rounded-md ${
                  isInWishlist(product.id) && user
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                aria-label={!user ? 'Login to use Wishlist' : isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart
                  size={24}
                  className={isInWishlist(product.id) && user ? 'fill-current' : ''}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ProductReviews productId={product.id} />
      </div>
    </div>
  );
}
