import mongoose from 'mongoose';
import { products } from './seedProducts.js';

// MongoDB connection string - replace with your actual connection string
const MONGODB_URI = 'mongodb://localhost:27017/bolt_db';

// Product Schema
const productSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  price: Number,
  originalPrice: Number,
  category: String,
  subCategory: String,
  brand: String,
  sizes: [String],
  availableColors: [String],
  images: [String],
  rating: Number,
  reviews: Number,
  inStock: Boolean,
  tags: [String],
  createdAt: Date,
  updatedAt: Date
});

const Product = mongoose.model('Product', productSchema);

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    await Product.insertMany(products);
    console.log(`Successfully seeded ${products.length} products`);

    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeder
seedDatabase();
