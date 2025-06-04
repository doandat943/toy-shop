const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Review = require('./Review');
const Blog = require('./Blog');
const BlogCategory = require('./BlogCategory');
const PromoCode = require('./PromoCode');
const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

// Wishlist model for saving user's favorite products
const Wishlist = sequelize.define('Wishlist', {}, {
  timestamps: true
});

// Define User associations
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
User.hasMany(Blog, { foreignKey: 'userId', as: 'blogs' });

// Define Product associations
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'productOrderItems' });
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

// Define Order associations
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'orderItems' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Define Review associations
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Define Blog associations
Blog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Blog.belongsTo(BlogCategory, { foreignKey: 'categoryId', as: 'category' });
BlogCategory.hasMany(Blog, { foreignKey: 'categoryId', as: 'blogs' });

// Define Wishlist associations
User.belongsToMany(Product, { through: Wishlist, as: 'wishlistItems' });
Product.belongsToMany(User, { through: Wishlist, as: 'wishlistedBy' });

// Add points model for loyalty system
const Point = sequelize.define('Point', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  type: {
    type: DataTypes.ENUM('earned', 'redeemed'),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING
  },
  orderId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'orders',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

// Define Points associations
User.hasMany(Point, { foreignKey: 'userId', as: 'pointTransactions' });
Point.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Order.hasMany(Point, { foreignKey: 'orderId', as: 'pointTransactions' });
Point.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Thêm hook để debug Sequelize, theo dõi dữ liệu từ DB
if (process.env.NODE_ENV === 'development') {
  sequelize.addHook('afterFind', (instances, options) => {
    console.log('Sequelize afterFind hook called');
    if (Array.isArray(instances)) {
      // Đây là mảng kết quả
      console.log(`Found ${instances.length} records`);
      // Debug kiểu dữ liệu
      if (instances.length > 0) {
        console.log('First record type:', typeof instances[0]);
        // Kiểm tra nếu sequelize.Model tồn tại trước khi sử dụng
        try {
          if (sequelize.Model && typeof sequelize.Model === 'function') {
            console.log('Is instance of Model:', instances[0] instanceof sequelize.Model);
          } else {
            console.log('sequelize.Model is not a constructor or not available');
          }
        } catch (error) {
          console.log('Error checking instance type:', error.message);
        }
      }
    } else if (instances) {
      // Đây là kết quả đơn
      console.log('Found 1 record');
      console.log('Record type:', typeof instances);
      // Kiểm tra nếu sequelize.Model tồn tại trước khi sử dụng
      try {
        if (sequelize.Model && typeof sequelize.Model === 'function') {
          console.log('Is instance of Model:', instances instanceof sequelize.Model);
        } else {
          console.log('sequelize.Model is not a constructor or not available');
        }
      } catch (error) {
        console.log('Error checking instance type:', error.message);
      }
    } else {
      console.log('No records found');
    }
  });
}

// Export all models
module.exports = {
  User,
  Category,
  Product,
  Order,
  OrderItem,
  Review,
  Blog,
  BlogCategory,
  PromoCode,
  Wishlist,
  Point,
  sequelize
}; 