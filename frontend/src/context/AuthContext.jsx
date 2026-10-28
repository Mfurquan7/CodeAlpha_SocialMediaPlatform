import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, getToken, setToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing token on initial application load
  useEffect(() => {
    async function initAuth() {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await authApi.me();
        setCurrentUser(data.user);
      } catch (err) {
        console.warn('Stored session invalid or expired:', err.message);
        setToken(null);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (identifier, password) => {
    const data = await authApi.login(identifier, password);
    setToken(data.token);
    setCurrentUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    setToken(data.token);
    setCurrentUser(data.user);
    return data;
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
  };

  const updateUser = (updatedFields) => {
    setCurrentUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isAuthenticated: !!currentUser,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
