const mongoose = require('mongoose');
require('dotenv').config();

const sampleProducts = [
  {
    name: "Classic White T-Shirt",
    description: "Essential cotton t-shirt perfect for everyday wear",
    price: 599,
    originalPrice: 799,
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"],
    brand: "Essential Wear",
    category: "T-Shirts",
    subcategory: "Basics",
    gender: "men",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Black", "Gray"],
    occasion: "Casual",
    stock: 100
  },
  {
    name: "Floral Summer Dress",
    description: "Light and breezy floral print dress",
    price: 1499,
    originalPrice: 1999,
    images: ["https://images.unsplash.com/photo-1578932750294-f5075e85f44a"],
    brand: "Fashion Forward",
    category: "Dresses",
    subcategory: "Summer",
    gender: "women",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Blue", "Pink"],
    occasion: "Casual",
    stock: 50
  },
  {
    name: "Slim Fit Jeans",
    description: "Classic blue denim jeans with perfect fit",
    price: 1299,
    originalPrice: 1599,
    images: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a"],
    brand: "Urban Style",
    category: "Jeans",
    subcategory: "Slim Fit",
    gender: "men",
    sizes: ["30", "32", "34", "36"],
    colors: ["Blue", "Black"],
    occasion: "Casual",
    stock: 75
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const Product = require('../models/product');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const result = await Product.insertMany(sampleProducts);
    console.log(`Added ${result.length} sample products`);

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
