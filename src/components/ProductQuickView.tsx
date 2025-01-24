import React from 'react';
import { Modal } from './ui/Modal';
import { Product } from '../types';
import { formatPrice } from '../utils/formatPrice';
import { WishlistButton } from './ui/WishlistButton';

interface ProductQuickViewProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductQuickView = ({ product, isOpen, onClose }: ProductQuickViewProps) => {
  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    console.log('Adding to cart:', product);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="sm:max-w-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Image */}
        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover object-center"
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 sm:pr-12">
              {product.name}
            </h2>

            <div className="mt-3">
              <h3 className="sr-only">Description</h3>
              <div className="space-y-6">
                <p className="text-base text-gray-900">
                  {product.description || 'No description available'}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="sr-only">Brand</h3>
              <p className="text-sm text-gray-600">{product.brand}</p>
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-4">
                <p className="text-lg font-medium text-gray-900">
                  {formatPrice(product.price)}
                </p>
                {product.originalPrice > product.price && (
                  <>
                    <p className="text-gray-500 line-through text-sm">
                      {formatPrice(product.originalPrice)}
                    </p>
                    <p className="text-green-600 text-sm">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                    </p>
                  </>
                )}
                <div className="ml-auto">
                  <WishlistButton product={product} />
                </div>
              </div>
            </div>

            {product.sizes && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900">Size</h3>
                <div className="mt-2 flex items-center space-x-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900">Color</h3>
                <div className="mt-2 flex items-center space-x-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="relative h-8 w-8 rounded-full border"
                      style={{ backgroundColor: color }}
                      aria-label={`Select ${color} color`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Add to Cart
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
