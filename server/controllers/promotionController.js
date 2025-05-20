const { PromoCode, Order } = require('../models');
const { Op } = require('sequelize');

// @desc    Create a new promo code
// @route   POST /api/promotion/promocodes
// @access  Private/Admin
const createPromoCode = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      startDate,
      endDate,
      isActive,
      maxUses,
      description,
      applyToProducts,
      applyToCategories
    } = req.body;

    // Check if promo code already exists
    const existingCode = await PromoCode.findOne({
      where: { code: code.toUpperCase() }
    });

    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: 'Promo code already exists'
      });
    }

    // Validate discount type and value
    if (
      (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) ||
      (discountType === 'fixed' && discountValue <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discount value'
      });
    }

    // Create the promo code
    const promoCode = await PromoCode.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderValue: minOrderValue || 0,
      maxDiscount: maxDiscount || null,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      isActive: isActive !== undefined ? isActive : true,
      maxUses: maxUses || null,
      usedCount: 0,
      description,
      applyToProducts: applyToProducts || [],
      applyToCategories: applyToCategories || []
    });

    res.status(201).json({
      success: true,
      message: 'Promo code created successfully',
      data: promoCode
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all promo codes
// @route   GET /api/promotion/promocodes
// @access  Private/Admin
const getAllPromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: promoCodes.length,
      data: promoCodes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get a promo code by ID
// @route   GET /api/promotion/promocodes/:id
// @access  Private/Admin
const getPromoCodeById = async (req, res) => {
  try {
    const promoCode = await PromoCode.findByPk(req.params.id);

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found'
      });
    }

    res.json({
      success: true,
      data: promoCode
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update a promo code
// @route   PUT /api/promotion/promocodes/:id
// @access  Private/Admin
const updatePromoCode = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      startDate,
      endDate,
      isActive,
      maxUses,
      description,
      applyToProducts,
      applyToCategories
    } = req.body;

    const promoCode = await PromoCode.findByPk(req.params.id);

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found'
      });
    }

    // If code is being changed, check if new code already exists
    if (code && code !== promoCode.code) {
      const existingCode = await PromoCode.findOne({
        where: { 
          code: code.toUpperCase(),
          id: { [Op.ne]: req.params.id }
        }
      });

      if (existingCode) {
        return res.status(400).json({
          success: false,
          message: 'This promo code already exists'
        });
      }

      promoCode.code = code.toUpperCase();
    }

    // Validate discount type and value if they are being updated
    if (discountType && discountValue) {
      if (
        (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) ||
        (discountType === 'fixed' && discountValue <= 0)
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid discount value'
        });
      }
    }

    // Update fields that were provided
    if (discountType) promoCode.discountType = discountType;
    if (discountValue) promoCode.discountValue = discountValue;
    if (minOrderValue !== undefined) promoCode.minOrderValue = minOrderValue;
    if (maxDiscount !== undefined) promoCode.maxDiscount = maxDiscount;
    if (startDate) promoCode.startDate = new Date(startDate);
    if (endDate) promoCode.endDate = new Date(endDate);
    if (isActive !== undefined) promoCode.isActive = isActive;
    if (maxUses !== undefined) promoCode.maxUses = maxUses;
    if (description) promoCode.description = description;
    if (applyToProducts) promoCode.applyToProducts = applyToProducts;
    if (applyToCategories) promoCode.applyToCategories = applyToCategories;

    await promoCode.save();

    res.json({
      success: true,
      message: 'Promo code updated successfully',
      data: promoCode
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete a promo code
// @route   DELETE /api/promotion/promocodes/:id
// @access  Private/Admin
const deletePromoCode = async (req, res) => {
  try {
    const promoCode = await PromoCode.findByPk(req.params.id);

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found'
      });
    }

    await promoCode.destroy();

    res.json({
      success: true,
      message: 'Promo code deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Validate a promo code
// @route   POST /api/promotion/validate
// @access  Private
const validatePromoCode = async (req, res) => {
  try {
    const { code, cartTotal, products, categories } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Promo code is required'
      });
    }

    // Find the promo code
    const promoCode = await PromoCode.findOne({
      where: { 
        code: code.toUpperCase(),
        isActive: true,
        startDate: { [Op.lte]: new Date() },
        [Op.or]: [
          { endDate: null },
          { endDate: { [Op.gte]: new Date() } }
        ]
      }
    });

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired promo code'
      });
    }

    // Check if promo code has reached max uses
    if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
      return res.status(400).json({
        success: false,
        message: 'Promo code has reached maximum usage limit'
      });
    }

    // Check if order meets minimum value requirement
    if (cartTotal < promoCode.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Order must be at least ${promoCode.minOrderValue} to use this code`
      });
    }

    // Check if user has already used this promo code
    if (req.user) {
      const userOrderWithCode = await Order.findOne({
        where: {
          userId: req.user.id,
          promoCode: promoCode.code
        }
      });

      if (userOrderWithCode) {
        return res.status(400).json({
          success: false,
          message: 'You have already used this promo code'
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    
    if (promoCode.discountType === 'percentage') {
      discountAmount = (cartTotal * promoCode.discountValue) / 100;
      
      // Apply max discount if specified
      if (promoCode.maxDiscount && discountAmount > promoCode.maxDiscount) {
        discountAmount = promoCode.maxDiscount;
      }
    } else {
      // Fixed discount
      discountAmount = promoCode.discountValue;
      
      // Ensure discount doesn't exceed cart total
      if (discountAmount > cartTotal) {
        discountAmount = cartTotal;
      }
    }

    // Round discount to 2 decimal places
    discountAmount = Math.round(discountAmount * 100) / 100;

    res.json({
      success: true,
      data: {
        code: promoCode.code,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        discountAmount,
        finalTotal: cartTotal - discountAmount
      }
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
  createPromoCode,
  getAllPromoCodes,
  getPromoCodeById,
  updatePromoCode,
  deletePromoCode,
  validatePromoCode
}; 