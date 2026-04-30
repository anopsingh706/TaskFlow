import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, CheckCheck, Loader2, BellOff } from 'lucide-react'
import { notificationAPI } from '../../api/meetings'
import { useSocket } from '../../context/SocketContext'
import NotificationItem from './NotificationItem'
import toast from 'react-hot-toast'

export default function NotificationBell() {
  const { on, off }                           = useSocket()
  const [notifications, setNotifications]     = useState([])
  const [unreadCount, setUnreadCount]         = useState(0)
  const [open, setOpen]                       = useState(false)
  const [loading, setLoading]                 = useState(false)
  const dropdownRef                           = useRef(null)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await notificationAPI.getAll()
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch { /* silent fail */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  // Real-time notification via socket
  useEffect(() => {
    const handleNotif = (notif) => {
      setNotifications(prev => [notif, ...prev])
      setUnreadCount(prev => prev + 1)
      // Show toast for new notifications
      toast(notif.content, {
        icon: '🔔',
        duration: 4000,
      })
    }
    on('notification', handleNotif)
    return () => off('notification', handleNotif)
  }, [on, off])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch { /* silent */ }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch { /* silent */ }
  }

  const handleDelete = async (id) => {
    const wasUnread = notifications.find(n => n._id === id)?.isRead === false
    try {
      await notificationAPI.delete(id)
      setNotifications(prev => prev.filter(n => n._id !== id))
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1))
    } catch { /* silent */ }
  }

  const handleOpen = () => {
    setOpen(v => !v)
    if (!open) fetchNotifications()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button onClick={handleOpen}
        className={`relative p-2 rounded-xl transition-colors ${open ? 'bg-violet-50 text-violet-600' : 'btn-ghost text-gray-500'}`}>
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-scale-in"
          style={{ boxShadow:'0 8px 40px rgba(91,79,233,0.15),0 0 0 1px rgba(91,79,233,0.06)' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="badge-brand text-[10px] px-2 py-0.5">{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors">
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={20} className="text-violet-400 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <BellOff size={28} className="text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-400">All caught up!</p>
                <p className="text-xs text-gray-300 mt-1">No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => (
                <NotificationItem
                  key={notif._id}
                  notification={notif}
                  onMarkRead={handleMarkRead}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
