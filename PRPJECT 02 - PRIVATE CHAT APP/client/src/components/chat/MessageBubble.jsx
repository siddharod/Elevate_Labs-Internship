import React, { useState, useRef, useEffect } from 'react';
import {
  Check, CheckCheck, Pencil, Trash2, Forward, Reply,
  MoreHorizontal, Pin, Download, Play, Pause, Clock
} from 'lucide-react';
import Avatar from '../common/Avatar';
import { formatMessageTime } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥'];

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const AudioPlayer = ({ src, duration, isMe }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <div className={`flex items-center gap-2.5 min-w-[200px] p-1.5 rounded-2xl ${isMe ? 'bg-white/15' : 'bg-softpink/40 dark:bg-slate-700/60'}`}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onLoadedMetadata={(e) => setTotalDuration(e.target.duration)}
        onEnded={() => {
          setPlaying(false);
          setCurrentTime(0);
        }}
      />
      <button
        onClick={toggle}
        className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
          isMe
            ? 'bg-white text-coral hover:bg-cream'
            : 'bg-gradient-to-r from-coral to-coral-light text-white hover:scale-105'
        }`}
      >
        {playing ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>
      <div className="flex-1">
        <div className={`h-1.5 rounded-full overflow-hidden ${isMe ? 'bg-white/30' : 'bg-pastelpurple/50'}`}>
          <div
            className={`h-full rounded-full transition-all duration-100 ${isMe ? 'bg-white' : 'bg-coral'}`}
            style={{ width: totalDuration ? `${(currentTime / totalDuration) * 100}%` : '0%' }}
          />
        </div>
        <div className={`flex justify-between text-[9px] font-bold mt-1 ${isMe ? 'text-white/80' : 'text-darktext/60 dark:text-cream/60'}`}>
          <span>{fmtTime(currentTime)}</span>
          <span>{fmtTime(totalDuration)}</span>
        </div>
      </div>
    </div>
  );
};

export const MessageBubble = ({ message, isMe, showAvatar = false, isGroup = false }) => {
  const { user } = useAuth();
  const {
    reactToMessage, setReplyTo, setEditingMessage, deleteMessage,
    forwardMessage, pinMessage, unpinMessage, activeConversation, conversations
  } = useChat();
  const [showMenu, setShowMenu] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [selectedConvs, setSelectedConvs] = useState([]);
  const menuRef = useRef(null);

  const isPinned = (activeConversation?.pinnedMessages || []).some(
    (p) => (p.message?._id || p.message)?.toString() === message._id?.toString()
  );

  const senderName = message.sender?.name || message.sender?.username || 'Friend';
  const senderAvatar = message.sender?.avatar || message.sender?.profilePicture;
  const isDeleted = message.deleted?.isDeletedForEveryone;
  const isEdited = message.edited?.isEdited;
  const isForwarded = message.forwardedFrom?.isForwarded;
  const isRead = message.status === 'read';
  const hasReply = message.replyTo?.messageId || message.replyTo?.senderName;

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleReact = (emoji) => {
    reactToMessage(message._id, emoji);
    setShowMenu(false);
  };

  const handleReply = () => {
    setReplyTo({
      messageId: message._id,
      senderName,
      content: message.content || message.text || '[media]',
      type: message.type || 'text'
    });
    setShowMenu(false);
  };

  const handleEdit = () => {
    setEditingMessage({ _id: message._id, content: message.content || message.text || '' });
    setShowMenu(false);
  };

  const handleDelete = (forAll) => {
    deleteMessage(message._id, forAll);
    setShowMenu(false);
  };

  const handlePinWithDuration = (duration) => {
    pinMessage(message._id, duration);
    setShowPinModal(false);
    setShowMenu(false);
  };

  const handleTogglePin = () => {
    if (isPinned) {
      unpinMessage(message._id);
      setShowMenu(false);
    } else {
      setShowPinModal(true);
      setShowMenu(false);
    }
  };

  const confirmForward = () => {
    if (selectedConvs.length > 0) forwardMessage(message._id, selectedConvs);
    setShowForwardModal(false);
    setSelectedConvs([]);
  };

  // Aggregate reactions
  const reactionSummary = {};
  (message.reactions || []).forEach((r) => {
    const count = (Array.isArray(r.users) ? r.users : []).length;
    if (count > 0) reactionSummary[r.emoji] = { count, users: r.users };
  });

  const myReactions = new Set(
    (message.reactions || []).filter((r) =>
      (r.users || []).some((u) => (u._id || u)?.toString() === user?._id?.toString())
    ).map((r) => r.emoji)
  );

  // Issue 3 fix: overflow-hidden + break-words prevent content from spilling outside the bubble
  // Issue 2 fix: explicit dark mode text colors on every bubble variant
  // Responsive bubble styling:
  // - w-fit + min-w-[5.5rem] ensures short messages display naturally without squishing
  // - max-w-full expands up to parent column max-width (85% mobile, 75% tablet, 70% desktop)
  // - overflow-wrap:anywhere breaks long unbroken URLs while keeping normal words intact
  const bubbleBase = `w-fit min-w-[5.5rem] max-w-full rounded-3xl px-4 py-2.5 shadow-cute-sm transition-all text-sm relative group`;
  const bubbleColor = isMe
    ? 'bg-gradient-to-br from-coral via-coral to-coral-dark text-white rounded-br-sm shadow-cute'
    : 'bg-white dark:bg-slate-800 text-darktext dark:text-cream border-2 border-pastelpurple/40 rounded-bl-sm';

  return (
    <>
      <div
        id={`msg-${message._id}`}
        className={`flex items-end w-full gap-2 my-1.5 transition-all duration-300 ${
          isMe ? 'justify-end' : 'justify-start'
        }`}
      >
        {/* Avatar column for received messages only — avoids empty 40px right gap on sent messages */}
        {!isMe && (
          <div className="w-8 h-8 flex-shrink-0 self-end">
            {showAvatar && (
              <Avatar src={senderAvatar} name={senderName} size="xs" />
            )}
          </div>
        )}

        {/* Message container column with responsive max-width relative to chat area */}
        <div
          className={`flex flex-col max-w-[85%] sm:max-w-[75%] md:max-w-[70%] min-w-0 ${
            isMe ? 'items-end' : 'items-start'
          } relative`}
          ref={menuRef}
        >
          {/* Sender name for group */}
          {!isMe && isGroup && showAvatar && (
            <span className="text-[11px] font-bold font-fredoka text-deeppurple dark:text-coral-light ml-2 mb-0.5">
              {senderName}
            </span>
          )}

          {/* Forwarded label */}
          {isForwarded && !isDeleted && (
            <span className="text-[10px] font-semibold text-darktext/50 dark:text-cream/50 flex items-center gap-1 mb-0.5">
              <Forward className="w-3 h-3 text-coral" /> Forwarded from {message.forwardedFrom.originalSenderName}
            </span>
          )}

          {/* Pinned label */}
          {isPinned && !isDeleted && (
            <span className="text-[10px] text-coral font-bold font-fredoka flex items-center gap-1 mb-0.5 bg-softpink/60 dark:bg-deeppurple/30 px-2 py-0.5 rounded-full">
              <Pin className="w-3 h-3 fill-coral" /> Pinned message
            </span>
          )}

          {/* Reply preview banner */}
          {hasReply && !isDeleted && (
            <div
              className={`px-3 py-1.5 rounded-2xl mb-1 text-xs border-l-4 border-coral w-full max-w-full overflow-hidden ${
                isMe ? 'bg-white/20 text-white' : 'bg-softpink/40 dark:bg-slate-700/60 text-darktext dark:text-cream'
              }`}
            >
              <p className="font-bold font-fredoka text-[10px] opacity-90 truncate">{message.replyTo.senderName}</p>
              <p className="truncate opacity-80">{message.replyTo.content || '[media]'}</p>
            </div>
          )}

          {/* Main Bubble */}
          <div className={`${bubbleBase} ${bubbleColor}`}>
            {isDeleted ? (
              <p className="italic opacity-60 text-sm flex items-center gap-1.5">
                <span>💭</span> This message was deleted
              </p>
            ) : (
              <>
                {/* Text Message: natural word wrapping, preserves newlines, wraps URLs cleanly */}
                {(message.type === 'text' || !message.type) && (
                  <p className="whitespace-pre-wrap leading-relaxed select-text font-medium text-sm [overflow-wrap:anywhere]">
                    {message.content || message.text}
                  </p>
                )}

                {/* Image Attachment */}
                {message.type === 'image' && message.fileUrl && (
                  <div className="space-y-1 w-full min-w-[160px] max-w-sm">
                    <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-2xl">
                      <img
                        src={message.fileUrl}
                        alt={message.fileName || 'Attachment'}
                        className="rounded-2xl w-full max-h-72 object-cover cursor-zoom-in hover:opacity-95 shadow-cute-sm transition-transform hover:scale-[1.01]"
                      />
                    </a>
                    {message.content && (
                      <p className="text-sm font-medium mt-1 whitespace-pre-wrap [overflow-wrap:anywhere]">{message.content}</p>
                    )}
                  </div>
                )}

                {/* File Attachment */}
                {message.type === 'file' && message.fileUrl && (
                  <a
                    href={message.fileUrl}
                    download={message.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-2.5 rounded-2xl transition hover:opacity-90 min-w-[200px] max-w-xs ${
                      isMe ? 'bg-white/20' : 'bg-softpink/40 dark:bg-slate-700/60'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      isMe ? 'bg-white text-coral' : 'bg-coral text-white'
                    }`}>
                      <Download className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{message.fileName || 'File'}</p>
                      <p className="text-[10px] opacity-75">{formatFileSize(message.fileSize)}</p>
                    </div>
                  </a>
                )}

                {/* Voice Note */}
                {message.type === 'voice' && message.fileUrl && (
                  <div className="min-w-[220px] max-w-xs w-full">
                    <AudioPlayer src={message.fileUrl} duration={message.voiceDuration} isMe={isMe} />
                  </div>
                )}

                {/* Footer: time + read receipt */}
                <div
                  className={`flex items-center justify-end gap-1 mt-1 text-[10px] font-semibold select-none ${
                    isMe
                      ? 'text-white/80'
                      : 'text-darktext/50 dark:text-slate-400'
                  }`}
                >
                  {isEdited && <span className="opacity-80 italic">(edited)</span>}
                  <span className="whitespace-nowrap">{formatMessageTime(message.createdAt)}</span>
                  {isMe && (
                    <span className="flex-shrink-0">
                      {isRead ? (
                        <CheckCheck className="w-3.5 h-3.5 inline text-white stroke-[2.5]" />
                      ) : message.status === 'delivered' ? (
                        <CheckCheck className="w-3.5 h-3.5 inline opacity-70" />
                      ) : (
                        <Check className="w-3.5 h-3.5 inline opacity-70" />
                      )}
                    </span>
                  )}
                </div>
              </>
            )}

            {/* Hover Action Trigger Button */}
            {!isDeleted && (
              <div
                className={`absolute top-1/2 -translate-y-1/2 ${
                  isMe ? '-left-8' : '-right-8'
                } hidden group-hover:flex items-center gap-1 z-20`}
              >
                <button
                  onClick={() => setShowMenu((p) => !p)}
                  className="p-1.5 rounded-full bg-white dark:bg-slate-800 shadow-cute-sm text-darktext/60 hover:text-coral transition hover:scale-110 active:scale-95 border border-pastelpurple/40"
                  title="Message options"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Reaction Badges */}
          {Object.keys(reactionSummary).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {Object.entries(reactionSummary).map(([emoji, { count }]) => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-fredoka transition-all hover:scale-105 active:scale-95 shadow-cute-sm ${
                    myReactions.has(emoji)
                      ? 'bg-softpink dark:bg-slate-800 border-2 border-coral text-coral'
                      : 'bg-white/90 dark:bg-slate-800 border-2 border-pastelpurple/40 text-darktext dark:text-cream'
                  }`}
                >
                  <span>{emoji}</span>
                  <span className="text-[11px]">{count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Context Popover Menu */}
          {showMenu && !isDeleted && (
            <div
              className={`absolute z-50 mt-1 w-48 bg-white dark:bg-slate-800 rounded-3xl shadow-cute-lg border-2 border-pastelpurple/50 p-1.5 overflow-hidden animate-pop ${
                isMe ? 'right-0' : 'left-0'
              } top-full`}
            >
              {/* Quick Emojis Row */}
              <div className="flex items-center justify-between p-2 border-b border-pastelpurple/20 bg-cream/50 dark:bg-slate-900/50 rounded-2xl mb-1">
                {REACTIONS.map((e) => (
                  <button
                    key={e}
                    onClick={() => handleReact(e)}
                    title={e}
                    className={`text-base hover:scale-125 transition-transform ${
                      myReactions.has(e) ? 'scale-115 drop-shadow-sm' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>

              <button
                onClick={handleReply}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-bold font-fredoka text-darktext dark:text-cream hover:bg-softpink/40 dark:hover:bg-slate-700/60 rounded-xl transition"
              >
                <Reply className="w-3.5 h-3.5 text-deeppurple dark:text-pastelpurple" /> Reply
              </button>

              <button
                onClick={() => {
                  setShowForwardModal(true);
                  setShowMenu(false);
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-bold font-fredoka text-darktext dark:text-cream hover:bg-softpink/40 dark:hover:bg-slate-700/60 rounded-xl transition"
              >
                <Forward className="w-3.5 h-3.5 text-coral" /> Forward
              </button>

              <button
                onClick={handleTogglePin}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-bold font-fredoka text-coral hover:bg-softpink/40 dark:hover:bg-slate-700/60 rounded-xl transition"
              >
                <Pin className="w-3.5 h-3.5 fill-coral/30" />
                {isPinned ? 'Unpin message' : 'Pin message...'}
              </button>

              {isMe && message.type === 'text' && (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-bold font-fredoka text-darktext dark:text-cream hover:bg-softpink/40 dark:hover:bg-slate-700/60 rounded-xl transition"
                >
                  <Pencil className="w-3.5 h-3.5 text-deeppurple dark:text-pastelpurple" /> Edit
                </button>
              )}

              {isMe && (
                <>
                  <div className="h-px bg-pastelpurple/30 my-1" />
                  <button
                    onClick={() => handleDelete(false)}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-bold font-fredoka text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete for me
                  </button>
                  <button
                    onClick={() => handleDelete(true)}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-bold font-fredoka text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete for everyone
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pin Duration Modal (1 Day, 7 Days, 30 Days) */}
      {showPinModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-pop"
          onClick={() => setShowPinModal(false)}
        >
          <div
            className="cute-card p-6 w-full max-w-xs select-none shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-3">
              <Pin className="w-5 h-5 text-coral fill-coral/30" />
              <h3 className="font-bold font-fredoka text-base text-darktext dark:text-cream">
                Pin Message
              </h3>
            </div>
            <p className="text-xs text-darktext/70 dark:text-cream/70 mb-4 font-medium">
              Choose how long this message should stay pinned:
            </p>
            <div className="space-y-2">
              {[
                { label: '24 Hours (1 Day)', duration: '1d' },
                { label: '7 Days (Standard)', duration: '7d' },
                { label: '30 Days (Extended)', duration: '30d' }
              ].map(({ label, duration }) => (
                <button
                  key={duration}
                  onClick={() => handlePinWithDuration(duration)}
                  className="w-full py-2.5 px-4 text-xs font-bold font-fredoka rounded-2xl bg-cream dark:bg-slate-800 border-2 border-pastelpurple/40 hover:border-coral hover:bg-softpink/40 text-darktext dark:text-cream flex items-center justify-between transition"
                >
                  <span>{label}</span>
                  <Clock className="w-3.5 h-3.5 text-coral" />
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowPinModal(false)}
              className="mt-4 w-full py-2 text-xs font-bold text-darktext/50 hover:text-darktext transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Forward Modal */}
      {showForwardModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-pop"
          onClick={() => setShowForwardModal(false)}
        >
          <div
            className="cute-card p-6 w-full max-w-sm select-none shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-4">
              <Forward className="w-5 h-5 text-coral" />
              <h3 className="font-bold font-fredoka text-lg text-darktext dark:text-cream">
                Forward To Friend
              </h3>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1.5 p-1">
              {conversations.map((c) => {
                const name = c.type === 'group'
                  ? c.groupName
                  : c.participants?.find((p) => (p._id || p) !== user?._id)?.username || 'Friend';
                const checked = selectedConvs.includes(c._id);
                return (
                  <label
                    key={c._id}
                    className={`flex items-center gap-3 p-2.5 rounded-2xl border-2 transition cursor-pointer ${
                      checked
                        ? 'bg-softpink/40 dark:bg-slate-800 border-coral/60'
                        : 'bg-white/60 dark:bg-slate-900 border-pastelpurple/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setSelectedConvs((prev) =>
                          checked ? prev.filter((id) => id !== c._id) : [...prev, c._id]
                        )
                      }
                      className="accent-coral w-4 h-4 rounded-md"
                    />
                    <span className="text-xs font-bold font-fredoka text-darktext dark:text-cream">{name}</span>
                  </label>
                );
              })}
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowForwardModal(false)}
                className="flex-1 py-2.5 text-xs font-bold font-fredoka text-darktext/70 dark:text-cream/70 border-2 border-pastelpurple/40 rounded-2xl hover:bg-cream dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmForward}
                disabled={selectedConvs.length === 0}
                className="cute-btn-primary flex-1 py-2.5 text-xs font-bold font-fredoka tracking-wide disabled:opacity-50"
              >
                Forward ({selectedConvs.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageBubble;
