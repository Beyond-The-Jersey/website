import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container, SiteFooter, SiteHeader } from '@/components/SiteChrome';
import { TeamView } from '@/components/team/TeamView';
import { SHOW_TEAM_CREST } from '@/lib/config';
import { getDataset } from '@/lib/data';
import { hasTeamPage, teamPage } from '@/lib/data/derive';
import { LEVELS } from '@/lib/levels';
import s from './page.module.css';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

/** One page per club whose current kit has photos and logo hotspots. */
export async function generateStaticParams() {
  const ds = await getDataset();
  return ds.clubs.filter((c) => hasTeamPage(ds, c.id)).map((c) => ({ slug: c.id }));
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
    description: p.summary ?? `Who pays for the sponsors on ${t.club.name}’s shirt.`,
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
          <TeamView team={team} showCrest={SHOW_TEAM_CREST} />
        </Container>
      </main>
      <SiteFooter variant="standard" />
    </>
  );
}
