const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
  {
    title:  { type: String, trim: true, maxlength: 200, default: 'Untitled Meeting' },
    roomId: { type: String, unique: true, required: true, index: true },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    startTime:  { type: Date, default: Date.now },
    endTime:    { type: Date, default: null },
    scheduledFor: { type: Date, default: null },
    status: {
      type: String,
      enum: ['scheduled', 'active', 'ended'],
      default: 'active',
    },
    aiSummary: {
      keyPoints:   [String],
      actionItems: [String],
      generatedAt: { type: Date, default: null },
    },
    // Raw transcript lines fed to Gemini
    transcript: [{ speaker: String, text: String, timestamp: Date }],
  },
  { timestamps: true }
);

meetingSchema.index({ hostId: 1, createdAt: -1 });
meetingSchema.index({ participants: 1 });

const Meeting = mongoose.model('Meeting', meetingSchema);
module.exports = Meeting;