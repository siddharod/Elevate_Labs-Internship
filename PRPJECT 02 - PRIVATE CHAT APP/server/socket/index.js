const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

// Map to track active user socket IDs: userId -> Set of socketId
const userSocketMap = new Map();

const populateMessage = (query) =>
  query
    .populate('sender', 'username email avatar profilePicture isOnline lastSeen')
    .populate('replyTo.messageId', 'content type sender fileUrl fileName')
    .populate('reactions.users', 'username avatar');

const initSocket = (io) => {
  // ─── AUTH MIDDLEWARE ──────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1] ||
        socket.handshake.query?.token;

      if (!token) return next(new Error('Authentication error: Token not provided'));

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'chat_app_jwt_super_secret_key_2026_production_grade'
      );

      const user = await User.findById(decoded.id).select('_id username email avatar profilePicture');
      if (!user) return next(new Error('Authentication error: User not found'));

      socket.user = user;
      socket.userId = user._id.toString();
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  // ─── CONNECTION ───────────────────────────────────────────────────────────
  io.on('connection', async (socket) => {
    const userId = socket.userId;
    console.log(`[Socket] Connected: ${socket.user.username} (${socket.id})`);

    // Track socket
    if (!userSocketMap.has(userId)) userSocketMap.set(userId, new Set());
    userSocketMap.get(userId).add(socket.id);

    // Update online status
    await User.findByIdAndUpdate(userId, { onlineStatus: true, lastSeen: new Date() });
    io.emit('user_online', { userId });

    // Send current online users list
    socket.emit('get_online_users', Array.from(userSocketMap.keys()));

    // Join personal notification room
    socket.join(`user:${userId}`);

    // ─── JOIN / LEAVE CONVERSATION ──────────────────────────────────────────
    socket.on('join_conversation', async (conversationId) => {
      try {
        if (!conversationId) return;
        const conv = await Conversation.findById(conversationId);
        if (!conv) return socket.emit('error_message', 'Conversation not found');
        const isMember = conv.participants.some((p) => p.toString() === userId);
        if (!isMember) return socket.emit('error_message', 'Unauthorized');
        socket.join(conversationId.toString());
      } catch (err) {
        console.error('join_conversation error:', err);
      }
    });

    socket.on('leave_conversation', (conversationId) => {
      if (conversationId) socket.leave(conversationId.toString());
    });

    // ─── SEND MESSAGE ───────────────────────────────────────────────────────
    socket.on('send_message', async (payload) => {
      try {
        const {
          conversationId,
          text,
          content,
          type = 'text',
          fileUrl,
          fileName,
          fileType,
          fileSize,
          voiceDuration,
          replyTo
        } = payload;

        const messageContent = (content || text || '').trim();

        if (!conversationId) return socket.emit('error_message', 'Missing conversationId');
        if (type === 'text' && !messageContent) return socket.emit('error_message', 'Empty message');

        const conv = await Conversation.findById(conversationId);
        if (!conv) return socket.emit('error_message', 'Conversation not found');
        if (!conv.participants.some((p) => p.toString() === userId))
          return socket.emit('error_message', 'Not a participant');

        const msgData = {
          conversation: conversationId,
          sender: userId,
          type,
          content: messageContent,
          status: 'sent',
          readBy: [{ user: userId, readAt: new Date() }]
        };

        if (fileUrl) { msgData.fileUrl = fileUrl; msgData.fileName = fileName; msgData.fileType = fileType; msgData.fileSize = fileSize; }
        if (voiceDuration) msgData.voiceDuration = voiceDuration;
        if (replyTo?.messageId) {
          msgData.replyTo = {
            messageId: replyTo.messageId,
            senderName: replyTo.senderName || '',
            content: replyTo.content || '',
            type: replyTo.type || 'text'
          };
        }

        const message = await Message.create(msgData);

        // Update conversation
        conv.lastMessage = { content: messageContent || (type !== 'text' ? `[${type}]` : ''), type, sender: userId, createdAt: message.createdAt };
        conv.hiddenBy = [];
        await conv.save();

        const populated = await populateMessage(Message.findById(message._id));

        // Broadcast to room
        io.to(conversationId.toString()).emit('receive_message', populated);

        // Notify each participant
        conv.participants.forEach(async (participantId) => {
          const pId = participantId.toString();
          io.to(`user:${pId}`).emit('conversation_updated', { conversationId, lastMessage: conv.lastMessage });

          // Create notification for others
          if (pId !== userId) {
            try {
              const notif = await Notification.create({
                recipient: pId,
                sender: userId,
                type: 'message',   // valid enum: 'message' | 'group_add' | 'reaction' | 'mention'
                conversation: conversationId,
                message: message._id
              });
              const populated_notif = await Notification.findById(notif._id)
                .populate('sender', 'username avatar profilePicture')
                .populate('conversation', 'type groupName');
              io.to(`user:${pId}`).emit('new_notification', populated_notif);
            } catch (notifErr) {
              console.error('[Socket] Failed to create notification:', notifErr.message);
            }
          }
        });
      } catch (err) {
        console.error('send_message socket error:', err);
        socket.emit('error_message', 'Failed to send message');
      }
    });

    // ─── TYPING ─────────────────────────────────────────────────────────────
    socket.on('typing', ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(conversationId.toString()).emit('user_typing', {
        conversationId,
        userId,
        username: socket.user.username
      });
    });

    socket.on('stop_typing', ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(conversationId.toString()).emit('user_stop_typing', { conversationId, userId });
    });

    // ─── READ RECEIPTS ───────────────────────────────────────────────────────
    socket.on('message_read', async ({ conversationId }) => {
      try {
        if (!conversationId) return;
        await Message.updateMany(
          { conversation: conversationId, sender: { $ne: userId }, 'readBy.user': { $ne: userId } },
          { $push: { readBy: { user: userId, readAt: new Date() } }, $set: { status: 'read' } }
        );
        io.to(conversationId.toString()).emit('messages_read', { conversationId, readerId: userId });
      } catch (err) {
        console.error('message_read error:', err);
      }
    });

    // ─── REACTION ────────────────────────────────────────────────────────────
    socket.on('message_reaction', async ({ messageId, emoji }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return socket.emit('error_message', 'Message not found');

        const reactionIdx = message.reactions.findIndex((r) => r.emoji === emoji);
        if (reactionIdx === -1) {
          message.reactions.push({ emoji, users: [userId] });
        } else {
          const userIdx = message.reactions[reactionIdx].users.findIndex(
            (u) => u.toString() === userId
          );
          if (userIdx === -1) {
            message.reactions[reactionIdx].users.push(userId);
          } else {
            message.reactions[reactionIdx].users.splice(userIdx, 1);
            if (message.reactions[reactionIdx].users.length === 0) {
              message.reactions.splice(reactionIdx, 1);
            }
          }
        }
        await message.save();

        const updated = await populateMessage(Message.findById(messageId));
        io.to(message.conversation.toString()).emit('message_reaction_updated', updated);
      } catch (err) {
        console.error('message_reaction error:', err);
      }
    });

    // ─── EDIT MESSAGE ─────────────────────────────────────────────────────────
    socket.on('message_edit', async ({ messageId, content }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return socket.emit('error_message', 'Message not found');
        if (message.sender.toString() !== userId) return socket.emit('error_message', 'Unauthorized');
        if (message.type !== 'text') return socket.emit('error_message', 'Can only edit text messages');

        message.content = content.trim();
        message.edited = { isEdited: true, editedAt: new Date() };
        await message.save();

        const updated = await populateMessage(Message.findById(messageId));
        io.to(message.conversation.toString()).emit('message_edited', updated);
      } catch (err) {
        console.error('message_edit error:', err);
      }
    });

    // ─── DELETE MESSAGE ────────────────────────────────────────────────────────
    socket.on('message_delete', async ({ messageId, deleteForEveryone }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return socket.emit('error_message', 'Message not found');
        if (message.sender.toString() !== userId) return socket.emit('error_message', 'Unauthorized');

        if (deleteForEveryone) {
          message.deleted = { isDeletedForEveryone: true, deletedAt: new Date() };
          message.content = '';
          message.fileUrl = '';
        } else {
          if (!message.deleted.deletedFor.includes(userId)) {
            message.deleted.deletedFor.push(userId);
          }
        }
        await message.save();

        const convId = message.conversation.toString();
        if (deleteForEveryone) {
          io.to(convId).emit('message_deleted', { messageId, deleteForEveryone: true, conversationId: convId });
        } else {
          socket.emit('message_deleted', { messageId, deleteForEveryone: false, conversationId: convId });
        }
      } catch (err) {
        console.error('message_delete error:', err);
      }
    });

    // ─── FORWARD MESSAGE ───────────────────────────────────────────────────────
    socket.on('message_forward', async ({ messageId, targetConversationIds }) => {
      try {
        const original = await Message.findById(messageId);
        if (!original) return socket.emit('error_message', 'Message not found');

        for (const convId of targetConversationIds) {
          const conv = await Conversation.findById(convId);
          if (!conv || !conv.participants.some((p) => p.toString() === userId)) continue;

          const forwarded = await Message.create({
            conversation: convId,
            sender: userId,
            type: original.type,
            content: original.content,
            fileUrl: original.fileUrl,
            fileName: original.fileName,
            fileType: original.fileType,
            fileSize: original.fileSize,
            voiceDuration: original.voiceDuration,
            forwardedFrom: { isForwarded: true, originalSenderName: original.sender?.username || '' },
            status: 'sent',
            readBy: [{ user: userId, readAt: new Date() }]
          });

          conv.lastMessage = { content: original.content || `[${original.type}]`, type: original.type, sender: userId, createdAt: forwarded.createdAt };
          await conv.save();

          const pop = await populateMessage(Message.findById(forwarded._id));
          io.to(convId.toString()).emit('receive_message', pop);
          conv.participants.forEach((pId) => {
            io.to(`user:${pId.toString()}`).emit('conversation_updated', { conversationId: convId, lastMessage: conv.lastMessage });
          });
        }
      } catch (err) {
        console.error('message_forward error:', err);
      }
    });

    // ─── PIN / UNPIN MESSAGE ─────────────────────────────────────────────────
    socket.on('message_pin', async ({ messageId, duration = '7d' }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return socket.emit('error_message', 'Message not found');

        const conversation = await Conversation.findById(message.conversation);
        if (!conversation) return socket.emit('error_message', 'Conversation not found');

        const durationDays = duration === '1d' ? 1 : duration === '30d' ? 30 : 7;
        const pinnedUntil = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

        conversation.pinnedMessages = (conversation.pinnedMessages || []).filter(
          (p) => (p.message?._id || p.message)?.toString() !== messageId.toString()
        );

        conversation.pinnedMessages.push({
          message: messageId,
          pinnedBy: userId,
          pinnedUntil,
          pinnedAt: new Date()
        });

        await conversation.save();
        message.pinnedUntil = pinnedUntil;
        await message.save();

        const updatedConv = await Conversation.findById(conversation._id)
          .populate('participants', 'username avatar profilePicture isOnline lastSeen')
          .populate({
            path: 'pinnedMessages.message',
            populate: { path: 'sender', select: 'username avatar profilePicture' }
          })
          .populate('pinnedMessages.pinnedBy', 'username avatar');

        io.to(conversation._id.toString()).emit('conversation_pinned_updated', {
          conversationId: conversation._id.toString(),
          pinnedMessages: updatedConv.pinnedMessages
        });
      } catch (err) {
        console.error('message_pin socket error:', err);
      }
    });

    socket.on('message_unpin', async ({ messageId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return socket.emit('error_message', 'Message not found');

        const updatedConv = await Conversation.findByIdAndUpdate(
          message.conversation,
          { $pull: { pinnedMessages: { message: messageId } } },
          { new: true }
        )
          .populate('participants', 'username avatar profilePicture isOnline lastSeen')
          .populate({
            path: 'pinnedMessages.message',
            populate: { path: 'sender', select: 'username avatar profilePicture' }
          })
          .populate('pinnedMessages.pinnedBy', 'username avatar');

        message.pinnedUntil = null;
        await message.save();

        io.to(message.conversation.toString()).emit('conversation_pinned_updated', {
          conversationId: message.conversation.toString(),
          pinnedMessages: updatedConv ? updatedConv.pinnedMessages : []
        });
      } catch (err) {
        console.error('message_unpin socket error:', err);
      }
    });

    // ─── DISCONNECT ────────────────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`[Socket] Disconnected: ${socket.user.username} (${socket.id})`);
      const sockets = userSocketMap.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSocketMap.delete(userId);
          const lastSeen = new Date();
          await User.findByIdAndUpdate(userId, { onlineStatus: false, lastSeen });
          io.emit('user_offline', { userId, lastSeen });
        }
      }
    });
  });
};

module.exports = { initSocket, userSocketMap };
