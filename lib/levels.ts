// Display constants for blood levels and sponsor tiers. Colours are the CSS tokens in
// app/globals.css; words and ranks are design copy.
import type { LevelId, TierId } from './data/schema';

export interface LevelUi {
  word: string;
  /** Team page and timeline use the short 'Not rated'. */
  short: string;
  meter: number;
  /** '4 of 4'. */
  rank: string;
  /** 'Blood level · 4 of 4 · worst'. */
  rankLong: string;
  text: string;
  fill: string;
  band: string;
  bandText: string;
  border: string;
  tint: string;
  /** Unfilled meter bar on the band colour. */
  bandOff: string;
  rated: boolean;
}

const v = (name: string) => `var(--${name})`;

export const LEVELS: Record<LevelId, LevelUi> = {
  soaked: {
    word: 'Soaked',
    short: 'Soaked',
    meter: 4,
    rank: '4 of 4',
    rankLong: '4 of 4 · worst',
    text: v('soaked-text'),
    fill: v('soaked-fill'),
    band: v('soaked-band'),
    bandText: v('soaked-band-text'),
    border: v('soaked-border'),
    tint: v('soaked-tint'),
    bandOff: 'rgba(255, 255, 255, 0.28)',
    rated: true,
  },
  stained: {
    word: 'Stained',
    short: 'Stained',
    meter: 3,
    rank: '3 of 4',
    rankLong: '3 of 4',
    text: v('stained-text'),
    fill: v('stained-fill'),
    band: v('stained-band'),
    bandText: v('stained-band-text'),
    border: v('stained-border'),
    tint: v('stained-tint'),
    bandOff: 'rgba(255, 255, 255, 0.28)',
    rated: true,
  },
  spotted: {
    word: 'Spotted',
    short: 'Spotted',
    meter: 2,
    rank: '2 of 4',
    rankLong: '2 of 4',
    text: v('spotted-text'),
    fill: v('spotted-fill'),
    band: v('spotted-band'),
    bandText: v('spotted-band-text'),
    border: v('spotted-border'),
    tint: v('spotted-tint'),
    bandOff: 'rgba(0, 0, 0, 0.2)',
    rated: true,
  },
  clean: {
    word: 'Clean',
    short: 'Clean',
    meter: 1,
    rank: '1 of 4',
    rankLong: '1 of 4',
    text: v('clean-text'),
    fill: v('clean-fill'),
    band: v('clean-band'),
    bandText: v('clean-band-text'),
    border: v('clean-border'),
    tint: v('clean-tint'),
    bandOff: 'rgba(0, 0, 0, 0.2)',
    rated: true,
  },
  'not-rated': {
    word: 'Not rated yet',
    short: 'Not rated',
    meter: 0,
    rank: 'not rated',
    rankLong: 'not checked yet',
    text: v('unrated-text'),
    fill: 'transparent',
    band: 'transparent',
    bandText: v('text-3'),
    border: v('unrated-border'),
    tint: 'transparent',
    bandOff: 'transparent',
    rated: false,
  },
};

export interface TierUi {
  label: string;
  color: string;
  fill: string;
  fg: string;
  /** Scale of the splat on the sponsor LogoMark; 0 hides it. */
  splat: number;
  splatColor: string;
  dashed: boolean;
}

export const TIERS: Record<TierId, TierUi> = {
  severe: {
    label: 'Severe',
    color: v('tier-severe'),
    fill: v('tier-severe-fill'),
    fg: '#ffffff',
    splat: 1.35,
    splatColor: '#e3121b',
    dashed: false,
  },
  serious: {
    label: 'Serious',
    color: v('tier-serious'),
    fill: v('tier-serious-fill'),
    fg: '#ffe3de',
    splat: 0.95,
    splatColor: v('tier-serious'),
    dashed: false,
  },
  concern: {
    label: 'Concern',
    color: v('tier-concern'),
    fill: v('tier-concern-fill'),
    fg: '#2a1512',
    splat: 0.55,
    splatColor: v('tier-concern'),
    dashed: false,
  },
  none: {
    label: 'Nothing found',
    color: v('tier-none'),
    fill: 'transparent',
    fg: v('text-2'),
    splat: 0,
    splatColor: 'transparent',
    dashed: false,
  },
  unrated: {
    label: 'Not rated yet',
    color: v('tier-unrated'),
    fill: 'transparent',
    fg: v('text-3'),
    splat: 0,
    splatColor: 'transparent',
    dashed: true,
  },
};
