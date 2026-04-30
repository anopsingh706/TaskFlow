const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  emoji:  { type: String, required: true },
}, { _id: false });

const messageSchema = new mongoose.Schema(
  {
    channelId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true, index: true },
    senderId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    content:     { type: String, trim: true, maxlength: 4000, default: '' },
    type:        { type: String, enum: ['text', 'image', 'file', 'system'], default: 'text' },
    attachments: [{ url: String, name: String, size: Number, mimeType: String, isImage: Boolean }],
    reactions:   [reactionSchema],
    // Users who have read this message
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isEdited:  { type: Boolean, default: false },
    editedAt:  { type: Date },
    isDeleted: { type: Boolean, default: false },   // soft delete — keep for read receipt history
    deletedAt: { type: Date },
    // For replies/threads
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  },
  { timestamps: true }
);

// Compound index for efficient pagination (channel + time)
messageSchema.index({ channelId: 1, createdAt: -1 });
// Text search index
messageSchema.index({ content: 'text' });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;