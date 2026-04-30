import { useState } from 'react'
import { Calendar, MoreVertical, Trash2, Edit2, ArrowRight, User2 } from 'lucide-react'
import Avatar from '../ui/Avatar'
import TaskDetailModal from './TaskDetail'
import { format, isPast, isToday } from 'date-fns'

const PRIORITY_CONFIG = {
  high:   { label: 'High',   classes: 'bg-red-50 text-red-600 ring-1 ring-red-200'         },
  medium: { label: 'Medium', classes: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200'   },
  low:    { label: 'Low',    classes: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
}

const AI_BADGE = 'bg-violet-50 text-violet-700 ring-1 ring-violet-200'

export default function TaskCard({ task, isDragging, onStatusChange, onDelete, onUpdate }) {
  const [showMenu, setShowMenu] = useState(false)
  const [showDetail, setShowDetail] = useState(false)

  const pri    = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
  const aiPri  = task.aiSuggestedPriority ? PRIORITY_CONFIG[task.aiSuggestedPriority] : null
  const hasDue = !!task.dueDate
  const dueDate = hasDue ? new Date(task.dueDate) : null
  const isOverdue = hasDue && isPast(dueDate) && task.status !== 'done'
  const isDueToday = hasDue && isToday(dueDate)

  return (
    <>
      <div
        onClick={() => setShowDetail(true)}
        className={`bg-white rounded-xl border p-3.5 cursor-pointer group
          transition-all duration-150 select-none
          ${isDragging
            ? 'shadow-lg border-violet-300 rotate-1 scale-105'
            : 'border-gray-100 hover:border-violet-200 hover:shadow-md'
          }`}
        style={{ boxShadow: isDragging ? '0 8px 24px rgba(91,79,233,0.18)' : undefined }}
      >
        {/* Priority + AI badge row */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <span className={`badge text-[10px] font-bold ${pri.classes}`}>
            {pri.label}
          </span>
          {aiPri && task.aiSuggestedPriority !== task.priority && (
            <span className={`badge text-[10px] ${AI_BADGE}`} title={task.aiReason}>
              🤖 AI: {aiPri.label}
            </span>
          )}
          <button
            onClick={e => { e.stopPropagation(); setShowMenu(v => !v) }}
            className="ml-auto text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
          >
            <MoreVertical size={13} />
          </button>
        </div>

        {/* Context menu */}
        {showMenu && (
          <div
            className="absolute right-2 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[140px]"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => { setShowDetail(true); setShowMenu(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
              <Edit2 size={13} /> Edit task
            </button>
            {task.status !== 'in_progress' && (
              <button onClick={() => { onStatusChange(task._id, 'in_progress'); setShowMenu(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-violet-600 hover:bg-violet-50">
                <ArrowRight size={13} /> Move to In Progress
              </button>
            )}
            {task.status !== 'done' && (
              <button onClick={() => { onStatusChange(task._id, 'done'); setShowMenu(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-emerald-600 hover:bg-emerald-50">
                <ArrowRight size={13} /> Mark as Done
              </button>
            )}
            <div className="border-t border-gray-100 mt-1 pt-1">
              <button onClick={() => { onDelete(task._id); setShowMenu(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50">
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        )}

        {/* Title */}
        <h4 className={`text-sm font-semibold leading-snug mb-2 ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
          {task.title}
        </h4>

        {/* Description preview */}
        {task.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer: assignee + due date */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
          <div className="flex items-center gap-1.5">
            {task.assignedTo ? (
              <Avatar user={task.assignedTo} size={22} />
            ) : (
              <div className="w-[22px] h-[22px] rounded-full bg-gray-100 flex items-center justify-center">
                <User2 size={12} className="text-gray-400" />
              </div>
            )}
            <span className="text-[10px] text-gray-400 truncate max-w-[80px]">
              {task.assignedTo?.name?.split(' ')[0] || 'Unassigned'}
            </span>
          </div>
          {hasDue && (
            <span className={`flex items-center gap-1 text-[10px] font-medium ${
              isOverdue ? 'text-red-500' : isDueToday ? 'text-amber-600' : 'text-gray-400'
            }`}>
              <Calendar size={10} />
              {isOverdue ? 'Overdue' : isDueToday ? 'Today' : format(dueDate, 'MMM d')}
            </span>
          )}
        </div>
      </div>

      <TaskDetailModal
        task={task}
        open={showDetail}
        onClose={() => setShowDetail(false)}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </>
  )
}
