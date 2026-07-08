'use client';
import { CampaignCard } from './CampaignCard';
import type { Campaign } from '@/lib/api/types';
import styles from './CampaignGrid.module.css';

interface CampaignGridProps {
  campaigns: Campaign[];
  onOpen: (id: string) => void;
}

export function CampaignGrid({ campaigns, onOpen }: CampaignGridProps) {
  return (
    <div className={styles.grid}>
      {campaigns.map((c) => (
        <CampaignCard key={c.id} campaign={c} onOpen={onOpen} />
      ))}
    </div>
  );
}
