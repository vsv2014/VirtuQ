const Order = require('../models/Order');
const io = require('../socket');

class TrackingService {
  constructor() {
    // Mock tracking data for development
    this.mockTrackingStates = [
      'order_placed',
      'processing',
      'shipped',
      'out_for_delivery',
      'delivered'
    ];
  }

  // Update shipping status and emit real-time update
  async updateShippingStatus(orderId, trackingUpdate) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Update shipping status
      order.shipping = {
        ...order.shipping,
        status: trackingUpdate.status,
        trackingNumber: trackingUpdate.trackingNumber || `MOCK-${Date.now()}`,
        carrier: trackingUpdate.carrier || 'Mock Carrier',
        estimatedDelivery: trackingUpdate.estimatedDelivery || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        updates: [
          ...(order.shipping?.updates || []),
          {
            status: trackingUpdate.status,
            location: trackingUpdate.location || 'Mock Location',
            timestamp: new Date(),
            description: trackingUpdate.description || `Package ${trackingUpdate.status}`
          }
        ]
      };

      await order.save();

      // Emit real-time update
      io.to(`order-${orderId}`).emit('tracking-update', {
        orderId,
        shipping: order.shipping
      });

      return { success: true, order };
    } catch (error) {
      console.error('Error updating shipping status:', error);
      return { success: false, error: error.message };
    }
  }

  // Get tracking information
  async getTrackingInfo(orderId) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // For development, generate mock tracking data if none exists
      if (!order.shipping || !order.shipping.status) {
        const mockStatus = this.mockTrackingStates[
          Math.floor(Math.random() * this.mockTrackingStates.length)
        ];
        
        order.shipping = {
          status: mockStatus,
          trackingNumber: `MOCK-${Date.now()}`,
          carrier: 'Mock Carrier',
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          updates: [{
            status: mockStatus,
            location: 'Mock Location',
            timestamp: new Date(),
            description: `Package ${mockStatus}`
          }]
        };

        await order.save();
      }

      return { success: true, tracking: order.shipping };
    } catch (error) {
      console.error('Error getting tracking info:', error);
      return { success: false, error: error.message };
    }
  }

  // Subscribe to tracking updates
  subscribeToUpdates(socket, orderId) {
    socket.join(`order-${orderId}`);
    return { success: true, message: 'Subscribed to tracking updates' };
  }

  // Unsubscribe from tracking updates
  unsubscribeFromUpdates(socket, orderId) {
    socket.leave(`order-${orderId}`);
    return { success: true, message: 'Unsubscribed from tracking updates' };
  }
}

module.exports = new TrackingService();
