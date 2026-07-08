'use client';
import { ChoiceCard } from '@/components/ui/ChoiceCard';
import { SUPPORTED_LANGUAGES } from '@/features/campaign/questions.config';
import type { SupportedLanguage } from '@/lib/api/types';
import styles from './LanguageSelector.module.css';

interface LanguageSelectorProps {
  label: string;
  value: SupportedLanguage;
  onChange: (value: SupportedLanguage) => void;
}

export function LanguageSelector({ label, value, onChange }: LanguageSelectorProps) {
  return (
    <div className={styles.langSection}>
      <p className={styles.langLabel}>{label}</p>
      <div className={styles.choiceGrid}>
        {SUPPORTED_LANGUAGES.map((l) => (
          <ChoiceCard
            key={l.code}
            value={l.code}
            label={l.nativeName}
            selected={value === l.code}
            onSelect={(v) => onChange(v as SupportedLanguage)}
          />
        ))}
      </div>
    </div>
  );
}
