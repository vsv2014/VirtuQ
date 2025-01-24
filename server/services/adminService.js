const Product = require('../models/Product.js');
const { uploadImages, deleteImages } = require('./imageService');

class AdminService {
  // Bulk product creation
  static async bulkCreateProducts(products, files) {
    const session = await Product.startSession();
    session.startTransaction();

    try {
      // Upload all images first
      const imageUploadPromises = files.map(fileGroup => uploadImages(fileGroup));
      const uploadedImageGroups = await Promise.all(imageUploadPromises);

      // Prepare products with uploaded image URLs
      const productsToCreate = products.map((product, index) => ({
        ...product,
        images: uploadedImageGroups[index].map(img => img.url)
      }));

      // Create all products
      const createdProducts = await Product.insertMany(productsToCreate, { session });
      
      await session.commitTransaction();
      return createdProducts;
    } catch (error) {
      await session.abortTransaction();
      throw new Error(`Bulk creation failed: ${error.message}`);
    } finally {
      session.endSession();
    }
  }

  // Bulk product update
  static async bulkUpdateProducts(updates) {
    const session = await Product.startSession();
    session.startTransaction();

    try {
      const updateOperations = updates.map(async ({ id, update }) => {
        const product = await Product.findByIdAndUpdate(
          id,
          update,
          { new: true, session, runValidators: true }
        );
        return product;
      });

      const updatedProducts = await Promise.all(updateOperations);
      await session.commitTransaction();
      return updatedProducts;
    } catch (error) {
      await session.abortTransaction();
      throw new Error(`Bulk update failed: ${error.message}`);
    } finally {
      session.endSession();
    }
  }

  // Bulk product deletion
  static async bulkDeleteProducts(productIds) {
    const session = await Product.startSession();
    session.startTransaction();

    try {
      // Get all products to delete their images
      const products = await Product.find({ _id: { $in: productIds } }, null, { session });
      
      // Collect all image URLs
      const imageUrls = products.reduce((acc, product) => [...acc, ...product.images], []);
      
      // Delete images from storage
      if (imageUrls.length > 0) {
        const publicIds = imageUrls.map(url => {
          const parts = url.split('/');
          const filename = parts[parts.length - 1];
          return `products/${filename.split('.')[0]}`;
        });
        await deleteImages(publicIds);
      }

      // Delete products from database
      const result = await Product.deleteMany({ _id: { $in: productIds } }, { session });
      
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new Error(`Bulk deletion failed: ${error.message}`);
    } finally {
      session.endSession();
    }
  }

  // Import products from CSV/Excel
  static async importProductsFromFile(fileData, headers) {
    try {
      const products = fileData.map(row => {
        const product = {};
        headers.forEach((header, index) => {
          // Handle special fields
          if (header === 'sizes' || header === 'colors' || header === 'tags') {
            product[header] = row[index].split(',').map(item => item.trim());
          } else if (header === 'variations') {
            product[header] = JSON.parse(row[index] || '[]');
          } else if (header === 'price' || header === 'originalPrice') {
            product[header] = Number(row[index]);
          } else {
            product[header] = row[index];
          }
        });
        return product;
      });

      return await Product.insertMany(products);
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`);
    }
  }

  // Export products to CSV format
  static async exportProducts(query = {}) {
    try {
      const products = await Product.find(query).lean();
      
      // Define CSV headers
      const headers = [
        'id', 'name', 'description', 'price', 'originalPrice',
        'category', 'subcategory', 'brand', 'gender',
        'sizes', 'colors', 'variations', 'tags'
      ];

      // Convert products to CSV format
      const csvData = products.map(product => {
        return headers.map(header => {
          const value = product[header];
          if (Array.isArray(value)) {
            return value.join(',');
          } else if (typeof value === 'object') {
            return JSON.stringify(value);
          }
          return value;
        });
      });

      return { headers, data: csvData };
    } catch (error) {
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  // Get product statistics
  static async getProductStats() {
    try {
      const stats = await Product.aggregate([
        {
          $facet: {
            categoryCounts: [
              { $group: { _id: '$category', count: { $sum: 1 } } }
            ],
            brandCounts: [
              { $group: { _id: '$brand', count: { $sum: 1 } } }
            ],
            priceStats: [
              {
                $group: {
                  _id: null,
                  avgPrice: { $avg: '$price' },
                  minPrice: { $min: '$price' },
                  maxPrice: { $max: '$price' }
                }
              }
            ],
            stockStats: [
              {
                $unwind: '$variations'
              },
              {
                $group: {
                  _id: null,
                  totalStock: { $sum: '$variations.stock' },
                  outOfStock: {
                    $sum: { $cond: [{ $eq: ['$variations.stock', 0] }, 1, 0] }
                  }
                }
              }
            ]
          }
        }
      ]);

      return stats[0];
    } catch (error) {
      throw new Error(`Failed to get product statistics: ${error.message}`);
    }
  }
}

module.exports = AdminService;
