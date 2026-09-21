import type { User } from './types';

const TOKEN_KEY = 'vendora_token';
const USER_KEY = 'vendora_user';

function readUserFromStorage(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

// A small external store over localStorage, so React can read it via
// useSyncExternalStore (the correct primitive for external mutable state,
// rather than reading in an effect + setState).
let cachedUser: User | null = readUserFromStorage();
const listeners = new Set<() => void>();

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function subscribeToAuth(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getAuthSnapshot(): User | null {
  return cachedUser;
}

export function getAuthServerSnapshot(): User | null {
  return null;
}

export function setStoredSession(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  cachedUser = user;
  listeners.forEach((listener) => listener());
}

export function clearStoredSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  cachedUser = null;
  listeners.forEach((listener) => listener());
}
