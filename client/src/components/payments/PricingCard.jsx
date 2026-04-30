import { Check } from 'lucide-react'
import CheckoutButton from './CheckoutButton'

export default function PricingCard({ plan, activePlan, currency, onSuccess }) {
  const isFree = plan.id === 'free'
  const isCurrent = activePlan === plan.id

  return (
    <div className={`card flex flex-col ${plan.highlight ? 'ring-2 ring-brand-500/40' : ''}`}>
      <div className="mb-4">
        <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">{plan.id}</p>
        <h3 className="text-xl font-display font-bold text-white mt-1">{plan.title}</h3>
        <p className="text-sm text-gray-400 mt-1">{plan.description}</p>
      </div>

      <div className="mb-5">
        <span className="text-3xl font-bold text-white">
          {currency === 'INR' ? `₹${plan.priceINR}` : `$${plan.priceUSD}`}
        </span>
        <span className="text-gray-500 text-sm ml-1">/ month</span>
      </div>

      <ul className="space-y-2 mb-6 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-gray-300">
            <Check size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <button disabled className="btn-secondary w-full cursor-not-allowed opacity-70">Current Plan</button>
      ) : isFree ? (
        <button disabled className="btn-ghost w-full opacity-70">Included</button>
      ) : (
        <CheckoutButton plan={plan.id} currency={currency} onSuccess={onSuccess} />
      )}
    </div>
  )
}
