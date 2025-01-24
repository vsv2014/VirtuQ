const Product = require('../models/Product.js');

class InventoryService {
  // Check product availability
  async checkAvailability(productId, size, quantity) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const sizeInventory = product.inventory.find(inv => inv.size === size);
      if (!sizeInventory) {
        throw new Error(`Size ${size} not available for this product`);
      }

      if (sizeInventory.available < quantity) {
        throw new Error(`Only ${sizeInventory.available} units available in size ${size}`);
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Reserve stock for order
  async reserveStock(productId, size, quantity) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const sizeInventory = product.inventory.find(inv => inv.size === size);
      if (!sizeInventory) {
        throw new Error(`Size ${size} not available`);
      }

      if (sizeInventory.available < quantity) {
        throw new Error('Insufficient stock');
      }

      sizeInventory.available -= quantity;
      sizeInventory.reserved += quantity;

      // Update low stock notification threshold
      if (sizeInventory.available <= product.lowStockThreshold) {
        // TODO: Notify admin about low stock
        product.lowStockAlert = true;
      }

      await product.save();
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Confirm stock deduction after payment
  async confirmStock(productId, size, quantity) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const sizeInventory = product.inventory.find(inv => inv.size === size);
      if (!sizeInventory) {
        throw new Error(`Size ${size} not available`);
      }

      sizeInventory.reserved -= quantity;
      sizeInventory.sold += quantity;

      await product.save();
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Release reserved stock (for failed payments or cancelled orders)
  async releaseStock(productId, size, quantity) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const sizeInventory = product.inventory.find(inv => inv.size === size);
      if (!sizeInventory) {
        throw new Error(`Size ${size} not available`);
      }

      sizeInventory.reserved -= quantity;
      sizeInventory.available += quantity;

      // Update low stock alert
      if (sizeInventory.available > product.lowStockThreshold) {
        product.lowStockAlert = false;
      }

      await product.save();
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Return stock to inventory
  async returnStock(productId, size, quantity) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const sizeInventory = product.inventory.find(inv => inv.size === size);
      if (!sizeInventory) {
        throw new Error(`Size ${size} not available`);
      }

      sizeInventory.sold -= quantity;
      sizeInventory.available += quantity;
      sizeInventory.returned += quantity;

      // Update low stock alert
      if (sizeInventory.available > product.lowStockThreshold) {
        product.lowStockAlert = false;
      }

      await product.save();
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get inventory status
  async getInventoryStatus(productId) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      return {
        productId: product._id,
        name: product.name,
        inventory: product.inventory.map(inv => ({
          size: inv.size,
          available: inv.available,
          reserved: inv.reserved,
          sold: inv.sold,
          returned: inv.returned
        })),
        lowStockAlert: product.lowStockAlert,
        lowStockThreshold: product.lowStockThreshold
      };
    } catch (error) {
      throw error;
    }
  }

  // Update inventory
  async updateInventory(productId, inventoryData) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      product.inventory = inventoryData.inventory;
      product.lowStockThreshold = inventoryData.lowStockThreshold;

      // Recalculate low stock alerts
      product.lowStockAlert = product.inventory.some(
        inv => inv.available <= product.lowStockThreshold
      );

      await product.save();
      return product;
    } catch (error) {
      throw error;
    }
  }

  // Get low stock products
  async getLowStockProducts() {
    try {
      const products = await Product.find({ lowStockAlert: true });
      return products.map(product => ({
        productId: product._id,
        name: product.name,
        inventory: product.inventory.filter(inv => inv.available <= product.lowStockThreshold)
      }));
    } catch (error) {
      throw error;
    }
  }

  // Get inventory analytics
  async getInventoryAnalytics() {
    try {
      const products = await Product.find();
      
      const analytics = {
        totalProducts: products.length,
        totalStock: 0,
        totalReserved: 0,
        totalSold: 0,
        totalReturned: 0,
        lowStockProducts: 0,
        inventoryValue: 0,
        sizeDistribution: {},
        topSelling: []
      };

      products.forEach(product => {
        product.inventory.forEach(inv => {
          analytics.totalStock += inv.available;
          analytics.totalReserved += inv.reserved;
          analytics.totalSold += inv.sold;
          analytics.totalReturned += inv.returned;
          
          // Size distribution
          analytics.sizeDistribution[inv.size] = (analytics.sizeDistribution[inv.size] || 0) + inv.available;
        });

        if (product.lowStockAlert) {
          analytics.lowStockProducts++;
        }

        analytics.inventoryValue += product.inventory.reduce(
          (total, inv) => total + (inv.available * product.price),
          0
        );
      });

      // Get top selling products
      analytics.topSelling = await Product.aggregate([
        {
          $project: {
            name: 1,
            totalSold: {
              $reduce: {
                input: '$inventory',
                initialValue: 0,
                in: { $add: ['$$value', '$$this.sold'] }
              }
            }
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 }
      ]);

      return analytics;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new InventoryService();
