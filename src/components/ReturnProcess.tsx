import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Package, Clock, Truck, QrCode } from 'lucide-react';

import { useOrder } from '../context/useOrder';
import { useToast } from '../context/useToast';
import { getErrorMessage } from '../lib/api';
import { formatINR, formatTime, PICKUP_ETA_MS } from '../lib/format';
import { Spinner } from './Spinner';
import type { Order } from '../types';

export function ReturnProcess() {
  const { orderId } = useParams();
  const { orders, loading, initiateReturn, pending } = useOrder();
  const { show } = useToast();

  // Set once when the pickup is confirmed, so it never drifts between renders.
  const [pickupTime, setPickupTime] = useState<Date | null>(null);

  const order = useMemo<Order | null>(() => {
    if (orderId) return orders.find((item) => item.id === orderId) ?? null;
    return (
      orders.find((item) => item.status === 'return_initiated') ??
      orders.find((item) => item.status === 'trial_completed') ??
      null
    );
  }, [orders, orderId]);

  const returnItems = useMemo(
    () => (order?.items ?? []).filter((item) => item.status === 'returned'),
    [order],
  );

  const alreadyScheduled = Boolean(order?.returnPickupCode);

  useEffect(() => {
    if (alreadyScheduled && !pickupTime) {
      setPickupTime(new Date(Date.now() + PICKUP_ETA_MS));
    }
  }, [alreadyScheduled, pickupTime]);

  const handleConfirmReturn = async () => {
    if (!order) return;
    try {
      await initiateReturn(order.id);
      setPickupTime(new Date(Date.now() + PICKUP_ETA_MS));
      show('Return pickup scheduled', 'success');
    } catch (error) {
      show(getErrorMessage(error), 'error');
    }
  };

  if (loading && orders.length === 0) {
    return <Spinner label="Loading return details…" />;
  }

  if (!order || returnItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <h2 className="mb-4 text-2xl font-bold">Nothing to return</h2>
        <p className="mb-8 text-gray-600">
          Finish a home trial and any items you don’t keep will appear here.
        </p>
        <Link to="/orders" className="btn btn-primary">
          View my orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Return Process</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-white p-6 shadow-sm"
          >
            <h2 className="mb-4 flex items-center text-lg font-semibold">
              <Package className="mr-2 h-5 w-5" />
              Items to Return
            </h2>

            <div className="space-y-4">
              {returnItems.map((item) => (
                <div key={item.id} className="flex gap-4 border-b pb-4 last:border-b-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="h-24 w-24 rounded object-cover"
                  />
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.brand}</p>
                    <p className="text-sm">
                      Size: {item.size} | Colour: {item.color}
                    </p>
                    <p className="mt-2 font-bold">
                      {formatINR(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {alreadyScheduled ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center text-lg font-semibold">
                  <Truck className="mr-2 h-5 w-5" />
                  Pickup Status
                </h2>
                {pickupTime ? (
                  <div className="flex items-center text-purple-600">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>Estimated pickup by {formatTime(pickupTime)}</span>
                  </div>
                ) : null}
              </div>

              <div className="mt-6 text-center">
                <h3 className="mb-4 flex items-center justify-center font-medium">
                  <QrCode className="mr-2 h-5 w-5" />
                  Show this QR code to the delivery partner
                </h3>
                <div className="inline-block rounded-lg bg-white p-4 shadow-sm">
                  {/* Encodes the one-time pickup code, not the whole item list. */}
                  <QRCodeSVG
                    value={order.returnPickupCode ?? ''}
                    size={200}
                    level="H"
                  />
                </div>
                <p className="mt-4 font-mono text-lg tracking-widest">
                  {order.returnPickupCode}
                </p>
              </div>
            </motion.div>
          ) : null}
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-lg bg-white p-6 shadow-sm"
          >
            <h2 className="mb-4 text-lg font-semibold">Return Instructions</h2>
            <ol className="space-y-3 text-sm">
              {[
                'Pack all return items in their original packaging',
                'Ensure items are in the same condition as received',
                'Keep the QR code ready for the delivery partner',
              ].map((text, index) => (
                <li key={text} className="flex gap-2">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs text-purple-600">
                    {index + 1}
                  </span>
                  {text}
                </li>
              ))}
            </ol>

            {!alreadyScheduled ? (
              <button
                type="button"
                onClick={handleConfirmReturn}
                disabled={pending === 'initiateReturn'}
                className="btn btn-primary mt-6 w-full"
              >
                {pending === 'initiateReturn' ? 'Scheduling…' : 'Confirm Return Pickup'}
              </button>
            ) : (
              <Link
                to={`/orders/${order.id}`}
                className="btn btn-secondary mt-6 w-full"
              >
                View order
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
