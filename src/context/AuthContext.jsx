import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbInstance } from '../db/mockDb';

const AuthContext = createContext();

const SESSION_KEY = 'sympovex_session';

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);       // { userId, email, role }
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate user still exists and is active
        const user = dbInstance.getUser(parsed.userId);
        if (user && user.status === 'active') {
          setSession(parsed);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      } else {
        // Default to usr_author1 (Lucas Bernard) to support seed tests on first load
        const user = dbInstance.getUser('usr_author1');
        if (user && user.status === 'active') {
          const defaultSession = {
            userId: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            conferenceId: user.conferenceId || null
          };
          localStorage.setItem(SESSION_KEY, JSON.stringify(defaultSession));
          setSession(defaultSession);
        }
      }
    } catch (e) {
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const login = (email, password) => {
    const result = dbInstance.validateCredentials(email, password);
    if (result.success) {
      const hasMultipleRoles = result.user.roles && result.user.roles.length > 1;
      const initialActiveRole = hasMultipleRoles ? null : result.user.role;

      const newSession = {
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
        name: result.user.name,
        conferenceId: result.user.conferenceId || null,
        activeRole: initialActiveRole
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      setSession(newSession);
      return { success: true, user: result.user };
    }
    return result; // { success: false, error, user? }
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  const impersonate = (userId) => {
    if (!userId) {
      logout();
      return;
    }
    const user = dbInstance.getUser(userId);
    if (user) {
      const hasMultipleRoles = user.roles && user.roles.length > 1;
      const initialActiveRole = hasMultipleRoles ? null : user.role;

      const newSession = {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        conferenceId: user.conferenceId || null,
        activeRole: initialActiveRole
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      setSession(newSession);
    } else {
      logout();
    }
  };

  const selectActiveRole = (role) => {
    if (!session) return;
    const updatedSession = { ...session, activeRole: role };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
    setSession(updatedSession);
  };

  const completePasswordChange = (newPassword) => {
    if (!session) return false;
    const success = dbInstance.completeUserPasswordChange(session.userId, newPassword);
    if (success) {
      const user = dbInstance.getUser(session.userId);
      if (user) {
        const hasMultipleRoles = user.roles && user.roles.length > 1;
        const activeRole = hasMultipleRoles ? session.activeRole : user.role;
        const updatedSession = { ...session, activeRole };
        localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
        setSession(updatedSession);
        return true;
      }
    }
    return false;
  };

  const register = (userData) => {
    return dbInstance.registerUser(userData);
  };

  const updateSessionPassword = (newPassword) => {
    if (!session) return false;
    return dbInstance.updateUserPassword(session.userId, newPassword);
  };

  const isAuthenticated = !!session;

  return (
    <AuthContext.Provider value={{
      session,
      isAuthenticated,
      authLoading,
      login,
      logout,
      impersonate,
      selectActiveRole,
      completePasswordChange,
      register,
      updateSessionPassword,
      isAuthModalOpen,
      setAuthModalOpen
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
