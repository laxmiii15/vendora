'use client';

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {
  clearStoredSession,
  getAuthServerSnapshot,
  getAuthSnapshot,
  setStoredSession,
  subscribeToAuth,
} from './auth-storage';
import type { User } from './types';

interface AuthContextValue {
  user: User | null;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useSyncExternalStore(
    subscribeToAuth,
    getAuthSnapshot,
    getAuthServerSnapshot,
  );

  const login = useCallback((accessToken: string, nextUser: User) => {
    setStoredSession(accessToken, nextUser);
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
