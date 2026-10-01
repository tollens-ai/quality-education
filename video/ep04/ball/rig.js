// What every character shares: rubber-hose arms and legs that end in gloves and shoes, the dance
// on the beat, blinking, and the mouth that opens with the voice.
import { TAU, noise, hash, clamp, lerp, now, beatPos, sinceBeat, voice } from './kit.js';
import { INK, WHITE, C } from './palette.js';
import { hose, glove, shoe, line, stroke, shape, ellipse, spline, xf, dot } from './ink.js';

// A blink every few seconds, different for each character (seed).
export function blinkAt(t, seed = 0) {
  const period = 2.6 + hash(seed) * 1.8, ph = ((t + hash(seed, 2) * 5) % period) / period;
  return ph > .955 ? Math.sin((ph - .955) / .045 * Math.PI) : 0;
}
// The rubber-hose dance: a bob down on each beat and a squash, a lean that swings each bar.
export function groove(t, k = 1, phase = 0) {
  const bp = beatPos(t) + phase, f = bp % 1;
  const down = Math.pow(Math.sin(Math.PI * f), .8);          // 0 on the beat, 1 between
  const land = Math.exp(-((f < .5 ? f : f - 1) ** 2) / .012);  // a squash at the beat
  return { bob: (1 - down) * 14 * k, sq: land * .07 * k, lean: Math.sin(Math.PI * bp / 2) * .06 * k, step: Math.floor(bp) % 2, f };
}
// How open a singer's mouth is at t (0..1), from the sung voice's loudness, or a flap if muted.
export function mouthAt(t, singing = true) {
  if (!singing) return 0;
  const v = voice(t);
  if (v) return clamp(v * 1.25);
  return clamp(.5 + .5 * Math.sin(t * 22));
}

// An arm: from shoulder s to hand h (world coords), ending in a glove.
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
// A mouth: a dark rounded opening with a tongue, open by `m` (0..1), `wd` wide.
export function mouth(g, x, y, wd, m, o = {}) {
  if (m < .08) { stroke(g, [[x - wd * .45, y - wd * .05], [x, y + wd * .12 * (o.smile ?? 1)], [x + wd * .45, y - wd * .05]], { w: o.lw ?? 5, seed: o.seed ?? 44 }); return; }
  const h = wd * (.18 + m * .55);
  const P = spline([[x - wd * .5, y - h * .25], [x, y - h * .35 + (o.smile ?? 1) * h * .1], [x + wd * .5, y - h * .25], [x + wd * .28, y + h * .6], [x - wd * .28, y + h * .6]], true, 6);
  shape(g, P, { fill: INK, w: o.lw ?? 5, seed: o.seed ?? 44 });
  // tongue
  g.save(); g.beginPath(); g.moveTo(P[0][0], P[0][1]); for (const p of P) g.lineTo(p[0], p[1]); g.closePath(); g.clip();
  g.fillStyle = C(o.tongue || '#e0575a'); g.beginPath(); g.ellipse(x + wd * .06, y + h * .55, wd * .3, h * .38, 0, 0, TAU); g.fill();
  g.restore();
}
// Motion and emotion marks: little lines radiating (surprise), sweat drops, hearts, stars.
export function pops(g, x, y, r, n = 5, o = {}) {
  for (let i = 0; i < n; i++) {
    const a = (o.a0 ?? -Math.PI * .9) + i / (n - 1) * (o.span ?? Math.PI * .8);
    stroke(g, [[x + Math.cos(a) * r, y + Math.sin(a) * r], [x + Math.cos(a) * r * 1.45, y + Math.sin(a) * r * 1.45]], { w: o.w ?? 6, seed: 70 + i });
  }
}
export function sweat(g, x, y, s = 1, col = '#8fd0e8') {
  const P = spline([[x, y - 22 * s], [x + 11 * s, y + 4 * s], [x, y + 13 * s], [x - 11 * s, y + 4 * s]], true, 5);
  shape(g, P, { fill: col, w: 3.5, seed: 80 });
}
export function heart(g, x, y, s, col = '#e0575a', seed = 90) {
  const P = [];
  for (let i = 0; i < 40; i++) { const a = i / 40 * TAU; P.push([x + s * 16 * Math.pow(Math.sin(a), 3) / 16, y - s * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 16]); }
  shape(g, P, { fill: col, w: Math.max(3, s * .12), seed });
}
export function star(g, x, y, r, col, o = {}) {
  const P = []; const n = o.n || 5;
  for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU - Math.PI / 2 + (o.rot || 0); const rr = i % 2 ? r * (o.inner ?? .45) : r; P.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
  shape(g, P, { fill: col, w: o.w ?? Math.max(3, r * .12), seed: o.seed ?? 95, amt: .6 });
}
