import { Server } from 'socket.io';
import { Order } from './models/Order.js';
import { socketAuth } from './middleware/auth.js';

let io = null;

/**
 * Attaches Socket.IO to the HTTP server.
 * Connections are authenticated and room joins are ownership-checked, so a
 * client can no longer subscribe to somebody else's order updates.
 */
export function attachRealtime(httpServer, { allowedOrigins = [] } = {}) {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
    },
  });

  io.use(socketAuth);

  io.on('connection', (socket) => {
    socket.on('join-order-room', async (orderId) => {
      try {
        const order = await Order.findById(orderId).select('userId');
        if (!order || order.userId.toString() !== socket.data.userId) {
          socket.emit('order-error', { message: 'Not authorised for this order' });
          return;
        }
        socket.join(`order-${orderId}`);
      } catch {
        socket.emit('order-error', { message: 'Invalid order id' });
      }
    });

    socket.on('leave-order-room', (orderId) => {
      socket.leave(`order-${orderId}`);
    });
  });

  return io;
}

export function getIO() {
  return io;
}

/**
 * Push an order update to everyone watching that order.
 * Now actually called by the order routes (previously exported and never used).
 */
export function broadcastOrderUpdate(orderId, update) {
  if (!io) return;
  io.to(`order-${orderId}`).emit('order-update', { orderId, ...update });
}
