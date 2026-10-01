import React, { useState } from 'react';
import { ArrowLeft, Info, Users, Search, Pin, X, Sparkles } from 'lucide-react';
import Avatar from '../common/Avatar';
import GroupInfoModal from './GroupInfoModal';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useChat } from '../../context/ChatContext';
import { formatLastSeen, formatMessageTime } from '../../utils/dateUtils';

const scrollToMessage = (msgId) => {
  if (!msgId) return;
  const el = document.getElementById(`msg-${msgId}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('ring-4', 'ring-coral', 'bg-softpink/70', 'dark:bg-deeppurple/40', 'scale-[1.02]');
    setTimeout(() => {
      el.classList.remove('ring-4', 'ring-coral', 'bg-softpink/70', 'dark:bg-deeppurple/40', 'scale-[1.02]');
    }, 2500);
  }
};

const PinnedPanel = ({ pinnedMessages, onClose }) => (
  <div className="border-b-2 border-coral/30 bg-gradient-to-r from-cream via-softpink/30 to-cream dark:from-slate-900 dark:via-deeppurple/20 dark:to-slate-900 px-4 py-2.5 max-h-52 overflow-y-auto animate-pop shadow-inner">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[11px] font-extrabold font-fredoka text-coral uppercase tracking-wider flex items-center gap-1.5">
        <Pin className="w-3.5 h-3.5 fill-coral" /> Pinned Messages ({pinnedMessages.length})
      </span>
      <button
        onClick={onClose}
        className="p-1 text-darktext/40 hover:text-coral hover:bg-white dark:hover:bg-slate-800 rounded-lg transition"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
    {pinnedMessages.length === 0 ? (
      <p className="text-xs font-medium text-darktext/50 dark:text-cream/50">No pinned messages in this chat.</p>
    ) : (
      <div className="space-y-1.5">
        {pinnedMessages.map((pm, i) => {
          const mId = pm.message?._id || pm.message;
          const senderName = pm.message?.sender?.name || pm.message?.sender?.username || 'Friend';
          return (
            <div
              key={i}
              onClick={() => scrollToMessage(mId)}
              className="flex items-start gap-2.5 p-2 rounded-2xl bg-white/90 dark:bg-slate-800/80 border-2 border-pastelpurple/40 hover:border-coral/60 cursor-pointer shadow-cute-sm transition-all hover:scale-[1.01]"
            >
              <Pin className="w-3.5 h-3.5 mt-0.5 text-coral flex-shrink-0 fill-coral/30" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold font-fredoka text-deeppurple dark:text-coral-light">{senderName}</p>
                <p className="text-xs font-medium text-darktext/80 dark:text-cream/80 truncate">
                  {pm.message?.content || pm.message?.text || '[media]'}
                </p>
                {pm.pinnedUntil && (
                  <p className="text-[9px] font-semibold text-darktext/40 dark:text-cream/40 mt-0.5">
                    Pinned until {new Date(pm.pinnedUntil).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

const SearchPanel = ({ onClose, conversationId }) => {
  const { searchMessages, searchResults, isSearching, setSearchResults } = useChat();
  const [q, setQ] = useState('');

  const handleSearch = (e) => {
    const val = e.target.value;
    setQ(val);
    if (val.trim().length >= 2) searchMessages(val.trim(), conversationId);
    else setSearchResults([]);
  };

  const handleClose = () => {
    setSearchResults([]);
    onClose();
  };

  return (
    <div className="border-b-2 border-pastelpurple/30 bg-white dark:bg-slate-900 px-4 py-2.5 animate-pop shadow-md">
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-deeppurple/60 dark:text-coral/60 flex-shrink-0" />
        <input
          autoFocus
          value={q}
          onChange={handleSearch}
          placeholder="Search in this conversation..."
          className="flex-1 text-xs font-medium bg-transparent focus:outline-none text-darktext dark:text-cream placeholder-darktext/40 dark:placeholder-cream/40"
        />
        <button
          onClick={handleClose}
          className="p-1 text-darktext/40 hover:text-coral rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {(isSearching || searchResults.length > 0) && (
        <div className="mt-2.5 max-h-48 overflow-y-auto space-y-1.5 pt-1 border-t border-pastelpurple/20">
          {isSearching ? (
            <p className="text-xs font-semibold text-darktext/40 py-2 text-center">Searching cute messages...</p>
          ) : searchResults.length === 0 ? (
            <p className="text-xs font-semibold text-darktext/40 py-2 text-center">No matching messages found</p>
          ) : (
            searchResults.map((msg) => (
              <div
                key={msg._id}
                onClick={() => scrollToMessage(msg._id)}
                className="p-2 rounded-2xl bg-cream dark:bg-slate-800 hover:bg-softpink/40 dark:hover:bg-slate-700/80 transition cursor-pointer border border-pastelpurple/30"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold font-fredoka text-deeppurple dark:text-coral-light">
                    {msg.sender?.name || msg.sender?.username}
                  </p>
                  <p className="text-[9px] font-medium text-darktext/40 dark:text-cream/40">{formatMessageTime(msg.createdAt)}</p>
                </div>
                <p className="text-xs font-medium text-darktext/80 dark:text-cream/80 truncate mt-0.5">
                  {msg.content || msg.text}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export const ChatHeader = ({ onBackMobile }) => {
  const { activeConversation, typingUsers } = useChat();
  const { user } = useAuth();
  const { isUserOnline } = useSocket();
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showPinned, setShowPinned] = useState(false);

  if (!activeConversation) return null;

  const isGroup = activeConversation.type === 'group';
  const otherUser = !isGroup ? activeConversation.participants?.find((p) => p._id !== user?._id) : null;
  const displayName = isGroup ? activeConversation.groupName : (otherUser?.name || otherUser?.username || 'Friend');
  const avatarSrc = isGroup ? activeConversation.groupAvatar : (otherUser?.avatar || otherUser?.profilePicture);
  const online = !isGroup ? isUserOnline(otherUser?._id) || otherUser?.isOnline : false;

  const currentTypingSet = typingUsers.get(activeConversation._id);
  const typingUsernames = currentTypingSet
    ? Array.from(currentTypingSet).filter((name) => name !== user?.username)
    : [];
  const typingText = typingUsernames.length === 1 ? `${typingUsernames[0]} is typing... 💬`
    : typingUsernames.length > 1 ? 'Several friends are typing... 💬' : null;

  const pinnedMessages = (activeConversation.pinnedMessages || []).filter((pm) => !pm.pinnedUntil || new Date(pm.pinnedUntil) > new Date());

  return (
    <>
      {/* Header Bar */}
      <div className="h-16 px-4 border-b-2 border-pastelpurple/30 flex items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10 flex-shrink-0 select-none">
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={onBackMobile}
            className="md:hidden p-2 -ml-1 text-darktext/60 hover:text-coral rounded-xl hover:bg-softpink/40 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div
            onClick={() => isGroup && setIsGroupInfoOpen(true)}
            className={`relative flex-shrink-0 ${isGroup ? 'cursor-pointer' : ''}`}
          >
            <Avatar src={avatarSrc} name={displayName} size="md" isOnline={online} showBadge={!isGroup} />
            {isGroup && (
              <span className="absolute -bottom-1 -right-1 bg-coral text-white p-1 rounded-full text-[9px] shadow-sm">
                <Users className="w-2.5 h-2.5" />
              </span>
            )}
          </div>

          <div className="min-w-0">
            <h2
              onClick={() => isGroup && setIsGroupInfoOpen(true)}
              className={`text-base font-extrabold font-fredoka text-darktext dark:text-cream truncate ${
                isGroup ? 'hover:text-coral cursor-pointer transition-colors' : ''
              }`}
            >
              {displayName}
            </h2>
            <div className="text-xs truncate">
              {typingText ? (
                <span className="text-coral font-bold font-fredoka animate-pulse flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {typingText}
                </span>
              ) : isGroup ? (
                <span className="text-darktext/50 dark:text-cream/50 font-medium">
                  {activeConversation.participants?.length || 0} friends in group
                </span>
              ) : online ? (
                <span className="text-emerald-500 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ring-2 ring-emerald-200 dark:ring-emerald-900" /> Active now
                </span>
              ) : (
                <span className="text-darktext/40 dark:text-cream/40 font-medium">
                  {formatLastSeen(false, otherUser?.lastSeen)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => {
              setShowSearch((p) => !p);
              setShowPinned(false);
            }}
            className={`p-2.5 rounded-2xl transition-all hover:scale-105 active:scale-95 ${
              showSearch
                ? 'text-coral bg-softpink dark:bg-deeppurple/30 shadow-cute-sm'
                : 'text-darktext/60 dark:text-cream/60 hover:text-coral hover:bg-softpink/40 dark:hover:bg-slate-800'
            }`}
            title="Search in chat"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          {pinnedMessages.length > 0 && (
            <button
              onClick={() => {
                setShowPinned((p) => !p);
                setShowSearch(false);
              }}
              className={`p-2.5 rounded-2xl transition-all relative hover:scale-105 active:scale-95 ${
                showPinned
                  ? 'text-coral bg-softpink dark:bg-deeppurple/30 shadow-cute-sm'
                  : 'text-darktext/60 dark:text-cream/60 hover:text-coral hover:bg-softpink/40 dark:hover:bg-slate-800'
              }`}
              title="Pinned messages"
            >
              <Pin className="w-4.5 h-4.5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-coral text-white text-[9px] font-extrabold font-fredoka rounded-full flex items-center justify-center shadow-sm">
                {pinnedMessages.length}
              </span>
            </button>
          )}

          {isGroup && (
            <button
              onClick={() => setIsGroupInfoOpen(true)}
              className="p-2.5 text-darktext/60 dark:text-cream/60 hover:text-coral hover:bg-softpink/40 dark:hover:bg-slate-800 rounded-2xl transition-all hover:scale-105 active:scale-95"
              title="Group info"
            >
              <Info className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </div>

      {/* Pinned Messages Panel */}
      {showPinned && pinnedMessages.length > 0 && (
        <PinnedPanel pinnedMessages={pinnedMessages} onClose={() => setShowPinned(false)} />
      )}

      {/* Search Panel */}
      {showSearch && (
        <SearchPanel conversationId={activeConversation._id} onClose={() => setShowSearch(false)} />
      )}

      {isGroup && (
        <GroupInfoModal
          isOpen={isGroupInfoOpen}
          onClose={() => setIsGroupInfoOpen(false)}
          group={activeConversation}
        />
      )}
    </>
  );
};

export default ChatHeader;
