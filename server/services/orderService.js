const Order = require('../models/Order');
const User = require('../models/user');
const paymentService = require('./paymentService');
const notificationService = require('./notificationService');
const inventoryService = require('./inventoryService');

class OrderService {
  // Create new order
  static async createOrder(userId, orderData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check inventory availability
      for (const item of orderData.items) {
        await inventoryService.checkAvailability(item.productId, item.size, item.quantity);
      }

      const order = new Order({
        userId,
        items: orderData.items,
        shipping: {
          address: orderData.shippingAddress
        },
        shippingCost: orderData.shippingCost || 0,
        payment: {
          method: orderData.paymentMethod,
          amount: orderData.total
        }
      });

      // Calculate totals
      order.calculateTotals();

      // Create Razorpay order
      if (orderData.paymentMethod !== 'cod') {
        const razorpayOrder = await paymentService.createPaymentOrder(order._id);
        order.payment.razorpayOrderId = razorpayOrder.orderId;
      }

      // Save order
      await order.save();

      // Reserve inventory
      for (const item of orderData.items) {
        await inventoryService.reserveStock(item.productId, item.size, item.quantity);
      }

      // Add to user's order history
      user.orderHistory.push(order._id);
      await user.save();

      // Send order confirmation email
      await notificationService.sendOrderConfirmation(order);

      return order;
    } catch (error) {
      throw error;
    }
  }

  // Process payment
  static async processPayment(orderId, paymentDetails) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Process payment through Razorpay
      if (paymentDetails.razorpay_payment_id) {
        await paymentService.processSuccessfulPayment(paymentDetails);
      }

      // Confirm inventory deduction
      for (const item of order.items) {
        await inventoryService.confirmStock(item.productId, item.size, item.quantity);
      }

      // Send payment confirmation email
      await notificationService.sendPaymentConfirmation(order);

      return order;
    } catch (error) {
      throw error;
    }
  }

  // Update order status
  static async updateOrderStatus(orderId, status, reason = '') {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      await order.updateStatus(status, reason);

      // Handle inventory for cancelled orders
      if (status === 'cancelled') {
        for (const item of order.items) {
          await inventoryService.releaseStock(item.productId, item.size, item.quantity);
        }
      }

      // Send status update email
      await notificationService.sendOrderStatusUpdate(order, status);

      return order;
    } catch (error) {
      throw error;
    }
  }

  // Update shipping details
  static async updateShipping(orderId, shippingUpdate) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      await order.updateShipping(shippingUpdate);
      return order;
    } catch (error) {
      throw error;
    }
  }

  // Process refund
  static async processRefund(orderId, refundDetails) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Process refund through Razorpay
      if (order.payment.method !== 'cod') {
        await paymentService.processRefund(orderId, refundDetails.amount, refundDetails.notes);
      }

      // Update inventory for returned items
      if (order.status === 'return_received') {
        for (const item of order.items) {
          if (item.status === 'returned') {
            await inventoryService.returnStock(item.productId, item.size, item.quantity);
          }
        }
      }

      // Send refund confirmation email
      await notificationService.sendRefundConfirmation(order, refundDetails.amount);

      return order;
    } catch (error) {
      throw error;
    }
  }

  // Get user's orders with pagination
  static async getUserOrders(userId, page = 1, limit = 10) {
    try {
      const orders = await Order.find({ userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('items.productId');

      const total = await Order.countDocuments({ userId });

      return {
        orders,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw error;
    }
  }

  // Get order details
  static async getOrderDetails(orderId, userId) {
    try {
      const order = await Order.findOne({ _id: orderId, userId })
        .populate('items.productId');

      if (!order) {
        throw new Error('Order not found');
      }

      return order;
    } catch (error) {
      throw error;
    }
  }

  // Cancel order
  static async cancelOrder(orderId, userId, reason) {
    try {
      const order = await Order.findOne({ _id: orderId, userId });
      if (!order) {
        throw new Error('Order not found');
      }

      if (!['created', 'payment_pending', 'confirmed'].includes(order.status)) {
        throw new Error('Order cannot be cancelled at this stage');
      }

      await order.updateStatus('cancelled', reason);

      // Process refund if payment was made
      if (order.payment.status === 'completed') {
        await order.processRefund({
          refundId: `REF${Date.now()}`,
          status: 'pending'
        });
      }

      return order;
    } catch (error) {
      throw error;
    }
  }

  // Request return
  static async requestReturn(orderId, userId, reason) {
    try {
      const order = await Order.findOne({ _id: orderId, userId });
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status !== 'delivered') {
        throw new Error('Order must be delivered to request return');
      }

      await order.updateStatus('return_requested', reason);
      return order;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = OrderService;
