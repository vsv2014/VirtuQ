import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, HelpCircle, ChevronRight, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
}

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders');
        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load orders');
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Please login to view your orders</h3>
        <Link to="/auth" className="mt-4 inline-block text-sky-600 hover:text-sky-700">
          Login now
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12">Loading orders...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No orders yet</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Start shopping to see your orders here.
        </p>
        <Link to="/" className="mt-4 inline-block text-sky-600 hover:text-sky-700">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order, index) => (
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
                <span>Ordered on {new Date(order.date).toLocaleDateString()}</span>
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
                  Estimated delivery by {new Date(order.date).toLocaleTimeString()}
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
                      Qty: {item.quantity} × ₹{item.price}
                    </p>
                    <p className="text-sm font-medium">₹{item.quantity * item.price}</p>
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
                  <p className="text-sm text-gray-600">123 Main St, Bangalore, Karnataka</p>
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
};

export default Orders;