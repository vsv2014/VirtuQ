import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Trash2, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';

export function Cart() {
  const navigate = useNavigate(); // Initialize navigate hook
  const { items, removeItem, updateQuantity } = useCart();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 0; // Free delivery
  const total = subtotal + deliveryFee;

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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm"
            >
              <img
                src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80"
                alt={item.name}
                className="w-24 h-24 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-gray-600 text-sm">Size: M | Color: White</p>
                <div className="flex items-center space-x-4 mt-2">
                  <select
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                    className="border rounded px-2 py-1"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-600"
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
            onClick={() => navigate('/checkout')} // Add onClick to navigate to checkout
            className="w-full bg-purple-600 text-white py-3 rounded-lg mt-6 hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
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
    </div>
  );
}
