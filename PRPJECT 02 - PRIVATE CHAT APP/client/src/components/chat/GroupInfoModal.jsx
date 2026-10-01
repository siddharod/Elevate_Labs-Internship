import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserMinus, Shield, LogOut, Loader2, Crown } from 'lucide-react';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import { formatLastSeen } from '../../utils/dateUtils';

export const GroupInfoModal = ({ isOpen, onClose, group }) => {
  const { user } = useAuth();
  const { addGroupMembers, removeGroupMember } = useChat();
  const { isUserOnline } = useSocket();

  const [isAdding, setIsAdding] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const isAdmin = group?.groupAdmins?.some(
    (admin) => (admin._id || admin).toString() === user?._id?.toString()
  );

  useEffect(() => {
    if (isAdding) {
      const fetchAvailable = async () => {
        setLoadingUsers(true);
        try {
          const res = await api.get('/users');
          if (res.data.success) {
            const existingIds = new Set(
              group.participants.map((p) => (p._id || p).toString())
            );
            const eligible = res.data.users.filter(
              (u) => !existingIds.has(u._id.toString())
            );
            setAvailableUsers(eligible);
          }
        } catch (err) {
          console.error('Failed to load eligible users:', err);
        } finally {
          setLoadingUsers(false);
        }
      };
      fetchAvailable();
    }
  }, [isAdding, group]);

  if (!group) return null;

  const handleAddSubmit = async () => {
    if (selectedToAdd.length === 0) return;
    setActionLoading(true);
    try {
      await addGroupMembers(group._id, selectedToAdd);
      setIsAdding(false);
      setSelectedToAdd([]);
    } catch (err) {
      console.error('Failed to add members:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    const isSelf = memberId.toString() === user?._id?.toString();
    const promptMsg = isSelf
      ? 'Are you sure you want to leave this group chat?'
      : 'Remove this friend from the group?';
    if (!window.confirm(promptMsg)) return;

    setActionLoading(true);
    try {
      await removeGroupMember(group._id, memberId);
      if (isSelf) {
        onClose();
      }
    } catch (err) {
      console.error('Failed to remove member:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Group Details">
      <div className="space-y-5">
        {/* Header Profile */}
        <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-cream/50 dark:bg-slate-800/50 border border-pastelpurple/30">
          <Avatar
            src={group.groupAvatar}
            name={group.groupName}
            size="xl"
            className="mb-2 ring-4 ring-white dark:ring-slate-700 shadow-cute"
          />
          <h3 className="text-lg font-fredoka font-bold text-deeppurple dark:text-pastelpurple">
            {group.groupName}
          </h3>
          <span className="text-xs font-fredoka px-2.5 py-0.5 mt-1 rounded-full bg-softpink text-coral font-semibold">
            {group.participants?.length || 0} friendly members
          </span>
        </div>

        {/* Member Action Bar */}
        <div className="flex items-center justify-between border-b-2 border-pastelpurple/20 pb-2">
          <span className="text-xs font-fredoka font-bold text-deeppurple dark:text-pastelpurple tracking-wide">
            Group Members
          </span>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="text-xs font-fredoka font-semibold text-coral hover:text-coral-dark flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-coral/10 hover:bg-coral/20 transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{isAdding ? 'Cancel' : 'Invite Friends'}</span>
          </button>
        </div>

        {/* Add Members Section */}
        {isAdding && (
          <div className="p-3 bg-pastelpurple/20 dark:bg-deeppurple/30 rounded-2xl space-y-3 border border-pastelpurple/30">
            <h4 className="text-xs font-fredoka font-semibold text-deeppurple dark:text-pastelpurple">
              Select friends to invite:
            </h4>
            {loadingUsers ? (
              <div className="flex items-center justify-center p-3 text-coral text-xs font-fredoka">
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading...
              </div>
            ) : availableUsers.length === 0 ? (
              <p className="text-xs font-fredoka text-darktext/50 text-center py-2">
                No new friends available to add.
              </p>
            ) : (
              <div className="max-h-36 overflow-y-auto space-y-1">
                {availableUsers.map((u) => (
                  <label
                    key={u._id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-slate-700 cursor-pointer text-xs transition"
                  >
                    <div className="flex items-center space-x-2">
                      <Avatar src={u.avatar} name={u.username} size="xs" />
                      <span className="font-fredoka font-medium text-darktext dark:text-cream">
                        {u.username}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedToAdd.includes(u._id)}
                      onChange={() =>
                        setSelectedToAdd((prev) =>
                          prev.includes(u._id)
                            ? prev.filter((id) => id !== u._id)
                            : [...prev, u._id]
                        )
                      }
                      className="rounded-lg text-coral focus:ring-coral w-4 h-4 border-pastelpurple/50"
                    />
                  </label>
                ))}
              </div>
            )}
            <div className="flex justify-end pt-1">
              <button
                disabled={actionLoading || selectedToAdd.length === 0}
                onClick={handleAddSubmit}
                className="px-3.5 py-1.5 text-xs font-fredoka font-bold bg-coral hover:bg-coral-dark text-white rounded-xl shadow-xs disabled:opacity-50 transition"
              >
                Add Selected Friends
              </button>
            </div>
          </div>
        )}

        {/* Existing Members List */}
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {group.participants?.map((member) => {
            const memberId = member._id || member;
            const isMemberAdmin = group.groupAdmins?.some(
              (a) => (a._id || a).toString() === memberId.toString()
            );
            const isSelf = memberId.toString() === user?._id?.toString();
            const online = isUserOnline(memberId) || member.isOnline;

            return (
              <div
                key={memberId}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-pastelpurple/20 hover:bg-softpink/20 transition"
              >
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={member.avatar}
                    name={member.username || 'User'}
                    size="sm"
                    isOnline={online}
                    showBadge={true}
                  />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-fredoka font-semibold text-darktext dark:text-cream">
                        {member.username || 'User'}
                      </span>
                      {isSelf && (
                        <span className="text-[10px] font-fredoka text-coral bg-softpink px-1.5 py-0.5 rounded-full font-bold">
                          You
                        </span>
                      )}
                      {isMemberAdmin && (
                        <span className="text-[10px] font-fredoka text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-bold">
                          <Crown className="w-2.5 h-2.5 text-amber-500 fill-amber-500" /> Leader
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-darktext/50 dark:text-cream/50">
                      {online ? (
                        <span className="text-emerald-500 font-medium">Online</span>
                      ) : (
                        formatLastSeen(false, member.lastSeen)
                      )}
                    </p>
                  </div>
                </div>

                {/* Actions: Admin can remove members, or member can leave */}
                {(isAdmin && !isSelf) || isSelf ? (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleRemoveMember(memberId)}
                    className="p-1.5 text-darktext/40 hover:text-coral rounded-xl hover:bg-softpink/40 transition"
                    title={isSelf ? 'Leave Group' : 'Remove from Group'}
                  >
                    {isSelf ? (
                      <LogOut className="w-4 h-4 text-coral" />
                    ) : (
                      <UserMinus className="w-4 h-4 text-coral" />
                    )}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export default GroupInfoModal;
