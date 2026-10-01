import React, { useState, useEffect } from 'react';
import { Search, MessageSquarePlus, Loader2, Sparkles, Heart } from 'lucide-react';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import Mascot from '../common/Mascot';
import api from '../../api/axios';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import { formatLastSeen } from '../../utils/dateUtils';

export const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const { startPrivateChat } = useChat();
  const { isUserOnline } = useSocket();

  // Load suggested users on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      const fetchInitialUsers = async () => {
        setLoading(true);
        try {
          const res = await api.get('/users');
          if (res.data.success) {
            setRecentUsers(res.data.users);
          }
        } catch (err) {
          console.error('Failed to load suggested users:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchInitialUsers();
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/users/search?q=${encodeURIComponent(query.trim())}`);
        if (res.data.success) {
          setResults(res.data.users);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectUser = async (userId) => {
    try {
      setStartingChat(true);
      await startPrivateChat(userId);
      onClose();
    } catch (err) {
      console.error('Failed to initiate conversation:', err);
    } finally {
      setStartingChat(false);
    }
  };

  const displayList = query.trim() ? results : recentUsers;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Find Mochi Friends">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-coral" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username or email..."
            className="w-full pl-11 pr-4 py-3 bg-cream/70 dark:bg-slate-800/80 border-2 border-pastelpurple/40 focus:border-coral rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-coral/20 text-darktext dark:text-cream placeholder-darktext/40 font-quicksand font-medium transition"
            autoFocus
          />
        </div>

        {/* List of Users */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 text-deeppurple dark:text-pastelpurple">
              <Loader2 className="w-7 h-7 animate-spin mb-2 text-coral" />
              <span className="text-xs font-fredoka">Looking for friends...</span>
            </div>
          ) : displayList.length === 0 ? (
            <div className="py-8 flex flex-col items-center text-center">
              <Mascot mood="thinking" size="sm" className="mb-2" />
              <p className="text-sm font-fredoka text-darktext/70 dark:text-cream/70">
                {query ? 'No friends found matching that!' : 'No other friends registered yet.'}
              </p>
              <p className="text-xs text-darktext/50 dark:text-cream/50 mt-1">
                Invite friends to join MochiChat!
              </p>
            </div>
          ) : (
            displayList.map((targetUser) => {
              const online = isUserOnline(targetUser._id) || targetUser.isOnline;
              return (
                <div
                  key={targetUser._id}
                  onClick={() => !startingChat && handleSelectUser(targetUser._id)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-pastelpurple/20 hover:border-coral/40 hover:bg-softpink/20 dark:hover:bg-slate-800 cursor-pointer transition shadow-xs group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Avatar
                      src={targetUser.avatar}
                      name={targetUser.username}
                      size="md"
                      isOnline={online}
                      showBadge={true}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-fredoka font-semibold text-darktext dark:text-cream truncate group-hover:text-coral transition-colors">
                        {targetUser.username}
                      </p>
                      <p className="text-xs text-darktext/50 dark:text-cream/50 truncate">
                        {online ? (
                          <span className="text-emerald-500 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Online now
                          </span>
                        ) : (
                          formatLastSeen(false, targetUser.lastSeen)
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={startingChat}
                    className="px-3 py-1.5 text-xs font-fredoka font-medium text-white bg-coral hover:bg-coral-dark rounded-xl shadow-xs flex items-center gap-1.5 opacity-90 group-hover:opacity-100 group-hover:scale-105 transition"
                    title="Start Chat"
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                    <span>Chat 👋</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SearchModal;
