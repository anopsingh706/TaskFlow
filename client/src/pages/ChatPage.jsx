import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { channelAPI } from '../api/chat'
import ChatList   from '../components/chat/ChatList'
import ChatWindow from '../components/chat/ChatWindow'

export default function ChatPage() {
  const { channelId }   = useParams()
  const [channels, setChannels]           = useState([])
  const [activeChannel, setActiveChannel] = useState(null)
  const [loading, setLoading]             = useState(true)
  const [showList, setShowList]           = useState(true) // mobile: show list or window

  const loadChannels = useCallback(async () => {
    try {
      const { data } = await channelAPI.getAll()
      setChannels(data.channels)
      if (channelId) {
        const found = data.channels.find(c => c._id === channelId)
        if (found) { setActiveChannel(found); setShowList(false) }
      } else if (data.channels.length > 0 && !activeChannel) {
        setActiveChannel(data.channels[0])
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [channelId]) // eslint-disable-line

  useEffect(() => { loadChannels() }, [loadChannels])

  const handleChannelSelect = (channel) => {
    setActiveChannel(channel)
    setShowList(false) // on mobile, switch to chat window
  }

  return (
    <div className="flex h-full w-full min-w-0 overflow-hidden overflow-x-hidden relative">

      {/* ── Chat List ── */}
      {/* Desktop: always visible (sm:flex). Mobile: visible only when showList=true */}
      <div className={`
        w-full sm:w-72 sm:min-w-[18rem] flex-shrink-0 min-w-0 border-r border-gray-100 bg-white
        ${showList ? 'flex' : 'hidden sm:flex'}
      `}>
        <ChatList
          channels={channels}
          activeChannel={activeChannel}
          onSelect={handleChannelSelect}
          onChannelCreated={(ch) => { setChannels(prev => [ch, ...prev]); handleChannelSelect(ch) }}
          loading={loading}
          onRefresh={loadChannels}
        />
      </div>

      {/* ── Chat Window ── */}
      {/* Desktop: always visible (sm:flex). Mobile: visible only when showList=false */}
      <div className={`
        w-full flex-1 min-w-0
        ${showList ? 'hidden sm:flex' : 'flex'}
      `}>
        {activeChannel ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Mobile back button */}
            <div className="flex sm:hidden items-center gap-2 px-3 py-2 border-b border-gray-100 bg-white flex-shrink-0">
              <button onClick={() => setShowList(true)}
                className="flex items-center gap-1.5 text-violet-600 font-semibold text-sm">
                <ArrowLeft size={16} /> Back
              </button>
            </div>
            <ChatWindow
              channel={activeChannel}
              onChannelUpdated={(updated) => {
                setChannels(prev => prev.map(c => c._id === updated._id ? updated : c))
                if (activeChannel?._id === updated._id) setActiveChannel(updated)
              }}
              onUpdateLastMessage={(channelId, preview) => {
                setChannels(prev => prev.map(c =>
                  c._id === channelId
                    ? { ...c, lastMessage: { content: preview, createdAt: new Date() } }
                    : c
                ))
              }}
            />
          </div>
        ) : (
          <div className="hidden sm:flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={28} className="text-violet-400" />
              </div>
              <h3 className="font-display font-semibold text-gray-900 text-lg mb-1">
                {loading ? 'Loading…' : 'Select a conversation'}
              </h3>
              <p className="text-gray-400 text-sm">Choose from the left panel</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
