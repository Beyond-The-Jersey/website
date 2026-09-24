'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import s from './RotatingHeadline.module.css';

// "race" is deliberately not in the list: the team rejected it.
const WORDS = ['shirt', 'shoes', 'stadium', 'game', 'league', 'club', 'loyalty'];
const LAST = WORDS.length - 1;
const STEP_MS = 1300;

/** "Who’s buying your ___?" The last word rotates and lands on "loyalty". */
export function RotatingHeadline() {
  // Start on the final word so the static HTML and no-JS readers get the full headline.
  const [i, setI] = useState(LAST);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const play = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setI(LAST);
      return;
    }
    clearInterval(timer.current);
    setI(0);
    timer.current = setInterval(() => {
      setI((n) => {
        const next = Math.min(n + 1, LAST);
        if (next >= LAST) clearInterval(timer.current);
        return next;
      });
    }, STEP_MS);
  }, []);

  useEffect(() => {
    // Kick off the rotation after hydration; the server render already shows "loyalty".
    const start = setTimeout(play, 0);
    return () => {
      clearTimeout(start);
      clearInterval(timer.current);
    };
  }, [play]);

  return (
    <h1 className={s.h1} aria-label="Who’s buying your loyalty?">
      <span aria-hidden="true">
        Who’s buying
        <br />
        your{' '}
        <button
          type="button"
          className={s.word}
          onClick={play}
          aria-label="Play again"
          title="Play again"
          tabIndex={-1}
        >
          <span key={i} className={s.anim}>
            {WORDS[i]}
          </span>
        </button>
        ?
      </span>
    </h1>
  );
}
