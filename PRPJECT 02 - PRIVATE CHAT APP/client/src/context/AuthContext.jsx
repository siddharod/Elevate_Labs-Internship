import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('chat_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('chat_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Verify persistent token validity on initial mount
  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('chat_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Authentication token verification failed:', err.response?.data?.message);
          logout();
        }
      }
      setIsLoading(false);
    };

    verifyAuth();
  }, [token]);

  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('chat_token', res.data.token);
      localStorage.setItem('chat_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const register = async (nameOrData, username, email, password, confirmPassword, profilePicture) => {
    const payload = typeof nameOrData === 'object' && nameOrData !== null
      ? nameOrData
      : {
          name: nameOrData,
          username,
          email,
          password,
          confirmPassword,
          profilePicture
        };

    const res = await api.post('/auth/register', payload);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('chat_token', res.data.token);
      localStorage.setItem('chat_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (err) {
      console.warn('Logout error ignored:', err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('chat_token');
      localStorage.removeItem('chat_user');
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('chat_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
