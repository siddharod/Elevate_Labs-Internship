import React, { useState } from 'react';
import Sidebar from '../components/sidebar/Sidebar';
import ChatArea from '../components/chat/ChatArea';
import { useChat } from '../context/ChatContext';

export const ChatPage = () => {
  const { activeConversation, selectConversation } = useChat();
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  const handleSelectConversation = () => {
    setIsMobileChatOpen(true);
  };

  const handleBackToMobileList = () => {
    setIsMobileChatOpen(false);
    selectConversation(null);
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-white dark:bg-slate-900 transition-colors">
      {/* Sidebar: Visible on desktop, or on mobile when chat is not active */}
      <div
        className={`h-full ${
          isMobileChatOpen && activeConversation ? 'hidden md:block' : 'w-full md:w-auto'
        }`}
      >
        <Sidebar onSelectConversation={handleSelectConversation} />
      </div>

      {/* Chat Area: Visible on desktop, or on mobile when chat is active */}
      <div
        className={`h-full flex-1 flex flex-col ${
          !isMobileChatOpen && !activeConversation ? 'hidden md:flex' : 'flex'
        }`}
      >
        <ChatArea onBackMobile={handleBackToMobileList} />
      </div>
    </div>
  );
};

export default ChatPage;
