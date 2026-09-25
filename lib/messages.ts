// The "Tell {club}" draft message (UPDATE.md §7.5). Pure, so the page and the tests share it.
import { fill, TEAM_COPY } from './copy/team-page';

export interface MessageSponsor {
  name: string;
  /** Lowercase: 'front', 'back', 'sleeve'. */
  placement: string;
  /** 'owned by' or 'paid for by'. */
  ownerVerb: string;
  /** The direct owner, e.g. 'Government of Dubai'. */
  owner: string | null;
  /** The one sentence about the owner's record; left out when missing. */
  messageLine: string | null;
}

export interface Message {
  subject: string;
  body: string;
}

const M = TEAM_COPY.message;

function paragraph(template: string, sp: MessageSponsor): string {
  const vars = {
    placement: sp.placement,
    sponsor: sp.name,
    ownerVerb: sp.ownerVerb,
    owner: sp.owner ?? '',
    messageLine: sp.messageLine ?? '',
  };
  // Without a known owner, say only what we know: 'our front sponsor, X, …' becomes 'our front sponsor is X.'
  const text = sp.owner
    ? fill(template, vars)
    : fill(template.replace(/, \{sponsor\}, is \{ownerVerb\} the \{owner\}\./, ' is {sponsor}.'), vars);
  return text.trim();
}

/** The draft for the ticked sponsors, in list order. Null when nothing is ticked. */
export function buildMessage(club: string, sponsors: MessageSponsor[]): Message | null {
  if (sponsors.length === 0) return null;
  const [first, ...rest] = sponsors;
  const body = [
    fill(M.greeting, { club }),
    `${M.opening} ${paragraph(M.sponsorParagraph, first)}`,
    ...rest.map((sp) => paragraph(M.sponsorParagraphNext, sp)),
    M.ask,
    M.signoff,
  ].join('\n\n');
  return { subject: M.subject, body };
}

/** mailto: link with the subject and body filled in. */
export function mailtoHref(email: string, msg: Message): string {
  return `mailto:${email}?subject=${encodeURIComponent(msg.subject)}&body=${encodeURIComponent(msg.body)}`;
}
