const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

const populateConversation = (query) => {
  return query
    .populate('participants', 'name username email profilePicture bio customStatus onlineStatus lastSeen')
    .populate('createdBy', 'name username email profilePicture')
    .populate('admins', 'name username email profilePicture')
    .populate('lastMessage.sender', 'name username email profilePicture')
    .populate({
      path: 'pinnedMessages.message',
      populate: { path: 'sender', select: 'name username profilePicture' }
    })
    .populate('pinnedMessages.pinnedBy', 'name username');
};

// @desc    Get all conversations for logged in user
// @route   GET /api/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const now = new Date();

    // Auto-remove expired pins
    await Conversation.updateMany(
      { participants: currentUserId },
      { $pull: { pinnedMessages: { pinnedUntil: { $lte: now } } } }
    );

    const conversations = await populateConversation(
      Conversation.find({
        participants: currentUserId,
        hiddenBy: { $ne: currentUserId }
      }).sort({ updatedAt: -1 })
    );

    // Compute unread message count
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: currentUserId },
          'readBy.user': { $ne: currentUserId },
          'deleted.isDeletedForEveryone': { $ne: true },
          'deleted.deletedFor': { $ne: currentUserId }
        });

        const convObj = conv.toObject();
        convObj.unreadCount = unreadCount;
        return convObj;
      })
    );

    return res.status(200).json({
      success: true,
      conversations: conversationsWithUnread
    });
  } catch (err) {
    console.error('Get conversations error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations.'
    });
  }
};

// @desc    Get or create private conversation
// @route   POST /api/conversations
// @access  Private
const getOrCreatePrivateConversation = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const currentUserId = req.user._id;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID is required.'
      });
    }

    if (recipientId.toString() === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot start a conversation with yourself.'
      });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'User does not exist.'
      });
    }

    let conversation = await Conversation.findOne({
      type: 'private',
      participants: { $all: [currentUserId, recipientId], $size: 2 }
    });

    if (conversation) {
      if (conversation.hiddenBy.includes(currentUserId)) {
        conversation.hiddenBy = conversation.hiddenBy.filter(
          (id) => id.toString() !== currentUserId.toString()
        );
        await conversation.save();
      }

      conversation = await populateConversation(
        Conversation.findById(conversation._id)
      );

      const unreadCount = await Message.countDocuments({
        conversation: conversation._id,
        sender: { $ne: currentUserId },
        'readBy.user': { $ne: currentUserId }
      });

      const convObj = conversation.toObject();
      convObj.unreadCount = unreadCount;

      return res.status(200).json({
        success: true,
        conversation: convObj
      });
    }

    conversation = await Conversation.create({
      type: 'private',
      participants: [currentUserId, recipientId],
      createdBy: currentUserId,
      lastMessage: {
        type: 'text',
        content: '',
        text: '',
        sender: currentUserId,
        createdAt: new Date()
      }
    });

    conversation = await populateConversation(
      Conversation.findById(conversation._id)
    );

    const convObj = conversation.toObject();
    convObj.unreadCount = 0;

    return res.status(201).json({
      success: true,
      conversation: convObj
    });
  } catch (err) {
    console.error('Create conversation error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate conversation.'
    });
  }
};

// @desc    Get single conversation by ID
// @route   GET /api/conversations/:id
// @access  Private
const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;

    const conversation = await populateConversation(Conversation.findById(id));

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.'
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => (p._id || p).toString() === currentUserId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this conversation.'
      });
    }

    const unreadCount = await Message.countDocuments({
      conversation: conversation._id,
      sender: { $ne: currentUserId },
      'readBy.user': { $ne: currentUserId }
    });

    const convObj = conversation.toObject();
    convObj.unreadCount = unreadCount;

    return res.status(200).json({
      success: true,
      conversation: convObj
    });
  } catch (err) {
    console.error('Get conversation by id error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve conversation details.'
    });
  }
};

// @desc    Hide conversation from user view
// @route   DELETE /api/conversations/:id
// @access  Private
const hideConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.'
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === currentUserId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized.'
      });
    }

    if (!conversation.hiddenBy.includes(currentUserId)) {
      conversation.hiddenBy.push(currentUserId);
      await conversation.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Conversation hidden.'
    });
  } catch (err) {
    console.error('Hide conversation error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to hide conversation.'
    });
  }
};

// @desc    Update custom chat background
// @route   PUT /api/conversations/:id/background
// @access  Private
const updateConversationBackground = async (req, res) => {
  try {
    const { id } = req.params;
    const { chatBackground } = req.body;
    const currentUserId = req.user._id;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === currentUserId.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    conversation.chatBackground = chatBackground || '';
    await conversation.save();

    return res.status(200).json({
      success: true,
      chatBackground: conversation.chatBackground
    });
  } catch (err) {
    console.error('Update background error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update background.' });
  }
};

module.exports = {
  getConversations,
  getOrCreatePrivateConversation,
  getConversationById,
  hideConversation,
  updateConversationBackground
};
