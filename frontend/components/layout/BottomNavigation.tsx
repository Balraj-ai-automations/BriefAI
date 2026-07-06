'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, Plus, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './BottomNavigation.module.css';

export function BottomNavigation() {
  const pathname = usePathname();
  const { t } = useTranslation('common');

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <Link href="/dashboard" className={[styles.item, pathname === '/dashboard' ? styles.active : ''].join(' ')}>
        <House size={22} aria-hidden="true" />
        <span>{t('nav.home')}</span>
      </Link>
      <Link href="/campaign/new" className={styles.newItem} aria-label={t('nav.newCampaign')}>
        <span className={styles.newIconWrap}><Plus size={22} aria-hidden="true" /></span>
        <span className={styles.newLabel}>{t('nav.newCampaign')}</span>
      </Link>
      <Link href="/history" className={[styles.item, pathname === '/history' ? styles.active : ''].join(' ')}>
        <Clock size={22} aria-hidden="true" />
        <span>{t('nav.history')}</span>
      </Link>
    </nav>
  );
}
