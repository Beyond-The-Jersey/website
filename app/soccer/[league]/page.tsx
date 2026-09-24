import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { OverviewPage } from '@/components/overview/Overview';
import { getDataset } from '@/lib/data';
import { leagueSummary, leaguesForSport } from '@/lib/data/derive';

type Props = { params: Promise<{ league: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const ds = await getDataset();
  return leaguesForSport(ds, 'soccer').map((l) => ({ league: l.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { league } = await params;
  const ds = await getDataset();
  const s = leagueSummary(ds, league);
  return {
    title: `${s.name}: who's on every shirt`,
    description:
      s.rated > 0
        ? `${s.bad} of ${s.total} ${s.name} home shirts carry a sponsor we rate as bad. Every sponsor traced back to who really pays.`
        : `${s.name} hasn't been mapped yet. Help us check every shirt.`,
  };
}

export default async function LeagueOverview({ params }: Props) {
  const { league } = await params;
  const ds = await getDataset();
  const l = ds.byId.league.get(league);
  if (!l || l.sportId !== 'soccer') notFound();
  return <OverviewPage ds={ds} sportId="soccer" leagueId={league} />;
}
