import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { Modal } from './ui/Modal';
import { useCompare } from '../context/CompareContext';
import { formatPrice } from '../utils/formatPrice';
import { ErrorMessage } from './ui/ErrorMessage';
import { useErrorHandler } from '../hooks/useErrorHandler';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onError?: (error: Error) => void;
}

export function CompareModal({ isOpen, onClose, onError }: CompareModalProps) {
  const { items, removeFromCompare, clearCompare } = useCompare();
  const { error, handleError, clearError } = useErrorHandler();

  const features = [
    'Price',
    'Brand',
    'Description',
    ...(items.some(item => item.sizes) ? ['Sizes'] : []),
    ...(items.some(item => item.colors) ? ['Colors'] : []),
  ];

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const error = new Error('Failed to load product image');
    handleError(error);
    e.currentTarget.src = '/placeholder-product.jpg';
    onError?.(error);
  };

  const handleRemoveItem = (productId: string) => {
    try {
      removeFromCompare(productId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to remove product from comparison');
      handleError(error);
      onError?.(error);
    }
  };

  const handleClearAll = () => {
    try {
      clearCompare();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to clear comparison list');
      handleError(error);
      onError?.(error);
    }
  };

  if (items.length === 0) {
    onClose();
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-7xl">
      {error ? (
        <div className="p-4">
          <ErrorMessage
            message={error.message}
            retry={clearError}
          />
        </div>
      ) : (
        <>
          <div className="px-4 py-3 sm:px-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Compare Products ({items.length})
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleClearAll}
                  className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All</span>
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th scope="col" className="py-3 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Features
                  </th>
                  {items.map((product) => (
                    <th key={product.id} scope="col" className="px-3 py-3 text-center text-sm font-semibold text-gray-900">
                      <div className="flex flex-col items-center gap-2">
                        {/* <div className="relative w-32 h-32">
                          <img
                            src={product.images}
                            alt={product.name}
                            onError={handleImageError}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            onClick={() => handleRemoveItem(product.id)}
                            className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div> */}
                        <h4 className="font-medium">{product.name}</h4>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {features.map((feature) => (
                  <tr key={feature}>
                    <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {feature}
                    </td>
                    {items.map((product) => (
                      <td key={product.id} className="px-3 py-4 text-sm text-gray-500 text-center">
                        {feature === 'Price' && formatPrice(product.price)}
                        {feature === 'Brand' && product.brand}
                        {feature === 'Description' && (product.description || 'No description available')}
                        {feature === 'Sizes' && (product.sizes?.join(', ') || 'N/A')}
                        {feature === 'Colors' && (
                          <div className="flex justify-center gap-1">
                            {product.colors?.map((color) => (
                              <div
                                key={color}
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Modal>
  );
}
