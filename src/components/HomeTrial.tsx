import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

interface TrialItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  sizes: string[];
  colors: string[];
  available: boolean;
}

export function HomeTrial() {
  const { user } = useAuth();
  const [trialItems, setTrialItems] = useState<TrialItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTrialItems = async () => {
      try {
        const response = await api.get('/products/trial-eligible');
        setTrialItems(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load trial-eligible items');
        setLoading(false);
      }
    };

    if (user) {
      fetchTrialItems();
    }
  }, [user]);

  const handleItemSelect = (itemId: string) => {
    if (selectedItems.length >= 3 && !selectedItems.includes(itemId)) {
      alert('You can select up to 3 items for home trial');
      return;
    }

    setSelectedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSizeSelect = (itemId: string, size: string) => {
    setSelectedSizes(prev => ({
      ...prev,
      [itemId]: size
    }));
  };

  const handleColorSelect = (itemId: string, color: string) => {
    setSelectedColors(prev => ({
      ...prev,
      [itemId]: color
    }));
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item for trial');
      return;
    }

    const itemsWithoutSize = selectedItems.filter(id => !selectedSizes[id]);
    if (itemsWithoutSize.length > 0) {
      alert('Please select size for all items');
      return;
    }

    const itemsWithoutColor = selectedItems.filter(id => !selectedColors[id]);
    if (itemsWithoutColor.length > 0) {
      alert('Please select color for all items');
      return;
    }

    setSubmitting(true);
    try {
      const trialData = selectedItems.map(itemId => ({
        itemId,
        size: selectedSizes[itemId],
        color: selectedColors[itemId]
      }));

      await api.post('/orders/trial', { items: trialData });
      alert('Home trial request submitted successfully');
      // Reset selections
      setSelectedItems([]);
      setSelectedSizes({});
      setSelectedColors({});
    } catch (err) {
      alert('Failed to submit trial request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Please login to request home trials
        </h3>
        <Link to="/auth" className="mt-4 inline-block text-sky-600 hover:text-sky-700">
          Login now
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12">Loading trial-eligible items...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Home Trial</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Try before you buy! Select up to 3 items to try at home.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:gap-x-8">
        {trialItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative"
          >
            <div className="aspect-w-4 aspect-h-5 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={item.image}
                alt={item.name}
                className="object-center object-cover group-hover:opacity-75"
              />
              <button
                onClick={() => handleItemSelect(item.id)}
                className={`absolute top-4 right-4 p-2 rounded-full ${
                  selectedItems.includes(item.id)
                    ? 'bg-sky-600 text-white'
                    : 'bg-white text-gray-900'
                }`}
              >
                {selectedItems.includes(item.id) ? 'Selected' : 'Select'}
              </button>
            </div>

            <div className="mt-4 flex justify-between">
              <div>
                <h3 className="text-sm text-gray-700 dark:text-gray-200">
                  {item.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {item.brand}
                </p>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                ₹{item.price}
              </p>
            </div>

            {selectedItems.includes(item.id) && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Size
                  </label>
                  <select
                    value={selectedSizes[item.id] || ''}
                    onChange={(e) => handleSizeSelect(item.id, e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select size</option>
                    {item.sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Color
                  </label>
                  <select
                    value={selectedColors[item.id] || ''}
                    onChange={(e) => handleColorSelect(item.id, e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select color</option>
                    {item.colors.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
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
            {submitting ? 'Submitting...' : `Schedule Trial (${selectedItems.length}/3 items)`}
          </button>
        </div>
      )}
    </div>
  );
}