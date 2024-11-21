import { useState } from 'react';
import { motion } from 'framer-motion';
import Countdown from 'react-countdown';
import { Clock, Check, X, ArrowRight, ArrowLeft, CreditCard, Plus } from 'lucide-react';

const MOCK_TRIAL_ITEMS = [
  {
    id: '1',
    name: 'Classic White T-Shirt',
    brand: 'Essential Wear',
    price: 599,
    size: 'M',
    color: 'White',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80'
  },
  {
    id: '2',
    name: 'Denim Jacket',
    brand: 'Urban Style',
    price: 2499,
    size: 'L',
    color: 'Blue',
    image: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&q=80'
  }
];

export function HomeTrial() {
  const [step, setStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const trialEndTime = Date.now() + 2 * 60 * 60 * 1000; // 2 hours from now

  const handleItemSelection = (itemId: string) => {
    setSelectedItems(current =>
      current.includes(itemId)
        ? current.filter(id => id !== itemId)
        : [...current, itemId]
    );
  };

  const calculateTotal = () => {
    const items = MOCK_TRIAL_ITEMS.filter(item => selectedItems.includes(item.id));
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const gst = subtotal * 0.18;
    const deliveryFee = 0;
    const handlingFee = 49;
    return {
      subtotal,
      gst,
      deliveryFee,
      handlingFee,
      total: subtotal + gst + deliveryFee + handlingFee
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Trial Timer */}
      <div className="bg-purple-50 p-4 rounded-lg mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-purple-600" />
          <span className="font-medium">Trial Period Remaining:</span>
        </div>
        <Countdown
          date={trialEndTime}
          renderer={({ hours, minutes, seconds }) => (
            <span className="text-lg font-bold text-purple-600">
              {hours}:{minutes}:{seconds}
            </span>
          )}
        />
      </div>

      {/* Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -z-10" />
          {[1, 2, 3].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= stepNumber ? 'bg-purple-600 text-white' : 'bg-gray-200'
              }`}
            >
              {stepNumber}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold">Select Items to Keep</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_TRIAL_ITEMS.map((item) => (
              <div
                key={item.id}
                className={`bg-white p-4 rounded-lg shadow-sm flex space-x-4 ${
                  selectedItems.includes(item.id) ? 'ring-2 ring-purple-600' : ''
                }`}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-32 h-32 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.brand}</p>
                  <p className="text-sm">Size: {item.size} | Color: {item.color}</p>
                  <p className="font-bold mt-2">₹{item.price}</p>
                  <button
                    onClick={() => handleItemSelection(item.id)}
                    className={`mt-4 px-4 py-2 rounded-lg flex items-center space-x-2 ${
                      selectedItems.includes(item.id)
                        ? 'bg-purple-600 text-white'
                        : 'border border-purple-600 text-purple-600'
                    }`}
                  >
                    {selectedItems.includes(item.id) ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Selected to Keep</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Keep This Item</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold">Review Selection</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-medium mb-4">Items to Keep</h3>
            <div className="space-y-4">
              {MOCK_TRIAL_ITEMS.filter(item => selectedItems.includes(item.id)).map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Size: {item.size} | Color: {item.color}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold">₹{item.price}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium mb-4">Items to Return</h3>
              <div className="space-y-4">
                {MOCK_TRIAL_ITEMS.filter(item => !selectedItems.includes(item.id)).map(item => (
                  <div key={item.id} className="flex justify-between items-center opacity-50">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Size: {item.size} | Color: {item.color}
                        </p>
                      </div>
                    </div>
                    <X className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="text-purple-600 px-6 py-2 rounded-lg flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
            >
              <span>Proceed to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold">Payment</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-medium mb-4">Bill Summary</h3>
            <div className="space-y-2">
              {Object.entries(calculateTotal()).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="font-medium">₹{value.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <button
              className="w-full mt-6 bg-purple-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2"
              onClick={() => {
                // Integrate Razorpay here
                alert('Redirecting to Razorpay...');
              }}
            >
              <CreditCard className="w-5 h-5" />
              <span>Pay Now</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}