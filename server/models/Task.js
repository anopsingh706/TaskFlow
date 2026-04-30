const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true, maxlength: 1000 },
}, { timestamps: true });

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String, required: [true, 'Title is required'],
      trim: true, maxlength: [200, 'Title too long'],
    },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    aiSuggestedPriority: { type: String, enum: ['high', 'medium', 'low', null], default: null },
    aiReason:            { type: String, default: '' },  // short explanation from Gemini
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate:    { type: Date, default: null },
    tags:       [{ type: String, trim: true, maxlength: 30 }],
    comments:   [commentSchema],
    order:      { type: Number, default: 0 },  // for Kanban column ordering
  },
  { timestamps: true }
);

taskSchema.index({ createdBy: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ title: 'text', description: 'text' });

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;