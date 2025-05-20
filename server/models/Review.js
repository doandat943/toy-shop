const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Product = require('./Product');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    },
    allowNull: true // Allow guest reviews
  },
  productId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'products',
      key: 'id'
    },
    allowNull: false
  },
  orderId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'orders',
      key: 'id'
    },
    allowNull: true // Link to the order if applicable
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  title: {
    type: DataTypes.STRING
  },
  comment: {
    type: DataTypes.TEXT
  },
  images: {
    type: DataTypes.TEXT, // JSON array of image URLs
    get() {
      const rawValue = this.getDataValue('images');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('images', JSON.stringify(value));
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  isVerifiedPurchase: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  childAge: {
    type: DataTypes.INTEGER // Age of child in months
  },
  replyText: {
    type: DataTypes.TEXT // Admin reply to the review
  },
  replyDate: {
    type: DataTypes.DATE
  }
});

// Define associations
// Remove the duplicate association that's already in index.js
// Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Remove the duplicate association that's already in index.js
// Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Update product rating when a review is created or updated
Review.addHook('afterCreate', async (review) => {
  await updateProductRating(review.productId);
});

Review.addHook('afterUpdate', async (review) => {
  if (review.changed('rating') || review.changed('status')) {
    await updateProductRating(review.productId);
  }
});

Review.addHook('afterDestroy', async (review) => {
  await updateProductRating(review.productId);
});

// Function to update product rating
async function updateProductRating(productId) {
  try {
    const reviews = await Review.findAll({
      where: {
        productId,
        status: 'approved'
      },
      attributes: ['rating']
    });

    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = parseFloat((totalRating / reviews.length).toFixed(2));
      
      await Product.update({
        rating: averageRating,
        numReviews: reviews.length
      }, {
        where: { id: productId }
      });
    } else {
      await Product.update({
        rating: 0,
        numReviews: 0
      }, {
        where: { id: productId }
      });
    }
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
}

module.exports = Review; 