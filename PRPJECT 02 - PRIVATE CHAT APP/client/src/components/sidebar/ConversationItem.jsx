import React from 'react';
import { Trash2, Users, Image as ImageIcon, Mic, FileText } from 'lucide-react';
import Avatar from '../common/Avatar';
import { formatConversationTime } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useChat } from '../../context/ChatContext';

export const ConversationItem = ({ conversation, isActive, onClick }) => {
  const { user } = useAuth();
  const { isUserOnline } = useSocket();
  const { hideConversation } = useChat();

  const isGroup = conversation.type === 'group';

  // Determine other participant for private chat
  const otherParticipant = !isGroup
    ? conversation.participants?.find((p) => p._id !== user?._id)
    : null;

  const displayName = isGroup
    ? conversation.groupName
    : otherParticipant?.name || otherParticipant?.username || 'Friend';

  const avatarSrc = isGroup ? conversation.groupAvatar : (otherParticipant?.avatar || otherParticipant?.profilePicture);

  const online = !isGroup
    ? isUserOnline(otherParticipant?._id) || otherParticipant?.isOnline
    : false;

  // Format last message preview
  const getLastMessagePreview = () => {
    const lm = conversation.lastMessage;
    if (!lm) return 'Start a cute conversation ✨';
    if (lm.type === 'image') return '📷 Photo attachment';
    if (lm.type === 'voice') return '🎤 Voice message';
    if (lm.type === 'file') return '📎 Shared file';
    return lm.content || lm.text || 'Message';
  };

  const lastMessageText = getLastMessagePreview();
  const lastMessageTime = formatConversationTime(
    conversation.lastMessage?.createdAt || conversation.updatedAt
  );

  const unreadCount = conversation.unreadCount || 0;

  const handleHide = (e) => {
    e.stopPropagation();
    if (window.confirm('Hide this conversation from your list?')) {
      hideConversation(conversation._id);
    }
  };

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center p-3 mx-2 my-1.5 rounded-3xl cursor-pointer transition-all duration-200 ${
        isActive
          ? 'bg-gradient-to-r from-softpink/80 to-pastelpurple/60 dark:from-deeppurple/30 dark:to-pastelpurple/15 border-2 border-coral/60 shadow-cute-sm scale-[1.01]'
          : 'hover:bg-softpink/30 dark:hover:bg-slate-800/60 border-2 border-transparent'
      }`}
    >
      {/* Avatar with group badge */}
      <div className="relative flex-shrink-0">
        <Avatar
          src={avatarSrc}
          name={displayName}
          size="md"
          isOnline={online}
          showBadge={!isGroup}
        />
        {isGroup && (
          <span className="absolute -bottom-1 -right-1 bg-coral text-white p-1 rounded-full text-[9px] shadow-sm">
            <Users className="w-2.5 h-2.5" />
          </span>
        )}
      </div>

      {/* Info */}
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4
            className={`text-sm font-bold font-fredoka truncate ${
              isActive
                ? 'text-deeppurple dark:text-coral-light'
                : 'text-darktext dark:text-cream'
            }`}
          >
            {displayName}
          </h4>
          <span className="text-[10px] font-semibold text-darktext/50 dark:text-cream/50 flex-shrink-0 ml-1">
            {lastMessageTime}
          </span>
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <p
            className={`text-xs truncate font-medium ${
              unreadCount > 0
                ? 'font-bold text-darktext dark:text-cream'
                : 'text-darktext/60 dark:text-cream/60'
            }`}
          >
            {lastMessageText}
          </p>

          <div className="flex items-center space-x-1.5 flex-shrink-0 ml-2">
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-extrabold font-fredoka bg-coral text-white rounded-full min-w-4 text-center shadow-sm animate-pop">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}

            {/* Hide button on hover */}
            <button
              onClick={handleHide}
              title="Hide chat"
              className="opacity-0 group-hover:opacity-100 p-1 text-darktext/40 hover:text-rose-500 rounded-lg transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
