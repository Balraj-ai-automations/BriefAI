'use client';
import { Search, X } from 'lucide-react';
import styles from './HistorySearch.module.css';

interface HistorySearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export function HistorySearch({ value, onChange, placeholder }: HistorySearchProps) {
  return (
    <div className={styles.searchWrap}>
      <Search size={16} className={styles.searchIcon} />
      <input
        className={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button className={styles.clearBtn} onClick={() => onChange('')} aria-label="Clear search">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
