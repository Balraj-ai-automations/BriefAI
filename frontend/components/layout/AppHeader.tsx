'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';
import styles from './AppHeader.module.css';

interface AppHeaderProps {
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
  right?: React.ReactNode;
  showLogo?: boolean;
}

export function AppHeader({ showBack, onBack, title, right, showLogo = true }: AppHeaderProps) {
  const router = useRouter();
  const handleBack = onBack ?? (() => router.back());

  return (
    <header className={styles.header}>
      {showBack && (
        <button className={styles.backBtn} onClick={handleBack} aria-label="Go back">
          <ChevronLeft size={22} />
        </button>
      )}
      {title ? (
        <span className={styles.title}>{title}</span>
      ) : showLogo ? (
        <span className={styles.logo}>
          <Image src="/logo.png" alt="BriefAI" width={32} height={32} style={{ borderRadius: '6px' }} />
        </span>
      ) : null}
      {right && <div className={styles.right}>{right}</div>}
    </header>
  );
}
