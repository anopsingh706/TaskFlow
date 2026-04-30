const crypto = require('crypto');
const Payment = require('../models/Payment');
const User = require('../models/User');

const upgradeUserPlan = async (userId, plan) => {
  const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await User.findByIdAndUpdate(userId, {
    plan,
    subscription: {
      gateway: 'razorpay',
      subscriptionId: null,
      currentPeriodEnd,
    },
  });
};

const razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    if (!signature || !secret) return res.status(400).json({ success: false, message: 'Invalid webhook config' });

    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body || {});
    const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    if (digest !== signature) return res.status(400).json({ success: false, message: 'Signature mismatch' });

    const event = typeof req.body === 'object' && !Buffer.isBuffer(req.body) ? req.body : JSON.parse(rawBody);
    if (event.event !== 'payment.captured') return res.json({ success: true, ignored: true });

    const entity = event.payload?.payment?.entity;
    if (!entity?.id) return res.status(400).json({ success: false, message: 'Invalid payload' });

    let payment = await Payment.findOne({
      $or: [{ gatewayPaymentId: entity.id }, { orderId: entity.order_id }],
    });

    const userId = payment?.userId || entity.notes?.userId || null;
    const plan = payment?.plan || entity.notes?.plan || null;

    if (!payment && userId && plan) {
      payment = await Payment.create({
        userId,
        gateway: 'razorpay',
        plan,
        amount: entity.amount || 0,
        currency: (entity.currency || 'INR').toUpperCase(),
        status: 'paid',
        orderId: entity.order_id || null,
        gatewayPaymentId: entity.id,
        signatureVerified: true,
        idempotencyKey: `rzp_webhook_${entity.id}`,
        metadata: { source: 'webhook' },
        paidAt: new Date(),
      });
    } else if (payment && payment.status !== 'paid') {
      payment.status = 'paid';
      payment.gatewayPaymentId = entity.id;
      payment.signatureVerified = true;
      payment.paidAt = new Date();
      await payment.save();
    }

    if (payment && payment.userId && payment.plan) {
      await upgradeUserPlan(payment.userId, payment.plan);
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { razorpayWebhook };
