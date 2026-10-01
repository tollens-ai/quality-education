// What every character shares: rubber-hose arms and legs that end in gloves and shoes, the bounce on
// the beat, blinking, faces (mouths, brows, cheeks) and the cartoon marks of feeling.
import { TAU, noise, hash, clamp, lerp, now, beatPos, sinceBeat, voice } from './kit.js';
import { INK, WHITE, RED, C } from './palette.js';
import { hose, glove, shoe, line, stroke, shape, ellipse, spline, xf, dot, paint, pathOf } from './ink.js';

// A blink every few seconds, different for each character (seed).
export function blinkAt(t, seed = 0) {
  const period = 2.4 + hash(seed) * 2.2, ph = ((t + hash(seed, 2) * 5) % period) / period;
  return ph > .955 ? Math.sin((ph - .955) / .045 * Math.PI) : 0;
}
// The rubber-hose bounce: down on each beat with a squash, a lean that swings every two beats.
export function groove(t, k = 1, phase = 0) {
  const bp = beatPos(t) + phase, f = ((bp % 1) + 1) % 1;
  const down = Math.pow(Math.sin(Math.PI * f), .8);
  const land = Math.exp(-((f < .5 ? f : f - 1) ** 2) / .012);
  return { bob: (1 - down) * 14 * k, sq: land * .075 * k, lean: Math.sin(Math.PI * bp / 2) * .06 * k, step: Math.floor(bp) % 2, f };
}
// How open a singer's mouth is at t (0..1), from the voice's loudness.
export function mouthAt(t, singing = true) {
  if (!singing) return 0;
  const v = voice(t);
  return clamp(v * 1.3);
}

// An arm: from shoulder s to hand h, ending in a glove.
export function arm(g, sx, sy, hx, hy, o = {}) {
  const d = Math.hypot(hx - sx, hy - sy), a = Math.atan2(hy - sy, hx - sx);
  hose(g, [sx, sy], [hx, hy], { w: o.w ?? 15, bend: o.bend ?? .22, seed: o.seed ?? 3, fill: o.fill });
  if (o.glove !== false) glove(g, hx, hy, o.ang ?? a, o.gs ?? 20, o.pose || 'open', { flip: o.flip, seed: (o.seed ?? 3) + 40, col: o.gloveCol });
  return { a, d };
}
// A leg: from hip to foot, ending in a shoe.
export function leg(g, hx, hy, fx, fy, o = {}) {
  hose(g, [hx, hy], [fx, fy], { w: o.w ?? 15, bend: o.bend ?? .12, seed: o.seed ?? 6, fill: o.fill });
  if (o.shoe !== false) shoe(g, fx, fy, o.ss ?? 26, o.dir ?? 1, { col: o.shoeCol, seed: (o.seed ?? 6) + 20 });
}

// A singing mouth: a wide dark D with a red tongue and, open wide, a band of upper teeth. `m` 0..1
// opens it; `wd` is its width; smile bends its top. Closed (m small) it's a smile line.
export function mouth(g, x, y, wd, m, o = {}) {
  const lw = o.lw ?? Math.max(3, wd * .08), smile = o.smile ?? 1;
  if (m < .1) {
    if (smile < 0) { stroke(g, [[x - wd * .36, y + wd * .08], [x, y - wd * .06], [x + wd * .36, y + wd * .08]], { w: lw, seed: o.seed ?? 44 }); return; }
    const P = [[x - wd * .42, y - wd * .06 * smile], [x - wd * .2, y + wd * .1 * smile], [x + wd * .2, y + wd * .1 * smile], [x + wd * .42, y - wd * .06 * smile]];
    stroke(g, P, { w: lw, seed: o.seed ?? 44 });
    // the dimples at the corners
    if (smile > .5) for (const d of [-1, 1]) stroke(g, [[x + d * wd * .48, y - wd * .12], [x + d * wd * .43, y - wd * .02]], { w: lw * .7, seed: (o.seed ?? 44) + d });
    return;
  }
  const h = wd * (.16 + m * .62);
  const top = y - h * .3, bot = y + h * .7;
  const P = spline([[x - wd * .5, top], [x - wd * .22, top + h * .06 * smile], [x + wd * .22, top + h * .06 * smile], [x + wd * .5, top], [x + wd * .32, top + h * .62], [x, bot], [x - wd * .32, top + h * .62]], true, 7);
  shape(g, P, { fill: '#3a1410', form: false, w: lw, seed: o.seed ?? 44, amt: .5 });
  g.save(); pathOf(g, P, true); g.clip();
  g.fillStyle = C(o.tongue || '#e05a5d'); g.beginPath(); g.ellipse(x + wd * .05, bot - h * .08, wd * .3, h * .36, 0, 0, TAU); g.fill();
  if (m > .45 && o.teeth !== false) { g.fillStyle = C(WHITE); g.fillRect(x - wd * .4, top - 2, wd * .8, h * .18); }
  g.restore();
  line(g, P, { w: lw, closed: true, seed: o.seed ?? 44 });
}
// Brows: two short arcs over eyes at ±dx from x. mood: 0 calm, + raised/worried, - cross. cock
// raises only the right one.
export function brows(g, x, y, dx, len, o = {}) {
  const mood = o.mood ?? 0, lw = o.lw ?? Math.max(3, len * .22), cock = o.cock ?? 0, lift = o.lift ?? 0;
  for (const d of [-1, 1]) {
    const up = lift * len * .5 + (d > 0 ? cock * len * .55 : 0);
    const inX = x + d * (dx - len * .5), outX = x + d * (dx + len * .5);
    const inY = y - up - mood * len * .32, outY = y - up + mood * len * .05;
    const midY = Math.min(inY, outY) - len * .16;
    stroke(g, [[inX, inY], [(inX + outX) / 2, midY], [outX, outY]], { w: lw, seed: (o.seed ?? 50) + d, color: o.col });
  }
}
// Rosy cheeks.
export function cheeks(g, x, y, dx, r, a = .4, col = '#ee7f73') {
  g.save(); g.globalAlpha *= a; g.fillStyle = C(col);
  for (const d of [-1, 1]) { g.beginPath(); g.ellipse(x + d * dx, y, r, r * .62, 0, 0, TAU); g.fill(); }
  g.restore();
}
// Marks of feeling: lines of surprise, sweat, hearts, stars, a question or an exclamation mark.
export function pops(g, x, y, r, n = 5, o = {}) {
  for (let i = 0; i < n; i++) {
    const a = (o.a0 ?? -Math.PI * .9) + i / Math.max(1, n - 1) * (o.span ?? Math.PI * .8);
    stroke(g, [[x + Math.cos(a) * r, y + Math.sin(a) * r], [x + Math.cos(a) * r * 1.45, y + Math.sin(a) * r * 1.45]], { w: o.w ?? 6, seed: 70 + i, color: o.col });
  }
}
export function sweat(g, x, y, s = 1, col = '#8fd0e8') {
  const P = spline([[x, y - 22 * s], [x + 11 * s, y + 4 * s], [x, y + 13 * s], [x - 11 * s, y + 4 * s]], true, 5);
  shape(g, P, { fill: col, w: 3.5 * s, seed: 80, gloss: { x: .35, y: .4, w: .12, h: .1, dot: false } });
}
export function heart(g, x, y, s, col = '#e0575a', seed = 90) {
  const P = [];
  for (let i = 0; i < 40; i++) { const a = i / 40 * TAU; P.push([x + s * 16 * Math.pow(Math.sin(a), 3) / 16, y - s * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 16]); }
  shape(g, P, { fill: col, w: Math.max(3, s * .12), seed, gloss: { x: .3, y: .3, w: .1, h: .07, dot: false } });
}
export function star(g, x, y, r, col, o = {}) {
  const P = []; const n = o.n || 5;
  for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU - Math.PI / 2 + (o.rot || 0); const rr = i % 2 ? r * (o.inner ?? .46) : r; P.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
  return shape(g, o.round ? spline(P, true, 3) : P, { fill: col, w: o.w ?? Math.max(3, r * .12), seed: o.seed ?? 95, amt: .5, form: o.form ?? 'round', k: .8, gloss: o.gloss === false ? null : { x: .38, y: .3, w: .07, h: .05, dot: false } });
}
// A cartoon question mark or exclamation mark, drawn as a shape (not lettered): (x, y) is its
// centre, h its height.
export function qmark(g, x, y, h, col = INK, o = {}) {
  const s = h / 100, lw = o.w ?? 7 * s;
  const P = spline([[-24, -26], [-18, -44], [0, -50], [20, -44], [26, -26], [16, -10], [2, 0], [0, 14]].map(([a, b]) => [x + a * s, y + b * s]), false, 6);
  // the hook as a fat tapered stroke, inked
  line(g, P, { w: 20 * s + lw, taper: false, seed: o.seed ?? 401, color: o.ink || INK, boilAmt: .6 });
  line(g, P, { w: 20 * s - lw * .6, taper: false, seed: (o.seed ?? 401) + 1, color: col, boilAmt: .4 });
  shape(g, ellipse(x, y + 36 * s, 12 * s, 12 * s), { fill: col, w: lw * .9, seed: (o.seed ?? 401) + 2, form: false });
}
export function bang(g, x, y, h, col = INK, o = {}) {
  const s = h / 100, lw = o.w ?? 7 * s;
  shape(g, spline([[x - 14 * s, y - 50 * s], [x + 14 * s, y - 50 * s], [x + 7 * s, y + 14 * s], [x - 7 * s, y + 14 * s]], true, 4), { fill: col, w: lw, seed: o.seed ?? 411, form: false });
  shape(g, ellipse(x, y + 36 * s, 11 * s, 11 * s), { fill: col, w: lw * .9, seed: (o.seed ?? 411) + 1, form: false });
}
