import { useState } from 'react'
import { Plus, Search, Hash, MessageCircle, Users, Loader2 } from 'lucide-react'
import { useAuth }   from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { channelAPI } from '../../api/chat'
import Avatar  from '../ui/Avatar'
import CreateChannelModal from './CreateChannelModal'
import { formatMessageTime } from '../../utils/helpers'

export default function ChatList({ channels, activeChannel, onSelect, onChannelCreated, loading, onRefresh }) {
  const { user }        = useAuth()
  const { onlineUsers } = useSocket()
  const [search, setSearch]   = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [dmSearch, setDmSearch]     = useState('')
  const [dmResults, setDmResults]   = useState([])
  const [dmTab, setDmTab]           = useState('channels') // 'channels' | 'dm'

  const filtered = channels.filter(c => {
    const name = getChannelName(c, user)
    return name.toLowerCase().includes(search.toLowerCase())
  })

  const groups = filtered.filter(c => c.type === 'group')
  const dms    = filtered.filter(c => c.type === 'dm')

  function getChannelName(ch, me) {
    if (ch.type === 'dm') {
      const other = ch.members?.find(m => m._id !== me?._id)
      return other?.name || 'Direct Message'
    }
    return ch.name || 'Unnamed channel'
  }

  function getChannelAvatar(ch, me) {
    if (ch.type === 'dm') {
      const other = ch.members?.find(m => m._id !== me?._id)
      return { type: 'user', user: other }
    }
    return { type: 'group' }
  }

  const handleDmSearch = async (val) => {
    setDmSearch(val)
    if (!val.trim()) { setDmResults([]); return }
    try {
      const { data } = await channelAPI.getAll() // user search endpoint
      // Use auth users search
      const resp = await import('../../api/auth').then(m => m.authAPI.getUsers(val))
      setDmResults(resp.data.users || [])
    } catch { setDmResults([]) }
  }

  const startDM = async (targetUser) => {
    try {
      const { data } = await channelAPI.getDM(targetUser._id)
      const exists = channels.find(c => c._id === data.channel._id)
      if (!exists) onChannelCreated(data.channel)
      onSelect(data.channel)
      setDmSearch(''); setDmResults([])
    } catch (err) { console.error(err) }
  }

  return (
    <div className="w-72 flex-shrink-0 flex flex-col border-r border-gray-100 bg-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-gray-900">Messages</h2>
          <button onClick={() => setShowCreate(true)}
            className="w-8 h-8 bg-violet-600 hover:bg-violet-700 text-white rounded-lg flex items-center justify-center transition-colors">
            <Plus size={16} />
          </button>
        </div>
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search channels..."
            className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50"
          />
        </div>
        {/* Tabs */}
        <div className="flex gap-1 mt-3">
          {['channels','dm'].map(t => (
            <button key={t} onClick={() => setDmTab(t)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors capitalize ${dmTab === t ? 'bg-violet-50 text-violet-700' : 'text-gray-500 hover:text-gray-700'}`}>
              {t === 'channels' ? '# Channels' : '💬 DMs'}
            </button>
          ))}
        </div>
      </div>

      {/* DM search bar */}
      {dmTab === 'dm' && (
        <div className="px-3 py-2 border-b border-gray-100">
          <input
            value={dmSearch} onChange={e => handleDmSearch(e.target.value)}
            placeholder="Find a person..."
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:border-violet-300"
          />
          {dmResults.length > 0 && (
            <div className="mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
              {dmResults.slice(0, 5).map(u => (
                <button key={u._id} onClick={() => startDM(u)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-left">
                  <Avatar user={u} size={28} />
                  <span className="text-sm font-medium text-gray-800">{u.name}</span>
                  {onlineUsers.has(u._id) && <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto py-2 scrollbar-none">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={20} className="text-violet-400 animate-spin" />
          </div>
        ) : (
          <>
            {dmTab === 'channels' && (
              <>
                {groups.length === 0 && (
                  <p className="text-center text-xs text-gray-400 py-6">No channels yet.<br/>Create one with the + button.</p>
                )}
                {groups.map(ch => (
                  <ChannelRow key={ch._id} channel={ch} user={user} active={activeChannel?._id === ch._id}
                    onSelect={onSelect} onlineUsers={onlineUsers} getName={getChannelName} getAvatar={getChannelAvatar} />
                ))}
              </>
            )}
            {dmTab === 'dm' && (
              <>
                {dms.length === 0 && !dmSearch && (
                  <p className="text-center text-xs text-gray-400 py-6">No DMs yet.<br/>Search for someone above.</p>
                )}
                {dms.map(ch => (
                  <ChannelRow key={ch._id} channel={ch} user={user} active={activeChannel?._id === ch._id}
                    onSelect={onSelect} onlineUsers={onlineUsers} getName={getChannelName} getAvatar={getChannelAvatar} />
                ))}
              </>
            )}
          </>
        )}
      </div>

      <CreateChannelModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(ch) => { onChannelCreated(ch); setShowCreate(false) }}
      />
    </div>
  )
}

function ChannelRow({ channel, user, active, onSelect, onlineUsers, getName, getAvatar }) {
  const name    = getName(channel, user)
  const avProps = getAvatar(channel, user)
  const isOnline = avProps.type === 'user' && onlineUsers.has(avProps.user?._id)
  const unread  = channel.unreadCounts?.[user?._id] || 0

  return (
    <button onClick={() => onSelect(channel)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors group
        ${active ? 'bg-violet-50' : 'hover:bg-gray-50'}`}>
      {/* Icon / Avatar */}
      <div className="relative flex-shrink-0">
        {avProps.type === 'user'
          ? <Avatar user={avProps.user} size={34} />
          : (
            <div className="w-[34px] h-[34px] bg-gray-100 rounded-xl flex items-center justify-center">
              <Hash size={16} className="text-gray-500" />
            </div>
          )
        }
        {isOnline && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
        )}
      </div>

      {/* Name + preview */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={`text-sm truncate ${active ? 'font-semibold text-violet-800' : 'font-medium text-gray-800'}`}>
            {name}
          </span>
          {channel.lastMessage?.createdAt && (
            <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">
              {formatMessageTime(channel.lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-gray-400 truncate flex-1">
            {channel.lastMessage?.content || 'No messages yet'}
          </p>
          {unread > 0 && (
            <span className="ml-2 min-w-[18px] h-[18px] bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 flex-shrink-0">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
