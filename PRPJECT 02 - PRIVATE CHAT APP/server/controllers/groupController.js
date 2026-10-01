const Conversation = require('../models/Conversation');
const User = require('../models/User');

const populateGroup = (query) => {
  return query
    .populate('participants', 'username email avatar isOnline lastSeen')
    .populate('createdBy', 'username email avatar')
    .populate('groupAdmins', 'username email avatar')
    .populate('lastMessage.sender', 'username email avatar');
};

// @desc    Create a new group conversation
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
  try {
    const { groupName, groupAvatar, members } = req.body;
    const currentUserId = req.user._id;

    if (!groupName || !groupName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Group name is required.'
      });
    }

    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one member to add to the group.'
      });
    }

    // Ensure current user is in participants list
    const participantIds = Array.from(
      new Set([currentUserId.toString(), ...members.map((m) => m.toString())])
    );

    const defaultAvatar =
      groupAvatar ||
      `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
        groupName.trim()
      )}`;

    const group = await Conversation.create({
      type: 'group',
      groupName: groupName.trim(),
      groupAvatar: defaultAvatar,
      participants: participantIds,
      createdBy: currentUserId,
      groupAdmins: [currentUserId],
      lastMessage: {
        text: `Group "${groupName.trim()}" created`,
        sender: currentUserId,
        createdAt: new Date()
      }
    });

    const populatedGroup = await populateGroup(Conversation.findById(group._id));

    return res.status(201).json({
      success: true,
      group: populatedGroup
    });
  } catch (err) {
    console.error('Create group error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create group.'
    });
  }
};

// @desc    Add members to existing group
// @route   PUT /api/groups/:id/members
// @access  Private
const addMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { newMembers } = req.body;
    const currentUserId = req.user._id;

    if (!newMembers || !Array.isArray(newMembers) || newMembers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide user IDs to add.'
      });
    }

    const group = await Conversation.findOne({ _id: id, type: 'group' });
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found.'
      });
    }

    // Only current members/admins can add members
    const isMember = group.participants.some(
      (p) => p.toString() === currentUserId.toString()
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group.'
      });
    }

    // Add unique members
    const currentParticipantSet = new Set(
      group.participants.map((p) => p.toString())
    );
    newMembers.forEach((memberId) => {
      currentParticipantSet.add(memberId.toString());
    });

    group.participants = Array.from(currentParticipantSet);
    await group.save();

    const populatedGroup = await populateGroup(Conversation.findById(group._id));

    return res.status(200).json({
      success: true,
      group: populatedGroup
    });
  } catch (err) {
    console.error('Add members error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to add members to group.'
    });
  }
};

// @desc    Remove a member from group (or leave group)
// @route   DELETE /api/groups/:id/members/:userId
// @access  Private
const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const currentUserId = req.user._id;

    const group = await Conversation.findOne({ _id: id, type: 'group' });
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found.'
      });
    }

    const isAdmin = group.groupAdmins.some(
      (a) => a.toString() === currentUserId.toString()
    );
    const isSelfLeaving = currentUserId.toString() === userId.toString();

    // Only admin can kick, or a member can leave themselves
    if (!isAdmin && !isSelfLeaving) {
      return res.status(403).json({
        success: false,
        message: 'Only group admins can remove other members.'
      });
    }

    group.participants = group.participants.filter(
      (p) => p.toString() !== userId.toString()
    );
    group.groupAdmins = group.groupAdmins.filter(
      (a) => a.toString() !== userId.toString()
    );

    // If no participants left, or if creator left and admins empty, reassign admin
    if (group.participants.length > 0 && group.groupAdmins.length === 0) {
      group.groupAdmins.push(group.participants[0]);
    }

    await group.save();

    const populatedGroup = await populateGroup(Conversation.findById(group._id));

    return res.status(200).json({
      success: true,
      group: populatedGroup
    });
  } catch (err) {
    console.error('Remove member error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove member from group.'
    });
  }
};

module.exports = {
  createGroup,
  addMembers,
  removeMember
};
