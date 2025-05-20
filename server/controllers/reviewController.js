const { Review, User, Product } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Private/Admin
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Product, as: 'product', attributes: ['id', 'name', 'thumbnail'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get review by ID
// @route   GET /api/reviews/:id
// @access  Private/Admin
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Product, as: 'product', attributes: ['id', 'name', 'thumbnail'] }
      ]
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { productId, rating, comment, title } = req.body;

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const userReviewExists = await Review.findOne({
      where: {
        userId: req.user.id,
        productId
      }
    });

    if (userReviewExists) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Create review
    const review = await Review.create({
      userId: req.user.id,
      productId,
      rating,
      comment,
      title
    });

    // Update product rating
    const productReviews = await Review.findAll({
      where: { productId }
    });

    const totalRating = productReviews.reduce((acc, item) => acc + item.rating, 0);
    const avgRating = totalRating / productReviews.length;

    product.rating = avgRating;
    product.numReviews = productReviews.length;
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  try {
    const { rating, comment, title } = req.body;
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if review belongs to user
    if (review.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    // Update review
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    if (title) review.title = title;
    
    await review.save();

    // Update product rating if rating changed
    if (rating) {
      const product = await Product.findByPk(review.productId);
      const productReviews = await Review.findAll({
        where: { productId: review.productId }
      });

      const totalRating = productReviews.reduce((acc, item) => acc + item.rating, 0);
      const avgRating = totalRating / productReviews.length;

      product.rating = avgRating;
      await product.save();
    }

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if review belongs to user or user is admin
    if (review.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    // Save product ID before deleting review
    const productId = review.productId;

    // Delete review
    await review.destroy();

    // Update product rating
    const product = await Product.findByPk(productId);
    const productReviews = await Review.findAll({
      where: { productId }
    });

    if (productReviews.length === 0) {
      product.rating = 0;
      product.numReviews = 0;
    } else {
      const totalRating = productReviews.reduce((acc, item) => acc + item.rating, 0);
      const avgRating = totalRating / productReviews.length;

      product.rating = avgRating;
      product.numReviews = productReviews.length;
    }

    await product.save();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { productId: req.params.productId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get reviews by logged in user
// @route   GET /api/reviews/user
// @access  Private
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { userId: req.user.id },
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'thumbnail'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getProductReviews,
  getUserReviews
}; 