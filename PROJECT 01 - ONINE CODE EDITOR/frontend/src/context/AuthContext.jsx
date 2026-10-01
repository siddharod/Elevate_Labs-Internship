import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cb_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Fetch current user details on mount if access token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('cb_access_token');
      if (token) {
        try {
          const res = await api.get('/auth/me/');
          setUser(res.data);
          localStorage.setItem('cb_user', JSON.stringify(res.data));
        } catch (err) {
          console.error('Failed to load user profile on init:', err);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login/', { username, password });
    const { access, refresh, user: userData } = res.data;
    localStorage.setItem('cb_access_token', access);
    localStorage.setItem('cb_refresh_token', refresh);
    localStorage.setItem('cb_user', JSON.stringify(userData));
    setUser(userData);
    return res.data;
  };

  const register = async (username, email, password, confirmPassword) => {
    const res = await api.post('/auth/register/', {
      username,
      email,
      password,
      confirm_password: confirmPassword,
    });
    // Return response data but do NOT auto-login (redirect to /login page)
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout/');
    } catch (e) {
      // Ignore network errors on logout
    }
    localStorage.removeItem('cb_access_token');
    localStorage.removeItem('cb_refresh_token');
    localStorage.removeItem('cb_user');
    setUser(null);
  };

  const refreshUser = async () => {
    if (!localStorage.getItem('cb_access_token')) return;
    try {
      const res = await api.get('/auth/me/');
      setUser(res.data);
      localStorage.setItem('cb_user', JSON.stringify(res.data));
      return res.data;
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const updateProfile = async (profileData) => {
    const res = await api.patch('/auth/me/', profileData);
    setUser(res.data);
    localStorage.setItem('cb_user', JSON.stringify(res.data));
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
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
