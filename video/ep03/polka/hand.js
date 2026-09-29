// The film's alphabet: a child's careful capitals, drawn with the pencil, each letter a few strokes
// in writing order so a word can be written on as it is sung. Cap height is 100 units; `adv` is a
// letter's width including its gap. Strokes are polylines (`s: true` for the ones that curve).
//
// `write()` draws a string: each letter tilted, lifted and sized a little differently, as printed by a
// hand, and each dancing to the beat if asked. `bubble` writes outlined letters, coloured in.
import { clamp, lerp, hash, noise, TAU, pulseK } from './kit.js';
import { line } from './pencil.js';

const S = true;
const P = (adv, ...strokes) => ({ adv, strokes: strokes.map(p => Array.isArray(p[0]) ? { p } : p) });
const C = (...p) => ({ p, s: S });
const GLYPHS = {
  A: P(72, [[4, 100], [36, 2], [68, 100]], [[16, 68], [56, 66]]),
  B: P(66, [[8, 0], [8, 100]], C([8, 2], [38, 0], [54, 12], [52, 32], [36, 47], [8, 49]), C([8, 50], [42, 51], [60, 66], [58, 88], [40, 99], [8, 98])),
  C: P(68, C([64, 20], [50, 4], [30, 0], [12, 14], [6, 50], [12, 86], [30, 100], [50, 96], [64, 80])),
  D: P(68, [[8, 0], [8, 100]], C([8, 2], [40, 4], [60, 24], [62, 52], [56, 78], [38, 96], [8, 98])),
  E: P(60, [[56, 4], [10, 2], [10, 98], [58, 98]], [[10, 50], [46, 50]]),
  F: P(56, [[54, 4], [10, 2], [10, 100]], [[10, 50], [44, 50]]),
  G: P(70, C([64, 22], [50, 4], [30, 0], [12, 14], [6, 50], [12, 86], [30, 100], [52, 94], [62, 70], [62, 54]), [[62, 54], [38, 54]]),
  H: P(66, [[10, 0], [10, 100]], [[56, 0], [56, 100]], [[10, 50], [56, 50]]),
  I: P(30, [[15, 0], [15, 100]], { p: [[4, 2], [26, 2]], sf: true }, { p: [[4, 98], [26, 98]], sf: true }),
  J: P(54, C([44, 2], [44, 68], [36, 94], [20, 99], [6, 86]), [[28, 2], [56, 2]]),
  K: P(62, [[10, 0], [10, 100]], [[56, 2], [12, 56], [58, 100]]),
  L: P(56, [[10, 0], [10, 98], [54, 98]]),
  M: P(80, [[8, 100], [8, 2], [40, 70], [72, 2], [72, 100]]),
  N: P(66, [[8, 100], [8, 2], [58, 98], [58, 0]]),
  O: P(72, C([36, 0], [58, 10], [64, 50], [58, 90], [36, 100], [14, 90], [8, 50], [14, 10], [38, 1], [50, 5])),
  P: P(62, [[10, 0], [10, 100]], C([10, 2], [42, 2], [58, 16], [56, 36], [40, 50], [10, 50])),
  Q: P(74, C([36, 0], [58, 10], [64, 50], [58, 90], [36, 100], [14, 90], [8, 50], [14, 10], [38, 1], [50, 5]), [[44, 72], [68, 102]]),
  R: P(64, [[10, 0], [10, 100]], C([10, 2], [42, 2], [58, 16], [56, 36], [40, 50], [10, 50]), [[34, 52], [60, 100]]),
  S: P(62, C([58, 18], [44, 3], [26, 2], [12, 14], [14, 32], [32, 46], [52, 60], [54, 80], [40, 97], [20, 99], [6, 84])),
  T: P(64, [[4, 3], [60, 3]], [[32, 3], [32, 100]]),
  U: P(66, C([8, 0], [8, 66], [16, 92], [34, 100], [52, 92], [58, 66], [58, 0])),
  V: P(68, [[4, 0], [34, 100], [64, 0]]),
  W: P(88, [[4, 0], [22, 100], [44, 24], [66, 100], [84, 0]]),
  X: P(64, [[6, 0], [58, 100]], [[58, 0], [6, 100]]),
  Y: P(64, [[4, 0], [32, 52], [60, 0]], [[32, 52], [32, 100]]),
  Z: P(64, [[6, 3], [58, 3], [8, 97], [60, 98]]),
  '0': P(58, C([28, 0], [48, 12], [52, 50], [46, 90], [28, 100], [10, 90], [6, 50], [10, 12], [30, 1], [42, 4])),
  '1': P(40, [[8, 24], [26, 2], [26, 100]], [[10, 98], [42, 98]]),
  '2': P(58, C([8, 24], [20, 4], [40, 4], [52, 20], [46, 42], [10, 98], [56, 98])),
  '3': P(58, C([8, 12], [28, 0], [48, 10], [44, 36], [26, 48], [50, 60], [54, 84], [34, 100], [8, 90])),
  '4': P(58, [[44, 100], [44, 0], [6, 68], [56, 68]]),
  '5': P(58, [[52, 2], [14, 2], [10, 46]], C([10, 46], [30, 38], [52, 52], [54, 80], [34, 99], [8, 92])),
  '6': P(58, C([48, 10], [30, 0], [10, 30], [8, 70], [20, 98], [42, 98], [54, 76], [40, 52], [18, 58])),
  '7': P(56, [[6, 3], [54, 3], [22, 100]]),
  '8': P(58, C([30, 48], [10, 38], [12, 14], [30, 2], [48, 14], [50, 38], [30, 48], [8, 62], [8, 88], [30, 100], [52, 88], [52, 62], [30, 48])),
  '9': P(58, C([12, 88], [32, 100], [52, 70], [50, 30], [38, 2], [16, 2], [6, 24], [18, 48], [42, 44])),
  '.': P(24, C([12, 92], [17, 96], [12, 101], [7, 96], [12, 92])),
  ',': P(24, C([12, 90], [17, 95], [12, 101], [6, 112])),
  '!': P(30, [[15, 0], [15, 66]], C([15, 90], [20, 95], [15, 101], [10, 95], [15, 90])),
  '?': P(52, C([6, 22], [16, 4], [34, 2], [46, 18], [40, 40], [26, 54], [26, 68]), C([26, 90], [31, 95], [26, 101], [21, 95], [26, 90])),
  "'": P(22, [[11, 0], [8, 24]]),
  '"': P(34, [[9, 0], [7, 22]], [[24, 0], [22, 22]]),
  ':': P(24, C([12, 24], [17, 29], [12, 35], [7, 29], [12, 24]), C([12, 84], [17, 89], [12, 95], [7, 89], [12, 84])),
  ';': P(24, C([12, 24], [17, 29], [12, 35], [7, 29], [12, 24]), C([12, 82], [17, 87], [12, 93], [6, 106])),
  '-': P(38, [[5, 56], [31, 54]]),
  '(': P(32, C([26, 0], [10, 30], [10, 70], [26, 100])),
  ')': P(32, C([6, 0], [22, 30], [22, 70], [6, 100])),
  '&': P(70, C([58, 100], [20, 44], [24, 16], [40, 4], [54, 18], [44, 40], [12, 66], [10, 88], [30, 100], [52, 86], [62, 62])),
  '/': P(40, [[6, 102], [34, -2]]),
  '+': P(52, [[26, 30], [26, 82]], [[4, 56], [48, 56]]),
  '=': P(52, [[6, 40], [46, 38]], [[6, 70], [46, 72]]),
  '%': P(70, [[56, 2], [12, 98]], C([14, 8], [22, 14], [16, 26], [8, 18], [14, 8]), C([54, 74], [62, 80], [56, 92], [48, 84], [54, 74])),
  '*': P(48, [[24, 24], [24, 76]], [[4, 36], [44, 64]], [[44, 36], [4, 64]]),
  '#': P(60, [[20, 14], [14, 90]], [[44, 10], [38, 86]], [[6, 38], [54, 34]], [[4, 64], [52, 60]]),
  '$': P(58, C([48, 22], [34, 8], [16, 14], [14, 32], [30, 48], [46, 62], [46, 84], [28, 96], [8, 84]), [[28, -6], [28, 108]]),
  '~': P(60, C([4, 60], [16, 46], [30, 60], [44, 46], [56, 58])),
  ' ': P(34),
};
GLYPHS['…'] = P(66, C([12, 92], [17, 96], [12, 101], [7, 96], [12, 92]), C([34, 92], [39, 96], [34, 101], [29, 96], [34, 92]), C([56, 92], [61, 96], [56, 101], [51, 96], [56, 92]));
GLYPHS['’'] = GLYPHS["'"];
GLYPHS['“'] = GLYPHS['"'];
GLYPHS['”'] = GLYPHS['"'];
GLYPHS['−'] = GLYPHS['-'];
GLYPHS['∴'] = P(60, C([30, 22], [36, 28], [30, 34], [24, 28], [30, 22]), C([10, 74], [16, 80], [10, 86], [4, 80], [10, 74]), C([50, 74], [56, 80], [50, 86], [44, 80], [50, 74]));

const glyph = ch => GLYPHS[ch] || GLYPHS[ch.toUpperCase()] || GLYPHS['?'];

// The length of a stroke in glyph units, for writing on.
function slen(pts) { let d = 0; for (let i = 1; i < pts.length; i++) d += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return d; }

// Width of a string at a cap height.
export function measure(str, size, track = 0) {
  let x = 0;
  for (const ch of str) x += (glyph(ch).adv + track) * size / 100;
  return x - track * size / 100;
}

// Lay a string out: one entry per letter, with its left edge, size and the little differences that
// make it hand-printed. The differences are fixed for a given (seed, index), not the boil.
export function layout(str, size, o = {}) {
  const { track = 4, seed = 1, wonk = 1 } = o;
  const out = [];
  let x = 0;
  let i = 0;
  for (const ch of str) {
    const gl = glyph(ch);
    const k = hash(seed, i, 3), k2 = hash(seed, i, 4), k3 = hash(seed, i, 5);
    out.push({
      ch, gl, x, size: size * (1 + (k - .5) * .1 * wonk), rot: (k2 - .5) * .12 * wonk, dy: (k3 - .5) * .06 * size * wonk, len: gl.strokes.reduce((a, s) => a + slen(s.p), 0),
    });
    x += (gl.adv + track) * size / 100;
    i++;
  }
  return { letters: out, width: x - track * size / 100 };
}

// Write a string with its left edge at x (or centred/right), baseline at y.
//   size      cap height in px         col    the pencil          w   stroke width as a fraction of size (.075)
//   prog      0..1, how much has been written (write-on)          from   0..1 start of what's drawn
//   dance     amplitude of each letter's bounce (px), beat is 0..1 phase, pulse is a 0..1 hit strength
//   bubble    {fill, edge}: outlined block letters, coloured in
export function write(g, str, x, y, size, o = {}) {
  const { col = '#2b2a33', w = .095, seed = 1, t = 0, prog = 1, from = 0, align = 'left', track = 4, wonk = 1, dance = 0, beat = 0, pulse = 0, bubble = null, alpha = .95, rot = 0, tip = null } = o;
  const L = layout(str, size, { track, seed, wonk });
  const total = L.letters.reduce((a, l) => a + l.len, 0) || 1;
  let ox = align === 'center' ? x - L.width / 2 : align === 'right' ? x - L.width : x;
  g.save();
  if (rot) { g.translate(x, y); g.rotate(rot); g.translate(-x, -y); }
  let acc = 0;
  for (let i = 0; i < L.letters.length; i++) {
    const l = L.letters[i];
    const a0 = acc / total, a1 = (acc + l.len) / total;
    acc += l.len;
    if (l.ch === ' ') continue;
    const u0 = clamp((from - a0) / (a1 - a0 || 1)), u1 = clamp((prog - a0) / (a1 - a0 || 1));
    if (u1 <= 0 || u0 >= 1) continue;
    const s = l.size / 100;
    const bob = dance ? -Math.abs(Math.sin((beat + hash(seed, i, 9) * .5) * Math.PI)) * dance * (.5 + pulse * .8) : 0;
    const sway = dance ? Math.sin((beat * TAU) + i * .7) * .045 * (dance / 12) : 0;
    g.save();
    g.translate(ox + l.x, y + l.dy + bob);
    g.rotate(l.rot + sway);
    g.scale(s, s);
    // The strokes, in writing order, each with its share of the write-on.
    let sacc = 0;
    const lw = size * w / s;
    const wp = 1.7 / s;  // the hand's wander, in px
    for (let si = 0; si < l.gl.strokes.length; si++) {
      const st = l.gl.strokes[si];
      const sl = slen(st.p);
      const b0 = sacc / (l.len || 1), b1 = (sacc + sl) / (l.len || 1);
      sacc += sl;
      const f0 = clamp((u0 - b0) / (b1 - b0 || 1)), f1 = clamp((u1 - b0) / (b1 - b0 || 1));
      if (f1 <= f0 || f1 <= 0) continue;
      const pts = st.p.map(p => [p[0], p[1] - 100]);
      if (bubble && st.sf) continue;
      if (bubble) {
        line(g, pts, { w: lw * (bubble.e || 2.05), col: bubble.edge || '#2b2a33', seed: seed * 31 + i * 7 + si, t, from: f0, to: f1, spline: !!st.s, wob: wp * .7, passes: 1, flat: true, alpha: 1, tooth: .8 });
        line(g, pts, { w: lw * (bubble.f || 1.3), col: bubble.fill, seed: seed * 37 + i * 7 + si, t, from: f0, to: f1, spline: !!st.s, wob: wp, passes: 1, flat: true, alpha: .95, tooth: .5 });
      } else {
        line(g, pts, { w: lw, col, seed: seed * 31 + i * 7 + si, t, from: f0, to: f1, spline: !!st.s, wob: wp, passes: 2, taper: [.08, .12], alpha });
      }
    }
    g.restore();
  }
  g.restore();
  return L.width;
}

// A word's width at a size, for laying rows out.
export const wordW = (str, size, track = 4) => measure(str, size, track);
