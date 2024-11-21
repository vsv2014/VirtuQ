import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
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
    quantity: Number,
    status: {
      type: String,
      enum: ['pending', 'kept', 'returned'],
      default: 'pending'
    }
  }],
  status: {
    type: String,
    enum: ['created', 'confirmed', 'out_for_delivery', 'delivered', 'trial_started', 'trial_completed', 'return_initiated', 'return_completed'],
    default: 'created'
  },
  address: {
    name: String,
    phone: String,
    pincode: String,
    city: String,
    state: String,
    locality: String,
    building: String,
    landmark: String,
    type: {
      type: String,
      enum: ['home', 'office', 'other']
    }
  },
  orderTime: {
    type: Date,
    default: Date.now
  },
  estimatedDelivery: Date,
  deliveredAt: Date,
  trialStartedAt: Date,
  trialEndsAt: Date,
  returnInitiatedAt: Date,
  returnCompletedAt: Date,
  total: Number,
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'refunded'],
    default: 'pending'
  },
  paymentId: String,
  returnPickupCode: String
}, {
  timestamps: true
});

orderSchema.methods.startTrial = function() {
  this.status = 'trial_started';
  this.trialStartedAt = new Date();
  this.trialEndsAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
  return this.save();
};

orderSchema.methods.completeTrial = function(keptItemIds) {
  this.status = 'trial_completed';
  this.items = this.items.map(item => ({
    ...item,
    status: keptItemIds.includes(item.productId.toString()) ? 'kept' : 'returned'
  }));
  return this.save();
};

orderSchema.methods.initiateReturn = function() {
  this.status = 'return_initiated';
  this.returnInitiatedAt = new Date();
  this.returnPickupCode = Math.random().toString(36).substr(2, 9).toUpperCase();
  return this.save();
};

export const Order = mongoose.model('Order', orderSchema);