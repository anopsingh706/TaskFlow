import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import PaymentSuccess from '../components/payments/PaymentSuccess'
import { authAPI } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const gateway = searchParams.get('gateway')
  const { updateUser } = useAuth()

  useEffect(() => {
    const sync = async () => {
      try {
        const { data } = await authAPI.getMe()
        if (data?.user) updateUser(data.user)
      } catch {
        // handled globally by axios interceptor
      }
    }
    sync()
  }, [updateUser])

  useEffect(() => {
    // Payment verified via Razorpay modal/PricingPage logic or Stripe webhook (if it was used)
  }, [gateway])

  return <PaymentSuccess />
}
