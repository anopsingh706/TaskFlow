import { useEffect, useState } from 'react'
import { Plus, LayoutGrid, List, Filter } from 'lucide-react'
import { useTasks } from '../context/TaskContext'
import TaskBoard     from '../components/tasks/TaskBoard'
import TaskList      from '../components/tasks/Tasklist'
import CreateTaskModal from '../components/tasks/CreateTaskModal'
import toast from 'react-hot-toast'

const VIEWS = [
  { id: 'all',      label: 'All Tasks' },
  { id: 'assigned', label: 'Assigned to me' },
  { id: 'created',  label: 'Created by me' },
]

export default function TasksPage() {
  const { tasks, loading, fetchTasks, updateTask, deleteTask, reorderTasks } = useTasks()
  const [showCreate, setShowCreate] = useState(false)
  const [view, setView]             = useState('all')
  const [displayMode, setDisplayMode] = useState('board')  // 'board' | 'list'
  const [filterPriority, setFilterPriority] = useState('')

  useEffect(() => {
    fetchTasks({ view })
  }, [view]) // eslint-disable-line

  const filtered = filterPriority
    ? tasks.filter(t => t.priority === filterPriority)
    : tasks

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus })
    } catch { toast.error('Failed to update task') }
  }

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await deleteTask(taskId)
      toast.success('Task deleted')
    } catch { toast.error('Failed to delete task') }
  }

  // Stats for header
  const counts = {
    todo:        tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done:        tasks.filter(t => t.status === 'done').length,
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Page header ── */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-display font-semibold text-xl text-gray-900">Task Board</h1>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
              <span><span className="font-semibold text-gray-600">{counts.todo}</span> to do</span>
              <span><span className="font-semibold text-violet-600">{counts.in_progress}</span> in progress</span>
              <span><span className="font-semibold text-emerald-600">{counts.done}</span> done</span>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="btn-primary !px-4 !py-2.5 !text-sm gap-1.5">
            <Plus size={16} /> New Task
          </button>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* View tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            {VIEWS.map(v => (
              <button key={v.id} onClick={() => setView(v.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${view === v.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {v.label}
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl px-3 py-1.5">
            <Filter size={13} className="text-gray-400" />
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
              className="bg-transparent text-xs font-medium text-gray-600 focus:outline-none cursor-pointer">
              <option value="">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Display mode */}
          <div className="ml-auto flex bg-gray-100 rounded-xl p-1">
            <button onClick={() => setDisplayMode('board')}
              className={`p-1.5 rounded-lg transition-colors ${displayMode === 'board' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
              <LayoutGrid size={15} />
            </button>
            <button onClick={() => setDisplayMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${displayMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Board / List ── */}
      <div className="flex-1 overflow-hidden">
        {displayMode === 'board' ? (
          <TaskBoard
            tasks={filtered}
            loading={loading}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onReorder={reorderTasks}
            onUpdate={updateTask}
          />
        ) : (
          <TaskList
            tasks={filtered}
            loading={loading}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onUpdate={updateTask}
          />
        )}
      </div>

      <CreateTaskModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </div>
  )
}
