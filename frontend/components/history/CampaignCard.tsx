'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageIcon } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';
import type { Campaign } from '@/lib/api/types';
import styles from './CampaignCard.module.css';

interface CampaignCardProps {
  campaign: Campaign;
  onOpen: (id: string) => void;
}

export function CampaignCard({ campaign, onOpen }: CampaignCardProps) {
  const { t } = useTranslation('history');
  const [imgError, setImgError] = useState(false);

  return (
    <button className={styles.card} onClick={() => onOpen(campaign.id)}>
      <div className={styles.thumbWrap}>
        {campaign.image_url && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={campaign.image_url}
            alt=""
            className={styles.thumb}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={styles.thumbFallback}><ImageIcon size={28} strokeWidth={1.5} /></div>
        )}
      </div>
      <div className={styles.info}>
        <p className={styles.product}>{campaign.product}</p>
        <p className={styles.date}>{t('history:created', { date: formatDate(campaign.created_at) })}</p>
        <StatusBadge
          label={campaign.posted_to_instagram ? t('history:posted') : t('history:notPosted')}
          variant={campaign.posted_to_instagram ? 'success' : 'muted'}
        />
      </div>
    </button>
  );
}
