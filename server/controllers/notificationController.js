const asyncHandler   = require('express-async-handler');
const Notification   = require('../models/Notification');

// ── GET /api/notifications ── get notifications for current user
exports.getNotifications = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page  || '1');
  const limit = parseInt(req.query.limit || '20');

  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Notification.countDocuments({ userId: req.user._id, isRead: false }),
  ]);

  res.json({ success: true, notifications, unreadCount });
});

// ── PUT /api/notifications/:id/read ── mark one as read
exports.markRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isRead: true }
  );
  res.json({ success: true });
});

// ── PUT /api/notifications/read-all ── mark all as read
exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { isRead: true }
  );
  res.json({ success: true });
});

// ── DELETE /api/notifications/:id ── delete notification
exports.deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  res.json({ success: true });
});