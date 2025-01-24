const Product = require('../models/product');
const Category = require('../models/Category');
const { io } = require('../socket');

class ProductService {
  // Create a new product
  async createProduct(productData, userId) {
    try {
      const product = new Product({
        ...productData,
        metadata: {
          createdBy: userId,
          lastUpdatedBy: userId
        }
      });

      await product.save();

      // Emit real-time update
      io.to('products').emit('product-created', {
        productId: product._id,
        name: product.name
      });

      return product;
    } catch (error) {
      throw error;
    }
  }

  // Get products with filtering and pagination
  async getProducts(filters = {}, options = {}) {
    try {
      const {
        category,
        brand,
        minPrice,
        maxPrice,
        status,
        inStock,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 10
      } = filters;

      const query = {};

      // Apply filters
      if (category) query.category = category;
      if (brand) query.brand = brand;
      if (status) query.status = status;
      if (minPrice || maxPrice) {
        query.basePrice = {};
        if (minPrice) query.basePrice.$gte = minPrice;
        if (maxPrice) query.basePrice.$lte = maxPrice;
      }
      if (inStock === true) {
        query['variants.stock'] = { $gt: 0 };
      }
      if (search) {
        query.$text = { $search: search };
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const products = await Product.find(query)
        .populate('category', 'name slug')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Product.countDocuments(query);

      return {
        products,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw error;
    }
  }

  // Get a single product by ID
  async getProductById(productId) {
    try {
      const product = await Product.findById(productId)
        .populate('category', 'name slug path')
        .populate('metadata.createdBy', 'name')
        .populate('metadata.lastUpdatedBy', 'name');

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    } catch (error) {
      throw error;
    }
  }

  // Update a product
  async updateProduct(productId, updates, userId) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Update fields
      Object.keys(updates).forEach(key => {
        if (key !== 'metadata' && key !== '_id') {
          product[key] = updates[key];
        }
      });

      // Update metadata
      product.metadata.lastUpdatedBy = userId;

      await product.save();

      // Emit real-time update
      io.to('products').emit('product-updated', {
        productId: product._id,
        name: product.name
      });

      return product;
    } catch (error) {
      throw error;
    }
  }

  // Delete a product
  async deleteProduct(productId) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      await product.remove();

      // Emit real-time update
      io.to('products').emit('product-deleted', {
        productId: product._id,
        name: product.name
      });

      return { message: 'Product deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Update product stock
  async updateStock(productId, variantId, quantity, operation = 'decrease') {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const newStock = await product.updateStock(variantId, quantity, operation);

      // Emit real-time update
      io.to('products').emit('stock-updated', {
        productId: product._id,
        variantId,
        newStock
      });

      return { stock: newStock };
    } catch (error) {
      throw error;
    }
  }

  // Check product availability
  async checkAvailability(productId, variantId, quantity) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      return product.checkVariantAvailability(variantId, quantity);
    } catch (error) {
      throw error;
    }
  }

  // Update product ratings
  async updateRatings(productId, rating) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      await product.updateRatings(rating);

      // Emit real-time update
      io.to('products').emit('ratings-updated', {
        productId: product._id,
        newRating: product.ratings.average,
        totalRatings: product.ratings.count
      });

      return product;
    } catch (error) {
      throw error;
    }
  }

  // Get related products
  async getRelatedProducts(productId, limit = 5) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const relatedProducts = await Product.find({
        category: product.category,
        _id: { $ne: product._id },
        status: 'active'
      })
        .limit(limit)
        .select('name basePrice images ratings');

      return relatedProducts;
    } catch (error) {
      throw error;
    }
  }

  // Search products
  async searchProducts(query, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'relevance'
      } = options;

      let sort = {};
      switch (sortBy) {
        case 'price_asc':
          sort = { basePrice: 1 };
          break;
        case 'price_desc':
          sort = { basePrice: -1 };
          break;
        case 'rating':
          sort = { 'ratings.average': -1 };
          break;
        case 'newest':
          sort = { createdAt: -1 };
          break;
        default:
          sort = { score: { $meta: 'textScore' } };
      }

      const products = await Product.find(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' } }
      )
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Product.countDocuments({ $text: { $search: query } });

      return {
        products,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProductService();
