import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { api, getErrorMessage } from '../lib/api';
import { useAuth } from './useAuth';
import { OrderContext } from './useOrder';
import type { CreateOrderInput } from './useOrder';
import type { Address, Order, OrderStatus } from '../types';

interface OrderListResponse {
  orders: Order[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Orders state.
 *
 * Fixes over the previous version:
 *  - every mutation uses functional updates, so concurrent responses can no
 *    longer clobber each other (previously `[...orders, created]` captured a
 *    stale array),
 *  - `pending` tracks the in-flight mutation by name instead of one global
 *    boolean that any operation could clear,
 *  - errors are surfaced and clearable,
 *  - the list endpoint's `{ orders, page, totalPages }` envelope is unpacked
 *    instead of being assigned to the array,
 *  - state updates after unmount are suppressed.
 */
export function OrderProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const run = useCallback(
    async <T,>(name: string, fn: () => Promise<T>): Promise<T> => {
      setPending(name);
      setError(null);
      try {
        return await fn();
      } catch (err) {
        if (mounted.current) setError(getErrorMessage(err));
        throw err;
      } finally {
        if (mounted.current) setPending(null);
      }
    },
    [],
  );

  /** Insert or replace an order, keeping the list sorted newest-first. */
  const upsert = useCallback((order: Order) => {
    setOrders((current) => {
      const index = current.findIndex((item) => item.id === order.id);
      if (index === -1) return [order, ...current];
      const next = [...current];
      next[index] = order;
      return next;
    });
    setCurrentOrder((prev) => (prev && prev.id === order.id ? order : prev));
  }, []);

  const fetchOrders = useCallback(async (nextPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<OrderListResponse>(
        `/orders?page=${nextPage}&limit=20`,
      );
      if (!mounted.current) return;
      setOrders(data.orders);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      if (mounted.current) setError(getErrorMessage(err));
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  // Load the user's orders once authenticated; clear them on logout.
  useEffect(() => {
    if (isAuthenticated) {
      void fetchOrders(1);
    } else {
      setOrders([]);
      setCurrentOrder(null);
      setPage(1);
      setTotalPages(1);
      setTotal(0);
    }
  }, [isAuthenticated, user?.id, fetchOrders]);

  const createOrder = useCallback(
    (items: CreateOrderInput[], address: Address) =>
      run('createOrder', async () => {
        const { data } = await api.post<Order>('/orders', { items, address });
        upsert(data);
        setCurrentOrder(data);
        return data;
      }),
    [run, upsert],
  );

  const getOrderById = useCallback(
    (orderId: string) =>
      run('getOrderById', async () => {
        const { data } = await api.get<Order>(`/orders/${orderId}`);
        upsert(data);
        return data;
      }),
    [run, upsert],
  );

  const setStatus = useCallback(
    (orderId: string, status: OrderStatus) =>
      run('setStatus', async () => {
        // Use the server's response rather than assuming the change applied.
        const { data } = await api.patch<Order>(`/orders/${orderId}/status`, {
          status,
        });
        upsert(data);
        return data;
      }),
    [run, upsert],
  );

  const startTrial = useCallback(
    (orderId: string) =>
      run('startTrial', async () => {
        const { data } = await api.post<Order>(`/orders/${orderId}/start-trial`);
        upsert(data);
        return data;
      }),
    [run, upsert],
  );

  const completeTrialAndPay = useCallback(
    (orderId: string, keptItems: string[]) =>
      run('completeTrialAndPay', async () => {
        const { data } = await api.post<Order>(`/orders/${orderId}/complete-trial`, {
          keptItems,
        });
        upsert(data);
        return data;
      }),
    [run, upsert],
  );

  const initiateReturn = useCallback(
    (orderId: string) =>
      run('initiateReturn', async () => {
        // The API returns the order itself with `returnPickupCode` included.
        const { data } = await api.post<Order>(`/orders/${orderId}/initiate-return`);
        upsert(data);
        return data;
      }),
    [run, upsert],
  );

  const completeReturn = useCallback(
    (orderId: string) =>
      run('completeReturn', async () => {
        const { data } = await api.post<Order>(`/orders/${orderId}/complete-return`);
        upsert(data);
        return data;
      }),
    [run, upsert],
  );

  const cancelOrder = useCallback(
    (orderId: string) =>
      run('cancelOrder', async () => {
        const { data } = await api.post<Order>(`/orders/${orderId}/cancel`);
        upsert(data);
        return data;
      }),
    [run, upsert],
  );

  const value = useMemo(
    () => ({
      orders,
      currentOrder,
      page,
      totalPages,
      total,
      loading,
      pending,
      error,
      clearError,
      fetchOrders,
      createOrder,
      getOrderById,
      setStatus,
      startTrial,
      completeTrialAndPay,
      initiateReturn,
      completeReturn,
      cancelOrder,
      setCurrentOrder,
      upsertOrder: upsert,
    }),
    [
      orders,
      currentOrder,
      page,
      totalPages,
      total,
      loading,
      pending,
      error,
      clearError,
      fetchOrders,
      createOrder,
      getOrderById,
      setStatus,
      startTrial,
      completeTrialAndPay,
      initiateReturn,
      completeReturn,
      cancelOrder,
      upsert,
    ],
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}
