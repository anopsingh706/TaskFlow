import React, { useState, useEffect } from 'react';
import { createOrder, verifyPayment, getCurrentPlan } from '../api/payments';
import { CheckCircle, Zap, Crown, Building2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 499,
    displayPrice: '₹499',
    period: '/month',
    icon: Zap,
    iconColor: 'text-blue-500',
    borderColor: 'border-blue-200',
    badgeColor: 'bg-blue-50 text-blue-700',
    features: [
      '5 Team Members',
      '10 Active Projects',
      'Basic Kanban Board',
      'Chat & Messaging',
      '5GB Storage',
      'Email Support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 999,
    displayPrice: '₹999',
    period: '/month',
    icon: Crown,
    iconColor: 'text-violet-600',
    borderColor: 'border-violet-400',
    badgeColor: 'bg-violet-600 text-white',
    popular: true,
    features: [
      '25 Team Members',
      'Unlimited Projects',
      'AI Task Priority (Gemini)',
      'Video Meetings + AI Summary',
      '50GB Storage',
      'Priority Support',
      'Custom Workflows',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 2999,
    displayPrice: '₹2,999',
    period: '/month',
    icon: Building2,
    iconColor: 'text-amber-500',
    borderColor: 'border-amber-200',
    badgeColor: 'bg-amber-50 text-amber-700',
    features: [
      'Unlimited Members',
      'Unlimited Everything',
      'Advanced AI Analytics',
      'SSO & Custom Auth',
      '500GB Storage',
      '24/7 Dedicated Support',
      'SLA Guarantee',
      'On-premise Option',
    ],
  },
];

export default function PricingPage() {
  const [currentPlan, setCurrentPlan] = useState('free');
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [fetchingPlan, setFetchingPlan] = useState(true);

  // Fetch user's current plan on mount
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const { data } = await getCurrentPlan();
        setCurrentPlan(data.plan);
      } catch (error) {
        console.error('Failed to fetch plan:', error);
      } finally {
        setFetchingPlan(false);
      }
    };
    fetchPlan();
  }, []);

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (plan) => {
    try {
      setLoadingPlan(plan.id);

      // 1. Load Razorpay SDK
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error('Failed to load Razorpay. Check your connection.');
        return;
      }

      // 2. Create order from backend
      const { data } = await createOrder(plan.id);

      // 3. Open Razorpay Checkout
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'TaskFlow',
        description: `${plan.name} Plan - Monthly`,
        image: '/logo.png',
        order_id: data.order.id,
        handler: async (response) => {
          // 4. Verify payment on success
          try {
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              toast.success(`🎉 ${plan.name} Plan activated successfully!`);
              setCurrentPlan(plan.id);
            }
          } catch (err) {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: {
          name: data.user.name,
          email: data.user.email,
        },
        theme: {
          color: '#7C3AED',
        },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled.', { icon: '⚠️' });
          },
        },
      };

      const rzp = new window.Razorpay(options);

      // Handle payment failure
      rzp.on('payment.failed', (response) => {
        toast.error(`Payment failed: ${response.error.description}`);
      });

      rzp.open();
    } catch (error) {
      console.error('Payment Error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  if (fetchingPlan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="inline-block bg-violet-100 text-violet-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
          Simple Pricing
        </span>
        <h1 className="text-4xl font-bold text-gray-900 font-[Fraunces] mb-4">
          Choose your TaskFlow Plan
        </h1>
        <p className="text-gray-500 text-lg">
          Upgrade to unlock AI features, unlimited projects, and team
          collaboration tools.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPlan === plan.id;
          const isLoading = loadingPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border-2 p-8 shadow-sm
                transition-all duration-300 hover:shadow-lg
                ${plan.popular ? 'border-violet-400 scale-105' : plan.borderColor}
                ${isCurrentPlan ? 'ring-2 ring-violet-500' : ''}
              `}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-violet-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
                    MOST POPULAR
                  </span>
                </div>
              )}

              {/* Active Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute top-4 right-4">
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                    ✓ Current Plan
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold mb-4 ${plan.badgeColor}`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      plan.popular ? 'text-white' : plan.iconColor
                    }`}
                  />
                  {plan.name}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.displayPrice}
                  </span>
                  <span className="text-gray-400 text-sm">{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-gray-600"
                  >
                    <CheckCircle className="w-4 h-4 text-violet-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handlePayment(plan)}
                disabled={isCurrentPlan || isLoading}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200
                  ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-md hover:shadow-violet-200'
                      : 'bg-gray-900 hover:bg-gray-700 text-white'
                  }
                `}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </span>
                ) : isCurrentPlan ? (
                  'Active Plan'
                ) : (
                  `Get ${plan.name} →`
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Trust badges */}
      <div className="text-center mt-12 text-gray-400 text-sm">
        <p>
          🔒 Secured by Razorpay · All major UPI, cards & net banking accepted
        </p>
      </div>
    </div>
  );
}