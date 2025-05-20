const Product = require('../models/Product');
const Category = require('../models/Category');
const { Op } = require('sequelize');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { 
      keyword, 
      category,
      minPrice, 
      maxPrice,
      minAge,
      maxAge,
      sort = 'newest',
      page = 1, 
      limit = 12 
    } = req.query;
    
    const pageSize = parseInt(limit);
    const offset = (parseInt(page) - 1) * pageSize;
    
    // Build filter object
    const filter = {};
    
    // Search by keyword
    if (keyword) {
      filter[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } }
      ];
    }
    
    // Filter by category
    if (category) {
      filter.categoryId = category;
    }
    
    // Filter by price range
    if (minPrice) {
      filter.price = { ...filter.price, [Op.gte]: minPrice };
    }
    
    if (maxPrice) {
      filter.price = { ...filter.price, [Op.lte]: maxPrice };
    }
    
    // Filter by age range
    if (minAge) {
      filter.minAge = { [Op.gte]: minAge };
    }
    
    if (maxAge) {
      filter.maxAge = { [Op.lte]: maxAge };
    }
    
    // Ensure only active products are shown
    filter.isActive = true;
    
    // Determine sort order
    let order;
    switch (sort) {
      case 'price-low':
        order = [['price', 'ASC']];
        break;
      case 'price-high':
        order = [['price', 'DESC']];
        break;
      case 'rating':
        order = [['rating', 'DESC']];
        break;
      case 'popular':
        order = [['salesCount', 'DESC']];
        break;
      case 'newest':
      default:
        order = [['createdAt', 'DESC']];
    }
    
    // Get products
    const { count, rows: products } = await Product.findAndCountAll({
      where: filter,
      order,
      limit: pageSize,
      offset,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(count / pageSize);
    
    res.json({ 
      success: true,
      products,
      page: parseInt(page),
      pages: totalPages,
      total: count
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get a single product by id or slug
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Determine if id is numeric or slug
    const isNumeric = !isNaN(id);
    
    // Query based on id or slug
    const product = isNumeric 
      ? await Product.findByPk(id, {
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name', 'slug']
            }
          ]
        })
      : await Product.findOne({
          where: { slug: id },
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name', 'slug']
            }
          ]
        });
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    // Increment view count
    await product.update({ viewCount: product.viewCount + 1 });
    
    res.json({ 
      success: true,
      product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const products = await Product.findAll({
      where: {
        isActive: true,
        rating: { [Op.gte]: 4 } // Products with rating 4 or above
      },
      order: [
        ['rating', 'DESC'],
        ['numReviews', 'DESC']
      ],
      limit,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });
    
    res.json({ 
      success: true,
      products
    });
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 8;
    
    // Get the product to find related items
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    // Find related products in the same category
    const relatedProducts = await Product.findAll({
      where: {
        id: { [Op.ne]: id }, // Exclude current product
        categoryId: product.categoryId,
        isActive: true
      },
      limit,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });
    
    res.json({ 
      success: true,
      products: relatedProducts
    });
  } catch (error) {
    console.error('Error fetching related products:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      richDescription,
      sku,
      price,
      salePrice,
      onSale,
      stock,
      isFeatured,
      isActive,
      minAge,
      maxAge,
      weight,
      dimensions,
      materials,
      safetyInfo,
      educationalValue,
      isPersonalizable,
      personalizationOptions,
      tags,
      videoUrl,
      categoryId
    } = req.body;

    // Check if category exists
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
    }

    // Handle file uploads for thumbnail and images
    let thumbnail = null;
    let images = [];

    if (req.files) {
      if (req.files.thumbnail) {
        thumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
      }
      
      if (req.files.images) {
        images = req.files.images.map(file => `/uploads/${file.filename}`);
      }
    }

    // Create the product
    const product = await Product.create({
      name,
      description,
      richDescription,
      sku,
      price,
      salePrice,
      onSale,
      stock: stock || 0,
      isFeatured: isFeatured || false,
      isActive: isActive !== undefined ? isActive : true,
      minAge: minAge || 0,
      maxAge,
      thumbnail,
      images,
      weight,
      dimensions,
      materials,
      safetyInfo,
      educationalValue,
      isPersonalizable: isPersonalizable || false,
      personalizationOptions: personalizationOptions || null,
      tags: tags || [],
      videoUrl,
      categoryId
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    // Check if category exists if categoryId is provided
    if (req.body.categoryId) {
      const category = await Category.findByPk(req.body.categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
    }
    
    // Handle file uploads for thumbnail and images
    if (req.files) {
      if (req.files.thumbnail) {
        req.body.thumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
      }
      
      if (req.files.images) {
        const newImages = req.files.images.map(file => `/uploads/${file.filename}`);
        
        // If we're adding to existing images
        if (req.body.keepExistingImages === 'true') {
          const currentImages = product.images || [];
          req.body.images = [...currentImages, ...newImages];
        } else {
          req.body.images = newImages;
        }
      }
    }
    
    // Convert string arrays back to arrays if needed
    if (typeof req.body.tags === 'string') {
      try {
        req.body.tags = JSON.parse(req.body.tags);
      } catch (e) {
        req.body.tags = req.body.tags.split(',').map(tag => tag.trim());
      }
    }
    
    if (typeof req.body.personalizationOptions === 'string') {
      try {
        req.body.personalizationOptions = JSON.parse(req.body.personalizationOptions);
      } catch (e) {
        req.body.personalizationOptions = null;
      }
    }
    
    // Convert booleans from string to boolean
    if (req.body.isActive === 'true') req.body.isActive = true;
    if (req.body.isActive === 'false') req.body.isActive = false;
    
    if (req.body.isFeatured === 'true') req.body.isFeatured = true;
    if (req.body.isFeatured === 'false') req.body.isFeatured = false;
    
    if (req.body.onSale === 'true') req.body.onSale = true;
    if (req.body.onSale === 'false') req.body.onSale = false;
    
    if (req.body.isPersonalizable === 'true') req.body.isPersonalizable = true;
    if (req.body.isPersonalizable === 'false') req.body.isPersonalizable = false;
    
    // Update the product
    await product.update(req.body);
    
    // Get updated product with category
    const updatedProduct = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });
    
    res.json({ 
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    // Delete the product
    await product.destroy();
    
    res.json({ 
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getTopProducts,
  getRelatedProducts
}; 