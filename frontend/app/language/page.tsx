'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/Button';
import { ChoiceCard } from '@/components/ui/ChoiceCard';
import { SUPPORTED_LANGUAGES } from '@/features/campaign/questions.config';
import i18n from '@/lib/i18n/config';
import type { SupportedLanguage } from '@/lib/api/types';
import styles from './page.module.css';


export default function LanguagePage() {
  const { t } = useTranslation(['onboarding']);
  const { appLanguage, setAppLanguage } = useAppStore();
  const [selected, setSelected] = useState<SupportedLanguage>(appLanguage || 'en');
  const router = useRouter();

  function handleContinue() {
    setAppLanguage(selected);
    i18n.changeLanguage(selected);
    router.push('/demo');
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.logo}>
          <Image src="/logo.png" alt="BriefAI Logo" width={64} height={64} />
        </div>
        <h1 className={styles.heading}>{t('onboarding:language.heading')}</h1>
        <p className={styles.sub}>{t('onboarding:language.subheading')}</p>
        <div className={styles.grid} role="radiogroup" aria-label="Language selection">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <ChoiceCard
              key={lang.code}
              value={lang.code}
              label={lang.nativeName}
              selected={selected === lang.code}
              onSelect={(v) => setSelected(v as SupportedLanguage)}
            />
          ))}
        </div>
        <div className={styles.actions}>
          <Button fullWidth size="lg" onClick={handleContinue}>
            {t('onboarding:language.continue')}
          </Button>
        </div>
      </div>
    </div>
  );
}
