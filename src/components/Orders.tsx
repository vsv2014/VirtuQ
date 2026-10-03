import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Package, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

import { useOrder } from '../context/useOrder';
import { useToast } from '../context/useToast';
import { getErrorMessage } from '../lib/api';
import { formatDateTime, formatINR } from '../lib/format';
import { Pagination } from './Pagination';
import { Spinner } from './Spinner';
import { OrderStatusBadge } from './OrderStatusBadge';

const CANCELLABLE = ['created', 'confirmed'];

export function Orders() {
  const {
    orders,
    loading,
    error,
    pending,
    page,
    totalPages,
    fetchOrders,
    cancelOrder,
    clearError,
  } = useOrder();
  const { show } = useToast();

  useEffect(() => {
    fetchOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = async (orderId: string) => {
    try {
      await cancelOrder(orderId);
      show('Order cancelled', 'success');
    } catch (err) {
      show(getErrorMessage(err), 'error');
    }
  };

  if (loading && orders.length === 0) {
    return <Spinner label="Loading your orders…" />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <p className="mb-4 text-red-700">{error}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              clearError();
              fetchOrders(1);
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <h2 className="mb-4 text-2xl font-bold">No orders yet</h2>
        <p className="mb-8 text-gray-600">
          Place your first home trial and it will show up here.
        </p>
        <Link to="/" className="btn btn-primary">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order, index) => (
          <motion.article
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="overflow-hidden rounded-lg bg-white shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
              <div>
                <span className="font-medium">
                  Order #{order.id.slice(-8).toUpperCase()}
                </span>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="mr-1 h-4 w-4" />
                  Ordered on {formatDateTime(order.orderTime)}
                </div>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className="border-b p-4">
              <div className="space-y-3">
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
            </div>

            <div className="flex items-start gap-2 border-b p-4">
              <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
              <div>
                <h3 className="font-medium">Delivery Address</h3>
                <p className="text-sm text-gray-600">
                  {order.address.building}, {order.address.locality},{' '}
                  {order.address.city}, {order.address.state} - {order.address.pincode}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-gray-50 p-4">
              <div className="text-sm">
                <span className="text-gray-600">Total: </span>
                <span className="font-semibold">{formatINR(order.total)}</span>
                {order.estimatedDelivery ? (
                  <span className="ml-3 text-gray-600">
                    ETA {formatDateTime(order.estimatedDelivery)}
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-3">
                {CANCELLABLE.includes(order.status) ? (
                  <button
                    type="button"
                    onClick={() => handleCancel(order.id)}
                    disabled={pending === 'cancelOrder'}
                    className="text-sm text-red-600 hover:underline disabled:opacity-50"
                  >
                    Cancel order
                  </button>
                ) : null}

                <Link
                  to={`/orders/${order.id}`}
                  className="text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  View details →
                </Link>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {totalPages > 1 ? (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={fetchOrders}
        />
      ) : null}

      {loading && orders.length > 0 ? (
        <p className="mt-4 text-center text-sm text-gray-500">Refreshing orders…</p>
      ) : null}
    </div>
  );
}
