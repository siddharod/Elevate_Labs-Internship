const express = require('express');
const router = express.Router();
const {
  getConversations,
  getOrCreatePrivateConversation,
  getConversationById,
  hideConversation,
  updateConversationBackground
} = require('../controllers/conversationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getConversations);
router.post('/', protect, getOrCreatePrivateConversation);
router.get('/:id', protect, getConversationById);
router.delete('/:id', protect, hideConversation);
router.put('/:id/background', protect, updateConversationBackground);

module.exports = router;
