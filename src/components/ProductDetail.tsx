import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Heart, ShoppingBag, Truck, Clock, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

import { getProduct } from '../data/mockProducts';
import { useCart } from '../context/useCart';
import { useWishlist } from '../context/useWishlist';
import { useToast } from '../context/useToast';
import { discountPercent, formatINR, MAX_QUANTITY } from '../lib/format';
import { NotFound } from './NotFound';

export function ProductDetail() {
  // Previously `id` was read and then ignored, so every product page rendered
  // the same hardcoded demo t-shirt.
  const { id } = useParams();
  const product = getProduct(id);

  const { addItem } = useCart();
  const { isSaved, toggle } = useWishlist();
  const { show } = useToast();

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [fieldError, setFieldError] = useState('');

  if (!product) {
    return <NotFound />;
  }

  const saved = isSaved(product.id);
  const discount = discountPercent(product.price, product.originalPrice);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      setFieldError('Please choose a size and a colour first.');
      return;
    }
    setFieldError('');

    addItem({ product, size: selectedSize, color: selectedColor, quantity });
    show(`${product.name} added to your bag`, 'success');
  };

  const handleWishlist = () => {
    toggle(product);
    show(
      saved ? 'Removed from your wishlist' : 'Saved to your wishlist',
      saved ? 'info' : 'success',
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-purple-600">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link
          to={`/category/${product.category}`}
          className="capitalize hover:text-purple-600"
        >
          {product.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-50">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
        </motion.div>

        <div className="space-y-6">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{product.name}</h1>
            <p className="mb-4 text-gray-600">{product.brand}</p>

            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="text-2xl font-bold">{formatINR(product.price)}</span>
              <span className="text-gray-500 line-through">
                {formatINR(product.originalPrice)}
              </span>
              {discount > 0 ? (
                <span className="text-green-600">{discount}% off</span>
              ) : null}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">
              Select Size
              {selectedSize ? (
                <span className="ml-2 font-normal text-gray-500">{selectedSize}</span>
              ) : null}
            </h3>
            <div className="flex flex-wrap gap-3">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  aria-pressed={selectedSize === size}
                  className={`h-12 w-12 rounded-full border-2 flex items-center justify-center ${
                    selectedSize === size
                      ? 'border-purple-600 text-purple-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">
              Select Colour
              {selectedColor ? (
                <span className="ml-2 font-normal text-gray-500">{selectedColor}</span>
              ) : null}
            </h3>
            <div className="flex flex-wrap gap-3">
              {product.colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  aria-pressed={selectedColor === color}
                  className={`rounded-full border-2 px-4 py-2 ${
                    selectedColor === color
                      ? 'border-purple-600 text-purple-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="quantity" className="mb-2 block font-semibold">
              Quantity
            </label>
            <select
              id="quantity"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="rounded-lg border px-3 py-2"
            >
              {Array.from({ length: MAX_QUANTITY }, (_, index) => index + 1).map(
                (value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ),
              )}
            </select>
          </div>

          {fieldError ? (
            <p className="text-sm text-red-600" role="alert">
              {fieldError}
            </p>
          ) : null}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleAddToCart}
              className="btn btn-primary flex-1"
            >
              <ShoppingBag className="h-5 w-5" />
              Add to Bag
            </button>
            <button
              type="button"
              onClick={handleWishlist}
              aria-pressed={saved}
              aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
              className={`rounded-lg border-2 p-3 ${
                saved
                  ? 'border-red-500 text-red-500'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Heart className={`h-5 w-5 ${saved ? 'fill-red-500' : ''}`} />
            </button>
          </div>

          <ul className="space-y-3 border-t pt-6 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-purple-600" /> Delivered in about 30
              minutes
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" /> 2-hour home trial after
              delivery
            </li>
            <li className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-purple-600" /> Free returns on anything
              you don’t keep
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
