const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');

const populateMessage = (query) => {
  return query
    .populate('sender', 'name username email profilePicture bio onlineStatus lastSeen')
    .populate('reactions.users', 'name username profilePicture')
    .populate('readBy.user', 'name username profilePicture');
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const isMember = conversation.participants.some(
      (p) => p.toString() === currentUserId.toString()
    );
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    // Find messages not deleted for current user
    const messages = await populateMessage(
      Message.find({
        conversation: conversationId,
        'deleted.deletedFor': { $ne: currentUserId }
      }).sort({ createdAt: 1 })
    );

    // Format deleted messages
    const formatted = messages.map((m) => {
      const obj = m.toObject();
      if (obj.deleted?.isDeletedForEveryone) {
        obj.content = 'This message was deleted';
        obj.fileUrl = '';
        obj.fileName = '';
      }
      return obj;
    });

    // Mark unread messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: currentUserId },
        'readBy.user': { $ne: currentUserId }
      },
      {
        $push: { readBy: { user: currentUserId, readAt: new Date() } },
        $set: { status: 'read' }
      }
    );

    return res.status(200).json({
      success: true,
      messages: formatted
    });
  } catch (err) {
    console.error('Get messages error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve messages.' });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const {
      conversationId,
      type = 'text',
      content = '',
      fileUrl = '',
      fileName = '',
      fileType = '',
      fileSize = 0,
      voiceDuration = 0,
      replyTo = null
    } = req.body;

    const currentUserId = req.user._id;

    if (!conversationId) {
      return res.status(400).json({ success: false, message: 'Conversation ID is required.' });
    }

    // Prevent empty messages if no file or voice
    if (type === 'text' && (!content || !content.trim())) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty.' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const isMember = conversation.participants.some(
      (p) => p.toString() === currentUserId.toString()
    );
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: currentUserId,
      type,
      content: content ? content.trim() : '',
      fileUrl,
      fileName,
      fileType,
      fileSize,
      voiceDuration,
      replyTo,
      status: 'sent',
      readBy: [{ user: currentUserId, readAt: new Date() }]
    });

    // Update conversation last message & un-hide for all
    let previewText = message.content;
    if (type === 'image') previewText = '📷 Image';
    else if (type === 'file') previewText = `📎 ${fileName || 'File'}`;
    else if (type === 'voice') previewText = '🎤 Voice message';

    conversation.lastMessage = {
      type,
      content: previewText,
      text: previewText,
      sender: currentUserId,
      createdAt: message.createdAt
    };
    conversation.hiddenBy = [];
    await conversation.save();

    const populated = await populateMessage(Message.findById(message._id));

    // Create notifications for peer participants
    const otherParticipants = conversation.participants.filter(
      (p) => p.toString() !== currentUserId.toString()
    );

    const notifDocs = otherParticipants.map((pId) => ({
      recipient: pId,
      sender: currentUserId,
      type: 'message',
      conversation: conversation._id,
      message: message._id,
      content: previewText
    }));

    if (notifDocs.length > 0) {
      await Notification.insertMany(notifDocs);
    }

    return res.status(201).json({
      success: true,
      message: populated
    });
  } catch (err) {
    console.error('Send message error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
};

// @desc    Edit a message
// @route   PUT /api/messages/:id
// @access  Private
const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const currentUserId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Content cannot be empty.' });
    }

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    if (message.sender.toString() !== currentUserId.toString()) {
      return res.status(403).json({ success: false, message: 'You can only edit your own messages.' });
    }

    if (message.deleted?.isDeletedForEveryone) {
      return res.status(400).json({ success: false, message: 'Cannot edit deleted message.' });
    }

    message.content = content.trim();
    message.edited = {
      isEdited: true,
      editedAt: new Date()
    };
    await message.save();

    const populated = await populateMessage(Message.findById(message._id));

    return res.status(200).json({
      success: true,
      message: populated
    });
  } catch (err) {
    console.error('Edit message error:', err);
    return res.status(500).json({ success: false, message: 'Failed to edit message.' });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { mode = 'for_me' } = req.body; // 'for_me' or 'for_everyone'
    const currentUserId = req.user._id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    if (mode === 'for_everyone') {
      if (message.sender.toString() !== currentUserId.toString()) {
        return res.status(403).json({ success: false, message: 'You can only delete for everyone on your own messages.' });
      }

      message.deleted = {
        isDeletedForEveryone: true,
        deletedAt: new Date(),
        deletedFor: message.deleted?.deletedFor || []
      };
      message.content = 'This message was deleted';
      message.fileUrl = '';
      message.fileName = '';
      await message.save();
    } else {
      // Delete for me
      if (!message.deleted) {
        message.deleted = { isDeletedForEveryone: false, deletedFor: [] };
      }
      if (!message.deleted.deletedFor.includes(currentUserId)) {
        message.deleted.deletedFor.push(currentUserId);
        await message.save();
      }
    }

    const populated = await populateMessage(Message.findById(message._id));

    return res.status(200).json({
      success: true,
      message: populated,
      mode
    });
  } catch (err) {
    console.error('Delete message error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete message.' });
  }
};

// @desc    Toggle message reaction
// @route   POST /api/messages/:id/reaction
// @access  Private
const toggleReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const currentUserId = req.user._id;

    if (!emoji) {
      return res.status(400).json({ success: false, message: 'Emoji is required.' });
    }

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    // Find if reaction already exists
    let reactionGroup = message.reactions.find((r) => r.emoji === emoji);

    if (reactionGroup) {
      const userIndex = reactionGroup.users.findIndex(
        (u) => u.toString() === currentUserId.toString()
      );
      if (userIndex > -1) {
        // Remove reaction
        reactionGroup.users.splice(userIndex, 1);
        if (reactionGroup.users.length === 0) {
          message.reactions = message.reactions.filter((r) => r.emoji !== emoji);
        }
      } else {
        // Add reaction
        reactionGroup.users.push(currentUserId);
      }
    } else {
      // Create new reaction group
      message.reactions.push({
        emoji,
        users: [currentUserId]
      });
    }

    await message.save();

    const populated = await populateMessage(Message.findById(message._id));

    return res.status(200).json({
      success: true,
      message: populated
    });
  } catch (err) {
    console.error('Toggle reaction error:', err);
    return res.status(500).json({ success: false, message: 'Failed to toggle reaction.' });
  }
};

// @desc    Forward message to other conversations
// @route   POST /api/messages/:id/forward
// @access  Private
const forwardMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetConversationIds } = req.body;
    const currentUserId = req.user._id;

    if (!targetConversationIds || !Array.isArray(targetConversationIds) || targetConversationIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Target conversations required.' });
    }

    const originalMessage = await Message.findById(id).populate('sender', 'name username');
    if (!originalMessage) {
      return res.status(404).json({ success: false, message: 'Original message not found.' });
    }

    const senderName = originalMessage.sender?.name || originalMessage.sender?.username || 'User';

    const forwardedMessages = [];

    for (const targetConvId of targetConversationIds) {
      const conv = await Conversation.findById(targetConvId);
      if (!conv) continue;

      const isMember = conv.participants.some(
        (p) => p.toString() === currentUserId.toString()
      );
      if (!isMember) continue;

      const newMsg = await Message.create({
        conversation: targetConvId,
        sender: currentUserId,
        type: originalMessage.type,
        content: originalMessage.content,
        fileUrl: originalMessage.fileUrl,
        fileName: originalMessage.fileName,
        fileType: originalMessage.fileType,
        fileSize: originalMessage.fileSize,
        voiceDuration: originalMessage.voiceDuration,
        forwardedFrom: {
          isForwarded: true,
          originalSenderName: senderName
        },
        status: 'sent',
        readBy: [{ user: currentUserId, readAt: new Date() }]
      });

      conv.lastMessage = {
        type: originalMessage.type,
        content: originalMessage.content,
        text: originalMessage.content,
        sender: currentUserId,
        createdAt: newMsg.createdAt
      };
      conv.hiddenBy = [];
      await conv.save();

      const populated = await populateMessage(Message.findById(newMsg._id));
      forwardedMessages.push(populated);
    }

    return res.status(201).json({
      success: true,
      messages: forwardedMessages
    });
  } catch (err) {
    console.error('Forward message error:', err);
    return res.status(500).json({ success: false, message: 'Failed to forward message.' });
  }
};

// @desc    Pin message with duration (1d, 7d, 30d)
// @route   POST /api/messages/:id/pin
// @access  Private
const pinMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { duration = '7d' } = req.body;
    const currentUserId = req.user._id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    const conversation = await Conversation.findById(message.conversation);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const durationDays = duration === '1d' ? 1 : duration === '30d' ? 30 : 7;
    const pinnedUntil = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    // Remove if already pinned
    conversation.pinnedMessages = conversation.pinnedMessages.filter(
      (p) => p.message?.toString() !== id.toString()
    );

    conversation.pinnedMessages.push({
      message: id,
      pinnedBy: currentUserId,
      pinnedUntil,
      pinnedAt: new Date()
    });

    await conversation.save();

    message.pinnedUntil = pinnedUntil;
    await message.save();

    return res.status(200).json({
      success: true,
      pinnedUntil,
      messageId: id
    });
  } catch (err) {
    console.error('Pin message error:', err);
    return res.status(500).json({ success: false, message: 'Failed to pin message.' });
  }
};

// @desc    Unpin message
// @route   DELETE /api/messages/:id/pin
// @access  Private
const unpinMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    await Conversation.findByIdAndUpdate(message.conversation, {
      $pull: { pinnedMessages: { message: id } }
    });

    message.pinnedUntil = null;
    await message.save();

    return res.status(200).json({
      success: true,
      message: 'Message unpinned.'
    });
  } catch (err) {
    console.error('Unpin error:', err);
    return res.status(500).json({ success: false, message: 'Failed to unpin message.' });
  }
};

// @desc    Search messages in conversation
// @route   GET /api/messages/search?q=...&conversationId=...
// @access  Private
const searchMessages = async (req, res) => {
  try {
    const { q, conversationId } = req.query;
    const currentUserId = req.user._id;

    if (!q || !q.trim()) {
      return res.status(200).json({ success: true, messages: [] });
    }

    const filter = {
      $or: [
        { content: { $regex: q.trim(), $options: 'i' } },
        { fileName: { $regex: q.trim(), $options: 'i' } }
      ],
      'deleted.isDeletedForEveryone': { $ne: true },
      'deleted.deletedFor': { $ne: currentUserId }
    };

    if (conversationId) {
      filter.conversation = conversationId;
    }

    const messages = await populateMessage(
      Message.find(filter).sort({ createdAt: -1 }).limit(30)
    );

    return res.status(200).json({
      success: true,
      messages
    });
  } catch (err) {
    console.error('Search messages error:', err);
    return res.status(500).json({ success: false, message: 'Failed to search messages.' });
  }
};

// @desc    Mark conversation messages as read
// @route   PUT /api/messages/read/:conversationId
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user._id;

    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: currentUserId },
        'readBy.user': { $ne: currentUserId }
      },
      {
        $push: { readBy: { user: currentUserId, readAt: new Date() } },
        $set: { status: 'read' }
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Messages marked as read.'
    });
  } catch (err) {
    console.error('Mark read error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update read status.' });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  toggleReaction,
  forwardMessage,
  pinMessage,
  unpinMessage,
  searchMessages,
  markAsRead
};
