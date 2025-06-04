const { Order, Product, User, Review, Category, sequelize } = require('../models');
const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');

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
    const totalSales = await Order.sum('total_amount', {
      where: {
        status: { [Op.ne]: 'cancelled' },
        created_at: { [Op.between]: [startDate, endDate] }
      }
    }) || 0;

    // Get total orders
    const totalOrders = await Order.count({
      where: {
        created_at: { [Op.between]: [startDate, endDate] }
      }
    });

    // Get new customers
    const newCustomers = await User.count({
      where: {
        role: 'customer',
        created_at: { [Op.between]: [startDate, endDate] }
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
        created_at: { [Op.between]: [startDate, endDate] }
      }
    });

    // Calculate sales growth compared to previous period
    const previousPeriodStart = new Date(startDate);
    const previousPeriodEnd = new Date(endDate);
    const timeDiff = endDate.getTime() - startDate.getTime();
    previousPeriodStart.setTime(previousPeriodStart.getTime() - timeDiff);
    previousPeriodEnd.setTime(previousPeriodEnd.getTime() - timeDiff);

    const previousPeriodSales = await Order.sum('total_amount', {
      where: {
        status: { [Op.ne]: 'cancelled' },
        created_at: { [Op.between]: [previousPeriodStart, previousPeriodEnd] }
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
    console.error('Error in getSummaryStats:', error);
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
        timeGroup = Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%m-%d %H:00');
        dateFormat = 'YYYY-MM-DD HH:00';
        break;
      case 'day':
        timeGroup = Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%m-%d');
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'week':
        timeGroup = Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%u');
        dateFormat = 'YYYY-[Week]WW';
        break;
      case 'month':
        timeGroup = Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%m');
        dateFormat = 'YYYY-MM';
        break;
      default:
        timeGroup = Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%m-%d');
        dateFormat = 'YYYY-MM-DD';
    }

    // Get sales data grouped by time
    const salesData = await Order.findAll({
      attributes: [
        [timeGroup, 'date'],
        [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'sales'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'orders']
      ],
      where: {
        status: { [Op.ne]: 'cancelled' },
        created_at: { [Op.between]: [startDate, endDate] }
      },
      group: ['date'],
      order: [['date', 'ASC']]
    });

    // Get payment method breakdown
    const paymentMethods = await Order.findAll({
      attributes: [
        'payment_method',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'total']
      ],
      where: {
        status: { [Op.ne]: 'cancelled' },
        created_at: { [Op.between]: [startDate, endDate] }
      },
      group: ['payment_method']
    });

    // Get order status breakdown
    const orderStatus = await Order.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: {
        created_at: { [Op.between]: [startDate, endDate] }
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
        'created_at'
      ],
      order: [['created_at', 'DESC']],
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
        created_at: { [Op.between]: [startDate, endDate] }
      }
    });

    // Get total customers
    const totalCustomers = await User.count({
      where: {
        role: 'customer'
      }
    });

    // Get top customers by order value using raw query
    const topCustomers = await sequelize.query(`
      SELECT 
        u.id,
        u.name,
        u.email, 
        u.phone,
        COUNT(o.id) as orderCount,
        SUM(o.total_amount) as totalSpent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'cancelled'
      WHERE u.role = 'customer'
      GROUP BY u.id, u.name, u.email, u.phone
      ORDER BY totalSpent DESC
      LIMIT 10
    `, {
      type: Sequelize.QueryTypes.SELECT
    });

    // Get customer registration trends
    const registrationTrends = await sequelize.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(id) as count
      FROM users
      WHERE 
        role = 'customer' AND
        created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
      GROUP BY month
      ORDER BY month ASC
    `, {
      type: Sequelize.QueryTypes.SELECT
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
    console.error("Error in getCustomerStats:", error);
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
    // Get overall inventory stats using raw queries
    const [totalProductsResult] = await sequelize.query(
      `SELECT COUNT(*) AS total FROM products`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const totalProducts = totalProductsResult.total;
    
    const [outOfStockResult] = await sequelize.query(
      `SELECT COUNT(*) AS total FROM products WHERE stock = 0`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const outOfStock = outOfStockResult.total;
    
    const [lowStockResult] = await sequelize.query(
      `SELECT COUNT(*) AS total FROM products WHERE stock > 0 AND stock < 10`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const lowStock = lowStockResult.total;
    
    const inStock = totalProducts - outOfStock;
    
    // Get inventory value
    const [inventoryValueResult] = await sequelize.query(
      `SELECT SUM(price * stock) AS value FROM products`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const inventoryValue = inventoryValueResult.value || 0;

    // Get inventory by category
    const inventoryByCategory = await sequelize.query(`
      SELECT 
        c.id, 
        c.name, 
        COUNT(p.id) as productCount, 
        SUM(p.stock) as totalStock,
        SUM(p.price * p.stock) as value
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY productCount DESC
    `, {
      type: Sequelize.QueryTypes.SELECT
    });

    // Get products that need reordering
    const reorderNeeded = await sequelize.query(`
      SELECT
        id,
        name,
        thumbnail,
        stock,
        price,
        sales_count as salesCount
      FROM products
      WHERE stock < 10 AND is_active = true
      ORDER BY stock ASC
      LIMIT 20
    `, {
      type: Sequelize.QueryTypes.SELECT
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
    console.error("Error in getInventoryStats:", error);
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
      order: [['created_at', 'DESC']],
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
      order: [['created_at', 'DESC']],
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