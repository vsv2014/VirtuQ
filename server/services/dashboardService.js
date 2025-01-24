const Order = require('../models/Order');
const User = require('../models/user');
const Product = require('../models/product');

class DashboardService {
  // Get overall statistics
  static async getOverallStats(dateRange = {}) {
    try {
      const { startDate, endDate } = dateRange;
      const dateFilter = {};
      
      if (startDate && endDate) {
        dateFilter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const [
        totalRevenue,
        orderStats,
        userStats,
        productStats
      ] = await Promise.all([
        // Calculate total revenue
        Order.aggregate([
          { $match: { ...dateFilter, status: 'completed' } },
          { $group: {
            _id: null,
            total: { $sum: '$totalAmount' },
            avgOrderValue: { $avg: '$totalAmount' }
          }}
        ]),

        // Order statistics
        Order.aggregate([
          { $match: dateFilter },
          { $group: {
            _id: '$status',
            count: { $sum: 1 }
          }},
          { $group: {
            _id: null,
            total: { $sum: '$count' },
            byStatus: { $push: { status: '$_id', count: '$count' } }
          }}
        ]),

        // User statistics
        User.aggregate([
          { $match: dateFilter },
          { $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: {
                $cond: [{ $gt: ['$lastLoginDate', new Date(Date.now() - 30*24*60*60*1000)] }, 1, 0]
              }
            }
          }}
        ]),

        // Product statistics
        Product.aggregate([
          {
            $group: {
              _id: null,
              totalProducts: { $sum: 1 },
              outOfStock: {
                $sum: {
                  $cond: [
                    { $eq: [{ $sum: '$variations.stock' }, 0] },
                    1,
                    0
                  ]
                }
              },
              lowStock: {
                $sum: {
                  $cond: [
                    { 
                      $and: [
                        { $gt: [{ $sum: '$variations.stock' }, 0] },
                        { $lt: [{ $sum: '$variations.stock' }, 10] }
                      ]
                    },
                    1,
                    0
                  ]
                }
              }
            }
          }
        ])
      ]);

      return {
        revenue: totalRevenue[0] || { total: 0, avgOrderValue: 0 },
        orders: orderStats[0] || { total: 0, byStatus: [] },
        users: userStats[0] || { total: 0, active: 0 },
        products: productStats[0] || { totalProducts: 0, outOfStock: 0, lowStock: 0 }
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard stats: ${error.message}`);
    }
  }

  // Get sales analytics
  static async getSalesAnalytics(period = 'daily') {
    try {
      let groupBy;
      let dateFormat;
      
      switch(period) {
        case 'hourly':
          groupBy = {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
            hour: { $hour: '$createdAt' }
          };
          dateFormat = '%Y-%m-%d %H:00';
          break;
        case 'daily':
          groupBy = {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          };
          dateFormat = '%Y-%m-%d';
          break;
        case 'monthly':
          groupBy = {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          };
          dateFormat = '%Y-%m';
          break;
        default:
          throw new Error('Invalid period specified');
      }

      const salesData = await Order.aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: groupBy,
            sales: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
            items: { $sum: { $size: '$items' } }
          }
        },
        {
          $project: {
            _id: 0,
            date: {
              $dateToString: {
                format: dateFormat,
                date: {
                  $dateFromParts: {
                    year: '$_id.year',
                    month: '$_id.month',
                    day: { $ifNull: ['$_id.day', 1] },
                    hour: { $ifNull: ['$_id.hour', 0] }
                  }
                }
              }
            },
            sales: 1,
            orders: 1,
            items: 1
          }
        },
        { $sort: { date: 1 } }
      ]);

      return salesData;
    } catch (error) {
      throw new Error(`Failed to get sales analytics: ${error.message}`);
    }
  }

  // Get user analytics
  static async getUserAnalytics() {
    try {
      const [
        userGrowth,
        userActivity,
        topCustomers
      ] = await Promise.all([
        // User growth over time
        User.aggregate([
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              newUsers: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]),

        // User activity
        User.aggregate([
          {
            $group: {
              _id: null,
              totalUsers: { $sum: 1 },
              activeUsers: {
                $sum: {
                  $cond: [
                    { $gt: ['$lastLoginDate', new Date(Date.now() - 30*24*60*60*1000)] },
                    1,
                    0
                  ]
                }
              },
              inactiveUsers: {
                $sum: {
                  $cond: [
                    { $lt: ['$lastLoginDate', new Date(Date.now() - 90*24*60*60*1000)] },
                    1,
                    0
                  ]
                }
              }
            }
          }
        ]),

        // Top customers by order value
        Order.aggregate([
          { $match: { status: 'completed' } },
          {
            $group: {
              _id: '$userId',
              totalSpent: { $sum: '$totalAmount' },
              ordersCount: { $sum: 1 }
            }
          },
          { $sort: { totalSpent: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'userDetails'
            }
          },
          {
            $project: {
              _id: 1,
              totalSpent: 1,
              ordersCount: 1,
              user: { $arrayElemAt: ['$userDetails', 0] }
            }
          }
        ])
      ]);

      return {
        growth: userGrowth,
        activity: userActivity[0],
        topCustomers
      };
    } catch (error) {
      throw new Error(`Failed to get user analytics: ${error.message}`);
    }
  }

  // Get product analytics
  static async getProductAnalytics() {
    try {
      const [
        topProducts,
        categoryPerformance,
        inventoryStatus
      ] = await Promise.all([
        // Top selling products
        Order.aggregate([
          { $match: { status: 'completed' } },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.productId',
              totalSold: { $sum: '$items.quantity' },
              revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
            }
          },
          { $sort: { revenue: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'products',
              localField: '_id',
              foreignField: '_id',
              as: 'productDetails'
            }
          },
          {
            $project: {
              _id: 1,
              totalSold: 1,
              revenue: 1,
              product: { $arrayElemAt: ['$productDetails', 0] }
            }
          }
        ]),

        // Category performance
        Product.aggregate([
          {
            $group: {
              _id: '$category',
              totalProducts: { $sum: 1 },
              avgPrice: { $avg: '$price' },
              totalStock: { $sum: { $sum: '$variations.stock' } }
            }
          },
          { $sort: { totalProducts: -1 } }
        ]),

        // Inventory status
        Product.aggregate([
          {
            $unwind: '$variations'
          },
          {
            $group: {
              _id: '$_id',
              totalStock: { $sum: '$variations.stock' },
              product: { $first: '$$ROOT' }
            }
          },
          {
            $project: {
              _id: 1,
              name: '$product.name',
              category: '$product.category',
              totalStock: 1,
              status: {
                $switch: {
                  branches: [
                    { case: { $eq: ['$totalStock', 0] }, then: 'Out of Stock' },
                    { case: { $lt: ['$totalStock', 10] }, then: 'Low Stock' },
                    { case: { $gte: ['$totalStock', 10] }, then: 'In Stock' }
                  ]
                }
              }
            }
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              products: { $push: { id: '$_id', name: '$name', stock: '$totalStock' } }
            }
          }
        ])
      ]);

      return {
        topProducts,
        categoryPerformance,
        inventoryStatus
      };
    } catch (error) {
      throw new Error(`Failed to get product analytics: ${error.message}`);
    }
  }
}

module.exports = DashboardService;
