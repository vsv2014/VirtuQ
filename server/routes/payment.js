const express = require('express');
const { auth } = require('../middleware/auth');
const paymentService = require('../services/paymentService');

const router = express.Router();

// Create payment order
router.post('/create-order/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentMethod } = req.body;

    const order = await paymentService.createPaymentOrder(orderId, paymentMethod);
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Verify payment
router.post('/verify', auth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const order = await paymentService.processSuccessfulPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Process refund
router.post('/refund/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { amount, notes } = req.body;

    const order = await paymentService.processRefund(orderId, amount, notes);
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get payment details
router.get('/payment/:paymentId', auth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await paymentService.getPaymentDetails(paymentId);
    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get refund details
router.get('/refund/:refundId', auth, async (req, res) => {
  try {
    const { refundId } = req.params;
    const refund = await paymentService.getRefundDetails(refundId);
    res.json(refund);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Handle Razorpay webhooks
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const result = await paymentService.handleWebhook(
      JSON.stringify(req.body),
      signature
    );
    res.json(result);
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Verify COD order
router.post('/verify-cod/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { verificationCode } = req.body;

    const order = await paymentService.verifyCODOrder(orderId, verificationCode);
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Verify bank transfer
router.post('/verify-bank-transfer/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { transactionId, amount } = req.body;

    const order = await paymentService.verifyBankTransfer(orderId, transactionId, amount);
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Verify UPI payment
router.post('/verify-upi/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { upiTransactionId } = req.body;

    const order = await paymentService.verifyUPIPayment(orderId, upiTransactionId);
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
