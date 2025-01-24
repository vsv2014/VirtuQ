import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

// interface CartItem {
//   id: string;
//   name: string;
//   price: number;
//   quantity: number;
//   image?: string;
// }

export function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  const handleQuantityChange = async (itemId: string, quantity: number) => {
    try {
      setIsLoading(true);
      updateQuantity(itemId, quantity);
    } catch (err) {
      setError('Failed to update quantity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setIsLoading(true);
      removeItem(itemId);
      setItemToDelete(null);
    } catch (err) {
      setError('Failed to remove item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Add items to your cart to start the home trial experience</p>
        <Link
          to="/"
          className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button onClick={() => setError(null)} className="float-right">&times;</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 bg-white p-4 rounded-lg shadow-sm"
              >
                <img
                  src={"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80"}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-gray-600 text-sm">Size: M | Color: White</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <select
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                      className="border rounded px-2 py-1"
                      disabled={isLoading}
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setItemToDelete(item.id)}
                      className="text-red-500 hover:text-red-600"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{item.price * item.quantity}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            disabled={isLoading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg mt-6 hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Clock className="w-5 h-5" />
            <span>Start Home Trial</span>
          </button>

          <div className="mt-4 text-sm text-gray-600">
            <p className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>2-hour trial period starts after delivery</span>
            </p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Remove Item</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to remove this item from your cart?</p>
            <div className="flex space-x-4">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveItem(itemToDelete)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
