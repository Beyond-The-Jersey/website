import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { OverviewPage } from '@/components/overview/Overview';
import { getDataset } from '@/lib/data';

type Props = { params: Promise<{ sport: string }> };

// Soccer has its own routes (/soccer/[league]); every other sport gets a "not mapped yet" page.
export const dynamicParams = false;

export async function generateStaticParams() {
  const ds = await getDataset();
  return ds.sports.filter((s) => s.id !== 'soccer').map((s) => ({ sport: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sport } = await params;
  const ds = await getDataset();
  const label = ds.byId.sport.get(sport)?.label ?? sport;
  return { title: label, description: `${label}: the sponsors we know about so far, and which deals ended.` };
}

export default async function SportOverview({ params }: Props) {
  const { sport } = await params;
  const ds = await getDataset();
  if (!ds.byId.sport.get(sport) || sport === 'soccer') notFound();
  return <OverviewPage ds={ds} sportId={sport} />;
}
