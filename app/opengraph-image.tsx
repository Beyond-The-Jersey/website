import { clubCard, OG_SIZE } from '@/lib/og/card';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Behind the Jersey: who’s buying your loyalty?';
export const dynamic = 'force-static';

export default async function Image() {
  return clubCard({
    name: 'Who’s buying your loyalty?',
    crest: null,
    level: 'soaked',
    line: 'Every sponsor, traced to who pays',
  });
}
