const Order = require('../models/Order');
const User = require('../models/user');
const Product = require('../models/Product');
const { UserBehavior, SalesAnalytics, InventoryAnalytics, MarketingAnalytics } = require('../models/Analytics');
const socket = require('../socket');

class AnalyticsService {
  // Track user behavior
  async trackUserBehavior(userId, sessionId, event, data) {
    try {
      const behavior = await UserBehavior.create({
        user: userId,
        sessionId,
        event,
        ...data,
        timestamp: new Date()
      });

      // Emit real-time analytics update
      const io = socket.getIO();
      if (io) {
        io.to('analytics').emit('user-behavior', behavior);
      }

      return behavior;
    } catch (error) {
      throw error;
    }
  }

  // Get user behavior analytics
  async getUserBehaviorAnalytics(startDate, endDate, filters = {}) {
    try {
      const query = {
        timestamp: { $gte: startDate, $lte: endDate },
        ...filters
      };

      const behaviors = await UserBehavior.find(query)
        .populate('user', 'name email')
        .populate('productId', 'name category price')
        .sort('-timestamp');

      const analytics = {
        totalEvents: behaviors.length,
        eventTypes: {},
        userEngagement: {},
        productInteractions: {},
        searchAnalytics: {
          topQueries: {},
          averageResultsClicked: 0,
          conversionRate: 0
        }
      };

      behaviors.forEach(behavior => {
        // Event type distribution
        analytics.eventTypes[behavior.event] = 
          (analytics.eventTypes[behavior.event] || 0) + 1;

        // User engagement
        if (behavior.user) {
          if (!analytics.userEngagement[behavior.user._id]) {
            analytics.userEngagement[behavior.user._id] = {
              user: behavior.user,
              events: 0,
              lastActive: behavior.timestamp
            };
          }
          analytics.userEngagement[behavior.user._id].events++;
        }

        // Product interactions
        if (behavior.productId) {
          if (!analytics.productInteractions[behavior.productId._id]) {
            analytics.productInteractions[behavior.productId._id] = {
              product: behavior.productId,
              views: 0,
              addsToCarts: 0,
              purchases: 0
            };
          }
          const interaction = analytics.productInteractions[behavior.productId._id];
          switch (behavior.event) {
            case 'view':
              interaction.views++;
              break;
            case 'add_to_cart':
              interaction.addsToCarts++;
              break;
            case 'purchase':
              interaction.purchases++;
              break;
          }
        }

        // Search analytics
        if (behavior.event === 'search' && behavior.searchQuery) {
          analytics.searchAnalytics.topQueries[behavior.searchQuery] = 
            (analytics.searchAnalytics.topQueries[behavior.searchQuery] || 0) + 1;
        }
      });

      // Calculate search conversion rate
      const searchEvents = behaviors.filter(b => b.event === 'search').length;
      const searchConversions = behaviors.filter(b => 
        b.event === 'purchase' && 
        behaviors.some(search => 
          search.event === 'search' && 
          search.sessionId === b.sessionId &&
          search.timestamp < b.timestamp
        )
      ).length;

      analytics.searchAnalytics.conversionRate = 
        searchEvents > 0 ? (searchConversions / searchEvents) * 100 : 0;

      return analytics;
    } catch (error) {
      throw error;
    }
  }

  // Get sales analytics
  async getSalesAnalytics(startDate, endDate) {
    try {
      const orders = await Order.find({
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] }
      });

      const analytics = {
        totalOrders: orders.length,
        totalRevenue: 0,
        averageOrderValue: 0,
        salesByPaymentMethod: {},
        salesByStatus: {},
        dailySales: {},
        topProducts: [],
        returnRate: 0
      };

      // Calculate basic metrics
      orders.forEach(order => {
        analytics.totalRevenue += order.total;
        analytics.salesByPaymentMethod[order.payment.method] = 
          (analytics.salesByPaymentMethod[order.payment.method] || 0) + order.total;
        analytics.salesByStatus[order.status] = 
          (analytics.salesByStatus[order.status] || 0) + 1;

        const dateKey = order.createdAt.toISOString().split('T')[0];
        analytics.dailySales[dateKey] = (analytics.dailySales[dateKey] || 0) + order.total;
      });

      // Calculate average order value
      analytics.averageOrderValue = analytics.totalRevenue / analytics.totalOrders;

      // Get top selling products
      const productSales = {};
      orders.forEach(order => {
        order.items.forEach(item => {
          productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity;
        });
      });

      analytics.topProducts = await Product.find({
        _id: { $in: Object.keys(productSales) }
      }).select('name price');

      analytics.topProducts = analytics.topProducts
        .map(product => ({
          productId: product._id,
          name: product.name,
          totalSold: productSales[product._id],
          revenue: product.price * productSales[product._id]
        }))
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 10);

      // Calculate return rate
      const returnedOrders = await Order.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ['return_requested', 'return_approved', 'return_received', 'refunded'] }
      });
      analytics.returnRate = (returnedOrders / analytics.totalOrders) * 100;

      return analytics;
    } catch (error) {
      throw error;
    }
  }

  // Get customer analytics
  async getCustomerAnalytics(startDate, endDate) {
    try {
      const users = await User.find({
        createdAt: { $gte: startDate, $lte: endDate }
      });

      const orders = await Order.find({
        createdAt: { $gte: startDate, $lte: endDate }
      });

      const analytics = {
        totalCustomers: users.length,
        newCustomers: users.length,
        activeCustomers: 0,
        customerRetention: 0,
        averageOrdersPerCustomer: 0,
        customersByLocation: {},
        customerLifetimeValue: 0
      };

      // Calculate customer metrics
      const customerOrders = {};
      const customerRevenue = {};
      const locations = {};

      orders.forEach(order => {
        customerOrders[order.userId] = (customerOrders[order.userId] || 0) + 1;
        customerRevenue[order.userId] = (customerRevenue[order.userId] || 0) + order.total;
        
        const location = order.shipping.address.state;
        locations[location] = (locations[location] || 0) + 1;
      });

      // Active customers (made at least one order)
      analytics.activeCustomers = Object.keys(customerOrders).length;

      // Average orders per customer
      analytics.averageOrdersPerCustomer = 
        Object.values(customerOrders).reduce((a, b) => a + b, 0) / analytics.activeCustomers;

      // Customer lifetime value
      analytics.customerLifetimeValue = 
        Object.values(customerRevenue).reduce((a, b) => a + b, 0) / analytics.activeCustomers;

      // Customer retention rate
      const previousPeriodCustomers = await User.countDocuments({
        createdAt: {
          $gte: new Date(startDate.getTime() - (endDate - startDate)),
          $lt: startDate
        }
      });
      
      if (previousPeriodCustomers > 0) {
        analytics.customerRetention = 
          (analytics.activeCustomers / previousPeriodCustomers) * 100;
      }

      analytics.customersByLocation = locations;

      return analytics;
    } catch (error) {
      throw error;
    }
  }

  // Get product performance analytics
  async getProductAnalytics(startDate, endDate) {
    try {
      const orders = await Order.find({
        createdAt: { $gte: startDate, $lte: endDate }
      });

      const analytics = {
        totalProductsSold: 0,
        productPerformance: {},
        categoryPerformance: {},
        sizeDistribution: {},
        returnedProducts: {}
      };

      // Calculate product metrics
      orders.forEach(order => {
        order.items.forEach(item => {
          analytics.totalProductsSold += item.quantity;

          // Product performance
          if (!analytics.productPerformance[item.productId]) {
            analytics.productPerformance[item.productId] = {
              quantity: 0,
              revenue: 0,
              returns: 0
            };
          }
          analytics.productPerformance[item.productId].quantity += item.quantity;
          analytics.productPerformance[item.productId].revenue += item.price * item.quantity;

          // Size distribution
          analytics.sizeDistribution[item.size] = 
            (analytics.sizeDistribution[item.size] || 0) + item.quantity;

          // Track returns
          if (item.status === 'returned') {
            analytics.productPerformance[item.productId].returns += item.quantity;
            analytics.returnedProducts[item.productId] = 
              (analytics.returnedProducts[item.productId] || 0) + item.quantity;
          }
        });
      });

      // Get product details and calculate category performance
      const products = await Product.find({
        _id: { $in: Object.keys(analytics.productPerformance) }
      }).select('name category');

      products.forEach(product => {
        analytics.productPerformance[product._id].name = product.name;
        
        // Category performance
        if (!analytics.categoryPerformance[product.category]) {
          analytics.categoryPerformance[product.category] = {
            quantity: 0,
            revenue: 0,
            returns: 0
          };
        }
        
        const productStats = analytics.productPerformance[product._id];
        analytics.categoryPerformance[product.category].quantity += productStats.quantity;
        analytics.categoryPerformance[product.category].revenue += productStats.revenue;
        analytics.categoryPerformance[product.category].returns += productStats.returns;
      });

      return analytics;
    } catch (error) {
      throw error;
    }
  }

  // Generate comprehensive report
  async generateReport(startDate, endDate) {
    try {
      const [sales, customers, products] = await Promise.all([
        this.getSalesAnalytics(startDate, endDate),
        this.getCustomerAnalytics(startDate, endDate),
        this.getProductAnalytics(startDate, endDate)
      ]);

      return {
        period: {
          start: startDate,
          end: endDate
        },
        sales,
        customers,
        products,
        summary: {
          totalRevenue: sales.totalRevenue,
          totalOrders: sales.totalOrders,
          averageOrderValue: sales.averageOrderValue,
          totalCustomers: customers.totalCustomers,
          customerLifetimeValue: customers.customerLifetimeValue,
          totalProductsSold: products.totalProductsSold,
          returnRate: sales.returnRate
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Generate comprehensive report
  async generateComprehensiveReport(startDate, endDate) {
    try {
      const report = {
        userBehavior: await this.getUserBehaviorAnalytics(new Date(startDate), new Date(endDate)),
        sales: await this.getSalesAnalytics(new Date(startDate), new Date(endDate)),
        inventory: await this.getInventoryAnalytics(),
        marketing: await this.getMarketingAnalytics(new Date(startDate), new Date(endDate))
      };
      return report;
    } catch (error) {
      throw error;
    }
  }

  // Export analytics data
  async exportData(format, startDate, endDate) {
    try {
      const data = await this.generateComprehensiveReport(startDate, endDate);
      // For now, just return JSON format
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get inventory analytics and predictions
  async getInventoryAnalytics(startDate, endDate) {
    try {
      const analytics = await InventoryAnalytics.find({
        date: { $gte: startDate, $lte: endDate }
      }).populate('product', 'name category price');

      const summary = {
        totalProducts: analytics.length,
        lowStockProducts: [],
        outOfStockProducts: [],
        overStockProducts: [],
        inventoryValue: 0,
        turnoverRate: 0,
        predictions: {
          expectedDemand: {},
          reorderSuggestions: [],
          stockoutRisks: []
        }
      };

      analytics.forEach(item => {
        // Inventory status
        if (item.stockLevel <= item.reorderPoint) {
          summary.lowStockProducts.push({
            product: item.product,
            stockLevel: item.stockLevel,
            reorderPoint: item.reorderPoint
          });
        }
        if (item.stockLevel === 0) {
          summary.outOfStockProducts.push(item.product);
        }
        if (item.stockLevel > item.reorderPoint * 2) {
          summary.overStockProducts.push({
            product: item.product,
            stockLevel: item.stockLevel,
            excessUnits: item.stockLevel - (item.reorderPoint * 2)
          });
        }

        // Inventory value
        summary.inventoryValue += item.stockLevel * item.product.price;

        // Predictions
        if (item.predictions) {
          summary.predictions.expectedDemand[item.product._id] = item.predictions.expectedDemand;
          if (item.predictions.nextStockoutRisk > 0.7) {
            summary.predictions.stockoutRisks.push({
              product: item.product,
              risk: item.predictions.nextStockoutRisk,
              suggestedReorder: item.predictions.suggestedReorderQuantity
            });
          }
        }
      });

      // Calculate average turnover rate
      summary.turnoverRate = analytics.reduce((acc, item) => 
        acc + item.turnoverRate, 0) / analytics.length;

      // Sort and limit reorder suggestions
      summary.predictions.reorderSuggestions = summary.lowStockProducts
        .map(product => ({
          product: product.product,
          currentStock: product.stockLevel,
          suggestedOrder: Math.max(
            product.reorderPoint - product.stockLevel,
            summary.predictions.expectedDemand[product.product._id] || 0
          )
        }))
        .sort((a, b) => b.suggestedOrder - a.suggestedOrder)
        .slice(0, 10);

      return summary;
    } catch (error) {
      throw error;
    }
  }

  // Get marketing campaign analytics
  async getMarketingAnalytics(startDate, endDate, campaignId = null) {
    try {
      const query = {
        date: { $gte: startDate, $lte: endDate }
      };
      if (campaignId) {
        query['campaign.name'] = campaignId;
      }

      const analytics = await MarketingAnalytics.find(query)
        .populate('productPerformance.product', 'name category price');

      const summary = {
        campaigns: {},
        totalRevenue: 0,
        totalCost: 0,
        overallROI: 0,
        bestPerformingProducts: [],
        customerSegments: {},
        channelPerformance: {}
      };

      analytics.forEach(record => {
        const campaignName = record.campaign.name;
        if (!summary.campaigns[campaignName]) {
          summary.campaigns[campaignName] = {
            ...record.campaign,
            metrics: {
              impressions: 0,
              clicks: 0,
              conversions: 0,
              revenue: 0,
              cost: 0,
              roi: 0
            },
            products: [],
            segments: []
          };
        }

        const campaign = summary.campaigns[campaignName];
        
        // Aggregate campaign metrics
        campaign.metrics.impressions += record.metrics.impressions;
        campaign.metrics.clicks += record.metrics.clicks;
        campaign.metrics.conversions += record.metrics.conversions;
        campaign.metrics.revenue += record.metrics.revenue;
        campaign.metrics.cost += record.metrics.cost;
        
        // Track product performance
        record.productPerformance.forEach(product => {
          campaign.products.push({
            product: product.product,
            views: product.views,
            addsToCarts: product.addsToCarts,
            purchases: product.purchases,
            revenue: product.revenue
          });
        });

        // Track customer segments
        record.customerSegments.forEach(segment => {
          if (!summary.customerSegments[segment.segment]) {
            summary.customerSegments[segment.segment] = {
              size: 0,
              conversionRate: 0,
              revenue: 0
            };
          }
          summary.customerSegments[segment.segment].size += segment.size;
          summary.customerSegments[segment.segment].revenue += 
            segment.averageOrderValue * segment.size * (segment.conversionRate / 100);
        });

        // Calculate totals
        summary.totalRevenue += record.metrics.revenue;
        summary.totalCost += record.metrics.cost;
      });

      // Calculate ROI for each campaign and overall
      Object.values(summary.campaigns).forEach(campaign => {
        campaign.metrics.roi = 
          ((campaign.metrics.revenue - campaign.metrics.cost) / campaign.metrics.cost) * 100;
        
        // Aggregate product performance across campaigns
        campaign.products.forEach(product => {
          const existing = summary.bestPerformingProducts.find(
            p => p.product._id.toString() === product.product._id.toString()
          );
          if (existing) {
            existing.revenue += product.revenue;
            existing.purchases += product.purchases;
          } else {
            summary.bestPerformingProducts.push(product);
          }
        });
      });

      summary.overallROI = 
        ((summary.totalRevenue - summary.totalCost) / summary.totalCost) * 100;

      // Sort best performing products
      summary.bestPerformingProducts.sort((a, b) => b.revenue - a.revenue);
      summary.bestPerformingProducts = summary.bestPerformingProducts.slice(0, 10);

      return summary;
    } catch (error) {
      throw error;
    }
  }

  // Update real-time analytics
  async updateRealTimeAnalytics(data) {
    try {
      // Emit analytics update to dashboard
      const io = socket.getIO();
      if (io) {
        io.to('analytics-dashboard').emit('analytics-update', {
          timestamp: new Date(),
          ...data
        });
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
