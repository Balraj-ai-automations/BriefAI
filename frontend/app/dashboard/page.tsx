'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Plus } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { CampaignCard } from '@/components/history/CampaignCard';
import { storage } from '@/lib/storage';
import { useCampaignStore } from '@/stores/campaign-store';
import { useUserId } from '@/features/auth/useUserId';
import { useInstagramConnection } from '@/features/instagram/useInstagramConnection';
import { getCampaigns } from '@/lib/api/campaigns';
import { queryKeys } from '@/lib/api/query-keys';
import styles from './page.module.css';

// Backend redirects here after a successful Instagram OAuth connection:
// /dashboard?instagram_connected=true&handle=<handle>
function InstagramRedirectListener({ onConnected }: { onConnected: (handle?: string) => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('instagram_connected') === 'true') {
      onConnected(searchParams.get('handle') ?? undefined);
      router.replace('/dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}

export default function DashboardPage() {
  const { t } = useTranslation(['campaign', 'common']);
  const router = useRouter();
  const { hasDraft, resetDraft } = useCampaignStore();
  const [showDraftModal, setShowDraftModal] = useState(false);
  // Read after mount, not during render: localStorage is unavailable during
  // SSR, so reading it directly in the render body causes the server-
  // rendered HTML ("") to mismatch the client's real value on hydration.
  // businessName never changes while this page is mounted (set once during
  // onboarding), so a one-shot effect is correct here — no external store
  // subscription is needed.
  const [businessName, setBusinessName] = useState('');
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setBusinessName(storage.get<string>('briefai:businessName') ?? '');
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  const { userId } = useUserId();
  const { connected, handle, markConnected } = useInstagramConnection();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.campaigns.all(userId ?? ''),
    queryFn: () => getCampaigns(userId as string),
    enabled: !!userId,
  });
  const latest = data?.campaigns?.[0];

  function handleNewCampaign() {
    if (hasDraft()) {
      setShowDraftModal(true);
    } else {
      router.push('/campaign/new');
    }
  }

  function handleContinueDraft() {
    setShowDraftModal(false);
    router.push('/campaign/new');
  }

  function handleStartNew() {
    resetDraft();
    setShowDraftModal(false);
    router.push('/campaign/new');
  }

  return (
    <div className={styles.page}>
      <Suspense fallback={null}>
        <InstagramRedirectListener onConnected={markConnected} />
      </Suspense>
      <AppHeader showLogo right={
        <button className={styles.settingsBtn} onClick={() => router.push('/settings')} aria-label={t('common:nav.settings')}>⚙</button>
      } />
      <main className={styles.main}>
        {connected && handle && (
          <div className={styles.instagramBanner}>
            <CheckCircle2 size={16} />
            <span>{t('common:dashboard.instagramConnected', { handle })}</span>
          </div>
        )}

        <div className={styles.hero}>
          <h1 className={styles.greeting}>
            {businessName
              ? t('common:dashboard.greeting', { name: businessName })
              : t('common:dashboard.greetingNoName')}
          </h1>
          <p className={styles.heroSub}>{t('common:dashboard.heroSub')}</p>
          <Button size="lg" fullWidth onClick={handleNewCampaign} className={styles.newBtn}>
            <Plus size={20} /> {t('common:nav.newCampaign')}
          </Button>
        </div>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>{t('common:nav.history')}</h2>
            {latest && (
              <button className={styles.viewAll} onClick={() => router.push('/history')}>{t('common:actions.viewAll')}</button>
            )}
          </div>
          {isLoading ? (
            <Skeleton height={96} borderRadius="var(--radius-lg)" />
          ) : latest ? (
            <div className={styles.latestWrap}>
              <CampaignCard campaign={latest} onOpen={(id) => router.push(`/campaign/${id}`)} />
            </div>
          ) : (
            <div className={styles.emptyHistory}>
              <p>{t('common:dashboard.historyEmpty')}</p>
              <Button variant="secondary" size="sm" onClick={handleNewCampaign}>{t('common:dashboard.createFirst')}</Button>
            </div>
          )}
        </section>
      </main>
      <BottomNavigation />

      <Modal isOpen={showDraftModal} onClose={() => setShowDraftModal(false)} title={t('campaign:new.hasDraftTitle')}>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' }}>
          {t('campaign:new.hasDraftBody')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <Button fullWidth onClick={handleContinueDraft}>{t('campaign:new.continueDraftAction')}</Button>
          <Button fullWidth variant="secondary" onClick={handleStartNew}>{t('campaign:new.startFreshAction')}</Button>
        </div>
      </Modal>
    </div>
  );
}
