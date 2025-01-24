const express = require('express');
const { auth } = require('../middleware/auth');
const DashboardService = require('../services/dashboardService');

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Get overall dashboard statistics
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await DashboardService.getOverallStats({ startDate, endDate });
    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Error getting dashboard stats', error: error.message });
  }
});

// Get sales analytics
router.get('/sales', auth, isAdmin, async (req, res) => {
  try {
    const { period = 'daily' } = req.query;
    const analytics = await DashboardService.getSalesAnalytics(period);
    res.json(analytics);
  } catch (error) {
    console.error('Sales analytics error:', error);
    res.status(500).json({ message: 'Error getting sales analytics', error: error.message });
  }
});

// Get user analytics
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const analytics = await DashboardService.getUserAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ message: 'Error getting user analytics', error: error.message });
  }
});

// Get product analytics
router.get('/products', auth, isAdmin, async (req, res) => {
  try {
    const analytics = await DashboardService.getProductAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Product analytics error:', error);
    res.status(500).json({ message: 'Error getting product analytics', error: error.message });
  }
});

module.exports = router;
