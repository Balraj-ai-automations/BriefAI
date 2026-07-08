'use client';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { AtSign, Camera, Share2, Users } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/Button';
import { useUserId } from '@/features/auth/useUserId';
import { getInstagramLoginUrl } from '@/lib/api/instagram';
import styles from './page.module.css';

export default function ConnectInstagramPage() {
  const { t } = useTranslation(['settings', 'common']);
  const router = useRouter();
  const { userId, isLoading } = useUserId();

  function handleConnect() {
    if (!userId) return;
    // Backend handles the full OAuth exchange and redirects back to
    // /dashboard (success) or /settings (failure) — see lib/api/instagram.ts.
    window.location.href = getInstagramLoginUrl(userId);
  }

  return (
    <div className={styles.page}>
      <AppHeader showBack title={t('settings:instagram.connect')} />
      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.iconWrap}>
            <AtSign size={40} strokeWidth={1.5} />
          </div>
          <h1 className={styles.heading}>{t('settings:connectPage.heading')}</h1>
          <p className={styles.sub}>{t('settings:connectPage.sub')}</p>
        </div>

        <div className={styles.benefits}>
          {[
            { icon: Camera, text: t('settings:connectPage.benefit1') },
            { icon: Share2, text: t('settings:connectPage.benefit2') },
            { icon: Users, text: t('settings:connectPage.benefit3') },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className={styles.benefit}>
              <div className={styles.benefitIcon}><Icon size={20} /></div>
              <p className={styles.benefitText}>{text}</p>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <Button fullWidth size="lg" onClick={handleConnect} loading={isLoading}>
            {t('settings:instagram.connect')}
          </Button>
          <Button fullWidth variant="ghost" onClick={() => router.back()}>
            {t('settings:connectPage.notNow')}
          </Button>
        </div>
      </main>
    </div>
  );
}
