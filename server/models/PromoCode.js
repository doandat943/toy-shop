const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PromoCode = sequelize.define('PromoCode', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  },
  discountType: {
    type: DataTypes.ENUM('percentage', 'fixed_amount', 'free_shipping'),
    defaultValue: 'percentage'
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  minimumAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  maximumDiscount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  usageLimit: {
    type: DataTypes.INTEGER, // Total number of times this code can be used
    allowNull: true
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  perCustomerUsageLimit: {
    type: DataTypes.INTEGER, // Number of times a customer can use this code
    allowNull: true,
    defaultValue: 1
  },
  applicableProducts: {
    type: DataTypes.TEXT, // JSON array of product IDs or 'all'
    get() {
      const rawValue = this.getDataValue('applicableProducts');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('applicableProducts', JSON.stringify(value));
    }
  },
  applicableCategories: {
    type: DataTypes.TEXT, // JSON array of category IDs or 'all'
    get() {
      const rawValue = this.getDataValue('applicableCategories');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('applicableCategories', JSON.stringify(value));
    }
  },
  userGroups: {
    type: DataTypes.TEXT, // JSON array of user types (e.g., 'new', 'returning', 'all')
    get() {
      const rawValue = this.getDataValue('userGroups');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('userGroups', JSON.stringify(value));
    }
  },
  campaignType: {
    type: DataTypes.ENUM('seasonal', 'birthday', 'general', 'special_event'),
    defaultValue: 'general'
  },
  campaignName: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'promo_codes'
});

// Define association with Order model
const Order = require('./Order');
Order.belongsTo(PromoCode, { foreignKey: 'promoCodeId', as: 'promoCode' });
PromoCode.hasMany(Order, { foreignKey: 'promoCodeId', as: 'orders' });

module.exports = PromoCode; 