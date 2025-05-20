const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Order } = require('../models');

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

module.exports = {
  createPaymentIntent,
  getPaymentMethods,
  handleWebhook,
  getPaymentStatus
}; 