import { useState, useRef } from 'react'
import { X, Brain, Loader2, PhoneOff, Maximize2, Minimize2 } from 'lucide-react'
import { meetingAPI } from '../../api/meetings'
import AISummaryModal from './AISummaryModal'
import toast from 'react-hot-toast'

/**
 * MeetingRoom — wraps Jitsi Meet in an iframe.
 * Jitsi is open source, requires no API key, and supports up to hundreds of participants.
 * The roomId is appended to meet.jit.si/<roomId> — anyone with the link can join.
 */
export default function MeetingRoom({ meeting, onEnd, onSummarize }) {
  const [summarizing, setSummarizing] = useState(false)
  const [summaryData, setSummaryData] = useState(null)
  const [fullscreen, setFullscreen]   = useState(false)
  const containerRef = useRef(null)

  // Jitsi public server — no signup required
  const jitsiUrl = `https://meet.jit.si/${meeting.roomId}#userInfo.displayName="${encodeURIComponent('TaskFlow User')}"`

  const handleSummarize = async () => {
    setSummarizing(true)
    try {
      const { data } = await meetingAPI.summarize({ roomId: meeting.roomId, transcript: [] })
      setSummaryData(data.meeting)
      onSummarize?.(data.meeting)
      toast.success('AI summary generated! Email sent to participants.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate summary — check your Gemini API key')
    } finally { setSummarizing(false) }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setFullscreen(true)
    } else {
      document.exitFullscreen()
      setFullscreen(false)
    }
  }

  return (
    <>
      <div ref={containerRef}
        className={`flex flex-col bg-gray-950 ${fullscreen ? 'fixed inset-0 z-50' : 'h-[60vh] lg:h-[55vh] flex-shrink-0 border-b border-gray-800'}`}>

        {/* Meeting toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white text-sm font-semibold">{meeting.title}</span>
            <span className="text-gray-500 text-xs font-mono">{meeting.roomId}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSummarize} disabled={summarizing}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60">
              {summarizing ? <Loader2 size={12} className="animate-spin" /> : <Brain size={12} />}
              AI Summary
            </button>
            <button onClick={toggleFullscreen}
              className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
              {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button onClick={onEnd}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors">
              <PhoneOff size={12} /> End
            </button>
          </div>
        </div>

        {/* Jitsi iframe */}
        <iframe
          src={jitsiUrl}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          className="flex-1 w-full border-0 bg-gray-950"
          title="Jitsi Meeting"
        />
      </div>

      {summaryData && (
        <AISummaryModal
          meeting={summaryData}
          open={!!summaryData}
          onClose={() => setSummaryData(null)}
        />
      )}
    </>
  )
}
