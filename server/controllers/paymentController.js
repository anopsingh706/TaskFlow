const Razorpay = require('razorpay');
const crypto    = require('crypto');
const Payment   = require('../models/Payment');
const User      = require('../models/User');

// ─── Initialize Razorpay Instance (Lazy) ───────────────────────────────────
let razorpay;
const getRazorpay = () => {
  if (!razorpay) {
    const key_id = process.env.RAZORPAY_KEY_ID?.trim();
    const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!key_id || !key_secret) {
      console.error('❌ Razorpay API keys are missing in environment variables.');
    }
    razorpay = new Razorpay({
      key_id,
      key_secret,
    });
  }
  return razorpay;
};

// ─── Plan Config ────────────────────────────────────────────────────────────
const PLANS = {
  starter: {
    name: 'Starter',
    amount: 49900,      // ₹499 in paise
    duration: 30,       // days
  },
  pro: {
    name: 'Pro',
    amount: 99900,      // ₹999 in paise
    duration: 30,
  },
  enterprise: {
    name: 'Enterprise',
    amount: 299900,     // ₹2999 in paise
    duration: 30,
  },
};

// ─── @desc    Create Razorpay Order ─────────────────────────────────────────
// ─── @route   POST /api/payments/create-order ────────────────────────────────
// ─── @access  Private ────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;

    // Validate plan
    if (!PLANS[plan]) {
      return res.status(400).json({ message: 'Invalid plan selected.' });
    }

    const selectedPlan = PLANS[plan];
    const rzp = getRazorpay();

    // Create Razorpay order
    const razorpayOrder = await rzp.orders.create({
      amount: selectedPlan.amount,
      currency: 'INR',
      receipt: `rcpt_${req.user._id.toString().slice(-6)}_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        plan: plan,
      },
    });

    // Save order to DB
    const payment = await Payment.create({
      user: req.user._id,
      razorpay_order_id: razorpayOrder.id,
      plan: plan,
      amount: selectedPlan.amount,
      currency: 'INR',
      status: 'created',
    });

    res.status(201).json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      payment_id: payment._id,
      key: process.env.RAZORPAY_KEY_ID,
      user: {
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    // Log more details if it's a Razorpay error
    if (error.error) {
      console.error('Razorpay Error Details:', JSON.stringify(error.error, null, 2));
    }
    res.status(500).json({ 
      message: 'Failed to create payment order.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ─── @desc    Verify Payment Signature ──────────────────────────────────────
// ─── @route   POST /api/payments/verify ──────────────────────────────────────
// ─── @access  Private ────────────────────────────────────────────────────────
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // Step 1: Generate expected signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    // Step 2: Compare signatures
    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid signature.',
      });
    }

    // Step 3: Find and update payment in DB
    const payment = await Payment.findOne({
      razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found.' });
    }

    // Calculate plan dates
    const planStartDate = new Date();
    const planEndDate = new Date();
    planEndDate.setDate(
      planEndDate.getDate() + getPlanDuration(payment.plan)
    );

    // Update payment record
    payment.razorpay_payment_id = razorpay_payment_id;
    payment.razorpay_signature = razorpay_signature;
    payment.status = 'paid';
    payment.planStartDate = planStartDate;
    payment.planEndDate = planEndDate;
    await payment.save();

    // Step 4: Update user plan in User model
    await User.findByIdAndUpdate(payment.user, {
      plan: payment.plan,
      subscription: {
        razorpay_order_id,
        razorpay_payment_id,
        currentPeriodEnd: planEndDate,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully!',
      plan: payment.plan,
      planExpiry: planEndDate,
    });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ message: 'Payment verification failed.' });
  }
};

// ─── @desc    Razorpay Webhook Handler ──────────────────────────────────────
// ─── @route   POST /api/payments/webhook ─────────────────────────────────────
// ─── @access  Public (Razorpay calls this) ───────────────────────────────────
const handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: 'Invalid webhook signature.' });
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload?.payment?.entity;

    // Handle events
    switch (event) {
      case 'payment.captured': {
        // Payment was captured successfully
        const payment = await Payment.findOne({
          razorpay_order_id: paymentEntity.order_id,
        });

        if (payment && payment.status !== 'paid') {
          payment.razorpay_payment_id = paymentEntity.id;
          payment.status = 'paid';
          await payment.save();

          console.log(`✅ Webhook: Payment captured for order ${paymentEntity.order_id}`);
        }
        break;
      }

      case 'payment.failed': {
        // Payment failed
        const payment = await Payment.findOne({
          razorpay_order_id: paymentEntity.order_id,
        });

        if (payment) {
          payment.status = 'failed';
          await payment.save();
          console.log(`❌ Webhook: Payment failed for order ${paymentEntity.order_id}`);
        }
        break;
      }

      case 'refund.created': {
        // Handle refund
        const refundPaymentId = paymentEntity?.payment_id;
        const payment = await Payment.findOne({
          razorpay_payment_id: refundPaymentId,
        });

        if (payment) {
          payment.status = 'refunded';
          await payment.save();
          console.log(`🔄 Webhook: Refund created for payment ${refundPaymentId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ message: 'Webhook handler failed.' });
  }
};

// ─── @desc    Get Billing History ────────────────────────────────────────────
// ─── @route   GET /api/payments/history ──────────────────────────────────────
// ─── @access  Private ────────────────────────────────────────────────────────
const getBillingHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('-razorpay_signature');

    res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error('Billing History Error:', error);
    res.status(500).json({ message: 'Failed to fetch billing history.' });
  }
};

// ─── @desc    Get Current Plan ────────────────────────────────────────────
// ─── @route   GET /api/payments/plan ─────────────────────────────────────────
// ─── @access  Private ────────────────────────────────────────────────────────
const getCurrentPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('plan planExpiry');
    res.status(200).json({
      success: true,
      plan: user.plan || 'free',
      planExpiry: user.planExpiry || null,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch plan.' });
  }
};

// ─── Helper ──────────────────────────────────────────────────────────────────
const getPlanDuration = (plan) => {
  const durations = { starter: 30, pro: 30, enterprise: 30 };
  return durations[plan] || 30;
};

// ─── @desc    Get Payment Configuration ──────────────────────────────────────
// ─── @route   GET /api/payments/config ───────────────────────────────────────
// ─── @access  Private ────────────────────────────────────────────────────────
const getPaymentConfig = async (req, res) => {
  res.status(200).json({
    success: true,
    config: {
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    },
  });
};

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
  getBillingHistory,
  getCurrentPlan,
  getPaymentConfig,
};