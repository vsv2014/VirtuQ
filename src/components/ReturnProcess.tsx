import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Package, Clock, Truck, QrCode } from 'lucide-react';

const MOCK_RETURN_ITEMS = [
  {
    id: '1',
    name: 'Denim Jacket',
    brand: 'Urban Style',
    price: 2499,
    size: 'L',
    color: 'Blue',
    image: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&q=80'
  }
];

export function ReturnProcess() {
  const [returnConfirmed, setReturnConfirmed] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const pickupTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

  const handleConfirmReturn = () => {
    setReturnConfirmed(true);
    setTimeout(() => setQrGenerated(true), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Return Process</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Return Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Items to Return
            </h2>
            <div className="space-y-4">
              {MOCK_RETURN_ITEMS.map((item) => (
                <div key={item.id} className="flex space-x-4 border-b pb-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.brand}</p>
                    <p className="text-sm">Size: {item.size} | Color: {item.color}</p>
                    <p className="font-bold mt-2">₹{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Return Status */}
          {returnConfirmed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg shadow-sm"
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
                      value={JSON.stringify(MOCK_RETURN_ITEMS)}
                      size={200}
                      level="H"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Return Actions */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <h2 className="text-lg font-semibold mb-4">Return Instructions</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0">1</span>
                <span>Pack all return items in their original packaging</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0">2</span>
                <span>Ensure items are in the same condition as received</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0">3</span>
                <span>Keep the QR code ready for the delivery partner</span>
              </li>
            </ul>

            {!returnConfirmed && (
              <button
                onClick={handleConfirmReturn}
                className="w-full mt-6 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Confirm Return Pickup
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}