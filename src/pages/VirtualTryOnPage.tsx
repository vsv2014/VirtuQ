import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2 } from 'lucide-react';
import { EnhancedVirtualTryOn } from '../components/virtual-try-on/EnhancedVirtualTryOn';
import styles from '../components/virtual-try-on/virtual-try-on.module.css';

export const VirtualTryOnPage: React.FC = () => {
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const productImage = queryParams.get('image');
  const productName = queryParams.get('name') || 'Product';

  if (!productImage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">No product selected for try-on</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(-1)}
            className={styles['btn-secondary']}
          >
            Go Back
          </motion.button>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    if (processedImage && navigator.share) {
      try {
        await navigator.share({
          title: `Virtual Try-On - ${productName}`,
          text: 'Check out how this looks on me!',
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => navigate(-1)}
            className={styles['btn-secondary']}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Product
          </motion.button>

          {processedImage && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className={styles['btn-secondary']}
            >
              <Share2 className="w-5 h-5" />
              Share Look
            </motion.button>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-medium text-gray-900 dark:text-white">
              Product Preview
            </h2>
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
              <img 
                src={productImage} 
                alt={productName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
                {productName}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Use our virtual try-on feature to see how this item looks on you before making a purchase.
              </p>
            </div>
          </motion.div>

          {/* Try-On Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-medium text-gray-900 dark:text-white">
              Virtual Try-On
            </h2>
            <EnhancedVirtualTryOn
              productImage={productImage}
              productName={productName}
              onProcessed={setProcessedImage}
            />
          </motion.div>
        </div>

        {/* Results Section */}
        {processedImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-medium mb-6 text-gray-900 dark:text-white">
              Your Look
            </h2>
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
              <img
                src={processedImage}
                alt="Try-on result"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex justify-center mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/checkout?product=${encodeURIComponent(productName)}`)}
                className={styles['btn-primary']}
              >
                Proceed to Checkout
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
