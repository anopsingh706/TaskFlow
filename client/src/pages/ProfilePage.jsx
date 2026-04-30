import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Camera, Save, Lock, User, Mail, Shield, CreditCard, Bell, Key } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../api/auth'
import Avatar from '../components/ui/Avatar'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import BillingHistory from '../components/payments/BillingHistory'

const TABS = [
  { id: 'general',     label: 'General',      icon: User },
  { id: 'subscription', label: 'Subscription', icon: CreditCard },
  { id: 'security',    label: 'Security',     icon: Shield },
]

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const fileRef = useRef()

  const [activeTab, setActiveTab] = useState('general')
  const [profileForm, setProfileForm] = useState({ name: user?.name || '' })
  const [passForm, setPassForm]       = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [profileLoading, setProfileLoading] = useState(false)
  const [passLoading, setPassLoading]       = useState(false)
  const [passErrors, setPassErrors]         = useState({})
  const [avatarPreview, setAvatarPreview]   = useState(null)

  // ── Profile update ─────────────────────────────────────
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    if (!profileForm.name.trim() || profileForm.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters')
      return
    }
    setProfileLoading(true)
    try {
      const fd = new FormData()
      fd.append('name', profileForm.name.trim())
      if (fileRef.current?.files[0]) fd.append('avatar', fileRef.current.files[0])
      const { data } = await authAPI.updateProfile(fd)
      updateUser(data.user)
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return }
    setAvatarPreview(URL.createObjectURL(file))
  }

  // ── Password change ─────────────────────────────────────
  const validatePass = () => {
    const e = {}
    if (!passForm.currentPassword) e.currentPassword = 'Required'
    if (!passForm.newPassword || passForm.newPassword.length < 6) e.newPassword = 'Min 6 characters'
    if (passForm.newPassword !== passForm.confirm) e.confirm = 'Passwords do not match'
    return e
  }

  const handlePassSubmit = async (e) => {
    e.preventDefault()
    const errs = validatePass()
    if (Object.keys(errs).length) { setPassErrors(errs); return }
    setPassErrors({})
    setPassLoading(true)
    try {
      await authAPI.changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword })
      toast.success('Password changed successfully')
      setPassForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      setPassErrors({ api: err.response?.data?.message || 'Failed to change password' })
    } finally {
      setPassLoading(false)
    }
  }

  const setPass = (f) => (e) => setPassForm((p) => ({ ...p, [f]: e.target.value }))

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-slide-up">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <Avatar 
              user={avatarPreview ? { ...user, avatar: avatarPreview } : user} 
              size={80} 
              className="ring-4 ring-violet-50"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center border-4 border-white text-white hover:bg-violet-700 transition-all shadow-md active:scale-90"
              title="Change avatar"
            >
              <Camera size={14} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900">{user?.name}</h1>
            <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-0.5">
              <Mail size={14} /> {user?.email}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="badge-brand text-[10px] py-0.5 px-2 capitalize">
                {user?.plan || 'Free'} Plan
              </span>
              <span className="text-[10px] text-gray-400 font-medium">Joined {new Date(user?.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-2xl w-full sm:w-max">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              activeTab === id 
                ? 'bg-white text-violet-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-6">
          {/* ── GENERAL TAB ── */}
          {activeTab === 'general' && (
            <form onSubmit={handleProfileSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="font-display font-bold text-gray-900">Personal Information</h2>
                  <p className="text-xs text-gray-400">Update your name and profile details.</p>
                </div>
              </div>

              <div className="grid gap-6">
                <Input
                  label="Display Name"
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ name: e.target.value })}
                  placeholder="How should we call you?"
                />
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail size={16} />
                    </div>
                    <input 
                      type="email" 
                      value={user?.email || ''} 
                      disabled 
                      className="w-full bg-gray-50 border border-gray-200 text-gray-400 text-sm rounded-xl pl-11 pr-4 py-3 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 px-1">Email address is managed via account settings and cannot be changed here.</p>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" loading={profileLoading} className="w-full sm:w-auto !py-3 !px-8">
                  <Save size={16} /> Save Changes
                </Button>
              </div>
            </form>
          )}

          {/* ── SUBSCRIPTION TAB ── */}
          {activeTab === 'subscription' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-4 mb-6">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-gray-900">Active Plan</h2>
                    <p className="text-xs text-gray-400">Manage your subscription and features.</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl p-6 border border-violet-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-violet-600">
                      <Key size={24} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-violet-400 uppercase tracking-widest">Current Plan</div>
                      <div className="text-xl font-display font-bold text-gray-900 capitalize">{user?.plan || 'Free'}</div>
                    </div>
                  </div>
                  <Link to="/pricing" className="btn-primary !px-6 !py-2.5 shadow-brand text-sm">
                    {user?.plan === 'free' ? 'Upgrade to Pro' : 'Change Plan'}
                  </Link>
                </div>
              </div>
              
              <BillingHistory />
            </div>
          )}

          {/* ── SECURITY TAB ── */}
          {activeTab === 'security' && (
            <form onSubmit={handlePassSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                  <Lock size={20} />
                </div>
                <div>
                  <h2 className="font-display font-bold text-gray-900">Security & Password</h2>
                  <p className="text-xs text-gray-400">Secure your account with a strong password.</p>
                </div>
              </div>

              {passErrors.api && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-medium px-4 py-3 rounded-xl flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  {passErrors.api}
                </div>
              )}

              <div className="grid gap-6">
                <Input
                  label="Current Password"
                  type="password"
                  value={passForm.currentPassword}
                  onChange={setPass('currentPassword')}
                  error={passErrors.currentPassword}
                  placeholder="Enter current password"
                />
                <div className="grid sm:grid-cols-2 gap-6">
                  <Input
                    label="New Password"
                    type="password"
                    value={passForm.newPassword}
                    onChange={setPass('newPassword')}
                    error={passErrors.newPassword}
                    placeholder="Min. 6 characters"
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passForm.confirm}
                    onChange={setPass('confirm')}
                    error={passErrors.confirm}
                    placeholder="Repeat new password"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" loading={passLoading} className="w-full sm:w-auto !py-3 !px-8 !bg-gray-900 hover:!bg-gray-800">
                  <Lock size={16} /> Update Password
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-3xl p-6 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/20 rounded-full blur-3xl -mr-16 -mt-16" />
            <h3 className="font-display font-bold mb-2 relative z-10 text-lg">Pro Tip 💡</h3>
            <p className="text-gray-400 text-xs leading-relaxed relative z-10">
              Enable two-factor authentication to add an extra layer of security to your TaskFlow account.
            </p>
            <button className="mt-4 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors relative z-10">
              Learn more →
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Account Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email Verified</span>
                <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">2FA Enabled</span>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">Optional</span>
              </div>
              <div className="pt-2">
                <div className="text-[10px] text-gray-400 mb-1">Last active</div>
                <div className="text-xs font-medium text-gray-700">{new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
