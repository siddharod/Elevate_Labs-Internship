import React, {
  createContext, useContext, useState, useEffect, useCallback, useRef
} from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Map());
  const [replyTo, setReplyTo] = useState(null);   // { messageId, senderName, content, type }
  const [editingMessage, setEditingMessage] = useState(null); // { _id, content }
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const activeConvRef = useRef(activeConversation);
  activeConvRef.current = activeConversation;

  // ─── FETCH CONVERSATIONS ──────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setIsLoadingConversations(true);
    try {
      const res = await api.get('/conversations');
      if (res.data.success) setConversations(res.data.conversations);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchConversations();
    else { setConversations([]); setActiveConversation(null); setMessages([]); }
  }, [user, fetchConversations]);

  // ─── SELECT CONVERSATION ──────────────────────────────────────────────────
  const selectConversation = useCallback(async (conv) => {
    if (!conv) {
      if (activeConvRef.current && socket) socket.emit('leave_conversation', activeConvRef.current._id);
      setActiveConversation(null); setMessages([]); setReplyTo(null); setEditingMessage(null);
      return;
    }
    if (activeConvRef.current && activeConvRef.current._id !== conv._id && socket)
      socket.emit('leave_conversation', activeConvRef.current._id);

    setActiveConversation(conv);
    setReplyTo(null); setEditingMessage(null);
    setIsLoadingMessages(true);

    if (socket) {
      socket.emit('join_conversation', conv._id);
      socket.emit('message_read', { conversationId: conv._id });
    }

    setConversations((prev) => prev.map((c) => c._id === conv._id ? { ...c, unreadCount: 0 } : c));

    try {
      const res = await api.get(`/messages/${conv._id}`);
      if (res.data.success) setMessages(res.data.messages);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [socket]);

  // ─── SEND MESSAGE ─────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (payload) => {
    const currentActive = activeConvRef.current;
    if (!currentActive || !user) return;

    const { text, type = 'text', fileUrl, fileName, fileType, fileSize, voiceDuration } = payload;
    const content = typeof payload === 'string' ? payload : text;
    if (type === 'text' && !content?.trim()) return;

    if (socket && socket.connected) {
      socket.emit('send_message', {
        conversationId: currentActive._id,
        content: content?.trim() || '',
        type,
        fileUrl, fileName, fileType, fileSize, voiceDuration,
        replyTo: replyTo || undefined
      });
      setReplyTo(null);
    }
  }, [socket, user, replyTo]);

  // ─── TYPING ───────────────────────────────────────────────────────────────
  const sendTyping = useCallback((isTyping) => {
    const currentActive = activeConvRef.current;
    if (!currentActive || !socket) return;
    socket.emit(isTyping ? 'typing' : 'stop_typing', { conversationId: currentActive._id });
  }, [socket]);

  // ─── REACT TO MESSAGE ─────────────────────────────────────────────────────
  const reactToMessage = useCallback((messageId, emoji) => {
    if (!socket) return;
    socket.emit('message_reaction', { messageId, emoji });
  }, [socket]);

  // ─── EDIT MESSAGE ─────────────────────────────────────────────────────────
  const submitEdit = useCallback((messageId, content) => {
    if (!socket || !content.trim()) return;
    socket.emit('message_edit', { messageId, content: content.trim() });
    setEditingMessage(null);
  }, [socket]);

  // ─── DELETE MESSAGE ───────────────────────────────────────────────────────
  const deleteMessage = useCallback((messageId, deleteForEveryone = false) => {
    if (!socket) return;
    socket.emit('message_delete', { messageId, deleteForEveryone });
  }, [socket]);

  // ─── FORWARD MESSAGE ──────────────────────────────────────────────────────
  const forwardMessage = useCallback((messageId, targetConversationIds) => {
    if (!socket) return;
    socket.emit('message_forward', { messageId, targetConversationIds });
  }, [socket]);

  // ─── PIN / UNPIN MESSAGE ──────────────────────────────────────────────────
  const pinMessage = useCallback((messageId, duration = '7d') => {
    if (!socket) return;
    socket.emit('message_pin', { messageId, duration });
  }, [socket]);

  const unpinMessage = useCallback((messageId) => {
    if (!socket) return;
    socket.emit('message_unpin', { messageId });
  }, [socket]);

  // ─── START PRIVATE CHAT ────────────────────────────────────────────────────
  const startPrivateChat = async (recipientId) => {
    try {
      const res = await api.post('/conversations', { recipientId });
      if (res.data.success) {
        const conv = res.data.conversation;
        setConversations((prev) => {
          const exists = prev.find((c) => c._id === conv._id);
          return exists ? prev.map((c) => c._id === conv._id ? conv : c) : [conv, ...prev];
        });
        await selectConversation(conv);
        return conv;
      }
    } catch (err) { throw err; }
  };

  // ─── GROUP OPERATIONS ─────────────────────────────────────────────────────
  const createGroupChat = async (groupName, members, groupAvatar) => {
    try {
      const res = await api.post('/groups', { groupName, members, groupAvatar });
      if (res.data.success) {
        const group = res.data.group;
        setConversations((prev) => [group, ...prev]);
        await selectConversation(group);
        return group;
      }
    } catch (err) { throw err; }
  };

  const hideConversation = async (conversationId) => {
    try {
      const res = await api.delete(`/conversations/${conversationId}`);
      if (res.data.success) {
        setConversations((prev) => prev.filter((c) => c._id !== conversationId));
        if (activeConvRef.current?._id === conversationId) {
          setActiveConversation(null); setMessages([]);
        }
      }
    } catch (err) { console.error('Failed to hide conversation:', err); }
  };

  const addGroupMembers = async (groupId, newMembers) => {
    try {
      const res = await api.put(`/groups/${groupId}/members`, { newMembers });
      if (res.data.success) {
        const upd = res.data.group;
        setConversations((prev) => prev.map((c) => c._id === groupId ? { ...c, ...upd } : c));
        if (activeConvRef.current?._id === groupId) setActiveConversation((p) => ({ ...p, ...upd }));
        return upd;
      }
    } catch (err) { throw err; }
  };

  const removeGroupMember = async (groupId, userId2) => {
    try {
      const res = await api.delete(`/groups/${groupId}/members/${userId2}`);
      if (res.data.success) {
        if (userId2 === user?._id) {
          setConversations((prev) => prev.filter((c) => c._id !== groupId));
          if (activeConvRef.current?._id === groupId) { setActiveConversation(null); setMessages([]); }
        } else {
          const upd = res.data.group;
          setConversations((prev) => prev.map((c) => c._id === groupId ? { ...c, ...upd } : c));
          if (activeConvRef.current?._id === groupId) setActiveConversation((p) => ({ ...p, ...upd }));
        }
      }
    } catch (err) { throw err; }
  };

  // ─── SEARCH MESSAGES ──────────────────────────────────────────────────────
  const searchMessages = useCallback(async (query, conversationId) => {
    if (!query.trim()) { setSearchResults([]); return; }
    setIsSearching(true);
    try {
      const params = { q: query };
      if (conversationId) params.conversationId = conversationId;
      const res = await api.get('/messages/search', { params });
      if (res.data.success) setSearchResults(res.data.messages);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // ─── SOCKET EVENT LISTENERS ───────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      const currentActive = activeConvRef.current;
      if (currentActive && currentActive._id === msg.conversation?.toString() ||
          currentActive && currentActive._id === msg.conversationId?.toString() ||
          currentActive && currentActive._id === (msg.conversation?._id || msg.conversation)?.toString()) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        if (socket) socket.emit('message_read', { conversationId: currentActive._id });
      }
      setConversations((prev) => {
        const convId = (msg.conversation?._id || msg.conversation || msg.conversationId)?.toString();
        const found = prev.find((c) => c._id === convId);
        const isCurrentActive = currentActive && currentActive._id === convId;
        const isSenderMe = user && (msg.sender?._id || msg.sender)?.toString() === user._id?.toString();
        if (found) {
          const updated = { ...found, lastMessage: { content: msg.content || msg.text, type: msg.type, sender: msg.sender, createdAt: msg.createdAt }, updatedAt: msg.createdAt, unreadCount: isCurrentActive || isSenderMe ? 0 : (found.unreadCount || 0) + 1 };
          return [updated, ...prev.filter((c) => c._id !== convId)];
        }
        fetchConversations(); return prev;
      });
    };

    const handleConvUpdated = () => fetchConversations();
    const handleTyping = ({ conversationId, username }) => {
      setTypingUsers((prev) => { const next = new Map(prev); const set = new Set(next.get(conversationId) || []); set.add(username); next.set(conversationId, set); return next; });
    };
    const handleStopTyping = ({ conversationId }) => {
      setTypingUsers((prev) => { const next = new Map(prev); next.delete(conversationId); return next; });
    };
    const handleMessagesRead = ({ conversationId }) => {
      const currentActive = activeConvRef.current;
      if (currentActive && currentActive._id === conversationId) {
        setMessages((prev) => prev.map((m) => {
          const senderId = (m.sender?._id || m.sender)?.toString();
          if (senderId === user?._id?.toString()) return { ...m, status: 'read' };
          return m;
        }));
      }
    };
    const handleReactionUpdated = (updated) => {
      setMessages((prev) => prev.map((m) => m._id === updated._id ? { ...m, reactions: updated.reactions } : m));
    };
    const handleMessageEdited = (updated) => {
      setMessages((prev) => prev.map((m) => m._id === updated._id ? { ...m, content: updated.content, text: updated.content, edited: updated.edited } : m));
    };
    const handleMessageDeleted = ({ messageId, deleteForEveryone }) => {
      if (deleteForEveryone) {
        setMessages((prev) => prev.map((m) => m._id === messageId ? { ...m, deleted: { isDeletedForEveryone: true }, content: '', text: '' } : m));
      } else {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      }
    };

    const handlePinnedUpdated = ({ conversationId, pinnedMessages }) => {
      setActiveConversation((prev) => (prev && prev._id === conversationId ? { ...prev, pinnedMessages } : prev));
      setConversations((prev) => prev.map((c) => (c._id === conversationId ? { ...c, pinnedMessages } : c)));
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('conversation_updated', handleConvUpdated);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);
    socket.on('messages_read', handleMessagesRead);
    socket.on('message_reaction_updated', handleReactionUpdated);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('conversation_pinned_updated', handlePinnedUpdated);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('conversation_updated', handleConvUpdated);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
      socket.off('messages_read', handleMessagesRead);
      socket.off('message_reaction_updated', handleReactionUpdated);
      socket.off('message_edited', handleMessageEdited);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('conversation_pinned_updated', handlePinnedUpdated);
    };
  }, [socket, user, fetchConversations]);

  return (
    <ChatContext.Provider value={{
      conversations, activeConversation, messages,
      isLoadingConversations, isLoadingMessages,
      typingUsers, replyTo, editingMessage,
      searchResults, isSearching,
      setReplyTo, setEditingMessage, setSearchResults,
      selectConversation, sendMessage, sendTyping,
      reactToMessage, submitEdit, deleteMessage, forwardMessage,
      pinMessage, unpinMessage,
      startPrivateChat, createGroupChat, hideConversation,
      addGroupMembers, removeGroupMember,
      searchMessages, fetchConversations
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within a ChatProvider');
  return ctx;
};
