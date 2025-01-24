const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'cod'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: String,
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentResponse: Object,
  refundId: String,
  refundStatus: {
    type: String,
    enum: ['none', 'pending', 'completed', 'failed'],
    default: 'none'
  }
});

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: String,
  price: Number,
  size: String,
  color: String,
  image: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'returned', 'refunded'],
    default: 'pending'
  }
});

const shippingSchema = new mongoose.Schema({
  address: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  trackingNumber: String,
  carrier: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'failed'],
    default: 'pending'
  },
  updates: [{
    status: String,
    location: String,
    timestamp: Date,
    description: String
  }]
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  items: [orderItemSchema],
  payment: paymentSchema,
  shipping: shippingSchema,
  status: {
    type: String,
    enum: [
      'created',
      'payment_pending',
      'payment_failed',
      'confirmed',
      'processing',
      'shipped',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'return_requested',
      'return_approved',
      'return_shipped',
      'return_received',
      'refunded'
    ],
    default: 'created'
  },
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  shippingCost: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  notes: String,
  cancellationReason: String,
  returnReason: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate unique order number
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const count = await Order.countDocuments() + 1;
    this.orderNumber = `ORD${year}${month}${count.toString().padStart(6, '0')}`;
  }
  next();
});

// Update order status
orderSchema.methods.updateStatus = async function(newStatus, reason = '') {
  this.status = newStatus;
  if (newStatus === 'cancelled') {
    this.cancellationReason = reason;
  } else if (newStatus === 'return_requested') {
    this.returnReason = reason;
  }
  return this.save();
};

// Process payment
orderSchema.methods.processPayment = async function(paymentDetails) {
  this.payment = {
    ...this.payment,
    ...paymentDetails
  };
  if (paymentDetails.status === 'completed') {
    this.status = 'confirmed';
  } else if (paymentDetails.status === 'failed') {
    this.status = 'payment_failed';
  }
  return this.save();
};

// Update shipping
orderSchema.methods.updateShipping = async function(shippingUpdate) {
  this.shipping = {
    ...this.shipping,
    ...shippingUpdate
  };
  if (shippingUpdate.status) {
    this.shipping.updates.push({
      status: shippingUpdate.status,
      location: shippingUpdate.location,
      timestamp: new Date(),
      description: shippingUpdate.description
    });
  }
  return this.save();
};

// Process refund
orderSchema.methods.processRefund = async function(refundDetails) {
  this.payment.refundId = refundDetails.refundId;
  this.payment.refundStatus = refundDetails.status;
  if (refundDetails.status === 'completed') {
    this.status = 'refunded';
  }
  return this.save();
};

// Calculate totals
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  this.tax = this.subtotal * 0.18; // 18% GST
  this.total = this.subtotal + this.tax + this.shippingCost - this.discount;
  return this.total;
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;