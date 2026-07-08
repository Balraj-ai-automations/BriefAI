'use client';
import { Skeleton } from '@/components/ui/Skeleton';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import styles from './LoadingState.module.css';

interface LoadingStateProps {
  variant?: 'skeletonList' | 'spinner';
  count?: number;
  skeletonHeight?: number;
  label?: string;
}

export function LoadingState({ variant = 'spinner', count = 3, skeletonHeight = 96, label }: LoadingStateProps) {
  if (variant === 'skeletonList') {
    return (
      <div className={styles.skeletons}>
        {Array.from({ length: count }, (_, i) => (
          <Skeleton key={i} height={skeletonHeight} borderRadius="var(--radius-lg)" />
        ))}
      </div>
    );
  }
  return (
    <div className={styles.spinnerWrap}>
      <LoadingIndicator label={label} />
    </div>
  );
}
