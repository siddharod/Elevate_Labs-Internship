import React, { useState } from 'react';
import {
  Search, UserPlus, Users, Sun, Moon, LogOut, Settings,
  Bell, X, MessageSquare, Sparkles, Heart
} from 'lucide-react';
import ConversationItem from './ConversationItem';
import SearchModal from './SearchModal';
import CreateGroupModal from './CreateGroupModal';
import Avatar from '../common/Avatar';
import Mascot from '../common/Mascot';
import LoadingSpinner from '../common/LoadingSpinner';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { formatMessageTime } from '../../utils/dateUtils';

const NotificationPanel = ({ onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllRead, deleteNotification } = useNotifications();

  return (
    <div className="absolute left-0 right-0 top-0 h-full bg-white dark:bg-slate-900 z-40 flex flex-col shadow-2xl animate-pop">
      <div className="flex items-center justify-between p-4 border-b-2 border-pastelpurple/30 bg-softpink/40 dark:bg-slate-800/60">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-coral" />
          <h2 className="text-sm font-bold font-fredoka text-darktext dark:text-cream">Notifications</h2>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold font-fredoka bg-coral text-white px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs font-bold font-fredoka text-coral hover:text-coral-dark px-2 py-1 transition"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-darktext/50 hover:text-coral hover:bg-white dark:hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-darktext/50 dark:text-cream/50 p-8 text-center">
            <Mascot mood="sleeping" size="sm" className="mb-2 opacity-80" />
            <p className="text-sm font-bold font-fredoka">No notifications yet!</p>
            <p className="text-xs text-darktext/40 dark:text-cream/40 mt-1">All quiet and peaceful here 💤</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.read && markAsRead(n._id)}
              className={`flex items-start gap-3 p-3 rounded-2xl border-2 transition cursor-pointer ${
                !n.read
                  ? 'bg-softpink/40 dark:bg-slate-800/80 border-coral/40 shadow-cute-sm'
                  : 'bg-white/60 dark:bg-slate-900 border-pastelpurple/20'
              }`}
            >
              <div className="relative flex-shrink-0">
                <Avatar
                  src={n.sender?.avatar || n.sender?.profilePicture}
                  name={n.sender?.username}
                  size="sm"
                />
                {!n.read && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-coral rounded-full ring-2 ring-white dark:ring-slate-900" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs leading-relaxed ${n.read ? 'text-darktext/60 dark:text-cream/60' : 'text-darktext dark:text-cream font-bold'}`}>
                  <span className="text-deeppurple dark:text-coral-light font-bold font-fredoka">{n.sender?.username}</span>{' '}
                  {n.type === 'new_message' ? 'sent you a message' : 'mentioned you'}
                  {n.conversation?.groupName && ` in ${n.conversation.groupName}`}
                </p>
                <p className="text-[10px] font-semibold text-darktext/40 dark:text-cream/40 mt-0.5">{formatMessageTime(n.createdAt)}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(n._id);
                }}
                className="p-1 rounded-lg text-darktext/30 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const Sidebar = ({ onSelectConversation }) => {
  const { conversations, activeConversation, selectConversation, isLoadingConversations } = useChat();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isSocketConnected } = useSocket();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const [searchFilter, setSearchFilter] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'direct' | 'groups'
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const filteredConversations = conversations.filter((conv) => {
    // Tab filter
    if (activeTab === 'direct' && conv.type === 'group') return false;
    if (activeTab === 'groups' && conv.type !== 'group') return false;

    // Search filter
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    if (conv.type === 'group') return conv.groupName?.toLowerCase().includes(q);
    const other = conv.participants?.find((p) => p._id !== user?._id);
    return (
      other?.username?.toLowerCase().includes(q) ||
      other?.name?.toLowerCase().includes(q)
    );
  });

  const handleSelect = (conv) => {
    selectConversation(conv);
    if (onSelectConversation) onSelectConversation();
  };

  return (
    <>
      <aside className="w-full md:w-80 lg:w-96 h-full flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-r-2 border-pastelpurple/30 relative overflow-hidden select-none">
        {/* Notification Panel (overlay) */}
        {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}

        {/* Top Header with Cute Mascot Logo */}
        <div className="p-4 border-b-2 border-pastelpurple/20 flex items-center justify-between flex-shrink-0 bg-gradient-to-r from-cream via-softpink/40 to-cream dark:from-slate-900 dark:via-deeppurple/15 dark:to-slate-900">
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => navigate('/chat')}>
            {/* Mascot Mini Icon */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-softpink to-pastelpurple flex items-center justify-center shadow-cute-sm p-0.5 border border-white">
              <Mascot mood="happy" size="xs" animate={false} />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h1 className="font-extrabold font-fredoka text-lg text-darktext dark:text-cream tracking-tight">
                  MochiChat
                </h1>
                <Sparkles className="w-3.5 h-3.5 text-coral fill-coral/40" />
              </div>
              <p className="text-[10px] font-semibold text-deeppurple/70 dark:text-pastelpurple/70">
                Cute Messenger
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2.5 text-darktext/70 dark:text-cream/70 hover:text-coral hover:bg-softpink/40 dark:hover:bg-slate-800 rounded-2xl transition-all hover:scale-105 active:scale-95"
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-coral text-white text-[9px] font-extrabold font-fredoka rounded-full flex items-center justify-center px-1 shadow-sm animate-pop">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Find Users */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 text-darktext/70 dark:text-cream/70 hover:text-deeppurple hover:bg-pastelpurple/40 dark:hover:bg-slate-800 rounded-2xl transition-all hover:scale-105 active:scale-95"
              title="Find Friends"
            >
              <UserPlus className="w-4.5 h-4.5" />
            </button>

            {/* Create Group */}
            <button
              onClick={() => setIsGroupModalOpen(true)}
              className="p-2.5 text-darktext/70 dark:text-cream/70 hover:text-coral hover:bg-softpink/40 dark:hover:bg-slate-800 rounded-2xl transition-all hover:scale-105 active:scale-95"
              title="Create Group"
            >
              <Users className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-3.5 pt-3 pb-2 flex-shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-darktext/40 dark:text-cream/40" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search conversations..."
              className="cute-input w-full pl-10 pr-4 py-2 text-xs font-medium text-darktext dark:text-cream placeholder-darktext/40 dark:placeholder-cream/40"
            />
          </div>
        </div>

        {/* Cute Filter Tabs (All / Direct / Groups) */}
        <div className="px-3.5 pb-2 flex items-center gap-1.5 flex-shrink-0">
          {[
            { id: 'all', label: 'All Chats' },
            { id: 'direct', label: 'Direct' },
            { id: 'groups', label: 'Groups' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold font-fredoka transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-coral to-coral-light text-white shadow-cute-sm scale-[1.02]'
                  : 'bg-softpink/30 dark:bg-slate-800/60 text-darktext/60 dark:text-cream/60 hover:text-darktext dark:hover:text-cream'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-1 py-1 space-y-0.5">
          {isLoadingConversations ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <Mascot mood="thinking" size="sm" className="mb-2" />
              <LoadingSpinner size="sm" text="Gathering cute chats..." />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Mascot mood="wave" size="sm" className="mb-3" />
              <h3 className="text-sm font-bold font-fredoka text-darktext dark:text-cream">
                {searchFilter ? 'No matching chats found' : 'No chats yet!'}
              </h3>
              <p className="text-xs text-darktext/50 dark:text-cream/50 mt-1 max-w-[210px]">
                {searchFilter
                  ? 'Try searching for another nickname.'
                  : 'Hop in and say hello to someone special! ✨'}
              </p>
              {!searchFilter && (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="cute-btn-primary mt-4 px-4 py-2 text-xs font-fredoka tracking-wide flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Find Friends
                </button>
              )}
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <ConversationItem
                key={conv._id}
                conversation={conv}
                isActive={activeConversation?._id === conv._id}
                onClick={() => handleSelect(conv)}
              />
            ))
          )}
        </div>

        {/* Bottom User Bar */}
        <div className="p-3 border-t-2 border-pastelpurple/20 flex items-center justify-between bg-gradient-to-r from-cream via-softpink/30 to-cream dark:from-slate-900 dark:via-deeppurple/10 dark:to-slate-900 flex-shrink-0">
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-2.5 cursor-pointer min-w-0 pr-2 hover:opacity-90 transition-transform active:scale-98"
            title="View Profile"
          >
            <Avatar
              src={user?.avatar || user?.profilePicture}
              name={user?.name || user?.username}
              size="sm"
              isOnline={isSocketConnected}
              showBadge={true}
            />
            <div className="min-w-0">
              <p className="text-xs font-bold font-fredoka text-darktext dark:text-cream truncate">
                {user?.name || user?.username}
              </p>
              <p className={`text-[10px] font-semibold truncate flex items-center gap-1 ${isSocketConnected ? 'text-emerald-500' : 'text-amber-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isSocketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {isSocketConnected ? 'Active now' : 'Connecting...'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={toggleTheme}
              className="p-2 text-darktext/60 dark:text-cream/60 hover:text-amber-500 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-deeppurple" />}
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="p-2 text-darktext/60 dark:text-cream/60 hover:text-deeppurple hover:bg-white dark:hover:bg-slate-800 rounded-xl transition"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="p-2 text-darktext/60 dark:text-cream/60 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CreateGroupModal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} />
    </>
  );
};

export default Sidebar;
