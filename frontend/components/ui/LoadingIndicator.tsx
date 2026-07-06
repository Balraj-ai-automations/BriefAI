'use client';
import React from 'react';
import styles from './LoadingIndicator.module.css';

interface LoadingIndicatorProps {
  label?: string;
  size?: 'sm' | 'md';
}

export function LoadingIndicator({ label, size = 'md' }: LoadingIndicatorProps) {
  const prefersReduced = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  return (
    <div className={styles.root} aria-busy="true" aria-label={label ?? 'Loading'}>
      {prefersReduced ? (
        <div className={styles.dots} aria-hidden="true">
          <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
        </div>
      ) : (
        <div className={styles.spinner} aria-hidden="true" style={size === 'sm' ? { width: 24, height: 24 } : {}} />
      )}
      {label && <p className={styles.label}>{label}</p>}
    </div>
  );
}
