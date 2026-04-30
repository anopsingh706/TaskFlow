import { createContext, useContext, useState, useCallback } from 'react'
import { taskAPI } from '../api/tasks'
import toast from 'react-hot-toast'

const TaskContext = createContext(null)

export function TaskProvider({ children }) {
  const [tasks, setTasks]     = useState([])
  const [loading, setLoading] = useState(false)

  const fetchTasks = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const { data } = await taskAPI.getAll(params)
      setTasks(data.tasks)
      return data.tasks
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load tasks')
    } finally { setLoading(false) }
  }, [])

  const createTask = async (taskData) => {
    const { data } = await taskAPI.create(taskData)
    setTasks(prev => [data.task, ...prev])
    return data.task
  }

  const updateTask = async (id, patch) => {
    const { data } = await taskAPI.update(id, patch)
    setTasks(prev => prev.map(t => t._id === id ? data.task : t))
    return data.task
  }

  const deleteTask = async (id) => {
    await taskAPI.delete(id)
    setTasks(prev => prev.filter(t => t._id !== id))
  }

  // Optimistic Kanban reorder — update local state immediately, persist in bg
  const reorderTasks = (updatedTasks, serverUpdates) => {
    setTasks(updatedTasks)
    taskAPI.reorder(serverUpdates).catch(() => {
      toast.error('Failed to save order — refreshing')
      fetchTasks()
    })
  }

  return (
    <TaskContext.Provider value={{ tasks, loading, fetchTasks, createTask, updateTask, deleteTask, reorderTasks, setTasks }}>
      {children}
    </TaskContext.Provider>
  )
}

export const useTasks = () => {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error('useTasks must be inside TaskProvider')
  return ctx
}
