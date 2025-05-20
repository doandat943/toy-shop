const express = require('express');
const router = express.Router();
const { 
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogsByCategory,
  getFeaturedBlogs,
  getRecentBlogs,
  getRelatedBlogPosts
} = require('../controllers/blogController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/blog
// @desc    Get all blogs
// @access  Public
router.get('/', getBlogs);

// @route   GET /api/blog/featured
// @desc    Get featured blogs
// @access  Public
router.get('/featured', getFeaturedBlogs);

// @route   GET /api/blog/recent
// @desc    Get recent blogs
// @access  Public
router.get('/recent', getRecentBlogs);

// @route   GET /api/blog/category/:categoryId
// @desc    Get blogs by category
// @access  Public
router.get('/category/:categoryId', getBlogsByCategory);

// @route   GET /api/blog/related
// @desc    Get blog posts related to a product or category
// @access  Public
router.get('/related', getRelatedBlogPosts);

// @route   POST /api/blog
// @desc    Create a new blog
// @access  Private/Admin
router.post('/', protect, admin, upload.single('image'), createBlog);

// @route   GET /api/blog/:id
// @desc    Get blog by ID
// @access  Public
router.get('/:id', getBlogById);

// @route   PUT /api/blog/:id
// @desc    Update blog
// @access  Private/Admin
router.put('/:id', protect, admin, upload.single('image'), updateBlog);

// @route   DELETE /api/blog/:id
// @desc    Delete blog
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteBlog);

module.exports = router; 