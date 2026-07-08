'use client';
import styles from './CampaignReview.module.css';

interface ReviewRow {
  label: string;
  value?: string;
}

interface CampaignReviewProps {
  rows: ReviewRow[];
}

export function CampaignReview({ rows }: CampaignReviewProps) {
  return (
    <div className={styles.reviewCard}>
      {rows.map((row) => (
        <div key={row.label} className={styles.reviewRow}>
          <span className={styles.reviewLabel}>{row.label}</span>
          <span className={styles.reviewValue}>{row.value || '—'}</span>
        </div>
      ))}
    </div>
  );
}
