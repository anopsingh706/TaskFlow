import React, { useEffect, useState } from 'react';
import { paymentsAPI } from '../../api/payments';
import { CheckCircle, XCircle, Clock, RefreshCw, Loader2 } from 'lucide-react';

const statusConfig = {
  paid: {
    label: 'Paid',
    icon: CheckCircle,
    className: 'text-green-600 bg-green-50',
  },
  created: {
    label: 'Pending',
    icon: Clock,
    className: 'text-yellow-600 bg-yellow-50',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    className: 'text-red-600 bg-red-50',
  },
  refunded: {
    label: 'Refunded',
    icon: RefreshCw,
    className: 'text-blue-600 bg-blue-50',
  },
};

export default function BillingHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await paymentsAPI.getBillingHistory();
        setPayments(data.payments);
      } catch (error) {
        console.error('Failed to load billing history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No payment history yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">Billing History</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Plan</th>
              <th className="px-6 py-3 text-left">Amount</th>
              <th className="px-6 py-3 text-left">Order ID</th>
              <th className="px-6 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {payments.map((payment) => {
              const status = statusConfig[payment.status];
              const StatusIcon = status.icon;

              return (
                <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize font-medium text-gray-800">
                      {payment.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-800 font-medium">
                    ₹{(payment.amount / 100).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                    {payment.razorpay_order_id}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.className}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}