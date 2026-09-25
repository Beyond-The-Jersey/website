import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container, SiteFooter, SiteHeader } from '@/components/SiteChrome';
import { TeamPage } from '@/components/team/TeamPage';
import { SHOW_TEAM_CREST } from '@/lib/config';
import { getDataset } from '@/lib/data';
import { teamPage } from '@/lib/data/team';
import { LEVELS } from '@/lib/levels';
import s from './page.module.css';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

/** Every club has a page. */
export async function generateStaticParams() {
  const ds = await getDataset();
  return ds.clubs.map((c) => ({ slug: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ds = await getDataset();
  const t = teamPage(ds, slug);
  if (!t) return {};
  const p = t.periods[t.current];
  const level = LEVELS[p.level];
  return {
    title: `${t.club.name}: ${level.rated ? level.word : 'not rated yet'}`,
    description: p.headline.text,
  };
}

export default async function ClubPage({ params }: Props) {
  const { slug } = await params;
  const ds = await getDataset();
  const team = teamPage(ds, slug);
  if (!team) notFound();
  return (
    <>
      <SiteHeader variant="team" crumbs={team.crumbs} current={team.club.name} />
      <main className={s.main}>
        <Container>
          <TeamPage team={team} showCrest={SHOW_TEAM_CREST} />
        </Container>
      </main>
      <SiteFooter variant="standard" />
    </>
  );
}
