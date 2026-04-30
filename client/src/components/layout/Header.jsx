import { Menu, Search } from 'lucide-react'
import { useAuth }    from '../../context/AuthContext'
import { useLocation } from 'react-router-dom'
import NotificationBell from '../notifications/NotificationBell'

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard',  subtitle: 'Your workspace overview' },
  '/chat':      { title: 'Chat',       subtitle: 'Messages & channels'     },
  '/tasks':     { title: 'Tasks',      subtitle: 'Your work board'         },
  '/meetings':  { title: 'Meetings',   subtitle: 'Video & AI summaries'    },
  '/profile':   { title: 'Settings',   subtitle: 'Account & preferences'   },
}

export default function Header({ onMenuClick }) {
  const { user }   = useAuth()
  const location   = useLocation()
  const page       = PAGE_TITLES[location.pathname] || { title: 'TaskFlow', subtitle: '' }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <header className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-gray-100 bg-white flex-shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden btn-ghost p-2" aria-label="Open menu">
          <Menu size={20} />
        </button>
        <div>
          <h1 className="font-display font-semibold text-gray-900 text-lg leading-tight">
            {location.pathname === '/dashboard'
              ? `${greeting()}, ${user?.name?.split(' ')[0]} 👋`
              : page.title}
          </h1>
          {page.subtitle && <p className="text-xs text-gray-400 leading-tight mt-0.5">{page.subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button className="btn-ghost p-2 hidden sm:flex" aria-label="Search">
          <Search size={18} />
        </button>
        {/* Real-time notification bell */}
        <NotificationBell />
      </div>
    </header>
  )
}
