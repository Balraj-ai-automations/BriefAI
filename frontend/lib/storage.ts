import type { StateStorage } from 'zustand/middleware';

// Storage keys — single source of truth
export const STORAGE_KEYS = {
  APP_STATE: 'briefai:v1:app-state', // app language + demo-completed flag
  CAMPAIGN_DRAFT: 'briefai:v1:campaign-draft',
  BUSINESS_NAME_DONE: 'briefai:v1:business-onboarding-done',
  INSTAGRAM_CONNECTION: 'briefai:v1:instagram-connection',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export function storageGet<T>(key: string, fallback?: T): T | undefined {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function storageSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn('[BriefAI] localStorage write failed for key:', key);
  }
}

export function storageRemove(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // silent
  }
}

export function storageClearAll(): void {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach((key) => {
    try { localStorage.removeItem(key); } catch { /* silent */ }
  });
  // Also clear business name
  try { localStorage.removeItem('briefai:businessName'); } catch { /* silent */ }
}

// Convenience alias used by components
export const clearAll = storageClearAll;

// Convenience object for simpler imports
export const storage = {
  get: storageGet,
  set: storageSet,
  remove: storageRemove,
  clearAll: storageClearAll,
};

// SSR-safe localStorage adapter for zustand's persist middleware.
// Returns null/no-ops on the server instead of throwing.
export const zustandStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(name);
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(name, value);
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(name);
  },
};

