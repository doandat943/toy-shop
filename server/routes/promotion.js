const express = require('express');
const router = express.Router();
const { 
  createPromoCode,
  getAllPromoCodes,
  getPromoCodeById,
  updatePromoCode,
  deletePromoCode,
  validatePromoCode
} = require('../controllers/promotionController');
const { protect, admin } = require('../middleware/auth');

// @route   POST /api/promotion/promocodes
// @desc    Create a new promo code
// @access  Private/Admin
router.post('/promocodes', protect, admin, createPromoCode);

// @route   GET /api/promotion/promocodes
// @desc    Get all promo codes
// @access  Private/Admin
router.get('/promocodes', protect, admin, getAllPromoCodes);

// @route   GET /api/promotion/promocodes/:id
// @desc    Get a promo code by ID
// @access  Private/Admin
router.get('/promocodes/:id', protect, admin, getPromoCodeById);

// @route   PUT /api/promotion/promocodes/:id
// @desc    Update a promo code
// @access  Private/Admin
router.put('/promocodes/:id', protect, admin, updatePromoCode);

// @route   DELETE /api/promotion/promocodes/:id
// @desc    Delete a promo code
// @access  Private/Admin
router.delete('/promocodes/:id', protect, admin, deletePromoCode);

// @route   POST /api/promotion/validate
// @desc    Validate a promo code
// @access  Private
router.post('/validate', protect, validatePromoCode);

module.exports = router; 