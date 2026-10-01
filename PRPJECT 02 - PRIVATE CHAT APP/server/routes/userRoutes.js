const express = require('express');
const router = express.Router();
const {
  searchUsers,
  getUsers,
  getUserById,
  updateProfile,
  updatePassword
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/search', protect, searchUsers);
router.get('/', protect, getUsers);
router.get('/:id', protect, getUserById);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);

module.exports = router;
