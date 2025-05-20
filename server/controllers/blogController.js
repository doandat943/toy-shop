const { Blog, BlogCategory, User, Product, Category } = require('../models');
const slugify = require('slugify');

// @desc    Get all blogs
// @route   GET /api/blog
// @access  Public
const getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const blogs = await Blog.findAndCountAll({
      include: [
        { model: BlogCategory, as: 'category' },
        { model: User, as: 'author', attributes: ['id', 'name'] }
      ],
      where: { isPublished: true },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      count: blogs.count,
      totalPages: Math.ceil(blogs.count / limit),
      currentPage: parseInt(page),
      data: blogs.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get blog by ID
// @route   GET /api/blog/:id
// @access  Public
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findOne({
      where: { 
        [Blog.sequelize.or]: [
          { id: req.params.id },
          { slug: req.params.id }
        ]
      },
      include: [
        { model: BlogCategory, as: 'category' },
        { model: User, as: 'author', attributes: ['id', 'name'] }
      ]
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // If blog is not published and user is not admin, don't allow access
    if (!blog.isPublished && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this blog'
      });
    }

    // Increment view count
    blog.views += 1;
    await blog.save();

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create a new blog
// @route   POST /api/blog
// @access  Private/Admin
const createBlog = async (req, res) => {
  try {
    const { title, content, categoryId, isPublished, isFeatured, metaDescription, tags } = req.body;

    // Check if category exists
    if (categoryId) {
      const category = await BlogCategory.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    // Create slug from title
    const slug = slugify(title, { lower: true, locale: 'vi' });

    // Create blog
    const blog = await Blog.create({
      title,
      slug,
      content,
      categoryId: categoryId || null,
      authorId: req.user.id,
      isPublished: isPublished === 'true' || isPublished === true,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      metaDescription,
      tags: tags ? JSON.parse(tags) : []
    });

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update blog
// @route   PUT /api/blog/:id
// @access  Private/Admin
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const { title, content, categoryId, isPublished, isFeatured, metaDescription, tags } = req.body;

    // Check if category exists
    if (categoryId && categoryId !== blog.categoryId) {
      const category = await BlogCategory.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    // Update blog
    if (title) {
      blog.title = title;
      blog.slug = slugify(title, { lower: true, locale: 'vi' });
    }
    if (content) blog.content = content;
    if (categoryId) blog.categoryId = categoryId;
    if (isPublished !== undefined) blog.isPublished = isPublished === 'true' || isPublished === true;
    if (isFeatured !== undefined) blog.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (req.file) blog.image = `/uploads/${req.file.filename}`;
    if (metaDescription) blog.metaDescription = metaDescription;
    if (tags) blog.tags = JSON.parse(tags);

    await blog.save();

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete blog
// @route   DELETE /api/blog/:id
// @access  Private/Admin
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    await blog.destroy();

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get blogs by category
// @route   GET /api/blog/category/:categoryId
// @access  Public
const getBlogsByCategory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const blogs = await Blog.findAndCountAll({
      where: { 
        categoryId: req.params.categoryId,
        isPublished: true
      },
      include: [
        { model: BlogCategory, as: 'category' },
        { model: User, as: 'author', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      count: blogs.count,
      totalPages: Math.ceil(blogs.count / limit),
      currentPage: parseInt(page),
      data: blogs.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get featured blogs
// @route   GET /api/blog/featured
// @access  Public
const getFeaturedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      where: { 
        isFeatured: true,
        isPublished: true 
      },
      include: [
        { model: BlogCategory, as: 'category' },
        { model: User, as: 'author', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get recent blogs
// @route   GET /api/blog/recent
// @access  Public
const getRecentBlogs = async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      where: { isPublished: true },
      include: [
        { model: BlogCategory, as: 'category' },
        { model: User, as: 'author', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get related blog posts by product or category
// @route   GET /api/blog/related
// @access  Public
const getRelatedBlogPosts = async (req, res) => {
  try {
    const { productId, categoryId, limit = 3 } = req.query;
    
    // Define the query conditions
    let whereConditions = { isPublished: true };
    let tagCondition = {};
    
    // If productId is provided, search blogs related to that product
    if (productId) {
      // Search in tags or content for the product name or ID
      // First get the product to access its name
      const product = await Product.findByPk(productId);
      
      if (product) {
        // Search for blogs that have the product name or ID in their content or tags
        tagCondition = {
          [Blog.sequelize.Op.or]: [
            { tags: { [Blog.sequelize.Op.like]: `%${product.name}%` } },
            { content: { [Blog.sequelize.Op.like]: `%${product.name}%` } },
            { title: { [Blog.sequelize.Op.like]: `%${product.name}%` } }
          ]
        };
      }
    }
    
    // If categoryId is provided, get blogs from that category
    if (categoryId) {
      // Get products from this category to find category name
      const category = await Category.findByPk(categoryId);
      
      if (category) {
        // If we already have tag conditions (from product), extend them
        if (Object.keys(tagCondition).length > 0) {
          tagCondition[Blog.sequelize.Op.or].push(
            { tags: { [Blog.sequelize.Op.like]: `%${category.name}%` } },
            { content: { [Blog.sequelize.Op.like]: `%${category.name}%` } },
            { title: { [Blog.sequelize.Op.like]: `%${category.name}%` } }
          );
        } else {
          // Otherwise create new conditions
          tagCondition = {
            [Blog.sequelize.Op.or]: [
              { tags: { [Blog.sequelize.Op.like]: `%${category.name}%` } },
              { content: { [Blog.sequelize.Op.like]: `%${category.name}%` } },
              { title: { [Blog.sequelize.Op.like]: `%${category.name}%` } }
            ]
          };
        }
      }
    }
    
    // Combine conditions
    whereConditions = {
      ...whereConditions,
      ...tagCondition
    };
    
    // Fetch the blogs
    const blogs = await Blog.findAll({
      where: whereConditions,
      include: [
        { model: BlogCategory, as: 'category' },
        { model: User, as: 'author', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });
    
    res.json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogsByCategory,
  getFeaturedBlogs,
  getRecentBlogs,
  getRelatedBlogPosts
}; 