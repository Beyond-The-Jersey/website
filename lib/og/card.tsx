// Open Graph share cards, rendered at build time with next/og. For now a simple card: crest,
// club name, level word and meter (handover/docs/02-implementation-plan.md M6).
import fs from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { BASE_PATH } from '@/lib/config';
import type { LevelId } from '@/lib/data/schema';

export const OG_SIZE = { width: 1200, height: 630 };

const COLORS: Record<LevelId, { text: string; fill: string }> = {
  soaked: { text: '#ff4a3d', fill: '#e3121b' },
  stained: { text: '#e0705f', fill: '#b0402f' },
  spotted: { text: '#e6b3a8', fill: '#d9a399' },
  clean: { text: '#f3ede6', fill: '#e8e2da' },
  'not-rated': { text: '#a39a91', fill: 'transparent' },
};
const METER: Record<LevelId, number> = { 'not-rated': 0, clean: 1, spotted: 2, stained: 3, soaked: 4 };
const WORD: Record<LevelId, string> = {
  soaked: 'Soaked',
  stained: 'Stained',
  spotted: 'Spotted',
  clean: 'Clean',
  'not-rated': 'Not rated',
};

async function font() {
  return fs.readFile(path.join(process.cwd(), 'lib', 'og', 'BigShouldersDisplay-Black.ttf'));
}

async function dataUrl(publicPath: string | null): Promise<string | null> {
  if (!publicPath) return null;
  const buf = await fs.readFile(
    path.join(process.cwd(), 'public', publicPath.slice(BASE_PATH.length).replace(/^\//, '')),
  );
  return `data:image/png;base64,${buf.toString('base64')}`;
}

export async function clubCard(opts: { name: string; crest: string | null; level: LevelId; line: string | null }) {
  const c = COLORS[opts.level];
  const crest = await dataUrl(opts.crest);
  const bars = [0, 1, 2, 3].map((i) => (
    <div
      key={i}
      style={{
        width: 26,
        height: [28, 50, 74, 100][i],
        borderRadius: 4,
        background:
          opts.level === 'not-rated' ? 'transparent' : i < METER[opts.level] ? c.text : 'rgba(255,255,255,0.18)',
        border: opts.level === 'not-rated' ? '2px dashed #8a8078' : 'none',
      }}
    />
  ));
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#0f0d0c',
        color: '#f3ede6',
        padding: 64,
        fontFamily: 'Big Shoulders',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {crest && (
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: 75,
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={crest} width={108} height={108} alt="" />
          </div>
        )}
        <div style={{ display: 'flex', fontSize: 110, lineHeight: 0.9, textTransform: 'uppercase' }}>{opts.name}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>{bars}</div>
        <div style={{ display: 'flex', fontSize: 150, lineHeight: 0.8, color: c.text, textTransform: 'uppercase' }}>
          {WORD[opts.level]}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 34,
          color: '#a39a91',
          textTransform: 'uppercase',
          letterSpacing: 2,
        }}
      >
        <span>Behind the Jersey</span>
        <span>{opts.line ?? 'Who’s buying your loyalty?'}</span>
      </div>
    </div>,
    { ...OG_SIZE, fonts: [{ name: 'Big Shoulders', data: await font(), weight: 900, style: 'normal' }] },
  );
}
