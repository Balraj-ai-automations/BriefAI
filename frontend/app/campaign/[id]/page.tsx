'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { CampaignImage } from '@/components/output/CampaignImage';
import { InstagramOutputCard } from '@/components/output/InstagramOutputCard';
import { WhatsAppOutputCard } from '@/components/output/WhatsAppOutputCard';
import { useUserId } from '@/features/auth/useUserId';
import { useInstagramConnection } from '@/features/instagram/useInstagramConnection';
import { getCampaigns } from '@/lib/api/campaigns';
import { postToInstagram } from '@/lib/api/instagram';
import { queryKeys } from '@/lib/api/query-keys';
import { isApiError } from '@/lib/api/errors';
import type { GenerateCampaignResponse } from '@/lib/api/types';
import styles from './page.module.css';

interface ResultView {
  campaignId: string | null;
  whatsappCopy: string;
  instagramCaption: string;
  imageUrl: string | null;
  postedToInstagram: boolean;
}

export default function CampaignResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useTranslation(['campaign', 'common']);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { userId, isLoading: userLoading } = useUserId();
  const { connected: instagramConnected, markDisconnected } = useInstagramConnection();

  const [showPostConfirm, setShowPostConfirm] = useState(false);
  const [justPosted, setJustPosted] = useState(false);

  // A freshly generated (possibly unsaved) result lives in the query cache
  // under its campaign_id, or under 'latest' when campaign_id is null.
  const cached = queryClient.getQueryData<GenerateCampaignResponse>(queryKeys.campaigns.single(id));

  // Reopened historical campaigns come from the campaigns list — there's no
  // single-campaign GET endpoint on the backend yet (spec Section 75).
  const { data: historyData, isLoading: historyLoading, isError: historyError, refetch } = useQuery({
    queryKey: queryKeys.campaigns.all(userId ?? ''),
    queryFn: () => getCampaigns(userId as string),
    enabled: !!userId && !cached,
  });
  const historical = historyData?.campaigns.find((c) => c.id === id);

  const result: ResultView | null = cached
    ? {
        campaignId: cached.campaign_id,
        whatsappCopy: cached.whatsapp_copy,
        instagramCaption: cached.instagram_caption,
        imageUrl: cached.image_url,
        postedToInstagram: false,
      }
    : historical
    ? {
        campaignId: historical.id,
        whatsappCopy: historical.whatsapp_copy,
        instagramCaption: historical.instagram_caption,
        imageUrl: historical.image_url,
        postedToInstagram: historical.posted_to_instagram,
      }
    : null;

  const postMutation = useMutation({
    mutationFn: async () => {
      if (!result?.campaignId || !userId || !result.imageUrl) {
        throw new Error('Missing required data to post.');
      }
      return postToInstagram({
        campaign_id: result.campaignId,
        user_id: userId,
        image_url: result.imageUrl,
        caption: result.instagramCaption,
      });
    },
    onSuccess: (res) => {
      setShowPostConfirm(false);
      if (!res.success) return;
      setJustPosted(true);
      if (userId) queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all(userId) });
    },
    onError: (err) => {
      // 404 = no instagram_connections row for this user — our locally
      // tracked "connected" flag is stale, so correct it.
      if (isApiError(err) && err.statusCode === 404) markDisconnected();
    },
  });

  if (userLoading || (historyLoading && !cached)) {
    return (
      <div className={styles.page}>
        <AppHeader showBack title={t('campaign:result.heading')} />
        <LoadingState variant="spinner" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className={styles.page}>
        <AppHeader showBack title={t('campaign:result.heading')} />
        {historyError ? (
          <ErrorState
            title={t('history:loadError')}
            body={t('history:loadErrorSub')}
            primaryLabel={t('common:actions.tryAgain')}
            onPrimary={() => refetch()}
          />
        ) : (
          <ErrorState
            title={t('campaign:error.notFound')}
            primaryLabel={t('common:nav.history')}
            onPrimary={() => router.push('/history')}
          />
        )}
      </div>
    );
  }

  const isPosted = result.postedToInstagram || justPosted;

  return (
    <div className={styles.page}>
      <AppHeader showBack title={t('campaign:result.heading')} />

      {!result.campaignId && (
        <div className={styles.notSavedBanner}>{t('campaign:result.notSaved')}</div>
      )}

      <div className={styles.body}>
        <div className={styles.imageColumn}>
          <div className={styles.successHeader}>
            <h1 className={styles.successHeading}>
              <CheckCircle2 size={18} style={{ verticalAlign: '-3px', marginRight: 6 }} />
              {t('campaign:result.heading')}
            </h1>
            <p className={styles.successSub}>{t('campaign:result.subheading')}</p>
          </div>
          <CampaignImage imageUrl={result.imageUrl} />
        </div>

        <div className={styles.contentColumn}>
          <InstagramOutputCard
            caption={result.instagramCaption}
            isConnected={instagramConnected && !!result.campaignId}
            isPosted={isPosted}
            isPosting={postMutation.isPending}
            postError={postMutation.isError ? t('campaign:result.instagram.postFailed') : null}
            onPost={() => setShowPostConfirm(true)}
            onConnect={() => router.push('/connect-instagram')}
          />

          <WhatsAppOutputCard message={result.whatsappCopy} />

          <div className={styles.actions}>
            <Button fullWidth onClick={() => router.push('/campaign/new')}>
              {t('campaign:result.actions.createAnother')}
            </Button>
            <Button fullWidth variant="secondary" onClick={() => router.push('/history')}>
              {t('campaign:result.actions.viewHistory')}
            </Button>
          </div>
        </div>
      </div>

      <Modal isOpen={showPostConfirm} onClose={() => setShowPostConfirm(false)} title={t('campaign:result.instagram.postConfirmTitle')}>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' }}>
          {t('campaign:result.instagram.postConfirmBody')}
        </p>
        {postMutation.isError && (
          <p style={{ color: 'var(--color-error)', fontSize: 13, marginBottom: 'var(--space-3)' }}>
            {t('campaign:result.instagram.postFailedSub')}
          </p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <Button fullWidth loading={postMutation.isPending} onClick={() => postMutation.mutate()}>
            {t('campaign:result.instagram.postNow')}
          </Button>
          <Button fullWidth variant="ghost" onClick={() => setShowPostConfirm(false)}>{t('common:actions.cancel')}</Button>
        </div>
      </Modal>
    </div>
  );
}
