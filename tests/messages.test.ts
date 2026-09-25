import { describe, expect, it } from 'vitest';
import { buildMessage, mailtoHref, type MessageSponsor } from '@/lib/messages';

const emirates: MessageSponsor = {
  name: 'Emirates',
  placement: 'front',
  ownerVerb: 'owned by',
  owner: 'the Government of Dubai',
  messageLine: 'In 2024, 43 activists in the UAE got life sentences in one mass trial.',
};
const rwanda: MessageSponsor = {
  name: 'Visit Rwanda',
  placement: 'sleeve',
  ownerVerb: 'paid for by',
  owner: 'the Government of Rwanda',
  messageLine: 'UN experts say 3,000–4,000 Rwandan troops are fighting alongside M23 rebels in eastern Congo.',
};

describe('buildMessage', () => {
  it('writes the design’s draft for one sponsor', () => {
    expect(buildMessage('Arsenal', [emirates])).toEqual({
      subject: 'A question about our shirt sponsor',
      body: [
        'Dear Arsenal,',
        'I’ve supported the club for years and I’m proud of our shirt. But our front sponsor, Emirates, is owned by the Government of Dubai. In 2024, 43 activists in the UAE got life sentences in one mass trial.',
        'Please don’t let our shirt be used to cover for that. When the deal is next reviewed, please look for a sponsor every fan can be proud of.',
        'Thank you,\nA supporter',
      ].join('\n\n'),
    });
  });

  it('gives each further sponsor its own paragraph', () => {
    const body = buildMessage('Arsenal', [emirates, rwanda])!.body.split('\n\n');
    expect(body[2]).toBe(
      'Our sleeve sponsor, Visit Rwanda, is paid for by the Government of Rwanda. UN experts say 3,000–4,000 Rwandan troops are fighting alongside M23 rebels in eastern Congo.',
    );
    expect(body).toHaveLength(5);
  });

  it('leaves out a missing message line and never invents an owner', () => {
    const body = buildMessage('Arsenal', [{ ...emirates, messageLine: null }])!.body;
    expect(body).toContain('But our front sponsor, Emirates, is owned by the Government of Dubai.\n\n');
    const noOwner = buildMessage('Arsenal', [{ ...emirates, owner: null, messageLine: null }])!.body;
    expect(noOwner).toContain('But our front sponsor is Emirates.\n\n');
    expect(noOwner).not.toContain('owned by');
  });

  it('returns null when nothing is ticked', () => {
    expect(buildMessage('Arsenal', [])).toBeNull();
  });

  it('encodes a mailto link', () => {
    const href = mailtoHref('slo@club.test', buildMessage('Arsenal', [emirates])!);
    expect(href.startsWith('mailto:slo@club.test?subject=A%20question')).toBe(true);
    expect(decodeURIComponent(href.split('&body=')[1])).toContain('Dear Arsenal,');
  });
});
