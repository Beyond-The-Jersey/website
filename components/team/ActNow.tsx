'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { fill, TEAM_COPY } from '@/lib/copy/team-page';
import { FOLLOW_ROW, repoHref } from '@/lib/config';
import type { ActView } from '@/lib/data/team';
import { TIERS } from '@/lib/levels';
import { buildMessage, mailtoHref } from '@/lib/messages';
import { BellIcon, MailIcon, PeopleIcon, SearchIcon, ShareIcon } from './icons';
import s from './Act.module.css';

const C = TEAM_COPY.act;

/** A native <dialog>, opened as a modal while `open` is true. Esc and the close button close it. */
function Dialog({
  open,
  onClose,
  labelledBy,
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={s.dialog}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={s.dialogBody}>{children}</div>
    </dialog>
  );
}

function MoreRow({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action: ReactNode }) {
  return (
    <div className={s.moreRow}>
      <span className={s.iconTile} aria-hidden="true">
        {icon}
      </span>
      <span className={s.moreText}>
        <span className={s.moreTitle}>{title}</span>
        <span className={s.moreBody}>{text}</span>
      </span>
      {action}
    </div>
  );
}

/** "What you can do": always about today's shirt, whichever season is on screen. */
export function ActNow({
  act,
  club,
  factSheetHref,
}: {
  act: ActView;
  club: { name: string; shortName: string };
  factSheetHref: string;
}) {
  const name = club.shortName;
  const [ticked, setTicked] = useState(() => new Set(act.raise.filter((r) => r.flagged).map((r) => r.sponsorId)));
  const [writing, setWriting] = useState(false);
  const [following, setFollowing] = useState(false);
  const [draftOpen, setDraftOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  // The toast lives in <body>: the columns are size containers, which can trap position: fixed.
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- portal target exists only in the browser
  useEffect(() => setMounted(true), []);

  const chosen = act.raise.filter((r) => ticked.has(r.sponsorId));
  const message = useMemo(
    () =>
      buildMessage(
        club.name,
        act.raise.filter((r) => ticked.has(r.sponsorId)).map((r) => r.message),
      ),
    [act.raise, club.name, ticked],
  );
  const label =
    chosen.length === 0
      ? C.tell.buttonNone
      : chosen.length === 1
        ? fill(C.tell.buttonOne, { club: name, sponsor: chosen[0].name })
        : fill(C.tell.buttonMany, { club: name, n: chosen.length });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const toggle = (id: string) =>
    setTicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const write = () => {
    if (!message) return;
    if (act.contact.email) window.location.href = mailtoHref(act.contact.email, message);
    else {
      setCopied(false);
      setWriting(true);
    }
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(textRef.current?.value ?? message?.body ?? '');
      setCopied(true);
    } catch {
      textRef.current?.select();
    }
  };

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: act.share.title, text: act.share.text, url });
      } catch {
        // Cancelled by the user.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setToast(C.linkCopied);
    } catch {
      setToast(url);
    }
  };

  return (
    <section aria-labelledby="act-title" className={s.act}>
      <div className={s.head}>
        <span className={s.kicker}>{C.kicker}</span>
        <h2 id="act-title" className={s.title}>
          {C.title}
        </h2>
        <p className={s.intro}>
          {fill(C.intro, { club: name })}
          {act.examples ? `: ${act.examples}. ` : '. '}
          <Link href="/#dropped" className={s.introLink}>
            {C.introLink}
          </Link>
        </p>
      </div>

      {act.raise.length > 0 && (
        <article className={s.tell} aria-labelledby="tell-title">
          <div className={s.tellMain}>
            <div className={s.tellHead}>
              <span className={s.iconTile} aria-hidden="true">
                <MailIcon />
              </span>
              <h3 id="tell-title" className={s.tellTitle}>
                {fill(C.tell.title, { club: name })}
              </h3>
            </div>
            <p className={s.tellText}>
              {act.contact.kind === 'supporter-liaison'
                ? C.tell.text
                : act.contact.kind === 'general'
                  ? C.tell.textGeneral
                  : C.tell.textNoAddress}
            </p>
            <fieldset className={s.raise}>
              <legend className={s.label}>{C.tell.raiseLabel}</legend>
              {act.raise.map((r) =>
                r.flagged ? (
                  <label key={r.sponsorId} className={s.check}>
                    <input
                      type="checkbox"
                      checked={ticked.has(r.sponsorId)}
                      onChange={() => toggle(r.sponsorId)}
                      aria-label={`Include ${r.name} in the message to ${name}`}
                    />
                    <strong>{r.name}</strong>
                    <span style={{ color: TIERS[r.tier].color }}>· {TIERS[r.tier].label}</span>
                  </label>
                ) : (
                  <label key={r.sponsorId} className={`${s.check} ${s.checkOff}`}>
                    <input type="checkbox" disabled aria-label={`${r.name} can’t be included until it is rated`} />
                    <strong>{r.name}</strong>
                    <span>{C.tell.unratedSuffix}</span>
                  </label>
                ),
              )}
            </fieldset>
            <button type="button" className={s.write} disabled={!message} onClick={write}>
              {label}
            </button>
          </div>
          <div className={s.draftCol}>
            <span className={s.label} id="draft-label">
              {C.tell.draftLabel}
            </span>
            <div
              className={`${s.draft} ${draftOpen ? s.draftOpen : ''}`}
              aria-labelledby="draft-label"
              role="region"
              data-draft
            >
              {message ? message.body : <span className={s.draftEmpty}>{C.tell.draftEmpty}</span>}
            </div>
            {message && (
              <button type="button" className={s.draftToggle} onClick={() => setDraftOpen((o) => !o)}>
                {draftOpen ? C.tell.draftLess : C.tell.draftMore}
              </button>
            )}
          </div>
        </article>
      )}

      <div className={s.more}>
        <span className={`${s.label} ${s.moreLabel}`}>{C.moreLabel}</span>
        <MoreRow
          icon={<ShareIcon />}
          title={fill(C.more.share.title, { club: name })}
          text={C.more.share.text}
          action={
            <button type="button" className={s.outline} onClick={share}>
              {C.more.share.button}
            </button>
          }
        />
        <MoreRow
          icon={<PeopleIcon />}
          title={C.more.group.title}
          text={C.more.group.text}
          action={
            <Link href={factSheetHref} className={s.outline}>
              {C.more.group.button}
            </Link>
          }
        />
        {act.check && (
          <MoreRow
            icon={<SearchIcon />}
            title={
              act.check.kind === 'club'
                ? fill(C.more.checkClub.title, { club: act.check.name })
                : fill(C.more.check.title, { sponsor: act.check.name })
            }
            text={
              act.check.kind === 'club'
                ? fill(C.more.checkClub.text, { club: act.check.name })
                : fill(C.more.check.text, { sponsor: act.check.name })
            }
            action={
              <a href={act.check.href} className={s.outline}>
                {C.more.check.button}
              </a>
            }
          />
        )}
        {FOLLOW_ROW && (
          <MoreRow
            icon={<BellIcon />}
            title={fill(C.more.follow.title, { club: name })}
            text={C.more.follow.text}
            action={
              <button type="button" className={s.outline} onClick={() => setFollowing(true)}>
                {fill(C.more.follow.button, { club: name })}
              </button>
            }
          />
        )}
      </div>

      <Dialog open={writing} onClose={() => setWriting(false)} labelledBy="write-title">
        <h2 id="write-title" className={s.dialogTitle}>
          {fill(C.writeDialog.title, { club: name })}
        </h2>
        {!act.contact.email && <p className={s.dialogText}>{fill(C.writeDialog.noAddress, { club: name })}</p>}
        {message && (
          <label className={s.dialogField}>
            <span className={s.label}>{C.tell.draftLabel}</span>
            <textarea key={message.body} ref={textRef} className={s.textarea} defaultValue={message.body} rows={12} />
          </label>
        )}
        <div className={s.dialogActions}>
          <button type="button" className={s.primary} onClick={copyMessage}>
            {copied ? C.writeDialog.copied : C.writeDialog.copy}
          </button>
          {act.contact.url && (
            <a href={act.contact.url} className={s.outline} target="_blank" rel="noopener noreferrer">
              {fill(C.writeDialog.contactPage, { club: name })}
            </a>
          )}
          <button type="button" className={s.outline} onClick={() => setWriting(false)}>
            {C.writeDialog.close}
          </button>
        </div>
      </Dialog>

      <Dialog open={following} onClose={() => setFollowing(false)} labelledBy="follow-title">
        <h2 id="follow-title" className={s.dialogTitle}>
          {fill(C.followDialog.title, { club: name })}
        </h2>
        <p className={s.dialogText}>{C.followDialog.text}</p>
        <div className={s.dialogActions}>
          <a href={repoHref()} className={s.primary}>
            {C.followDialog.link}
          </a>
          <button type="button" className={s.outline} onClick={() => setFollowing(false)}>
            {C.followDialog.close}
          </button>
        </div>
      </Dialog>

      {mounted &&
        createPortal(
          <div className={s.toastRegion} aria-live="polite">
            {toast && <span className={s.toast}>{toast}</span>}
          </div>,
          document.body,
        )}
    </section>
  );
}
