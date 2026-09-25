import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, Schibsted_Grotesk } from 'next/font/google';
import { DemoBanner } from '@/components/DemoBanner';
import { IS_DEMO } from '@/lib/config';
import './globals.css';

const schibsted = Schibsted_Grotesk({
  subsets: ['latin', 'latin-ext'],
  // 800 for the numbers in the sponsor markers on team pages.
  weight: ['400', '500', '700', '800'],
  variable: '--font-schibsted',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'Behind the Jersey: who’s buying your loyalty?', template: '%s · Behind the Jersey' },
  description:
    'Type a club, a league, a sport or a sponsor. We trace every sponsor back to who really pays, and rate how much blood is on the money.',
  // Private preview until image rights and the rating method are cleared.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: '#0f0d0c', colorScheme: 'dark' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${schibsted.variable} ${plexMono.variable}`}>
      <body>
        {IS_DEMO && <DemoBanner />}
        {children}
      </body>
    </html>
  );
}
