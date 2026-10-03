import { formatStatus } from '../lib/format';
import type { OrderStatus } from '../types';

const STYLES: Record<string, string> = {
  created: 'bg-gray-100 text-gray-700',
  confirmed: 'bg-blue-100 text-blue-700',
  out_for_delivery: 'bg-amber-100 text-amber-700',
  delivered: 'bg-indigo-100 text-indigo-700',
  trial_started: 'bg-purple-100 text-purple-700',
  trial_completed: 'bg-green-100 text-green-700',
  return_initiated: 'bg-orange-100 text-orange-700',
  return_completed: 'bg-teal-100 text-teal-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function OrderStatusBadge({ status }: { status: OrderStatus | string }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        STYLES[status] ?? 'bg-gray-100 text-gray-700'
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}
