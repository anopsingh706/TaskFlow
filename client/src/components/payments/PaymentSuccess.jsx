import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'

export default function PaymentSuccess() {
  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <div className="card text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle2 size={56} className="text-emerald-400" />
        </div>
        <h1 className="text-2xl font-display font-bold text-white">Payment successful</h1>
        <p className="text-sm text-gray-400">
          Your plan upgrade is being confirmed. If webhook processing takes a few seconds, refresh profile to see your latest plan.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/profile" className="btn-primary">Go to Profile</Link>
          <Link to="/pricing" className="btn-secondary">View Plans</Link>
        </div>
      </div>
    </div>
  )
}
