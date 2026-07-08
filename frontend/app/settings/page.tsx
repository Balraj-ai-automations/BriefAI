'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ChoiceCard } from '@/components/ui/ChoiceCard';
import { useAppStore } from '@/stores/app-store';
import { SUPPORTED_LANGUAGES } from '@/features/campaign/questions.config';
import { clearAll } from '@/lib/storage';
import { useInstagramConnection } from '@/features/instagram/useInstagramConnection';
import i18n from '@/lib/i18n/config';
import type { SupportedLanguage } from '@/lib/api/types';
import styles from './page.module.css';

// Backend redirects here after a failed Instagram OAuth connection:
// /settings?instagram_error=<message>
function InstagramErrorListener({ onError }: { onError: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('instagram_error')) {
      onError();
      router.replace('/settings');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}

export default function SettingsPage() {
  const { t } = useTranslation(['settings', 'common']);
  const router = useRouter();
  const { appLanguage, setAppLanguage } = useAppStore();
  const { connected, handle, markDisconnected } = useInstagramConnection();
  const [showStartFresh, setShowStartFresh] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [instagramError, setInstagramError] = useState(false);

  function handleLanguageChange(code: SupportedLanguage) {
    setAppLanguage(code);
    i18n.changeLanguage(code);
  }

  function handleStartFresh() {
    clearAll();
    router.replace('/language');
  }

  return (
    <div className={styles.page}>
      <Suspense fallback={null}>
        <InstagramErrorListener onError={() => setInstagramError(true)} />
      </Suspense>
      <AppHeader showBack title={t('settings:title')} />
      <main className={styles.main}>

        {/* Language */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('settings:sections.language')}</h2>
          <div className={styles.langGrid}>
            {SUPPORTED_LANGUAGES.map(l => (
              <ChoiceCard key={l.code} value={l.code} label={l.nativeName}
                selected={appLanguage === l.code}
                onSelect={(v) => handleLanguageChange(v as SupportedLanguage)} />
            ))}
          </div>
        </section>

        {/* Account */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('settings:sections.account')}</h2>
          <div className={styles.infoCard}>
            <p className={styles.infoTitle}>{t('settings:account.anonymousTitle')}</p>
            <p className={styles.infoBody}>{t('settings:account.anonymousBody')}</p>
            <StatusBadge label={t('settings:account.comingSoon')} variant="muted" />
          </div>
        </section>

        {/* Instagram */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('settings:sections.instagram')}</h2>
          <div className={styles.infoCard}>
            {instagramError && (
              <p style={{ color: 'var(--color-error)', fontSize: 13, margin: 0 }}>
                {t('settings:instagram.connectFailed')}
              </p>
            )}
            {connected ? (
              <>
                <p className={styles.infoTitle}>{t('settings:instagram.connected', { username: handle ?? '' })}</p>
                <Button variant="ghost" size="sm" onClick={markDisconnected}>
                  {t('settings:instagram.disconnect')}
                </Button>
              </>
            ) : (
              <>
                <p className={styles.infoTitle}>{t('settings:instagram.notConnected')}</p>
                <Button variant="secondary" size="sm" onClick={() => router.push('/connect-instagram')}>
                  {t('settings:instagram.connect')}
                </Button>
              </>
            )}
          </div>
        </section>

        {/* Privacy */}
        <section className={styles.section}>
          <button className={styles.rowBtn} onClick={() => setPrivacyOpen(!privacyOpen)}>
            <span>{t('settings:privacy')}</span>
            <span>{privacyOpen ? '▲' : '▼'}</span>
          </button>
          {privacyOpen && <p className={styles.privacyBody}>{t('settings:privacyBody')}</p>}
        </section>

        {/* About */}
        <section className={styles.section}>
          <p className={styles.version}>{t('settings:version', { version: '1.0.0' })}</p>
        </section>

        {/* Start Fresh */}
        <section className={styles.section}>
          <Button variant="destructive" fullWidth onClick={() => setShowStartFresh(true)}>
            {t('settings:startFresh')}
          </Button>
        </section>
      </main>

      <Modal isOpen={showStartFresh} onClose={() => setShowStartFresh(false)} title={t('settings:startFreshConfirmTitle')}>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' }}>
          {t('settings:startFreshConfirmBody')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <Button variant="destructive" fullWidth onClick={handleStartFresh}>{t('settings:startFreshConfirm')}</Button>
          <Button variant="ghost" fullWidth onClick={() => setShowStartFresh(false)}>{t('common:actions.cancel')}</Button>
        </div>
      </Modal>
    </div>
  );
}
