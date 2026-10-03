import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Package, RefreshCw, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

import { useOrder } from '../context/useOrder';
import { useToast } from '../context/useToast';
import { useSocket } from '../hooks/useSocket';
import { getErrorMessage } from '../lib/api';
import { formatDateTime, formatINR, formatStatus } from '../lib/format';
import { Spinner } from './Spinner';
import { NotFound } from './NotFound';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { Order } from '../types';

const FLOW = [
  'created',
  'confirmed',
  'out_for_delivery',
  'delivered',
  'trial_started',
  'trial_completed',
  'return_initiated',
  'return_completed',
];

const STEP_LABELS: Record<string, string> = {
  created: 'Order Placed',
  confirmed: 'Confirmed',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  trial_started: 'Trial Started',
  trial_completed: 'Trial Completed',
  return_initiated: 'Return Pickup Scheduled',
  return_completed: 'Return Collected',
};

function Timeline({ order }: { order: Order }) {
  const currentIndex = FLOW.indexOf(order.status);
  const involvesReturn =
    order.status.startsWith('return') ||
    order.items.some((item) => item.status === 'returned');

  const steps = FLOW.filter((step) =>
    step.startsWith('return') ? involvesReturn : true,
  );

  if (order.status === 'cancelled') {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
        This order was cancelled
        {order.cancelledAt ? ` on ${formatDateTime(order.cancelledAt)}` : ''}.
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {steps.map((step, index) => {
        const done = currentIndex >= FLOW.indexOf(step);
        return (
          <li key={step} className="flex items-center gap-3">
            <span
              className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                done ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <span className={done ? 'text-gray-900' : 'text-gray-500'}>
              {STEP_LABELS[step] ?? formatStatus(step)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const {
    orders,
    currentOrder,
    loading,
    error,
    pending,
    getOrderById,
    startTrial,
    cancelOrder,
    clearError,
  } = useOrder();
  const { show } = useToast();
  const [missing, setMissing] = useState(false);

  // Live updates for this order (authenticated socket room).
  useSocket(id);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        await getOrderById(id);
      } catch {
        if (!cancelled) setMissing(true);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const order =
    currentOrder?.id === id ? currentOrder : (orders.find((o) => o.id === id) ?? null);

  if (missing) return <NotFound />;

  if (!order) {
    return loading ? (
      <Spinner label="Loading order…" />
    ) : (
      <div className="container mx-auto px-4 py-12">
        {error ? (
          <div className="rounded-lg bg-red-50 p-6 text-center">
            <p className="mb-4 text-red-700">{error}</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                clearError();
                if (id) getOrderById(id).catch(() => setMissing(true));
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        ) : (
          <Spinner label="Loading order…" />
        )}
      </div>
    );
  }

  const handleStartTrial = async () => {
    try {
      await startTrial(order.id);
      show('Trial started — 2 hours on the clock', 'success');
    } catch (err) {
      show(getErrorMessage(err), 'error');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelOrder(order.id);
      show('Order cancelled', 'success');
    } catch (err) {
      show(getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/orders"
        className="mb-6 inline-flex items-center text-sm text-purple-600 hover:underline"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        All orders
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-600">
            Placed {formatDateTime(order.orderTime)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-white p-6 shadow-sm"
          >
            <h2 className="mb-4 flex items-center text-lg font-semibold">
              <Truck className="mr-2 h-5 w-5" />
              Delivery Status
            </h2>
            <Timeline order={order} />
            {order.estimatedDelivery && order.status !== 'delivered' ? (
              <p className="mt-4 text-sm text-purple-600">
                Estimated delivery by {formatDateTime(order.estimatedDelivery)}
              </p>
            ) : null}
          </motion.section>

          <section className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center text-lg font-semibold">
              <Package className="mr-2 h-5 w-5" />
              Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="h-20 w-20 rounded object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Size: {item.size} | Colour: {item.color} × {item.quantity}
                    </p>
                    <p className="text-sm font-medium">
                      {formatINR(item.price * item.quantity)}
                    </p>
                  </div>
                  {item.status !== 'pending' ? (
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        item.status === 'kept'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {item.status === 'kept' ? 'Kept' : 'Returned'}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-2 flex items-center text-lg font-semibold">
              <MapPin className="mr-2 h-5 w-5" />
              Delivery Address
            </h2>
            <p className="text-gray-700">
              {order.address.name}
              <br />
              {order.address.building}, {order.address.locality}
              <br />
              {order.address.city}, {order.address.state} - {order.address.pincode}
              <br />
              Phone: {order.address.phone}
            </p>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Bill Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatINR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%)</span>
                <span>{formatINR(order.gst)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{formatINR(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Handling Fee</span>
                <span>{formatINR(order.handlingFee)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-semibold">
                <span>Total</span>
                <span>{formatINR(order.total)}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Payment</span>
                <span className="capitalize text-gray-600">{order.paymentStatus}</span>
              </div>
            </div>
          </section>

          {order.returnPickupCode ? (
            <section className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-2 text-lg font-semibold">Pickup Code</h2>
              <p className="font-mono text-2xl tracking-widest">
                {order.returnPickupCode}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Share this with the delivery partner when they collect.
              </p>
            </section>
          ) : null}

          <section className="space-y-3">
            {order.status === 'delivered' ? (
              <button
                type="button"
                className="btn btn-primary w-full"
                onClick={handleStartTrial}
                disabled={pending === 'startTrial'}
              >
                <Clock className="h-4 w-4" />
                Start 2-hour trial
              </button>
            ) : null}

            {order.status === 'trial_started' ? (
              <Link to={`/home-trial/${order.id}`} className="btn btn-primary w-full">
                Decide what to keep
              </Link>
            ) : null}

            {order.status === 'trial_completed' ? (
              <Link to={`/returns/${order.id}`} className="btn btn-primary w-full">
                Schedule return pickup
              </Link>
            ) : null}

            {['created', 'confirmed'].includes(order.status) ? (
              <button
                type="button"
                className="btn btn-secondary w-full"
                onClick={handleCancel}
                disabled={pending === 'cancelOrder'}
              >
                Cancel order
              </button>
            ) : null}

            <Link to="/orders" className="btn btn-ghost w-full">
              Back to orders
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
