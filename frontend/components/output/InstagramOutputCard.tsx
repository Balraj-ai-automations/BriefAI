'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AtSign, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { copyToClipboard } from '@/lib/utils';
import styles from './OutputCard.module.css';

interface InstagramOutputCardProps {
  caption: string;
  /** Whether a real Instagram connection exists for this user. */
  isConnected: boolean;
  /** Whether this specific campaign has already been posted. */
  isPosted: boolean;
  /** Whether the stored connection has expired/needs renewal. */
  connectionExpired?: boolean;
  isPosting?: boolean;
  postError?: string | null;
  onPost?: () => void;
  onConnect?: () => void;
  onReconnect?: () => void;
}

export function InstagramOutputCard({
  caption,
  isConnected,
  isPosted,
  connectionExpired,
  isPosting,
  postError,
  onPost,
  onConnect,
  onReconnect,
}: InstagramOutputCardProps) {
  const { t } = useTranslation('campaign');
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function handleCopy() {
    const ok = await copyToClipboard(caption);
    if (ok) {
      setCopied(true);
      setCopyFailed(false);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopyFailed(true);
    }
  }

  if (!caption) return null;

  const isLong = caption.length > 200;
  const displayCaption = isLong && !expanded ? caption.slice(0, 200) + '…' : caption;

  return (
    <section className={styles.section}>
      <p className={styles.sectionLabel}><AtSign size={14} /> {t('campaign:result.instagram.label')}</p>
      <div className={styles.card}>
        <p className={styles.text}>{displayCaption}</p>
        {isLong && (
          <button className={styles.showMoreBtn} onClick={() => setExpanded(!expanded)}>
            {expanded ? t('campaign:result.instagram.showLess') : t('campaign:result.instagram.showMore')}
          </button>
        )}
        <div className={styles.actionsRow}>
          <Button variant="secondary" size="sm" onClick={handleCopy}>
            {copied ? <><Check size={14} /> {t('common:actions.copied')}</> : <><Copy size={14} /> {t('campaign:result.instagram.copy')}</>}
          </Button>
        </div>
        {copyFailed && <p className={styles.errorNote}>{t('campaign:result.copyFailed')}</p>}

        <hr className={styles.divider} />

        {isPosted ? (
          <p className={styles.note}>{t('campaign:result.instagram.posted')}</p>
        ) : connectionExpired ? (
          <>
            <p className={styles.errorNote}>{t('campaign:result.instagram.connectionExpired')}</p>
            <div className={styles.actionsRow}>
              <Button size="sm" onClick={onReconnect}>{t('campaign:result.instagram.reconnect')}</Button>
            </div>
          </>
        ) : isConnected ? (
          <>
            {postError && <p className={styles.errorNote}>{postError}</p>}
            <div className={styles.actionsRow}>
              <Button size="sm" loading={isPosting} onClick={onPost}>
                {isPosting ? t('campaign:result.instagram.posting') : t('campaign:result.instagram.postNow')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className={styles.note}>{t('campaign:result.instagram.connectNote')}</p>
            <div className={styles.actionsRow}>
              <Button variant="secondary" size="sm" onClick={onConnect}>
                {t('campaign:result.instagram.connectToPost')}
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
