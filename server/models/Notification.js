const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['mention', 'task_assigned', 'meeting_summary', 'meeting_invite', 'new_message'],
      required: true,
    },
    title:   { type: String, required: true, maxlength: 100 },
    content: { type: String, required: true, maxlength: 500 },
    // Polymorphic reference — could point to a Message, Task, Meeting, etc.
    relatedId:   { type: mongoose.Schema.Types.ObjectId, default: null },
    relatedModel:{ type: String, enum: ['Message','Task','Meeting','Channel', null], default: null },
    isRead:  { type: Boolean, default: false },
    // Deep-link to the relevant page in the app
    link:    { type: String, default: '' },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;