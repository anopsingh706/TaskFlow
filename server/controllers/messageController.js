const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const Channel = require('../models/Channel');

// GET /api/messages/:channelId — paginated messages (newest last)
exports.getMessages = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const page  = parseInt(req.query.page  || '1');
  const limit = parseInt(req.query.limit || '50');
  const skip  = (page - 1) * limit;

  // Ensure user is a member of this channel
  const channel = await Channel.findOne({ _id: channelId, members: req.user._id });
  if (!channel) { res.status(403); throw new Error('Access denied to this channel'); }

  const [messages, total] = await Promise.all([
    Message.find({ channelId, isDeleted: false })
      .populate('senderId', 'name avatar status')
      .populate('replyTo', 'content senderId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Message.countDocuments({ channelId, isDeleted: false }),
  ]);

  // Reset unread count for this user in this channel
  await Channel.findByIdAndUpdate(channelId, {
    [`unreadCounts.${req.user._id}`]: 0,
  });

  res.json({
    success: true,
    messages: messages.reverse(), // return oldest-first for rendering
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// GET /api/messages/search?q=&channelId= — full-text search
exports.searchMessages = asyncHandler(async (req, res) => {
  const { q, channelId } = req.query;
  if (!q?.trim()) { res.status(400); throw new Error('Search query required'); }

  const filter = { $text: { $search: q }, isDeleted: false };
  if (channelId) {
    const channel = await Channel.findOne({ _id: channelId, members: req.user._id });
    if (!channel) { res.status(403); throw new Error('Access denied'); }
    filter.channelId = channelId;
  }

  const messages = await Message.find(filter)
    .populate('senderId', 'name avatar')
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
    .limit(30);

  res.json({ success: true, messages });
});

// PUT /api/messages/:id — edit a message
exports.editMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) { res.status(400); throw new Error('Content required'); }

  const message = await Message.findOne({ _id: req.params.id, senderId: req.user._id, isDeleted: false });
  if (!message) { res.status(404); throw new Error('Message not found or not yours'); }

  message.content  = content.trim();
  message.isEdited = true;
  message.editedAt = new Date();
  await message.save();

  const populated = await message.populate('senderId', 'name avatar');
  res.json({ success: true, message: populated });
});

// DELETE /api/messages/:id — soft-delete
exports.deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findOne({ _id: req.params.id, senderId: req.user._id });
  if (!message) { res.status(404); throw new Error('Message not found or not yours'); }

  message.isDeleted = true;
  message.deletedAt = new Date();
  message.content   = '';
  await message.save();

  res.json({ success: true, messageId: req.params.id });
});

// POST /api/messages/:id/react — toggle emoji reaction
exports.reactToMessage = asyncHandler(async (req, res) => {
  const { emoji } = req.body;
  if (!emoji) { res.status(400); throw new Error('Emoji required'); }

  const message = await Message.findById(req.params.id);
  if (!message) { res.status(404); throw new Error('Message not found'); }

  const existing = message.reactions.findIndex(
    r => r.userId.toString() === req.user._id.toString() && r.emoji === emoji
  );

  if (existing >= 0) {
    message.reactions.splice(existing, 1); // toggle off
  } else {
    message.reactions.push({ userId: req.user._id, emoji });
  }

  await message.save();
  res.json({ success: true, reactions: message.reactions });
});

// POST /api/messages/:id/read — mark a message as read
exports.markRead = asyncHandler(async (req, res) => {
  await Message.findByIdAndUpdate(req.params.id, {
    $addToSet: { readBy: req.user._id },
  });
  res.json({ success: true });
});