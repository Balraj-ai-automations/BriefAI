'use client';
import { useSyncExternalStore } from 'react';
import { WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './OfflineNotice.module.css';

function subscribe(callback: () => void) {
  window.addEventListener('offline', callback);
  window.addEventListener('online', callback);
  return () => {
    window.removeEventListener('offline', callback);
    window.removeEventListener('online', callback);
  };
}

function getSnapshot() {
  return !navigator.onLine;
}

function getServerSnapshot() {
  return false;
}

export function OfflineNotice() {
  const { t } = useTranslation('common');
  const isOffline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isOffline) return null;

  return (
    <div className={styles.banner} role="status">
      <WifiOff size={16} aria-hidden="true" />
      <span>{t('common:status.offline')}</span>
    </div>
  );
}
