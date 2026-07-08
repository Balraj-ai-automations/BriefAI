'use client';
import { useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';

// Spec Section 24: update the document language when app language changes.
export function LanguageSync() {
  const { appLanguage } = useAppStore();

  useEffect(() => {
    if (appLanguage) document.documentElement.lang = appLanguage;
  }, [appLanguage]);

  return null;
}
