const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Razorpay IDs
    razorpay_order_id: {
      type: String,
      required: true,
    },
    razorpay_payment_id: {
      type: String,
      default: null,
    },
    razorpay_signature: {
      type: String,
      default: null,
    },
    // Plan Details
    plan: {
      type: String,
      enum: ['starter', 'pro', 'enterprise'],
      required: true,
    },
    amount: {
      type: Number, // in paise (INR) e.g. 49900 = ₹499
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    // Payment Status
    status: {
      type: String,
      enum: ['created', 'paid', 'failed', 'refunded'],
      default: 'created',
    },
    // Subscription Dates
    planStartDate: {
      type: Date,
      default: null,
    },
    planEndDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;