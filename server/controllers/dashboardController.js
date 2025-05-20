const { Order, Product, User, Review, Category, sequelize } = require('../models');
const { Op } = require('sequelize');

// Helper to get date range
const getDateRange = (period) => {
  const now = new Date();
  let startDate = new Date();
  
  switch (period) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'yesterday':
      startDate.setDate(now.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      now.setDate(now.getDate() - 1);
      now.setHours(23, 59, 59, 999);
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default: // Default to 30 days
      startDate.setDate(now.getDate() - 30);
  }
  
  return { startDate, endDate: now };
};

// @desc    Get summary dashboard stats
// @route   GET /api/dashboard/summary
// @access  Private/Admin
const getSummaryStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const { startDate, endDate } = getDateRange(period);

    // Get total sales
    const totalSales = await Order.sum('total', {
      where: {
        status: { [Op.ne]: 'cancelled' },
        createdAt: { [Op.between]: [startDate, endDate] }
      }
    }) || 0;

    // Get total orders
    const totalOrders = await Order.count({
      where: {
        createdAt: { [Op.between]: [startDate, endDate] }
      }
    });

    // Get new customers
    const newCustomers = await User.count({
      where: {
        role: 'customer',
        createdAt: { [Op.between]: [startDate, endDate] }
      }
    });

    // Get total products
    const totalProducts = await Product.count();

    // Get low stock products
    const lowStockProducts = await Product.count({
      where: {
        stock: { [Op.lt]: 10 },
        isActive: true
      }
    });

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? (totalSales / totalOrders) : 0;

    // Get total reviews
    const totalReviews = await Review.count({
      where: {
        createdAt: { [Op.between]: [startDate, endDate] }
      }
    });

    // Calculate sales growth compared to previous period
    const previousPeriodStart = new Date(startDate);
    const previousPeriodEnd = new Date(endDate);
    const timeDiff = endDate.getTime() - startDate.getTime();
    previousPeriodStart.setTime(previousPeriodStart.getTime() - timeDiff);
    previousPeriodEnd.setTime(previousPeriodEnd.getTime() - timeDiff);

    const previousPeriodSales = await Order.sum('total', {
      where: {
        status: { [Op.ne]: 'cancelled' },
        createdAt: { [Op.between]: [previousPeriodStart, previousPeriodEnd] }
      }
    }) || 0;

    const salesGrowth = previousPeriodSales > 0 
      ? ((totalSales - previousPeriodSales) / previousPeriodSales) * 100 
      : 100;

    res.json({
      success: true,
      data: {
        totalSales,
        totalOrders,
        newCustomers,
        totalProducts,
        lowStockProducts,
        averageOrderValue,
        totalReviews,
        salesGrowth,
        period
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get sales report
// @route   GET /api/dashboard/sales
// @access  Private/Admin
const getSalesReport = async (req, res) => {
  try {
    const { period = 'month', groupBy = 'day' } = req.query;
    const { startDate, endDate } = getDateRange(period);

    let timeGroup;
    let dateFormat;

    // Determine grouping format
    switch (groupBy) {
      case 'hour':
        timeGroup = sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m-%d %H:00');
        dateFormat = 'YYYY-MM-DD HH:00';
        break;
      case 'day':
        timeGroup = sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m-%d');
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'week':
        timeGroup = sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%u');
        dateFormat = 'YYYY-[Week]WW';
        break;
      case 'month':
        timeGroup = sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m');
        dateFormat = 'YYYY-MM';
        break;
      default:
        timeGroup = sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m-%d');
        dateFormat = 'YYYY-MM-DD';
    }

    // Get sales data grouped by time
    const salesData = await Order.findAll({
      attributes: [
        [timeGroup, 'date'],
        [sequelize.fn('SUM', sequelize.col('total')), 'sales'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orders']
      ],
      where: {
        status: { [Op.ne]: 'cancelled' },
        createdAt: { [Op.between]: [startDate, endDate] }
      },
      group: ['date'],
      order: [['date', 'ASC']]
    });

    // Get payment method breakdown
    const paymentMethods = await Order.findAll({
      attributes: [
        'paymentMethod',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total')), 'total']
      ],
      where: {
        status: { [Op.ne]: 'cancelled' },
        createdAt: { [Op.between]: [startDate, endDate] }
      },
      group: ['paymentMethod']
    });

    // Get order status breakdown
    const orderStatus = await Order.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: { [Op.between]: [startDate, endDate] }
      },
      group: ['status']
    });

    res.json({
      success: true,
      data: {
        salesData,
        paymentMethods,
        orderStatus,
        period,
        groupBy,
        dateFormat
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get top selling products
// @route   GET /api/dashboard/top-products
// @access  Private/Admin
const getTopProducts = async (req, res) => {
  try {
    const { limit = 10, period = 'month' } = req.query;
    const { startDate, endDate } = getDateRange(period);

    // Get top selling products by quantity
    const topSellingProducts = await Product.findAll({
      attributes: [
        'id',
        'name',
        'thumbnail',
        'price',
        'stock',
        'salesCount',
        'rating',
        'numReviews'
      ],
      order: [['salesCount', 'DESC']],
      limit: parseInt(limit)
    });

    // Get top rated products
    const topRatedProducts = await Product.findAll({
      attributes: [
        'id',
        'name',
        'thumbnail',
        'price',
        'stock',
        'salesCount',
        'rating',
        'numReviews'
      ],
      where: {
        numReviews: { [Op.gt]: 0 }
      },
      order: [['rating', 'DESC']],
      limit: parseInt(limit)
    });

    // Get recently added products
    const newProducts = await Product.findAll({
      attributes: [
        'id',
        'name',
        'thumbnail',
        'price',
        'stock',
        'salesCount',
        'rating',
        'numReviews',
        'createdAt'
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    // Get low stock products
    const lowStockProducts = await Product.findAll({
      attributes: [
        'id',
        'name',
        'thumbnail',
        'price',
        'stock',
        'salesCount',
        'rating',
        'numReviews'
      ],
      where: {
        stock: { [Op.lt]: 10 },
        isActive: true
      },
      order: [['stock', 'ASC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        topSellingProducts,
        topRatedProducts,
        newProducts,
        lowStockProducts,
        period
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get customer statistics
// @route   GET /api/dashboard/customers
// @access  Private/Admin
const getCustomerStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const { startDate, endDate } = getDateRange(period);

    // Get new customers in the period
    const newCustomers = await User.count({
      where: {
        role: 'customer',
        createdAt: { [Op.between]: [startDate, endDate] }
      }
    });

    // Get total customers
    const totalCustomers = await User.count({
      where: {
        role: 'customer'
      }
    });

    // Get top customers by order value
    const topCustomers = await User.findAll({
      attributes: [
        'id',
        'name',
        'email',
        'phone',
        [sequelize.fn('COUNT', sequelize.col('Orders.id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('Orders.total')), 'totalSpent']
      ],
      include: [
        {
          model: Order,
          as: 'Orders',
          attributes: [],
          where: {
            status: { [Op.ne]: 'cancelled' }
          }
        }
      ],
      where: {
        role: 'customer'
      },
      group: ['User.id'],
      order: [[sequelize.literal('totalSpent'), 'DESC']],
      limit: 10
    });

    // Get customer registration trends
    const registrationTrends = await User.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        role: 'customer',
        createdAt: { [Op.gte]: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) }
      },
      group: ['month'],
      order: [['month', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        newCustomers,
        totalCustomers,
        topCustomers,
        registrationTrends,
        period
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get inventory statistics
// @route   GET /api/dashboard/inventory
// @access  Private/Admin
const getInventoryStats = async (req, res) => {
  try {
    // Get overall inventory stats
    const totalProducts = await Product.count();
    const outOfStock = await Product.count({ where: { stock: 0 } });
    const lowStock = await Product.count({ where: { stock: { [Op.gt]: 0, [Op.lt]: 10 } } });
    const inStock = totalProducts - outOfStock;
    
    // Get inventory value
    const inventoryValue = await Product.sum(
      sequelize.literal('price * stock')
    );

    // Get inventory by category
    const inventoryByCategory = await Category.findAll({
      attributes: [
        'id',
        'name',
        [sequelize.fn('COUNT', sequelize.col('Products.id')), 'productCount'],
        [sequelize.fn('SUM', sequelize.col('Products.stock')), 'totalStock'],
        [sequelize.literal('SUM(Products.price * Products.stock)'), 'value']
      ],
      include: [
        {
          model: Product,
          as: 'products',
          attributes: []
        }
      ],
      group: ['Category.id'],
      order: [[sequelize.literal('productCount'), 'DESC']]
    });

    // Get products that need reordering
    const reorderNeeded = await Product.findAll({
      attributes: [
        'id',
        'name',
        'thumbnail',
        'stock',
        'price',
        'salesCount'
      ],
      where: {
        stock: { [Op.lt]: 10 },
        isActive: true
      },
      order: [['stock', 'ASC']],
      limit: 20
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalProducts,
          inStock,
          outOfStock,
          lowStock,
          inventoryValue
        },
        inventoryByCategory,
        reorderNeeded
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get recent orders
// @route   GET /api/dashboard/recent-orders
// @access  Private/Admin
const getRecentOrders = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentOrders = await Order.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: recentOrders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get recent reviews
// @route   GET /api/dashboard/recent-reviews
// @access  Private/Admin
const getRecentReviews = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentReviews = await Review.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'thumbnail']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: recentReviews
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
  getSummaryStats,
  getSalesReport,
  getTopProducts,
  getCustomerStats,
  getInventoryStats,
  getRecentOrders,
  getRecentReviews
}; 