const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getProvinces,
  getDistricts,
  getWards,
  getShippingServices,
  calculateShippingFee,
  createShippingOrder,
  getShippingOrder
} = require('../controllers/shippingController');

// Public routes
router.get('/provinces', getProvinces);
router.get('/districts/:provinceId', getDistricts);
router.get('/wards/:districtId', getWards);
router.post('/services', getShippingServices);
router.post('/calculate', calculateShippingFee);

// Private routes
router.get('/orders/:trackingNumber', protect, getShippingOrder);

// Admin routes
router.post('/orders', protect, admin, createShippingOrder);

module.exports = router; 