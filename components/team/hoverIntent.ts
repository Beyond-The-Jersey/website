'use client';

// Hover intent ("menu-aim" / safe triangle), ported from handover/design/source/TeamDetail.dc.html.
// When the pointer leaves a hotspot, line or lane whose card is open, the card stays open while the
// pointer keeps heading toward it. Other hovers wait until the pointer arrives, turns away or stalls.
import { useCallback, useEffect, useRef } from 'react';

export interface Aim {
  id: string;
  /** Where the pointer left the target. */
  x: number;
  y: number;
  /** The card's bounding box. */
  l: number;
  t: number;
  r: number;
  b: number;
}

const PAD = 16;

/** Is (x, y) inside the card grown by 16px, or inside a triangle from the leave point to an edge of it? */
export function heading(a: Aim, x: number, y: number): boolean {
  const c: [number, number][] = [
    [a.l - PAD, a.t - PAD],
    [a.r + PAD, a.t - PAD],
    [a.r + PAD, a.b + PAD],
    [a.l - PAD, a.b + PAD],
  ];
  if (x >= c[0][0] && x <= c[1][0] && y >= c[0][1] && y <= c[2][1]) return true;
  const side = (p: number[], q: number[], r: number[]) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  const inTri = (p: number[], a1: number[], b1: number[], c1: number[]) => {
    const d1 = side(p, a1, b1);
    const d2 = side(p, b1, c1);
    const d3 = side(p, c1, a1);
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
  };
  const o = [a.x, a.y];
  const p = [x, y];
  for (let i = 0; i < 4; i++) if (inTri(p, o, c[i], c[(i + 1) % 4])) return true;
  return false;
}

export function useHoverIntent(opts: { current: () => string | null; close: () => void }) {
  const optsRef = useRef(opts);
  useEffect(() => {
    optsRef.current = opts;
  });
  const aim = useRef<Aim | null>(null);
  const pending = useRef<(() => void) | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const clearAim = useCallback(() => {
    clearTimeout(timer.current);
    aim.current = null;
    pending.current = null;
  }, []);

  const failAim = useCallback(() => {
    const next = pending.current;
    clearAim();
    if (next) next();
    else optsRef.current.close();
  }, [clearAim]);

  const arm = useCallback(
    (ms: number) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(failAim, ms);
    },
    [failAim],
  );

  /** Call when the pointer leaves a hotspot, line or lane. */
  const startAim = useCallback(
    (id: string, e: { clientX: number; clientY: number }) => {
      if (optsRef.current.current() !== id) return;
      const el = document.querySelector(`[data-card="${CSS.escape(id)}"]`);
      if (!el) {
        optsRef.current.close();
        return;
      }
      const r = el.getBoundingClientRect();
      aim.current = { id, x: e.clientX, y: e.clientY, l: r.left, t: r.top, r: r.right, b: r.bottom };
      pending.current = null;
      arm(900);
    },
    [arm],
  );

  /** Call on every pointer move over the page. */
  const moved = useCallback(
    (e: { clientX: number; clientY: number }) => {
      const a = aim.current;
      if (!a) return;
      const { clientX: x, clientY: y } = e;
      if (x >= a.l && x <= a.r && y >= a.t && y <= a.b) clearAim();
      else if (heading(a, x, y)) arm(500);
      else failAim();
    },
    [arm, clearAim, failAim],
  );

  /** Wrap a hover handler so it waits while the pointer is on its way to an open card. */
  const gated = useCallback(
    (targetId: string | null, fn: () => void) => () => {
      if (aim.current) {
        if (targetId && targetId === aim.current.id) return;
        pending.current = fn;
        return;
      }
      fn();
    },
    [],
  );

  /** For the card itself: arriving ends the aim; other cards wait their turn. */
  const enterCard = useCallback(
    (id: string, open: () => void) => {
      if (aim.current && aim.current.id === id) {
        clearAim();
        return;
      }
      if (aim.current) {
        pending.current = open;
        return;
      }
      open();
    },
    [clearAim],
  );

  const aiming = useCallback(() => aim.current !== null, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { startAim, moved, gated, enterCard, clearAim, aiming };
}
