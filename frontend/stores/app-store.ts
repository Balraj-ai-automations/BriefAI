import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS, zustandStorage } from '@/lib/storage';
import type { SupportedLanguage } from '@/lib/api/types';

interface AppState {
  appLanguage: SupportedLanguage | null;
  demoCompleted: boolean;
  setAppLanguage: (lang: SupportedLanguage) => void;
  setDemoCompleted: (done: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      appLanguage: null,
      demoCompleted: false,
      setAppLanguage: (appLanguage) => set({ appLanguage }),
      setDemoCompleted: (demoCompleted) => set({ demoCompleted }),
    }),
    {
      name: STORAGE_KEYS.APP_STATE,
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
