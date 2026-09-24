import { describe, expect, it } from 'vitest';
import { heading, type Aim } from '@/components/team/hoverIntent';

// A card at x 100–380, y 200–358; the pointer left a logo at (600, 300), to the right of it.
const aim: Aim = { id: 'x', x: 600, y: 300, l: 100, t: 200, r: 380, b: 358 };

describe('hover intent', () => {
  it('counts the card grown by 16px as heading there', () => {
    expect(heading(aim, 390, 210)).toBe(true);
    expect(heading(aim, 90, 370)).toBe(true);
  });

  it('counts the triangle between the leave point and the card', () => {
    expect(heading(aim, 500, 290)).toBe(true);
    expect(heading(aim, 450, 250)).toBe(true);
  });

  it('treats moving away as turning away', () => {
    expect(heading(aim, 650, 300)).toBe(false);
    expect(heading(aim, 500, 100)).toBe(false);
    expect(heading(aim, 500, 480)).toBe(false);
  });
});
