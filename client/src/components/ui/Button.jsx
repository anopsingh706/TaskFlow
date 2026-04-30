import clsx from 'clsx'
import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  ghost:     'btn-ghost',
  danger:    'btn-danger',
}

const SIZES = {
  sm:  'text-sm px-3.5 py-1.5',
  md:  '',   // default from btn-* classes
  lg:  'text-base px-6 py-3',
}

export default function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(VARIANTS[variant], SIZES[size], 'relative', className)}
      {...props}
    >
      {loading && (
        <Loader2 size={16} className="animate-spin" />
      )}
      {children}
    </button>
  )
}
