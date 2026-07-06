'use client';
import React from 'react';
import styles from './ChoiceCard.module.css';

interface ChoiceCardProps {
  label: string;
  value: string;
  selected: boolean;
  onSelect: (value: string) => void;
  icon?: React.ReactNode;
}

export function ChoiceCard({ label, value, selected, onSelect, icon }: ChoiceCardProps) {
  return (
    <button
      type="button"
      className={[styles.card, selected ? styles.selected : ''].filter(Boolean).join(' ')}
      onClick={() => onSelect(value)}
      aria-pressed={selected}
      role="radio"
      aria-checked={selected}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      <span className={styles.label}>{label}</span>
      <span className={styles.check} aria-hidden="true">
        <span className={styles.checkDot} />
      </span>
    </button>
  );
}
