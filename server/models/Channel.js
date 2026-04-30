const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [80, 'Channel name cannot exceed 80 characters'],
    },
    description: { type: String, trim: true, maxlength: 200, default: '' },
    // 'dm' = direct message between 2 users, 'group' = named group
    type: { type: String, enum: ['dm', 'group'], default: 'group' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // For DMs, store the two participant IDs for quick lookup
    dmParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    avatar: { type: String, default: '' },
    // Track last message for sidebar preview
    lastMessage: {
      content:   { type: String, default: '' },
      senderId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date },
    },
    // Unread count per user: { userId: count }
    unreadCounts: { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
);

// Index for fast DM lookup between two specific users
channelSchema.index({ type: 1, dmParticipants: 1 });
channelSchema.index({ members: 1 });

const Channel = mongoose.model('Channel', channelSchema);
module.exports = Channel;