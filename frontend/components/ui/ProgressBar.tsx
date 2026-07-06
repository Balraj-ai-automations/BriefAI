import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((current / total) * 100));
  return (
    <div className={styles.wrapper}>
      {label && (
        <div className={styles.labelRow}>
          <span className={styles.label}>{label}</span>
        </div>
      )}
      <div className={styles.track} role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total}>
        <div className={styles.bar} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
