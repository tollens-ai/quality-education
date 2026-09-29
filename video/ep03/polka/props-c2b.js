// Props for chorus 2's fifth and sixth gags, by night, with the tables turned: the bulldog judge's reaching arm and
// paw, the polishing cloth, the shine it leaves on Clawd's leg, the crumbs the wind blows off him, and the little
// marks that punctuate a gag (a puff, a click). Everything is a small function of the time, drawn with the pen;
// what is drawn on Clawd (`gleamLeg`) is drawn in his own space, so it follows him when he leans and squashes.
import { TAU, clamp, lerp, hash } from './kit.js';
import { blob, line, dot } from './pencil.js';
import { ellipse, capsule, scallop } from './shapes.js';
import { sparkle } from './props.js';
import { GRAPHITE, CLAWD } from './palette.js';

const ink = GRAPHITE;
// The bulldog's colours (as dogFront draws him) and his paw's lighter fur.
export const BULL = { fill: '#d6a165', shade: '#a26f3a', paw: '#f3e2c4' };
const SHINE = '#fffdf2';

// ---------------------------------------------------------------- an arm that reaches
// Where the elbow of a two-link limb from `a` to `h` sits. The links are as long as the reach wants them (a rubber-hose
// arm: about .55 of the distance each, never shorter than `min`), and `bend` (+1 or -1) picks which way the elbow points.
export function armJoints(a, h, o = {}) {
  const { min = 70, max = 200, bend = 1 } = o;
  const dx = h[0] - a[0], dy = h[1] - a[1], d = Math.hypot(dx, dy) || 1;
  const L = clamp(d * .55, min, max), k = Math.max(1, d * 1.02 / (2 * L)), L1 = L * k;
  const cosA = clamp(d / (2 * L1), -1, 1);
  const ang = Math.atan2(dy, dx) + Math.acos(cosA) * bend;
  return { e: [a[0] + Math.cos(ang) * L1, a[1] + Math.sin(ang) * L1], h };
}
// The arm itself, shoulder `a` to hand `h` (the paw is drawn separately, on top of what the hand holds).
export function bulldogArm(g, t, a, h, o = {}) {
  const { seed = 60, bend = 1, s = 1 } = o;
  const { e } = armJoints(a, h, { bend, min: 70 * s, max: 200 * s });
  blob(g, capsule(a, e, 25 * s, 21 * s, 5, seed), { fill: BULL.fill, shade: BULL.shade, line: ink, lw: 5.6, seed, t, hw: 4.8, tone: .5, sh: .3 });
  blob(g, capsule(e, h, 21 * s, 17 * s, 5, seed + 1), { fill: BULL.fill, shade: BULL.shade, line: ink, lw: 5.6, seed: seed + 1, t, hw: 4.8, tone: .5, sh: .3 });
  return e;
}
// The paw at the end of it: a tan fist, with two knuckles on its front edge, that grips what he holds.
export function bulldogPaw(g, t, p, o = {}) {
  const { seed = 62, rot = 0, s = 1 } = o;
  g.save(); g.translate(p[0], p[1]); g.rotate(rot); g.scale(s, s);
  const fur = { fill: BULL.fill, shade: BULL.shade };
  blob(g, ellipse(0, 0, 40, 33, 9, 0, seed), { ...fur, line: ink, lw: 5.6, seed, t, hw: 4.8, tone: .5, sh: .3 });
  for (const j of [-1, 1]) blob(g, ellipse(j * 16 + 8, -20, 14, 13, 8, 0, seed + 3 + j), { ...fur, line: ink, lw: 4.6, seed: seed + 3 + j, t, hw: 4.2, tone: .5, sh: .3 });
  g.restore();
}

// ---------------------------------------------------------------- the polishing cloth
// A big pale folded rag pressed flat on what it rubs (x, y is its middle). `sq` squashes it as it rubs.
export function rag(g, t, x, y, o = {}) {
  const { rot = 0, s = 1, seed = 70, sq = 0 } = o;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s * (1 + sq * .14), s * (1 - sq * .14));
  blob(g, [[-58, -24], [-20, -34], [26, -31], [60, -18], [64, 16], [30, 32], [-14, 30], [-52, 23], [-66, -1]], { fill: '#e6eef8', shade: '#b7c6dd', line: ink, lw: 4.8, seed, t, hw: 4.6, tone: .9, dens: .6, sh: .3 });
  line(g, [[-40, -8], [-8, 2], [30, -6]], { w: 4, col: '#8ea3c4', seed: seed + 1, t, spline: true, passes: 1, alpha: .85 });
  line(g, [[-30, 14], [4, 12], [34, 8]], { w: 3.6, col: '#8ea3c4', seed: seed + 2, t, spline: true, passes: 1, alpha: .7 });
  blob(g, [[42, 20], [62, 38], [50, 50], [30, 32]], { fill: '#e6eef8', shade: '#b7c6dd', line: ink, lw: 4.2, seed: seed + 3, t, hw: 4, tone: .9, dens: .5 });
  g.restore();
}
// Speed lines that trail the rag as it rubs to and fro (`ph` is the rub's phase in turns): white strokes behind it.
export function rubMarks(g, t, x, y, o = {}) {
  const { k = 1, seed = 75, ph = 0 } = o;
  if (k <= .01) return;
  const v = Math.cos(ph * TAU), a = Math.abs(v);
  if (a < .2) return;
  for (let i = 0; i < 3; i++) {
    const yy = y - 34 + i * 30, x0 = x - Math.sign(v) * (58 + i * 8);
    line(g, [[x0, yy], [x0 - Math.sign(v) * (34 + i * 8), yy + (i - 1) * 3]], { w: 7, col: SHINE, seed: seed + i, t, spline: false, passes: 1, taper: [.5, .1], alpha: .85 * a * k });
  }
}

// ---------------------------------------------------------------- the shine (in Clawd's own space, feet at y = 0)
// The polish on his front left leg and foot. Before it: a few dark scuffs on the leg (`scuff` 1..0 fades them as it is
// rubbed off). After it: a paler, glossier leg, white highlight strokes drawn down it (`k` 0..1 is how far they have got)
// and stars that twinkle (`tw` 0..1 swells them).
export function gleamLeg(g, t, o = {}) {
  const { k = 1, tw = 0, scuff = 0, seed = 80, top = [-114, -54], foot = [-126, -8] } = o;
  if (scuff > .02) {
    const d = '#6b2f1c';
    line(g, [[top[0] - 14, top[1] + 8], [top[0] + 4, top[1] + 20]], { w: 8, col: d, seed: seed + 20, t, spline: false, passes: 1, taper: [.3, .3], alpha: .8 * scuff });
    line(g, [[top[0] + 4, top[1] + 26], [top[0] - 12, top[1] + 33]], { w: 7, col: d, seed: seed + 21, t, spline: false, passes: 1, taper: [.3, .3], alpha: .75 * scuff });
    line(g, [[foot[0] - 30, foot[1] - 4], [foot[0] - 12, foot[1] + 3]], { w: 7, col: d, seed: seed + 22, t, spline: false, passes: 1, taper: [.3, .3], alpha: .7 * scuff });
    dot(g, foot[0] + 22, foot[1] - 2, 5, { col: d, seed: seed + 23, t, alpha: .7 * scuff });
  }
  if (k <= .01) return;
  g.save(); g.globalAlpha *= .85 * k;
  blob(g, capsule([top[0], top[1] + 8], [foot[0], foot[1] - 2], 16, 19, 5, seed), { fill: '#ffcfae', line: null, solid: false, seed, t, gap: 6, hw: 7, tone: .1, dens: .9 });
  blob(g, ellipse(foot[0] - 6, foot[1] + 2, 30, 12, 8, -.06, seed + 9), { fill: '#ffcfae', line: null, solid: false, seed: seed + 9, t, gap: 6, hw: 6, tone: .1, dens: .9 });
  g.restore();
  line(g, [[top[0] - 12, top[1] + 6], [top[0] - 15, top[1] + 20], [foot[0] - 14, foot[1] - 10]], { w: 11, col: SHINE, seed: seed + 1, t, from: 0, to: k, taper: [.05, .5], passes: 1, alpha: .98 });
  line(g, [[top[0] + 8, top[1] + 10], [top[0] + 6, top[1] + 28]], { w: 7, col: SHINE, seed: seed + 2, t, from: 0, to: clamp(k * 1.4 - .2), taper: [.1, .5], passes: 1, alpha: .95 });
  line(g, [[foot[0] - 46, foot[1] - 5], [foot[0] - 24, foot[1] - 15], [foot[0] - 2, foot[1] - 16]], { w: 8, col: SHINE, seed: seed + 3, t, from: 0, to: clamp(k * 1.6 - .4), taper: [.1, .5], passes: 1, alpha: .98 });
  const r = (28 + 16 * tw) * k;
  sparkle(g, top[0] - 40, top[1] + 24, r, t, { col: '#fff3b0', seed: seed + 4, rot: Math.PI / 8 + t * 1.1 });
  sparkle(g, foot[0] + 58, foot[1] - 40, r * .62, t, { col: '#fff3b0', seed: seed + 5, rot: -t * 1.3 });
}

// ---------------------------------------------------------------- flecks
// Terracotta crumbs that the wind lifts off a block: chunky dots and short thick strokes that tumble along `dx, dy` and fade.
// They leave the box's top and right edges (so that they show against the dark, not against the block they came from)
// and cycle, so the blast keeps shedding.
export function flecks(g, t, o = {}) {
  const { x0 = 500, x1 = 900, y0 = 850, y1 = 1100, k = 1, n = 16, seed = 90, dx = 460, dy = -230 } = o;
  if (k <= .01) return;
  for (let i = 0; i < n; i++) {
    const q = (t * 1.4 + hash(seed, i, 1)) % 1;
    const top = i % 2 === 0, u = hash(seed, i, 2), v = hash(seed, i, 3);
    const bx = top ? lerp(x0 + 40, x1, u) : x1 + 6, by = top ? y0 - 4 : lerp(y0 + 20, y1, v);
    const px = bx + q * dx * (.6 + .6 * v), py = by + q * dy * (.6 + .6 * u) + Math.sin(q * 8 + i) * 20 - q * q * 30;
    const a = q * 9 + i * 1.7, L = 8 + 8 * hash(seed, i, 4), al = k * (1 - q * q * q);
    if (i % 3 === 0) dot(g, px, py, 9 + 5 * hash(seed, i, 6), { col: i % 2 ? CLAWD.fill : CLAWD.shade, seed: seed + i, t, alpha: al });
    else line(g, [[px - Math.cos(a) * L, py - Math.sin(a) * L], [px + Math.cos(a) * L, py + Math.sin(a) * L]], { w: 15 + 7 * hash(seed, i, 5), col: i % 2 ? CLAWD.fill : CLAWD.shade, seed: seed + i, t, spline: false, passes: 1, alpha: al, taper: [.25, .25] });
  }
}

// ---------------------------------------------------------------- punctuation
// A little puff of dust, for something popping in or away: three round tufts that swell and fade (`p` 0..1).
export function puff(g, t, x, y, p, o = {}) {
  const { r = 34, seed = 95, col = '#d9d3c0' } = o;
  if (p <= 0 || p >= 1) return;
  g.save(); g.globalAlpha *= 1 - p * p;
  for (let i = 0; i < 3; i++) {
    const a = -Math.PI / 2 + (i - 1) * 1.1, d = 10 + p * 44, rr = r * (.5 + p * .6);
    blob(g, scallop(x + Math.cos(a) * d, y + Math.sin(a) * d * .8, rr, 6, .14, i, seed + i), { fill: col, line: ink, lw: 4.4, seed: seed + i, t, hw: 4.4, tone: .9, dens: .5 });
  }
  g.restore();
}
// Three short strokes that jump off a thing (a "click", a "notice"): `p` 0..1.
export function clickMarks(g, t, x, y, p, o = {}) {
  const { r0 = 40, len = 52, col = '#fff3b0', seed = 98, a0 = -Math.PI / 2, spread = 1.5, w = 9 } = o;
  if (p <= 0 || p >= 1) return;
  for (let i = 0; i < 3; i++) {
    const a = a0 + (i - 1) * spread / 2, s0 = r0 + p * 12, s1 = r0 + len * Math.sin(Math.min(1, p * 1.6) * Math.PI / 2);
    line(g, [[x + Math.cos(a) * s0, y + Math.sin(a) * s0], [x + Math.cos(a) * s1, y + Math.sin(a) * s1]], { w: w * (1 - p * .5), col, seed: seed + i, t, spline: false, passes: 1, taper: [.1, .5], alpha: 1 - p * p });
  }
}

// ---------------------------------------------------------------- pointing
// The bulldog's paw held out at the viewer: a tan fist (a thumb and two curled toes) and one long toe pointing along
// `ang`, a pale claw at its tip (`k` sizes it, so it can pop in). Tan like his arm, so it reads as the arm's own hand.
export function pointPaw(g, t, p, ang, o = {}) {
  const { seed = 66, k = 1, len = 100 } = o;
  if (k <= .01) return;
  g.save(); g.translate(p[0], p[1]); g.scale(k, k);
  const c = Math.cos(ang), s_ = Math.sin(ang), fx = c * len, fy = s_ * len;
  const at = (u, v) => [c * u - s_ * v, s_ * u + c * v];            // a point in the paw's own frame: u along the finger, v across it
  const fur = { fill: BULL.fill, shade: BULL.shade };
  // the thumb, tucked under
  blob(g, capsule(at(-4, 24), at(26, 34), 13, 10, 5, seed + 5), { ...fur, line: ink, lw: 5, seed: seed + 5, t, hw: 4.4, tone: .5, sh: .3 });
  // the long toe, with its claw
  blob(g, capsule(at(0, -4), [fx, fy], 17, 13, 5, seed), { ...fur, line: ink, lw: 5.6, seed, t, hw: 4.6, tone: .5, sh: .3 });
  const tip = at(len + 14, -4);
  blob(g, [[fx + c * 4 - s_ * 10, fy + s_ * 4 + c * 10], [tip[0], tip[1]], [fx + c * 4 + s_ * 10, fy + s_ * 4 - c * 10]], { fill: '#fffdf2', line: ink, lw: 4.4, seed: seed + 2, t, hw: 4, tone: .9, dens: .6 });
  // the fist, and two curled toes over its front
  blob(g, ellipse(-c * 8, -s_ * 8, 46, 40, 9, 0, seed + 1), { ...fur, line: ink, lw: 6, seed: seed + 1, t, hw: 4.8, tone: .5, sh: .3 });
  for (const j of [-1, 1]) {
    const q = at(24, j * 24 + 8);
    blob(g, ellipse(q[0], q[1], 16, 15, 8, 0, seed + 3 + j), { ...fur, line: ink, lw: 4.8, seed: seed + 3 + j, t, hw: 4.2, tone: .5, sh: .3 });
  }
  g.restore();
}
