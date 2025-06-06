const axios = require('axios');

// GHN API Constants
const GHN_API = {
  PROD: 'https://online-gateway.ghn.vn/shiip/public-api/v2',
  DEV: 'https://dev-online-gateway.ghn.vn/shiip/public-api/v2',
};

// Check required environment variables
if (!process.env.GHN_TOKEN) {
  console.error('Missing required environment variable: GHN_TOKEN');
}

if (!process.env.GHN_SHOP_ID) {
  console.error('Missing required environment variable: GHN_SHOP_ID');
}

// GHN Configuration
const config = {
  token: process.env.GHN_TOKEN,
  shopId: process.env.GHN_SHOP_ID ? parseInt(process.env.GHN_SHOP_ID) : 0,
  baseURL: process.env.GHN_ENV === 'dev' ? GHN_API.DEV : GHN_API.PROD,
};

// Create GHN API client
const ghnClient = axios.create({
  baseURL: config.baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Token': config.token,
    'ShopId': config.shopId
  }
});

/**
 * Get list of provinces
 * @returns {Promise<Array>} - List of provinces
 */
const getProvinces = async () => {
  try {
    const response = await ghnClient.get('/master-data/province');
    return response.data.data || [];
  } catch (error) {
    console.error('GHN API Error (getProvinces):', error.response?.data || error.message);
    throw new Error('Failed to get provinces');
  }
};

/**
 * Get list of districts by province
 * @param {Number} provinceId - Province ID
 * @returns {Promise<Array>} - List of districts
 */
const getDistricts = async (provinceId) => {
  try {
    const response = await ghnClient.get(`/master-data/district?province_id=${provinceId}`);
    return response.data.data || [];
  } catch (error) {
    console.error('GHN API Error (getDistricts):', error.response?.data || error.message);
    throw new Error('Failed to get districts');
  }
};

/**
 * Get list of wards by district
 * @param {Number} districtId - District ID
 * @returns {Promise<Array>} - List of wards
 */
const getWards = async (districtId) => {
  try {
    const response = await ghnClient.get(`/master-data/ward?district_id=${districtId}`);
    return response.data.data || [];
  } catch (error) {
    console.error('GHN API Error (getWards):', error.response?.data || error.message);
    throw new Error('Failed to get wards');
  }
};

/**
 * Get available shipping services between two districts
 * @param {Number} fromDistrictId - District ID of sender
 * @param {Number} toDistrictId - District ID of receiver
 * @returns {Promise<Array>} - List of available services
 */
const getAvailableServices = async (fromDistrictId, toDistrictId) => {
  try {
    const response = await ghnClient.post('/shipping-order/available-services', {
      shop_id: config.shopId,
      from_district: fromDistrictId,
      to_district: toDistrictId
    });
    
    return response.data.data || [];
  } catch (error) {
    console.error('GHN API Error (getAvailableServices):', error.response?.data || error.message);
    throw new Error('Failed to get available shipping services');
  }
};

/**
 * Calculate shipping fee
 * @param {Object} data - Shipping data
 * @returns {Promise<Object>} - Shipping fee details
 */
const calculateShippingFee = async (data) => {
  try {
    const response = await ghnClient.post('/shipping-order/fee', {
      service_id: data.serviceId,
      service_type_id: data.serviceTypeId || null,
      to_district_id: data.toDistrictId,
      to_ward_code: data.toWardCode,
      from_district_id: data.fromDistrictId,
      from_ward_code: data.fromWardCode,
      height: data.height || 10,
      length: data.length || 10,
      weight: data.weight || 500,
      width: data.width || 10,
      insurance_value: data.insuranceValue || 0,
      coupon: data.coupon || null
    });
    
    return response.data.data || {};
  } catch (error) {
    console.error('GHN API Error (calculateShippingFee):', error.response?.data || error.message);
    throw new Error('Failed to calculate shipping fee');
  }
};

/**
 * Create a shipping order
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} - Shipping order details
 */
const createShippingOrder = async (orderData) => {
  try {
    const payload = {
      payment_type_id: orderData.paymentTypeId || 2, // 1: Shop/Seller, 2: Buyer/Consignee
      note: orderData.note || '',
      required_note: orderData.requiredNote || 'KHONGCHOXEMHANG',
      to_name: orderData.toName,
      to_phone: orderData.toPhone,
      to_address: orderData.toAddress,
      to_ward_code: orderData.toWardCode,
      to_district_id: orderData.toDistrictId,
      cod_amount: orderData.codAmount || 0,
      content: orderData.content || `Đơn hàng ${orderData.orderNumber}`,
      weight: orderData.weight || 500,
      length: orderData.length || 10,
      width: orderData.width || 10,
      height: orderData.height || 10,
      service_id: orderData.serviceId,
      service_type_id: orderData.serviceTypeId || 2,
      payment_type_id: orderData.paymentTypeId || 2,
      insurance_value: orderData.insuranceValue || 0,
      coupon: orderData.coupon || null
    };
    
    // Add items if provided
    if (orderData.items && orderData.items.length > 0) {
      payload.items = orderData.items.map(item => ({
        name: item.name,
        code: item.code || item.productId.toString(),
        quantity: item.quantity,
        price: item.price,
        weight: item.weight || 500,
        length: item.length || 10,
        width: item.width || 10,
        height: item.height || 10
      }));
    }
    
    const response = await ghnClient.post('/shipping-order/create', payload);
    
    return response.data.data || {};
  } catch (error) {
    console.error('GHN API Error (createShippingOrder):', error.response?.data || error.message);
    throw new Error(`Failed to create shipping order: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Get shipping order details
 * @param {String} orderCode - GHN Order Code
 * @returns {Promise<Object>} - Order details
 */
const getShippingOrderDetail = async (orderCode) => {
  try {
    const response = await ghnClient.post('/shipping-order/detail', {
      order_code: orderCode
    });
    
    return response.data.data || {};
  } catch (error) {
    console.error('GHN API Error (getShippingOrderDetail):', error.response?.data || error.message);
    throw new Error('Failed to get shipping order details');
  }
};

module.exports = {
  getProvinces,
  getDistricts,
  getWards,
  getAvailableServices,
  calculateShippingFee,
  createShippingOrder,
  getShippingOrderDetail,
  config
}; 