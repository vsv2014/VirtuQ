import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import orderRoutes from './routes/orders.js';
import { auth } from './middleware/auth.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/trynstyle')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/orders', orderRoutes);

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('join-order-room', (orderId) => {
    socket.join(`order-${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Broadcast order updates
export const broadcastOrderUpdate = (orderId, update) => {
  io.to(`order-${orderId}`).emit('order-update', update);
};

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});