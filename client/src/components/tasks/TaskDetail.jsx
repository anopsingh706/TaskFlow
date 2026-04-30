import { useState } from 'react'
import { X, Calendar, User2, Tag, Sparkles, Trash2, Loader2, MessageSquare } from 'lucide-react'
import DatePicker from 'react-datepicker'
import { format } from 'date-fns'
import { aiAPI }  from '../../api/tasks'
import { authAPI } from '../../api/auth'
import Avatar from '../ui/Avatar'
import toast  from 'react-hot-toast'

const PRIORITY_CONFIG = {
  high:   { label: 'High',   color: 'text-red-600 bg-red-50 ring-1 ring-red-200'            },
  medium: { label: 'Medium', color: 'text-amber-600 bg-amber-50 ring-1 ring-amber-200'      },
  low:    { label: 'Low',    color: 'text-emerald-600 bg-emerald-50 ring-1 ring-emerald-200' },
}

export default function TaskDetailModal({ task, open, onClose, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({ title: task.title, description: task.description, priority: task.priority, dueDate: task.dueDate ? new Date(task.dueDate) : null })
  const [saving, setSaving]   = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult]   = useState(null)
  const [comment, setComment]     = useState('')

  if (!open) return null

  const pri = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium

  const handleSave = async () => {
    setSaving(true)
    try {
      await onUpdate(task._id, { title: form.title.trim(), description: form.description.trim(), priority: form.priority, dueDate: form.dueDate })
      toast.success('Task updated')
      setEditing(false)
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  const handleAI = async () => {
    setAiLoading(true)
    try {
      const { data } = await aiAPI.suggestPriority(task.title, task.description)
      setAiResult(data)
    } catch { toast.error('AI unavailable') }
    finally { setAiLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`badge text-xs font-bold ${pri.color}`}>{pri.label}</span>
            {task.status === 'done' && <span className="badge bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 text-xs">Done</span>}
            {task.status === 'in_progress' && <span className="badge bg-violet-50 text-violet-700 ring-1 ring-violet-200 text-xs">In Progress</span>}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setEditing(v => !v)}
              className={`btn-ghost p-1.5 text-xs font-medium ${editing ? 'text-violet-600' : 'text-gray-400'}`}>
              {editing ? 'Cancel' : 'Edit'}
            </button>
            <button onClick={onClose} className="btn-ghost p-1.5 text-gray-400"><X size={16} /></button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Title */}
          {editing ? (
            <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
              className="input font-semibold text-base" autoFocus />
          ) : (
            <h3 className={`font-display font-semibold text-xl text-gray-900 leading-snug ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>
              {task.title}
            </h3>
          )}

          {/* Description */}
          {editing ? (
            <textarea value={form.description}
              onChange={e => setForm(f => ({...f, description: e.target.value}))}
              rows={4} className="input resize-none" placeholder="Add description…" />
          ) : (
            task.description && <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{task.description}</p>
          )}

          {/* Meta row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Priority (edit mode) */}
            {editing && (
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Priority</label>
                <div className="flex gap-1.5 flex-wrap">
                  {Object.entries(PRIORITY_CONFIG).map(([val, cfg]) => (
                    <button key={val} onClick={() => setForm(f => ({...f, priority: val}))}
                      className={`badge text-xs ring-1 cursor-pointer ${form.priority === val ? cfg.color : 'bg-gray-50 text-gray-500 ring-gray-200'}`}>
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Due date */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Calendar size={11} /> Due date
              </label>
              {editing ? (
                <DatePicker selected={form.dueDate} onChange={d => setForm(f => ({...f, dueDate: d}))}
                  dateFormat="MMM d, yyyy" className="input !py-1.5 !text-sm" isClearable placeholderText="No due date" />
              ) : (
                <p className="text-sm text-gray-700">{task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No due date'}</p>
              )}
            </div>

            {/* Assignee */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <User2 size={11} /> Assigned to
              </label>
              {task.assignedTo ? (
                <div className="flex items-center gap-2">
                  <Avatar user={task.assignedTo} size={22} />
                  <span className="text-sm text-gray-700">{task.assignedTo.name}</span>
                </div>
              ) : <p className="text-sm text-gray-400">Unassigned</p>}
            </div>

            {/* Created by */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Created by</label>
              <div className="flex items-center gap-2">
                <Avatar user={task.createdBy} size={22} />
                <span className="text-sm text-gray-700">{task.createdBy?.name}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {task.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map(t => (
                <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-medium">#{t}</span>
              ))}
            </div>
          )}

          {/* AI suggestion */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">AI Analysis</span>
              <button onClick={handleAI} disabled={aiLoading}
                className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-xl border border-violet-200 transition-colors disabled:opacity-50">
                {aiLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                Analyse with AI
              </button>
            </div>
            {aiResult ? (
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-xs">
                <p className="font-semibold text-violet-700 mb-1">
                  Suggested: <span className="uppercase">{aiResult.priority}</span>
                  <span className="ml-2 font-normal text-violet-500">({Math.round((aiResult.confidence||0)*100)}% confident)</span>
                </p>
                <p className="text-violet-600 italic">"{aiResult.reason}"</p>
              </div>
            ) : (
              <p className="text-xs text-gray-400">Click "Analyse with AI" to get a Gemini-powered priority suggestion.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <button onClick={() => onDelete(task._id)}
            className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors">
            <Trash2 size={13} /> Delete task
          </button>
          {editing && (
            <button onClick={handleSave} disabled={saving}
              className="btn-primary !px-5 !py-2 !text-sm">
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              Save changes
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
