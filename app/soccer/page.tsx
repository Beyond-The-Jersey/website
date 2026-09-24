import type { Metadata } from 'next';
import { OverviewPage } from '@/components/overview/Overview';
import { getDataset } from '@/lib/data';
import { DEFAULT_LEAGUE } from '@/lib/data/derive';

export const metadata: Metadata = {
  title: 'Soccer',
  alternates: { canonical: `/soccer/${DEFAULT_LEAGUE}/` },
};

export default async function SoccerIndex() {
  const ds = await getDataset();
  return <OverviewPage ds={ds} sportId="soccer" leagueId={DEFAULT_LEAGUE} />;
}
