import { useState } from 'react'
import { X, Brain, CheckCircle, FileText, Loader2, Mail } from 'lucide-react'
import { meetingAPI } from '../../api/meetings'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function AISummaryModal({ meeting, open, onClose }) {
  const [generating, setGenerating] = useState(false)
  const [localMeeting, setLocalMeeting] = useState(null)

  if (!open || !meeting) return null

  const data = localMeeting || meeting
  const hasSummary = data.aiSummary?.keyPoints?.length > 0

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const { data: res } = await meetingAPI.summarize({ roomId: meeting.roomId, transcript: [] })
      setLocalMeeting(res.meeting)
      toast.success('Summary generated! Email sent to all participants.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate summary')
    } finally { setGenerating(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-scale-in overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
              <Brain size={18} className="text-violet-600" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-gray-900 text-base leading-tight">AI Meeting Summary</h2>
              <p className="text-xs text-gray-400">{data.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5 text-gray-400"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">

          {/* Meeting meta */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Date',    value: format(new Date(data.createdAt), 'MMM d, yyyy') },
              { label: 'Status',  value: data.status },
              { label: 'Participants', value: data.participants?.length || 0 },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-sm font-semibold text-gray-800 capitalize">{value}</p>
              </div>
            ))}
          </div>

          {hasSummary ? (
            <>
              {/* Generated at */}
              {data.aiSummary.generatedAt && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <CheckCircle size={12} className="text-emerald-500" />
                  Generated {format(new Date(data.aiSummary.generatedAt), 'MMM d, h:mm a')} · Email sent to participants
                </div>
              )}

              {/* Key Points */}
              <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-violet-700 mb-3">
                  <FileText size={14} /> Key Points
                </h3>
                <ul className="space-y-2">
                  {data.aiSummary.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-violet-800">
                      <span className="w-5 h-5 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Items */}
              {data.aiSummary.actionItems?.length > 0 && (
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-orange-700 mb-3">
                    <CheckCircle size={14} /> Action Items
                  </h3>
                  <ul className="space-y-2">
                    {data.aiSummary.actionItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-orange-800">
                        <div className="w-4 h-4 border-2 border-orange-400 rounded flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Regenerate */}
              <button onClick={handleGenerate} disabled={generating}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-gray-500 hover:text-violet-600 border border-dashed border-gray-200 hover:border-violet-300 rounded-xl transition-colors">
                {generating ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
                Regenerate summary
              </button>
            </>
          ) : (
            /* No summary yet */
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mb-4">
                <Brain size={28} className="text-violet-400" />
              </div>
              <h3 className="font-display font-semibold text-gray-900 mb-2">No summary yet</h3>
              <p className="text-sm text-gray-400 mb-6 max-w-xs">
                Generate an AI summary of this meeting. Gemini will extract key points and action items, then email them to all participants.
              </p>
              <button onClick={handleGenerate} disabled={generating}
                className="btn-primary gap-2">
                {generating
                  ? <><Loader2 size={15} className="animate-spin" /> Generating…</>
                  : <><Brain size={15} /> Generate with Gemini AI</>
                }
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Mail size={11} />
            Summary emails are automatically sent to all {data.participants?.length || 0} participants
          </div>
        </div>
      </div>
    </div>
  )
}
