import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, CheckSquare, Video, ArrowRight, Brain, TrendingUp, Clock, CheckCircle, Zap, Star, Layout, Users } from 'lucide-react'
import { useAuth }   from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { useTasks }  from '../context/TaskContext'
import Avatar from '../components/ui/Avatar'

const FEATURED_CARDS = [
  { 
    title: 'Collaborative Chat', 
    desc: 'Connect with your team in real-time with channels and DMs.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=250&fit=crop',
    link: '/chat',
    tag: 'Phase 2'
  },
  { 
    title: 'AI Smart Boards', 
    desc: 'Let Gemini prioritize your tasks and suggest next steps.',
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=250&fit=crop',
    link: '/tasks',
    tag: 'Phase 3'
  },
  { 
    title: 'Smart Meetings', 
    desc: 'Video calls with automated AI summaries and action items.',
    image: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=400&h=250&fit=crop',
    link: '/meetings',
    tag: 'Phase 4'
  }
]

export default function DashboardPage() {
  const { user }               = useAuth()
  const { connected }          = useSocket()
  const { tasks, fetchTasks, loading } = useTasks()

  useEffect(() => { fetchTasks() }, []) // eslint-disable-line

  const counts = {
    total:      tasks.length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    done:       tasks.filter(t => t.status === 'done').length,
    high:       tasks.filter(t => t.priority === 'high' && t.status !== 'done').length,
  }

  const STATS = [
    { label: 'Total Tasks',   value: counts.total,      icon: CheckSquare, color: '#5B4FE9', bg: '#EEF0FF' },
    { label: 'In Progress',   value: counts.inProgress,  icon: TrendingUp,  color: '#F97316', bg: '#FFF4ED' },
    { label: 'Completed',     value: counts.done,         icon: CheckCircle, color: '#10B981', bg: '#ECFDF5' },
    { label: 'High Priority', value: counts.high,         icon: Zap,         color: '#EF4444', bg: '#FEF2F2' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10 animate-slide-up pb-20">
      
      {/* ── Welcome Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Avatar user={user} size={64} className="ring-4 ring-violet-50" />
          <div>
            <h2 className="font-display font-bold text-2xl text-gray-900 leading-tight">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h2>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                <Layout size={14} /> {user?.plan || 'Free'} Plan
              </span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span className={`flex items-center gap-1.5 text-xs font-bold ${connected ? 'text-emerald-500' : 'text-amber-500'}`}>
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {connected ? 'Real-time sync active' : 'Connecting to server...'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/tasks" className="btn-secondary !text-xs !px-4 !py-2.5">View Tasks</Link>
          <Link to="/profile" className="btn-primary !text-xs !px-4 !py-2.5 shadow-brand">Settings</Link>
        </div>
      </div>

      {/* ── Statistics Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ background: bg }}>
              <Icon size={20} style={{ color }} />
            </div>
            <div className="font-display font-bold text-3xl text-gray-900 mb-0.5">
              {loading ? <span className="text-gray-200 animate-pulse">...</span> : value}
            </div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Featured Features (Attractive Cards) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Featured Tools</h3>
          <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-100">AI Powered ✨</span>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURED_CARDS.map((card) => (
            <Link key={card.title} to={card.link} className="group relative bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-40 overflow-hidden relative">
                <img src={card.image} alt={card.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                <span className="absolute top-4 left-4 text-[10px] font-bold text-white bg-white/20 backdrop-blur-md border border-white/30 px-2 py-1 rounded-lg">
                  {card.tag}
                </span>
              </div>
              <div className="p-5">
                <h4 className="font-display font-bold text-gray-900 mb-1.5 flex items-center justify-between">
                  {card.title}
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">{card.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Bottom Section: Quick Actions & Pro Banner ── */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Quick Actions</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: 'Invite Team Member', icon: Users, color: '#5B4FE9', bg: '#EEF0FF' },
              { label: 'Schedule Retreat', icon: Clock, color: '#F97316', bg: '#FFF4ED' },
              { label: 'Generate Weekly Report', icon: Brain, color: '#8B5CF6', bg: '#F5F3FF' },
              { label: 'Customize Workspace', icon: Star, color: '#F59E0B', bg: '#FFFBEB' },
            ].map(({ label, icon: Icon, color, bg }) => (
              <button key={label} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:border-violet-200 hover:shadow-sm transition-all text-left group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform" style={{ background: bg }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <span className="text-sm font-semibold text-gray-700">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pro Banner */}
        <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-40 h-40 bg-violet-600/30 rounded-full blur-[80px] -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-[60px] -ml-10 -mb-10" />
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mb-6">
              <Zap size={24} className="text-violet-400" fill="currentColor" />
            </div>
            <h3 className="font-display font-bold text-2xl mb-2">Upgrade to Pro</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Unlock unlimited AI summaries, high-priority support, and custom domain integrations for your entire team.
            </p>
          </div>

          <Link to="/pricing" className="relative z-10 w-full bg-white text-gray-900 font-bold py-3.5 rounded-2xl hover:bg-violet-50 transition-colors text-center shadow-lg">
            Start Free Trial
          </Link>
        </div>
      </div>

    </div>
  )
}
