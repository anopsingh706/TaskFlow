import { Video, Clock, Users, Brain } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const STATUS_STYLE = {
  active:    'bg-emerald-50 text-emerald-700 ring-emerald-200',
  ended:     'bg-gray-100 text-gray-500 ring-gray-200',
  scheduled: 'bg-violet-50 text-violet-700 ring-violet-200',
}

export default function MeetingHistoryCard({ meeting, onJoin, onViewSummary }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-violet-200 hover:shadow-sm transition-all"
      style={{ boxShadow:'0 0 0 1px rgba(91,79,233,0.04),0 2px 8px rgba(91,79,233,0.04)' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Video size={16} className="text-violet-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{meeting.title}</h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {formatDistanceToNow(new Date(meeting.createdAt), { addSuffix: true })}
              </span>
              <span className="flex items-center gap-1">
                <Users size={10} />
                {meeting.participants?.length || 0}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`badge ring-1 text-[10px] ${STATUS_STYLE[meeting.status] || STATUS_STYLE.ended}`}>
            {meeting.status}
          </span>
          {meeting.status !== 'ended' && (
            <button onClick={() => onJoin(meeting)}
              className="text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-2.5 py-1 rounded-lg transition-colors">
              Join
            </button>
          )}
          {meeting.aiSummary?.keyPoints?.length > 0 && (
            <button onClick={() => onViewSummary(meeting)}
              className="text-xs font-semibold text-gray-500 hover:text-violet-600 bg-gray-50 hover:bg-violet-50 border border-gray-200 hover:border-violet-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1">
              <Brain size={10} /> AI
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
