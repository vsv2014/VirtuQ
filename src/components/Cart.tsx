import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Clock, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

import { useCart } from '../context/useCart';
import { computeTotals, formatINR, MAX_QUANTITY } from '../lib/format';

export function Cart() {
  const navigate = useNavigate();
  const { items, count, removeItem, updateQuantity, clear } = useCart();

  // Same helper the checkout page uses, so the two totals can never disagree.
  const totals = computeTotals(items);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <h2 className="mb-4 text-2xl font-bold">Your cart is empty</h2>
        <p className="mb-8 text-gray-600">
          Add items to your cart to start the home trial experience
        </p>
        <Link to="/" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Shopping Cart
          <span className="ml-2 text-base font-normal text-gray-500">
            {count} {count === 1 ? 'item' : 'items'}
          </span>
        </h1>
        <button
          type="button"
          onClick={clear}
          className="text-sm text-gray-500 hover:text-red-600"
        >
          Clear cart
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm"
            >
              {/* Real product image + the variant the shopper actually chose. */}
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                className="h-24 w-24 rounded object-cover"
              />

              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.brand}</p>
                <p className="text-sm text-gray-600">
                  Size: {item.size} | Colour: {item.color}
                </p>

                <div className="mt-2 flex items-center gap-4">
                  <label htmlFor={`qty-${item.id}`} className="sr-only">
                    Quantity for {item.name}
                  </label>
                  <select
                    id={`qty-${item.id}`}
                    value={item.quantity}
                    onChange={(event) =>
                      updateQuantity(item.id, Number(event.target.value))
                    }
                    className="rounded border px-2 py-1"
                  >
                    {Array.from(
                      { length: MAX_QUANTITY },
                      (_, index2) => index2 + 1,
                    ).map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.name} from cart`}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold">{formatINR(item.price * item.quantity)}</p>
                {item.quantity > 1 ? (
                  <p className="text-xs text-gray-500">{formatINR(item.price)} each</p>
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="h-fit rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatINR(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span>{formatINR(totals.gst)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between">
              <span>Handling Fee</span>
              <span>{formatINR(totals.handlingFee)}</span>
            </div>
            <div className="flex justify-between border-t pt-3 font-semibold">
              <span>Total</span>
              <span>{formatINR(totals.total)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="btn btn-primary mt-6 w-full"
          >
            <Clock className="h-5 w-5" />
            Start Home Trial
          </button>

          <p className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            Your 2-hour trial starts after delivery
          </p>
        </div>
      </div>
    </div>
  );
}
