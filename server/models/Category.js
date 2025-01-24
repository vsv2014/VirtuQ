const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 0
  },
  image: {
    url: String,
    alt: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    title: String,
    description: String,
    keywords: [String]
  },
  attributes: [{
    name: String,
    values: [String],
    isRequired: Boolean
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
CategorySchema.index({ name: 'text' });
CategorySchema.index({ slug: 1 });
CategorySchema.index({ parent: 1 });

// Virtual for subcategories
CategorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Virtual for products count
CategorySchema.virtual('productsCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Pre-save hook to generate slug
CategorySchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  next();
});

// Method to get full category path
CategorySchema.methods.getPath = async function() {
  const path = [this];
  let currentCategory = this;

  while (currentCategory.parent) {
    currentCategory = await this.constructor.findById(currentCategory.parent);
    if (!currentCategory) break;
    path.unshift(currentCategory);
  }

  return path;
};

// Static method to get category tree
CategorySchema.statics.getTree = async function() {
  const categories = await this.find({}).populate('subcategories');
  return categories.filter(cat => !cat.parent);
};

module.exports = mongoose.model('Category', CategorySchema);
