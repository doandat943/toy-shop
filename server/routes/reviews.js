const express = require('express');
const router = express.Router();
const { 
  getReviews, 
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getProductReviews,
  getUserReviews
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/reviews
// @desc    Get all reviews
// @access  Private/Admin
router.get('/', protect, admin, getReviews);

// @route   GET /api/reviews/product/:productId
// @desc    Get reviews for a product
// @access  Public
router.get('/product/:productId', getProductReviews);

// @route   GET /api/reviews/user
// @desc    Get reviews by logged in user
// @access  Private
router.get('/user', protect, getUserReviews);

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post('/', protect, createReview);

// @route   GET /api/reviews/:id
// @desc    Get review by ID
// @access  Private/Admin
router.get('/:id', protect, admin, getReviewById);

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private
router.put('/:id', protect, updateReview);

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private
router.delete('/:id', protect, deleteReview);

module.exports = router; 