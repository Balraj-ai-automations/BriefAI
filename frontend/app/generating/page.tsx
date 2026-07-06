'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { useCampaignStore } from '@/stores/campaign-store';
import styles from './page.module.css';

const STAGES = [
  'campaign:generating.stages.understanding',
  'campaign:generating.stages.planning',
  'campaign:generating.stages.creating',
  'campaign:generating.stages.preparing',
];

// ── Mock result generator ─────────────────────────────────────────────────────
function buildMockResult(answers: Record<string, string>) {
  const product = answers.product || 'your product';
  const price = answers.price || '₹499';
  const usp = answers.usp || 'best quality';
  const offer = answers.offer || '';
  const location = answers.location || 'India';
  const offerLine = offer ? `\n🎁 Special offer: ${offer}` : '';

  return {
    campaign_id: null,
    instagram_caption:
      `✨ Introducing ${product}!\n\n` +
      `${usp}\n` +
      `📍 Available in ${location}\n` +
      `💰 Starting at just ${price}${offerLine}\n\n` +
      `Drop a 🙋 in the comments or DM us to order!\n\n` +
      `#SmallBusiness #MadeInIndia #BriefAI #${product.replace(/\s+/g, '')}`,
    whatsapp_copy:
      `🙏 Namaste!\n\n` +
      `We are excited to offer you *${product}*.\n\n` +
      `✅ ${usp}\n` +
      `📍 ${location}\n` +
      `💰 Price: *${price}*${offerLine ? '\n' + offerLine : ''}\n\n` +
      `To place an order or know more, reply to this message. We'll get back to you shortly! 😊`,
    image_url: `https://picsum.photos/seed/${encodeURIComponent(product)}/800/800`,
    tone: 'friendly',
    campaign_angle: 'value',
  };
}

export default function GeneratingPage() {
  const { t } = useTranslation('campaign');
  const router = useRouter();
  const { resetDraft, answers } = useCampaignStore();
  const [stageIndex, setStageIndex] = useState(0);
  const [showLongWait, setShowLongWait] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    // Cycle through stages
    const stageTimer = setInterval(() => {
      setStageIndex(i => Math.min(i + 1, STAGES.length - 1));
    }, 2000);

    const longWaitTimer = setTimeout(() => setShowLongWait(true), 12000);

    async function run() {
      try {
        const raw = sessionStorage.getItem('briefai:pendingCampaign');
        if (!raw) { router.replace('/campaign/new'); return; }
        const payload = JSON.parse(raw);
        sessionStorage.removeItem('briefai:pendingCampaign');

        // Simulate network delay (2–4 seconds)
        await new Promise(r => setTimeout(r, 2500 + Math.random() * 1500));

        let result;
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

        if (apiBase) {
          // Real API call
          const req = {
            user_id: payload.user_id,
            name: (payload.answers.name ?? '').trim(),
            product: (payload.answers.product ?? '').trim(),
            usp: (payload.answers.usp ?? '').trim(),
            price: (payload.answers.price ?? '').trim(),
            offer: (payload.answers.offer ?? '').trim() || null,
            buyer: (payload.answers.buyer ?? '').trim(),
            location: (payload.answers.location ?? '').trim(),
            occasion: (payload.answers.occasion ?? 'none').trim(),
            goal: (payload.answers.goal ?? '').trim(),
            app_language: payload.whatsapp_language,
            ig_language: payload.instagram_language,
            wa_language: payload.whatsapp_language,
            has_product_image: false,
            product_image_base64: null,
          };
          const res = await fetch(`${apiBase}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req),
            signal: AbortSignal.timeout(90000),
          });
          if (!res.ok) throw new Error(`API error: ${res.status}`);
          result = await res.json();
        } else {
          // Frontend-only mock — works without any backend
          result = buildMockResult(payload.answers);
        }

        resetDraft();
        sessionStorage.setItem('briefai:tempResult', JSON.stringify(result));
        router.replace('/campaign/temp');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Generation failed');
      } finally {
        clearInterval(stageTimer);
        clearTimeout(longWaitTimer);
      }
    }

    run();
    return () => { clearInterval(stageTimer); clearTimeout(longWaitTimer); };
  }, []); // eslint-disable-line

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <p className={styles.errorTitle}>{t('campaign:error.generationFailed')}</p>
          <p className={styles.errorSub}>{t('campaign:error.answersAreSafe')}</p>
          <div className={styles.errorActions}>
            <Button onClick={() => router.push('/campaign/new')}>{t('campaign:error.reviewAnswers')}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.center}>
        <div className={styles.spinner} aria-label="Generating…" />
        <p className={styles.stage} key={stageIndex}>{t(STAGES[stageIndex])}</p>
        <p className={styles.hint}>{t('campaign:generating.takesAMinute')}</p>
        {showLongWait && <p className={styles.longWait}>{t('campaign:generating.stillWorking')}</p>}
      </div>
    </div>
  );
}
