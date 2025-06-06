const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getShippingServices,
  calculateShippingFee,
  createShippingOrder,
  getShippingOrder
} = require('../controllers/shippingController');

// Public routes
router.post('/services', getShippingServices);
router.post('/calculate', calculateShippingFee);

// Private routes
router.get('/orders/:trackingNumber', protect, getShippingOrder);

// Admin routes
router.post('/orders', protect, admin, createShippingOrder);

module.exports = router; 