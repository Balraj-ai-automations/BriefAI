'use client';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { storage } from '@/lib/storage';
import { useCampaignStore } from '@/stores/campaign-store';
import { Modal } from '@/components/ui/Modal';
import { useState } from 'react';
import styles from './page.module.css';

export default function DashboardPage() {
  const { t } = useTranslation(['campaign', 'common']);
  const router = useRouter();
  const { hasDraft, resetDraft } = useCampaignStore();
  const [showDraftModal, setShowDraftModal] = useState(false);
  const businessName = storage.get<string>('briefai:businessName') ?? '';

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

  const greeting = businessName
    ? `${t('common:actions.start')} — ${businessName}`
    : 'BriefAI';

  return (
    <div className={styles.page}>
      <AppHeader showLogo right={
        <button className={styles.settingsBtn} onClick={() => router.push('/settings')} aria-label="Settings">⚙</button>
      } />
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.greeting}>
            {businessName ? <>नमस्ते, <strong>{businessName}</strong> 👋</> : 'BriefAI'}
          </h1>
          <p className={styles.heroSub}>Create your marketing content in seconds</p>
          <Button size="lg" fullWidth onClick={handleNewCampaign} className={styles.newBtn}>
            <Plus size={20} /> New Campaign
          </Button>
        </div>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>{t('common:nav.history')}</h2>
            <button className={styles.viewAll} onClick={() => router.push('/history')}>{t('common:actions.viewAll')}</button>
          </div>
          <div className={styles.emptyHistory}>
            <p>Your campaigns will appear here</p>
            <Button variant="secondary" size="sm" onClick={handleNewCampaign}>Create First Campaign</Button>
          </div>
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
