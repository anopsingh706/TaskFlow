import { useEffect, useState } from 'react'
import { Video, Plus, Clock, Users, Loader2, ExternalLink, Brain, Mail } from 'lucide-react'
import { meetingAPI } from '../api/meetings'
import { authAPI }    from '../api/auth'
import MeetingRoom    from '../components/meetings/MeetingRoom'
import CreateMeetingModal from '../components/meetings/CreateMeetingModal'
import AISummaryModal from '../components/meetings/AISummaryModal'
import { formatDistanceToNow, format } from 'date-fns'
import toast from 'react-hot-toast'

export default function MeetingsPage() {
  const [meetings, setMeetings]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [activeMeeting, setActiveMeeting] = useState(null) // currently in a call
  const [showCreate, setShowCreate]   = useState(false)
  const [summaryMeeting, setSummaryMeeting] = useState(null)

  useEffect(() => { loadHistory() }, [])

  const loadHistory = async () => {
    try {
      const { data } = await meetingAPI.getHistory()
      setMeetings(data.meetings)
    } catch { toast.error('Failed to load meetings') }
    finally { setLoading(false) }
  }

  const handleCreateMeeting = async (formData) => {
    try {
      const { data } = await meetingAPI.create(formData)
      setMeetings(prev => [data.meeting, ...prev])
      setActiveMeeting(data.meeting)
      setShowCreate(false)
      toast.success('Meeting room created!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create meeting')
    }
  }

  const handleEndMeeting = async (roomId) => {
    try {
      await meetingAPI.end(roomId)
      setActiveMeeting(null)
      loadHistory()
      toast.success('Meeting ended')
    } catch { toast.error('Failed to end meeting') }
  }

  const statusColor = (s) =>
    s === 'active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    : s === 'ended' ? 'bg-gray-100 text-gray-500 ring-gray-200'
    : 'bg-violet-50 text-violet-700 ring-violet-200'

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Active call — Jitsi iframe */}
      {activeMeeting && (
        <MeetingRoom
          meeting={activeMeeting}
          onEnd={() => handleEndMeeting(activeMeeting.roomId)}
          onSummarize={(meeting) => setSummaryMeeting(meeting)}
        />
      )}

      {/* Main content (hidden during call on mobile) */}
      <div className={activeMeeting ? 'hidden lg:flex flex-col flex-1 overflow-hidden' : 'flex flex-col flex-1 overflow-hidden'}>
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between">
          <div>
            <h1 className="font-display font-semibold text-xl text-gray-900">Video Meetings</h1>
            <p className="text-xs text-gray-400 mt-0.5">HD video powered by Jitsi · AI summaries by Gemini</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary !px-4 !py-2.5 !text-sm gap-1.5">
            <Plus size={16} /> New Meeting
          </button>
        </div>

        {/* Meeting history */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="text-violet-400 animate-spin" />
            </div>
          ) : meetings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-violet-50 rounded-3xl flex items-center justify-center mb-5">
                <Video size={36} className="text-violet-400" />
              </div>
              <h3 className="font-display font-semibold text-gray-900 text-xl mb-2">No meetings yet</h3>
              <p className="text-gray-400 text-sm mb-6 max-w-xs">Start an instant meeting or schedule one for later.</p>
              <button onClick={() => setShowCreate(true)} className="btn-primary">
                <Plus size={16} /> Start your first meeting
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-w-3xl">
              {meetings.map(meeting => (
                <div key={meeting._id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-violet-200 hover:shadow-sm transition-all"
                  style={{ boxShadow:'0 0 0 1px rgba(91,79,233,0.04),0 2px 8px rgba(91,79,233,0.04)' }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Video size={18} className="text-violet-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{meeting.title}</h3>
                        <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Clock size={11}/>{formatDistanceToNow(new Date(meeting.createdAt), { addSuffix: true })}</span>
                          <span className="flex items-center gap-1"><Users size={11}/>{meeting.participants?.length || 0} participants</span>
                          <span className="font-mono text-gray-300">{meeting.roomId}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`badge ring-1 text-xs ${statusColor(meeting.status)}`}>
                        {meeting.status}
                      </span>
                      {meeting.status !== 'ended' && (
                        <button onClick={() => setActiveMeeting(meeting)}
                          className="btn-primary !px-3 !py-1.5 !text-xs gap-1">
                          <ExternalLink size={12} /> Join
                        </button>
                      )}
                      {meeting.aiSummary?.keyPoints?.length > 0 && (
                        <button onClick={() => setSummaryMeeting(meeting)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-3 py-1.5 rounded-xl transition-colors">
                          <Brain size={12} /> Summary
                        </button>
                      )}
                    </div>
                  </div>

                  {/* AI Summary preview */}
                  {meeting.aiSummary?.keyPoints?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-50">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">AI Summary</p>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {meeting.aiSummary.keyPoints[0]}
                        {meeting.aiSummary.keyPoints.length > 1 && ` · +${meeting.aiSummary.keyPoints.length - 1} more`}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateMeetingModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreateMeeting}
      />

      <AISummaryModal
        meeting={summaryMeeting}
        open={!!summaryMeeting}
        onClose={() => setSummaryMeeting(null)}
      />
    </div>
  )
}
