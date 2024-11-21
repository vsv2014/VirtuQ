import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  size: string;
  color: string;
  image: string;
  quantity: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  status: string;
  address: string;
  orderTime: string;
  estimatedDelivery: string;
  total: number;
  trialEndsAt?: string;
}

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  createOrder: (items: OrderItem[], address: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  getOrderById: (orderId: string) => Promise<Order>;
  startTrial: (orderId: string) => Promise<void>;
  completeTrialAndPay: (orderId: string, keptItems: string[]) => Promise<void>;
  initiateReturn: (orderId: string, returnItems: string[]) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/orders');
      setOrders(response.data);
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (items: OrderItem[], address: string) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/orders', { items, address });
      setOrders([...orders, response.data]);
      setCurrentOrder(response.data);
    } catch (err) {
      setError('Failed to create order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      setLoading(true);
      const response = await axios.patch(`/api/orders/${orderId}/status`, { status });
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: status } : order
      ));
      if (currentOrder?.id === orderId) {
        setCurrentOrder({ ...currentOrder, status });
      }
    } catch (err) {
      setError('Failed to update order status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getOrderById = async (orderId: string): Promise<Order> => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/orders/${orderId}`);
      return response.data;
    } catch (err) {
      setError('Failed to fetch order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const startTrial = async (orderId: string) => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/orders/${orderId}/start-trial`);
      const updatedOrder = response.data;
      setOrders(orders.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      setCurrentOrder(updatedOrder);
    } catch (err) {
      setError('Failed to start trial');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeTrialAndPay = async (orderId: string, keptItems: string[]) => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/orders/${orderId}/complete-trial`, {
        keptItems
      });
      const updatedOrder = response.data;
      setOrders(orders.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      setCurrentOrder(updatedOrder);
    } catch (err) {
      setError('Failed to complete trial');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const initiateReturn = async (orderId: string, returnItems: string[]) => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/orders/${orderId}/initiate-return`, {
        returnItems
      });
      const updatedOrder = response.data;
      setOrders(orders.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      setCurrentOrder(updatedOrder);
    } catch (err) {
      setError('Failed to initiate return');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        currentOrder,
        loading,
        error,
        createOrder,
        updateOrderStatus,
        getOrderById,
        startTrial,
        completeTrialAndPay,
        initiateReturn
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}