import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Logo from '../components/ui/Logo'
import GoogleSignInButton from '../components/auth/GoogleSignInButton'

const PERKS = [
  { icon: '⚡', text: 'Real-time chat & group channels' },
  { icon: '🧠', text: 'AI meeting summaries & task priorities' },
  { icon: '🎥', text: 'HD video meetings built-in' },
  { icon: '✅', text: 'Kanban task board with drag & drop' },
]

export default function RegisterPage() {
  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated) { navigate('/dashboard'); return null }

  const validate = () => {
    const e = {}
    if (!form.name || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await register(form.name.trim(), form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setErrors({ api: err.response?.data?.message || 'Registration failed.' })
    } finally { setLoading(false) }
  }

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }))

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3
  const strengthMeta = [null,
    { label: 'Weak',   color: 'bg-red-400'    },
    { label: 'Good',   color: 'bg-amber-400'  },
    { label: 'Strong', color: 'bg-emerald-500'}
  ]

  return (
    <div className="min-h-screen flex bg-white">

      {/* ── Left: Perks panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] bg-[#F8F7FF] border-r border-violet-100 p-14">
        <Logo size="lg" />

        <div>
          <h2 className="font-display text-4xl font-semibold text-gray-900 leading-tight mb-3">
            Build better,<br />
            <span className="text-gradient-brand">ship faster.</span>
          </h2>
          <p className="text-gray-500 text-lg mb-10 leading-relaxed">
            Join teams who've made TaskFlow the center of how they work.
          </p>

          <div className="space-y-4 mb-10">
            {PERKS.map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm border border-violet-100 flex-shrink-0">
                  {icon}
                </div>
                <span className="text-gray-700 font-medium">{text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[['10k+','Teams'], ['99.5%','Uptime'], ['< 500ms','Latency']].map(([n, l]) => (
              <div key={l} className="bg-white rounded-2xl p-4 text-center border border-violet-100 shadow-sm">
                <div className="font-display font-bold text-xl text-violet-700 mb-0.5">{n}</div>
                <div className="text-xs text-gray-500 font-medium">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Avatars + social proof */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {['#5B4FE9','#F97316','#10B981','#F59E0B'].map((c, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold" style={{ background: c }}>
                {['R','A','P','K'][i]}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500"><span className="font-semibold text-gray-700">2,400+</span> teams joined this month</p>
        </div>
      </div>

      {/* ── Right: Form ── */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-16">
        <div className="max-w-sm mx-auto w-full">
          <div className="lg:hidden mb-8"><Logo /></div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-semibold text-gray-900 mb-2">Create your account</h1>
            <p className="text-gray-500">Free forever on the Starter plan</p>
          </div>

          {/* Google OAuth */}
          <div className="mb-5">
            <GoogleSignInButton label="Sign up with Google" />
          </div>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">or sign up with email</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {errors.api && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <span>⚠</span> {errors.api}
              </div>
            )}
            <Input label="Full name" type="text" icon={User}
              placeholder="Rahul Gupta" value={form.name}
              onChange={set('name')} error={errors.name}
              autoComplete="name" autoFocus />
            <Input label="Work email" type="email" icon={Mail}
              placeholder="you@company.com" value={form.email}
              onChange={set('email')} error={errors.email}
              autoComplete="email" />
            <div>
              <Input label="Password" type="password" icon={Lock}
                placeholder="At least 6 characters" value={form.password}
                onChange={set('password')} error={errors.password}
                autoComplete="new-password" />
              {form.password.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthMeta[strength].color : 'bg-gray-100'}`} />
                    ))}
                  </div>
                  <span className={`text-xs font-semibold ${strength===1?'text-red-500':strength===2?'text-amber-500':'text-emerald-600'}`}>
                    {strengthMeta[strength]?.label}
                  </span>
                </div>
              )}
            </div>

            <Button type="submit" loading={loading} className="w-full !py-3 !text-base">
              Create free account {!loading && <ArrowRight size={16} />}
            </Button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-600 hover:text-violet-700 font-semibold transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
