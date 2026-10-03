export {
  formatINR,
  computeTotals,
  discountPercent,
  roundRupees,
  TRIAL_DURATION_MS,
  HANDLING_FEE,
  GST_RATE,
  MAX_TRIAL_ITEMS,
  MAX_QUANTITY,
  DELIVERY_ETA_MS,
  PICKUP_ETA_MS,
} from '../../shared/pricing.js';

/** "10 Mar 2026, 2:30 pm" */
export function formatDateTime(value?: string | Date | null): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** "2:30 pm" */
export function formatTime(value?: string | Date | null): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Human label for an order status. */
export function formatStatus(status: string): string {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
