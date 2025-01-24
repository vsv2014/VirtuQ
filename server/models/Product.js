const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const VariantSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  sku: {
    type: String,
    required: true,
    unique: true
  }
});

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  variants: [VariantSchema],
  reviews: [ReviewSchema],
  averageRating: {
    type: Number,
    default: 0
  },
  basePrice: {
    type: Number,
    required: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  specifications: [{
    name: String,
    value: String
  }],
  features: [String],
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'discontinued'],
    default: 'draft'
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ averageRating: -1 });
ProductSchema.index({ basePrice: 1 });
ProductSchema.index({ 'variants.sku': 1 });

// Virtual for checking if product is in stock
ProductSchema.virtual('inStock').get(function() {
  return this.variants.some(variant => variant.stock > 0);
});

// Calculate average rating when a review is added or modified
ProductSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
  } else {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = totalRating / this.reviews.length;
  }
  return this.averageRating;
};

// Method to update product ratings
ProductSchema.methods.updateRatings = async function(newRating) {
  this.reviews.push(newRating);
  this.calculateAverageRating();
  await this.save();
};

// Method to check stock availability
ProductSchema.methods.checkVariantAvailability = function(variantId, quantity) {
  const variant = this.variants.id(variantId);
  return variant && variant.stock >= quantity;
};

// Method to update stock
ProductSchema.methods.updateStock = async function(variantId, quantity, operation = 'decrease') {
  const variant = this.variants.id(variantId);
  if (variant) {
    if (operation === 'decrease') {
      if (variant.stock < quantity) throw new Error('Insufficient stock');
      variant.stock -= quantity;
    } else if (operation === 'increase') {
      variant.stock += quantity;
    }
  }
  await this.save();
  return variant.stock;
};

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
