import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('stocksense_access_token');
      const storedUser = localStorage.getItem('stocksense_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verify with /me
          const res = await api.get('/auth/me');
          if (res.data?.success && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('stocksense_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification error, logging out:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const { user, accessToken, refreshToken } = res.data;
      localStorage.setItem('stocksense_access_token', accessToken);
      localStorage.setItem('stocksense_refresh_token', refreshToken);
      localStorage.setItem('stocksense_user', JSON.stringify(user));
      setUser(user);
      return user;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const signup = async (userData) => {
    const res = await api.post('/auth/signup', userData);
    if (res.data?.success) {
      const { user, accessToken, refreshToken } = res.data;
      localStorage.setItem('stocksense_access_token', accessToken);
      localStorage.setItem('stocksense_refresh_token', refreshToken);
      localStorage.setItem('stocksense_user', JSON.stringify(user));
      setUser(user);
      return user;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('stocksense_access_token');
      localStorage.removeItem('stocksense_refresh_token');
      localStorage.removeItem('stocksense_user');
      setUser(null);
    }
  };

  const isManager = user?.role === 'MANAGER';
  const isStaff = user?.role === 'STAFF';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isManager,
        isStaff,
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
