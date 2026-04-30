const asyncHandler = require('express-async-handler');
const { suggestTaskPriority, summarizeChat, suggestSmartReply } = require('../services/geminiService');

exports.suggestPriority = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title?.trim()) { res.status(400); throw new Error('Task title is required'); }
  const result = await suggestTaskPriority(title.trim(), description?.trim() || '');
  res.json({ success: true, ...result });
});

exports.summarizeChat = asyncHandler(async (req, res) => {
  if ((req.user?.plan || 'free') === 'free') {
    res.status(403);
    throw new Error('Chat summarization is available on Pro and Team plans');
  }
  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400); throw new Error('messages array is required');
  }
  const summary = await summarizeChat(messages);
  res.json({ success: true, summary });
});

exports.smartReply = asyncHandler(async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400); throw new Error('messages array is required');
  }
  const replies = await suggestSmartReply(messages);
  res.json({ success: true, replies });
});