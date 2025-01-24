const mongoose = require('mongoose');

const UserBehaviorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: String,
  event: {
    type: String,
    enum: ['view', 'search', 'add_to_cart', 'remove_from_cart', 'purchase', 'review', 'question', 'wishlist']
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  searchQuery: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

const SalesAnalyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  revenue: {
    total: Number,
    byCategory: Map,
    byProduct: Map
  },
  orders: {
    total: Number,
    completed: Number,
    cancelled: Number,
    byPaymentMethod: Map
  },
  products: {
    totalSold: Number,
    topSelling: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: Number,
      revenue: Number
    }]
  },
  categories: [{
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    sales: Number,
    revenue: Number
  }],
  customerMetrics: {
    newCustomers: Number,
    returningCustomers: Number,
    averageOrderValue: Number,
    cartAbandonment: Number
  }
}, { timestamps: true });

const InventoryAnalyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  stockLevel: Number,
  reorderPoint: Number,
  turnoverRate: Number,
  backorders: Number,
  stockouts: Number,
  holdingCost: Number,
  predictions: {
    expectedDemand: Number,
    suggestedReorderQuantity: Number,
    nextStockoutRisk: Number
  }
}, { timestamps: true });

const MarketingAnalyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  campaign: {
    name: String,
    type: String,
    startDate: Date,
    endDate: Date
  },
  metrics: {
    impressions: Number,
    clicks: Number,
    conversions: Number,
    revenue: Number,
    cost: Number,
    roi: Number
  },
  customerSegments: [{
    segment: String,
    size: Number,
    conversionRate: Number,
    averageOrderValue: Number
  }],
  productPerformance: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    views: Number,
    addsToCarts: Number,
    purchases: Number,
    revenue: Number
  }]
}, { timestamps: true });

const UserBehavior = mongoose.model('UserBehavior', UserBehaviorSchema);
const SalesAnalytics = mongoose.model('SalesAnalytics', SalesAnalyticsSchema);
const InventoryAnalytics = mongoose.model('InventoryAnalytics', InventoryAnalyticsSchema);
const MarketingAnalytics = mongoose.model('MarketingAnalytics', MarketingAnalyticsSchema);

module.exports = {
  UserBehavior,
  SalesAnalytics,
  InventoryAnalytics,
  MarketingAnalytics
};
