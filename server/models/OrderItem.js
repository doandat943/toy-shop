const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Order = require('./Order');
const Product = require('./Product');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'orders',
      key: 'id'
    },
    allowNull: false
  },
  productId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'products',
      key: 'id'
    },
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  image: {
    type: DataTypes.STRING
  },
  personalization: {
    type: DataTypes.TEXT, // JSON with personalization options
    get() {
      const rawValue = this.getDataValue('personalization');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('personalization', JSON.stringify(value));
    }
  }
}, {
  hooks: {
    beforeCreate: (item) => {
      // Auto-calculate total price if not set
      if (!item.getDataValue('totalPrice')) {
        const price = parseFloat(item.price || 0);
        const quantity = parseInt(item.quantity || 0);
        const discount = parseFloat(item.discount || 0);
        item.setDataValue('totalPrice', (price * quantity) - discount);
      }
    }
  }
});

// Define associations
// Remove the duplicate association that's already in index.js
// OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Remove the duplicate association that's already in index.js
// OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = OrderItem; 