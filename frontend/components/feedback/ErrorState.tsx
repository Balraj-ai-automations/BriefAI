'use client';
import { Button } from '@/components/ui/Button';
import styles from './ErrorState.module.css';

interface ErrorStateProps {
  title: string;
  body?: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export function ErrorState({ title, body, primaryLabel, onPrimary, secondaryLabel, onSecondary }: ErrorStateProps) {
  return (
    <div className={styles.wrap} role="alert">
      <p className={styles.title}>{title}</p>
      {body && <p className={styles.body}>{body}</p>}
      {(primaryLabel || secondaryLabel) && (
        <div className={styles.actions}>
          {primaryLabel && onPrimary && <Button onClick={onPrimary}>{primaryLabel}</Button>}
          {secondaryLabel && onSecondary && (
            <Button variant="secondary" onClick={onSecondary}>{secondaryLabel}</Button>
          )}
        </div>
      )}
    </div>
  );
}
