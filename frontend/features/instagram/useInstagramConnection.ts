'use client';
import { useSyncExternalStore } from 'react';
import { STORAGE_KEYS, storage } from '@/lib/storage';

export interface InstagramConnectionState {
  connected: boolean;
  handle?: string;
}

const DEFAULT_STATE: InstagramConnectionState = { connected: false };

// storage.get() already no-ops to the fallback when window is undefined
// (SSR), so this is safe to evaluate at module scope on both sides.
let currentState: InstagramConnectionState =
  storage.get(STORAGE_KEYS.INSTAGRAM_CONNECTION, DEFAULT_STATE) ?? DEFAULT_STATE;

const listeners = new Set<() => void>();

function setStoredState(next: InstagramConnectionState) {
  currentState = next;
  storage.set(STORAGE_KEYS.INSTAGRAM_CONNECTION, next);
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  return currentState;
}

function getServerSnapshot() {
  return DEFAULT_STATE;
}

/**
 * Tracks Instagram connection state client-side, since the backend has no
 * GET status endpoint yet. Set from the OAuth callback redirect params
 * (see /dashboard and /settings), not polled from a server.
 *
 * Backed by a small module-level store (not per-component state) so every
 * consumer re-renders when any of them calls markConnected/markDisconnected.
 * getServerSnapshot always returns DEFAULT_STATE so the first client render
 * matches the server-rendered HTML — React reconciles against the real
 * value (getSnapshot) right after hydration, without a mismatch error.
 */
export function useInstagramConnection() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function markConnected(handle?: string) {
    setStoredState({ connected: true, handle });
  }

  function markDisconnected() {
    storage.remove(STORAGE_KEYS.INSTAGRAM_CONNECTION);
    setStoredState(DEFAULT_STATE);
  }

  return { ...state, markConnected, markDisconnected };
}
