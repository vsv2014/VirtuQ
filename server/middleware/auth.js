import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), phone: user.phone }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

/** Verifies a JWT and returns the payload, or null when invalid. */
export function verifyToken(token) {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Express middleware: requires `Authorization: Bearer <token>`.
 * Previously this file did not exist at all, so the server crashed on boot.
 */
export async function auth(req, res, next) {
  try {
    const header = req.get('authorization') || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const payload = verifyToken(token);
    if (!payload?.sub) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'Account no longer exists' });
    }

    req.user = user;
    req.token = token;
    return next();
  } catch (error) {
    return next(error);
  }
}

/**
 * Socket.IO middleware — rejects unauthenticated connections.
 * Previously any client could connect and join any order room.
 */
export function socketAuth(socket, next) {
  const token =
    socket.handshake?.auth?.token ||
    socket.handshake?.headers?.authorization?.replace(/^Bearer\s+/i, '');

  const payload = token ? verifyToken(token) : null;
  if (!payload?.sub) {
    return next(new Error('unauthorized'));
  }

  socket.data.userId = payload.sub;
  return next();
}

/** Loads an order and asserts ownership, or responds 404/403. */
export async function loadOwnedOrder(req, res, next) {
  try {
    const { Order } = await import('../models/Order.js');
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.userId.toString() !== req.user._id.toString()) {
      // Distinct from "not found" so clients can tell them apart.
      return res.status(403).json({ message: 'Not your order' });
    }

    req.order = order;
    return next();
  } catch (error) {
    return next(error);
  }
}
