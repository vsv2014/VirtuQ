const Product = require('../models/Product.js');

class SearchService {
  static buildFilterQuery(filters) {
    const query = {};

    // Basic filters
    if (filters.gender) query.gender = filters.gender;
    if (filters.category) query.category = filters.category;
    if (filters.brand) query.brand = filters.brand;
    if (filters.subcategory) query.subcategory = filters.subcategory;

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      query.price = { $gte: min, $lte: max };
    }

    // Size filter
    if (filters.sizes) {
      const sizeArray = Array.isArray(filters.sizes) ? filters.sizes : [filters.sizes];
      query.sizes = { $in: sizeArray };
    }

    // Color filter
    if (filters.colors) {
      const colorArray = Array.isArray(filters.colors) ? filters.colors : [filters.colors];
      query.colors = { $in: colorArray };
    }

    // Stock availability
    if (filters.inStock) {
      query['variations.stock'] = { $gt: 0 };
    }

    // Search text
    if (filters.searchText) {
      query.$or = [
        { name: { $regex: filters.searchText, $options: 'i' } },
        { description: { $regex: filters.searchText, $options: 'i' } },
        { brand: { $regex: filters.searchText, $options: 'i' } }
      ];
    }

    // Rating filter
    if (filters.minRating) {
      query['rating.average'] = { $gte: Number(filters.minRating) };
    }

    return query;
  }

  static buildSortQuery(sortOption) {
    switch (sortOption) {
      case 'price_asc':
        return { price: 1 };
      case 'price_desc':
        return { price: -1 };
      case 'newest':
        return { createdAt: -1 };
      case 'rating':
        return { 'rating.average': -1 };
      case 'popularity':
        return { totalSales: -1 };
      default:
        return { createdAt: -1 };
    }
  }

  static async searchProducts({
    filters = {},
    sort = 'newest',
    page = 1,
    limit = 12,
    fields = null
  }) {
    try {
      const query = this.buildFilterQuery(filters);
      const sortQuery = this.buildSortQuery(sort);
      const skip = (page - 1) * limit;

      // Select specific fields if provided
      const fieldSelection = fields ? fields.split(',').join(' ') : '';

      // Execute main query
      const productsPromise = Product.find(query)
        .select(fieldSelection)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit);

      // Count total documents
      const countPromise = Product.countDocuments(query);

      // Execute both promises concurrently
      const [products, totalProducts] = await Promise.all([
        productsPromise,
        countPromise
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(totalProducts / limit);
      const hasMore = page < totalPages;

      // Get aggregated data for filters
      const aggregatedData = await this.getAggregatedData(query);

      return {
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          hasMore,
          limit
        },
        aggregations: aggregatedData
      };
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  static async getAggregatedData(baseQuery = {}) {
    try {
      const [
        categories,
        brands,
        priceRange,
        sizes,
        colors
      ] = await Promise.all([
        // Get unique categories with count
        Product.aggregate([
          { $match: baseQuery },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),

        // Get unique brands with count
        Product.aggregate([
          { $match: baseQuery },
          { $group: { _id: '$brand', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),

        // Get price range
        Product.aggregate([
          { $match: baseQuery },
          {
            $group: {
              _id: null,
              minPrice: { $min: '$price' },
              maxPrice: { $max: '$price' }
            }
          }
        ]),

        // Get unique sizes with count
        Product.aggregate([
          { $match: baseQuery },
          { $unwind: '$sizes' },
          { $group: { _id: '$sizes', count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ]),

        // Get unique colors with count
        Product.aggregate([
          { $match: baseQuery },
          { $unwind: '$colors' },
          { $group: { _id: '$colors', count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ])
      ]);

      return {
        categories: categories.map(c => ({ name: c._id, count: c.count })),
        brands: brands.map(b => ({ name: b._id, count: b.count })),
        priceRange: priceRange[0] ? {
          min: priceRange[0].minPrice,
          max: priceRange[0].maxPrice
        } : { min: 0, max: 0 },
        sizes: sizes.map(s => ({ size: s._id, count: s.count })),
        colors: colors.map(c => ({ color: c._id, count: c.count }))
      };
    } catch (error) {
      throw new Error(`Aggregation failed: ${error.message}`);
    }
  }

  static async getRecommendedProducts(productId, limit = 4) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Find similar products based on category, brand, and price range
      const similarProducts = await Product.find({
        _id: { $ne: productId },
        $or: [
          { category: product.category },
          { brand: product.brand }
        ],
        price: {
          $gte: product.price * 0.7,
          $lte: product.price * 1.3
        }
      })
      .limit(limit)
      .select('name images price brand category rating');

      return similarProducts;
    } catch (error) {
      throw new Error(`Failed to get recommendations: ${error.message}`);
    }
  }
}

module.exports = SearchService;
