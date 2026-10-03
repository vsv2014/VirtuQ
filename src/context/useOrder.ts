import { createContext, useContext } from 'react';
import type { Address, Order, OrderStatus } from '../types';

export interface CreateOrderInput {
  productId: string;
  size: string;
  color: string;
  quantity: number;
}

export interface OrderListResult {
  orders: Order[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrderContextValue {
  orders: Order[];
  currentOrder: Order | null;
  page: number;
  totalPages: number;
  total: number;
  /** True while the order list is loading. */
  loading: boolean;
  /** Name of the mutation currently in flight, if any. */
  pending: string | null;
  error: string | null;
  clearError: () => void;
  fetchOrders: (page?: number) => Promise<void>;
  createOrder: (items: CreateOrderInput[], address: Address) => Promise<Order>;
  getOrderById: (orderId: string) => Promise<Order>;
  setStatus: (orderId: string, status: OrderStatus) => Promise<Order>;
  startTrial: (orderId: string) => Promise<Order>;
  completeTrialAndPay: (orderId: string, keptItems: string[]) => Promise<Order>;
  initiateReturn: (orderId: string) => Promise<Order>;
  completeReturn: (orderId: string) => Promise<Order>;
  cancelOrder: (orderId: string) => Promise<Order>;
  setCurrentOrder: (order: Order | null) => void;
  /** Apply an order pushed by the realtime socket (no extra HTTP round-trip). */
  upsertOrder: (order: Order) => void;
}

export const OrderContext = createContext<OrderContextValue | undefined>(undefined);

export function useOrder(): OrderContextValue {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}
