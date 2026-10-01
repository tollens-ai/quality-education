// The palette: a cartoon print of about 1930, a little aged. Warm ink and cream card; each star has
// a colour of his own (Clawd terracotta, Press teal, Stress brass, Guess rose); green and red are
// kept for meaning (a check's flag), so they read at a glance against everything else.
import { mono, hexRgb, toHex, lerp, clamp } from './kit.js';

export const INK = '#1d1612';
export const CREAM = '#f4e6c6';
export const CARD = '#ecd8b0';
export const PAPER = '#e8d3a8';
export const WHITE = '#fdf8ec';

export const CLAWD = '#dc7650';     // Clawd's own terracotta, warmed for the film
export const CLAWD_SH = '#a9533a';
export const CORAL = '#e4613c';
export const TEAL = '#2f8f88';      // Press
export const TEAL_SH = '#1d5e5a';
export const DEEP = '#173f44';
export const MINT = '#a9d8c5';
export const SKY = '#c6e2d6';
export const OCHRE = '#dca43c';     // Stress's brass
export const OCHRE_SH = '#a06c1c';
export const ROSE = '#d6677f';      // Guess
export const ROSE_SH = '#9c4058';
export const PLUM = '#743a5e';
export const PEACH = '#f4b98f';
export const SKIN = '#f6cfa4';
export const SKIN_SH = '#d39a6e';
export const WOOD = '#b77441';
export const WOOD_SH = '#7f4a25';
export const BROWN = '#6e4128';
export const GREEN = '#57a944';     // a check's flag when its rule is met
export const GREEN_SH = '#3a7a2b';
export const RED = '#d5392b';       // a check's flag when it isn't, and alarms
export const RED_SH = '#982218';
export const GOLD = '#ebb942';
export const GOLD_SH = '#b07f1c';
export const GREY = '#8d8a80';
export const TIN = '#9fb3b1';       // the checks' tin
export const TIN_SH = '#647e7c';
export const SLATE = '#3f4a4a';
export const LILAC = '#a990c9';
export const SAGE = '#9cbf8b';

// Colour through the film's drain: in the breakdown every colour sinks to a sepia tone of the same
// lightness, so ink and cream carry the definitions alone.
const SEP0 = hexRgb('#2a1b10'), SEP1 = hexRgb('#f1dfbb');
// Colours marked with a leading '!' (a check's flag, the ball) keep their colour through the drain.
export const KEEP = col => '!' + col;
export function C(col) {
  const m = mono();
  if (typeof col === 'string' && col[0] === '!') return col.slice(1);
  if (!m || typeof col !== 'string' || col[0] !== '#') return col;
  const c = hexRgb(col);
  const l = clamp((0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2]) / 245);
  const s = SEP0.map((v, i) => lerp(v, SEP1[i], l));
  return toHex(c.map((v, i) => lerp(v, s[i], m)));
}
export const sh = (col, k = .3) => { const c = hexRgb(col.replace('!', '')); const d = [42, 22, 18]; return (col[0] === '!' ? '!' : '') + toHex(c.map((v, i) => lerp(v, d[i], k))); };
export const lt = (col, k = .3) => { const c = hexRgb(col.replace('!', '')); const w = [255, 246, 226]; return (col[0] === '!' ? '!' : '') + toHex(c.map((v, i) => lerp(v, w[i], k))); };
