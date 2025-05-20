const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const slugify = require('slugify');

const BlogCategory = sequelize.define('BlogCategory', {
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
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'blog_categories',
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

// Define associations
// Remove the duplicate association that's already in index.js
// BlogCategory.hasMany(Blog, { foreignKey: 'categoryId', as: 'blogs' });
// Blog.belongsTo(BlogCategory, { foreignKey: 'categoryId', as: 'category' });

module.exports = BlogCategory; 