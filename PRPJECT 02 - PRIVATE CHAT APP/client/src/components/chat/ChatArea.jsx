import React, { useState } from 'react';
import { UserPlus, Sparkles } from 'lucide-react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import Mascot from '../common/Mascot';
import SearchModal from '../sidebar/SearchModal';
import { useChat } from '../../context/ChatContext';

export const ChatArea = ({ onBackMobile }) => {
  const { activeConversation } = useChat();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  if (!activeConversation) {
    return (
      <>
        <div className="flex-1 hidden md:flex flex-col items-center justify-center p-8 text-center select-none bg-gradient-to-br from-cream/60 via-softpink/20 to-pastelpurple/30 dark:from-[#181424] dark:via-[#1e1930] dark:to-[#171322] relative overflow-hidden">
          {/* Decorative floating pastel circles */}
          <div className="absolute top-[20%] left-[15%] w-32 h-32 rounded-full bg-softpink/40 dark:bg-deeppurple/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-[20%] right-[15%] w-40 h-40 rounded-full bg-skyblue/40 dark:bg-coral/10 blur-2xl pointer-events-none" />

          {/* Cute Mascot with Speech Bubble */}
          <div className="mb-4">
            <Mascot
              mood="idle"
              size="lg"
              message="Ready for cute chats! ✨"
              className="drop-shadow-lg"
            />
          </div>

          <h2 className="text-2xl font-extrabold font-fredoka text-darktext dark:text-cream mt-2">
            No Conversation Selected
          </h2>
          <p className="text-sm font-medium text-darktext/60 dark:text-cream/60 mt-1 max-w-sm leading-relaxed">
            Pick a friend from the left sidebar or start a brand new cute conversation!
          </p>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="cute-btn-primary mt-6 px-6 py-3 font-fredoka text-sm tracking-wide flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Find Friends to Chat</span>
            <Sparkles className="w-4 h-4 fill-white/40" />
          </button>
        </div>

        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </>
    );
  }

  const customBg = activeConversation?.chatBackground || localStorage.getItem('chat_wallpaper') || '';
  const bgStyle = customBg
    ? customBg.startsWith('linear-gradient') || customBg.startsWith('radial-gradient')
      ? { backgroundImage: customBg }
      : customBg.startsWith('url(')
        ? { backgroundImage: customBg, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
        : { backgroundColor: customBg }
    : {};

  return (
    <main
      className="flex-1 flex flex-col h-full bg-[#FFF8F0]/40 dark:bg-[#161322]/80 overflow-hidden relative"
      style={bgStyle}
    >
      <ChatHeader onBackMobile={onBackMobile} />
      <MessageList />
      <MessageInput />
    </main>
  );
};

export default ChatArea;
