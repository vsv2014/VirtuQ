import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useOrder } from '../context/OrderContext';

export function useSocket(orderId: string) {
  const socket = useRef<Socket>();
  const { updateOrderStatus } = useOrder();

  useEffect(() => {
    socket.current = io(import.meta.env.VITE_API_URL || 'http://localhost:3000');

    socket.current.emit('join-order-room', orderId);

    socket.current.on('order-update', (update) => {
      updateOrderStatus(orderId, update.status);
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [orderId]);

  return socket.current;
}