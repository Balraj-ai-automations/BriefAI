import React from 'react';
import styles from './StatusBadge.module.css';

type Variant = 'success' | 'warning' | 'error' | 'muted';

interface StatusBadgeProps {
  label: string;
  variant?: Variant;
}

export function StatusBadge({ label, variant = 'muted' }: StatusBadgeProps) {
  return <span className={[styles.badge, styles[variant]].join(' ')}>{label}</span>;
}
