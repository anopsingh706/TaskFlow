import { useState } from 'react'
import { Calendar, MoreVertical, Trash2, Edit2, ArrowRight, Loader2 } from 'lucide-react'
import { format, isPast, isToday } from 'date-fns'
import Avatar from '../ui/Avatar'
import TaskDetailModal from './TaskDetail'

const PRIORITY_CONFIG = {
  high:   { label: 'High',   color: 'text-red-600 bg-red-50 ring-1 ring-red-200'               },
  medium: { label: 'Medium', color: 'text-amber-600 bg-amber-50 ring-1 ring-amber-200'         },
  low:    { label: 'Low',    color: 'text-emerald-600 bg-emerald-50 ring-1 ring-emerald-200'   },
}

const STATUS_CONFIG = {
  todo:        { label: 'To Do',       color: 'text-gray-500 bg-gray-100'     },
  in_progress: { label: 'In Progress', color: 'text-violet-700 bg-violet-50'  },
  done:        { label: 'Done',        color: 'text-emerald-700 bg-emerald-50' },
}

export default function TaskList({ tasks, loading, onStatusChange, onDelete, onUpdate }) {
  const [activeDetail, setActiveDetail] = useState(null)
  const [menuOpen, setMenuOpen]         = useState(null)

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 size={28} className="text-violet-400 animate-spin" />
    </div>
  )

  if (tasks.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="text-5xl mb-4">📋</div>
      <h3 className="font-display font-semibold text-gray-900 text-lg mb-1">No tasks yet</h3>
      <p className="text-gray-400 text-sm">Create your first task with the "New Task" button</p>
    </div>
  )

  return (
    <div className="overflow-y-auto h-full p-5">
      <div className="space-y-2">
        {tasks.map(task => {
          const pri    = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
          const status = STATUS_CONFIG[task.status]     || STATUS_CONFIG.todo
          const dueDate   = task.dueDate ? new Date(task.dueDate) : null
          const isOverdue = dueDate && isPast(dueDate) && task.status !== 'done'
          const dueToday  = dueDate && isToday(dueDate)

          return (
            <div key={task._id}
              className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-4 group hover:border-violet-200 hover:shadow-sm transition-all cursor-pointer"
              onClick={() => setActiveDetail(task)}>

              {/* Status toggle */}
              <div className="flex-shrink-0" onClick={e => { e.stopPropagation() }}>
                <button
                  onClick={() => onStatusChange(task._id, task.status === 'done' ? 'todo' : task.status === 'todo' ? 'in_progress' : 'done')}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                    ${task.status === 'done' ? 'bg-emerald-500 border-emerald-500' : task.status === 'in_progress' ? 'border-violet-500' : 'border-gray-300 hover:border-violet-400'}`}>
                  {task.status === 'done' && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5 3.5-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
                  {task.status === 'in_progress' && <div className="w-2 h-2 bg-violet-500 rounded-full" />}
                </button>
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-xs text-gray-400 truncate mt-0.5">{task.description}</p>
                )}
              </div>

              {/* Badges */}
              <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                <span className={`badge text-[10px] font-bold ${pri.color}`}>{pri.label}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
              </div>

              {/* Assignee */}
              <div className="flex-shrink-0 hidden md:block">
                {task.assignedTo
                  ? <Avatar user={task.assignedTo} size={24} />
                  : <div className="w-6 h-6 rounded-full bg-gray-100" />}
              </div>

              {/* Due date */}
              {dueDate && (
                <span className={`text-[10px] font-semibold flex-shrink-0 hidden md:block
                  ${isOverdue ? 'text-red-500' : dueToday ? 'text-amber-600' : 'text-gray-400'}`}>
                  {isOverdue ? '⚠ Overdue' : dueToday ? '📅 Today' : format(dueDate, 'MMM d')}
                </span>
              )}

              {/* Menu */}
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={e => e.stopPropagation()}>
                <button onClick={() => setMenuOpen(menuOpen === task._id ? null : task._id)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                  <MoreVertical size={14} />
                </button>
                {menuOpen === task._id && (
                  <div className="absolute right-6 z-10 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[140px]">
                    <button onClick={() => { setActiveDetail(task); setMenuOpen(null) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                      <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={() => { onDelete(task._id); setMenuOpen(null) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {activeDetail && (
        <TaskDetailModal
          task={activeDetail}
          open={true}
          onClose={() => setActiveDetail(null)}
          onUpdate={onUpdate}
          onDelete={(id) => { onDelete(id); setActiveDetail(null) }}
        />
      )}
    </div>
  )
}
