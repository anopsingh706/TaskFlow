import { useState, useEffect } from 'react'
import { X, Video, Calendar, Users, Search, Check, Loader2 } from 'lucide-react'
import DatePicker from 'react-datepicker'
import { authAPI } from '../../api/auth'
import Avatar from '../ui/Avatar'

export default function CreateMeetingModal({ open, onClose, onCreate }) {
  const [title, setTitle]           = useState('')
  const [scheduled, setScheduled]   = useState(null)
  const [search, setSearch]         = useState('')
  const [users, setUsers]           = useState([])
  const [invited, setInvited]       = useState([])
  const [loading, setLoading]       = useState(false)

  useEffect(() => { if (open) { setTitle(''); setScheduled(null); setInvited([]); setSearch('') } }, [open])

  useEffect(() => {
    if (!search.trim()) { setUsers([]); return }
    const t = setTimeout(async () => {
      try { const { data } = await authAPI.getUsers(search); setUsers(data.users || []) } catch { setUsers([]) }
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  const toggle = (u) => setInvited(prev => prev.find(i => i._id === u._id) ? prev.filter(i => i._id !== u._id) : [...prev, u])

  const handleCreate = async () => {
    setLoading(true)
    try {
      await onCreate({
        title: title.trim() || `Meeting – ${new Date().toLocaleDateString()}`,
        scheduledFor: scheduled,
        inviteUserIds: invited.map(u => u._id),
      })
    } finally { setLoading(false) }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-display font-semibold text-gray-900 text-lg flex items-center gap-2">
            <Video size={18} className="text-violet-600" /> New Meeting
          </h2>
          <button onClick={onClose} className="btn-ghost p-1.5 text-gray-400"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="input-label">Meeting title</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Sprint Planning, Design Review…"
              className="input" autoFocus maxLength={100} />
          </div>

          <div>
            <label className="input-label flex items-center gap-1.5"><Calendar size={13} className="text-gray-400" /> Schedule for later <span className="text-gray-400 font-normal">(optional)</span></label>
            <DatePicker
              selected={scheduled}
              onChange={setScheduled}
              showTimeSelect
              dateFormat="MMM d, yyyy h:mm aa"
              minDate={new Date()}
              placeholderText="Start now (instant meeting)"
              className="input w-full"
              wrapperClassName="w-full"
              isClearable
            />
          </div>

          <div>
            <label className="input-label flex items-center gap-1.5"><Users size={13} className="text-gray-400" /> Invite team members</label>
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name…" className="input pl-9" />
            </div>
            {users.length > 0 && (
              <div className="mt-2 border border-gray-100 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                {users.map(u => {
                  const isInv = invited.find(i => i._id === u._id)
                  return (
                    <button key={u._id} onClick={() => toggle(u)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 text-left">
                      <Avatar user={u} size={26} />
                      <span className="text-sm font-medium text-gray-800 flex-1">{u.name}</span>
                      {isInv && <Check size={14} className="text-violet-600" />}
                    </button>
                  )
                })}
              </div>
            )}
            {invited.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {invited.map(u => (
                  <span key={u._id} className="flex items-center gap-1.5 bg-violet-50 text-violet-700 text-xs font-medium px-2.5 py-1 rounded-full border border-violet-200">
                    {u.name.split(' ')[0]}
                    <button onClick={() => toggle(u)}><X size={11} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="btn-secondary !px-4 !py-2 !text-sm">Cancel</button>
          <button onClick={handleCreate} disabled={loading} className="btn-primary !px-5 !py-2 !text-sm">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Video size={14} />}
            {scheduled ? 'Schedule Meeting' : 'Start Now'}
          </button>
        </div>
      </div>
    </div>
  )
}
