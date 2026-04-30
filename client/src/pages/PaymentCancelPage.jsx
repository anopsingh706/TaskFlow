import { Link } from 'react-router-dom'
import { XCircle } from 'lucide-react'

export default function PaymentCancelPage() {
  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <div className="card text-center space-y-4">
        <div className="flex justify-center">
          <XCircle size={56} className="text-rose-400" />
        </div>
        <h1 className="text-2xl font-display font-bold text-white">Payment cancelled</h1>
        <p className="text-sm text-gray-400">
          No amount was charged. You can retry checkout anytime.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/pricing" className="btn-primary">Try Again</Link>
          <Link to="/profile" className="btn-secondary">Back to Profile</Link>
        </div>
      </div>
    </div>
  )
}
