'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Search, X, Clock } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from './page.module.css';

export default function HistoryPage() {
  const { t } = useTranslation('history');
  const router = useRouter();
  const [search, setSearch] = useState('');

  // Campaigns would come from useQuery in a real implementation.
  // Showing empty state for now since we have no stored campaigns yet.
  const campaigns: unknown[] = [];
  const isLoading = false;
  const error = null;

  return (
    <div className={styles.page}>
      <AppHeader title={t('history:title')} />
      <main className={styles.main}>
        {isLoading ? (
          <div className={styles.skeletons}>
            {[1,2,3].map(i => <Skeleton key={i} height={96} borderRadius="var(--radius-lg)" />)}
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <p className={styles.errorTitle}>{t('history:loadError')}</p>
            <p className={styles.errorSub}>{t('history:loadErrorSub')}</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className={styles.emptyState}>
            <Clock size={48} strokeWidth={1.5} color="var(--color-border-strong)" />
            <h2 className={styles.emptyTitle}>{t('history:empty.title')}</h2>
            <p className={styles.emptySub}>{t('history:empty.body')}</p>
            <Button onClick={() => router.push('/campaign/new')}>{t('history:empty.action')}</Button>
          </div>
        ) : (
          <>
            {campaigns.length >= 6 && (
              <div className={styles.searchWrap}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  className={styles.searchInput}
                  placeholder={t('history:searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && <button className={styles.clearBtn} onClick={() => setSearch('')}><X size={14} /></button>}
              </div>
            )}
          </>
        )}
      </main>
      <BottomNavigation />
    </div>
  );
}
