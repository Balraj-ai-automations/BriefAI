'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCampaignStore } from '@/stores/campaign-store';
import { useAppStore } from '@/stores/app-store';
import { getCurrentUserId, ensureAnonymousSession } from '@/features/auth/anonymousAuth';
import { generateCampaign } from '@/lib/api/campaigns';
import { queryKeys } from '@/lib/api/query-keys';
import { mapDraftToGenerateRequest } from '@/lib/utils';
import { ErrorState } from '@/components/feedback/ErrorState';
import type { CampaignDraft, GenerateCampaignResponse } from '@/lib/api/types';
import styles from './page.module.css';

const STAGES = [
  'campaign:generating.stages.understanding',
  'campaign:generating.stages.planning',
  'campaign:generating.stages.creating',
  'campaign:generating.stages.preparing',
];

export default function GeneratingPage() {
  const { t } = useTranslation(['campaign', 'common']);
  const router = useRouter();
  const queryClient = useQueryClient();
  const campaignState = useCampaignStore();
  const { appLanguage } = useAppStore();
  const [stageIndex, setStageIndex] = useState(0);
  const [showLongWait, setShowLongWait] = useState(false);

  const mutation = useMutation({
    mutationFn: async (): Promise<{ result: GenerateCampaignResponse; userId: string }> => {
      // Session should already exist from the /demo or / bootstrap step,
      // but ensure it as a safety net rather than failing outright.
      let userId = await getCurrentUserId();
      if (!userId) userId = await ensureAnonymousSession();

      const draft: CampaignDraft = {
        currentQuestion: campaignState.currentQuestion,
        answers: campaignState.answers,
        whatsappLanguage: campaignState.whatsappLanguage,
        instagramLanguage: campaignState.instagramLanguage,
        appLanguage: appLanguage ?? 'en',
        updatedAt: campaignState.updatedAt,
        version: campaignState.version,
      };
      const request = mapDraftToGenerateRequest(draft, userId);
      const result = await generateCampaign(request);
      return { result, userId };
    },
    onSuccess: ({ result, userId }) => {
      const cacheId = result.campaign_id ?? 'latest';
      queryClient.setQueryData(queryKeys.campaigns.single(cacheId), result);

      if (result.campaign_id) {
        // Durably saved — safe to clear the draft and refresh history.
        useCampaignStore.getState().resetDraft();
        queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all(userId) });
      }
      // If campaign_id is null, the draft is deliberately preserved —
      // generation succeeded but wasn't durably saved (spec Section 51).
      router.replace(`/campaign/${cacheId}`);
    },
  });

  // No "already started" ref guard here — a useRef-based run-once guard
  // does not survive React Strict Mode's dev-only mount/unmount/remount
  // cycle correctly and silently drops the mutation's error state update.
  // mutation.mutate() is safe to call from this effect as-is: it only runs
  // once per real mount in production, and TanStack Query's own mutation
  // state is the source of truth for whether a request is in flight.
  useEffect(() => {
    // No draft to generate from (e.g. direct navigation/refresh) — bail out.
    if (!campaignState.answers.product) {
      router.replace('/campaign/new');
      return;
    }

    const stageTimer = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, STAGES.length - 1));
    }, 2500);
    const longWaitTimer = setTimeout(() => setShowLongWait(true), 15000);

    mutation.mutate(undefined, {
      onSettled: () => {
        clearInterval(stageTimer);
        clearTimeout(longWaitTimer);
      },
    });

    return () => { clearInterval(stageTimer); clearTimeout(longWaitTimer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (mutation.isError) {
    return (
      <div className={styles.page}>
        <ErrorState
          title={t('campaign:error.generationFailed')}
          body={t('campaign:error.answersAreSafe')}
          primaryLabel={t('campaign:error.tryAgain')}
          onPrimary={() => mutation.mutate()}
          secondaryLabel={t('campaign:error.reviewAnswers')}
          onSecondary={() => router.push('/campaign/new')}
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.center}>
        <div className={styles.spinner} aria-label={t('common:status.loading')} />
        <p className={styles.stage} key={stageIndex}>{t(STAGES[stageIndex])}</p>
        <p className={styles.hint}>{t('campaign:generating.takesAMinute')}</p>
        {showLongWait && <p className={styles.longWait}>{t('campaign:generating.stillWorking')}</p>}
      </div>
    </div>
  );
}
