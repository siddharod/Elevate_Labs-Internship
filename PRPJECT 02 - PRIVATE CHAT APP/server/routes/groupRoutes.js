const express = require('express');
const router = express.Router();
const {
  createGroup,
  addMembers,
  removeMember
} = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createGroup);
router.put('/:id/members', protect, addMembers);
router.delete('/:id/members/:userId', protect, removeMember);

module.exports = router;
