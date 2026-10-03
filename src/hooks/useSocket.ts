import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { getToken } from '../lib/authToken';
import { useOrder } from '../context/useOrder';
import type { Order } from '../types';

interface OrderUpdatePayload {
  orderId?: string;
  status?: string;
  order?: Order;
}

/**
 * Subscribes to realtime updates for one order.
 *
 * Fixes over the previous version:
 *  - `upsertOrder` is kept in a ref so the effect can depend only on `orderId`
 *    while still calling the latest callback (no stale closure, no resubscribe
 *    on every render),
 *  - the socket is authenticated with the stored JWT,
 *  - listeners are removed and the socket disconnected on cleanup,
 *  - reconnection is configured instead of failing silently forever.
 */
export function useSocket(orderId?: string | null): Socket | null {
  const { upsertOrder } = useOrder();
  const socketRef = useRef<Socket | null>(null);

  const upsertRef = useRef(upsertOrder);
  useEffect(() => {
    upsertRef.current = upsertOrder;
  }, [upsertOrder]);

  useEffect(() => {
    if (!orderId) return undefined;

    const socket = io({
      // Same-origin: the Vite dev server proxies /socket.io to the API.
      auth: { token: getToken() },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-order-room', orderId);
    });

    socket.on('order-update', (payload: OrderUpdatePayload) => {
      if (payload?.order) {
        upsertRef.current(payload.order);
      }
    });

    socket.on('order-error', (payload: { message?: string }) => {
      console.warn('[socket]', payload?.message ?? 'order error');
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [orderId]);

  return socketRef.current;
}
