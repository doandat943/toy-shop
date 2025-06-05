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
      orders: orders
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
      paymentMethod,
      itemsPrice,
      shippingPrice,
      discount,
      totalPrice,
      promoCode,
      requestVAT,
      vatInfo
    } = req.body;

    // Check if order items exist
    if (!orderItems || orderItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'No order items'
      });
    }

    // Ensure totalAmount is properly calculated and stored
    const calculatedTotalAmount = parseFloat(itemsPrice || 0) + 
                               parseFloat(shippingPrice || 0) - 
                               parseFloat(discount || 0);
    
    // Use the calculated total or the passed totalPrice
    const finalTotalAmount = totalPrice || calculatedTotalAmount;

    // Create order
    const order = await Order.create({
      userId: req.user.id,
      shippingAddress: JSON.stringify(shippingAddress),
      city: shippingAddress.city,
      district: shippingAddress.district,
      ward: shippingAddress.ward,
      customerName: shippingAddress.fullName,
      customerEmail: req.user.email,
      customerPhone: shippingAddress.phone,
      paymentMethod,
      subTotal: itemsPrice,
      shippingCost: shippingPrice,
      discount: discount || 0,
      totalAmount: finalTotalAmount,
      notes: shippingAddress.note || '',
      status: 'pending',
      vatInvoice: requestVAT || false,
      vatInvoiceInfo: requestVAT && vatInfo ? JSON.stringify(vatInfo) : null
    }, { transaction });

    // Create order items
    const createdOrderItems = await Promise.all(
      orderItems.map(async (item) => {
        const itemPrice = parseFloat(item.price);
        const itemQty = parseInt(item.qty);
        const itemTotal = itemPrice * itemQty;
        
        // Create order item
        const orderItem = await OrderItem.create({
          orderId: order.id,
          productId: item.product,
          name: item.name,
          price: itemPrice,
          quantity: itemQty,
          totalPrice: itemTotal,
          image: item.image
        }, { transaction });

        // Update product stock
        const product = await Product.findByPk(item.product);
        if (product) {
          product.stock -= item.qty;
          product.salesCount = (product.salesCount || 0) + item.qty;
          await product.save({ transaction });
        }

        return orderItem;
      })
    );

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.totalAmount,
        paymentMethod: order.paymentMethod,
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
    console.log('getMyOrders called by user:', req.user.id);
    
    // Kiểm tra user
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated properly'
      });
    }

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

    // Debug thông tin orders
    console.log('Orders found:', orders ? orders.length : 'none');
    console.log('Orders response type:', typeof orders);
    console.log('Is Array:', Array.isArray(orders));
    
    // Mock data nếu cần thiết cho development
    const mockOrders = [
      {
        id: 1,
        orderNumber: 'ORD-001',
        status: 'delivered',
        totalAmount: 1500000,
        isPaid: true,
        paymentMethod: 'COD',
        createdAt: new Date()
      },
      {
        id: 2,
        orderNumber: 'ORD-002',
        status: 'processing', 
        totalAmount: 850000,
        isPaid: false,
        paymentMethod: 'Banking',
        createdAt: new Date(Date.now() - 86400000)
      }
    ];

    // Trả về orders thật hoặc mock data nếu không có orders
    const responseData = (orders && orders.length > 0) ? orders : [];
    
    res.json({
      success: true,
      count: responseData.length,
      data: responseData
    });
  } catch (error) {
    console.error('Error in getMyOrders:', error);
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
    const totalSales = await Order.sum('totalAmount', {
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
    const salesThisMonth = await Order.sum('totalAmount', {
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