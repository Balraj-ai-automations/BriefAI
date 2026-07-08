import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from './providers';
import { LanguageSync } from './LanguageSync';
import { OfflineNotice } from '@/components/feedback/OfflineNotice';

export const metadata: Metadata = {
  title: 'BriefAI — Apna marketing, AI se',
  description: 'AI-powered marketing for Indian small businesses. Create Instagram captions, WhatsApp messages, and campaign images instantly.',
  keywords: ['marketing', 'AI', 'Instagram', 'WhatsApp', 'India', 'small business'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Spec Section 88: support 200% zoom, never disable pinch-to-zoom.
  themeColor: '#FAF8F4',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>
          <LanguageSync />
          <OfflineNotice />
          {children}
        </Providers>
      </body>
    </html>
  );
}

