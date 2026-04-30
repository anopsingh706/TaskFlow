import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, MessageSquare, CheckSquare, Video, Settings, LogOut, X, Wifi, WifiOff, CreditCard } from 'lucide-react'
import { useAuth }   from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import Avatar from '../ui/Avatar'
import Logo   from '../ui/Logo'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', soon: false },
  { to: '/chat',      icon: MessageSquare,   label: 'Chat',      soon: false },
  { to: '/tasks',     icon: CheckSquare,     label: 'Tasks',     soon: false },
  { to: '/meetings',  icon: Video,           label: 'Meetings',  soon: false },
  { to: '/pricing',   icon: CreditCard,      label: 'Pricing',   soon: false },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout }  = useAuth()
  const { connected }     = useSocket()
  const navigate          = useNavigate()

  const handleLogout = async () => { await logout(); navigate('/') }

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-30
      flex flex-col w-64 h-full bg-white border-r border-gray-100
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <Logo size="md" />
        <div className="flex items-center gap-2">
          <span title={connected ? 'Connected' : 'Reconnecting...'}>
            {connected
              ? <Wifi size={14} className="text-emerald-500" />
              : <WifiOff size={14} className="text-gray-300 animate-pulse" />}
          </span>
          <button onClick={onClose} className="lg:hidden btn-ghost p-1.5"><X size={18} /></button>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-none">
        {NAV.map(({ to, icon: Icon, label, soon }) =>
          soon ? (
            <div key={label} className="nav-item opacity-40 cursor-not-allowed select-none">
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-semibold">Soon</span>
            </div>
          ) : (
            <NavLink key={to} to={to}
              end={to !== '/chat' && to !== '/tasks' && to !== '/meetings'}
              onClick={onClose}
              className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          )
        )}
      </nav>

      <div className="px-3 pb-4 border-t border-gray-100 pt-3 space-y-0.5">
        <NavLink to="/profile"
          className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}
          onClick={onClose}>
          <Avatar user={user} size={22} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.plan || 'Free'}</p>
          </div>
        </NavLink>
        <NavLink to="/profile" className="nav-item" onClick={onClose}>
          <Settings size={18} /><span>Settings</span>
        </NavLink>
        <button onClick={handleLogout} className="nav-item w-full text-left text-red-500 hover:text-red-600 hover:bg-red-50">
          <LogOut size={18} /><span>Log out</span>
        </button>
      </div>
    </aside>
  )
}
