'use client';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Download, ExternalLink, MessageCircle, Image as ImageIcon } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/Button';
import { copyToClipboard } from '@/lib/utils';
import styles from './page.module.css';

interface CampaignResult {
  campaign_id: string | null;
  instagram_caption: string;
  whatsapp_copy: string;
  image_url: string | null;
}

export default function CampaignResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useTranslation('campaign');
  const router = useRouter();
  const [result, setResult] = useState<CampaignResult | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedWA, setCopiedWA] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // Both 'temp' and real IDs read from sessionStorage for now
    const raw = sessionStorage.getItem('briefai:tempResult');
    if (raw) {
      setResult(JSON.parse(raw));
    } else {
      router.replace('/dashboard');
    }
  }, [id, router]);

  async function handleCopyCaption() {
    if (!result?.instagram_caption) return;
    const ok = await copyToClipboard(result.instagram_caption);
    if (ok) { setCopiedCaption(true); setTimeout(() => setCopiedCaption(false), 2000); }
  }

  async function handleCopyWA() {
    if (!result?.whatsapp_copy) return;
    const ok = await copyToClipboard(result.whatsapp_copy);
    if (ok) { setCopiedWA(true); setTimeout(() => setCopiedWA(false), 2000); }
  }

  const caption = result?.instagram_caption ?? '';
  const isLongCaption = caption.length > 200;
  const displayCaption = isLongCaption && !captionExpanded ? caption.slice(0, 200) + '…' : caption;

  if (!result) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100dvh' }}>
        <div style={{ color: 'var(--color-text-muted)', fontSize: 15 }}>Loading…</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <AppHeader showBack title={t('campaign:result.heading')} />

      {!result.campaign_id && (
        <div className={styles.notSavedBanner}>
          Demo mode — connect backend to save campaigns
        </div>
      )}

      <div className={styles.body}>

        {/* Campaign Image */}
        <section className={styles.section}>
          <p className={styles.sectionLabel}><ImageIcon size={14} /> {t('campaign:result.image.label')}</p>
          <div className={styles.imageWrap}>
            {result.image_url && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={result.image_url}
                alt="Campaign image"
                className={styles.image}
                onError={() => setImgError(true)}
              />
            ) : (
              <div className={styles.imageFallback}>
                <ImageIcon size={40} />
                <span style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 8 }}>Image unavailable</span>
              </div>
            )}
          </div>
          {result.image_url && !imgError && (
            <a href={result.image_url} download="briefai-campaign.jpg" className={styles.downloadLink}>
              <Button variant="secondary" size="sm">
                <Download size={15} /> {t('campaign:result.image.download')}
              </Button>
            </a>
          )}
        </section>

        {/* Instagram Caption */}
        {caption && (
          <section className={styles.section}>
            <p className={styles.sectionLabel}><ExternalLink size={14} /> {t('campaign:result.instagram.label')}</p>
            <div className={styles.outputCard}>
              <p className={styles.outputText}>{displayCaption}</p>
              {isLongCaption && (
                <button className={styles.showMoreBtn} onClick={() => setCaptionExpanded(!captionExpanded)}>
                  {captionExpanded ? t('campaign:result.instagram.showLess') : t('campaign:result.instagram.showMore')}
                </button>
              )}
              <Button variant="secondary" size="sm" onClick={handleCopyCaption}>
                {copiedCaption
                  ? <><Check size={14} /> {t('common:actions.copied')}</>
                  : <><Copy size={14} /> {t('campaign:result.instagram.copy')}</>}
              </Button>
            </div>
          </section>
        )}

        {/* WhatsApp Message */}
        {result.whatsapp_copy && (
          <section className={styles.section}>
            <p className={styles.sectionLabel}><MessageCircle size={14} /> {t('campaign:result.whatsapp.label')}</p>
            <div className={styles.outputCard}>
              <p className={styles.outputText}>{result.whatsapp_copy}</p>
              <Button variant="secondary" size="sm" onClick={handleCopyWA}>
                {copiedWA
                  ? <><Check size={14} /> {t('common:actions.copied')}</>
                  : <><Copy size={14} /> {t('campaign:result.whatsapp.copy')}</>}
              </Button>
            </div>
          </section>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <Button fullWidth onClick={() => router.push('/campaign/new')}>
            {t('campaign:result.actions.createAnother')}
          </Button>
          <Button fullWidth variant="secondary" onClick={() => router.push('/history')}>
            {t('campaign:result.actions.viewHistory')}
          </Button>
        </div>

      </div>
    </div>
  );
}
