const express = require('express');
const router = express.Router();
const { 
  getOrders, 
  getOrderById, 
  createOrder, 
  updateOrderStatus,
  deleteOrder,
  getMyOrders,
  getOrderStats
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private/Admin
router.get('/', protect, admin, getOrders);

// @route   GET /api/orders/stats
// @desc    Get order statistics
// @access  Private/Admin
router.get('/stats', protect, admin, getOrderStats);

// @route   GET /api/orders/myorders
// @desc    Get logged in user orders
// @access  Private
router.get('/myorders', protect, getMyOrders);

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', protect, createOrder);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, getOrderById);

// @route   PUT /api/orders/:id
// @desc    Update order status
// @access  Private/Admin
router.put('/:id', protect, admin, updateOrderStatus);

// @route   DELETE /api/orders/:id
// @desc    Delete order
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteOrder);

module.exports = router; 