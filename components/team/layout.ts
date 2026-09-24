// Stage and timeline geometry for the team page, from handover/design/source/TeamDetail.dc.html.
// All numbers are CSS px on the 1328 × 634 stage.
import type { SponsorCardView, TeamPeriod, TimelineLane } from '@/lib/data/derive';

export const STAGE = { W: 1328, H: 634 } as const;
export const PHOTO = { W: 340, H: 378, FRONT_X: 316, BACK_X: 672, Y: 212 } as const;
export const PANEL = { X: 300, Y: 196, W: 728, H: 438 } as const;
const CARD_H = 158;
const ATTACH = 52;
const SIDE_W = 280;
const RIGHT_X = 1048;
const TOP_W = 260;
const TOP_GAP = 16;

export interface PlacedCard {
  sponsor: SponsorCardView;
  left: number;
  top: number;
  width: number;
  /** Where the line starts on the card. */
  attachX: number;
  attachY: number;
  /** Where the line ends on the logo. */
  ax: number;
  ay: number;
  /** The invisible hover button over the logo. */
  hit: { x: number; y: number; w: number; h: number };
}

const photoX = (side: 'front' | 'back') => (side === 'back' ? PHOTO.BACK_X : PHOTO.FRONT_X);

/** Anchor on the logo edge facing the card: left edge for L, right edge for R, top edge for T. */
function anchor(sp: SponsorCardView) {
  let { x, y } = sp.hotspot;
  const { w, h } = sp.hotspot;
  if (sp.slot === 'L') x = Math.max(0.04, x - w / 2);
  if (sp.slot === 'R') x = Math.min(0.96, x + w / 2);
  if (sp.slot === 'T') y = y - h / 2;
  return { ax: Math.round(photoX(sp.side) + x * PHOTO.W), ay: Math.round(PHOTO.Y + y * PHOTO.H) };
}

function hit(sp: SponsorCardView) {
  const w = Math.max(34, Math.round(sp.hotspot.w * PHOTO.W) + 10);
  const h = Math.max(34, Math.round(sp.hotspot.h * PHOTO.H) + 10);
  const cx = photoX(sp.side) + sp.hotspot.x * PHOTO.W;
  const cy = PHOTO.Y + sp.hotspot.y * PHOTO.H;
  return { x: Math.round(cx - w / 2), y: Math.round(cy - h / 2), w, h };
}

export function placeCards(sponsors: SponsorCardView[]): { cards: PlacedCard[]; backEmpty: boolean } {
  const cards: PlacedCard[] = [];
  const stack = (slot: 'L' | 'R', left: number) => {
    const list = sponsors
      .filter((sp) => sp.slot === slot)
      .map((sp) => ({ sp, ...anchor(sp) }))
      .sort((a, b) => a.ay - b.ay);
    let prev = 0;
    for (const i of list) {
      let top = Math.max(i.ay - ATTACH, PANEL.Y, prev);
      top = Math.min(top, STAGE.H - CARD_H);
      prev = top + CARD_H + 14;
      cards.push({
        sponsor: i.sp,
        left,
        top,
        width: SIDE_W,
        attachX: slot === 'L' ? SIDE_W : left,
        attachY: top + ATTACH,
        ax: i.ax,
        ay: i.ay,
        hit: hit(i.sp),
      });
    }
  };
  stack('L', 0);
  stack('R', RIGHT_X);
  const tops = sponsors.filter((sp) => sp.slot === 'T');
  const total = tops.length * TOP_W + Math.max(0, tops.length - 1) * TOP_GAP;
  tops.forEach((sp, n) => {
    const left = Math.round(STAGE.W / 2 - total / 2 + n * (TOP_W + TOP_GAP));
    cards.push({
      sponsor: sp,
      left,
      top: 16,
      width: TOP_W,
      attachX: left + TOP_W / 2,
      attachY: 16 + CARD_H,
      ...anchor(sp),
      hit: hit(sp),
    });
  });
  return { cards, backEmpty: !sponsors.some((sp) => sp.side === 'back') };
}

export const BACK_NOTE = { left: RIGHT_X, top: 330, width: SIDE_W };

/** An open card moves up if it needs to, so it gets at least this much height inside the stage. */
const OPEN_MIN_H = 420;
const STAGE_PAD = 8;

/**
 * Where an open card sits: inside the stage, never past its bottom edge, so opening a card can't
 * change the page height. The body scrolls within maxHeight when the evidence is long.
 */
export function openPlacement(card: Pick<PlacedCard, 'top'>): { top: number; maxHeight: number } {
  const top = Math.max(16, Math.min(card.top, STAGE.H - STAGE_PAD - OPEN_MIN_H));
  return { top, maxHeight: STAGE.H - STAGE_PAD - top };
}

// ---------------------------------------------------------------- timeline

export const TIMELINE = { TRACK: 1328, GAP: 8, MIN_W: 250, BLOCK_H: 54, PILLS_Y: 64, PILL_H: 24 } as const;

/** Block positions: a 250px minimum each, the rest shared by number of seasons. */
export function periodColumns(periods: TeamPeriod[]): { x: number; w: number }[] {
  const n = periods.length;
  const totalS = periods.reduce((a, p) => a + p.seasons, 0);
  const usable = TIMELINE.TRACK - TIMELINE.GAP * (n - 1);
  const rest = usable - TIMELINE.MIN_W * n;
  let acc = 0;
  return periods.map((p) => {
    const w = Math.round(TIMELINE.MIN_W + (rest * p.seasons) / totalS);
    const x = acc;
    acc += w + TIMELINE.GAP;
    return { x, w };
  });
}

export function laneRuns(lanes: TimelineLane[], cols: { x: number; w: number }[]) {
  return lanes.flatMap((lane, k) =>
    lane.runs.map((run) => {
      const x = cols[run.from].x;
      return { lane, k, x, y: TIMELINE.PILLS_Y + k * TIMELINE.PILL_H, w: cols[run.to].x + cols[run.to].w - x, run };
    }),
  );
}
