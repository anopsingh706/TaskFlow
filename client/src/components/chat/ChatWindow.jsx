import { useEffect, useRef, useState, useCallback } from 'react'
import { Hash, Search, MoreHorizontal, Users, Send, Paperclip, Smile, Image, File, X, Download } from 'lucide-react'
import { messageAPI } from '../../api/chat'
import { useAuth }    from '../../context/AuthContext'
import { useSocket }  from '../../context/SocketContext'
import MessageBubble  from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import EmojiPickerPopup from './EmojiPicker'
import Avatar from '../ui/Avatar'
import toast  from 'react-hot-toast'

export default function ChatWindow({ channel, onChannelUpdated, onUpdateLastMessage }) {
  const { user }                     = useAuth()
  const { emit, on, off, connected } = useSocket()
  const [messages, setMessages]      = useState([])
  const [loading, setLoading]        = useState(true)
  const [input, setInput]            = useState('')
  const [typingUsers, setTypingUsers]= useState([])
  const [showEmoji, setShowEmoji]    = useState(false)
  const [showAttach, setShowAttach]  = useState(false)
  const [hasMore, setHasMore]        = useState(false)
  const [page, setPage]              = useState(1)
  const [attachments, setAttachments]= useState([])
  const [sending, setSending]        = useState(false)
  const bottomRef   = useRef(null)
  const inputRef    = useRef(null)
  const fileRef     = useRef(null)
  const imageRef    = useRef(null)
  const typingTimer = useRef(null)
  const isTyping    = useRef(false)

  const loadMessages = useCallback(async (pg = 1) => {
    try {
      setLoading(pg === 1)
      const { data } = await messageAPI.getMessages(channel._id, pg)
      if (pg === 1) setMessages(data.messages)
      else setMessages(prev => [...data.messages, ...prev])
      setHasMore(data.pagination.page < data.pagination.pages)
      setPage(pg)
    } catch { toast.error('Failed to load messages') }
    finally { setLoading(false) }
  }, [channel._id])

  useEffect(() => {
    setMessages([]); setPage(1); setTypingUsers([]); setAttachments([])
    loadMessages(1)
    emit('join_room', { channelId: channel._id })
    inputRef.current?.focus()
  }, [channel._id]) // eslint-disable-line

  useEffect(() => {
    if (page === 1) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length]) // eslint-disable-line

  // Socket events
  useEffect(() => {
    const onNew = ({ message }) => {
      if (message.channelId !== channel._id) return
      setMessages(prev => [...prev, message])
      onUpdateLastMessage(channel._id, message.content)
      if (document.hasFocus()) emit('mark_read', { channelId: channel._id, messageIds: [message._id] })
    }
    const onTyping = ({ userId, channelId, isTyping: typing, name }) => {
      if (channelId !== channel._id || userId === user._id) return
      setTypingUsers(prev => typing
        ? [...prev.filter(u => u.id !== userId), { id: userId, name }]
        : prev.filter(u => u.id !== userId))
    }
    const onEdited  = ({ messageId, content, isEdited }) => setMessages(prev => prev.map(m => m._id === messageId ? { ...m, content, isEdited } : m))
    const onDeleted = ({ messageId })  => setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isDeleted: true, content: '' } : m))
    const onReact   = ({ messageId, reactions }) => setMessages(prev => prev.map(m => m._id === messageId ? { ...m, reactions } : m))

    on('new_message', onNew); on('user_typing', onTyping); on('message_edited', onEdited)
    on('message_deleted', onDeleted); on('reaction_updated', onReact)
    return () => {
      off('new_message', onNew); off('user_typing', onTyping); off('message_edited', onEdited)
      off('message_deleted', onDeleted); off('reaction_updated', onReact)
    }
  }, [channel._id, user._id]) // eslint-disable-line

  // ── Send message ────────────────────────────────────────
  const sendMessage = async () => {
    const content = input.trim()
    if (!content && attachments.length === 0) return
    if (!connected) { toast.error('Not connected — please wait'); return }
    if (sending) return

    // Guard: each file max 5 MB
    const oversized = attachments.find(a => a.file.size > 5 * 1024 * 1024)
    if (oversized) {
      toast.error(`"${oversized.file.name}" is over 5 MB. Please choose a smaller file.`)
      return
    }

    setSending(true)

    try {
      // Convert files to base64
      const attachPayload = await Promise.all(
        attachments.map(a => new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload  = e => resolve({
            name:     a.file.name,
            url:      e.target.result,   // base64 data URL
            mimeType: a.file.type,
            size:     a.file.size,
            isImage:  a.type === 'image',
          })
          reader.onerror = () => reject(new Error(`Failed to read ${a.file.name}`))
          reader.readAsDataURL(a.file)
        }))
      )

      // Emit via socket — server saves to MongoDB
      emit('send_message',
        { channelId: channel._id, content, attachments: attachPayload },
        (res) => {
          if (res?.error) toast.error(res.error)
        }
      )

      setInput('')
      setAttachments([])
      stopTyping()
    } catch (err) {
      toast.error(err.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  // ── Typing ──────────────────────────────────────────────
  const sendTyping = () => {
    if (!isTyping.current) { isTyping.current = true; emit('typing', { channelId: channel._id, isTyping: true }) }
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(stopTyping, 1500)
  }
  const stopTyping = () => {
    if (isTyping.current) { isTyping.current = false; emit('typing', { channelId: channel._id, isTyping: false }) }
    clearTimeout(typingTimer.current)
  }
  const handleInputChange = e => { setInput(e.target.value); e.target.value ? sendTyping() : stopTyping() }
  const handleKeyDown     = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }

  // ── File/Image attachment ────────────────────────────────
  const addFiles = (files, type) => {
    const newItems = Array.from(files).slice(0, 5).map(file => ({
      file, type,
      preview: type === 'image' ? URL.createObjectURL(file) : null,
      id: Math.random().toString(36).slice(2),
    }))
    setAttachments(prev => [...prev, ...newItems].slice(0, 5))
    setShowAttach(false)
  }

  const removeAttachment = (id) => {
    setAttachments(prev => {
      const item = prev.find(a => a.id === id)
      if (item?.preview) URL.revokeObjectURL(item.preview)
      return prev.filter(a => a.id !== id)
    })
  }

  // ── Header info ──────────────────────────────────────────
  const isGroup   = channel.type === 'group'
  const isDM      = channel.type === 'dm'
  const otherUser = isDM ? channel.members?.find(m => m._id !== user?._id) : null
  const headerName = isGroup ? (channel.name || 'Channel') : (otherUser?.name || 'Direct Message')

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-gray-100 flex-shrink-0 bg-white">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {isDM ? (
            <div className="relative">
              <Avatar user={otherUser} size={36} />
              {otherUser?.status === 'online' && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              )}
            </div>
          ) : (
            <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Hash size={18} className="text-violet-600" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-sm leading-tight">{headerName}</h3>
            <p className="text-xs text-gray-400 leading-tight">
              {isGroup
                ? `${channel.members?.length || 0} members`
                : otherUser?.status === 'online' ? '🟢 Online' : '⚫ Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button className="btn-ghost p-2 hidden sm:flex"><Search size={16} /></button>
          {isGroup && <button className="btn-ghost p-2 hidden sm:flex"><Users size={16} /></button>}
          <button className="btn-ghost p-2"><MoreHorizontal size={16} /></button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4"
        style={{ background: 'linear-gradient(to bottom, #faf9ff, #ffffff)' }}>
        {hasMore && (
          <div className="text-center mb-4">
            <button onClick={() => loadMessages(page + 1)}
              className="text-xs text-violet-600 font-semibold bg-violet-50 hover:bg-violet-100 px-4 py-1.5 rounded-full transition-colors">
              Load older messages
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex gap-1.5">
              {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-violet-300 rounded-full animate-bounce" style={{ animationDelay:`${i*0.15}s` }} />)}
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mb-4">
              {isDM ? <Avatar user={otherUser} size={40} /> : <Hash size={28} className="text-violet-400" />}
            </div>
            <h4 className="font-display font-semibold text-gray-900 mb-1">
              {isDM ? `Start a conversation with ${otherUser?.name}` : `Welcome to #${channel.name}`}
            </h4>
            <p className="text-sm text-gray-400">Say hello 👋</p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((msg, idx) => (
              <MessageBubble
                key={msg._id}
                message={msg}
                prevMessage={messages[idx - 1]}
                currentUser={user}
                onReact={(id, emoji) => emit('react_to_message', { messageId: id, emoji })}
                onEdit={(id, content) => emit('edit_message', { messageId: id, content })}
                onDelete={(id) => emit('delete_message', { messageId: id })}
              />
            ))}
          </div>
        )}

        {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}
        <div ref={bottomRef} />
      </div>

      {/* ── Attachment previews ── */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex gap-2 flex-wrap flex-shrink-0">
          {attachments.map(a => (
            <div key={a.id} className="relative group">
              {a.type === 'image' ? (
                <img src={a.preview} alt={a.file.name}
                  className="w-16 h-16 object-cover rounded-xl border border-gray-200" />
              ) : (
                <div className="w-32 h-14 bg-white rounded-xl border border-gray-200 flex items-center gap-2 px-2.5 overflow-hidden">
                  <File size={18} className="text-violet-500 flex-shrink-0" />
                  <span className="text-xs text-gray-600 truncate">{a.file.name}</span>
                </div>
              )}
              <button onClick={() => removeAttachment(a.id)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Input bar ── */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 flex-shrink-0">
        <div className={`flex items-end gap-2 bg-gray-50 border rounded-2xl px-3 py-2 transition-all
          ${connected ? 'border-gray-200 focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-50' : 'border-amber-200 bg-amber-50'}`}>

          {/* Attachment button */}
          <div className="relative flex-shrink-0 mb-0.5">
            <button onClick={() => setShowAttach(v => !v)}
              className={`p-1 rounded-lg transition-colors ${showAttach ? 'text-violet-600 bg-violet-100' : 'text-gray-400 hover:text-gray-600'}`}>
              <Paperclip size={18} />
            </button>

            {/* Attachment popup */}
            {showAttach && (
              <div className="absolute bottom-10 left-0 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 flex gap-1.5">
                <button onClick={() => { imageRef.current?.click(); setShowAttach(false) }}
                  className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl hover:bg-violet-50 transition-colors group">
                  <div className="w-10 h-10 bg-violet-100 group-hover:bg-violet-200 rounded-xl flex items-center justify-center transition-colors">
                    <Image size={20} className="text-violet-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Photo</span>
                </button>
                <button onClick={() => { fileRef.current?.click(); setShowAttach(false) }}
                  className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors group">
                  <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-xl flex items-center justify-center transition-colors">
                    <File size={20} className="text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">File</span>
                </button>
              </div>
            )}

            {/* Hidden file inputs */}
            <input ref={imageRef} type="file" accept="image/*" multiple className="hidden"
              onChange={e => addFiles(e.target.files, 'image')} />
            <input ref={fileRef} type="file" multiple className="hidden"
              onChange={e => addFiles(e.target.files, 'file')} />
          </div>

          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${isGroup ? '#' + (channel.name || 'channel') : (otherUser?.name || 'them')}…`}
            rows={1}
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 resize-none focus:outline-none min-h-[24px] max-h-28 py-1 leading-6"
            style={{ scrollbarWidth: 'none' }}
          />

          <div className="flex items-center gap-1 flex-shrink-0 mb-0.5">
            <div className="relative">
              <button onClick={() => setShowEmoji(v => !v)}
                className={`p-1 rounded-lg transition-colors ${showEmoji ? 'text-violet-600 bg-violet-100' : 'text-gray-400 hover:text-gray-600'}`}>
                <Smile size={18} />
              </button>
              {showEmoji && (
                <div className="absolute bottom-10 right-0 z-50">
                  <EmojiPickerPopup
                    onSelect={e => { setInput(p => p + e); setShowEmoji(false); inputRef.current?.focus() }}
                    onClose={() => setShowEmoji(false)}
                  />
                </div>
              )}
            </div>

            <button onClick={sendMessage}
              disabled={(!input.trim() && attachments.length === 0) || !connected || sending}
              className="w-8 h-8 bg-violet-600 hover:bg-violet-700 active:scale-95 disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-all">
              {sending
                ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Send size={14} />
              }
            </button>
          </div>
        </div>

        {!connected && (
          <p className="text-[11px] text-amber-600 mt-1 text-center font-medium">Reconnecting to server…</p>
        )}
      </div>
    </div>
  )
}
