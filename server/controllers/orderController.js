const { Order, OrderItem, User, Product, sequelize } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'thumbnail', 'price']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'thumbnail', 'price']
            }
          ]
        }
      ]
    });

    // Check if order exists
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is admin or the order belongs to the user
    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      orderItems,
      shippingAddress,
      city,
      district,
      ward,
      phone,
      paymentMethod,
      subtotal,
      shippingPrice,
      discount,
      total,
      vat,
      notes
    } = req.body;

    // Check if order items exist
    if (!orderItems || orderItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'No order items'
      });
    }

    // Create order
    const order = await Order.create({
      userId: req.user.id,
      shippingAddress,
      city,
      district,
      ward,
      phone,
      paymentMethod,
      subtotal,
      shippingPrice,
      discount,
      total,
      vat,
      notes,
      status: 'pending'
    }, { transaction });

    // Create order items
    const createdOrderItems = await Promise.all(
      orderItems.map(async (item) => {
        const product = await Product.findByPk(item.productId);

        if (!product) {
          throw new Error(`Product with id ${item.productId} not found`);
        }

        // Create order item
        const orderItem = await OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: product.onSale ? product.salePrice : product.price,
          personalization: item.personalization || null
        }, { transaction });

        // Update product stock
        product.stock -= item.quantity;
        product.salesCount += item.quantity;
        await product.save({ transaction });

        return orderItem;
      })
    );

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        id: order.id,
        userId: order.userId,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    
    // If order is cancelled, restore product stock
    if (status === 'cancelled' && order.status !== 'cancelled') {
      const orderItems = await OrderItem.findAll({
        where: { orderId: order.id },
        include: [{ model: Product, as: 'product' }]
      });

      // Restore product stock for cancelled orders
      await Promise.all(
        orderItems.map(async (item) => {
          const product = item.product;
          product.stock += item.quantity;
          product.salesCount -= item.quantity;
          await product.save();
        })
      );
    }

    // Set paid date if status is delivered
    if (status === 'delivered' && !order.paidAt) {
      order.paidAt = new Date();
      order.isPaid = true;
    }

    // Set delivered date if status is delivered
    if (status === 'delivered' && !order.deliveredAt) {
      order.deliveredAt = new Date();
      order.isDelivered = true;
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Find order items
    const orderItems = await OrderItem.findAll({
      where: { orderId: order.id },
      include: [{ model: Product, as: 'product' }]
    });

    // Restore product stock
    await Promise.all(
      orderItems.map(async (item) => {
        const product = item.product;
        product.stock += item.quantity;
        product.salesCount -= item.quantity;
        await product.save({ transaction });
      })
    );

    // Delete order items
    await OrderItem.destroy({ where: { orderId: order.id } }, { transaction });

    // Delete order
    await order.destroy({ transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'thumbnail', 'price']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
const getOrderStats = async (req, res) => {
  try {
    // Total sales
    const totalSales = await Order.sum('total', {
      where: { status: { [Op.ne]: 'cancelled' } }
    });

    // Count of orders by status
    const orderCounts = await Order.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Orders this month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const ordersThisMonth = await Order.count({
      where: {
        createdAt: { [Op.gte]: firstDayOfMonth },
        status: { [Op.ne]: 'cancelled' }
      }
    });

    // Sales this month
    const salesThisMonth = await Order.sum('total', {
      where: {
        createdAt: { [Op.gte]: firstDayOfMonth },
        status: { [Op.ne]: 'cancelled' }
      }
    });

    // Recent orders
    const recentOrders = await Order.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        totalSales,
        orderCounts,
        ordersThisMonth,
        salesThisMonth,
        recentOrders
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

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  getMyOrders,
  getOrderStats
}; 