const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const slugify = require('slugify');
const Category = require('./Category');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  },
  richDescription: {
    type: DataTypes.TEXT
  },
  sku: {
    type: DataTypes.STRING
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  salePrice: {
    type: DataTypes.DECIMAL(10, 2)
  },
  onSale: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  minAge: {
    type: DataTypes.INTEGER,
    defaultValue: 0 // minimum age in months
  },
  maxAge: {
    type: DataTypes.INTEGER // maximum age in months, null means no maximum
  },
  thumbnail: {
    type: DataTypes.STRING
  },
  images: {
    type: DataTypes.TEXT, // Stored as JSON array of image URLs
    get() {
      const rawValue = this.getDataValue('images');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('images', JSON.stringify(value));
    }
  },
  weight: {
    type: DataTypes.DECIMAL(10, 2) // in grams
  },
  dimensions: {
    type: DataTypes.STRING // e.g. "10x20x30" (cm)
  },
  materials: {
    type: DataTypes.STRING
  },
  safetyInfo: {
    type: DataTypes.TEXT
  },
  educationalValue: {
    type: DataTypes.TEXT
  },
  isPersonalizable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  personalizationOptions: {
    type: DataTypes.TEXT, // Stored as JSON
    get() {
      const rawValue = this.getDataValue('personalizationOptions');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('personalizationOptions', JSON.stringify(value));
    }
  },
  tags: {
    type: DataTypes.TEXT, // Stored as JSON array of tags
    get() {
      const rawValue = this.getDataValue('tags');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('tags', JSON.stringify(value));
    }
  },
  videoUrl: {
    type: DataTypes.STRING
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  numReviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  salesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  categoryId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'categories',
      key: 'id'
    },
    allowNull: false
  }
}, {
  hooks: {
    beforeCreate: (product) => {
      product.slug = slugify(product.name, { lower: true, locale: 'vi' });
    },
    beforeUpdate: (product) => {
      if (product.changed('name')) {
        product.slug = slugify(product.name, { lower: true, locale: 'vi' });
      }
    }
  }
});

// Define associations
// Remove the duplicate association that's already in index.js
// Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
// Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

module.exports = Product; 