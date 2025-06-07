const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const { Order, OrderItem } = require('../models');
const crypto = require('crypto');
const https = require('https');
const url = require('url');

// MoMo API Constants
const MOMO_API = {
  PROD: 'https://business.momo.vn/api',
  DEV: 'https://test-business.momo.vn/v2/gateway',
  CREATE_PATH: '/v2/gateway/api/create'
};

// Kiểm tra biến môi trường bắt buộc
if (!process.env.MOMO_PARTNER_CODE) {
  console.error('Missing required environment variable: MOMO_PARTNER_CODE');
}

if (!process.env.MOMO_ACCESS_KEY) {
  console.error('Missing required environment variable: MOMO_ACCESS_KEY');
}

if (!process.env.MOMO_SECRET_KEY) {
  console.error('Missing required environment variable: MOMO_SECRET_KEY');
}

// MoMo payment configuration
const momoConfig = {
  partnerCode: process.env.MOMO_PARTNER_CODE,
  accessKey: process.env.MOMO_ACCESS_KEY,
  secretKey: process.env.MOMO_SECRET_KEY,
  baseURL: process.env.MOMO_ENV === 'prod' ? MOMO_API.PROD : MOMO_API.DEV,
  redirectUrl: process.env.MOMO_REDIRECT_URL || "http://localhost:3000/order/status",
  ipnUrl: process.env.MOMO_IPN_URL || "http://localhost:5000/api/payment/momo-ipn",
  requestType: "captureWallet"
};

// Lấy hostname từ baseURL để sử dụng trong HTTP request
const getMomoHostname = () => {
  try {
    const parsedUrl = new URL(momoConfig.baseURL);
    return parsedUrl.hostname;
  } catch (error) {
    console.error('Error parsing MoMo baseURL:', error);
    return 'test-payment.momo.vn'; // Fallback to test environment
  }
};

// @desc    Create payment intent for Stripe
// @route   POST /api/payment/create-payment-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
  try {
    const { orderId, total, paymentMethod } = req.body;

    // Only create intent for stripe payment method
    if (paymentMethod !== 'stripe') {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method for creating payment intent'
      });
    }

    // Verify order exists and belongs to user
    const order = await Order.findOne({
      where: {
        id: orderId,
        userId: req.user.id
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not belonging to user'
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Convert to cents
      currency: 'vnd',
      metadata: {
        orderId: order.id.toString(),
        userId: req.user.id.toString()
      }
    });

    // Update order with payment intent ID
    order.paymentIntentId = paymentIntent.id;
    await order.save();

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent',
      error: error.message
    });
  }
};

// @desc    Get available payment methods
// @route   GET /api/payment/methods
// @access  Public
const getPaymentMethods = async (req, res) => {
  try {
    // Define available payment methods
    const paymentMethods = [
      {
        id: 'cod',
        name: 'Thanh toán khi nhận hàng (COD)',
        description: 'Thanh toán bằng tiền mặt khi nhận hàng',
        enabled: true
      },
      {
        id: 'bank_transfer',
        name: 'Chuyển khoản ngân hàng',
        description: 'Chuyển khoản qua tài khoản ngân hàng',
        bankInfo: {
          bankName: 'Vietcombank',
          accountNumber: '1234567890',
          accountName: 'CÔNG TY BABYBON',
          branch: 'Hồ Chí Minh'
        },
        enabled: true
      },
      {
        id: 'momo',
        name: 'Ví MoMo',
        description: 'Thanh toán qua ví điện tử MoMo',
        qrCode: '/uploads/momo-qr-code.png',
        instructions: 'Quét mã QR với ứng dụng MoMo và chuyển đúng số tiền trong đơn hàng. Ghi chú mã đơn hàng khi thanh toán.',
        enabled: true
      },
      {
        id: 'zalopay',
        name: 'ZaloPay',
        description: 'Thanh toán qua ví ZaloPay',
        qrCode: '/uploads/zalopay-qr-code.png',
        instructions: 'Quét mã QR với ứng dụng ZaloPay và chuyển đúng số tiền trong đơn hàng. Ghi chú mã đơn hàng khi thanh toán.',
        enabled: true
      },
      {
        id: 'stripe',
        name: 'Thẻ tín dụng/ghi nợ quốc tế',
        description: 'Thanh toán bằng thẻ Visa, Mastercard, JCB...',
        enabled: process.env.STRIPE_SECRET_KEY ? true : false
      }
    ];

    res.json({
      success: true,
      data: paymentMethods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Handle Stripe webhook events
// @route   POST /api/payment/webhook
// @access  Public
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handleSuccessfulPayment(paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handleFailedPayment(failedPayment);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
};

// Helper function to handle successful payment
const handleSuccessfulPayment = async (paymentIntent) => {
  try {
    const { orderId } = paymentIntent.metadata;
    
    if (orderId) {
      const order = await Order.findByPk(orderId);
      
      if (order) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult = {
          id: paymentIntent.id,
          status: paymentIntent.status,
          update_time: new Date(),
          payment_method: 'stripe'
        };
        
        await order.save();
      }
    }
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
};

// Helper function to handle failed payment
const handleFailedPayment = async (paymentIntent) => {
  try {
    const { orderId } = paymentIntent.metadata;
    
    if (orderId) {
      const order = await Order.findByPk(orderId);
      
      if (order) {
        order.paymentResult = {
          id: paymentIntent.id,
          status: 'failed',
          update_time: new Date(),
          payment_method: 'stripe',
          error_message: paymentIntent.last_payment_error?.message || 'Payment failed'
        };
        
        await order.save();
      }
    }
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
};

// @desc    Get payment status for an order
// @route   GET /api/payment/status/:orderId
// @access  Private
const getPaymentStatus = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        id: req.params.orderId,
        userId: req.user.id
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not belonging to user'
      });
    }

    // If payment was made via Stripe and we have paymentIntentId
    if (order.paymentMethod === 'stripe' && order.paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(order.paymentIntentId);
      
      return res.json({
        success: true,
        data: {
          orderId: order.id,
          paymentMethod: order.paymentMethod,
          isPaid: order.isPaid,
          paidAt: order.paidAt,
          stripeStatus: paymentIntent.status
        }
      });
    }

    // For other payment methods
    res.json({
      success: true,
      data: {
        orderId: order.id,
        paymentMethod: order.paymentMethod,
        isPaid: order.isPaid,
        paidAt: order.paidAt
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

// Helper function to handle special characters in MoMo signature generation
const sanitizeMomoParam = (value) => {
  if (typeof value !== 'string') return value;
  
  // Replace Vietnamese accented characters with non-accented equivalents if needed
  return value
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, 'A')
    .replace(/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, 'E')
    .replace(/[ÌÍỊỈĨ]/g, 'I')
    .replace(/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, 'O')
    .replace(/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, 'U')
    .replace(/[ỲÝỴỶỸ]/g, 'Y')
    .replace(/Đ/g, 'D');
};

// @desc    Create MoMo payment
// @route   POST /api/payment/create-momo-payment
// @access  Private
const createMomoPayment = async (req, res) => {
  try {
    const { orderId, amount, orderInfo } = req.body;
    
    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and amount are required'
      });
    }

    // Find order and verify it belongs to user
    const order = await Order.findOne({
      where: {
        id: orderId,
        userId: req.user.id
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not belonging to user'
      });
    }

    // Prepare data for MoMo API
    const requestId = momoConfig.partnerCode + new Date().getTime();
    const momoOrderId = `${orderId}_${Date.now()}`; // Ensure unique orderId
    const orderDescription = sanitizeMomoParam(orderInfo || `Thanh toan don hang #${orderId}`);
    const extraData = '';
    const redirectUrl = `http://localhost:3000/order/${orderId}`;

    // IMPORTANT: When generating signature for MoMo, do NOT encode values
    // Create signature with raw values as MoMo requires
    const rawSignature = 
      "accessKey=" + momoConfig.accessKey + 
      "&amount=" + amount + 
      "&extraData=" + extraData + 
      "&ipnUrl=" + momoConfig.ipnUrl + 
      "&orderId=" + momoOrderId + 
      "&orderInfo=" + orderDescription + 
      "&partnerCode=" + momoConfig.partnerCode + 
      "&redirectUrl=" + redirectUrl + 
      "&requestId=" + requestId + 
      "&requestType=" + momoConfig.requestType;

    console.log('Raw signature string:', rawSignature);
    
    const signature = crypto.createHmac('sha256', momoConfig.secretKey)
      .update(rawSignature)
      .digest('hex');
    
    console.log('Generated signature:', signature);

    // Create request body for MoMo API
    const requestBody = JSON.stringify({
      partnerCode: momoConfig.partnerCode,
      accessKey: momoConfig.accessKey,
      requestId: requestId,
      amount: amount.toString(),
      orderId: momoOrderId,
      orderInfo: orderDescription,
      redirectUrl: redirectUrl,
      ipnUrl: momoConfig.ipnUrl,
      extraData: extraData,
      requestType: momoConfig.requestType,
      signature: signature,
      lang: 'vi'
    });

    // Save MoMo payment information to order
    order.paymentMethod = 'momo';
    order.momoPaymentInfo = {
      requestId,
      momoOrderId,
      amount,
      createdAt: new Date()
    };
    await order.save();

    // Sử dụng môi trường phù hợp cho MoMo
    const apiBaseUrl = process.env.MOMO_ENV === 'prod' ? MOMO_API.PROD : MOMO_API.DEV;
    const apiPath = '/v2/gateway/api/create';
    
    // Make request to MoMo API
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'test-payment.momo.vn',
        port: 443,
        path: apiPath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody)
        }
      };

      console.log('Making request to MoMo API:', {
        url: `https://${options.hostname}${options.path}`,
        body: JSON.parse(requestBody)
      });

      const req = https.request(options, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          try {
            // Check if response is HTML (likely an error page)
            if (data.includes('<!DOCTYPE html>') || data.includes('<html>')) {
              console.error('Received HTML response from MoMo instead of JSON:', data);
              
              // Thông báo lỗi chi tiết hơn
              let errorMessage = 'MoMo API returned HTML instead of JSON. ';
              if (data.includes('403 Forbidden')) {
                errorMessage += 'Access forbidden - check if your API credentials are correct and whitelisted.';
              } else if (data.includes('404 Not Found')) {
                errorMessage += 'API endpoint not found - check the API URL path.';
              } else {
                errorMessage += 'Check API credentials and endpoint configuration.';
              }
              
              res.status(400).json({
                success: false,
                message: errorMessage,
                rawData: data
              });
              return resolve();
            }
            
            // Temporarily disable mock payment flow for testing real MoMo flow
            // if (process.env.NODE_ENV === 'development' && process.env.MOMO_ENV === 'dev') {
            //   console.log('Development mode: Using mock payment flow');
            //   
            //   // Tạo URL giả để thử nghiệm
            //   const mockPayUrl = `http://localhost:3000/checkout/payment-result?orderId=${orderId}&momoOrderId=${momoOrderId}&resultCode=0`;
            //   
            //   res.json({
            //     success: true,
            //     data: {
            //       payUrl: mockPayUrl,
            //       orderId: orderId,
            //       momoOrderId: momoOrderId,
            //       requestId: requestId,
            //       message: 'NOTE: Running in development mode with mock payment'
            //     }
            //   });
            //   
            //   return resolve();
            // }
            
            // Mô trường production hoặc staging thực tế
            const result = JSON.parse(data);
            console.log('MoMo API response:', result);
            
            if (result.resultCode === 0) {
              res.json({
                success: true,
                data: {
                  payUrl: result.payUrl,
                  orderId: orderId,
                  momoOrderId: momoOrderId,
                  requestId: requestId
                }
              });
            } else {
              console.error('MoMo payment creation failed:', result);
              res.status(400).json({
                success: false,
                message: result.message || 'Failed to create MoMo payment',
                resultCode: result.resultCode
              });
            }
            
            resolve();
          } catch (error) {
            console.error('Error parsing MoMo response:', error, 'Raw data:', data);
            res.status(500).json({
              success: false,
              message: 'Error processing MoMo payment response',
              error: error.message,
              rawData: data
            });
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        console.error('Error in MoMo payment request:', error);
        res.status(500).json({
          success: false,
          message: 'Error in MoMo payment request',
          error: error.message
        });
        reject(error);
      });

      req.write(requestBody);
      req.end();
    });
  } catch (error) {
    console.error('Error creating MoMo payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating MoMo payment',
      error: error.message
    });
  }
};

// @desc    Handle MoMo IPN (Instant Payment Notification)
// @route   POST /api/payment/momo-ipn
// @access  Public
const handleMomoIPN = async (req, res) => {
  try {
    const { 
      partnerCode, orderId, requestId, amount, orderInfo, 
      orderType, transId, resultCode, message, 
      payType, responseTime, extraData, signature 
    } = req.body;

    console.log('MoMo IPN received:', JSON.stringify(req.body));

    // Verify signature
    const sanitizedMessage = sanitizeMomoParam(message);
    const sanitizedOrderInfo = sanitizeMomoParam(orderInfo);
    
    const rawSignature = 
      "accessKey=" + momoConfig.accessKey + 
      "&amount=" + amount + 
      "&extraData=" + extraData + 
      "&message=" + sanitizedMessage + 
      "&orderId=" + orderId + 
      "&orderInfo=" + sanitizedOrderInfo + 
      "&orderType=" + orderType + 
      "&partnerCode=" + partnerCode + 
      "&payType=" + payType + 
      "&requestId=" + requestId + 
      "&responseTime=" + responseTime + 
      "&resultCode=" + resultCode + 
      "&transId=" + transId;
    
    console.log('IPN raw signature string:', rawSignature);

    const calculatedSignature = crypto.createHmac('sha256', momoConfig.secretKey)
      .update(rawSignature)
      .digest('hex');
      
    if (calculatedSignature !== signature) {
      console.error('MoMo IPN signature mismatch');
      return res.status(400).json({ message: 'Invalid signature' });
    }

    // Extract real order ID from MoMo order ID (format: orderId_timestamp)
    const [realOrderId] = orderId.split('_');
    
    // Find the order
    const order = await Order.findByPk(realOrderId);
    if (!order) {
      console.error(`Order not found for MoMo payment: ${realOrderId}`);
      return res.status(400).json({ message: 'Order not found' });
    }

    // Update order payment status based on MoMo result
    if (resultCode === '0') {
      // Payment successful
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: transId,
        status: 'success',
        update_time: responseTime,
        payment_method: 'momo',
        transaction_id: transId
      };
    } else {
      // Payment failed or other status
      order.paymentResult = {
        id: requestId,
        status: 'failed',
        update_time: responseTime,
        payment_method: 'momo',
        error_message: message || 'Payment failed'
      };
    }

    // Add MoMo transaction details to the order
    order.momoTransactionInfo = {
      transId,
      resultCode,
      message,
      payType,
      responseTime
    };

    await order.save();

    // MoMo expects a 200 response with specific format
    res.status(200).json({
      status: 0,
      message: 'success',
      data: {
        partnerCode,
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        payType,
        responseTime,
        extraData
      }
    });
  } catch (error) {
    console.error('Error handling MoMo IPN:', error);
    res.status(500).json({
      status: 1,
      message: 'Server error processing MoMo IPN',
      error: error.message
    });
  }
};

// @desc    Verify MoMo payment status
// @route   GET /api/payment/verify-momo/:orderId
// @access  Private
const verifyMomoPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Find order and verify it belongs to user
    const order = await Order.findOne({
      where: {
        id: orderId,
        userId: req.user.id
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not belonging to user'
      });
    }

    // If order is already marked as paid, return success
    if (order.isPaid) {
      return res.json({
        success: true,
        data: {
          orderId: order.id,
          isPaid: true,
          paidAt: order.paidAt,
          paymentMethod: 'momo',
          transactionId: order.paymentResult?.transaction_id
        }
      });
    }

    // If no MoMo payment info exists for this order
    if (!order.momoPaymentInfo) {
      return res.status(400).json({
        success: false,
        message: 'No MoMo payment initiated for this order'
      });
    }

    // If payment was initiated but not completed yet
    return res.json({
      success: true,
      data: {
        orderId: order.id,
        isPaid: false,
        paymentMethod: 'momo',
        momoOrderId: order.momoPaymentInfo.momoOrderId,
        requestId: order.momoPaymentInfo.requestId
      }
    });
  } catch (error) {
    console.error('Error verifying MoMo payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying MoMo payment',
      error: error.message
    });
  }
};

module.exports = {
  createPaymentIntent,
  getPaymentMethods,
  handleWebhook,
  getPaymentStatus,
  createMomoPayment,
  handleMomoIPN,
  verifyMomoPayment
}; 