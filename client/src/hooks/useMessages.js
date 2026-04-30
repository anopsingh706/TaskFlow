import { useState, useEffect, useCallback } from 'react'
import { messageAPI } from '../api/chat'

export function useMessages(channelId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(false)
  const [page, setPage]         = useState(1)
  const [hasMore, setHasMore]   = useState(false)

  const load = useCallback(async (pg = 1) => {
    if (!channelId) return
    setLoading(true)
    try {
      const { data } = await messageAPI.getMessages(channelId, pg)
      setMessages(prev => pg === 1 ? data.messages : [...data.messages, ...prev])
      setHasMore(data.pagination.page < data.pagination.pages)
      setPage(pg)
    } catch (err) { console.error('useMessages:', err) }
    finally { setLoading(false) }
  }, [channelId])

  useEffect(() => { setMessages([]); load(1) }, [channelId]) // eslint-disable-line

  const addMessage   = (msg) => setMessages(prev => [...prev, msg])
  const updateMessage = (id, patch) => setMessages(prev => prev.map(m => m._id === id ? { ...m, ...patch } : m))
  const removeMessage = (id) => setMessages(prev => prev.map(m => m._id === id ? { ...m, isDeleted: true, content: '' } : m))
  const loadMore     = () => load(page + 1)

  return { messages, loading, hasMore, loadMore, addMessage, updateMessage, removeMessage }
}