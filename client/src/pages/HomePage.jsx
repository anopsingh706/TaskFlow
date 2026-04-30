import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowRight, Check, Star, Zap, MessageSquare, Video, CheckSquare, Brain, BarChart3, Globe, ChevronRight } from 'lucide-react'
import Logo from '../components/ui/Logo'

/* ── Marquee CSS injected inline ── */
const marqueeStyle = `
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes marqueeR { from { transform: translateX(-50%); } to { transform: translateX(0); } }
.marquee-track { display: flex; width: max-content; animation: marquee 30s linear infinite; }
.marquee-track:hover { animation-play-state: paused; }
.marquee-trackR { display: flex; width: max-content; animation: marqueeR 36s linear infinite; }
@keyframes fadeUp { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
.fade-up { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
.fade-up-1 { animation-delay: 0.1s; }
.fade-up-2 { animation-delay: 0.2s; }
.fade-up-3 { animation-delay: 0.3s; }
.fade-up-4 { animation-delay: 0.4s; }
@keyframes floatCard { 0%,100%{transform:translateY(0) rotate(-1deg);} 50%{transform:translateY(-12px) rotate(-1deg);} }
@keyframes floatCard2 { 0%,100%{transform:translateY(0) rotate(1.5deg);} 50%{transform:translateY(-8px) rotate(1.5deg);} }
.float-card  { animation: floatCard  5s ease-in-out infinite; }
.float-card2 { animation: floatCard2 6s ease-in-out infinite 1s; }
`

const FEATURES = [
  { icon: MessageSquare, color: '#5B4FE9', bg: '#EEF0FF', title: 'Real-Time Chat', desc: 'Instant messaging with channels, DMs, threads, emoji reactions and read receipts — all in real time.' },
  { icon: CheckSquare,   color: '#10B981', bg: '#ECFDF5', title: 'Smart Task Board', desc: 'Kanban boards with AI-powered priority suggestions. Drag, assign, track — your team stays aligned.' },
  { icon: Video,         color: '#F97316', bg: '#FFF4ED', title: 'Video Meetings',  desc: 'One-click HD video calls powered by Jitsi. No plugins needed — just click and collaborate.' },
  { icon: Brain,         color: '#8B5CF6', bg: '#F5F3FF', title: 'AI Summaries',    desc: 'Gemini AI transcribes your meetings and extracts key points, action items, and decisions automatically.' },
  { icon: BarChart3,     color: '#EC4899', bg: '#FDF2F8', title: 'Team Analytics',  desc: 'Track task completion, meeting attendance, and team velocity with beautiful real-time dashboards.' },
  { icon: Globe,         color: '#0EA5E9', bg: '#F0F9FF', title: 'Integrations',    desc: 'Connect with Slack, GitHub, Notion, and 50+ tools your team already uses via webhooks and APIs.' },
]

const COMPANIES = [
  { name: 'Google',     logo: 'https://logo.clearbit.com/google.com'     },
  { name: 'Razorpay',   logo: 'https://logo.clearbit.com/razorpay.com'   },
  { name: 'Zomato',     logo: 'https://logo.clearbit.com/zomato.com'     },
  { name: 'Swiggy',     logo: 'https://logo.clearbit.com/swiggy.com'     },
  { name: 'Flipkart',   logo: 'https://logo.clearbit.com/flipkart.com'   },
  { name: 'Infosys',    logo: 'https://logo.clearbit.com/infosys.com'    },
  { name: 'Wipro',      logo: 'https://logo.clearbit.com/wipro.com'      },
  { name: 'Atlassian',  logo: 'https://logo.clearbit.com/atlassian.com'  },
  { name: 'Freshworks', logo: 'https://logo.clearbit.com/freshworks.com' },
  { name: 'Meesho',     logo: 'https://logo.clearbit.com/meesho.com'     },
  { name: 'Notion',     logo: 'https://logo.clearbit.com/notion.so'      },
  { name: 'Slack',      logo: 'https://logo.clearbit.com/slack.com'      },
  { name: 'Figma',      logo: 'https://logo.clearbit.com/figma.com'      },
  { name: 'GitHub',     logo: 'https://logo.clearbit.com/github.com'     },
]

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Engineering Lead · Razorpay', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b3bd?w=64&h=64&fit=crop&crop=face', text: 'TaskFlow\'s AI meeting summaries cut our sync time in half. Every action item lands in the task board automatically. It\'s magic.' },
  { name: 'Arjun Mehta',  role: 'Product Manager · Flipkart',  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face', text: 'We replaced Slack + Notion + Zoom with just TaskFlow. Our team is more focused and we save ₹40,000/month on tools.' },
  { name: 'Sneha Kapoor', role: 'Startup Founder · Delhi',     avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face', text: 'The Kanban board with AI priority suggestions is a game changer for a small team like ours. Everyone knows what to do next.' },
  { name: 'Rohit Verma',  role: 'CTO · Meesho',               avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face', text: 'Onboarded 80 engineers in a week. The real-time collaboration feels instant — latency under 200ms every time.' },
]

const STEPS = [
  { num: '01', title: 'Create your workspace', desc: 'Sign up free, invite your team with a link. No credit card needed to start.' },
  { num: '02', title: 'Chat & assign tasks',    desc: 'Message teammates, create channels, and build your first Kanban board in minutes.' },
  { num: '03', title: 'Meet & let AI work',     desc: 'Run video calls — AI automatically summarises and turns decisions into tasks.' },
]

const PLANS = [
  { name: 'Starter', price: '₹0', period: 'forever', desc: 'Perfect for small teams getting started.', cta: 'Get started free', href: '/register', highlight: false,
    features: ['Up to 5 members', '10 GB storage', 'Real-time chat', 'Basic task board', '5 video meetings/month'] },
  { name: 'Pro',     price: '₹299', period: '/month', desc: 'For growing teams who need AI superpowers.', cta: 'Start free trial', href: '/register', highlight: true,
    features: ['Unlimited members', '100 GB storage', 'Everything in Starter', 'AI meeting summaries', 'Unlimited video calls', 'Priority support', 'Analytics dashboard'] },
  { name: 'Team',    price: '₹999', period: '/month', desc: 'Enterprise-grade for large organisations.', cta: 'Contact sales', href: '/register', highlight: false,
    features: ['Everything in Pro', 'SSO / SAML', 'Audit logs', 'Custom integrations', 'Dedicated Slack support', 'SLA guarantee'] },
]

function Navbar() {
  const { isAuthenticated } = useAuth()
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo size="md" />
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
          {['Features','How it works','Pricing','Testimonials'].map(t => (
            <a key={t} href={`#${t.toLowerCase().replace(' ','-')}`}
               className="hover:text-gray-900 transition-colors">{t}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary text-sm px-4 py-2">
              Go to app <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link to="/login"    className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-2 transition-colors">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm px-4 py-2">Get started free <ArrowRight size={14} /></Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default function HomePage() {
  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      <style>{marqueeStyle}</style>
      <Navbar />

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Mesh background */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ background: 'radial-gradient(ellipse 900px 600px at 60% 40%, rgba(91,79,233,0.07) 0%, transparent 70%)' }} className="absolute inset-0" />
          <div style={{ background: 'radial-gradient(ellipse 500px 400px at 10% 80%, rgba(249,115,22,0.05) 0%, transparent 70%)' }} className="absolute inset-0" />
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage:'radial-gradient(circle,#d1d5f0 1px,transparent 1px)', backgroundSize:'32px 32px' }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            {/* Left: copy */}
            <div className="flex-1 text-center lg:text-left max-w-2xl">
              {/* Badge */}
              <div className="fade-up inline-flex items-center gap-2 bg-violet-50 border border-violet-200 text-violet-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
                <Zap size={13} fill="currentColor" /> Now with Gemini AI — free for all teams
              </div>

              <h1 className="fade-up fade-up-1 font-display text-5xl lg:text-6xl xl:text-7xl font-semibold text-gray-900 leading-[1.05] tracking-tight mb-6">
                Where teams<br />
                <span className="text-gradient">think together.</span>
              </h1>

              <p className="fade-up fade-up-2 text-xl text-gray-500 leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0">
                Chat, tasks, video meetings, and AI-generated summaries — the all-in-one workspace that replaces your scattered tools.
              </p>

              <div className="fade-up fade-up-3 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
                <Link to="/register" className="btn-primary !text-base !px-8 !py-3.5 shadow-brand">
                  Start free — no card needed <ArrowRight size={18} />
                </Link>
                <a href="#how-it-works" className="btn-secondary !text-base !px-8 !py-3.5">
                  See how it works
                </a>
              </div>

              <div className="fade-up fade-up-4 flex items-center gap-6 justify-center lg:justify-start text-sm text-gray-400">
                {['Free forever plan', 'No credit card', 'Setup in 2 minutes'].map(t => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Check size={13} className="text-emerald-500" strokeWidth={3} /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: floating UI mockup */}
            <div className="flex-1 relative flex justify-center items-center min-h-[480px] w-full max-w-xl">

              {/* Main dashboard screenshot */}
              <div className="float-card relative z-10 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-full max-w-md">
                {/* Window chrome */}
                <div className="bg-gray-50 px-4 py-3 flex items-center gap-2 border-b border-gray-100">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 ml-2 border border-gray-200">app.taskflow.io/dashboard</div>
                </div>
                {/* Dashboard content */}
                <div className="p-5 bg-[#F8F7FF]">
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xs text-gray-400 font-medium">Good morning 👋</div>
                      <div className="font-display font-semibold text-gray-900 text-lg">Priya's Workspace</div>
                    </div>
                    <img src="https://images.unsplash.com/photo-1494790108755-2616b612b3bd?w=36&h=36&fit=crop&crop=face" alt="avatar" className="w-9 h-9 rounded-full border-2 border-white shadow" />
                  </div>
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[['8','Tasks','#EEF0FF','#5B4FE9'],['2','Meetings','#FFF4ED','#F97316'],['94%','Done','#ECFDF5','#10B981']].map(([v,l,bg,c])=>(
                      <div key={l} className="rounded-xl p-3 text-center" style={{background:bg}}>
                        <div className="font-display font-bold text-2xl leading-none mb-1" style={{color:c}}>{v}</div>
                        <div className="text-xs font-semibold" style={{color:c+'99'}}>{l}</div>
                      </div>
                    ))}
                  </div>
                  {/* Task list */}
                  <div className="bg-white rounded-xl p-3 mb-3 border border-gray-100">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Today's tasks</div>
                    {[['Design system review','done','#10B981'],['API documentation','in progress','#5B4FE9'],['Team retrospective','todo','#F97316']].map(([t,s,c])=>(
                      <div key={t} className="flex items-center gap-2.5 py-2 border-b border-gray-50 last:border-0">
                        <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center" style={{background: s==='done'? c :'transparent', border: s!=='done'? `2px solid ${c}50`:undefined}}>
                          {s==='done' && <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
                        </div>
                        <span className={`text-xs font-medium flex-1 ${s==='done'?'text-gray-400 line-through':'text-gray-700'}`}>{t}</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{background:c+'18',color:c}}>{s}</span>
                      </div>
                    ))}
                  </div>
                  {/* AI summary pill */}
                  <div className="bg-gradient-to-r from-violet-500 to-violet-700 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Brain size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="text-white text-xs font-bold">AI Summary ready</div>
                      <div className="text-white/70 text-xs">Monday standup · 3 action items extracted</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating chat bubble */}
              <div className="float-card2 absolute -left-4 top-16 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 p-3.5 w-52">
                <div className="flex items-center gap-2 mb-2">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=28&h=28&fit=crop&crop=face" alt="a" className="w-7 h-7 rounded-full" />
                  <div className="text-xs font-semibold text-gray-800">Arjun</div>
                  <div className="ml-auto text-[10px] text-gray-400">now</div>
                </div>
                <div className="bg-violet-50 rounded-xl rounded-tl-none px-3 py-2 text-xs text-violet-800 font-medium">
                  Reviewed your PR! Looks 🔥
                </div>
              </div>

              {/* Floating task card */}
              <div className="absolute -right-4 bottom-12 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 p-3.5 w-48" style={{animation:'floatCard 7s ease-in-out infinite 2s'}}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div className="text-xs font-bold text-gray-800">Task done!</div>
                </div>
                <div className="text-xs text-gray-500 mb-2">API integration merged</div>
                <div className="flex items-center gap-1">
                  {['#5B4FE9','#F97316','#10B981'].map((c,i)=>(
                    <div key={i} className="w-5 h-5 rounded-full border-2 border-white -ml-1 first:ml-0" style={{background:c}} />
                  ))}
                  <span className="text-[10px] text-gray-400 ml-1.5">3 members</span>
                </div>
              </div>

              {/* Live users pill */}
              <div className="absolute top-6 right-0 z-20 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-emerald-700">12 members online</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          COMPANIES MARQUEE
      ══════════════════════════════════════ */}
      <section className="py-12 border-y border-gray-100 bg-white overflow-hidden">
        <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Trusted by teams at</p>
        <div className="overflow-hidden">
          <div className="marquee-track">
            {[...COMPANIES, ...COMPANIES].map((c, i) => (
              <div key={i} className="flex items-center gap-3 mx-10 cursor-default whitespace-nowrap group">
                <img
                  src={c.logo}
                  alt={c.name}
                  className="w-7 h-7 rounded-lg object-contain grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                  onError={e => { e.target.style.display='none' }}
                />
                <span className="text-base font-semibold text-gray-400 group-hover:text-gray-700 transition-colors duration-300">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES
      ══════════════════════════════════════ */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="badge-brand mb-4 inline-block">Everything you need</span>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold text-gray-900 mb-4">
            One platform.<br />Infinite possibilities.
          </h2>
          <p className="text-xl text-gray-500 max-w-xl mx-auto">Stop juggling five tools. TaskFlow brings chat, tasks, meetings and AI into a single seamless workspace.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className="group bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-200 hover:-translate-y-1 transition-all duration-300 cursor-default"
              style={{ boxShadow:'0 0 0 1px rgba(91,79,233,0.04), 0 2px 8px rgba(91,79,233,0.04)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110" style={{ background: bg }}>
                <Icon size={22} style={{ color }} />
              </div>
              <h3 className="font-display font-semibold text-xl text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          PRODUCT SCREENSHOT SECTION
      ══════════════════════════════════════ */}
      <section className="py-16 bg-gradient-to-br from-violet-600 to-violet-900 overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.15) 1px,transparent 1px)', backgroundSize:'28px 28px' }} />
        <div className="max-w-7xl mx-auto px-6 text-center relative">
          <span className="inline-block text-violet-300 font-semibold text-sm mb-4">See it in action</span>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold text-white mb-4">
            Beautiful by default.<br />Powerful by design.
          </h2>
          <p className="text-violet-200 text-lg mb-12 max-w-lg mx-auto">Every pixel crafted for focus and clarity — so your team spends time on work, not fighting tools.</p>

          {/* Screenshot cards row */}
          <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {[
              { title:'Team Chat', img:'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=400&h=260&fit=crop', tag:'Real-time' },
              { title:'Task Board', img:'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=260&fit=crop', tag:'Kanban + AI' },
              { title:'Video Call', img:'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=260&fit=crop', tag:'HD · AI notes' },
            ].map(({ title, img, tag }) => (
              <div key={title} className="group relative rounded-2xl overflow-hidden bg-white/10 border border-white/20 hover:border-white/40 transition-all">
                <img src={img} alt={title} className="w-full h-44 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                  <span className="text-white font-semibold">{title}</span>
                  <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full font-medium backdrop-blur">{tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="badge-brand mb-4 inline-block">Simple to start</span>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold text-gray-900 mb-4">Up and running in minutes</h2>
          <p className="text-xl text-gray-500">No lengthy onboarding. No hidden complexity. Just sign up and go.</p>
        </div>
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%-1px)] right-[calc(16.67%-1px)] h-px bg-gradient-to-r from-violet-200 via-violet-400 to-violet-200" />
          <div className="grid md:grid-cols-3 gap-10">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="text-center">
                <div className="w-20 h-20 bg-violet-50 border-2 border-violet-200 rounded-2xl flex items-center justify-center mx-auto mb-5 relative z-10 bg-white">
                  <span className="font-display font-bold text-2xl text-violet-600">{num}</span>
                </div>
                <h3 className="font-display font-semibold text-xl text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════ */}
      <section id="testimonials" className="py-16 bg-gray-50 overflow-hidden">
        <div className="text-center mb-12 px-6">
          <span className="badge-brand mb-4 inline-block">Loved by teams</span>
          <h2 className="font-display text-4xl font-semibold text-gray-900 mb-3">Don't just take our word for it</h2>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_,i) => <Star key={i} size={18} fill="#F59E0B" className="text-amber-400" />)}
            <span className="ml-2 font-semibold text-gray-700">4.9 / 5</span>
          </div>
          <p className="text-gray-500">from 2,400+ teams worldwide</p>
        </div>

        <div className="overflow-hidden mb-4">
          <div className="marquee-track gap-4 px-4">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <div key={i} className="w-72 flex-shrink-0 bg-white rounded-2xl p-5 border border-gray-100 mx-2"
                style={{ boxShadow:'0 2px 12px rgba(91,79,233,0.06)' }}>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_,j) => <Star key={j} size={12} fill="#F59E0B" className="text-amber-400" />)}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="marquee-trackR gap-4 px-4">
            {[...TESTIMONIALS, ...TESTIMONIALS].reverse().map((t, i) => (
              <div key={i} className="w-72 flex-shrink-0 bg-white rounded-2xl p-5 border border-gray-100 mx-2"
                style={{ boxShadow:'0 2px 12px rgba(91,79,233,0.06)' }}>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_,j) => <Star key={j} size={12} fill="#F59E0B" className="text-amber-400" />)}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PRICING
      ══════════════════════════════════════ */}
      <section id="pricing" className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="badge-brand mb-4 inline-block">Simple pricing</span>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold text-gray-900 mb-4">Start free. Scale when ready.</h2>
          <p className="text-xl text-gray-500">No surprises. Cancel anytime. Indian pricing in ₹.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {PLANS.map(p => (
            <div key={p.name} className={`rounded-2xl p-7 border relative ${p.highlight
              ? 'bg-violet-600 border-violet-500 text-white shadow-brand'
              : 'bg-white border-gray-100'}`}
              style={p.highlight ? {} : { boxShadow:'0 0 0 1px rgba(91,79,233,0.05), 0 2px 12px rgba(91,79,233,0.06)' }}>
              {p.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  Most popular
                </div>
              )}
              <div className={`text-sm font-bold mb-1 ${p.highlight ? 'text-violet-200' : 'text-gray-500'}`}>{p.name}</div>
              <div className={`font-display text-4xl font-bold mb-1 ${p.highlight ? 'text-white' : 'text-gray-900'}`}>
                {p.price}<span className={`text-lg font-medium ${p.highlight ? 'text-violet-300' : 'text-gray-400'}`}>{p.period}</span>
              </div>
              <p className={`text-sm mb-6 ${p.highlight ? 'text-violet-200' : 'text-gray-500'}`}>{p.desc}</p>
              <Link to={p.href}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm mb-6 transition-all ${p.highlight
                  ? 'bg-white text-violet-700 hover:bg-violet-50'
                  : 'btn-primary'}`}>
                {p.cta} <ChevronRight size={15} />
              </Link>
              <ul className="space-y-2.5">
                {p.features.map(f => (
                  <li key={f} className={`flex items-center gap-2.5 text-sm ${p.highlight ? 'text-violet-100' : 'text-gray-600'}`}>
                    <Check size={14} className={p.highlight ? 'text-violet-300' : 'text-violet-500'} strokeWidth={3} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-violet-600 to-violet-900 rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.2) 1px,transparent 1px)', backgroundSize:'24px 24px' }} />
          <div className="relative">
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_,i) => <Star key={i} size={18} fill="#FCD34D" className="text-amber-300" />)}
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-semibold text-white mb-4 leading-tight">
              Ready to transform<br />how your team works?
            </h2>
            <p className="text-violet-200 text-lg mb-8 max-w-xl mx-auto">Join 10,000+ teams already using TaskFlow. Free forever on Starter plan.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-white text-violet-700 font-bold text-base px-8 py-3.5 rounded-xl hover:bg-violet-50 transition-colors shadow-lg">
                Get started for free <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold text-base px-8 py-3.5 rounded-xl hover:bg-white/20 transition-colors border border-white/20">
                Sign in to your account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          LOCATION + MAP — Noida Sector 44
      ══════════════════════════════════════ */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="badge-brand mb-4 inline-block">Our Office</span>
            <h2 className="font-display text-4xl font-semibold text-gray-900 mb-3">Come say hello</h2>
            <p className="text-gray-500 text-lg">We're based in the heart of India's tech hub — Noida, Uttar Pradesh.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left: address + contact info */}
            <div className="space-y-6">
              {/* Address card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100" style={{ boxShadow:'0 0 0 1px rgba(91,79,233,0.05), 0 4px 16px rgba(91,79,233,0.06)' }}>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B4FE9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">TaskFlow HQ</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      B-47, Sector 44,<br />
                      Noida, Uttar Pradesh 201303<br />
                      India
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact details */}
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B4FE9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.22 2.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.14a16 16 0 006.95 6.95l1.41-1.41a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>, label: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210' },
                  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B4FE9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, label: 'Email', value: 'hello@taskflow.io', href: 'mailto:hello@taskflow.io' },
                  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B4FE9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>, label: 'Office Hours', value: 'Mon–Fri, 9am – 7pm IST', href: null },
                  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B4FE9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, label: 'Remote First', value: 'Distributed across India', href: null },
                ].map(({ icon, label, value, href }) => (
                  <div key={label} className="bg-white rounded-xl p-4 border border-gray-100 flex items-start gap-3">
                    <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center flex-shrink-0">{icon}</div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</div>
                      {href
                        ? <a href={href} className="text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors">{value}</a>
                        : <div className="text-sm font-medium text-gray-700">{value}</div>
                      }
                    </div>
                  </div>
                ))}
              </div>

              {/* Nearby landmarks */}
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
                <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-2">Nearby Landmarks</p>
                <div className="space-y-1.5 text-sm text-violet-800">
                  {['5 min walk from Sector 44 Metro Station (Aqua Line)','Near Noida Authority Office','Opposite Wave City Centre Mall'].map(l => (
                    <div key={l} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-violet-400 rounded-full flex-shrink-0" />
                      {l}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Google Maps embed */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-lg" style={{ height: '460px' }}>
              {/* Map header bar */}
              <div className="absolute top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur px-4 py-3 flex items-center gap-3 border-b border-gray-100">
                <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3" fill="white"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Sector 44, Noida</div>
                  <div className="text-xs text-gray-400">Uttar Pradesh, India — 201303</div>
                </div>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=Sector+44,+Noida,+Uttar+Pradesh,+India"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
                  Get Directions
                </a>
              </div>

              {/* Actual Google Maps iframe — Noida Sector 44 */}
              <iframe
                title="TaskFlow Office — Sector 44, Noida"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.3836783289!2d77.35167637524687!3d28.567398875697!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5a5555555b3%3A0x5e12bde9d2c55b43!2sSector%2044%2C%20Noida%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1712850000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, marginTop: '56px', height: 'calc(100% - 56px)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          RICH FOOTER
      ══════════════════════════════════════ */}
      <footer className="bg-gray-950 text-white">

        {/* Top newsletter strip */}
        <div className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <h4 className="font-display font-semibold text-lg mb-1">Stay in the loop</h4>
              <p className="text-gray-400 text-sm">Product updates, tips, and early feature access.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="email"
                placeholder="you@company.com"
                className="flex-1 sm:w-64 bg-white/10 border border-white/15 text-white placeholder:text-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
              <button className="bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Main footer grid */}
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10">

            {/* Brand column */}
            <div className="col-span-2">
              <Logo size="md" className="mb-5 [&_span]:text-white [&_span.text-violet-600]:text-violet-400" />
              <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
                The all-in-one AI workspace for modern teams. Chat, tasks, video, and summaries — all in one place.
              </p>
              {/* Social links */}
              <div className="flex items-center gap-3">
                {[
                  { label: 'Twitter/X', href: '#', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.631L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                  { label: 'LinkedIn',  href: '#', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg> },
                  { label: 'GitHub',    href: '#', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg> },
                  { label: 'YouTube',   href: '#', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" fill="white"/></svg> },
                ].map(({ label, href, icon }) => (
                  <a key={label} href={href} aria-label={label}
                    className="w-9 h-9 bg-white/8 hover:bg-violet-600 border border-white/10 hover:border-violet-500 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200">
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Links columns */}
            {[
              { heading: 'Product',  links: ['Features','Pricing','Changelog','Roadmap','Status','API Docs'] },
              { heading: 'Company',  links: ['About Us','Blog','Careers','Press Kit','Partners','Contact'] },
              { heading: 'Legal',    links: ['Privacy Policy','Terms of Service','Cookie Policy','GDPR','Security','Accessibility'] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{heading}</h5>
                <ul className="space-y-3">
                  {links.map(l => (
                    <li key={l}>
                      <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} TaskFlow Technologies Pvt. Ltd. — Made with ♥ in Noida, India.
            </p>
            <div className="flex items-center gap-6 text-xs text-gray-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse inline-block" />
                All systems operational
              </span>
              <span>v1.0.0 — Phase 1</span>
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                SOC 2 compliant
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
