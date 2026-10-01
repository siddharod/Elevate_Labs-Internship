const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// Search must come BEFORE /:conversationId to avoid conflict
router.get('/search', protect, searchMessages);

// Conversation messages
router.get('/:conversationId', protect, getMessages);
router.post('/:conversationId', protect, sendMessage);
router.put('/read/:conversationId', protect, markAsRead);

// Single message operations
router.put('/:id/edit', protect, editMessage);
router.delete('/:id', protect, deleteMessage);
router.post('/:id/reaction', protect, toggleReaction);
router.post('/:id/forward', protect, forwardMessage);
router.post('/:id/pin', protect, pinMessage);
router.delete('/:id/pin', protect, unpinMessage);

module.exports = router;
