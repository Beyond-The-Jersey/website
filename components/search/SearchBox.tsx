'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { CrestBadge } from '@/components/CrestBadge';
import { LevelMeter } from '@/components/Level';
import { LEVELS, TIERS } from '@/lib/levels';
import { search, type SearchEntry } from '@/lib/search';
import s from './SearchBox.module.css';

const TYPE_LABEL = { club: 'Club', league: 'League', sport: 'Sport', sponsor: 'Sponsor' } as const;

function Rating({ e }: { e: SearchEntry }) {
  const r = e.rating;
  if (r.kind === 'level') {
    const lv = LEVELS[r.level];
    return (
      <>
        {lv.rated && <LevelMeter level={r.level} size="s" />}
        <span className={s.tag} style={{ color: lv.text }}>
          {lv.word}
        </span>
      </>
    );
  }
  if (r.kind === 'tier') {
    const color = r.tier === 'unrated' ? 'var(--text-4)' : TIERS[r.tier].color;
    return (
      <span className={s.tag} style={{ color }}>
        {r.label}
      </span>
    );
  }
  return (
    <span className={s.tag} style={{ color: 'var(--text-3)' }}>
      {r.text}
    </span>
  );
}

/**
 * Universal search: clubs, leagues, sports and sponsors. The index is built at build time
 * (lib/data/search-index.ts); matching runs in the browser (lib/search.ts).
 */
export function SearchBox({
  index,
  variant,
  tries = [],
  placeholder = 'Search a club, league, sport or sponsor',
}: {
  index: SearchEntry[];
  variant: 'hero' | 'compact';
  tries?: string[];
  placeholder?: string;
}) {
  const router = useRouter();
  const id = useId();
  const listId = `${id}-list`;
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const results = useMemo(() => search(index, q), [index, q]);

  useEffect(() => () => clearTimeout(blurTimer.current), []);

  const optionId = (i: number) => `${id}-opt-${i}`;
  const show = (value: string) => {
    clearTimeout(blurTimer.current);
    setQ(value);
    setActive(-1);
    setOpen(true);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      const target = results[active >= 0 ? active : 0];
      if (open && target && (active >= 0 || q.trim())) {
        e.preventDefault();
        setOpen(false);
        router.push(target.href);
      }
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault();
        setOpen(false);
        setActive(-1);
      } else setQ('');
    }
  };

  const hero = variant === 'hero';
  const hasQuery = q.trim().length > 0;

  return (
    <>
      <div className={`${s.wrap} ${hero ? s.hero : s.compact}`}>
        <label className={s.field}>
          <svg width={hero ? 24 : 18} height={hero ? 24 : 18} viewBox="0 0 24 24" fill="none" stroke={hero ? 'var(--text-2)' : 'var(--text-4)'} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20 L16 16" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
            aria-label={placeholder}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            value={q}
            onChange={(e) => show(e.target.value)}
            onFocus={() => {
              clearTimeout(blurTimer.current);
              setOpen(true);
            }}
            onBlur={() => {
              clearTimeout(blurTimer.current);
              blurTimer.current = setTimeout(() => setOpen(false), 180);
            }}
            onKeyDown={onKeyDown}
          />
        </label>
        {open && (
          <div className={s.panel}>
            <span className={s.head} id={`${id}-head`}>
              {hasQuery ? 'Clubs, leagues, sports and sponsors' : 'Popular right now'}
            </span>
            <div role="listbox" id={listId} aria-labelledby={`${id}-head`} className={s.list}>
              {results.map((e, i) => (
                <Link
                  key={`${e.type}:${e.label}`}
                  id={optionId(i)}
                  role="option"
                  aria-selected={i === active}
                  href={e.href}
                  className={`${s.row} ${i === active ? s.rowActive : ''}`}
                  tabIndex={-1}
                  onMouseDown={(ev) => ev.preventDefault()}
                  onClick={() => setOpen(false)}
                >
                  <CrestBadge crest={e.crest} initials={e.initials} size={38} />
                  <span className={s.text}>
                    <span className={s.label}>{e.label}</span>
                    <span className={s.desc}>{e.description}</span>
                  </span>
                  <span className={s.type}>{TYPE_LABEL[e.type].toUpperCase()}</span>
                  <span className={s.rating}>
                    <Rating e={e} />
                  </span>
                </Link>
              ))}
            </div>
            {results.length === 0 && (
              <div className={s.empty}>
                <span className={s.emptyTitle}>Nothing on file for “{q.trim()}” yet.</span>
                <a href="/#contribute" className={s.emptyLink} onMouseDown={(ev) => ev.preventDefault()}>
                  Add it yourself: every club and sponsor lives on GitHub →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
      {tries.length > 0 && (
        <div className={s.tries}>
          <span className={s.tryLabel}>Try</span>
          {tries.map((t) => (
            <button
              key={t}
              type="button"
              className={s.chip}
              onClick={() => {
                show(t);
                inputRef.current?.focus();
              }}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
