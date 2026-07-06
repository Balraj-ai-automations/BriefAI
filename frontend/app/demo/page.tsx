'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Megaphone, Sparkles, Share2 } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/Button';
import { STORAGE_KEYS, storage } from '@/lib/storage';
import styles from './page.module.css';

const STEPS = [
  { icon: Megaphone, titleKey: 'onboarding:demo.step1.title', bodyKey: 'onboarding:demo.step1.body' },
  { icon: Sparkles, titleKey: 'onboarding:demo.step2.title', bodyKey: 'onboarding:demo.step2.body' },
  { icon: Share2, titleKey: 'onboarding:demo.step3.title', bodyKey: 'onboarding:demo.step3.body' },
];

export default function DemoPage() {
  const { t } = useTranslation(['onboarding', 'common']);
  const { setDemoCompleted } = useAppStore();
  const [step, setStep] = useState(0);
  const router = useRouter();

  function finish() {
    setDemoCompleted(true);
    const businessDone = storage.get(STORAGE_KEYS.BUSINESS_NAME_DONE);
    router.push(businessDone ? '/dashboard' : '/onboarding/business');
  }

  function handleNext() {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  }

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className={styles.page}>
      <button className={styles.skipBtn} onClick={finish}>{t('onboarding:demo.skip')}</button>
      <div className={styles.content}>
        <div className={styles.iconWrap}>
          <Icon size={52} strokeWidth={1.5} />
        </div>
        <h1 className={styles.title}>{t(current.titleKey)}</h1>
        <p className={styles.body}>{t(current.bodyKey)}</p>
      </div>
      <div className={styles.footer}>
        <div className={styles.dots} aria-label={`Step ${step + 1} of ${STEPS.length}`}>
          {STEPS.map((_, i) => (
            <span key={i} className={[styles.dot, i === step ? styles.activeDot : ''].join(' ')} />
          ))}
        </div>
        <Button size="lg" fullWidth onClick={handleNext}>
          {isLast ? t('onboarding:demo.start') : t('onboarding:demo.next')}
        </Button>
      </div>
    </div>
  );
}
