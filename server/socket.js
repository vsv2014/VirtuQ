const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

module.exports = {
  init: (server) => {
    io = socketIO(server, {
      cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    io.use((socket, next) => {
      if (socket.handshake.auth && socket.handshake.auth.token) {
        jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET, (err, decoded) => {
          if (err) return next(new Error('Authentication error'));
          socket.user = decoded;
          next();
        });
      } else {
        next(new Error('Authentication error'));
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('subscribe_tracking', (orderId) => {
        socket.join(`order_${orderId}`);
      });

      socket.on('unsubscribe_tracking', (orderId) => {
        socket.leave(`order_${orderId}`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) {
      console.warn('Socket.IO has not been initialized');
      return null;
    }
    return io;
  }
};
