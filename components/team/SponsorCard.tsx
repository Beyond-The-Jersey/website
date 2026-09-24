'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { SponsorMark } from '@/components/LogoMark';
import { IS_DEV } from '@/lib/config';
import type { SponsorCardView } from '@/lib/data/derive';
import { TIER_SCORE } from '@/lib/data/rating';
import { TIERS } from '@/lib/levels';
import s from './Team.module.css';

const UNRATED_VERDICT =
  'We haven’t investigated this sponsor yet. A rating only goes up once every claim behind it is sourced.';

export function tierLabel(sp: Pick<SponsorCardView, 'tier' | 'status'>): string {
  if (sp.tier === 'unrated' && sp.status === 'being-rated') return 'Being rated';
  return TIERS[sp.tier].label;
}

export const isScored = (sp: Pick<SponsorCardView, 'tier'>) => (TIER_SCORE[sp.tier] ?? 0) >= 1;

export function cardSub(sp: SponsorCardView): string {
  if (sp.tier === 'unrated') return `${sp.placementText} · not investigated yet`;
  if (sp.tier === 'none') return `${sp.placementText} · checked, nothing found`;
  return sp.payer ? `${sp.placementText} · ${sp.payer}` : sp.placementText;
}

export function SponsorCard({
  sp,
  open,
  highlight = false,
  maxHeight,
  dim,
  style,
  number,
  onToggle,
  onEnter,
  onLeave,
  onFocus,
  onTell,
  onShare,
  shareLabel,
  variant = 'stage',
}: {
  /** 'stage' cards carry data-card for hover intent; 'list' cards are the mobile copies. */
  variant?: 'stage' | 'list';
  sp: SponsorCardView;
  open: boolean;
  /** Hover or focus highlight: tier-coloured border, no change in size. */
  highlight?: boolean;
  /** Cap for the open card; the body scrolls inside it. Keeps the card within the stage. */
  maxHeight?: number;
  dim?: boolean;
  style?: CSSProperties;
  /** Marker number on mobile. */
  number?: number;
  onToggle: () => void;
  onEnter?: () => void;
  onLeave?: () => void;
  onFocus?: () => void;
  onTell: () => void;
  onShare: () => void;
  shareLabel: string;
}) {
  const t = TIERS[sp.tier];
  const scored = isScored(sp);
  const bodyId = `${variant === 'list' ? 'm-' : ''}card-body-${sp.key.replace(/[^a-z0-9-]/g, '-')}`;
  return (
    <article
      data-card={variant === 'stage' ? sp.key : undefined}
      data-list-card={variant === 'list' ? sp.key : undefined}
      className={`${s.card} ${open ? s.cardOpen : ''}`}
      style={{
        ...style,
        ...(open && maxHeight ? { maxHeight } : {}),
        borderColor: open || highlight ? t.color : scored ? '#6a3a31' : '#463c37',
        opacity: dim ? 0.3 : 1,
      }}
      onPointerEnter={(e) => e.pointerType === 'mouse' && onEnter?.()}
      onPointerLeave={(e) => e.pointerType === 'mouse' && onLeave?.()}
    >
      <button
        type="button"
        className={s.cardHead}
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={onToggle}
        onFocus={onFocus}
      >
        {number !== undefined && <span className={s.cardNumber}>{number}</span>}
        <SponsorMark tier={sp.tier} />
        <span className={s.cardHeadText}>
          <span className={s.cardTier} style={{ color: t.color }}>
            {tierLabel(sp)}
          </span>
          <span className={s.cardName}>{sp.name}</span>
          <span className={s.cardSub}>{cardSub(sp)}</span>
        </span>
      </button>
      <div id={bodyId} className={s.cardBody} data-open={open}>
        <div className={s.cardInner}>
          <p className={s.verdict}>{sp.verdict ?? UNRATED_VERDICT}</p>
          {scored && (
            <div className={s.money}>
              <span className={s.moneyLabel}>How much</span>
              {sp.money ? (
                <span className={s.moneyValue}>
                  <span className={s.moneyMain}>{sp.money.main}</span>
                  {sp.money.usd && <span className={s.moneyUsd}>{sp.money.usd}</span>}
                </span>
              ) : (
                <span className={s.moneyMain}>Value not disclosed</span>
              )}
            </div>
          )}
          {scored && sp.money && (
            <span className={s.claimSource}>
              Reported estimate ·{' '}
              {sp.money.source ? <SourceLink source={sp.money.source} /> : <Todo text="add source" />}
            </span>
          )}
          {sp.claims.map((c) => (
            <div key={c.id} className={s.claim}>
              <span className={s.claimText}>{c.text}</span>
              <span className={s.claimSource}>
                {c.source ? <SourceLink source={c.source} /> : <Todo text="add source" />}
              </span>
            </div>
          ))}
          {scored ? (
            <div className={s.cardButtons}>
              <button type="button" className={s.tell} onClick={onTell}>
                Tell the club
              </button>
              <button type="button" className={s.share} onClick={onShare}>
                {shareLabel}
              </button>
            </div>
          ) : sp.tier === 'unrated' ? (
            <Link href="/#contribute" className={`${s.share} ${s.helpRate}`}>
              Help rate this sponsor
            </Link>
          ) : null}
        </div>
        {!open && <div className={s.fade} aria-hidden="true" />}
      </div>
    </article>
  );
}

function SourceLink({ source }: { source: { line: string; url: string | null } }) {
  return (
    <>
      {source.url ? (
        <a href={source.url} target="_blank" rel="noopener noreferrer">
          {source.line}
        </a>
      ) : (
        source.line
      )}
      {!source.url && IS_DEV && (
        <>
          {' '}
          <Todo text="link" />
        </>
      )}
    </>
  );
}

const Todo = ({ text }: { text: string }) => (IS_DEV ? <span className="dev-todo">TODO: {text}</span> : null);
