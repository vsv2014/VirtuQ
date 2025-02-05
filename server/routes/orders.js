import express from 'express';
import { Order } from '../models/Order.js';
import { auth } from '../middleware/auth.js';
import { generateQRCode } from '../utils/qrcode.js';

const router = express.Router();

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    const { items, address } = req.body;
    const order = new Order({
      userId: req.user._id,
      items,
      address,
      estimatedDelivery: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours from now
    });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all orders for user
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start trial period
router.post('/:id/start-trial', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: 'delivered'
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found or not eligible for trial' });
    }

    await order.startTrial();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Complete trial and process payment
router.post('/:id/complete-trial', auth, async (req, res) => {
  try {
    const { keptItems } = req.body;
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: 'trial_started'
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found or not in trial' });
    }

    await order.completeTrial(keptItems);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Initiate return process
router.post('/:id/initiate-return', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: 'trial_completed'
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found or not eligible for return' });
    }

    await order.initiateReturn();
    const qrCode = await generateQRCode(order.returnPickupCode);
    res.json({ order, qrCode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;