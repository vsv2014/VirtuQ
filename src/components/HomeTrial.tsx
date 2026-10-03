import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Countdown from 'react-countdown';
import { motion } from 'framer-motion';
import { Clock, Check, X, ArrowRight, ArrowLeft, CreditCard, Plus } from 'lucide-react';

import { useOrder } from '../context/useOrder';
import { useToast } from '../context/useToast';
import { getErrorMessage } from '../lib/api';
import { computeTotals, formatINR, TRIAL_DURATION_MS } from '../lib/format';
import { Spinner } from './Spinner';
import type { Order } from '../types';

const pad = (value: number) => String(value).padStart(2, '0');

export function HomeTrial() {
  const { orderId } = useParams();
  const { orders, loading, completeTrialAndPay, pending } = useOrder();
  const { show } = useToast();

  const [step, setStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const activeOrder = useMemo<Order | null>(() => {
    if (orderId) {
      return orders.find((order) => order.id === orderId) ?? null;
    }
    return (
      orders.find((order) => order.status === 'trial_started') ??
      orders.find((order) => order.status === 'delivered') ??
      null
    );
  }, [orders, orderId]);

  /**
   * The trial deadline comes from the server (`order.trialEndsAt`), so it no
   * longer resets to 2:00:00 every time the component re-renders.
   */
  const trialEndTime = useMemo(() => {
    if (!activeOrder) return null;
    if (activeOrder.trialEndsAt) return new Date(activeOrder.trialEndsAt).getTime();
    if (activeOrder.deliveredAt) {
      return new Date(activeOrder.deliveredAt).getTime() + TRIAL_DURATION_MS;
    }
    return null;
  }, [activeOrder]);

  // Reset the selection when the order changes.
  useEffect(() => {
    setSelectedItems([]);
    setStep(1);
  }, [activeOrder?.id]);

  const keptItems = useMemo(
    () =>
      (activeOrder?.items ?? []).filter((item) =>
        selectedItems.includes(item.productId),
      ),
    [activeOrder, selectedItems],
  );

  const totals = useMemo(() => computeTotals(keptItems), [keptItems]);

  const handleItemSelection = (productId: string) => {
    setSelectedItems((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  };

  const handlePay = async () => {
    if (!activeOrder) return;
    try {
      await completeTrialAndPay(activeOrder.id, selectedItems);
      show('Payment recorded — thanks for shopping with TryNStyle', 'success');
      setStep(1);
    } catch (error) {
      show(getErrorMessage(error), 'error');
    }
  };

  if (loading && orders.length === 0) {
    return <Spinner label="Finding your trial…" />;
  }

  if (!activeOrder) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Clock className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <h2 className="mb-4 text-2xl font-bold">No active trial</h2>
        <p className="mb-8 text-gray-600">
          Once your order is delivered you can start a 2-hour home trial.
        </p>
        <Link to="/orders" className="btn btn-primary">
          View my orders
        </Link>
      </div>
    );
  }

  const items = activeOrder.items;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-purple-50 p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-600" />
          <span className="font-medium">Trial Period Remaining:</span>
        </div>
        {trialEndTime ? (
          <Countdown
            date={trialEndTime}
            renderer={({ hours, minutes, seconds, completed }) =>
              completed ? (
                <span className="text-lg font-bold text-red-600">Trial expired</span>
              ) : (
                <span className="text-lg font-bold text-purple-600">
                  {pad(hours)}:{pad(minutes)}:{pad(seconds)}
                </span>
              )
            }
          />
        ) : (
          <span className="text-sm text-gray-600">
            Starts as soon as your order is delivered
          </span>
        )}
      </div>

      <nav className="mb-8" aria-label="Trial progress">
        <ol className="flex items-center justify-between">
          {[
            { number: 1, label: 'Select' },
            { number: 2, label: 'Review' },
            { number: 3, label: 'Pay' },
          ].map((item) => (
            <li key={item.number} className="flex flex-1 flex-col items-center">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  step >= item.number
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
                aria-current={step === item.number ? 'step' : undefined}
              >
                {item.number}
              </span>
              <span className="mt-2 text-sm text-gray-600">{item.label}</span>
            </li>
          ))}
        </ol>
      </nav>

      {step === 1 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold">Select Items to Keep</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {items.map((item) => {
              const selected = selectedItems.includes(item.productId);
              return (
                <div
                  key={item.id}
                  className={`flex gap-4 rounded-lg bg-white p-4 shadow-sm ${
                    selected ? 'ring-2 ring-purple-600' : ''
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="h-32 w-32 rounded object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.brand}</p>
                    <p className="text-sm">
                      Size: {item.size} | Colour: {item.color}
                    </p>
                    <p className="mt-2 font-bold">
                      {formatINR(item.price * item.quantity)}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleItemSelection(item.productId)}
                      aria-pressed={selected}
                      className={`mt-4 flex items-center gap-2 rounded-lg px-4 py-2 ${
                        selected
                          ? 'bg-purple-600 text-white'
                          : 'border border-purple-600 text-purple-600'
                      }`}
                    >
                      {selected ? (
                        <>
                          <Check className="h-4 w-4" />
                          Selected to Keep
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Keep This Item
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="btn btn-primary"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      ) : null}

      {step === 2 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold">Review Selection</h2>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-medium">Items to Keep</h3>
            <div className="space-y-4">
              {keptItems.length === 0 ? (
                <p className="text-sm text-gray-500">
                  You haven’t selected anything yet.
                </p>
              ) : (
                keptItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="h-16 w-16 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Size: {item.size} | Colour: {item.color}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold">{formatINR(item.price * item.quantity)}</p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 border-t pt-6">
              <h3 className="mb-4 font-medium">Items to Return</h3>
              <div className="space-y-4">
                {items
                  .filter((item) => !selectedItems.includes(item.productId))
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between opacity-50"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          className="h-16 w-16 rounded object-cover"
                        />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            Size: {item.size} | Colour: {item.color}
                          </p>
                        </div>
                      </div>
                      <X className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(1)} className="btn btn-ghost">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="btn btn-primary"
            >
              Proceed to Payment
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      ) : null}

      {step === 3 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold">Payment</h2>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-medium">Bill Summary</h3>
            <div className="space-y-2">
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
                <span>{formatINR(totals.deliveryFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Handling Fee</span>
                <span>{formatINR(totals.handlingFee)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-lg font-semibold">
                <span>Total</span>
                <span>{formatINR(totals.total)}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary mt-6 w-full"
              onClick={handlePay}
              disabled={pending === 'completeTrialAndPay'}
            >
              <CreditCard className="h-5 w-5" />
              {pending === 'completeTrialAndPay'
                ? 'Processing…'
                : `Pay ${formatINR(totals.total)}`}
            </button>

            <div className="mt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn btn-ghost"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
