'use client';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ExternalLink, CheckCircle2, Camera, Share2, Users } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';

export default function ConnectInstagramPage() {
  const { t } = useTranslation('common');
  const router = useRouter();

  function handleConnect() {
    // Feature not yet available — inform user
    alert('Instagram connection is coming soon! We are completing Meta verification.');
  }

  return (
    <div className={styles.page}>
      <AppHeader showBack title="Connect Instagram" />
      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.iconWrap}>
            <ExternalLink size={48} strokeWidth={1.5} />
          </div>
          <h1 className={styles.heading}>Connect Instagram to post directly</h1>
          <p className={styles.sub}>
            Once connected, you can post your AI-generated campaign images and captions directly from BriefAI — no copy-paste needed.
          </p>
        </div>

        <div className={styles.benefits}>
          {[
            { icon: Camera, text: 'Post campaign images directly from BriefAI' },
            { icon: Share2, text: 'Share your WhatsApp message to Instagram Stories' },
            { icon: Users, text: 'Reach more customers without leaving the app' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className={styles.benefit}>
              <div className={styles.benefitIcon}><Icon size={20} /></div>
              <p className={styles.benefitText}>{text}</p>
            </div>
          ))}
        </div>

        <div className={styles.comingSoonBadge}>
          <CheckCircle2 size={16} />
          Meta verification in progress — Coming soon
        </div>

        <div className={styles.actions}>
          <Button fullWidth size="lg" onClick={handleConnect}>
            Connect Instagram
          </Button>
          <Button fullWidth variant="ghost" onClick={() => router.back()}>
            Not now
          </Button>
        </div>
      </main>
    </div>
  );
}
