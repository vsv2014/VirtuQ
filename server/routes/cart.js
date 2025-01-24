const express = require('express');
const { auth } = require('../middleware/auth');
const cartService = require('../services/cartService');

const router = express.Router();

// Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    const cart = await cartService.getUserCart(req.user.id);
    res.json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add item to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, quantity, size } = req.body;
    const cart = await cartService.addToCart(req.user.id, { productId, quantity, size });
    res.json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update cart item quantity
router.put('/item/:itemId', auth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const cart = await cartService.updateCartItem(req.user.id, { itemId, quantity });
    res.json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove item from cart
router.delete('/item/:itemId', auth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await cartService.removeFromCart(req.user.id, itemId);
    res.json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Clear cart
router.delete('/', auth, async (req, res) => {
  try {
    const cart = await cartService.clearCart(req.user.id);
    res.json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
