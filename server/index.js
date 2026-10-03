import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';

import { env, allowedOrigins } from './config/env.js';
import orderRoutes from './routes/orders.js';
import authRoutes from './routes/auth.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { attachRealtime } from './realtime.js';

const app = express();
const httpServer = createServer(app);

// Security headers + a sane global request budget.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(express.json({ limit: '100kb' }));
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

attachRealtime(httpServer, { allowedOrigins });

let server = null;

async function start() {
  try {
    // Await the connection before accepting traffic: previously the server
    // listened immediately and early requests hung on mongoose buffering.
    // Fail within 5s rather than hanging on the 30s default.
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    if (env.isProduction) {
      // Fail fast rather than serving an app that cannot persist anything.
      process.exit(1);
    }
    console.warn('Starting without a database connection (development only)');
  }

  server = httpServer.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

async function shutdown(signal) {
  console.log(`\n${signal} received — shutting down`);
  if (server) server.close();
  try {
    await mongoose.connection.close();
  } catch {
    /* ignore */
  }
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
