import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS, zustandStorage } from '@/lib/storage';
import type { CampaignAnswers, SupportedLanguage } from '@/lib/api/types';

const DRAFT_VERSION = 1;

interface CampaignState {
  currentQuestion: number;
  answers: CampaignAnswers;
  whatsappLanguage: SupportedLanguage;
  instagramLanguage: SupportedLanguage;
  updatedAt: string;
  version: number;
  setAnswer: (key: keyof CampaignAnswers, value: string | boolean) => void;
  setCurrentQuestion: (index: number) => void;
  setWhatsappLanguage: (lang: SupportedLanguage) => void;
  setInstagramLanguage: (lang: SupportedLanguage) => void;
  resetDraft: () => void;
  hasDraft: () => boolean;
}

function initialDraftState() {
  return {
    currentQuestion: 0,
    answers: {} as CampaignAnswers,
    whatsappLanguage: 'en' as SupportedLanguage,
    instagramLanguage: 'en' as SupportedLanguage,
    updatedAt: new Date().toISOString(),
    version: DRAFT_VERSION,
  };
}

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set, get) => ({
      ...initialDraftState(),
      setAnswer: (key, value) =>
        set((state) => ({
          answers: { ...state.answers, [key]: value } as CampaignAnswers,
          updatedAt: new Date().toISOString(),
        })),
      setCurrentQuestion: (currentQuestion) =>
        set({ currentQuestion, updatedAt: new Date().toISOString() }),
      setWhatsappLanguage: (whatsappLanguage) =>
        set({ whatsappLanguage, updatedAt: new Date().toISOString() }),
      setInstagramLanguage: (instagramLanguage) =>
        set({ instagramLanguage, updatedAt: new Date().toISOString() }),
      resetDraft: () => set(initialDraftState()),
      hasDraft: () => {
        const { currentQuestion, answers } = get();
        if (currentQuestion > 0) return true;
        return Object.values(answers).some((v) =>
          typeof v === 'string' ? v.trim().length > 0 : Boolean(v)
        );
      },
    }),
    {
      name: STORAGE_KEYS.CAMPAIGN_DRAFT,
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
