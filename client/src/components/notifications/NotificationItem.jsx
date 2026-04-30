import { Bell, MessageSquare, CheckSquare, Video, AtSign, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useNavigate } from 'react-router-dom'

const TYPE_CONFIG = {
  mention:         { icon: AtSign,       color: 'text-violet-600', bg: 'bg-violet-50'  },
  task_assigned:   { icon: CheckSquare,  color: 'text-emerald-600',bg: 'bg-emerald-50' },
  meeting_summary: { icon: Video,        color: 'text-orange-500', bg: 'bg-orange-50'  },
  meeting_invite:  { icon: Video,        color: 'text-blue-500',   bg: 'bg-blue-50'    },
  new_message:     { icon: MessageSquare,color: 'text-violet-600', bg: 'bg-violet-50'  },
}

export default function NotificationItem({ notification, onMarkRead, onDelete }) {
  const navigate = useNavigate()
  const cfg = TYPE_CONFIG[notification.type] || { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-50' }
  const Icon = cfg.icon

  const handleClick = () => {
    if (!notification.isRead) onMarkRead(notification._id)
    if (notification.link) navigate(notification.link)
  }

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors group relative
        ${!notification.isRead ? 'bg-violet-50/50' : ''}`}
      onClick={handleClick}
    >
      {/* Unread dot */}
      {!notification.isRead && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-violet-500 rounded-full" />
      )}

      {/* Icon */}
      <div className={`w-8 h-8 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon size={14} className={cfg.color} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${notification.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
          <span className="font-semibold">{notification.title}</span>
        </p>
        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{notification.content}</p>
        <p className="text-[10px] text-gray-400 mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>

      {/* Delete btn */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(notification._id) }}
        className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-gray-500 rounded-lg transition-all flex-shrink-0"
      >
        <X size={13} />
      </button>
    </div>
  )
}
