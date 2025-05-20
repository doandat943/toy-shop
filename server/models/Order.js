const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  orderNumber: {
    type: DataTypes.STRING,
    unique: true
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    },
    allowNull: true // Allow guest checkout
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'shipping', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  },
  subTotal: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  shippingCost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  shippingAddress: {
    type: DataTypes.TEXT
  },
  city: {
    type: DataTypes.STRING
  },
  district: {
    type: DataTypes.STRING
  },
  ward: {
    type: DataTypes.STRING
  },
  zipCode: {
    type: DataTypes.STRING
  },
  customerName: {
    type: DataTypes.STRING
  },
  customerEmail: {
    type: DataTypes.STRING
  },
  customerPhone: {
    type: DataTypes.STRING
  },
  paymentMethod: {
    type: DataTypes.ENUM('cod', 'bank_transfer', 'credit_card', 'qr_code'),
    defaultValue: 'cod'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed'),
    defaultValue: 'pending'
  },
  paymentDetails: {
    type: DataTypes.TEXT, // JSON with payment provider response
    get() {
      const rawValue = this.getDataValue('paymentDetails');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('paymentDetails', JSON.stringify(value));
    }
  },
  trackingNumber: {
    type: DataTypes.STRING
  },
  shippingProvider: {
    type: DataTypes.STRING
  },
  shippedAt: {
    type: DataTypes.DATE
  },
  deliveredAt: {
    type: DataTypes.DATE
  },
  cancelledAt: {
    type: DataTypes.DATE
  },
  cancelReason: {
    type: DataTypes.TEXT
  },
  notes: {
    type: DataTypes.TEXT
  },
  vatInvoice: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  vatInvoiceInfo: {
    type: DataTypes.TEXT // JSON with VAT invoice information
  },
  promoCodeId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'promo_codes',
      key: 'id'
    },
    allowNull: true
  }
}, {
  hooks: {
    beforeCreate: (order) => {
      // Generate order number: current date + random number
      const date = new Date();
      const dateStr = date.getFullYear().toString().substr(-2) + 
                     (date.getMonth() + 1).toString().padStart(2, '0') + 
                     date.getDate().toString().padStart(2, '0');
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      order.orderNumber = `BB-${dateStr}-${randomNum}`;
    }
  }
});

// Define associations
// Remove the duplicate association that's already in index.js
// Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Order; 