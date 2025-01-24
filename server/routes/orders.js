const express = require('express');
const { auth } = require('../middleware/auth');
const OrderService = require('../services/orderService');

const router = express.Router();

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    const order = await OrderService.createOrder(req.user.id, req.body);
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Test endpoint - no auth required
router.get('/test', (req, res) => {
  res.json({ message: 'Orders route is working' });
});

// Get user's orders with pagination
router.get('/', auth, async (req, res) => {
  try {
    // For testing, return mock data
    const mockOrders = [
      {
        id: '1',
        date: new Date().toISOString(),
        status: 'processing',
        total: 299.99,
        items: [
          {
            id: 'item1',
            name: 'Test Product',
            quantity: 1,
            price: 299.99,
            image: 'https://via.placeholder.com/150'
          }
        ]
      }
    ];
    res.json(mockOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get order details
router.get('/:orderId', auth, async (req, res) => {
  try {
    const order = await OrderService.getOrderDetails(req.params.orderId, req.user.id);
    res.json(order);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Update order status (admin only)
router.patch('/:orderId/status', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const { status, reason } = req.body;
    const order = await OrderService.updateOrderStatus(req.params.orderId, status, reason);
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Process payment
router.post('/:orderId/payment', auth, async (req, res) => {
  try {
    const order = await OrderService.processPayment(req.params.orderId, req.body);
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update shipping
router.patch('/:orderId/shipping', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const order = await OrderService.updateShipping(req.params.orderId, req.body);
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cancel order
router.post('/:orderId/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await OrderService.cancelOrder(req.params.orderId, req.user.id, reason);
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Request return
router.post('/:orderId/return', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await OrderService.requestReturn(req.params.orderId, req.user.id, reason);
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Process refund (admin only)
router.post('/:orderId/refund', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const order = await OrderService.processRefund(req.params.orderId, req.body);
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;