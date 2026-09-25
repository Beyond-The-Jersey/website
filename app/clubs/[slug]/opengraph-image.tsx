import { getDataset } from '@/lib/data';
import { hasTeamPage } from '@/lib/data/derive';
import { teamPage } from '@/lib/data/team';
import { clubCard, OG_SIZE } from '@/lib/og/card';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'The club’s blood level on Behind the Jersey';
export const dynamicParams = false;

export async function generateStaticParams() {
  const ds = await getDataset();
  return ds.clubs.filter((c) => hasTeamPage(ds, c.id)).map((c) => ({ slug: c.id }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ds = await getDataset();
  const t = teamPage(ds, slug)!;
  const p = t.periods[t.current];
  return clubCard({ name: t.club.name, crest: t.club.crest, level: p.level, line: 'Ratings are illustrative' });
}
