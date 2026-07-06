'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { STORAGE_KEYS, storage } from '@/lib/storage';
import styles from './page.module.css';

export default function BusinessPage() {
  const { t } = useTranslation('onboarding');
  const { appLanguage } = useAppStore();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  function validate(v: string) {
    if (!v.trim()) return t('onboarding:business.validation.required');
    if (v.trim().length < 2) return t('onboarding:business.validation.tooShort');
    if (v.trim().length > 50) return t('onboarding:business.validation.tooLong');
    return '';
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate(name);
    if (err) { setError(err); return; }
    storage.set(STORAGE_KEYS.BUSINESS_NAME_DONE, true);
    storage.set('briefai:businessName', name.trim());
    router.push('/dashboard');
  }

  return (
    <div className={styles.page}>
      <div className={styles.logo}>
        <Image src="/logo.png" alt="BriefAI Logo" width={64} height={64} />
      </div>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <h1 className={styles.heading}>{t('onboarding:business.heading')}</h1>
        <p className={styles.helper}>{t('onboarding:business.helper')}</p>
        <Input
          id="business-name"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          placeholder={t('onboarding:business.placeholder')}
          errorText={error}
          autoFocus
          autoComplete="organization"
          inputMode="text"
        />
        <Button type="submit" size="lg" fullWidth>
          {t('onboarding:business.continue')}
        </Button>
      </form>
    </div>
  );
}
