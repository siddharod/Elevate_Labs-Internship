const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Search users by username or name
// @route   GET /api/users/search?q=...
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(200).json({ success: true, users: [] });
    }

    const searchQuery = q.trim();
    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { username: { $regex: searchQuery, $options: 'i' } },
        { name: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } }
      ]
    })
      .select('name username email profilePicture bio customStatus onlineStatus lastSeen createdAt')
      .limit(20);

    return res.status(200).json({
      success: true,
      users
    });
  } catch (err) {
    console.error('Search users error:', err);
    return res.status(500).json({ success: false, message: 'Failed to search users.' });
  }
};

// @desc    Get all users (excluding current user)
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('name username email profilePicture bio customStatus onlineStatus lastSeen createdAt')
      .sort({ onlineStatus: -1, name: 1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      users
    });
  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name username email profilePicture bio customStatus onlineStatus lastSeen createdAt'
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    console.error('Get user by id error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch user details.' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, bio, customStatus, profilePicture, chatBackground } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name && name.trim()) user.name = name.trim();
    if (typeof bio === 'string') user.bio = bio.trim();
    if (typeof customStatus === 'string') user.customStatus = customStatus.trim();
    if (profilePicture) user.profilePicture = profilePicture;
    if (typeof chatBackground === 'string') user.chatBackground = chatBackground;

    await user.save();

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        avatar: user.avatar,
        bio: user.bio,
        customStatus: user.customStatus,
        onlineStatus: user.onlineStatus,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        chatBackground: user.chatBackground,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

// @desc    Change user password
// @route   PUT /api/users/password
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your current and new password.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.'
    });
  } catch (err) {
    console.error('Update password error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update password.' });
  }
};

module.exports = {
  searchUsers,
  getUsers,
  getUserById,
  updateProfile,
  updatePassword
};
