// The palette: two-colour cartoon film. Orange-red and blue-green do most of the work, over cream
// card and warm ink, with ochre and rose for the crew. Greens and reds that carry meaning (a
// check's flag) are kept apart from the teal so they read at a glance.
import { mono, hexRgb, toHex, lerp, clamp } from './kit.js';

export const INK = '#1c1410';
export const CREAM = '#f6e9cb';
export const CARD = '#efdcb4';
export const PAPER = '#e9d3a6';
export const WHITE = '#fffaf0';

export const CLAWD = '#dd7550';     // Clawd's own terracotta, warmed for the film
export const CLAWD_SH = '#b25537';
export const CORAL = '#e4613c';
export const TEAL = '#2c8c85';
export const TEAL_SH = '#1f6560';
export const DEEP = '#173f44';
export const MINT = '#a8d8c6';
export const SKY = '#c4e3d6';
export const OCHRE = '#dca23c';
export const OCHRE_SH = '#a9761f';
export const ROSE = '#d45f78';
export const ROSE_SH = '#9e3f58';
export const PLUM = '#7e3d62';
export const PEACH = '#f4b98f';
export const SKIN = '#f5cfa6';
export const SKIN_SH = '#d9a57a';
export const WOOD = '#b77441';
export const WOOD_SH = '#8a5129';
export const BROWN = '#6e4128';
export const GREEN = '#58a843';     // a check's flag when its rule is met
export const GREEN_SH = '#3c7a2c';
export const RED = '#d23a2c';       // a check's flag when it isn't, and alarms
export const RED_SH = '#9a2319';
export const GOLD = '#e8b640';
export const GREY = '#8d8a80';
export const SLATE = '#3f4a4a';

// Colour through the film's drain: in the a cappella breakdown every colour sinks to a sepia tone
// of the same lightness, so ink and cream carry the definitions alone.
const SEP0 = hexRgb(INK), SEP1 = hexRgb(CREAM);
// Colours marked with a leading '!' (a check's flag, the ball) keep their colour through the drain.
export const KEEP = col => '!' + col;
export function C(col) {
  const m = mono();
  if (typeof col === 'string' && col[0] === '!') return col.slice(1);   // a colour that keeps its meaning
  if (!m || typeof col !== 'string' || col[0] !== '#') return col;
  const c = hexRgb(col);
  const l = clamp((0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2]) / 245);
  const s = SEP0.map((v, i) => lerp(v, SEP1[i], l));
  return toHex(c.map((v, i) => lerp(v, s[i], m)));
}
