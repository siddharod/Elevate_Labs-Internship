import React, { useState, useEffect } from 'react';
import { Users, Check, Loader2, Sparkles, Wand2 } from 'lucide-react';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import api from '../../api/axios';
import { useChat } from '../../context/ChatContext';

const PRESET_GROUP_ICONS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Squad',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Party',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Gaming',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Study',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Chill'
];

export const CreateGroupModal = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState('');
  const [groupAvatar, setGroupAvatar] = useState(PRESET_GROUP_ICONS[0]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { createGroupChat } = useChat();

  useEffect(() => {
    if (isOpen) {
      setGroupName('');
      setGroupAvatar(PRESET_GROUP_ICONS[0]);
      setSelectedUserIds([]);
      setError('');
      const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
          const res = await api.get('/users');
          if (res.data.success) {
            setAvailableUsers(res.data.users);
          }
        } catch (err) {
          console.error('Failed to load users for group creation:', err);
        } finally {
          setLoadingUsers(false);
        }
      };
      fetchUsers();
    }
  }, [isOpen]);

  const toggleUserSelection = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleGenerateAvatar = () => {
    if (!groupName.trim()) {
      const seed = Math.random().toString(36).substring(7);
      setGroupAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`);
      return;
    }
    const seed = encodeURIComponent(groupName.trim());
    setGroupAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setError('Please give your group a cute name!');
      return;
    }
    if (selectedUserIds.length === 0) {
      setError('Please pick at least one friend to join the fun!');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await createGroupChat(
        groupName.trim(),
        selectedUserIds,
        groupAvatar.trim() || undefined
      );
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Group Chat">
      <form onSubmit={handleCreateGroup} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-coral/10 border-2 border-coral/30 text-coral rounded-2xl font-fredoka">
            {error}
          </div>
        )}

        {/* Group Name & Avatar Preview */}
        <div className="space-y-2">
          <label className="text-xs font-fredoka font-semibold text-deeppurple dark:text-pastelpurple">
            Group Name & Avatar
          </label>
          <div className="flex items-center space-x-3">
            <div className="relative group cursor-pointer" onClick={handleGenerateAvatar} title="Click to randomize">
              <Avatar
                src={groupAvatar}
                name={groupName || 'Group'}
                size="lg"
              />
              <button
                type="button"
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-coral text-white rounded-full flex items-center justify-center shadow-xs hover:scale-110 transition"
              >
                <Wand2 className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. ✨ Sunshine Club, 🎮 Game Pals"
                className="w-full px-4 py-2.5 bg-cream/70 dark:bg-slate-800/80 border-2 border-pastelpurple/40 focus:border-coral rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-coral/20 text-darktext dark:text-cream placeholder-darktext/40 font-quicksand font-medium transition"
                required
              />
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] font-fredoka text-darktext/60 dark:text-cream/60">Presets:</span>
            <div className="flex gap-1.5">
              {PRESET_GROUP_ICONS.map((url, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setGroupAvatar(url)}
                  className={`w-7 h-7 rounded-xl overflow-hidden border-2 transition ${
                    groupAvatar === url ? 'border-coral scale-110 shadow-xs' : 'border-pastelpurple/30 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Member selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-fredoka font-semibold text-deeppurple dark:text-pastelpurple">
              Choose Friends
            </label>
            <span className="text-[11px] font-fredoka px-2 py-0.5 rounded-full bg-softpink text-coral font-bold">
              {selectedUserIds.length} chosen
            </span>
          </div>

          <div className="border-2 border-pastelpurple/30 dark:border-deeppurple/30 rounded-2xl max-h-48 overflow-y-auto divide-y divide-pastelpurple/20 bg-cream/30 dark:bg-slate-800/40 p-1">
            {loadingUsers ? (
              <div className="flex items-center justify-center p-6 text-deeppurple dark:text-pastelpurple">
                <Loader2 className="w-5 h-5 animate-spin mr-2 text-coral" />
                <span className="text-xs font-fredoka">Loading friends...</span>
              </div>
            ) : availableUsers.length === 0 ? (
              <div className="p-6 text-center text-xs font-fredoka text-darktext/50">
                No friends available to add yet.
              </div>
            ) : (
              availableUsers.map((u) => {
                const isSelected = selectedUserIds.includes(u._id);
                return (
                  <div
                    key={u._id}
                    onClick={() => toggleUserSelection(u._id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                      isSelected
                        ? 'bg-softpink/40 dark:bg-deeppurple/30'
                        : 'hover:bg-white/60 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar src={u.avatar} name={u.username} size="sm" />
                      <div>
                        <p className="text-xs font-fredoka font-semibold text-darktext dark:text-cream">
                          {u.username}
                        </p>
                        <p className="text-[11px] text-darktext/50 dark:text-cream/50">{u.email}</p>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-xl flex items-center justify-center border-2 transition ${
                        isSelected
                          ? 'bg-coral border-coral text-white scale-105'
                          : 'border-pastelpurple/50 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="pt-2 flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-fredoka font-semibold text-darktext/70 dark:text-cream/70 hover:bg-pastelpurple/20 rounded-2xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !groupName.trim() || selectedUserIds.length === 0}
            className="px-5 py-2 text-xs font-fredoka font-bold text-white bg-gradient-to-r from-coral to-softpink-dark hover:brightness-105 rounded-2xl shadow-cute disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition hover:scale-102"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Create Group Party 🎉</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateGroupModal;
