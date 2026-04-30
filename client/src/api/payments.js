import api from './axios';

export const paymentsAPI = {
  // Create Razorpay order
  createOrder: (plan) => api.post('/payments/create-order', { plan }),
  createRazorpayOrder: (plan) => api.post('/payments/create-order', { plan }),

  // Verify Razorpay payment
  verifyPayment: (paymentData) => api.post('/payments/verify', paymentData),
  verifyRazorpayPayment: (paymentData) => api.post('/payments/verify', paymentData),

  // Get billing history
  getBillingHistory: () => api.get('/payments/history'),

  // Get current active plan
  getCurrentPlan: () => api.get('/payments/plan'),

  // Get payment configuration (Keys, etc.)
  getConfig: () => api.get('/payments/config'),
};

// Export individual functions for backward compatibility
export const {
  createOrder,
  createRazorpayOrder,
  verifyPayment,
  verifyRazorpayPayment,
  getBillingHistory,
  getCurrentPlan,
  getConfig,
} = paymentsAPI;
