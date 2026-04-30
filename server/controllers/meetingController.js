const asyncHandler  = require('express-async-handler');
const { v4: uuidv4 }= require('uuid');
const Meeting       = require('../models/Meeting');
const User          = require('../models/User');
const Notification  = require('../models/Notification');
const { summarizeMeeting } = require('../services/geminiService');
const { sendMeetingSummary } = require('../services/emailService');

// ── POST /api/meetings/room ── create instant meeting
exports.createRoom = asyncHandler(async (req, res) => {
  const { title, scheduledFor, inviteUserIds } = req.body;

  const roomId = uuidv4().replace(/-/g, '').slice(0, 12); // short unique ID
  const participants = [req.user._id, ...(inviteUserIds || [])];

  const meeting = await Meeting.create({
    title:        title?.trim() || `Meeting – ${new Date().toLocaleDateString()}`,
    roomId,
    hostId:       req.user._id,
    participants: [...new Set(participants.map(String))],
    scheduledFor: scheduledFor || null,
    status:       scheduledFor ? 'scheduled' : 'active',
  });

  const populated = await meeting.populate('hostId participants', 'name email avatar');

  // Send in-app notifications to invited users
  const io = req.app.get('io');
  for (const uid of (inviteUserIds || [])) {
    const notif = await Notification.create({
      userId:       uid,
      type:         'meeting_invite',
      title:        'Meeting Invite',
      content:      `${req.user.name} invited you to "${meeting.title}"`,
      relatedId:    meeting._id,
      relatedModel: 'Meeting',
      link:         `/meetings/${meeting.roomId}`,
    });
    io?.to(`user:${uid}`).emit('notification', notif);
  }

  res.status(201).json({ success: true, meeting: populated });
});

// ── GET /api/meetings/history ── past meetings for current user
exports.getHistory = asyncHandler(async (req, res) => {
  const meetings = await Meeting.find({
    $or: [{ hostId: req.user._id }, { participants: req.user._id }],
  })
    .populate('hostId participants', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({ success: true, meetings });
});

// ── GET /api/meetings/:roomId ── get meeting by roomId
exports.getMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findOne({ roomId: req.params.roomId })
    .populate('hostId participants', 'name avatar email');
  if (!meeting) { res.status(404); throw new Error('Meeting not found'); }
  res.json({ success: true, meeting });
});

// ── POST /api/meetings/:roomId/end ── end a meeting
exports.endMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findOneAndUpdate(
    { roomId: req.params.roomId, hostId: req.user._id },
    { status: 'ended', endTime: new Date() },
    { new: true }
  ).populate('hostId participants', 'name avatar email');

  if (!meeting) { res.status(404); throw new Error('Meeting not found or not your meeting'); }
  res.json({ success: true, meeting });
});

// ── POST /api/meetings/summarize ── generate AI summary + email
exports.summarize = asyncHandler(async (req, res) => {
  if ((req.user?.plan || 'free') === 'free') {
    res.status(403);
    throw new Error('Meeting AI summary is available on Pro and Team plans');
  }
  const { roomId, transcript } = req.body;
  if (!roomId) { res.status(400); throw new Error('roomId required'); }

  const meeting = await Meeting.findOne({ roomId })
    .populate('hostId participants', 'name email avatar');
  if (!meeting) { res.status(404); throw new Error('Meeting not found'); }

  // Calculate duration
  const startMs  = new Date(meeting.startTime).getTime();
  const endMs    = meeting.endTime ? new Date(meeting.endTime).getTime() : Date.now();
  const minutes  = Math.round((endMs - startMs) / 60000);
  const duration = minutes < 60 ? `${minutes} min` : `${Math.floor(minutes/60)}h ${minutes%60}m`;

  const participantNames = meeting.participants.map(p => p.name);

  // Generate Gemini summary
  const summary = await summarizeMeeting(
    meeting.title, participantNames, transcript || [], duration
  );

  // Save summary to meeting
  meeting.aiSummary = {
    keyPoints:   summary.keyPoints   || [],
    actionItems: summary.actionItems || [],
    generatedAt: new Date(),
  };
  if (transcript?.length) meeting.transcript = transcript;
  if (meeting.status !== 'ended') { meeting.status = 'ended'; meeting.endTime = new Date(); }
  await meeting.save();

  // Send email to all participants who have email
  const emails = meeting.participants.filter(p => p.email).map(p => p.email);
  if (emails.length) {
    sendMeetingSummary({
      to:           emails,
      meetingTitle: meeting.title,
      keyPoints:    summary.keyPoints || [],
      actionItems:  summary.actionItems || [],
      duration,
    }).catch(err => console.error('Email send error:', err.message));
  }

  // Send in-app notifications to all participants
  const io = req.app.get('io');
  for (const participant of meeting.participants) {
    const notif = await Notification.create({
      userId:       participant._id,
      type:         'meeting_summary',
      title:        'Meeting Summary Ready',
      content:      `AI summary for "${meeting.title}" is ready`,
      relatedId:    meeting._id,
      relatedModel: 'Meeting',
      link:         '/meetings',
    });
    io?.to(`user:${participant._id}`).emit('notification', notif);
  }

  res.json({ success: true, meeting, summary });
});