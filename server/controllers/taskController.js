const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const User = require('../models/User');

// ── GET /api/tasks ── all tasks visible to user (created by me OR assigned to me)
exports.getTasks = asyncHandler(async (req, res) => {
  const { status, priority, view } = req.query;
  const userId = req.user._id;

  let filter = {};
  if (view === 'assigned') filter = { assignedTo: userId };
  else if (view === 'created') filter = { createdBy: userId };
  else filter = { $or: [{ createdBy: userId }, { assignedTo: userId }] };

  if (status)   filter.status   = status;
  if (priority) filter.priority = priority;

  const tasks = await Task.find(filter)
    .populate('assignedTo', 'name avatar email')
    .populate('createdBy',  'name avatar')
    .sort({ order: 1, createdAt: -1 });

  res.json({ success: true, tasks });
});

// ── GET /api/tasks/assigned ── tasks assigned to me
exports.getAssignedTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ assignedTo: req.user._id })
    .populate('createdBy', 'name avatar')
    .sort({ dueDate: 1, createdAt: -1 });
  res.json({ success: true, tasks });
});

// ── GET /api/tasks/:id ── single task
exports.getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name avatar email')
    .populate('createdBy',  'name avatar')
    .populate('comments.userId', 'name avatar');
  if (!task) { res.status(404); throw new Error('Task not found'); }
  res.json({ success: true, task });
});

// ── POST /api/tasks ── create task
exports.createTask = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(400); throw new Error(errors.array()[0].msg); }

  const { title, description, priority, status, assignedTo, dueDate, tags, aiSuggestedPriority, aiReason } = req.body;

  const task = await Task.create({
    title:               title.trim(),
    description:         description?.trim() || '',
    priority:            priority || 'medium',
    status:              status   || 'todo',
    assignedTo:          assignedTo || null,
    createdBy:           req.user._id,
    dueDate:             dueDate   || null,
    tags:                tags      || [],
    aiSuggestedPriority: aiSuggestedPriority || null,
    aiReason:            aiReason  || '',
  });

  const populated = await task.populate([
    { path: 'assignedTo', select: 'name avatar email' },
    { path: 'createdBy',  select: 'name avatar' },
  ]);

  res.status(201).json({ success: true, task: populated });
});

// ── PUT /api/tasks/:id ── update task
exports.updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) { res.status(404); throw new Error('Task not found'); }

  // Only creator or assignee can update
  const isCreator  = task.createdBy.toString() === req.user._id.toString();
  const isAssignee = task.assignedTo?.toString() === req.user._id.toString();
  if (!isCreator && !isAssignee) { res.status(403); throw new Error('Not authorised to update this task'); }

  const allowed = ['title', 'description', 'priority', 'status', 'assignedTo', 'dueDate', 'tags', 'order', 'aiSuggestedPriority', 'aiReason'];
  allowed.forEach(field => {
    if (req.body[field] !== undefined) task[field] = req.body[field];
  });

  await task.save();
  const populated = await task.populate([
    { path: 'assignedTo', select: 'name avatar email' },
    { path: 'createdBy',  select: 'name avatar' },
  ]);
  res.json({ success: true, task: populated });
});

// ── PATCH /api/tasks/reorder ── bulk update order + status (Kanban drag)
exports.reorderTasks = asyncHandler(async (req, res) => {
  const { updates } = req.body;  // [{ _id, status, order }]
  if (!Array.isArray(updates)) { res.status(400); throw new Error('updates array required'); }

  const ops = updates.map(u =>
    Task.findByIdAndUpdate(u._id, { status: u.status, order: u.order })
  );
  await Promise.all(ops);
  res.json({ success: true });
});

// ── DELETE /api/tasks/:id ── delete task
exports.deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) { res.status(404); throw new Error('Task not found'); }
  if (task.createdBy.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Only the task creator can delete it');
  }
  await task.deleteOne();
  res.json({ success: true, message: 'Task deleted' });
});

// ── POST /api/tasks/:id/comments ── add comment
exports.addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) { res.status(400); throw new Error('Comment content required'); }

  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { $push: { comments: { userId: req.user._id, content: content.trim() } } },
    { new: true }
  ).populate('comments.userId', 'name avatar');

  if (!task) { res.status(404); throw new Error('Task not found'); }
  res.json({ success: true, comments: task.comments });
});