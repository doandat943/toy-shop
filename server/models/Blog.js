const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const slugify = require('slugify');
const User = require('./User');

const Blog = sequelize.define('Blog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    unique: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  summary: {
    type: DataTypes.TEXT
  },
  thumbnail: {
    type: DataTypes.STRING
  },
  authorId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    },
    allowNull: false
  },
  publishDate: {
    type: DataTypes.DATE
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  metaTitle: {
    type: DataTypes.STRING
  },
  metaDescription: {
    type: DataTypes.TEXT
  },
  tags: {
    type: DataTypes.TEXT, // JSON array of tags
    get() {
      const rawValue = this.getDataValue('tags');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('tags', JSON.stringify(value));
    }
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  categoryId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'blog_categories',
      key: 'id'
    },
    allowNull: true
  }
}, {
  hooks: {
    beforeCreate: (blog) => {
      blog.slug = slugify(blog.title, { lower: true, locale: 'vi' });
    },
    beforeUpdate: (blog) => {
      if (blog.changed('title')) {
        blog.slug = slugify(blog.title, { lower: true, locale: 'vi' });
      }
    }
  }
});

// Define associations
Blog.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

module.exports = Blog; 