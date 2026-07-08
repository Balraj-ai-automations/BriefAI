'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/app-store';
import { STORAGE_KEYS, storage } from '@/lib/storage';
import { ensureAnonymousSession } from '@/features/auth/anonymousAuth';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { Button } from '@/components/ui/Button';

export default function StartupPage() {
  const { t } = useTranslation('onboarding');
  const router = useRouter();
  const { appLanguage, demoCompleted } = useAppStore();
  const [error, setError] = useState(false);

  async function boot() {
    setError(false);
    try {
      if (!appLanguage) {
        router.replace('/language');
        return;
      }
      if (!demoCompleted) {
        router.replace('/demo');
        return;
      }
      // Restore an existing session, or silently create a new anonymous
      // one for a returning user whose session expired/was cleared.
      await ensureAnonymousSession();

      const businessDone = storage.get(STORAGE_KEYS.BUSINESS_NAME_DONE);
      if (!businessDone) {
        router.replace('/onboarding/business');
        return;
      }
      router.replace('/dashboard');
    } catch {
      setError(true);
    }
  }

  // boot() does async session/routing work that can't run during render.
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => { boot(); }, []);

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: 24, gap: 16 }}>
        <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>{t('onboarding:error.authFailed')}</p>
        <Button onClick={boot}>{t('onboarding:error.tryAgain')}</Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
      <LoadingIndicator label={t('onboarding:loading.gettingStarted')} />
    </div>
  );
}
