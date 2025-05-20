const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getTopProducts,
  getRelatedProducts
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all products
router.get('/', getProducts);

// Get top rated products
router.get('/top', getTopProducts);

// Get product by ID
router.get('/:id', getProductById);

// Get related products
router.get('/:id/related', getRelatedProducts);

// Create product (admin only)
router.post(
  '/', 
  protect, 
  admin, 
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]),
  createProduct
);

// Update product (admin only)
router.put(
  '/:id', 
  protect, 
  admin, 
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]),
  updateProduct
);

// Delete product (admin only)
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router; 