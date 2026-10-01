// Props: the things the cast carry, use and make. Every one is drawn, never lettered: code is rows
// of coloured bars, a greeting is squiggles with a real comma, a sum is digits.
import { TAU, clamp, lerp, now, hash, noise, rng } from './kit.js';
import { INK, WHITE, CREAM, CORAL, TEAL, ROSE, PLUM, OCHRE, GOLD, GOLD_SH, GREEN, RED, RED_SH, WOOD, WOOD_SH, BROWN, SLATE, GREY, TIN, C, sh, lt } from './palette.js';
import { shape, line, stroke, rrect, ellipse, spline, xf, dot, paint, pathOf, arc, bez, glove } from './ink.js';
import { bug } from './cast.js';

// ---------------------------------------------------------------- code
// App code, as an editor shows it: rows of syntax-coloured bars, indented. `bugAt` puts the beetle
// on a row (or -1 for none). (x, y) is the top left; w the width; rows' height is w * .1.
export const CODE = [[[0, .34, '#c94f3d'], [.38, .28, '#2f8f88']], [[.1, .52, '#7a5aa8']], [[.1, .22, '#d9a23c'], [.36, .36, '#2f8f88']], [[.1, .44, '#c94f3d']], [[0, .18, '#7a5aa8']]];
export function code(g, x, y, w, o = {}) {
  const rh = w * .14, bh = rh * .52;
  CODE.forEach((row, i) => {
    for (const [x0, len, col] of row) {
      const P = rrect(x + x0 * w, y + i * rh, len * w, bh, bh / 2);
      g.fillStyle = C(col); pathOf(g, P, true); g.fill();
    }
  });
  if ((o.bugAt ?? 2) >= 0) {
    const row = CODE[o.bugAt ?? 2], last = row[row.length - 1];
    bug(g, x + (last[0] + last[1]) * w + w * .1, y + (o.bugAt ?? 2) * rh + bh * .1, w / 300 * (o.bugScale ?? 1), { t: o.t, look: o.look ?? -.6, walk: o.walk, dir: o.dir ?? -1, kick: o.kick });
  }
}
// A peeled copy of the code: a cream decal with curled corners, the same rows and the same bug.
export function decal(g, x, y, w, h, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0);
  const curl = o.curl ?? 0;
  shape(g, [[-w / 2, -h / 2], [w / 2 - curl * 30, -h / 2], [w / 2, -h / 2 + curl * 30], [w / 2, h / 2], [-w / 2, h / 2]], { fill: '#fbf6e8', form: false, w: 5, seed: 1400 });
  code(g, -w / 2 + w * .1, -h / 2 + h * .14, w * .82, { t: o.t, bugAt: o.bugAt, bugScale: o.bugScale });
  if (curl > 0) shape(g, [[w / 2 - curl * 30, -h / 2], [w / 2, -h / 2 + curl * 30], [w / 2 - curl * 24, -h / 2 + curl * 24]], { fill: '#e2d6bc', form: false, w: 4, seed: 1401 });
  if (o.paste) { g.save(); g.globalAlpha = .55; for (const [px, py] of [[-w * .4, h * .55], [w * .3, h * .58], [w * .05, h * .6]]) shape(g, ellipse(px, py, 12, 16), { fill: '#f4f7e6', form: false, w: 3, seed: 1402 + px }); g.restore(); }
  g.restore();
}
// A paste pot with a brush in it (or without, when the brush is in a hand).
export function pastePot(g, x, y, s = 1, o = {}) {
  shape(g, spline([[x - 46 * s, y - 70 * s], [x + 46 * s, y - 70 * s], [x + 40 * s, y], [x - 40 * s, y]], true, 3), { fill: '#d7d3c4', shade: '#8f8a7a', form: 'block', w: 6 * s, seed: 1410 });
  shape(g, ellipse(x, y - 70 * s, 46 * s, 12 * s), { fill: '#f4f7e6', w: 5 * s, seed: 1411, form: false });
  shape(g, rrect(x - 40 * s, y - 50 * s, 80 * s, 28 * s, 4 * s), { fill: '#7c9a8e', w: 4 * s, seed: 1412, form: false });
  if (o.drip) for (const [dx, dl] of [[-30, 24], [10, 34], [30, 18]]) shape(g, spline([[x + dx * s - 6 * s, y - 70 * s], [x + dx * s + 6 * s, y - 70 * s], [x + dx * s + 5 * s, y - 70 * s + dl * s], [x + dx * s, y - 64 * s + dl * s], [x + dx * s - 5 * s, y - 70 * s + dl * s]], true, 3), { fill: '#f4f7e6', w: 3 * s, seed: 1413 + dx, form: false });
}
export function brush(g, x, y, ang, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.rotate(ang);
  shape(g, rrect(-12 * s, -10 * s, 110 * s, 20 * s, 8 * s), { fill: WOOD, shade: WOOD_SH, form: 'block', w: 5 * s, seed: 1420 });
  shape(g, rrect(96 * s, -14 * s, 26 * s, 28 * s, 3 * s), { fill: '#b8b8b0', form: 'block', w: 4 * s, seed: 1421 });
  shape(g, spline([[120 * s, -16 * s], [160 * s, -20 * s], [176 * s, 0], [160 * s, 20 * s], [120 * s, 16 * s]], true, 4), { fill: o.wet ? '#f4f7e6' : '#d7b77a', w: 4 * s, seed: 1422, form: false });
  g.restore();
}
// A splat of paste.
export function splat(g, x, y, r, p, seed = 1) {
  if (p <= 0) return;
  const R = rng(seed), P = [];
  for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, rr = r * (i % 2 ? .55 : 1) * lerp(.7, 1.2, R()) * clamp(p * 1.4); P.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * .7]); }
  shape(g, spline(P, true, 3), { fill: '#f4f7e6', form: false, w: 3.5, seed });
  for (let i = 0; i < 5; i++) { const a = R() * TAU, d = r * (1.3 + R() * .8) * clamp(p * 1.2); shape(g, ellipse(x + Math.cos(a) * d, y + Math.sin(a) * d * .7, r * .14, r * .12), { fill: '#f4f7e6', form: false, w: 2.5, seed: seed + i }); }
}

// ---------------------------------------------------------------- the sums
// A sum written big on a screen or a card: e.g. "2+2", "=5". Drawn in the film's display face,
// ink on cream, a hair wobbly. (Numerals and signs only: the film letters no words.)
export function digits(g, s, x, y, size, o = {}) {
  if (typeof window !== 'undefined') window.__textTag = 'sum';
  g.save(); g.font = `${size}px Corben`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.translate(x, y); g.rotate(o.rot ?? 0);
  if (o.ow !== 0) { g.lineJoin = 'round'; g.lineWidth = size * (o.ow ?? .1); g.strokeStyle = C(o.ink || INK); g.strokeText(s, 0, 0); }
  g.fillStyle = C(o.col || INK); g.fillText(s, 0, 0);
  g.restore();
  if (typeof window !== 'undefined') window.__textTag = null;
}
// A lollipop, swirled.
export function lollipop(g, x, y, ang, s = 1) {
  const c = Math.cos(ang), sn = Math.sin(ang);
  stroke(g, [[x, y], [x + c * 110 * s, y + sn * 110 * s]], { w: 8 * s, seed: 1430, color: '#f4efe2', taper: false });
  const cx = x + c * 150 * s, cy = y + sn * 150 * s;
  shape(g, ellipse(cx, cy, 46 * s, 46 * s), { fill: '#f2a3bd', w: 5 * s, seed: 1431, gloss: { x: .3, y: .25, w: .1, h: .08 } });
  const P = []; for (let i = 0; i < 40; i++) { const a = i * .45, r = i * 1.1 * s; P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  line(g, P, { w: 7 * s, seed: 1432, color: '#d3487a', taper: true });
}
