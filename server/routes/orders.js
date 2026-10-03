import express from 'express';
import { Order, ORDER_STATUS, canTransition } from '../models/Order.js';
import { auth, loadOwnedOrder } from '../middleware/auth.js';
import { broadcastOrderUpdate } from '../realtime.js';
import { findProduct } from '../../shared/catalog.js';
import {
  DELIVERY_ETA_MS,
  MAX_TRIAL_ITEMS,
  MAX_QUANTITY,
} from '../../shared/pricing.js';

const router = express.Router();

const REQUIRED_ADDRESS_FIELDS = [
  'name',
  'phone',
  'pincode',
  'city',
  'state',
  'locality',
  'building',
];

/** Consistent envelope: the order is always the resource, extras are named. */
function serialize(order, extra = {}) {
  const obj = order.toObject();
  return {
    ...obj,
    id: obj._id.toString(),
    items: (obj.items || []).map((item) => ({
      ...item,
      id: item._id ? item._id.toString() : item.productId,
      itemId: item._id ? item._id.toString() : item.productId,
    })),
    ...extra,
  };
}

/**
 * Resolves each submitted line item against the catalog.
 * The server is the price authority: any price sent by the client is ignored,
 * which closes the "client tampering with amounts" hole.
 */
function buildOrderItems(submitted = []) {
  if (!Array.isArray(submitted) || submitted.length === 0) {
    throw Object.assign(new Error('Order must contain at least one item'), {
      status: 400,
    });
  }

  const seen = new Map();

  for (const raw of submitted) {
    const productId = String(raw?.productId ?? '').trim();
    const product = findProduct(productId);

    if (!product) {
      throw Object.assign(new Error(`Product '${productId}' is no longer available`), {
        status: 400,
      });
    }

    const size = String(raw?.size ?? '').trim();
    if (!product.sizes.includes(size)) {
      throw Object.assign(
        new Error(`Invalid size '${size || '(none)'}' for ${product.name}`),
        { status: 400 },
      );
    }

    const color = String(raw?.color ?? '').trim();
    if (!product.colors.includes(color)) {
      throw Object.assign(
        new Error(`Invalid color '${color || '(none)'}' for ${product.name}`),
        { status: 400 },
      );
    }

    const quantity = Number(raw?.quantity ?? 1);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      throw Object.assign(new Error(`Quantity must be between 1 and ${MAX_QUANTITY}`), {
        status: 400,
      });
    }

    // Collapse duplicate variant lines.
    const key = `${productId}|${size}|${color}`;
    if (seen.has(key)) {
      const existing = seen.get(key);
      existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + quantity);
    } else {
      seen.set(key, {
        productId,
        name: product.name,
        brand: product.brand,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        size,
        color,
        quantity,
        status: 'pending',
      });
    }
  }

  const items = [...seen.values()];
  const unitCount = items.reduce((sum, item) => sum + item.quantity, 0);
  if (unitCount > MAX_TRIAL_ITEMS) {
    throw Object.assign(
      new Error(`A home trial can include at most ${MAX_TRIAL_ITEMS} items`),
      { status: 400 },
    );
  }

  return items;
}

function validateAddress(address = {}) {
  const missing = REQUIRED_ADDRESS_FIELDS.filter(
    (field) => !String(address?.[field] ?? '').trim(),
  );
  if (missing.length > 0) {
    throw Object.assign(new Error(`Missing address fields: ${missing.join(', ')}`), {
      status: 400,
    });
  }

  if (!/^\d{6}$/.test(String(address.pincode))) {
    throw Object.assign(new Error('Enter a valid 6-digit pincode'), {
      status: 400,
    });
  }
  if (!/^[6-9]\d{9}$/.test(String(address.phone))) {
    throw Object.assign(new Error('Enter a valid 10-digit mobile number'), {
      status: 400,
    });
  }

  return {
    name: String(address.name).trim(),
    phone: String(address.phone).trim(),
    pincode: String(address.pincode).trim(),
    city: String(address.city).trim(),
    state: String(address.state).trim(),
    locality: String(address.locality).trim(),
    building: String(address.building).trim(),
    landmark: String(address.landmark ?? '').trim(),
    type: ['home', 'office', 'other'].includes(address.type) ? address.type : 'home',
  };
}

/** Push the new state to everyone watching this order. */
function broadcast(order) {
  broadcastOrderUpdate(order._id.toString(), {
    status: order.status,
    paymentStatus: order.paymentStatus,
    order: serialize(order),
  });
}

/** Create new order */
router.post('/', auth, async (req, res, next) => {
  try {
    const items = buildOrderItems(req.body?.items);
    const address = validateAddress(req.body?.address);

    const order = new Order({
      userId: req.user._id,
      items,
      address,
      status: ORDER_STATUS.CREATED,
      estimatedDelivery: new Date(Date.now() + DELIVERY_ETA_MS),
    });

    // Server-side totals — previously `total` was never set at all.
    order.recalculateTotals();
    await order.save();

    return res.status(201).json(serialize(order));
  } catch (error) {
    return next(error);
  }
});

/** List the current user's orders (newest first, paginated). */
router.get('/', auth, async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ userId: req.user._id }),
    ]);

    return res.json({
      orders: orders.map((order) => serialize(order)),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    return next(error);
  }
});

/** Get a single order */
router.get('/:id', auth, loadOwnedOrder, (req, res) => {
  res.json(serialize(req.order));
});

/** Update status, guarded by the documented state machine. */
router.patch('/:id/status', auth, loadOwnedOrder, async (req, res, next) => {
  try {
    const { status } = req.body ?? {};

    if (!status) {
      return res.status(400).json({ message: '`status` is required' });
    }
    if (!canTransition(req.order.status, status)) {
      return res.status(409).json({
        message: `Cannot change status from '${req.order.status}' to '${status}'`,
        allowed: (await import('../models/Order.js')).STATUS_TRANSITIONS[
          req.order.status
        ],
      });
    }

    req.order.status = status;
    if (status === ORDER_STATUS.DELIVERED) {
      req.order.deliveredAt = new Date();
    }
    await req.order.save();
    broadcast(req.order);

    return res.json(serialize(req.order));
  } catch (error) {
    return next(error);
  }
});

/** Start the 2-hour trial */
router.post('/:id/start-trial', auth, loadOwnedOrder, async (req, res, next) => {
  try {
    if (req.order.status !== ORDER_STATUS.DELIVERED) {
      return res.status(409).json({
        message: 'Order must be delivered before the trial can start',
        currentStatus: req.order.status,
      });
    }
    await req.order.startTrial();
    broadcast(req.order);

    return res.json(serialize(req.order));
  } catch (error) {
    return next(error);
  }
});

/** Keep some items, return the rest; recalculates the payable total. */
router.post('/:id/complete-trial', auth, loadOwnedOrder, async (req, res, next) => {
  try {
    if (req.order.status !== ORDER_STATUS.TRIAL_STARTED) {
      return res.status(409).json({
        message: 'Order is not in trial',
        currentStatus: req.order.status,
      });
    }

    const keptItems = Array.isArray(req.body?.keptItems)
      ? req.body.keptItems.map(String)
      : [];

    const known = new Set(req.order.items.map((i) => String(i.productId)));
    const unknown = keptItems.filter((id) => !known.has(id));
    if (unknown.length > 0) {
      return res.status(400).json({
        message: 'keptItems contains products not on this order',
        unknown,
      });
    }

    await req.order.completeTrial(keptItems);
    broadcast(req.order);

    return res.json(serialize(req.order));
  } catch (error) {
    return next(error);
  }
});

/** Initiate return of the items the user did not keep. */
router.post('/:id/initiate-return', auth, loadOwnedOrder, async (req, res, next) => {
  try {
    if (req.order.status !== ORDER_STATUS.TRIAL_COMPLETED) {
      return res.status(409).json({
        message: 'Complete the trial before initiating a return',
        currentStatus: req.order.status,
      });
    }

    await req.order.initiateReturn();

    // returnPickupCode is `select: false`, so read it back explicitly.
    const withCode = await Order.findById(req.order._id).select('+returnPickupCode');

    broadcast(req.order);

    return res.json(
      serialize(req.order, { returnPickupCode: withCode.returnPickupCode }),
    );
  } catch (error) {
    return next(error);
  }
});

/** Mark the pickup as collected. */
router.post('/:id/complete-return', auth, loadOwnedOrder, async (req, res, next) => {
  try {
    if (req.order.status !== ORDER_STATUS.RETURN_INITIATED) {
      return res.status(409).json({
        message: 'No return in progress for this order',
        currentStatus: req.order.status,
      });
    }
    await req.order.completeReturn();
    broadcast(req.order);

    return res.json(serialize(req.order));
  } catch (error) {
    return next(error);
  }
});

/** Cancel before dispatch. */
router.post('/:id/cancel', auth, loadOwnedOrder, async (req, res, next) => {
  try {
    if (!canTransition(req.order.status, ORDER_STATUS.CANCELLED)) {
      return res.status(409).json({
        message: `Cannot cancel an order in status '${req.order.status}'`,
      });
    }
    await req.order.cancel();
    broadcast(req.order);

    return res.json(serialize(req.order));
  } catch (error) {
    return next(error);
  }
});

export default router;
