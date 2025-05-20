const express = require('express');
const router = express.Router();
const { 
  getSummaryStats,
  getSalesReport,
  getTopProducts,
  getCustomerStats,
  getInventoryStats,
  getRecentOrders,
  getRecentReviews
} = require('../controllers/dashboardController');
const { protect, admin } = require('../middleware/auth');

// All dashboard routes require admin access
// @route   GET /api/dashboard/summary
// @desc    Get summary dashboard stats
// @access  Private/Admin
router.get('/summary', protect, admin, getSummaryStats);

// @route   GET /api/dashboard/sales
// @desc    Get sales report
// @access  Private/Admin
router.get('/sales', protect, admin, getSalesReport);

// @route   GET /api/dashboard/top-products
// @desc    Get top selling products
// @access  Private/Admin
router.get('/top-products', protect, admin, getTopProducts);

// @route   GET /api/dashboard/customers
// @desc    Get customer statistics
// @access  Private/Admin
router.get('/customers', protect, admin, getCustomerStats);

// @route   GET /api/dashboard/inventory
// @desc    Get inventory statistics
// @access  Private/Admin
router.get('/inventory', protect, admin, getInventoryStats);

// @route   GET /api/dashboard/recent-orders
// @desc    Get recent orders
// @access  Private/Admin
router.get('/recent-orders', protect, admin, getRecentOrders);

// @route   GET /api/dashboard/recent-reviews
// @desc    Get recent reviews
// @access  Private/Admin
router.get('/recent-reviews', protect, admin, getRecentReviews);

module.exports = router; 