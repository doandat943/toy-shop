const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CarouselItem = sequelize.define('CarouselItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true, // Basic validation: image URL cannot be empty
      isUrl: true,    // Basic validation: image should be a URL
    },
  },
  caption: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  // Optional: link to navigate to when carousel item is clicked
  link: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true, // Ensure link is a valid URL if provided
    },
  },
  // Optional: target for the link (e.g., _blank, _self)
  target: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '_self',
  }
}, {
  tableName: 'carousel_items',
  timestamps: true, // Adds createdAt and updatedAt fields
});

module.exports = CarouselItem; 