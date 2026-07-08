'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Clock } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { LoadingState } from '@/components/feedback/LoadingState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { CampaignGrid } from '@/components/history/CampaignGrid';
import { HistorySearch } from '@/components/history/HistorySearch';
import { useUserId } from '@/features/auth/useUserId';
import { getCampaigns } from '@/lib/api/campaigns';
import { queryKeys } from '@/lib/api/query-keys';
import styles from './page.module.css';

export default function HistoryPage() {
  const { t } = useTranslation(['history', 'common']);
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { userId, isLoading: userLoading } = useUserId();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.campaigns.all(userId ?? ''),
    queryFn: () => getCampaigns(userId as string),
    enabled: !!userId,
  });

  const campaigns = data?.campaigns ?? [];
  const query = search.trim().toLowerCase();
  const filtered = query
    ? campaigns.filter((c) => c.product.toLowerCase().includes(query))
    : campaigns;

  const loading = userLoading || isLoading;

  return (
    <div className={styles.page}>
      <AppHeader title={t('history:title')} />
      <main className={styles.main}>
        {loading ? (
          <LoadingState variant="skeletonList" count={3} skeletonHeight={96} />
        ) : isError ? (
          <ErrorState
            title={t('history:loadError')}
            body={t('history:loadErrorSub')}
            primaryLabel={t('common:actions.tryAgain')}
            onPrimary={() => refetch()}
          />
        ) : campaigns.length === 0 ? (
          <EmptyState
            icon={<Clock size={48} strokeWidth={1.5} />}
            title={t('history:empty.title')}
            body={t('history:empty.body')}
            actionLabel={t('history:empty.action')}
            onAction={() => router.push('/campaign/new')}
          />
        ) : (
          <>
            {campaigns.length >= 6 && (
              <HistorySearch value={search} onChange={setSearch} placeholder={t('history:searchPlaceholder')} />
            )}
            {filtered.length === 0 ? (
              <EmptyState
                title={t('history:noResults')}
                body={t('history:noResultsSub')}
                actionLabel={t('history:clearSearch')}
                onAction={() => setSearch('')}
              />
            ) : (
              <CampaignGrid campaigns={filtered} onOpen={(id) => router.push(`/campaign/${id}`)} />
            )}
          </>
        )}
      </main>
      <BottomNavigation />
    </div>
  );
}
