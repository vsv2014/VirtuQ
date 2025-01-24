import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Clock, Truck, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

interface ReturnItem {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  reason?: string;
}

const ReturnProcess = () => {
  const { user } = useAuth();
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [returnConfirmed, setReturnConfirmed] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const pickupTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

  useEffect(() => {
    const fetchReturnableItems = async () => {
      try {
        const response = await api.get('/orders/returnable-items');
        setReturnItems(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load returnable items');
        setLoading(false);
      }
    };

    if (user) {
      fetchReturnableItems();
    }
  }, [user]);

  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleReasonChange = (itemId: string, reason: string) => {
    setReasons(prev => ({
      ...prev,
      [itemId]: reason
    }));
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item to return');
      return;
    }

    const itemsWithoutReasons = selectedItems.filter(id => !reasons[id]);
    if (itemsWithoutReasons.length > 0) {
      alert('Please provide a reason for all selected items');
      return;
    }

    setSubmitting(true);
    try {
      const returnData = selectedItems.map(itemId => ({
        itemId,
        reason: reasons[itemId]
      }));

      await api.post('/orders/returns', { items: returnData });
      alert('Return request submitted successfully');
      // Refresh the list
      const response = await api.get('/orders/returnable-items');
      setReturnItems(response.data);
      setSelectedItems([]);
      setReasons({});
      setReturnConfirmed(true);
      setTimeout(() => setQrGenerated(true), 2000);
    } catch (err) {
      alert('Failed to submit return request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Please login to initiate returns
        </h3>
        <Link to="/auth" className="mt-4 inline-block text-sky-600 hover:text-sky-700">
          Login now
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12">Loading returnable items...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  if (returnItems.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          No items eligible for return
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Items are eligible for return within 7 days of delivery.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">Return Items</h1>
      
      <div className="space-y-6">
        {returnItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 shadow rounded-lg p-6"
          >
            <div className="flex items-start space-x-4">
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={() => handleItemSelect(item.id)}
                className="mt-1 h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
              />
              
              <img
                src={item.image}
                alt={item.name}
                className="h-20 w-20 object-cover rounded"
              />
              
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Order #{item.orderId}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Quantity: {item.quantity} × ₹{item.price}
                </p>
                
                {selectedItems.includes(item.id) && (
                  <select
                    value={reasons[item.id] || ''}
                    onChange={(e) => handleReasonChange(item.id, e.target.value)}
                    className="mt-2 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select a reason</option>
                    <option value="wrong_size">Wrong Size</option>
                    <option value="defective">Defective Product</option>
                    <option value="not_as_described">Not as Described</option>
                    <option value="changed_mind">Changed Mind</option>
                  </select>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedItems.length > 0 && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-sky-600 text-white px-6 py-2 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Return Request'}
          </button>
        </div>
      )}

      {returnConfirmed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              Pickup Status
            </h2>
            <div className="flex items-center text-purple-600">
              <Clock className="w-4 h-4 mr-1" />
              <span>Estimated pickup by {pickupTime.toLocaleTimeString()}</span>
            </div>
          </div>

          {qrGenerated && (
            <div className="mt-6 text-center">
              <h3 className="font-medium mb-4 flex items-center justify-center">
                <QrCode className="w-5 h-5 mr-2" />
                Show this QR code to the delivery partner
              </h3>
              <div className="inline-block p-4 bg-white rounded-lg shadow-sm">
                <QRCodeSVG
                  value={JSON.stringify(selectedItems)}
                  size={200}
                  level="H"
                />
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ReturnProcess;