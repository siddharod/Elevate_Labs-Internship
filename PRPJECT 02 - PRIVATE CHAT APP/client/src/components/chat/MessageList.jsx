import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import LoadingSpinner from '../common/LoadingSpinner';
import Mascot from '../common/Mascot';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

export const MessageList = () => {
  const { messages, isLoadingMessages, activeConversation } = useChat();
  const { user } = useAuth();
  const bottomRef = useRef(null);

  // Auto-scroll to newest message whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoadingMessages) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Mascot mood="thinking" size="sm" className="mb-2" />
        <LoadingSpinner size="sm" text="Fetching messages..." />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
        <Mascot
          mood="happy"
          size="md"
          message="Say hi! 👋"
          className="mb-2 drop-shadow-sm"
        />
        <p className="text-base font-bold font-fredoka text-darktext dark:text-cream mt-2">
          No messages here yet!
        </p>
        <p className="text-xs font-medium text-darktext/60 dark:text-cream/60 mt-1 max-w-xs">
          Send a cute message or emoji to kick off the conversation!
        </p>
      </div>
    );
  }

  const isGroup = activeConversation?.type === 'group';

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-1 w-full">
      {messages.map((msg, index) => {
        const senderId = (msg.sender?._id || msg.sender)?.toString();
        const myId = user?._id?.toString();
        const isMe = senderId === myId;

        // Check if next message is from the same sender (for grouped avatars)
        const nextMsg = messages[index + 1];
        const nextSenderId = (nextMsg?.sender?._id || nextMsg?.sender)?.toString();
        const showAvatar = !isMe && nextSenderId !== senderId;

        return (
          <MessageBubble
            key={msg._id || index}
            message={msg}
            isMe={isMe}
            showAvatar={showAvatar}
            isGroup={isGroup}
          />
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
