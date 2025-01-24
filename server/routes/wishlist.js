const express = require('express');
const { auth } = require('../middleware/auth.js');
const User = require('../models/user.js');
const Product = require('../models/Product.js');

const router = express.Router();

// Test endpoint - no auth required
router.get('/test', (req, res) => {
  res.json({ message: 'Wishlist route is working' });
});

// Get user's wishlist
router.get('/', auth, async (req, res) => {
  try {
    // Mock wishlist data for development
    const mockWishlist = [
      {
        id: '1',
        productId: '1',
        name: 'Test Product 1',
        price: 299.99,
        image: 'https://via.placeholder.com/150',
        addedAt: new Date().toISOString()
      }
    ];
    res.json(mockWishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add to wishlist
router.post('/add', auth, async (req, res) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(req.user.id);
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    user.wishlist.push(productId);
    await user.save();

    res.json(product);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Error adding to wishlist' });
  }
});

// Remove from wishlist
router.delete('/remove/:productId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
    await user.save();

    res.json({ message: 'Product removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Error removing from wishlist' });
  }
});

// Move to cart
router.post('/move-to-cart/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user.id);
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Remove from wishlist
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    
    // Add to cart
    const cartItem = user.cart.find(item => item.product.toString() === productId);
    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      user.cart.push({ product: productId, quantity: 1 });
    }

    await user.save();

    res.json({ message: 'Product moved to cart' });
  } catch (error) {
    console.error('Error moving to cart:', error);
    res.status(500).json({ message: 'Error moving to cart' });
  }
});

// Clear wishlist
router.delete('/clear', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.wishlist = [];
    await user.save();

    res.json({ message: 'Wishlist cleared' });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({ message: 'Error clearing wishlist' });
  }
});

// Get wishlist stats
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    
    const stats = {
      total: user.wishlist.length,
      totalValue: user.wishlist.reduce((sum, product) => sum + product.price, 0),
      categories: {},
      brands: {}
    };

    user.wishlist.forEach(product => {
      // Count by category
      stats.categories[product.category] = (stats.categories[product.category] || 0) + 1;
      
      // Count by brand
      stats.brands[product.brand] = (stats.brands[product.brand] || 0) + 1;
    });

    res.json(stats);
  } catch (error) {
    console.error('Error fetching wishlist stats:', error);
    res.status(500).json({ message: 'Error fetching wishlist stats' });
  }
});

module.exports = router;
