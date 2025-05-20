const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { protect } = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// @route   GET api/categories
// @desc    Get all categories
// @access  Public
router.get('/', (req, res) => {
  res.json({ msg: 'Categories route working' });
});

// @route   GET api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get('/:id', (req, res) => {
  res.json({ msg: `Get category ${req.params.id}` });
});

// @route   POST api/categories
// @desc    Create a category
// @access  Private/Admin
router.post('/', protect, adminMiddleware, (req, res) => {
  res.json({ msg: 'Create category route' });
});

// @route   PUT api/categories/:id
// @desc    Update a category
// @access  Private/Admin
router.put('/:id', protect, adminMiddleware, (req, res) => {
  res.json({ msg: `Update category ${req.params.id}` });
});

// @route   DELETE api/categories/:id
// @desc    Delete a category
// @access  Private/Admin
router.delete('/:id', protect, adminMiddleware, (req, res) => {
  res.json({ msg: `Delete category ${req.params.id}` });
});

module.exports = router; 