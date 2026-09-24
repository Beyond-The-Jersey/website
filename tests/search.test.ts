import { beforeAll, describe, expect, it } from 'vitest';
import { loadDataset } from '@/lib/data';
import { buildSearchIndex } from '@/lib/data/search-index';
import { DirectorySource, SEED_DIR } from '@/lib/data/source';
import { search, type SearchEntry } from '@/lib/search';

let index: SearchEntry[];
beforeAll(async () => {
  const { dataset } = await loadDataset({ source: new DirectorySource('seed', SEED_DIR) });
  index = buildSearchIndex(dataset);
});

const labels = (q: string) => search(index, q).map((e) => e.label);

// The examples from handover/docs/06-interactions.md §1.
describe('search', () => {
  it('man → both Manchester clubs', () => {
    expect(labels('man')).toEqual(['Manchester City', 'Manchester United']);
  });

  it('rwanda → Visit Rwanda, then the clubs it sponsors', () => {
    expect(labels('rwanda')).toEqual([
      'Visit Rwanda',
      'Aston Villa',
      'Atlético de Madrid',
      'Paris Saint-Germain',
      'LA Clippers',
      'Los Angeles Rams',
    ]);
  });

  it('emir → Emirates, Arsenal, Real Madrid', () => {
    expect(labels('emir')).toEqual(['Emirates', 'Arsenal', 'Real Madrid']);
  });

  it('nba → NBA, LA Clippers, Basketball', () => {
    expect(labels('nba')).toEqual(['NBA', 'LA Clippers', 'Basketball']);
    expect(search(index, 'nba').map((e) => e.type)).toEqual(['league', 'club', 'sport']);
  });

  it('f1 → Formula 1, Motorsport', () => {
    expect(labels('f1')).toEqual(['Formula 1', 'Motorsport']);
  });

  it('spurs → Tottenham Hotspur', () => {
    expect(labels('spurs')).toEqual(['Tottenham Hotspur']);
  });

  it.each(['atletico', 'atlético', '  ATLÉTICO '])('%s → Atlético first, then its sponsors', (q) => {
    expect(labels(q)).toEqual(['Atlético de Madrid', 'Visit Rwanda', 'Riyadh Air', 'Kraken']);
  });

  it('villa → Aston Villa first', () => {
    expect(labels('villa')[0]).toBe('Aston Villa');
  });

  it('xyz → nothing', () => {
    expect(labels('xyz')).toEqual([]);
  });

  it('empty query → popular right now', () => {
    expect(labels('')).toEqual(['Arsenal', 'Premier League', 'Visit Rwanda', 'Atlético de Madrid', 'Motorsport']);
  });

  it('describes entries like the design', () => {
    const get = (l: string) => index.find((e) => e.label === l)!;
    expect(get('Aston Villa').description).toBe('Premier League · Visit Rwanda on the front');
    expect(get('Atlético de Madrid').description).toBe('La Liga · Riyadh Air on the front, Visit Rwanda on the back');
    expect(get('Liverpool').description).toBe('Premier League · Turkish Airlines from 2027/28');
    expect(get('Paris Saint-Germain').description).toBe('Ligue 1 · Visit Rwanda until 2028');
    expect(get('Schalke 04').description).toBe('Germany');
    expect(get('Premier League').description).toBe('Soccer · 20 clubs · 5 rated');
    expect(get('Premier League').rating).toEqual({ kind: 'status', text: '4 of 20 bad' });
    expect(get('Bundesliga').rating).toEqual({ kind: 'status', text: 'Not mapped yet' });
    expect(get('Soccer').description).toBe('7 clubs rated in 2 leagues');
    expect(get('Basketball').description).toBe('NBA, Basketball Africa League');
    expect(get('Emirates').description).toBe('Government of Dubai · Arsenal, Real Madrid');
    expect(get('Turkish Airlines').rating).toEqual({ kind: 'tier', tier: 'unrated', label: 'Being rated' });
    expect(get('Aston Villa').href).toBe('/clubs/aston-villa/');
    expect(get('Chelsea').href).toBe('/soccer/premier-league/');
  });
});
