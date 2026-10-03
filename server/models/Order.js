import mongoose from 'mongoose';
import crypto from 'node:crypto';
import { TRIAL_DURATION_MS, computeTotals } from '../../shared/pricing.js';

export const ORDER_STATUS = {
  CREATED: 'created',
  CONFIRMED: 'confirmed',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  TRIAL_STARTED: 'trial_started',
  TRIAL_COMPLETED: 'trial_completed',
  RETURN_INITIATED: 'return_initiated',
  RETURN_COMPLETED: 'return_completed',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUSES = Object.values(ORDER_STATUS);

/**
 * Explicit state machine. Previously PATCH /:id/status accepted any string,
 * letting a client jump straight from `created` to `return_completed`.
 */
export const STATUS_TRANSITIONS = {
  [ORDER_STATUS.CREATED]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.OUT_FOR_DELIVERY]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.TRIAL_STARTED],
  [ORDER_STATUS.TRIAL_STARTED]: [ORDER_STATUS.TRIAL_COMPLETED],
  [ORDER_STATUS.TRIAL_COMPLETED]: [ORDER_STATUS.RETURN_INITIATED],
  [ORDER_STATUS.RETURN_INITIATED]: [ORDER_STATUS.RETURN_COMPLETED],
  [ORDER_STATUS.RETURN_COMPLETED]: [],
  [ORDER_STATUS.CANCELLED]: [],
};

export const canTransition = (from, to) =>
  Boolean(STATUS_TRANSITIONS[from]?.includes(to));

const itemSchema = new mongoose.Schema(
  {
    /** Catalog product id (products live in shared/catalog.js, not in Mongo). */
    productId: { type: String, required: true },
    name: { type: String, required: true },
    brand: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0, default: 0 },
    image: { type: String, default: '' },
    size: { type: String, required: true },
    color: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    status: {
      type: String,
      enum: ['pending', 'kept', 'returned'],
      default: 'pending',
    },
  },
  { _id: true },
);

const addressSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    pincode: String,
    city: String,
    state: String,
    locality: String,
    building: String,
    landmark: String,
    type: {
      type: String,
      enum: ['home', 'office', 'other'],
      default: 'home',
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: { type: [itemSchema], required: true },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: ORDER_STATUS.CREATED,
      index: true,
    },
    address: { type: addressSchema, required: true },

    // Timeline
    orderTime: { type: Date, default: Date.now },
    estimatedDelivery: Date,
    deliveredAt: Date,
    trialStartedAt: Date,
    trialEndsAt: Date,
    trialCompletedAt: Date,
    returnInitiatedAt: Date,
    returnCompletedAt: Date,
    cancelledAt: Date,

    // Money — always derived server-side from the catalog.
    subtotal: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    handlingFee: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'refunded'],
      default: 'pending',
    },
    paymentId: String,

    returnPickupCode: {
      type: String,
      sparse: true,
      index: true,
      select: false,
      default: null,
    },
  },
  { timestamps: true },
);

orderSchema.index({ userId: 1, createdAt: -1 });

/** Recompute and persist totals from the current item list. */
orderSchema.methods.recalculateTotals = function recalculateTotals() {
  const chargeable = this.items.filter((item) => item.status !== 'returned');
  const totals = computeTotals(chargeable);
  this.subtotal = totals.subtotal;
  this.gst = totals.gst;
  this.deliveryFee = totals.deliveryFee;
  this.handlingFee = totals.handlingFee;
  this.total = totals.total;
  return this;
};

orderSchema.methods.startTrial = function startTrial() {
  const now = new Date();
  this.status = ORDER_STATUS.TRIAL_STARTED;
  this.trialStartedAt = now;
  this.trialEndsAt = new Date(now.getTime() + TRIAL_DURATION_MS);
  return this.save();
};

orderSchema.methods.completeTrial = function completeTrial(keptItemIds = []) {
  const kept = new Set(keptItemIds.map(String));

  this.items.forEach((item) => {
    // Mutate subdocuments in place — replacing them with spread POJOs drops
    // mongoose change tracking and internal state.
    item.status = kept.has(String(item.productId)) ? 'kept' : 'returned';
  });

  this.status = ORDER_STATUS.TRIAL_COMPLETED;
  this.trialCompletedAt = new Date();
  this.paymentStatus = 'pending';
  return this.recalculateTotals().save();
};

orderSchema.methods.initiateReturn = function initiateReturn() {
  const itemsToReturn = this.items.filter((item) => item.status === 'returned');
  if (itemsToReturn.length === 0) {
    throw new Error('There are no items to return on this order');
  }

  this.status = ORDER_STATUS.RETURN_INITIATED;
  this.returnInitiatedAt = new Date();
  // Cryptographically random: Math.random() is predictable.
  this.returnPickupCode = crypto
    .randomInt(0, 1_000_000_000)
    .toString(36)
    .toUpperCase()
    .padStart(7, '0');
  return this.save();
};

orderSchema.methods.completeReturn = function completeReturn() {
  this.status = ORDER_STATUS.RETURN_COMPLETED;
  this.returnCompletedAt = new Date();
  if (this.paymentStatus === 'completed') {
    this.paymentStatus = 'refunded';
  }
  return this.save();
};

orderSchema.methods.cancel = function cancel() {
  this.status = ORDER_STATUS.CANCELLED;
  this.cancelledAt = new Date();
  return this.save();
};

export const Order = mongoose.model('Order', orderSchema);
