// Episode 3's agility trials: the course and its five obstacles, the four runners (a greyhound, a basset
// hound, a great dane with a gold collar and Bruce), the scoreboard of four dials (SPEED, CARE, THRIFT,
// FUN: each one better the higher it goes, and no total anywhere) and the small things that go with them.
// Everything is a pure function of the drawing's time; scenes/trials.js says what happens when.
import { W, H, TAU, clamp, lerp, inv, hash, easeOut, backOut, smooth } from './kit.js';
import { blob, line, dot, hatch } from './pencil.js';
import { rrect, ellipse, capsule, scallop } from './shapes.js';
import { write } from './hand.js';
import { dachshund } from './chars.js';
import { signBoard } from './board.js';
import { rosette } from './props.js';
import { GRAPHITE, C } from './palette.js';

// ------------------------------------------------------------------- a smooth line through waypoints
// Monotone cubic (pchip): no overshoot between the points, so a dog never runs backwards.
export function pchip(pts, x) {
  const n = pts.length;
  if (x <= pts[0][0]) return pts[0][1];
  if (x >= pts[n - 1][0]) return pts[n - 1][1];
  let i = 0;
  while (i < n - 2 && x > pts[i + 1][0]) i++;
  const d = j => (pts[j + 1][1] - pts[j][1]) / (pts[j + 1][0] - pts[j][0]);
  const m = j => {
    if (j === 0) return d(0);
    if (j === n - 1) return d(n - 2);
    const a = d(j - 1), b = d(j);
    return a * b <= 0 ? 0 : 2 * a * b / (a + b);
  };
  const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
  const h = x1 - x0, u = (x - x0) / h, u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * y0 + (u3 - 2 * u2 + u) * h * m(i) + (-2 * u3 + 3 * u2) * y1 + (u3 - u2) * h * m(i + 1);
}

// ------------------------------------------------------------------- the course
// Two lanes in the ring: the far one runs left to right (start, hurdle, tunnel, weave poles), the dog goes off the
// right-hand edge and comes round out of sight, and the near one runs back (hoop, seesaw, finish). A position on the
// course is a distance `s` along it, in pixels; `pathAt` says where that is and which way, how big a dog is there and
// whether it is off the page.
export const LANE = { yA: 1120, yB: 1330, x0: 215, xOut: 1300, xf: 300, turn: 110, sA: .5, sB: .6 };
const LA = LANE.xOut - LANE.x0, LT = LANE.turn, LB = LANE.xOut - LANE.xf;
export const S_END = LA + LT + LB;
// The obstacles' places (x on the page), in the order the dogs meet them.
export const OBX = { hurdle: 470, tunnel: 725, weave: 940, hoop: 965, seesaw: 705, finish: 335 };
export const OB = { hurdle: OBX.hurdle - LANE.x0, tunnel: OBX.tunnel - LANE.x0, weave: OBX.weave - LANE.x0,
  hoop: LA + LT + (LANE.xOut - OBX.hoop), seesaw: LA + LT + (LANE.xOut - OBX.seesaw), finish: LA + LT + (LANE.xOut - OBX.finish) };
export const POLE_S = [0, 1, 2, 3, 4].map(i => OB.weave + (i - 2) * 40);   // the weave poles' places on the course
export function pathAt(s) {
  const L = LANE;
  if (s <= LA) return { x: L.x0 + s, y: L.yA, dir: 1, flip: 1, sc: L.sA, lane: 0, hidden: L.x0 + s > 1290 };
  if (s <= LA + LT) { const p = (s - LA) / LT; return { x: L.xOut + 40, y: lerp(L.yA, L.yB, p), dir: p < .5 ? 1 : -1, flip: p < .5 ? 1 : -1, sc: lerp(L.sA, L.sB, p), lane: 1, hidden: true }; }
  const x = L.xOut - (s - LA - LT);
  return { x, y: L.yB, dir: -1, flip: -1, sc: L.sB, lane: 1, hidden: x > 1290 };
}
export const obX = name => OBX[name];

// ------------------------------------------------------------------- the four runners
// All four are Bruce's drawing (dachshund) with a different body: a greyhound (thin, long-legged, deep in
// the chest), a basset hound (a loaf on stubs, ears to the ground), a great dane (big, dark, a gold collar)
// and Bruce himself.
export const LOOKS = [
  { name: 'greyhound', coat: '#a7a2b0', shade: '#726d7c', muzzle: '#c4c0cb', collar: C.orange, legH: 118, bodyH: .62, length: .95, headS: .74, snoutL: 1.4, earS: .6, arch: 26, tuck: 56, chest: 36, legW: .55, jacket: { col: '#e04a3d', text: '7' }, k: 1 },
  { name: 'basset', coat: '#f2e7cf', shade: '#a8672f', muzzle: '#f7eedb', collar: C.teal, legH: 38, bodyH: 1.08, length: .9, headS: 1.2, snoutL: .85, earS: 1.9, legW: 1.1, k: 1 },
  { name: 'dane', coat: '#4d5068', shade: '#2c2e42', muzzle: '#767a98', collar: '#f2b81c', tag: '#fff2c2', legH: 112, bodyH: .96, length: .92, headS: 1.02, snoutL: 1.15, earS: .8, arch: 10, tuck: 30, chest: 26, legW: .9, k: 1.14 },
  { name: 'bruce', coat: '#c9772f', shade: '#8f4a1c', muzzle: '#f0c48f', collar: C.blue, k: 1 },
];
// Draw runner k with its visual centre at (x, y) (y is the ground under its feet). `pitch` lifts the nose.
export function runner(g, t, k, o) {
  const { x, y, flip = 1, sc = .5, walk = 0, pitch = 0, bob = 0, squash = 0, eyes = 'open', mouth = 0, tongue = false, brow = 0, ear = 0, look = 0, tail = null, legPop = null, wag = .6, life = 1 } = o;
  const { name, k: kk = 1, ...D } = LOOKS[k];
  const s = sc * kk;
  const dirS = flip >= 0 ? 1 : -1;
  dachshund(g, { ...D, x: x - flip * 92 * s, y, s, flip, t, seed: 60 + k * 7, walk, lean: -dirS * pitch, bob, squash, eyes, mouth, tongue, brow, ear, look, tail, legPop, wag, life });
}
// Where a point of a runner's drawing (in the dachshund's own units) lands on the page.
export function dogPt(o, k, lx, ly) {
  const { x, y, flip = 1, sc = .5, pitch = 0, bob = 0, squash = 0 } = o;
  const s = sc * (LOOKS[k].k || 1), dirS = flip >= 0 ? 1 : -1, lean = -dirS * pitch;
  const px = lx * s * flip * (1 + squash * .1), py = ly * s * (1 - squash * .13);
  const c = Math.cos(lean), sn = Math.sin(lean);
  return [x - flip * 92 * s + px * c - py * sn, y - bob + px * sn + py * c];
}

// ------------------------------------------------------------------- the obstacles
const WOOD = '#c99a5a', WOOD2 = '#8b5f2a';
// The seesaw: a plank on a fulcrum; `ang` > 0 puts its right end down; `lift` raises it off the fulcrum; `sz` its size.
// seesawSurface: where the top of the plank is at page x, for a dog to stand on.
export function seesawSurface(cx, y, sz, ang, lift, x) {
  const dx = (x - cx) / sz;
  return y + sz * (-100 - lift + dx * Math.tan(ang) - 14 / Math.cos(ang));
}
export function seesaw(g, t, cx, y, o = {}) {
  const { ang = -.2, lift = 0, pop = 1, sz = 1, dx = 0, dy = 0 } = o;
  g.save(); g.translate(cx + dx, y + dy); g.scale(pop * sz, pop * sz);
  blob(g, [[-44, 0], [0, -98], [44, 0]], { fill: WOOD, shade: WOOD2, line: GRAPHITE, lw: 5.4, seed: 101, t, hw: 5, tone: .6, sh: .3 });
  g.translate(0, -100 - lift); g.rotate(ang);
  blob(g, rrect(0, 0, 300, 28, 12, 2, 102), { fill: C.sky, shade: '#2c75b8', line: GRAPHITE, lw: 5.6, seed: 102, t, hw: 5, tone: .7, sh: .35 });
  [-1, 1].forEach((sd, i) => line(g, [[sd * 112, -1], [sd * 134, -1]], { w: 16, col: C.yellow, seed: 103 + i, t, spline: false, passes: 1, flat: true }));
  g.restore();
}
// A hurdle: two posts and a striped bar that can be knocked off (dx, dy, rot move the bar).
export function hurdleX(g, t, x, y, sz, o = {}) {
  const { dx = 0, dy = 0, rot = 0, pop = 1 } = o;
  g.save(); g.translate(x, y); g.scale(sz * pop, sz * pop);
  [-1, 1].forEach((sd, i) => line(g, [[sd * 112, 0], [sd * 112, -146]], { w: 17, col: WOOD2, seed: 190 + i, t, spline: false, passes: 1, flat: true }));
  g.save(); g.translate(dx, -124 + dy); g.rotate(rot);
  line(g, [[-118, 0], [118, 0]], { w: 24, col: C.red, seed: 192, t, spline: false, passes: 1, flat: true, tooth: .5 });
  [[-72, -38], [22, 58]].forEach(([a, b], i) => line(g, [[a, 0], [b, 0]], { w: 24, col: '#fbf8ef', seed: 193 + i, t, spline: false, passes: 1, flat: true, tooth: .5 }));
  g.restore(); g.restore();
}
// The tunnel: a striped dome; the mouth is drawn first (under the dog), the dome after it (over the dog),
// so a dog going in disappears behind it and comes out at the far end. `sq` squashes it flat, `bump` is a
// swelling {x, h} (a dog stuck inside).
export function tunnelMouth(g, t, cx, y, o = {}) {
  const { pop = 1, sq = 1 } = o;
  g.save(); g.translate(cx, y); g.scale(pop, pop * sq);
  blob(g, ellipse(-104, -58, 25, 60, 10, 0, 111), { fill: '#54443a', line: GRAPHITE, lw: 5.4, seed: 111, t, hw: 4.6, tone: .9, gap: 4.4 });
  g.restore();
}
export function tunnelDome(g, t, cx, y, o = {}) {
  const { pop = 1, sq = 1, bump = null, dx = 0 } = o;
  g.save(); g.translate(cx + dx, y); g.scale(pop, pop * sq);
  const P = [[-92, 0], [-96, -50], [-72, -100], [-26, -128], [30, -130], [78, -102], [104, -52], [102, 0]];
  const pts = bump ? P.map(([px, py]) => [px, py - (py < -40 ? bump.h * Math.exp(-Math.pow((px - bump.x) / 46, 2)) : 0)]) : P;
  blob(g, pts, { fill: C.purple, shade: '#5a3a9a', line: GRAPHITE, lw: 6, seed: 112, t, hw: 5.2, tone: .6, sh: .32 });
  [-46, 2, 50].forEach((sx, i) => line(g, [[sx - 6, -8], [sx - 4, -60], [sx + 6, -108]], { w: 12, col: '#fbf8ef', seed: 113 + i, t, spline: true, passes: 1, alpha: .85, taper: [.1, .2] }));
  g.restore();
}
// Weave poles, five of them; `which` 'back' draws the even ones (behind the dog), 'front' the odd ones (in
// front of it), so a dog going through seems to thread them. `knock(i)` 0..1 sends pole i flying, `wob(i)` shakes it.
export function poles(g, t, cx, y, o = {}) {
  const { which = 'all', knock = () => 0, wob = () => 0, pop = 1, dir = () => 1 } = o;
  for (let i = 0; i < 5; i++) {
    if (which === 'back' && i % 2) continue;
    if (which === 'front' && !(i % 2)) continue;
    const x = cx + (i - 2) * 40, k = knock(i), w = wob(i);
    g.save(); g.translate(x, y);
    g.scale(pop, pop);
    if (k > 0) { const d = dir(i); g.translate(d * k * 90, -Math.sin(k * Math.PI) * 120 + k * k * 8); g.rotate(d * k * 1.5 + k * d * 2); }
    if (w) g.rotate(w * .12);
    blob(g, rrect(0, -70, 15, 142, 6, 2, 120 + i), { fill: '#fbf8ef', line: GRAPHITE, lw: 5, seed: 120 + i, t, hw: 4.4, tone: .9, dens: .3 });
    [[-38, -62], [-100, -128]].forEach(([a, b], j) => line(g, [[0, a], [0, b]], { w: 13, col: C.red, seed: 130 + i * 2 + j, t, spline: false, passes: 1, flat: true, alpha: .95 }));
    g.restore();
  }
}
// A hoop on a stand, edge-on: the ring's right half is drawn before the dog, its left half after, so the dog goes through.
export function hoop(g, t, cx, y, o = {}) {
  const { part = 'all', pop = 1, rot = 0, dx = 0, dy = 0, sz = 1 } = o;
  const cy = -122, rx = 26, ry = 96;
  g.save(); g.translate(cx + dx, y + dy); g.scale(pop * sz, pop * sz); g.rotate(rot);
  if (part !== 'front') {
    line(g, [[16, cy + ry + 30], [16, 0]], { w: 12, col: WOOD2, seed: 141, t, spline: false, passes: 1, flat: true });
    line(g, [[-40, 6], [64, 6]], { w: 14, col: WOOD2, seed: 142, t, spline: false, passes: 1, flat: true });
  }
  const arc = (a0, a1, seed) => {
    const pts = []; for (let i = 0; i <= 9; i++) { const a = a0 + (a1 - a0) * i / 9; pts.push([Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
    line(g, pts, { w: 21, col: C.red, seed, t, spline: true, passes: 1, tooth: .5, taper: [.02, .02], flat: true });
    [2, 5, 8].forEach((j, n) => { const a = a0 + (a1 - a0) * j / 9; line(g, [[Math.cos(a) * rx - 1, cy + Math.sin(a) * ry - 7], [Math.cos(a) * rx + 1, cy + Math.sin(a) * ry + 7]], { w: 20, col: '#fbf8ef', seed: seed + 1 + n, t, spline: false, passes: 1, flat: true }); });
  };
  if (part !== 'front') arc(-Math.PI / 2, Math.PI / 2, 143);
  if (part !== 'back') arc(Math.PI / 2, Math.PI * 1.5, 150);
  g.restore();
}
// The start: a pole with a green pennant. The finish: a chequered strip across the lane and a pole either side.
export function startGate(g, t, x, y, o = {}) {
  const { pop = 1 } = o;
  g.save(); g.translate(x, y); g.scale(pop, pop);
  line(g, [[0, 0], [0, -200]], { w: 14, col: WOOD2, seed: 160, t, spline: false, passes: 1, flat: true });
  blob(g, [[4, -198], [96, -178], [4, -150]], { fill: C.lime, shade: '#5c8a1a', line: GRAPHITE, lw: 5, seed: 161, t, hw: 4.6, tone: .7, sh: .3 });
  g.restore();
}
export function finishLine(g, t, x, y, o = {}) {
  const { pop = 1, torn = 0 } = o;
  g.save(); g.translate(x, y); g.scale(pop, pop);
  blob(g, rrect(0, 0, 56, 150, 4, 2, 179, .3), { fill: 'paper', line: GRAPHITE, lw: 4.6, seed: 179, t });
  for (let r = 0; r < 5; r++) for (let c = 0; c < 2; c++) {
    if ((r + c) % 2) hatch(g, rrect(c * 26 - 13, -60 + r * 30 + 15, 24, 27, 3, 2, 170 + r * 2 + c, 0), { col: GRAPHITE, seed: 170 + r * 2 + c, t, gap: 4, w: 6, alpha: .95, spill: 1, dens: 1 });
  }
  // The tape between two little posts, snapped when a dog breaks it.
  [[-64, -1], [64, 1]].forEach(([px, sd], i) => line(g, [[px, 82], [px, -104]], { w: 12, col: WOOD2, seed: 180 + i, t, spline: false, passes: 1, flat: true }));
  if (!torn) line(g, [[-64, -96], [0, -88], [64, -96]], { w: 9, col: C.red, seed: 182, t, spline: true, passes: 1 });
  else [[-1, -64], [1, 64]].forEach(([sd, px], i) => line(g, [[px, -96], [px - sd * 30 * torn, -60 + 50 * torn * torn]], { w: 9, col: C.red, seed: 183 + i, t, spline: true, passes: 1, alpha: 1 - clamp(torn - .6) * 2.5 }));
  g.restore();
}

// ------------------------------------------------------------------- small things
// A puff of dust: a few pale lumps that grow and fade.
export function dust(g, t, x, y, age, o = {}) {
  const { n = 4, big = 1, seed = 1, dir = 1 } = o;
  if (age <= 0 || age > .7) return;
  const p = age / .7;
  g.save(); g.globalAlpha *= .8 * (1 - p * p);
  for (let i = 0; i < n; i++) {
    const a = hash(seed, i, 1), r = (14 + 12 * a) * big * (.5 + p);
    blob(g, ellipse(x - dir * (10 + i * 22 * p) * big, y - 10 - p * 34 * (.4 + a) * big - i * 5, r, r * .8, 8, 0, seed + i), { fill: '#f3e7c8', line: null, seed: seed + i, t, hw: 4.4, tone: .6, dens: .45, solid: false });
  }
  g.restore();
}
// A pound sign, drawn in strokes (the alphabet has none).
export function pound(g, x, y, size, t, o = {}) {
  const { col = GRAPHITE, seed = 1 } = o, k = size / 100;
  const P = pts => pts.map(([a, b]) => [x + a * k, y + b * k]);
  line(g, P([[62, 16], [50, 2], [34, 2], [24, 16], [26, 44], [24, 74], [14, 92]]), { w: size * .11, col, seed, t, passes: 1 });
  line(g, P([[12, 96], [40, 94], [70, 98]]), { w: size * .11, col, seed: seed + 1, t, passes: 1 });
  line(g, P([[6, 50], [46, 48]]), { w: size * .1, col, seed: seed + 2, t, spline: false, passes: 1 });
}
// The dane's price tag: a running cost, £999 A MONTH, on a string.
export function priceTag(g, t, x, y, s, rot = 0, o = {}) {
  const { seed = 200 } = o;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  blob(g, [[-74, -42], [46, -42], [78, 0], [46, 42], [-74, 42]], { fill: '#fbf8ef', shade: '#e6dcc0', line: GRAPHITE, lw: 5, seed, t, hw: 4.6, tone: .95, dens: .25 });
  dot(g, 60, 0, 5, { col: GRAPHITE, seed: seed + 1, t });
  line(g, [[64, 0], [110, -26], [150, -10]], { w: 4, col: GRAPHITE, seed: seed + 2, t, spline: true, passes: 1 });
  pound(g, -66, -20, 36, t, { col: C.red, seed: seed + 3 });
  write(g, '999', -30, 14, 34, { col: C.red, seed: seed + 4, t, w: .12, track: 3 });
  write(g, 'A MONTH', -30, 32, 13, { col: GRAPHITE, seed: seed + 5, t, track: 3, w: .11 });
  g.restore();
}
// A drifting Z for a sleeper.
export function zzz(g, t, x, y, k, seed = 1) {
  const p = ((t * .5 + hash(seed, 3)) % 1);
  g.save(); g.globalAlpha *= Math.sin(p * Math.PI) * .95;
  write(g, 'Z', x + Math.sin(p * 5 + seed) * 8 + p * 20, y - p * 70, 26 + k * 16 + p * 12, { col: C.blue, seed: seed + 7, t, w: .12, rot: .2 });
  g.restore();
}

// ------------------------------------------------------------------- the scoreboard of four dials
// Four tubes, each better the higher it fills; the runner now running is a marker on the fill, and each
// dog that has run leaves its marker beside the tube at its own height. There is no total.
export const DIALS = [
  { name: 'SPEED', col: C.orange, deep: '#c2610f' },
  { name: 'CARE', col: C.green, deep: '#2b7a3a' },
  { name: 'THRIFT', col: C.yellow, deep: '#b98a0d' },
  { name: 'FUN', col: C.pink, deep: '#c23a70' },
];
// A dog's four scores, 0..100, by dial (SPEED, CARE, THRIFT, FUN): the greyhound, the basset, the dane, Bruce.
export const SCORES = [[96, 12, 50, 62], [10, 96, 92, 6], [82, 100, 6, 44], [28, 22, 78, 98]];
export const WIN = [0, 2, 1, 3];                 // the dial each dog is best at: the one its rosette is for
export const BOARD = { x: 60, y: 150, w: 960, h: 460 };
export const COLX = [180, 420, 660, 900];
export const TUBE = { w: 100, top: 300, bot: 522 };
export const tubeY = v => TUBE.bot - (TUBE.bot - TUBE.top) * clamp(v / 100);
const SIDE = [-1, 1, -1, 1];
export const beadPos = (k, i) => [COLX[i] + SIDE[k] * 76, tubeY(SCORES[k][i])];
export const crownPos = i => [COLX[i] + 96, TUBE.top - 46];          // (the four rosettes are the film's point here, so they are big)

// A dog's face as a marker: its coat, its ears, its collar.
export function bead(g, t, k, x, y, r, o = {}) {
  const { seed = 1, eyes = 'dot' } = o, D = LOOKS[k];
  if (k === 1) [-1, 1].forEach((sd, i) => line(g, [[x + sd * r * .78, y - r * .3], [x + sd * r * 1.05, y + r * .5], [x + sd * r * .9, y + r * 1.3]], { w: r * .62, col: D.shade, seed: seed + 3 + i, t, spline: true, passes: 1, taper: [.1, .5] }));
  if (k === 0) [-1, 1].forEach((sd, i) => line(g, [[x + sd * r * .55, y - r * .7], [x + sd * r * .95, y - r * 1.25], [x + sd * r * .95, y - r * .45]], { w: r * .3, col: D.shade, seed: seed + 3 + i, t, spline: false, passes: 1 }));
  if (k === 3) line(g, [[x - r * .85, y - r * .5], [x - r * 1.1, y + r * .3], [x - r * .95, y + r * 1.0]], { w: r * .6, col: D.shade, seed: seed + 3, t, spline: true, passes: 1, taper: [.1, .5] });
  blob(g, ellipse(x, y, r, r, 10, 0, seed), { fill: D.coat, shade: D.shade, line: GRAPHITE, lw: 4.2, seed, t, gap: 5, hw: 4.2, tone: .85, sh: .3 });
  const ec = k === 2 ? '#fbf8ef' : GRAPHITE;
  [-1, 1].forEach((sd, i) => dot(g, x + sd * r * .36, y - r * .12, r * .16, { col: ec, seed: seed + 8 + i, t }));
  line(g, [[x - r * .72, y + r * .58], [x, y + r * .98], [x + r * .72, y + r * .58]], { w: r * .3, col: D.collar, seed: seed + 6, t, spline: true, passes: 1, taper: [.02, .02] });
}

// Icons, one per dial, each acting out what the dial measures.
function iconSpeed(g, t, x, y, r, v) {
  blob(g, rrect(x, y - r - 5, 20, 16, 4, 2, 210), { fill: '#a8a7b2', line: GRAPHITE, lw: 4, seed: 210, t, hw: 4, tone: .8 });
  blob(g, ellipse(x, y, r, r, 12, 0, 211), { fill: '#fbf8ef', line: GRAPHITE, lw: 5.4, seed: 211, t, hw: 4.6, tone: .9, dens: .3 });
  const a = -Math.PI / 2 + (v / 100) * TAU * .8 + t * v * .03;
  line(g, [[x, y], [x + Math.cos(a) * r * .7, y + Math.sin(a) * r * .7]], { w: 6, col: C.red, seed: 212, t, spline: false, passes: 1 });
  dot(g, x, y, 4.5, { col: GRAPHITE, seed: 213, t });
  if (v > 45) [-14, 0, 14].forEach((dy, i) => line(g, [[x - r - 12, y + dy], [x - r - 44 - v * .12, y + dy]], { w: 6, col: C.orange, seed: 214 + i, t, spline: false, passes: 1, taper: [.3, .05] }));
}
function iconCare(g, t, x, y, r, v) {
  const u = smooth((v - 30) / 40);
  [-1, 1].forEach((sd, i) => {
    line(g, [[x + sd * r * .8, y + r * .95], [x + sd * r * .8, y - r * .6]], { w: 10, col: WOOD2, seed: 220 + i, t, spline: false, passes: 1, flat: true });
    line(g, [[x + sd * r * .8 - 12, y + r * .98], [x + sd * r * .8 + 12, y + r * .98]], { w: 8, col: WOOD2, seed: 224 + i, t, spline: false, passes: 1, flat: true });
  });
  const by = lerp(y + r * .8, y - r * .35, u), rot = (1 - u) * .28;
  line(g, [[x - r * .95, by + rot * r * .9], [x + r * .95, by - rot * r * .9]], { w: 14, col: C.red, seed: 222, t, spline: false, passes: 1, flat: true, tooth: .5 });
  [-.5, .25].forEach((f, i) => line(g, [[x + f * r - r * .2, by + rot * r * (-f * .9 + .2)], [x + f * r + r * .2, by + rot * r * (-f * .9 - .2)]], { w: 14, col: '#fbf8ef', seed: 227 + i, t, spline: false, passes: 1, flat: true }));
  if (v > 85) line(g, [[x - r * .4, y - r * 1.05], [x - r * .1, y - r * .8], [x + r * .45, y - r * 1.35]], { w: 8, col: C.green, seed: 223, t, spline: false, passes: 1 });
}
function iconThrift(g, t, x, y, r, v) {
  const f = 1 + v * .0016;
  g.save(); g.translate(x, y + r * .15); g.scale(f, f);
  [-1, 1].forEach((sd, i) => blob(g, rrect(sd * r * .5, r * .78, r * .3, r * .38, 5, 2, 230 + i), { fill: C.pink, line: GRAPHITE, lw: 4.6, seed: 230 + i, t, hw: 4.4, tone: .8 }));
  blob(g, ellipse(0, 0, r * 1.05, r * .82, 12, 0, 232), { fill: C.pink, shade: '#c45a86', line: GRAPHITE, lw: 5.2, seed: 232, t, hw: 4.6, tone: .8, sh: .3 });
  blob(g, ellipse(r * 1.0, r * .1, r * .32, r * .26, 8, 0, 233), { fill: '#f7a3c0', line: GRAPHITE, lw: 4.6, seed: 233, t, hw: 4.4, tone: .8 });
  blob(g, [[r * .35, -r * .68], [r * .62, -r * 1.12], [r * .78, -r * .58]], { fill: '#f7a3c0', line: GRAPHITE, lw: 4.4, seed: 234, t, hw: 4.2, tone: .8 });
  dot(g, r * .58, -r * .16, 3.6, { col: GRAPHITE, seed: 235, t });
  line(g, [[-r * .4, -r * .78], [r * .1, -r * .72]], { w: 6, col: GRAPHITE, seed: 236, t, spline: false, passes: 1 });
  line(g, [[-r * 1.02, -r * .1], [-r * 1.3, -r * .34], [-r * 1.18, -r * .02]], { w: 5, col: GRAPHITE, seed: 237, t, spline: true, passes: 1 });
  g.restore();
  // Coins drop in while it fills.
  if (v > 4 && v < 96) { const p = (t * 1.6) % 1; blob(g, ellipse(x - r * .05, y - r * 1.5 + p * r * .9, r * .2, r * .26, 8, 0, 238), { fill: C.yellow, line: GRAPHITE, lw: 4, seed: 238, t, hw: 4, tone: .9 }); }
}
function iconFun(g, t, x, y, r, v) {
  blob(g, ellipse(x, y, r, r, 12, 0, 240), { fill: C.yellow, shade: C.orange, line: GRAPHITE, lw: 5.2, seed: 240, t, hw: 4.6, tone: .8, sh: .28 });
  const m = clamp(v / 100), happy = v > 55;
  [-1, 1].forEach((sd, i) => {
    if (happy) line(g, [[x + sd * r * .4 - 9, y - r * .1], [x + sd * r * .4, y - r * .3], [x + sd * r * .4 + 9, y - r * .1]], { w: 5.4, col: GRAPHITE, seed: 241 + i, t, spline: true, passes: 1 });
    else dot(g, x + sd * r * .4, y - r * .18, 4.6, { col: GRAPHITE, seed: 241 + i, t });
  });
  if (v > 85) blob(g, [[x - r * .55, y + r * .12], [x + r * .55, y + r * .12], [x + r * .4, y + r * .6], [x, y + r * .78], [x - r * .4, y + r * .6]], { fill: '#7a2e2a', line: GRAPHITE, lw: 4.4, seed: 243, t, hw: 4, tone: .9, gap: 4 });
  else line(g, [[x - r * .42, y + r * (.5 - m * .3)], [x, y + r * (.42 + m * .3)], [x + r * .42, y + r * (.5 - m * .3)]], { w: 5.4, col: GRAPHITE, seed: 243, t, spline: true, passes: 1 });
}
const ICONS = [iconSpeed, iconCare, iconThrift, iconFun];

// The board and its four tubes. `st`: lv (four live levels), cursor (which dog's marker rides the fills),
// beads [{k, a}]: dogs done, `a` 0..1 how far each has slid from the tube's middle to its side, crowns
// [{i, col, pop}]: the rosettes that have landed, `shake` (per dial, 0..1: a tube's wobble).
export function scoreboard(g, t, st) {
  const { lv = [0, 0, 0, 0], cursor = 0, beads = [], crowns = [], shake = [0, 0, 0, 0], pop = 1 } = st, iv = st.iconLv || lv;
  g.save();
  g.translate(W / 2, BOARD.y + BOARD.h / 2); g.scale(pop, pop); g.translate(-W / 2, -(BOARD.y + BOARD.h / 2));
  signBoard(g, t, { label: false });
  DIALS.forEach((D, i) => {
    const cx = COLX[i] + shake[i] * Math.sin(t * 60) * 5;
    ICONS[i](g, t, cx, 232, 40, iv[i]);
    // The tube, and its fill (the current dog's reading).
    const top = tubeY(100), bot = TUBE.bot, y = tubeY(lv[i]);
    blob(g, rrect(cx, (top + bot) / 2, TUBE.w, bot - top + 14, 40, 3, 250 + i), { fill: 'paper', line: GRAPHITE, lw: 5.6, seed: 250 + i, t });
    if (lv[i] > 1.5) hatch(g, rrect(cx, (y + bot) / 2 + 3, TUBE.w - 20, bot - y - 4, 28, 3, 260 + i, 0), { col: D.col, seed: 260 + i, t, gap: 4.6, w: 5.6, angle: -.7, spill: 2, alpha: .95 });
    [.25, .5, .75].forEach((u, j) => line(g, [[cx + TUBE.w / 2 - 2, lerp(bot, top, u)], [cx + TUBE.w / 2 + 12, lerp(bot, top, u)]], { w: 4, col: GRAPHITE, seed: 270 + i * 3 + j, t, spline: false, passes: 1, alpha: .7 }));
    write(g, D.name, cx, 590, D.name.length > 5 ? 40 : 46, { col: D.deep, seed: 280 + i, t, align: 'center', track: 4, w: .1 });
  });
  // The dogs' markers: those that have run, at their own heights; the current one rides its fill.
  beads.forEach(({ k, a }) => DIALS.forEach((D, i) => {
    const [bx, by] = beadPos(k, i);
    const x = lerp(COLX[i], bx, easeOut(a, 2.5));
    bead(g, t, k, x, by, 23, { seed: 300 + k * 10 + i });
    if (a > .9) line(g, [[COLX[i] + SIDE[k] * 52, by], [COLX[i] + SIDE[k] * 60, by]], { w: 4, col: GRAPHITE, seed: 340 + k * 4 + i, t, spline: false, passes: 1, alpha: .7 });
  }));
  if (cursor >= 0) DIALS.forEach((D, i) => bead(g, t, cursor, COLX[i], tubeY(lv[i]) - 2, 29, { seed: 400 + i }));
  crowns.forEach(({ i, col, pop: p }) => { const [x, y] = crownPos(i); g.save(); g.translate(x, y); g.scale(p, p); rosetteAt(g, t, col, 54, i); g.restore(); });
  g.restore();
}
export function rosetteAt(g, t, col, r, seed = 1, tilt = .12) { rosette(g, 0, 0, r, col, t, { seed: 900 + seed * 7, tilt }); }
