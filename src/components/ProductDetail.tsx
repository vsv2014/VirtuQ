import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

const MOCK_PRODUCT = {
  id: '1',
  name: 'Classic White T-Shirt',
  brand: 'Essential Wear',
  price: 599,
  originalPrice: 999,
  description: 'A comfortable and versatile white t-shirt made from 100% cotton.',
  images: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80',
  ],
  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['White', 'Black', 'Gray'],
};

type ToastProps = {
  message: string;
  onClose: () => void; 
};

function Toast({ message, onClose }: ToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
    >
      <div className="flex items-center space-x-2">
        <span>{message}</span>
        <button onClick={onClose} className="text-white font-bold">
          ✕
        </button>
      </div>
    </motion.div>
  );
}

export function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [mainImage, setMainImage] = useState(MOCK_PRODUCT.images[0]);
  const [toastMessage, setToastMessage] = useState('');

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select size and color');
      return;
    }
    addItem({
      id: MOCK_PRODUCT.id,
      name: MOCK_PRODUCT.name,
      price: MOCK_PRODUCT.price,
      quantity: 1,
    });
    setToastMessage('Added to Bag');
    setTimeout(() => setToastMessage(''), 3000); // Automatically close after 3 seconds
  };

  const handleWishlist = () => {
    setToastMessage('Saved to Wishlist');
    setTimeout(() => setToastMessage(''), 3000); // Automatically close after 3 seconds
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square rounded-lg overflow-hidden"
          >
            <img
              src={mainImage}
              alt={MOCK_PRODUCT.name}
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="grid grid-cols-4 gap-4">
            {MOCK_PRODUCT.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setMainImage(image)}
                className={`aspect-square rounded-lg overflow-hidden border-2 ${
                  mainImage === image ? 'border-purple-600' : 'border-transparent'
                }`}
              >
                <img
                  src={image}
                  alt={`Product view ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{MOCK_PRODUCT.name}</h1>
            <p className="text-gray-600 mb-4">{MOCK_PRODUCT.brand}</p>
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-2xl font-bold">₹{MOCK_PRODUCT.price}</span>
              <span className="text-gray-500 line-through">₹{MOCK_PRODUCT.originalPrice}</span>
              <span className="text-green-600">
                {Math.round(((MOCK_PRODUCT.originalPrice - MOCK_PRODUCT.price) / MOCK_PRODUCT.originalPrice) * 100)}% off
              </span>
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Select Size</h3>
            <div className="flex space-x-3">
              {MOCK_PRODUCT.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                    selectedSize === size
                      ? 'border-purple-600 text-purple-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Select Color</h3>
            <div className="flex space-x-3">
              {MOCK_PRODUCT.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 rounded-full border-2 ${
                    selectedColor === color
                      ? 'border-purple-600 text-purple-600'
                      : 'border-gray-300 hover:border-gray-400'
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
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>
            <button
              onClick={handleWishlist}
              className="p-3 border-2 border-gray-300 rounded-lg hover:border-gray-400"
            >
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
