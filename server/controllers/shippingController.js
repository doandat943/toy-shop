const { Order, OrderItem, Product } = require('../models');
const ghnService = require('../services/ghnService');

// @desc    Get list of provinces
// @route   GET /api/shipping/provinces
// @access  Public
const getProvinces = async (req, res) => {
  try {
    const provinces = await ghnService.getProvinces();
    
    res.json({
      success: true,
      data: provinces
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting provinces',
      error: error.message
    });
  }
};

// @desc    Get districts by province
// @route   GET /api/shipping/districts/:provinceId
// @access  Public
const getDistricts = async (req, res) => {
  try {
    const { provinceId } = req.params;
    
    if (!provinceId) {
      return res.status(400).json({
        success: false,
        message: 'Province ID is required'
      });
    }
    
    const districts = await ghnService.getDistricts(parseInt(provinceId));
    
    res.json({
      success: true,
      data: districts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting districts',
      error: error.message
    });
  }
};

// @desc    Get wards by district
// @route   GET /api/shipping/wards/:districtId
// @access  Public
const getWards = async (req, res) => {
  try {
    const { districtId } = req.params;
    
    if (!districtId) {
      return res.status(400).json({
        success: false,
        message: 'District ID is required'
      });
    }
    
    const wards = await ghnService.getWards(parseInt(districtId));
    
    res.json({
      success: true,
      data: wards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting wards',
      error: error.message
    });
  }
};

// @desc    Get available shipping services
// @route   POST /api/shipping/services
// @access  Public
const getShippingServices = async (req, res) => {
  try {
    const { fromDistrictId, toDistrictId } = req.body;

    if (!fromDistrictId || !toDistrictId) {
      return res.status(400).json({
        success: false,
        message: 'From and to district IDs are required'
      });
    }

    const services = await ghnService.getAvailableServices(
      parseInt(fromDistrictId), 
      parseInt(toDistrictId)
    );

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting shipping services',
      error: error.message
    });
  }
};

// @desc    Calculate shipping fee
// @route   POST /api/shipping/calculate
// @access  Public
const calculateShippingFee = async (req, res) => {
  try {
    const {
      serviceId,
      serviceTypeId,
      fromDistrictId,
      fromWardCode,
      toDistrictId,
      toWardCode,
      weight,
      length,
      width,
      height,
      insuranceValue
    } = req.body;

    if (!serviceId || !toDistrictId || !toWardCode) {
      return res.status(400).json({
        success: false,
        message: 'Service ID, to district ID, and to ward code are required'
      });
    }

    const shippingData = {
      serviceId: parseInt(serviceId),
      serviceTypeId: serviceTypeId ? parseInt(serviceTypeId) : undefined,
      fromDistrictId: parseInt(fromDistrictId),
      fromWardCode,
      toDistrictId: parseInt(toDistrictId),
      toWardCode,
      weight: weight ? parseInt(weight) : 500, // Default 500g
      length: length ? parseInt(length) : 10,
      width: width ? parseInt(width) : 10,
      height: height ? parseInt(height) : 10,
      insuranceValue: insuranceValue ? parseInt(insuranceValue) : 0,
    };

    const feeData = await ghnService.calculateShippingFee(shippingData);

    res.json({
      success: true,
      data: feeData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating shipping fee',
      error: error.message
    });
  }
};

// @desc    Create shipping order with GHN
// @route   POST /api/shipping/orders
// @access  Private/Admin
const createShippingOrder = async (req, res) => {
  try {
    const { orderId, serviceId, serviceTypeId, requiredNote } = req.body;

    if (!orderId || !serviceId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and service ID are required'
      });
    }

    // Get order details from database
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'weight', 'length', 'width', 'height']
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Parse shipping address
    const shippingAddress = typeof order.shippingAddress === 'string'
      ? JSON.parse(order.shippingAddress)
      : order.shippingAddress;

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Order has no shipping address'
      });
    }

    // Calculate total weight and dimensions
    let totalWeight = 0;
    let maxLength = 10;
    let maxWidth = 10;
    let maxHeight = 10;

    const items = order.orderItems.map(item => {
      const itemWeight = item.product?.weight || 500;
      totalWeight += itemWeight * item.quantity;
      
      // Track maximum dimensions
      maxLength = Math.max(maxLength, item.product?.length || 10);
      maxWidth = Math.max(maxWidth, item.product?.width || 10);
      maxHeight = Math.max(maxHeight, item.product?.height || 10);

      return {
        name: item.name,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        weight: itemWeight,
        length: item.product?.length || 10,
        width: item.product?.width || 10,
        height: item.product?.height || 10
      };
    });

    // Prepare shipping order data
    const shippingData = {
      orderNumber: order.orderNumber,
      toName: order.customerName || shippingAddress.fullName,
      toPhone: order.customerPhone || shippingAddress.phone,
      toAddress: shippingAddress.address,
      toWardCode: shippingAddress.wardCode,
      toDistrictId: parseInt(shippingAddress.districtId),
      codAmount: order.paymentMethod === 'cod' ? parseInt(order.totalAmount) : 0,
      content: `Đơn hàng ${order.orderNumber}`,
      weight: totalWeight || 500,
      length: maxLength,
      width: maxWidth,
      height: maxHeight,
      insuranceValue: parseInt(order.totalAmount),
      serviceId: parseInt(serviceId),
      serviceTypeId: serviceTypeId ? parseInt(serviceTypeId) : 2,
      requiredNote: requiredNote || 'KHONGCHOXEMHANG',
      items
    };

    // Create shipping order with GHN
    const result = await ghnService.createShippingOrder(shippingData);

    // Update order with shipping information
    await order.update({
      status: 'shipping',
      shippingProvider: 'GHN',
      trackingNumber: result.order_code,
      shippedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Shipping order created successfully',
      data: {
        trackingNumber: result.order_code,
        expectedDelivery: result.expected_delivery_time,
        totalFee: result.total_fee,
        shippingProvider: 'GHN'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating shipping order',
      error: error.message
    });
  }
};

// @desc    Get shipping order details
// @route   GET /api/shipping/orders/:trackingNumber
// @access  Private
const getShippingOrder = async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    if (!trackingNumber) {
      return res.status(400).json({
        success: false,
        message: 'Tracking number is required'
      });
    }

    const orderDetails = await ghnService.getShippingOrderDetail(trackingNumber);

    res.json({
      success: true,
      data: orderDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting shipping order details',
      error: error.message
    });
  }
};

module.exports = {
  getProvinces,
  getDistricts,
  getWards,
  getShippingServices,
  calculateShippingFee,
  createShippingOrder,
  getShippingOrder
}; 