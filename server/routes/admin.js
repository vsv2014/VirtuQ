const express = require('express');
const { auth } = require('../middleware/auth');
const AdminService = require('../services/adminService');
const { upload } = require('../services/imageService');
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Bulk create products with images
router.post('/products/bulk', auth, isAdmin, upload.array('images', 50), async (req, res) => {
  try {
    const { products } = req.body;
    const files = req.files;

    // Group files by product index
    const fileGroups = [];
    products.forEach((_, index) => {
      fileGroups.push(files.filter(file => file.fieldname === `images_${index}`));
    });

    const createdProducts = await AdminService.bulkCreateProducts(
      JSON.parse(products),
      fileGroups
    );

    res.status(201).json(createdProducts);
  } catch (error) {
    console.error('Bulk creation error:', error);
    res.status(500).json({ message: 'Error in bulk product creation', error: error.message });
  }
});

// Bulk update products
router.put('/products/bulk', auth, isAdmin, async (req, res) => {
  try {
    const { updates } = req.body;
    const updatedProducts = await AdminService.bulkUpdateProducts(updates);
    res.json(updatedProducts);
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ message: 'Error in bulk product update', error: error.message });
  }
});

// Bulk delete products
router.delete('/products/bulk', auth, isAdmin, async (req, res) => {
  try {
    const { productIds } = req.body;
    const result = await AdminService.bulkDeleteProducts(productIds);
    res.json(result);
  } catch (error) {
    console.error('Bulk deletion error:', error);
    res.status(500).json({ message: 'Error in bulk product deletion', error: error.message });
  }
});

// Import products from CSV/Excel
router.post('/products/import', auth, isAdmin, multer().single('file'), async (req, res) => {
  try {
    const results = [];
    const headers = [];
    let isFirstRow = true;

    // Create readable stream from buffer
    const stream = Readable.from(req.file.buffer.toString());

    // Process CSV data
    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (data) => {
          if (isFirstRow) {
            headers.push(...Object.keys(data));
            isFirstRow = false;
          }
          results.push(Object.values(data));
        })
        .on('end', resolve)
        .on('error', reject);
    });

    const importedProducts = await AdminService.importProductsFromFile(results, headers);
    res.status(201).json(importedProducts);
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: 'Error importing products', error: error.message });
  }
});

// Export products to CSV
router.get('/products/export', auth, isAdmin, async (req, res) => {
  try {
    const { query } = req.query;
    const { headers, data } = await AdminService.exportProducts(query ? JSON.parse(query) : {});
    
    // Convert to CSV string
    const csvString = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    
    res.send(csvString);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Error exporting products', error: error.message });
  }
});

// Get product statistics
router.get('/products/stats', auth, isAdmin, async (req, res) => {
  try {
    const stats = await AdminService.getProductStats();
    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Error getting product statistics', error: error.message });
  }
});

module.exports = router;
