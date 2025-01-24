const crypto = require('crypto');
const Order = require('../models/Order');
const { io } = require('../socket');

class PaymentService {
  constructor() {
    // For development, use mock payment service
    this.razorpay = {
      orders: {
        create: async (options) => ({
          id: 'mock_order_' + Date.now(),
          amount: options.amount,
          currency: options.currency,
          receipt: options.receipt
        })
      },
      payments: {
        fetch: async () => ({
          status: 'captured',
          order_id: 'mock_order_id',
          amount: 1000
        }),
        refund: async (paymentId, options) => ({
          id: 'mock_refund_' + Date.now(),
          payment_id: paymentId,
          amount: options.amount,
          status: 'processing'
        })
      }
    };

    this.paymentMethods = {
      RAZORPAY: 'razorpay',
      COD: 'cod',
      BANK_TRANSFER: 'bank_transfer',
      UPI: 'upi',
      WALLET: 'wallet'
    };
  }

  // Create payment order based on payment method
  async createPaymentOrder(orderId, paymentMethod) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      switch (paymentMethod) {
        case this.paymentMethods.RAZORPAY:
          return await this._createRazorpayOrder(order);
        case this.paymentMethods.COD:
          return await this._createCODOrder(order);
        case this.paymentMethods.BANK_TRANSFER:
          return await this._createBankTransferOrder(order);
        case this.paymentMethods.UPI:
          return await this._createUPIOrder(order);
        case this.paymentMethods.WALLET:
          return await this._createWalletOrder(order);
        default:
          throw new Error('Invalid payment method');
      }
    } catch (error) {
      throw error;
    }
  }

  // Create Razorpay order
  async _createRazorpayOrder(order) {
    const razorpayOrder = await this.razorpay.orders.create({
      amount: Math.round(order.total * 100), // Convert to paise
      currency: 'INR',
      receipt: order.orderNumber,
      payment_capture: 1,
      notes: {
        orderId: order._id.toString()
      }
    });

    // Update order with Razorpay order ID
    order.payment = {
      ...order.payment,
      method: this.paymentMethods.RAZORPAY,
      razorpayOrderId: razorpayOrder.id
    };
    await order.save();

    return {
      orderId: razorpayOrder.id,
      currency: razorpayOrder.currency,
      amount: razorpayOrder.amount,
      receipt: razorpayOrder.receipt,
      key: 'mock_key'
    };
  }

  // Create COD order
  async _createCODOrder(order) {
    order.payment = {
      ...order.payment,
      method: this.paymentMethods.COD,
      status: 'pending',
      codVerificationCode: this._generateCODVerificationCode()
    };
    await order.save();

    return {
      orderNumber: order.orderNumber,
      codVerificationCode: order.payment.codVerificationCode
    };
  }

  // Create Bank Transfer order
  async _createBankTransferOrder(order) {
    const bankDetails = {
      accountNumber: 'mock_account_number',
      ifscCode: 'mock_ifsc_code',
      accountName: 'mock_account_name',
      bankName: 'mock_bank_name'
    };

    order.payment = {
      ...order.payment,
      method: this.paymentMethods.BANK_TRANSFER,
      status: 'pending',
      bankTransferDetails: bankDetails
    };
    await order.save();

    return {
      orderNumber: order.orderNumber,
      bankDetails
    };
  }

  // Create UPI order
  async _createUPIOrder(order) {
    const upiDetails = {
      upiId: 'mock_upi_id',
      merchantName: 'mock_merchant_name'
    };

    order.payment = {
      ...order.payment,
      method: this.paymentMethods.UPI,
      status: 'pending',
      upiDetails
    };
    await order.save();

    return {
      orderNumber: order.orderNumber,
      upiDetails
    };
  }

  // Create Wallet order
  async _createWalletOrder(order) {
    // Implementation for wallet payment
    throw new Error('Wallet payment not implemented yet');
  }

  // Handle webhook events
  async handleWebhook(event, signature) {
    try {
      // Verify webhook signature
      const isValid = this._verifyWebhookSignature(event, signature);
      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }

      const eventData = JSON.parse(event);
      switch (eventData.event) {
        case 'payment.captured':
          await this._handlePaymentCaptured(eventData.payload.payment.entity);
          break;
        case 'payment.failed':
          await this._handlePaymentFailed(eventData.payload.payment.entity);
          break;
        case 'refund.processed':
          await this._handleRefundProcessed(eventData.payload.refund.entity);
          break;
        case 'order.paid':
          await this._handleOrderPaid(eventData.payload.order.entity);
          break;
        default:
          console.log('Unhandled webhook event:', eventData.event);
      }

      return { status: 'success' };
    } catch (error) {
      console.error('Webhook processing error:', error);
      throw error;
    }
  }

  // Verify webhook signature
  _verifyWebhookSignature(event, signature) {
    const webhookSecret = 'mock_webhook_secret';
    const shasum = crypto.createHmac('sha256', webhookSecret);
    shasum.update(event);
    const digest = shasum.digest('hex');
    return signature === digest;
  }

  // Handle payment captured webhook
  async _handlePaymentCaptured(payment) {
    const order = await Order.findOne({
      'payment.razorpayOrderId': payment.order_id
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const paymentDetails = {
      status: 'completed',
      transactionId: payment.id,
      paymentResponse: payment
    };

    await order.processPayment(paymentDetails);
    
    // Emit real-time update
    io.to(`order-${order._id}`).emit('payment-status-updated', {
      orderId: order._id,
      status: 'completed'
    });
  }

  // Handle payment failed webhook
  async _handlePaymentFailed(payment) {
    const order = await Order.findOne({
      'payment.razorpayOrderId': payment.order_id
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const paymentDetails = {
      status: 'failed',
      transactionId: payment.id,
      failureReason: payment.error_description,
      paymentResponse: payment
    };

    await order.processPayment(paymentDetails);
    
    // Emit real-time update
    io.to(`order-${order._id}`).emit('payment-status-updated', {
      orderId: order._id,
      status: 'failed',
      reason: payment.error_description
    });
  }

  // Handle refund processed webhook
  async _handleRefundProcessed(refund) {
    const order = await Order.findOne({
      'payment.transactionId': refund.payment_id
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const refundDetails = {
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount / 100 // Convert from paise to rupees
    };

    await order.processRefund(refundDetails);
    
    // Emit real-time update
    io.to(`order-${order._id}`).emit('refund-status-updated', {
      orderId: order._id,
      refundId: refund.id,
      status: refund.status
    });
  }

  // Handle order paid webhook
  async _handleOrderPaid(orderData) {
    const order = await Order.findOne({
      'payment.razorpayOrderId': orderData.id
    });

    if (!order) {
      throw new Error('Order not found');
    }

    await order.updateOrderStatus('processing');
    
    // Emit real-time update
    io.to(`order-${order._id}`).emit('order-status-updated', {
      orderId: order._id,
      status: 'processing'
    });
  }

  // Generate COD verification code
  _generateCODVerificationCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Verify payment signature
  verifyPaymentSignature(paymentData) {
    const signature = paymentData.razorpay_signature;
    const shasum = crypto.createHmac('sha256', 'mock_key_secret');
    shasum.update(`${paymentData.razorpay_order_id}|${paymentData.razorpay_payment_id}`);
    const digest = shasum.digest('hex');
    return signature === digest;
  }

  // Process successful payment
  async processSuccessfulPayment(paymentData) {
    try {
      const order = await Order.findOne({
        'payment.razorpayOrderId': paymentData.razorpay_order_id
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Verify payment signature
      const isValid = this.verifyPaymentSignature(paymentData);
      if (!isValid) {
        throw new Error('Invalid payment signature');
      }

      // Update payment details
      const paymentDetails = {
        status: 'completed',
        transactionId: paymentData.razorpay_payment_id,
        paymentResponse: paymentData
      };

      await order.processPayment(paymentDetails);
      
      // Emit real-time update
      io.to(`order-${order._id}`).emit('payment-status-updated', {
        orderId: order._id,
        status: 'completed'
      });

      return order;
    } catch (error) {
      throw error;
    }
  }

  // Process refund
  async processRefund(orderId, refundAmount, notes = {}) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const refund = await this.razorpay.payments.refund(order.payment.transactionId, {
        amount: Math.round(refundAmount * 100), // Convert to paise
        notes: {
          orderId: order._id.toString(),
          ...notes
        }
      });

      const refundDetails = {
        refundId: refund.id,
        status: refund.status,
        amount: refundAmount
      };

      await order.processRefund(refundDetails);
      
      // Emit real-time update
      io.to(`order-${order._id}`).emit('refund-status-updated', {
        orderId: order._id,
        refundId: refund.id,
        status: refund.status
      });

      return order;
    } catch (error) {
      throw error;
    }
  }

  // Get payment details
  async getPaymentDetails(paymentId) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      throw error;
    }
  }

  // Get refund details
  async getRefundDetails(refundId) {
    try {
      const refund = await this.razorpay.refunds.fetch(refundId);
      return refund;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PaymentService();
