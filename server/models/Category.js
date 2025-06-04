const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const slugify = require('slugify');

const Category = sequelize.define('Category', {
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
  image: {
    type: DataTypes.STRING
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  parentId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'categories',
      key: 'id'
    },
    allowNull: true
  }
}, {
  hooks: {
    beforeCreate: (category) => {
      category.slug = slugify(category.name, { lower: true, locale: 'vi' });
    },
    beforeUpdate: (category) => {
      if (category.changed('name')) {
        category.slug = slugify(category.name, { lower: true, locale: 'vi' });
      }
    }
  }
});

// Self-referencing relationship for subcategories
Category.hasMany(Category, { as: 'subcategories', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

module.exports = Category; 