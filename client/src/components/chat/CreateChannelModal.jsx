import { useState, useEffect } from 'react'
import { X, Hash, Search, Check, Loader2 } from 'lucide-react'
import { channelAPI } from '../../api/chat'
import { authAPI }    from '../../api/auth'
import { useAuth }    from '../../context/AuthContext'
import Avatar from '../ui/Avatar'
import toast  from 'react-hot-toast'

export default function CreateChannelModal({ open, onClose, onCreated }) {
  const { user }               = useAuth()
  const [name, setName]        = useState('')
  const [description, setDesc] = useState('')
  const [search, setSearch]    = useState('')
  const [users, setUsers]      = useState([])
  const [selected, setSelected]= useState([])
  const [loading, setLoading]  = useState(false)
  const [searching, setSearching] = useState(false)

  // Reset on open
  useEffect(() => {
    if (open) { setName(''); setDesc(''); setSearch(''); setSelected([]); setUsers([]) }
  }, [open])

  // Search users
  useEffect(() => {
    if (!search.trim()) { setUsers([]); return }
    setSearching(true)
    const timer = setTimeout(async () => {
      try {
        const { data } = await authAPI.getUsers(search)
        setUsers(data.users || [])
      } catch { setUsers([]) }
      finally { setSearching(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const toggleUser = (u) => {
    setSelected(prev =>
      prev.find(s => s._id === u._id)
        ? prev.filter(s => s._id !== u._id)
        : [...prev, u]
    )
  }

  const handleCreate = async () => {
    if (!name.trim()) { toast.error('Channel name is required'); return }
    setLoading(true)
    try {
      const { data } = await channelAPI.create({
        name: name.trim(),
        description: description.trim(),
        memberIds: selected.map(u => u._id),
      })
      toast.success(`#${data.channel.name} created!`)
      onCreated(data.channel)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create channel')
    } finally { setLoading(false) }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-display font-semibold text-gray-900 text-lg">Create a channel</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 text-gray-400 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Channel name */}
          <div>
            <label className="input-label">Channel name</label>
            <div className="relative">
              <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={name}
                onChange={e => setName(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                placeholder="e.g. design-team"
                maxLength={40}
                className="input pl-9"
                autoFocus
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Lowercase letters, numbers, and hyphens only</p>
          </div>

          {/* Description */}
          <div>
            <label className="input-label">Description <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              value={description}
              onChange={e => setDesc(e.target.value)}
              placeholder="What's this channel about?"
              maxLength={200}
              className="input"
            />
          </div>

          {/* Add members */}
          <div>
            <label className="input-label">Add members</label>
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="input pl-9"
              />
              {searching && <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
            </div>

            {/* Search results */}
            {users.length > 0 && (
              <div className="mt-2 border border-gray-100 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                {users.map(u => {
                  const isSel = selected.find(s => s._id === u._id)
                  return (
                    <button key={u._id} onClick={() => toggleUser(u)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 text-left transition-colors">
                      <Avatar user={u} size={28} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                      {isSel && <Check size={14} className="text-violet-600 flex-shrink-0" />}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Selected members chips */}
            {selected.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selected.map(u => (
                  <span key={u._id}
                    className="flex items-center gap-1.5 bg-violet-50 text-violet-700 text-xs font-medium px-2.5 py-1 rounded-full border border-violet-200">
                    {u.name.split(' ')[0]}
                    <button onClick={() => toggleUser(u)} className="hover:text-violet-900">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-400">
            {selected.length > 0 ? `${selected.length + 1} member${selected.length > 0 ? 's' : ''}` : 'Only you initially'}
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary !px-4 !py-2 !text-sm">Cancel</button>
            <button onClick={handleCreate} disabled={!name.trim() || loading} className="btn-primary !px-4 !py-2 !text-sm">
              {loading ? <Loader2 size={14} className="animate-spin" /> : null}
              Create channel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
