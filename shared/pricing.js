/**
 * Money + pricing rules shared by the web client and the API server.
 *
 * All amounts are integer paise-free rupees and are rounded once, at the end,
 * so the client and server always agree on the number shown to the user.
 */

/** Trial window, in milliseconds. Hardcoded in 4 places before; now defined once. */
export const TRIAL_DURATION_MS = 2 * 60 * 60 * 1000;

/** Flat handling fee applied to every order. */
export const HANDLING_FEE = 49;

/** GST applied to kept items at trial completion. */
export const GST_RATE = 0.18;

/** Home-trial copy promises "up to 10 clothes"; enforce it server-side too. */
export const MAX_TRIAL_ITEMS = 10;

/** Max quantity of a single line item. */
export const MAX_QUANTITY = 5;

/** Delivery ETA shown before an order ships. */
export const DELIVERY_ETA_MS = 4 * 60 * 60 * 1000;

/** Estimated pickup window once a return is confirmed. */
export const PICKUP_ETA_MS = 15 * 60 * 1000;

/** Round to whole rupees — the only place rounding is allowed to happen. */
export function roundRupees(value) {
  return Math.round(value);
}

/**
 * Totals for a set of trial items.
 * @param {{price: number, quantity?: number}[]} items
 */
export function computeTotals(items = []) {
  const subtotal = roundRupees(
    items.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0),
  );
  const gst = roundRupees(subtotal * GST_RATE);
  const deliveryFee = 0;
  const handlingFee = subtotal > 0 ? HANDLING_FEE : 0;
  const total = roundRupees(subtotal + gst + deliveryFee + handlingFee);

  return { subtotal, gst, deliveryFee, handlingFee, total };
}

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const inrFormatterWithPaise = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format rupees for display. Uses Intl so thousands separators and the ₹
 * symbol are consistent everywhere (prevents 0.30000000000000004 artifacts).
 */
export function formatINR(value, { paise = false } = {}) {
  const amount = Number.isFinite(value) ? value : 0;
  return (paise ? inrFormatterWithPaise : inrFormatter).format(amount);
}

/** Percentage off, always >= 0. */
export function discountPercent(price, originalPrice) {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
