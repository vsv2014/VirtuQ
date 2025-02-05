import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Home, Building2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

interface Address {
  name: string;
  phone: string;
  pincode: string;
  city: string;
  state: string;
  locality: string;
  building: string;
  landmark?: string;
  type: 'home' | 'office' | 'other';
  isDefault: boolean;
}

export function Checkout() {
  const navigate = useNavigate();
  const { items } = useCart();
  const [address, setAddress] = useState<Address>({
    name: '',
    phone: '',
    pincode: '',
    city: '',
    state: '',
    locality: '',
    building: '',
    landmark: '',
    type: 'home',
    isDefault: false
  });
  const [kycVerified, setKycVerified] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 0;
  const handlingFee = 49;
  const total = subtotal + deliveryFee + handlingFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycVerified) {
      alert('Please complete KYC verification');
      return;
    }
    if (!termsAccepted) {
      alert('Please accept the terms and conditions');
      return;
    }
    // Process order and navigate to confirmation
    navigate('/orders');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Address Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Delivery Address
            </h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={address.name}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Locality/Area
                </label>
                <input
                  type="text"
                  value={address.locality}
                  onChange={(e) => setAddress({ ...address, locality: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Flat/House No., Building
                </label>
                <input
                  type="text"
                  value={address.building}
                  onChange={(e) => setAddress({ ...address, building: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={address.landmark}
                  onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Address Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={address.type === 'home'}
                      onChange={() => setAddress({ ...address, type: 'home' })}
                      className="text-purple-600"
                    />
                    <span className="flex items-center">
                      <Home className="w-4 h-4 mr-1" /> Home
                    </span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={address.type === 'office'}
                      onChange={() => setAddress({ ...address, type: 'office' })}
                      className="text-purple-600"
                    />
                    <span className="flex items-center">
                      <Building2 className="w-4 h-4 mr-1" /> Office
                    </span>
                  </label>
                </div>
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={address.isDefault}
                  onChange={(e) => setAddress({ ...address, isDefault: e.target.checked })}
                  className="text-purple-600 rounded"
                />
                <span className="text-sm text-gray-700">Make this my default address</span>
              </label>
            </form>
          </motion.div>

          {/* KYC Verification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <h2 className="text-lg font-semibold mb-4">KYC Verification</h2>
            <p className="text-gray-600 mb-4">
              For your security and to ensure safe home trials, we need to verify your identity.
            </p>
            <button
              onClick={() => setKycVerified(true)}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Complete KYC
            </button>
          </motion.div>
        </div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm h-fit"
        >
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} x {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between">
                <span>Handling Fee</span>
                <span>₹{handlingFee}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="text-purple-600 rounded"
                />
                <span className="text-sm text-gray-700">
                  I agree to the terms of service and privacy policy
                </span>
              </label>

              <button
                onClick={handleSubmit}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Clock className="w-5 h-5" />
                <span>Place Order for Home Trial</span>
              </button>

              <p className="text-sm text-gray-600">
                Your 2-hour trial period will start after delivery
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}