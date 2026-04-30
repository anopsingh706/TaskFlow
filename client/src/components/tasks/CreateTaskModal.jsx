import { useState, useEffect } from 'react'
import { X, Sparkles, Loader2, Calendar, User, Tag, AlignLeft } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useTasks }  from '../../context/TaskContext'
import { authAPI }   from '../../api/auth'
import { aiAPI }     from '../../api/tasks'
import Avatar from '../ui/Avatar'
import toast  from 'react-hot-toast'

const PRIORITIES = [
  { value: 'high',   label: 'High',   color: 'text-red-600    bg-red-50    ring-red-200'     },
  { value: 'medium', label: 'Medium', color: 'text-amber-600  bg-amber-50  ring-amber-200'   },
  { value: 'low',    label: 'Low',    color: 'text-emerald-600 bg-emerald-50 ring-emerald-200' },
]

export default function CreateTaskModal({ open, onClose, prefillStatus }) {
  const { createTask } = useTasks()

  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium',
    status: prefillStatus || 'todo', dueDate: null,
    assignedTo: '', tags: '',
  })
  const [aiLoading, setAiLoading]     = useState(false)
  const [aiResult, setAiResult]       = useState(null)
  const [saving, setSaving]           = useState(false)
  const [users, setUsers]             = useState([])
  const [userSearch, setUserSearch]   = useState('')
  const [showUserDrop, setShowUserDrop] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    if (open) {
      setForm({ title:'', description:'', priority:'medium', status: prefillStatus||'todo', dueDate:null, assignedTo:'', tags:'' })
      setAiResult(null); setSelectedUser(null); setUserSearch('')
    }
  }, [open, prefillStatus])

  // Debounced user search
  useEffect(() => {
    if (!userSearch.trim()) { setUsers([]); return }
    const t = setTimeout(async () => {
      try {
        const { data } = await authAPI.getUsers(userSearch)
        setUsers(data.users || [])
      } catch { setUsers([]) }
    }, 300)
    return () => clearTimeout(t)
  }, [userSearch])

  const handleAISuggest = async () => {
    if (!form.title.trim()) { toast.error('Enter a title first'); return }
    setAiLoading(true)
    try {
      const { data } = await aiAPI.suggestPriority(form.title, form.description)
      setAiResult(data)
      toast.success(`🤖 AI suggests: ${data.priority.toUpperCase()} priority`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI service unavailable')
    } finally { setAiLoading(false) }
  }

  const applyAISuggestion = () => {
    setForm(f => ({ ...f, priority: aiResult.priority }))
    toast.success('Priority applied!')
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
      await createTask({
        title:               form.title.trim(),
        description:         form.description.trim(),
        priority:            form.priority,
        status:              form.status,
        dueDate:             form.dueDate,
        assignedTo:          selectedUser?._id || null,
        tags,
        aiSuggestedPriority: aiResult?.priority || null,
        aiReason:            aiResult?.reason   || '',
      })
      toast.success('Task created!')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task')
    } finally { setSaving(false) }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-display font-semibold text-gray-900 text-lg">New Task</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 text-gray-400"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="input-label">Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
              placeholder="What needs to be done?"
              className="input" autoFocus maxLength={200} />
          </div>

          {/* Description */}
          <div>
            <label className="input-label flex items-center gap-1.5">
              <AlignLeft size={13} className="text-gray-400" /> Description
            </label>
            <textarea value={form.description}
              onChange={e => setForm(f => ({...f, description: e.target.value}))}
              placeholder="Add more details…"
              rows={3} maxLength={2000}
              className="input resize-none" />
          </div>

          {/* Priority + AI */}
          <div>
            <label className="input-label">Priority</label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRIORITIES.map(p => (
                <button key={p.value} onClick={() => setForm(f => ({...f, priority: p.value}))}
                  className={`badge ring-1 text-xs font-semibold cursor-pointer transition-all
                    ${form.priority === p.value ? p.color : 'bg-gray-50 text-gray-500 ring-gray-200 hover:ring-gray-300'}`}>
                  {p.label}
                </button>
              ))}

              {/* AI Suggest button */}
              <button onClick={handleAISuggest} disabled={aiLoading || !form.title.trim()}
                className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700
                           bg-violet-50 hover:bg-violet-100 border border-violet-200 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50">
                {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Ask AI
              </button>
            </div>

            {/* AI result card */}
            {aiResult && (
              <div className="mt-3 bg-violet-50 border border-violet-200 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-violet-700">🤖 Gemini AI suggests:</span>
                  <span className={`badge text-[10px] ring-1 ${PRIORITIES.find(p=>p.value===aiResult.priority)?.color}`}>
                    {aiResult.priority?.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-violet-500">({Math.round((aiResult.confidence||0)*100)}% confident)</span>
                </div>
                <p className="text-xs text-violet-600 mb-2 italic">"{aiResult.reason}"</p>
                {aiResult.priority !== form.priority && (
                  <button onClick={applyAISuggestion}
                    className="text-xs font-semibold text-violet-700 hover:text-violet-800 underline">
                    Apply this suggestion →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="input-label">Status</label>
            <div className="flex gap-2">
              {[['todo','To Do'],['in_progress','In Progress'],['done','Done']].map(([val, lbl]) => (
                <button key={val} onClick={() => setForm(f => ({...f, status: val}))}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors
                    ${form.status === val
                      ? val === 'todo' ? 'bg-gray-100 border-gray-300 text-gray-800'
                        : val === 'in_progress' ? 'bg-violet-50 border-violet-300 text-violet-800'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {/* Assignee */}
          <div className="relative">
            <label className="input-label flex items-center gap-1.5">
              <User size={13} className="text-gray-400" /> Assign to
            </label>
            {selectedUser ? (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <Avatar user={selectedUser} size={26} />
                <span className="text-sm font-medium text-gray-800 flex-1">{selectedUser.name}</span>
                <button onClick={() => { setSelectedUser(null); setUserSearch('') }}
                  className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
              </div>
            ) : (
              <input value={userSearch}
                onChange={e => { setUserSearch(e.target.value); setShowUserDrop(true) }}
                onFocus={() => setShowUserDrop(true)}
                placeholder="Search team member…"
                className="input" />
            )}
            {showUserDrop && users.length > 0 && !selectedUser && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                {users.map(u => (
                  <button key={u._id} onClick={() => { setSelectedUser(u); setShowUserDrop(false); setUserSearch('') }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 text-left">
                    <Avatar user={u} size={26} />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Due date */}
          <div>
            <label className="input-label flex items-center gap-1.5">
              <Calendar size={13} className="text-gray-400" /> Due date
            </label>
            <DatePicker
              selected={form.dueDate}
              onChange={date => setForm(f => ({...f, dueDate: date}))}
              minDate={new Date()}
              dateFormat="MMM d, yyyy"
              placeholderText="Pick a due date…"
              className="input w-full"
              wrapperClassName="w-full"
              isClearable
            />
          </div>

          {/* Tags */}
          <div>
            <label className="input-label flex items-center gap-1.5">
              <Tag size={13} className="text-gray-400" /> Tags <span className="text-gray-400 font-normal">(comma separated)</span>
            </label>
            <input value={form.tags}
              onChange={e => setForm(f => ({...f, tags: e.target.value}))}
              placeholder="frontend, bug, urgent"
              className="input" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <button onClick={onClose} className="btn-secondary !px-4 !py-2 !text-sm">Cancel</button>
          <button onClick={handleSubmit} disabled={saving || !form.title.trim()}
            className="btn-primary !px-5 !py-2 !text-sm">
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            Create task
          </button>
        </div>
      </div>
    </div>
  )
}
