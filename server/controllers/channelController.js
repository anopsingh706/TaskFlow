const asyncHandler = require('express-async-handler');
const Channel = require('../models/Channel');
const Message = require('../models/Message');
const User    = require('../models/User');

// GET /api/channels — all channels the current user belongs to
exports.getChannels = asyncHandler(async (req, res) => {
  const channels = await Channel.find({ members: req.user._id })
    .populate('members', 'name avatar status lastSeen')
    .populate('lastMessage.senderId', 'name')
    .sort({ 'lastMessage.createdAt': -1, updatedAt: -1 });
  res.json({ success: true, channels });
});

// POST /api/channels — create a group channel
exports.createChannel = asyncHandler(async (req, res) => {
  const { name, description, memberIds } = req.body;
  if (!name?.trim()) { res.status(400); throw new Error('Channel name is required'); }

  const uniqueIds = [...new Set([req.user._id.toString(), ...(memberIds || [])])];
  const channel = await Channel.create({
    name: name.trim(),
    description: description?.trim() || '',
    type: 'group',
    members: uniqueIds,
    createdBy: req.user._id,
  });
  const populated = await channel.populate('members', 'name avatar status');
  res.status(201).json({ success: true, channel: populated });
});

// POST /api/channels/dm — get or create a DM channel with another user
exports.getOrCreateDM = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) { res.status(400); throw new Error('userId is required'); }

  const otherUser = await User.findById(userId).select('name avatar status');
  if (!otherUser) { res.status(404); throw new Error('User not found'); }

  // Check if DM channel already exists between these two users
  let channel = await Channel.findOne({
    type: 'dm',
    dmParticipants: { $all: [req.user._id, userId], $size: 2 },
  }).populate('members', 'name avatar status lastSeen');

  if (!channel) {
    channel = await Channel.create({
      type: 'dm',
      members: [req.user._id, userId],
      dmParticipants: [req.user._id, userId],
      createdBy: req.user._id,
    });
    channel = await channel.populate('members', 'name avatar status lastSeen');
  }

  res.json({ success: true, channel });
});

// GET /api/channels/:id — single channel with member details
exports.getChannel = asyncHandler(async (req, res) => {
  const channel = await Channel.findOne({ _id: req.params.id, members: req.user._id })
    .populate('members', 'name avatar status lastSeen');
  if (!channel) { res.status(404); throw new Error('Channel not found'); }
  res.json({ success: true, channel });
});

// PUT /api/channels/:id — update group name/description (creator only)
exports.updateChannel = asyncHandler(async (req, res) => {
  const channel = await Channel.findById(req.params.id);
  if (!channel) { res.status(404); throw new Error('Channel not found'); }
  if (channel.createdBy.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Only the channel creator can edit it');
  }
  if (req.body.name)        channel.name        = req.body.name.trim();
  if (req.body.description) channel.description = req.body.description.trim();
  await channel.save();
  res.json({ success: true, channel });
});

// POST /api/channels/:id/members — add a member
exports.addMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const channel = await Channel.findOneAndUpdate(
    { _id: req.params.id, members: req.user._id },
    { $addToSet: { members: userId } },
    { new: true }
  ).populate('members', 'name avatar status');
  if (!channel) { res.status(404); throw new Error('Channel not found'); }
  res.json({ success: true, channel });
});

// DELETE /api/channels/:id/members/:userId — leave or remove member
exports.removeMember = asyncHandler(async (req, res) => {
  const channel = await Channel.findOneAndUpdate(
    { _id: req.params.id, members: req.user._id },
    { $pull: { members: req.params.userId } },
    { new: true }
  ).populate('members', 'name avatar status');
  if (!channel) { res.status(404); throw new Error('Channel not found'); }
  res.json({ success: true, channel });
});