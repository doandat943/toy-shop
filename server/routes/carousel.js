const express = require('express');
const router = express.Router();
const {
  getActiveCarouselItems,
  getAllCarouselItems,
  getCarouselItemById,
  createCarouselItem,
  updateCarouselItem,
  deleteCarouselItem,
} = require('../controllers/carouselController');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/carousel/active
// @desc    Get all active carousel items for public display
// @access  Public
router.get('/active', getActiveCarouselItems);

// @route   GET /api/carousel
// @desc    Get all carousel items for admin management
// @access  Private/Admin
router.get('/', protect, admin, getAllCarouselItems);

// @route   POST /api/carousel
// @desc    Create a new carousel item
// @access  Private/Admin
router.post('/', protect, admin, createCarouselItem);

// @route   GET /api/carousel/:id
// @desc    Get a single carousel item by ID
// @access  Private/Admin
router.get('/:id', protect, admin, getCarouselItemById);

// @route   PUT /api/carousel/:id
// @desc    Update a carousel item
// @access  Private/Admin
router.put('/:id', protect, admin, updateCarouselItem);

// @route   DELETE /api/carousel/:id
// @desc    Delete a carousel item
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteCarouselItem);

module.exports = router; 