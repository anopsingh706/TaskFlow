import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Loader2 } from 'lucide-react'
import TaskCard from './TaskCard'

const COLUMNS = [
  { id: 'todo',        label: 'To Do',       color: '#6B7280', dot: 'bg-gray-400'    },
  { id: 'in_progress', label: 'In Progress', color: '#5B4FE9', dot: 'bg-violet-500'  },
  { id: 'done',        label: 'Done',        color: '#10B981', dot: 'bg-emerald-500' },
]

export default function TaskBoard({ tasks, loading, onStatusChange, onDelete, onReorder, onUpdate }) {
  const byStatus = (status) => tasks.filter(t => t.status === status).sort((a,b) => a.order - b.order)

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const srcStatus  = source.droppableId
    const destStatus = destination.droppableId
    const destTasks  = byStatus(destStatus).filter(t => t._id !== draggableId)

    // Build the reordered list optimistically
    const movedTask   = tasks.find(t => t._id === draggableId)
    destTasks.splice(destination.index, 0, { ...movedTask, status: destStatus })

    const serverUpdates = destTasks.map((t, i) => ({ _id: t._id, status: destStatus, order: i }))

    // Also update tasks in same source column if different
    let allUpdated = tasks.map(t => {
      if (t._id === draggableId) return { ...t, status: destStatus, order: destination.index }
      return t
    })

    onReorder(allUpdated, serverUpdates)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={28} className="text-violet-400 animate-spin" />
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 h-full p-4 sm:p-5 overflow-x-auto min-w-0 snap-x">
        {COLUMNS.map(col => {
          const colTasks = byStatus(col.id)
          return (
            <div key={col.id} className="flex flex-col min-h-0 w-[280px] sm:w-auto sm:flex-1 flex-shrink-0 snap-center">
              {/* Column header */}
              <div className="flex items-center gap-2 mb-3 flex-shrink-0 px-1">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                <h3 className="text-sm font-bold text-gray-700">{col.label}</h3>
                <span className="ml-auto text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>

              {/* Droppable column */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 overflow-y-auto rounded-2xl p-2 space-y-2 transition-colors min-h-[120px] scrollbar-none
                      ${snapshot.isDraggingOver ? 'bg-violet-50 ring-2 ring-violet-200' : 'bg-gray-50'}`}
                  >
                    {colTasks.length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex items-center justify-center h-20 text-xs text-gray-400 font-medium">
                        Drop tasks here
                      </div>
                    )}
                    {colTasks.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <TaskCard
                              task={task}
                              isDragging={snapshot.isDragging}
                              onStatusChange={onStatusChange}
                              onDelete={onDelete}
                              onUpdate={onUpdate}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}
