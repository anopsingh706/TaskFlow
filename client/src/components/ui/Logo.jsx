export default function Logo({ size = 'md', className = '' }) {
  const sizes = {
    sm: { icon: 28, text: 'text-base',  gap: 'gap-2' },
    md: { icon: 34, text: 'text-xl',    gap: 'gap-2.5' },
    lg: { icon: 40, text: 'text-2xl',   gap: 'gap-3' },
  }
  const s = sizes[size]

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      {/* Logo mark */}
      <svg width={s.icon} height={s.icon} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="12" fill="url(#logoGrad)"/>
        {/* Task lines */}
        <rect x="11" y="13" width="17" height="3.5" rx="1.75" fill="white"/>
        <rect x="11" y="21" width="26" height="3.5" rx="1.75" fill="white" opacity="0.65"/>
        <rect x="11" y="29" width="12" height="3.5" rx="1.75" fill="white" opacity="0.4"/>
        {/* Check circle — accent */}
        <circle cx="35.5" cy="34" r="7" fill="#F97316"/>
        <path d="M32.5 34l2.2 2.2L38 31.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7C72F8"/>
            <stop offset="100%" stopColor="#4A3FD4"/>
          </linearGradient>
        </defs>
      </svg>

      {/* Wordmark */}
      <span className={`font-display font-semibold ${s.text} leading-none tracking-tight`}>
        <span className="text-gray-900">Task</span>
        <span className="text-violet-600">Flow</span>
      </span>
    </div>
  )
}
