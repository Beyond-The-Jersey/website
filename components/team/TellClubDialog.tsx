'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import type { SponsorCardView } from '@/lib/data/derive';
import type { ContactChannel } from '@/lib/data/schema';
import { placementLabel } from '@/lib/format';
import s from './Team.module.css';

const CHANNEL_LABEL: Record<ContactChannel['type'], string> = {
  email: 'Email',
  'contact-form': 'Contact form',
  x: 'X',
  instagram: 'Instagram',
  facebook: 'Facebook',
  phone: 'Phone',
  website: 'Website',
};

/** A polite, factual message the fan can edit before sending. Nothing is sent from this site. `shirt` is e.g. '2026/27 home shirt'. */
export function draftMessage(club: string, shirt: string, sp: SponsorCardView): { subject: string; body: string } {
  const who = sp.payer ? ` It is ${sp.payer}.` : '';
  const sources = sp.claims.map((c) => c.source?.url).filter(Boolean);
  const body = [
    `Hello ${club},`,
    '',
    `I'm a supporter. ${sp.name} is on the ${placementLabel(sp.placement, 'short')} of our ${shirt}.${who}`,
    sp.verdict ?? '',
    '',
    `I'd like the club to reconsider this sponsorship.`,
    ...(sources.length ? ['', 'Sources:', ...sources] : []),
  ]
    .filter((l, i, all) => !(l === '' && all[i - 1] === ''))
    .join('\n');
  return { subject: `${sp.name} on our shirt`, body };
}

function channelHref(c: ContactChannel, msg: { subject: string; body: string }): string {
  switch (c.type) {
    case 'email':
      return `mailto:${c.value}?subject=${encodeURIComponent(msg.subject)}&body=${encodeURIComponent(msg.body)}`;
    case 'phone':
      return `tel:${c.value.replace(/[^+\d]/g, '')}`;
    case 'x':
      return `https://x.com/intent/post?text=${encodeURIComponent(`${c.value} ${msg.subject}. I'd like the club to reconsider it.`)}`;
    case 'instagram':
      return `https://www.instagram.com/${c.value.replace(/^@/, '')}/`;
    default:
      return c.value.startsWith('http') ? c.value : `https://${c.value}`;
  }
}

export function TellClubDialog({
  open,
  onClose,
  club,
  shirt,
  sponsor,
  channels,
  checked,
}: {
  open: boolean;
  onClose: () => void;
  club: string;
  shirt: string;
  sponsor: SponsorCardView | null;
  channels: ContactChannel[];
  checked: string | null;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const msg = sponsor ? draftMessage(club, shirt, sponsor) : null;
  return (
    <dialog ref={ref} className={s.dialog} onClose={onClose} aria-labelledby="tell-title">
      <div className={s.dialogInner}>
        <h2 id="tell-title" className={s.dialogTitle}>
          Tell {club}
        </h2>
        {sponsor && msg && channels.length > 0 ? (
          <>
            <p className={s.dialogText}>
              Say it in your own words. Clubs listen when enough supporters say the same thing. Here’s where {club} says
              it reads messages from fans:
            </p>
            <ul className={s.channels}>
              {channels.map((c) => (
                <li key={`${c.type}:${c.value}`} className={s.channel}>
                  <span className={s.channelType}>{c.label ?? CHANNEL_LABEL[c.type]}</span>
                  <a
                    href={channelHref(c, msg)}
                    target={c.type === 'email' || c.type === 'phone' ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    className={s.channelValue}
                  >
                    {c.value}
                  </a>
                  <a href={c.source.url} target="_blank" rel="noopener noreferrer" className={s.channelSource}>
                    Source: {c.source.name}
                  </a>
                </li>
              ))}
            </ul>
            <details className={s.draft}>
              <summary>A message you can start from</summary>
              <pre>{`${msg.subject}\n\n${msg.body}`}</pre>
            </details>
            {checked && <p className={s.dialogNote}>Contacts last checked {checked}.</p>}
          </>
        ) : (
          <p className={s.dialogText}>
            We don’t have a checked contact for {club} yet. We only list contacts the club publishes itself, with a link
            to where it says so.{' '}
            <Link href="/#contribute" className={s.dialogLink}>
              Add one on GitHub →
            </Link>
          </p>
        )}
        <button type="button" className={s.share} onClick={onClose}>
          Close
        </button>
      </div>
    </dialog>
  );
}
