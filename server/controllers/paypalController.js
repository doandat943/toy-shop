const axios = require('axios');
const Order = require('../models/Order');

// @desc    Create PayPal order
// @route   POST /api/payment/paypal/order
// @access  Private
exports.createPaypalOrder = async (req, res) => {
  const { orderId } = req.body;

  try {
    const order = await Order.findByPk(orderId);

    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not belonging to user'
      });
    }

    const paypalApiBaseUrl = process.env.PAYPAL_API_BASE_URL;
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_SECRET;

    // Get access token
    const { data: tokenRes } = await axios({
      url: `${paypalApiBaseUrl}/v1/oauth2/token`,
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      auth: { username: clientId, password: clientSecret },
      data: 'grant_type=client_credentials',
    });

    // Create PayPal order
    // Chuyển đổi số tiền sang USD. Cần đảm bảo đơn vị tiền tệ của bạn và PayPal khớp.
    // Ví dụ: 1 USD = 25000 VND (cần thay thế bằng tỷ giá thực tế hoặc cấu hình)
    const amountInUSD = (order.totalAmount / 25000).toFixed(2);

    const { data: orderRes } = await axios({
      url: `${paypalApiBaseUrl}/v2/checkout/orders`,
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenRes.access_token}`,
      },
      data: {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD', // Đơn vị tiền tệ của PayPal
            value: amountInUSD,
          },
          custom_id: order.id, // Lưu order ID của mình vào custom_id
        }],
        application_context: {
          shipping_preference: 'NO_SHIPPING', // Không cần địa chỉ ship từ PayPal nếu đã có trong hệ thống
          user_action: 'PAY_NOW',
          return_url: process.env.PAYPAL_RETURN_URL || 'http://localhost:3000/checkout?payment=success', // Redirect sau khi thanh toán
          cancel_url: process.env.PAYPAL_CANCEL_URL || 'http://localhost:3000/checkout?payment=cancelled', // Redirect khi hủy
        }
      },
    });

    res.json({ success: true, orderID: orderRes.id }); // Trả về PayPal Order ID cho frontend

  } catch (error) {
    console.error('Error creating PayPal order:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create PayPal order',
      error: error.response?.data || error.message
    });
  }
};

// @desc    Capture PayPal payment
// @route   POST /api/payment/paypal/capture
// @access  Private
exports.capturePaypalPayment = async (req, res) => {
  const { orderID, ourOrderId } = req.body; // orderID là của PayPal, ourOrderId là của mình

  try {
    const paypalApiBaseUrl = process.env.PAYPAL_API_BASE_URL;
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_SECRET;

    // Get access token
    const { data: tokenRes } = await axios({
      url: `${paypalApiBaseUrl}/v1/oauth2/token`,
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      auth: { username: clientId, password: clientSecret },
      data: 'grant_type=client_credentials',
    });

    // Capture payment
    const { data: captureRes } = await axios({
      url: `${paypalApiBaseUrl}/v2/checkout/orders/${orderID}/capture`,
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenRes.access_token}`,
      },
    });

    // Update our order status
    if (captureRes.status === 'COMPLETED') {
      const order = await Order.findByPk(ourOrderId);

      if (order) {
        order.paymentStatus = 'paid';
        // Lưu thông tin thanh toán chi tiết từ PayPal response
        order.paymentDetails = captureRes;
        order.paidAt = new Date(); // Cập nhật thời gian thanh toán
        await order.save();

        res.json({ success: true, message: 'Payment captured successfully', captureData: captureRes });
      } else {
         res.status(404).json({ success: false, message: 'Our order not found' });
      }
    } else {
       // Xử lý các trạng thái khác nếu cần thiết
       res.status(400).json({ success: false, message: 'PayPal payment not completed', captureData: captureRes });
    }

  } catch (error) {
    console.error('Error capturing PayPal payment:', error.response?.data || error.message);
     res.status(500).json({
      success: false,
      message: 'Failed to capture PayPal payment',
      error: error.response?.data || error.message
    });
  }
}; 