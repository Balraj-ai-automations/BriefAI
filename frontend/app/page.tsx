'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/stores/app-store';
import { STORAGE_KEYS, storage } from '@/lib/storage';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { Button } from '@/components/ui/Button';

export default function StartupPage() {
  const router = useRouter();
  const { appLanguage, demoCompleted } = useAppStore();
  const [error, setError] = useState<string | null>(null);

  function boot() {
    setError(null);
    try {
      // No Supabase, no network — pure localStorage routing
      if (!appLanguage) {
        router.replace('/language');
        return;
      }
      if (!demoCompleted) {
        router.replace('/demo');
        return;
      }
      const businessDone = storage.get(STORAGE_KEYS.BUSINESS_NAME_DONE);
      if (!businessDone) {
        router.replace('/onboarding/business');
        return;
      }
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  useEffect(() => { boot(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: 24, gap: 16 }}>
        <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>Something went wrong.</p>
        <Button onClick={boot}>Try Again</Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
      <LoadingIndicator label="Loading BriefAI…" />
    </div>
  );
}
