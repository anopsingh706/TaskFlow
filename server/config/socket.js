const { Server } = require('socket.io');
const jwt        = require('jsonwebtoken');
const User       = require('../models/User');
const Message    = require('../models/Message');
const Channel    = require('../models/Channel');

// Map of userId -> Set of socketIds (a user can have multiple tabs open)
const onlineUsers = new Map();

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin:      process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
    pingTimeout:  60000,
    pingInterval: 25000,
    maxHttpBufferSize: 10 * 1024 * 1024, // 10 MB — needed for image base64 payloads
  });

  // ── Auth middleware: verify JWT before any socket connects ──
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user    = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.user = user;   // attach user to socket for use in handlers
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    console.log(`🟢 Socket connected: ${socket.user.name} (${socket.id})`);

    // ── Track online users ──────────────────────────────────
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    // Mark user online in DB
    await User.findByIdAndUpdate(userId, { status: 'online' });

    // Broadcast online status to everyone
    io.emit('user_status', { userId, status: 'online' });

    // ── Join personal room for targeted notifications ────────
    socket.join(`user:${userId}`);

    // ── Auto-join all user's channel rooms ──────────────────
    const channels = await Channel.find({ members: userId }).select('_id');
    channels.forEach(ch => socket.join(ch._id.toString()));
    console.log(`   ↳ Joined ${channels.length} channel rooms + personal room`);

    // ══════════════════════════════════════════════════════
    // EVENT: send_message
    // ══════════════════════════════════════════════════════
    socket.on('send_message', async (data, callback) => {
      try {
        const { channelId, content, replyTo, attachments: rawAttachments } = data;

        // Must have either text content OR attachments
        if (!content?.trim() && !rawAttachments?.length) return;

        // Verify membership
        const channel = await Channel.findOne({ _id: channelId, members: userId });
        if (!channel) return callback?.({ error: 'Not a member of this channel' });

        // Sanitise attachments — only keep safe fields, strip any extra keys
        const attachments = (rawAttachments || []).slice(0, 5).map(a => ({
          url:     a.url      || '',
          name:    a.name     || 'file',
          size:    a.size     || 0,
          mimeType:a.mimeType || 'application/octet-stream',
          isImage: Boolean(a.isImage || (a.mimeType && a.mimeType.startsWith('image/'))),
        }));

        // Determine message type
        const hasImages = attachments.some(a => a.isImage);
        const hasFiles  = attachments.some(a => !a.isImage);
        const msgType   = attachments.length > 0
          ? (hasImages && !hasFiles ? 'image' : 'file')
          : 'text';

        const message = await Message.create({
          channelId,
          senderId:    userId,
          content:     content?.trim() || '',
          type:        msgType,
          attachments,
          replyTo:     replyTo || null,
        });

        const populated = await Message.findById(message._id)
          .populate('senderId', 'name avatar status')
          .populate('replyTo', 'content senderId');

        // Update channel's lastMessage preview
        const preview = message.content ||
          (attachments.length > 0
            ? (attachments[0].isImage ? '📷 Photo' : `📎 ${attachments[0].name}`)
            : '');
        await Channel.findByIdAndUpdate(channelId, {
          lastMessage: { content: preview, senderId: userId, createdAt: message.createdAt },
        });

        // Increment unread count for all members EXCEPT sender
        const updateOps = {};
        channel.members.forEach(mId => {
          const mid = mId.toString();
          if (mid !== userId) updateOps[`unreadCounts.${mid}`] = 1;
        });
        if (Object.keys(updateOps).length) {
          await Channel.findByIdAndUpdate(channelId, { $inc: updateOps });
        }

        // Emit to everyone in the channel room (including sender)
        io.to(channelId).emit('new_message', { message: populated });

        // ── @mention detection ──────────────────────────────
        const mentionRegex = /@(\w+)/g;
        const mentionedNames = [];
        let match;
        while ((match = mentionRegex.exec(content || '')) !== null) {
          mentionedNames.push(match[1].toLowerCase());
        }

        if (mentionedNames.length > 0) {
          // Find users whose names match the mentions
          const mentionedUsers = channel.members.filter(mId => mId.toString() !== userId);
          for (const memberId of mentionedUsers) {
            const memberUser = await User.findById(memberId).select('name');
            if (memberUser && mentionedNames.some(m => memberUser.name.toLowerCase().startsWith(m))) {
              const Notification = require('../models/Notification');
              const notif = await Notification.create({
                userId:       memberId,
                type:         'mention',
                title:        `${socket.user.name} mentioned you`,
                content:      content?.slice(0, 100) || 'You were mentioned',
                relatedId:    message._id,
                relatedModel: 'Message',
                link:         `/chat/${channelId}`,
              });
              io.to(`user:${memberId}`).emit('notification', notif);
            }
          }
        }

        callback?.({ success: true, message: populated });
      } catch (err) {
        console.error('send_message error:', err.message);
        callback?.({ error: 'Failed to send message' });
      }
    });

    // ══════════════════════════════════════════════════════
    // EVENT: typing
    // ══════════════════════════════════════════════════════
    socket.on('typing', ({ channelId, isTyping }) => {
      socket.to(channelId).emit('user_typing', {
        userId,
        channelId,
        isTyping,
        name: socket.user.name,
      });
    });

    // ══════════════════════════════════════════════════════
    // EVENT: mark_read
    // ══════════════════════════════════════════════════════
    socket.on('mark_read', async ({ channelId, messageIds }) => {
      try {
        await Message.updateMany(
          { _id: { $in: messageIds }, channelId },
          { $addToSet: { readBy: userId } }
        );
        await Channel.findByIdAndUpdate(channelId, {
          [`unreadCounts.${userId}`]: 0,
        });
        // Tell the sender their message was read
        socket.to(channelId).emit('messages_read', { channelId, userId, messageIds });
      } catch (err) {
        console.error('mark_read error:', err.message);
      }
    });

    // ══════════════════════════════════════════════════════
    // EVENT: join_room (when user opens a channel)
    // ══════════════════════════════════════════════════════
    socket.on('join_room', ({ channelId }) => {
      socket.join(channelId);
    });

    // ══════════════════════════════════════════════════════
    // EVENT: react_to_message
    // ══════════════════════════════════════════════════════
    socket.on('react_to_message', async ({ messageId, emoji }, callback) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return callback?.({ error: 'Message not found' });

        const idx = message.reactions.findIndex(
          r => r.userId.toString() === userId && r.emoji === emoji
        );
        if (idx >= 0) message.reactions.splice(idx, 1);
        else message.reactions.push({ userId, emoji });

        await message.save();

        io.to(message.channelId.toString()).emit('reaction_updated', {
          messageId,
          reactions: message.reactions,
        });
        callback?.({ success: true, reactions: message.reactions });
      } catch (err) {
        console.error('react_to_message error:', err.message);
      }
    });

    // ══════════════════════════════════════════════════════
    // EVENT: edit_message
    // ══════════════════════════════════════════════════════
    socket.on('edit_message', async ({ messageId, content }, callback) => {
      try {
        const message = await Message.findOne({ _id: messageId, senderId: userId });
        if (!message) return callback?.({ error: 'Not your message' });

        message.content  = content.trim();
        message.isEdited = true;
        message.editedAt = new Date();
        await message.save();

        io.to(message.channelId.toString()).emit('message_edited', {
          messageId,
          content: message.content,
          isEdited: true,
        });
        callback?.({ success: true });
      } catch (err) {
        console.error('edit_message error:', err.message);
      }
    });

    // ══════════════════════════════════════════════════════
    // EVENT: delete_message
    // ══════════════════════════════════════════════════════
    socket.on('delete_message', async ({ messageId }, callback) => {
      try {
        const message = await Message.findOne({ _id: messageId, senderId: userId });
        if (!message) return callback?.({ error: 'Not your message' });

        message.isDeleted = true;
        message.content   = '';
        await message.save();

        io.to(message.channelId.toString()).emit('message_deleted', { messageId });
        callback?.({ success: true });
      } catch (err) {
        console.error('delete_message error:', err.message);
      }
    });

    // ══════════════════════════════════════════════════════
    // DISCONNECT
    // ══════════════════════════════════════════════════════
    socket.on('disconnect', async () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          await User.findByIdAndUpdate(userId, { status: 'offline', lastSeen: new Date() });
          io.emit('user_status', { userId, status: 'offline' });
          console.log(`🔴 Socket disconnected: ${socket.user.name}`);
        }
      }
    });
  });

  return io;
};

module.exports = { initSocket };