const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  size: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  // Store the price at the time of adding to cart
  originalPrice: {
    type: Number,
    required: true
  }
});

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [CartItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  },
  totalItems: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate totals before saving
CartSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  next();
});

// Virtual for savings amount
CartSchema.virtual('savings').get(function() {
  return this.items.reduce((total, item) => {
    return total + ((item.originalPrice - item.price) * item.quantity);
  }, 0);
});

module.exports = mongoose.model('Cart', CartSchema);
