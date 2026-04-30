const express = require('express');
const {
  createOrder,
  verifyPayment,
  handleWebhook,
  getBillingHistory,
  getCurrentPlan,
  getPaymentConfig,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ── Webhook (must be BEFORE express.json() parsing for raw body)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// ── Protected Routes
router.get('/config', protect, getPaymentConfig);
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getBillingHistory);
router.get('/plan', protect, getCurrentPlan);

module.exports = router;