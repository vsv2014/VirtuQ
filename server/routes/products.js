const express = require('express');
const { auth } = require('../middleware/auth.js');
const Product = require('../models/Product.js');
const { upload, uploadImages, deleteImages } = require('../services/imageService.js');
const SearchService = require('../services/searchService.js');

const router = express.Router();

// Test endpoint - no auth required
router.get('/test', (req, res) => {
  res.json({ message: 'Products route is working' });
});

// Get all products with advanced search and filtering
router.get('/', async (req, res) => {
  try {
    // Mock products data for development
    const mockProducts = [
      {
        id: '1',
        name: 'Test Product 1',
        description: 'A test product description',
        price: 299.99,
        category: 'Test Category',
        image: 'https://via.placeholder.com/150',
        stock: 10,
        rating: 4.5,
        reviews: []
      },
      {
        id: '2',
        name: 'Test Product 2',
        description: 'Another test product description',
        price: 199.99,
        category: 'Test Category',
        image: 'https://via.placeholder.com/150',
        stock: 5,
        rating: 4.0,
        reviews: []
      }
    ];

    const {
      gender,
      category,
      brand,
      subcategory,
      priceRange,
      sizes,
      colors,
      inStock,
      searchText,
      minRating,
      sort = 'newest',
      page = 1,
      limit = 12,
      fields
    } = req.query;

    const filters = {
      gender,
      category,
      brand,
      subcategory,
      priceRange,
      sizes,
      colors,
      inStock: inStock === 'true',
      searchText,
      minRating
    };

    const result = await SearchService.searchProducts({
      filters,
      sort,
      page: Number(page),
      limit: Number(limit),
      fields
    });

    res.json(result);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Error searching products', error: error.message });
  }
});

// Get recommended products
router.get('/:id/recommendations', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;
    
    const recommendations = await SearchService.getRecommendedProducts(id, Number(limit));
    res.json(recommendations);
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ message: 'Error getting recommendations', error: error.message });
  }
});

// Get aggregated filter data
router.get('/aggregations', async (req, res) => {
  try {
    const aggregations = await SearchService.getAggregatedData();
    res.json(aggregations);
  } catch (error) {
    console.error('Aggregation error:', error);
    res.status(500).json({ message: 'Error getting aggregations', error: error.message });
  }
});

// Get available filters
router.get('/filters', async (req, res) => {
  try {
    const [
      genders,
      categories,
      brands,
      occasions,
      colors,
      sizes
    ] = await Promise.all([
      Product.distinct('gender'),
      Product.distinct('category'),
      Product.distinct('brand'),
      Product.distinct('occasion'),
      Product.distinct('colors'),
      Product.distinct('sizes')
    ]);

    // Get price ranges
    const priceRanges = [
      '0-500',
      '501-1000',
      '1001-2000',
      '2001-5000',
      '5001-10000',
      '10000+'
    ];

    res.json({
      genders,
      categories,
      brands,
      occasions,
      colors,
      sizes,
      priceRanges
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ message: 'Error fetching filters' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// Get product reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product.reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// Add product review
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const review = {
      user: req.user.id,
      rating,
      comment,
      createdAt: new Date()
    };

    product.reviews.push(review);
    await product.save();

    res.status(201).json(review);
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Error adding review' });
  }
});

// Create new product with image upload
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, category, brand, gender, sizes, colors, variations } = req.body;
    
    // Upload images to Cloudinary
    const uploadedImages = await uploadImages(req.files);
    const imageUrls = uploadedImages.map(img => img.url);

    const product = new Product({
      name,
      description,
      price,
      images: imageUrls,
      category,
      brand,
      gender,
      sizes: sizes ? JSON.parse(sizes) : undefined,
      colors: colors ? JSON.parse(colors) : undefined,
      variations: variations ? JSON.parse(variations) : undefined
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

// Update product with image handling
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    
    // Handle image updates if new images are uploaded
    if (req.files && req.files.length > 0) {
      const product = await Product.findById(id);
      
      // Delete old images from Cloudinary
      if (product.images) {
        // Extract public IDs from old image URLs
        const publicIds = product.images.map(url => {
          const parts = url.split('/');
          const filename = parts[parts.length - 1];
          return `products/${filename.split('.')[0]}`;
        });
        await deleteImages(publicIds);
      }
      
      // Upload new images
      const uploadedImages = await uploadImages(req.files);
      updates.images = uploadedImages.map(img => img.url);
    }

    // Parse JSON strings if present
    if (updates.sizes) updates.sizes = JSON.parse(updates.sizes);
    if (updates.colors) updates.colors = JSON.parse(updates.colors);
    if (updates.variations) updates.variations = JSON.parse(updates.variations);

    const product = await Product.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// Delete product with image cleanup
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete images from Cloudinary
    if (product.images) {
      const publicIds = product.images.map(url => {
        const parts = url.split('/');
        const filename = parts[parts.length - 1];
        return `products/${filename.split('.')[0]}`;
      });
      await deleteImages(publicIds);
    }

    await product.remove();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

module.exports = router;
