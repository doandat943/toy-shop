const { CarouselItem } = require('../models');

// @desc    Get all active carousel items
// @route   GET /api/carousel/active
// @access  Public
const getActiveCarouselItems = async (req, res) => {
  try {
    const items = await CarouselItem.findAll({
      where: { isActive: true },
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
    });
    res.json({ success: true, carouselItems: items });
  } catch (error) {
    console.error('Error fetching active carousel items:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get all carousel items (for admin)
// @route   GET /api/carousel
// @access  Private/Admin
const getAllCarouselItems = async (req, res) => {
  try {
    const items = await CarouselItem.findAll({
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
    });
    res.json({ success: true, carouselItems: items });
  } catch (error) {
    console.error('Error fetching all carousel items:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get a single carousel item by ID
// @route   GET /api/carousel/:id
// @access  Private/Admin 
// Note: Or public if needed for direct linking/editing by non-admins, adjust middleware accordingly.
const getCarouselItemById = async (req, res) => {
  try {
    const item = await CarouselItem.findByPk(req.params.id);
    if (item) {
      res.json({ success: true, carouselItem: item });
    } else {
      res.status(404).json({ success: false, message: 'Carousel item not found' });
    }
  } catch (error) {
    console.error('Error fetching carousel item by ID:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new carousel item
// @route   POST /api/carousel
// @access  Private/Admin
const createCarouselItem = async (req, res) => {
  try {
    const { image, caption, order, isActive, link, target } = req.body;
    
    // Basic validation
    if (!image) {
        return res.status(400).json({ success: false, message: 'Image URL is required' });
    }

    const newItem = await CarouselItem.create({
      image,
      caption,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      link,
      target
    });
    res.status(201).json({ success: true, carouselItem: newItem });
  } catch (error) {
    console.error('Error creating carousel item:', error);
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors.map(e => e.message) });
    }
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Update an existing carousel item
// @route   PUT /api/carousel/:id
// @access  Private/Admin
const updateCarouselItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { image, caption, order, isActive, link, target } = req.body;

    const item = await CarouselItem.findByPk(id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Carousel item not found' });
    }

    // Basic validation for update
    if (image !== undefined && !image) {
        return res.status(400).json({ success: false, message: 'Image URL cannot be empty' });
    }

    item.image = image !== undefined ? image : item.image;
    item.caption = caption !== undefined ? caption : item.caption;
    item.order = order !== undefined ? order : item.order;
    item.isActive = isActive !== undefined ? isActive : item.isActive;
    item.link = link !== undefined ? link : item.link;
    item.target = target !== undefined ? target : item.target;

    await item.save();
    res.json({ success: true, carouselItem: item });
  } catch (error) {
    console.error('Error updating carousel item:', error);
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors.map(e => e.message) });
    }
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a carousel item
// @route   DELETE /api/carousel/:id
// @access  Private/Admin
const deleteCarouselItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await CarouselItem.findByPk(id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Carousel item not found' });
    }

    await item.destroy();
    res.json({ success: true, message: 'Carousel item deleted successfully' });
  } catch (error) {
    console.error('Error deleting carousel item:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getActiveCarouselItems,
  getAllCarouselItems,
  getCarouselItemById,
  createCarouselItem,
  updateCarouselItem,
  deleteCarouselItem,
}; 