import { useState, useRef } from 'react'
import { Smile, Edit2, Trash2, Check, CheckCheck, Download, File } from 'lucide-react'
import Avatar from '../ui/Avatar'
import { formatMessageTime, formatFullDate } from '../../utils/helpers'

const QUICK_EMOJIS = ['👍','❤️','😂','😮','😢','🔥']

export default function MessageBubble({ message, prevMessage, currentUser, onReact, onEdit, onDelete }) {
  const [showActions, setShowActions] = useState(false)
  const [editing, setEditing]         = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const editRef = useRef(null)

  const isOwn   = message.senderId?._id === currentUser?._id ||
                  message.senderId === currentUser?._id
  const sender  = message.senderId

  // Group consecutive messages from same sender (within 5 min)
  const isContinuation = prevMessage &&
    (prevMessage.senderId?._id || prevMessage.senderId) === (message.senderId?._id || message.senderId) &&
    new Date(message.createdAt) - new Date(prevMessage.createdAt) < 5 * 60 * 1000

  const handleEditSubmit = () => {
    if (editContent.trim() && editContent !== message.content) onEdit(message._id, editContent.trim())
    setEditing(false)
  }
  const handleEditKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditSubmit() }
    if (e.key === 'Escape') { setEditing(false); setEditContent(message.content) }
  }

  // Group reactions
  const reactionMap = {}
  message.reactions?.forEach(r => {
    if (!reactionMap[r.emoji]) reactionMap[r.emoji] = []
    reactionMap[r.emoji].push(r.userId?._id || r.userId)
  })

  if (message.isDeleted) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${isContinuation ? 'mt-0.5' : 'mt-4'}`}>
        <p className="text-xs text-gray-400 italic bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
          🚫 This message was deleted
        </p>
      </div>
    )
  }

  const hasAttachments = message.attachments?.length > 0

  return (
    <div
      className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${isContinuation ? 'mt-0.5' : 'mt-4'} group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar — only show for first message in group, other side */}
      <div className="flex-shrink-0 w-7 mb-0.5">
        {!isOwn && !isContinuation && <Avatar user={sender} size={28} />}
      </div>

      {/* Bubble content */}
      <div className={`flex flex-col max-w-[75%] sm:max-w-[65%] ${isOwn ? 'items-end' : 'items-start'}`}>

        {/* Sender name — only for group chats, incoming, first in group */}
        {!isOwn && !isContinuation && (
          <span className="text-xs font-semibold text-violet-600 mb-1 ml-1">{sender?.name || 'Unknown'}</span>
        )}

        {/* Attachments */}
        {hasAttachments && (
          <div className="mb-1 space-y-1.5">
            {message.attachments.map((att, i) => {
              const isImg = att.isImage || att.mimeType?.startsWith('image/')
              return isImg ? (
                <div key={i} className="relative group/img rounded-xl overflow-hidden shadow-sm">
                  <img src={att.url} alt={att.name || 'image'}
                    className="max-w-[240px] max-h-60 object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => window.open(att.url, '_blank')}
                  />
                  <a href={att.url} download={att.name}
                    className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity">
                    <Download size={12} />
                  </a>
                </div>
              ) : (
                <div key={i} className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl shadow-sm max-w-[240px]
                  ${isOwn ? 'bg-violet-600 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isOwn ? 'bg-white/20' : 'bg-violet-50'}`}>
                    <File size={16} className={isOwn ? 'text-white' : 'text-violet-500'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{att.name || 'File'}</p>
                    {att.size && <p className={`text-[10px] ${isOwn ? 'text-violet-200' : 'text-gray-400'}`}>{formatBytes(att.size)}</p>}
                  </div>
                  <a href={att.url} download={att.name}
                    onClick={e => e.stopPropagation()}
                    className={`flex-shrink-0 p-1 rounded-lg transition-colors ${isOwn ? 'hover:bg-white/20 text-white' : 'hover:bg-gray-100 text-gray-500'}`}>
                    <Download size={13} />
                  </a>
                </div>
              )
            })}
          </div>
        )}

        {/* Text bubble */}
        {(message.content || editing) && (
          <div
            className={`relative px-3.5 py-2 rounded-2xl shadow-sm leading-relaxed
              ${isOwn
                ? 'bg-violet-600 text-white rounded-br-sm'
                : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'}
              ${!hasAttachments && isContinuation && isOwn  ? 'rounded-tr-2xl' : ''}
              ${!hasAttachments && isContinuation && !isOwn ? 'rounded-tl-2xl' : ''}
            `}
          >
            {editing ? (
              <div>
                <textarea
                  ref={editRef}
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  onKeyDown={handleEditKey}
                  autoFocus
                  className="bg-transparent text-sm w-full resize-none focus:outline-none min-w-[160px]"
                  rows={2}
                />
                <div className="flex gap-3 mt-1">
                  <button onClick={handleEditSubmit}
                    className={`text-xs font-semibold ${isOwn ? 'text-violet-200 hover:text-white' : 'text-violet-600 hover:text-violet-700'}`}>
                    Save
                  </button>
                  <button onClick={() => { setEditing(false); setEditContent(message.content) }}
                    className={`text-xs ${isOwn ? 'text-violet-300 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            )}

            {/* Time + status inside bubble for own messages */}
            <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <span className={`text-[10px] ${isOwn ? 'text-violet-200' : 'text-gray-400'}`}
                title={formatFullDate(message.createdAt)}>
                {formatMessageTime(message.createdAt)}
                {message.isEdited && ' · edited'}
              </span>
              {isOwn && (
                message.readBy?.length > 0
                  ? <CheckCheck size={12} className="text-violet-200" />
                  : <Check size={12} className="text-violet-300" />
              )}
            </div>
          </div>
        )}

        {/* Reactions */}
        {Object.keys(reactionMap).length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            {Object.entries(reactionMap).map(([emoji, users]) => {
              const reacted = users.some(id => (typeof id === 'string' ? id : id?.toString()) === currentUser?._id)
              return (
                <button key={emoji} onClick={() => onReact(message._id, emoji)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors
                    ${reacted ? 'bg-violet-50 border-violet-300 text-violet-800' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                  <span>{emoji}</span>
                  <span className="font-semibold">{users.length}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Action toolbar ── */}
      {showActions && !editing && (
        <div className={`flex items-center gap-0.5 bg-white border border-gray-200 rounded-2xl shadow-lg px-1.5 py-1 mb-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity`}>
          {QUICK_EMOJIS.map(e => (
            <button key={e} onClick={() => onReact(message._id, e)}
              className="w-7 h-7 text-sm hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center">{e}</button>
          ))}
          <div className="w-px h-4 bg-gray-200 mx-0.5" />
          {isOwn && (
            <>
              <button onClick={() => { setEditing(true); setTimeout(() => editRef.current?.focus(), 50) }}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-violet-600 hover:bg-gray-100 rounded-lg">
                <Edit2 size={12} />
              </button>
              <button onClick={() => onDelete(message._id)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-lg">
                <Trash2 size={12} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
