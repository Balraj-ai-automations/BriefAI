'use client';
import { ProgressBar } from '@/components/ui/ProgressBar';
import styles from './QuestionProgress.module.css';

interface QuestionProgressProps {
  current: number;
  total: number;
  label: string;
  onBack: () => void;
  backLabel?: string;
}

export function QuestionProgress({ current, total, label, onBack, backLabel = 'Go back' }: QuestionProgressProps) {
  return (
    <div className={styles.topBar}>
      <button className={styles.backBtn} onClick={onBack} aria-label={backLabel}>←</button>
      <div className={styles.progressWrap}>
        <ProgressBar current={current} total={total} label={label} />
      </div>
    </div>
  );
}
