// The lettering: cream title-card letters with a brush outline and a hard drop shadow, each letter
// inked a little differently and jiggling as the drawing boils. Corben (a soft, fat serif of the
// Cooper kind) for the refrains and titles; Lilita One (rounded and condensed) for the patter.
import { TAU, clamp, lerp, noise, boil, hash } from './kit.js';
import { INK, CREAM, CORAL, C } from './palette.js';

export const DISPLAY = 'Corben', PATTER = 'Lilita';
const widthCache = new Map();
export function textW(g, s, font, size) {
  const k = font + '|' + s;
  let w = widthCache.get(k);
  if (w === undefined) { g.save(); g.font = `100px ${font}`; w = g.measureText(s).width / 100; g.restore(); widthCache.set(k, w); }
  return w * size;
}

// One word, its baseline's left end at (x, y). o: fill, ink, shadow (colour or null), sh (shadow
// offset in em), ow (outline width in em), jig (letter wobble, 0..1), seed, sq (squash), alpha.
export function word(g, s, x, y, size, font, o = {}) {
  const fill = C(o.fill || CREAM), ink = C(o.ink || INK), sh = o.sh ?? .075, ow = o.ow ?? .15, jig = o.jig ?? 1;
  const seed = (o.seed ?? 1) + boil() * 17.3;
  g.save();
  g.font = `${size}px ${font}`; g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.lineJoin = 'round'; g.miterLimit = 2;
  const chars = [...s];
  const xs = [];
  let acc = 0;
  for (let i = 0; i < chars.length; i++) { xs.push(acc); acc = textW(g, chars.slice(0, i + 1).join(''), font, size); }
  const pass = (mode) => {
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i]; if (ch === ' ') continue;
      const cw = textW(g, ch, font, size);
      const r = noise(i * 1.7, seed) * .045 * jig, dy = noise(i * 2.3, seed + 5) * size * .018 * jig;
      g.save();
      g.translate(x + xs[i] + cw / 2, y + dy);
      g.rotate(r);
      if (mode === 0) { g.fillStyle = C(o.shadow || INK); g.fillText(ch, -cw / 2 + size * sh * .8, size * sh); }
      if (mode === 1) { g.lineWidth = size * ow * (1 + noise(i, seed + 9) * .12 * jig); g.strokeStyle = ink; g.strokeText(ch, -cw / 2, 0); }
      if (mode === 2) { g.fillStyle = typeof o.fillAt === 'function' ? o.fillAt(i) : fill; g.fillText(ch, -cw / 2, 0); }
      g.restore();
    }
  };
  if (o.shadow !== null) pass(0);
  if (ow > 0) pass(1);
  pass(2);
  g.restore();
  return acc;
}

// Plain lettering for signs, labels and screens: a single colour with an optional outline.
export function label(g, s, x, y, size, o = {}) {
  g.save();
  g.font = `${size}px ${o.font || PATTER}`; g.textAlign = o.align || 'center'; g.textBaseline = o.base || 'middle';
  if (o.rot) { g.translate(x, y); g.rotate(o.rot); x = 0; y = 0; }
  if (o.ow) { g.lineJoin = 'round'; g.lineWidth = size * o.ow; g.strokeStyle = C(o.ink || INK); g.strokeText(s, x, y); }
  g.fillStyle = C(o.col || INK); g.fillText(s, x, y);
  g.restore();
}
// Fit a label into width w: returns the size to use (no bigger than `size`).
export function fitSize(g, s, font, size, w) { return Math.min(size, size * w / Math.max(1, textW(g, s, font, size))); }
