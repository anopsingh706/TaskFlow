import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Logo from '../components/ui/Logo'
import GoogleSignInButton from '../components/auth/GoogleSignInButton'

export default function LoginPage() {
  const [form, setForm]       = useState({ email: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || '/dashboard'

  if (isAuthenticated) { navigate('/dashboard', { replace: true }); return null }

  const validate = () => {
    const e = {}
    if (!form.email)    e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setErrors({ api: err.response?.data?.message || 'Invalid email or password.' })
    } finally { setLoading(false) }
  }

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }))

  return (
    <div className="min-h-screen flex bg-white">
      {/* ── Left: Form ── */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-16">
        <div className="max-w-sm mx-auto w-full">
          <Link to="/"><Logo size="lg" className="mb-10" /></Link>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-semibold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-500">Sign in to continue to your workspace</p>
          </div>

          {/* Google OAuth button */}
          <div className="mb-5">
            <GoogleSignInButton label="Continue with Google" />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">or sign in with email</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {errors.api && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <span>⚠</span> {errors.api}
              </div>
            )}
            <Input label="Email address" type="email" icon={Mail}
              placeholder="you@company.com" value={form.email}
              onChange={set('email')} error={errors.email}
              autoComplete="email" />
            <Input label="Password" type="password" icon={Lock}
              placeholder="Your password" value={form.password}
              onChange={set('password')} error={errors.password}
              autoComplete="current-password" />
            <Button type="submit" loading={loading} className="w-full !py-3 !text-base">
              Sign in {!loading && <ArrowRight size={16} />}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <button
            onClick={() => setForm({ email: 'demo@taskflow.app', password: 'demo1234' })}
            className="w-full py-3 px-4 rounded-xl border border-dashed border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition-all text-sm text-gray-500 hover:text-violet-700 font-medium"
          >
            Use demo credentials
          </button>

          <p className="text-center text-sm text-gray-500 mt-8">
            No account?{' '}
            <Link to="/register" className="text-violet-600 hover:text-violet-700 font-semibold">Create one free →</Link>
          </p>
        </div>
      </div>

      {/* ── Right: Illustration panel ── */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-violet-600 to-violet-900 relative overflow-hidden flex-col justify-between p-14">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-orange-400/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize:'28px 28px' }} />
        </div>

        {/* Floating UI mockup */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="w-full max-w-xs" style={{ animation:'float 5s ease-in-out infinite' }}>
            <div className="bg-white rounded-2xl p-5 shadow-2xl mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Good morning 👋</div>
                  <div className="font-display font-semibold text-gray-900 text-lg">Priya's Workspace</div>
                </div>
                <img src="https://images.unsplash.com/photo-1494790108755-2616b612b3bd?w=36&h=36&fit=crop&crop=face" alt="avatar" className="w-9 h-9 rounded-full border-2 border-white shadow" />
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[['8','Tasks','#EEF0FF','#5B4FE9'],['2','Calls','#FFF4ED','#F97316'],['94%','Done','#ECFDF5','#10B981']].map(([v,l,bg,c])=>(
                  <div key={l} className="rounded-xl p-2.5 text-center" style={{background:bg}}>
                    <div className="font-display font-bold text-2xl leading-none" style={{color:c}}>{v}</div>
                    <div className="text-xs font-semibold mt-0.5" style={{color:c+'99'}}>{l}</div>
                  </div>
                ))}
              </div>
              <div className="bg-gradient-to-r from-violet-500 to-violet-700 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-base">🧠</div>
                <div>
                  <div className="text-white text-xs font-bold">AI Summary ready</div>
                  <div className="text-white/70 text-xs">3 action items from standup</div>
                </div>
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur rounded-xl p-3.5 flex items-start gap-3 border border-white/20">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=28&h=28&fit=crop&crop=face" alt="a" className="w-7 h-7 rounded-full" />
              <div>
                <div className="text-white/80 text-xs font-semibold mb-1">Arjun · just now</div>
                <div className="bg-white/20 rounded-xl rounded-tl-none px-3 py-2 text-white text-xs">Reviewed your PR! Looks 🔥</div>
              </div>
            </div>
          </div>
        </div>

        <blockquote className="relative z-10">
          <p className="text-white/80 font-display italic text-base leading-relaxed mb-3">
            "TaskFlow saves our team 5 hours every week."
          </p>
          <div className="flex items-center gap-3">
            <img src="https://images.unsplash.com/photo-1494790108755-2616b612b3bd?w=36&h=36&fit=crop&crop=face" alt="p" className="w-9 h-9 rounded-full" />
            <div>
              <div className="text-white text-sm font-semibold">Priya Mehta</div>
              <div className="text-white/60 text-xs">Engineering Lead, Razorpay</div>
            </div>
          </div>
        </blockquote>

        <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
      </div>
    </div>
  )
}
