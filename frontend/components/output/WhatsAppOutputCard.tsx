'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { copyToClipboard } from '@/lib/utils';
import styles from './OutputCard.module.css';

interface WhatsAppOutputCardProps {
  message: string;
}

export function WhatsAppOutputCard({ message }: WhatsAppOutputCardProps) {
  const { t } = useTranslation('campaign');
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  async function handleCopy() {
    const ok = await copyToClipboard(message);
    if (ok) {
      setCopied(true);
      setCopyFailed(false);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopyFailed(true);
    }
  }

  if (!message) return null;

  return (
    <section className={styles.section}>
      <p className={styles.sectionLabel}><MessageCircle size={14} /> {t('campaign:result.whatsapp.label')}</p>
      <div className={styles.card}>
        <p className={styles.text}>{message}</p>
        <div className={styles.actionsRow}>
          <Button variant="secondary" size="sm" onClick={handleCopy}>
            {copied ? <><Check size={14} /> {t('common:actions.copied')}</> : <><Copy size={14} /> {t('campaign:result.whatsapp.copy')}</>}
          </Button>
        </div>
        {copyFailed && <p className={styles.errorNote}>{t('campaign:result.copyFailed')}</p>}
      </div>
    </section>
  );
}
