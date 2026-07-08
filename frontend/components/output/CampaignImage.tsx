'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image as ImageIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import styles from './CampaignImage.module.css';

interface CampaignImageProps {
  imageUrl: string | null;
}

export function CampaignImage({ imageUrl }: CampaignImageProps) {
  const { t } = useTranslation('campaign');
  const [imgError, setImgError] = useState(false);

  const showImage = imageUrl && !imgError;

  return (
    <section className={styles.section}>
      <p className={styles.sectionLabel}>{t('campaign:result.image.label')}</p>
      <div className={styles.imageWrap}>
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={t('campaign:result.image.label')}
            className={styles.image}
            onClick={() => window.open(imageUrl, '_blank', 'noopener,noreferrer')}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={styles.imageFallback}>
            <ImageIcon size={40} strokeWidth={1.5} />
            <span className={styles.fallbackText}>{t('campaign:result.image.failed')}</span>
          </div>
        )}
      </div>
      {showImage && (
        <a href={imageUrl} download="briefai-campaign.jpg" className={styles.downloadLink}>
          <Button variant="secondary" size="sm">
            <Download size={15} /> {t('campaign:result.image.download')}
          </Button>
        </a>
      )}
    </section>
  );
}
