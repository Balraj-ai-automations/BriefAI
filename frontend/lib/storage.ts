// Storage keys — single source of truth
export const STORAGE_KEYS = {
  LANGUAGE: 'briefai:v1:language',
  DEMO_COMPLETED: 'briefai:v1:demo-completed',
  CAMPAIGN_DRAFT: 'briefai:v1:campaign-draft',
  BUSINESS_NAME_DONE: 'briefai:v1:business-onboarding-done',
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

