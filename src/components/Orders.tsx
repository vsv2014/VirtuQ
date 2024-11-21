import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, HelpCircle, ChevronRight, Package } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_ORDERS = [
  {
    id: 'ORD123456',
    status: 'in_transit',
    items: [
      {
        id: '1',
        name: 'Classic White T-Shirt',
        price: 599,
        color: 'White',
        size: 'M',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80'
      }
    ],
    address: '123 Main St, Bangalore, Karnataka',
    orderTime: '2024-03-10T10:30:00Z',
    estimatedDelivery: '2024-03-10T14:30:00Z',
    total: 648
  }
];

export function Orders() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">My Orders</h1>

      <div className="space-y-6">
        {MOCK_ORDERS.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            {/* Order Header */}
            <div className="border-b p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Order #{order.id}</span>
                <span className="text-purple-600">Track Order</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                <span>Ordered on {new Date(order.orderTime).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Order Status */}
            <div className="p-4 bg-purple-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Delivery Status</span>
                </div>
                <span className="text-sm text-purple-600">
                  Estimated delivery by {new Date(order.estimatedDelivery).toLocaleTimeString()}
                </span>
              </div>

              {/* Status Timeline */}
              <div className="relative">
                <div className="absolute left-0 top-0 h-full w-px bg-purple-200"></div>
                <div className="ml-6 space-y-4">
                  {['Order Placed', 'Confirmed', 'Out for Delivery', 'Delivered'].map((step, i) => (
                    <div key={i} className="flex items-center">
                      <div className={`absolute left-0 w-2 h-2 rounded-full ${
                        i <= 2 ? 'bg-purple-600' : 'bg-gray-300'
                      }`}></div>
                      <span className={i <= 2 ? 'text-gray-900' : 'text-gray-500'}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-4 border-t">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Size: {item.size} | Color: {item.color}
                    </p>
                    <p className="text-sm font-medium">₹{item.price}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Address */}
            <div className="p-4 border-t">
              <div className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Delivery Address</h3>
                  <p className="text-sm text-gray-600">{order.address}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
              <Link
                to={`/orders/${order.id}`}
                className="text-purple-600 hover:text-purple-700 flex items-center"
              >
                View Details
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
              <button className="flex items-center text-gray-600 hover:text-gray-700">
                <HelpCircle className="w-4 h-4 mr-1" />
                Need Help?
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}