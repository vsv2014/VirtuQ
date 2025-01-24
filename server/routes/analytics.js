const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const analyticsService = require('../services/analyticsService');
const router = express.Router();

// Middleware to ensure admin access
const ensureAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Track user behavior
router.post('/track', auth, async (req, res) => {
  try {
    const { sessionId, event, data } = req.body;
    const behavior = await analyticsService.trackUserBehavior(
      req.user.id,
      sessionId,
      event,
      data
    );
    res.json(behavior);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user behavior analytics
router.get('/user-behavior', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate, ...filters } = req.query;
    const analytics = await analyticsService.getUserBehaviorAnalytics(
      startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate ? new Date(endDate) : new Date(),
      filters
    );
    res.json(analytics);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get sales analytics
router.get('/sales', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const analytics = await analyticsService.getSalesAnalytics(
      startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate ? new Date(endDate) : new Date()
    );
    res.json(analytics);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get customer analytics
router.get('/customers', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const analytics = await analyticsService.getCustomerAnalytics(
      startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate ? new Date(endDate) : new Date()
    );
    res.json(analytics);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get product analytics
router.get('/products', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const analytics = await analyticsService.getProductAnalytics(
      startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate ? new Date(endDate) : new Date()
    );
    res.json(analytics);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get inventory analytics
router.get('/inventory', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const analytics = await analyticsService.getInventoryAnalytics(
      startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate ? new Date(endDate) : new Date()
    );
    res.json(analytics);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Export analytics data
router.get('/export', adminAuth, async (req, res) => {
  try {
    const { format, startDate, endDate } = req.query;
    const data = await analyticsService.exportData(
      format,
      startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate ? new Date(endDate) : new Date()
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
