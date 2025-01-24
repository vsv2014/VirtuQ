const nodemailer = require('nodemailer');
const User = require('../models/user');

class NotificationService {
  constructor() {
    // Mock email service for development
    this.transporter = {
      sendMail: async (options) => {
        console.log('Mock email sent:', {
          to: options.to,
          subject: options.subject,
          html: options.html
        });
        return { success: true };
      }
    };
  }

  async sendEmail(to, subject, html) {
    try {
      console.log('Sending mock email to:', to);
      await this.transporter.sendMail({
        from: 'noreply@qtbolt.com',
        to,
        subject,
        html
      });
      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: 'Failed to send email' };
    }
  }

  async sendOrderConfirmation(order) {
    try {
      const user = await User.findById(order.userId);
      const subject = `Order Confirmation - #${order._id}`;
      const html = `
        <h1>Order Confirmation</h1>
        <p>Thank you for your order!</p>
        <p>Order ID: ${order._id}</p>
        <p>Total Amount: ₹${order.totalAmount}</p>
      `;
      return await this.sendEmail(user.email, subject, html);
    } catch (error) {
      console.error('Error sending order confirmation:', error);
      return { success: false, error: 'Failed to send order confirmation' };
    }
  }

  async sendShipmentUpdate(order) {
    try {
      const user = await User.findById(order.userId);
      const subject = `Shipment Update - Order #${order._id}`;
      const html = `
        <h1>Shipment Update</h1>
        <p>Your order has been ${order.status}</p>
        <p>Order ID: ${order._id}</p>
        <p>Tracking ID: ${order.tracking?.id || 'Not available'}</p>
      `;
      return await this.sendEmail(user.email, subject, html);
    } catch (error) {
      console.error('Error sending shipment update:', error);
      return { success: false, error: 'Failed to send shipment update' };
    }
  }

  async sendPasswordReset(user, resetToken) {
    try {
      const subject = 'Password Reset Request';
      const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
      const html = `
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `;
      return await this.sendEmail(user.email, subject, html);
    } catch (error) {
      console.error('Error sending password reset:', error);
      return { success: false, error: 'Failed to send password reset email' };
    }
  }

  async sendWelcomeEmail(user) {
    try {
      const subject = 'Welcome to QTbolt!';
      const html = `
        <h1>Welcome to QTbolt!</h1>
        <p>Hi ${user.name},</p>
        <p>Thank you for joining QTbolt. We're excited to have you!</p>
      `;
      return await this.sendEmail(user.email, subject, html);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: 'Failed to send welcome email' };
    }
  }

  async sendOrderStatusUpdate(order, newStatus) {
    try {
      const user = await User.findById(order.userId);
      const subject = `Order Status Update - ${order.orderNumber}`;
      
      const statusMessages = {
        processing: 'Your order is being processed',
        shipped: 'Your order has been shipped',
        out_for_delivery: 'Your order is out for delivery',
        delivered: 'Your order has been delivered',
        cancelled: 'Your order has been cancelled',
        return_approved: 'Your return request has been approved',
        refunded: 'Your refund has been processed'
      };

      const html = `
        <h2>Order Status Update</h2>
        <p>Dear ${user.name},</p>
        <p>${statusMessages[newStatus] || 'Your order status has been updated'}.</p>
        
        <h3>Order Details:</h3>
        <p>Order Number: ${order.orderNumber}</p>
        ${order.shipping.trackingNumber ? `
          <p>Tracking Number: ${order.shipping.trackingNumber}</p>
          <p>Carrier: ${order.shipping.carrier}</p>
        ` : ''}
        
        <p>You can track your order status <a href="${process.env.CLIENT_URL}/orders/${order._id}">here</a>.</p>
      `;

      await this.sendEmail(user.email, subject, html);
    } catch (error) {
      console.error('Order status update email failed:', error);
      throw error;
    }
  }

  async sendPaymentConfirmation(order) {
    try {
      const user = await User.findById(order.userId);
      const subject = `Payment Confirmed - ${order.orderNumber}`;
      
      const html = `
        <h2>Payment Confirmation</h2>
        <p>Dear ${user.name},</p>
        <p>We have received your payment for order ${order.orderNumber}.</p>
        
        <h3>Payment Details:</h3>
        <p>Amount: ₹${order.total}</p>
        <p>Transaction ID: ${order.payment.transactionId}</p>
        <p>Payment Method: ${order.payment.method}</p>
        
        <p>You can view your order details <a href="${process.env.CLIENT_URL}/orders/${order._id}">here</a>.</p>
      `;

      await this.sendEmail(user.email, subject, html);
    } catch (error) {
      console.error('Payment confirmation email failed:', error);
      throw error;
    }
  }

  async sendRefundConfirmation(order, refundAmount) {
    try {
      const user = await User.findById(order.userId);
      const subject = `Refund Processed - ${order.orderNumber}`;
      
      const html = `
        <h2>Refund Confirmation</h2>
        <p>Dear ${user.name},</p>
        <p>We have processed your refund for order ${order.orderNumber}.</p>
        
        <h3>Refund Details:</h3>
        <p>Refund Amount: ₹${refundAmount}</p>
        <p>Refund ID: ${order.payment.refundId}</p>
        <p>Original Transaction ID: ${order.payment.transactionId}</p>
        
        <p>The refund should be credited to your account within 5-7 business days.</p>
        <p>You can view your order details <a href="${process.env.CLIENT_URL}/orders/${order._id}">here</a>.</p>
      `;

      await this.sendEmail(user.email, subject, html);
    } catch (error) {
      console.error('Refund confirmation email failed:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
