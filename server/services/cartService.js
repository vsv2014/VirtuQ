const Cart = require('../models/Cart');
const Product = require('../models/Product.js');
const { io } = require('../socket');

const cartService = {
  // Get user's cart
  getUserCart: async (userId) => {
    let cart = await Cart.findOne({ user: userId })
      .populate('items.product', 'name images price discount');
    
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
    
    return cart;
  },

  // Add item to cart
  addToCart: async (userId, { productId, quantity, size }) => {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Check if size is available
    const sizeInventory = product.sizes.find(s => s.size === size);
    if (!sizeInventory || sizeInventory.quantity < quantity) {
      throw new Error('Selected size not available in requested quantity');
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Calculate price with discount
    const price = product.price * (1 - (product.discount || 0) / 100);

    // Check if item already exists in cart
    const existingItem = cart.items.find(item => 
      item.product.toString() === productId && item.size === size
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.price = price;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        size,
        price,
        originalPrice: product.price
      });
    }

    await cart.save();
    
    // Emit cart update event
    io.to(`user-${userId}`).emit('cart-updated', cart);
    
    return cart;
  },

  // Update cart item quantity
  updateCartItem: async (userId, { itemId, quantity }) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new Error('Cart not found');
    }

    const item = cart.items.id(itemId);
    if (!item) {
      throw new Error('Item not found in cart');
    }

    // Verify stock availability
    const product = await Product.findById(item.product);
    const sizeInventory = product.sizes.find(s => s.size === item.size);
    if (!sizeInventory || sizeInventory.quantity < quantity) {
      throw new Error('Requested quantity not available');
    }

    item.quantity = quantity;
    await cart.save();
    
    io.to(`user-${userId}`).emit('cart-updated', cart);
    
    return cart;
  },

  // Remove item from cart
  removeFromCart: async (userId, itemId) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();
    
    io.to(`user-${userId}`).emit('cart-updated', cart);
    
    return cart;
  },

  // Clear cart
  clearCart: async (userId) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.items = [];
    await cart.save();
    
    io.to(`user-${userId}`).emit('cart-updated', cart);
    
    return cart;
  }
};

module.exports = cartService;
