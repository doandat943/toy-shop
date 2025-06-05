const express = require('express');
const router = express.Router();
const { 
  createPaymentIntent,
  getPaymentMethods,
  handleWebhook,
  getPaymentStatus,
  createMomoPayment,
  handleMomoIPN,
  verifyMomoPayment
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/auth');

// @route   POST /api/payment/create-payment-intent
// @desc    Create payment intent for Stripe
// @access  Private
router.post('/create-payment-intent', protect, createPaymentIntent);

// @route   GET /api/payment/methods
// @desc    Get available payment methods
// @access  Public
router.get('/methods', getPaymentMethods);

// @route   POST /api/payment/webhook
// @desc    Handle Stripe webhook events
// @access  Public
router.post('/webhook', express.raw({type: 'application/json'}), handleWebhook);

// @route   GET /api/payment/status/:orderId
// @desc    Get payment status for an order
// @access  Private
router.get('/status/:orderId', protect, getPaymentStatus);

// @route   POST /api/payment/create-momo-payment
// @desc    Create MoMo payment
// @access  Private
router.post('/create-momo-payment', protect, createMomoPayment);

// @route   POST /api/payment/momo-ipn
// @desc    Handle MoMo IPN (Instant Payment Notification)
// @access  Public
router.post('/momo-ipn', handleMomoIPN);

// @route   GET /api/payment/verify-momo/:orderId
// @desc    Verify MoMo payment status
// @access  Private
router.get('/verify-momo/:orderId', protect, verifyMomoPayment);

module.exports = router; 