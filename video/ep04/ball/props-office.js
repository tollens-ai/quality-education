// Props for the bridge, in the crew's office. Every one is drawn, never lettered: a browser is tabs
// and an address bar of squiggles round a picture; a playbook is X's, O's and arrows; Mabel's notes
// are pencil barbells; the phone call is a candlestick telephone. Also YOUR hand (the viewer who
// briefs the crew): a human hand in a white shirt cuff and a dark sleeve, reaching in from below.
import { TAU, clamp, lerp, now, hash, noise, rng, easeOut, backOut, smooth } from './kit.js';
import { INK, WHITE, CREAM, PAPER, CLAWD, TEAL, ROSE, PLUM, OCHRE, GOLD, GOLD_SH, GREEN, GREEN_SH, RED, WOOD, WOOD_SH, BROWN, SLATE, GREY, TIN, LILAC, SKIN, SKIN_SH, C, sh, lt } from './palette.js';
import { shape, line, stroke, rrect, ellipse, spline, xf, dot, paint, pathOf, arc, bez, glove, eye, hose, bbox } from './ink.js';
import { qmark, bang, heart, star, blinkAt, mouth, brows } from './rig.js';
import { clawd } from './clawd.js';
import { critter, mabel } from './people.js';
import { APP, appLogo } from './gymapp.js';

export const BOT_COLS = ['#7fc4a8', '#ebb942', '#a990c9'];   // the fresh bots' beanies: mint, gold, lilac
const BAR = '#3a3236';

// ---------------------------------------------------------------- a fresh bot
// A little Clawd in a propeller beanie: k 0, 1, 2 picks the beanie's colour. Eager: a bigger bounce.
export function bot(g, x, y, s, k, o = {}) {
  return clawd(g, x, y, s, { dance: .95, eyes: { expr: 'wide' }, ...o, hat: 'beanie', hatCol: BOT_COLS[k], phase: (o.phase ?? 0) + k * .33 });
}

// ---------------------------------------------------------------- squiggles: greeked text
export function squig(g, x, y, len, o = {}) {
  const P = [], n = Math.max(6, Math.round(len / 9)), amp = o.amp ?? 4, seed = o.seed ?? 1;
  for (let i = 0; i <= n; i++) P.push([x + i / n * len, y + Math.sin(i * 1.7 + seed) * amp * (i % 2 ? 1 : .5)]);
  stroke(g, P, { w: o.w ?? 4, seed, color: o.col || '#6a5a52', taper: true, raw: true });
}
export function squigLines(g, x, y, len, n, gap, o = {}) {
  for (let i = 0; i < n; i++) squig(g, x, y + i * gap, len * (i === n - 1 ? (o.last ?? .6) : lerp(.85, 1, hash(o.seed ?? 3, i))), { ...o, seed: (o.seed ?? 3) + i * 7 });
}

// ---------------------------------------------------------------- your hand
// A human hand from behind the camera, its fingers pointing along ang (−π/2 is straight up), (x, y)
// the middle of the back of the hand; the forearm runs back out of the bottom of the frame in a dark
// sleeve with a white shirt cuff. pose: 'open' | 'hold' (thumb over an edge, fingers behind it) |
// 'tap' (index finger out) | 'pinch'.
const HSKIN = '#f2c9a0', HSKIN_SH = '#c99069', SLEEVE = '#272a36';
export function yourHand(g, x, y, ang, s = 1, pose = 'open', o = {}) {
  g.save(); g.translate(x, y); g.rotate(ang + Math.PI / 2);
  const lw = 6 * s, seed = o.seed ?? 3300;
  // the sleeve and the cuff, back down the arm (local +y is toward the wrist)
  const len = o.arm ?? 2400;
  const sleeve = [[-78 * s, 112 * s], [78 * s, 112 * s], [92 * s, len], [-92 * s, len]];
  shape(g, sleeve, { fill: SLEEVE, shade: '#14151c', lit: '#4a5064', form: 'block', w: lw, seed: seed + 1, amt: .5 });
  stroke(g, [[30 * s, 170 * s], [44 * s, 320 * s], [36 * s, 520 * s]], { w: 3 * s, seed: seed + 2, color: '#4a5064' });
  shape(g, rrect(-70 * s, 64 * s, 140 * s, 58 * s, 12 * s), { fill: WHITE, shade: '#cfc6b4', form: 'block', w: lw, seed: seed + 3 });
  stroke(g, [[-70 * s, 100 * s], [70 * s, 100 * s]], { w: 2.4 * s, seed: seed + 4, color: '#bfb5a2' });
  shape(g, ellipse(-58 * s, 92 * s, 10 * s, 12 * s), { fill: GOLD, w: 3 * s, seed: seed + 5, gloss: { x: .3, y: .25, w: .2, h: .14, dot: false } });
  // fingers: [x at the knuckle, length, width, splay]; curled fingers are short nubs
  const F = [[-36, 104, 25, -.12], [-12, 116, 26, -.03], [13, 110, 25, .05], [36, 88, 22, .14]];
  const ext = pose === 'open' ? [1, 1, 1, 1] : pose === 'tap' ? [1, .3, .3, .3] : pose === 'pinch' ? [.75, .32, .32, .32] : [.56, .6, .58, .52];
  const finger = (i, behind) => {
    const [fx, L0, fw, sp] = F[i], L = L0 * ext[i] * s, a = sp + (pose === 'tap' && i === 0 ? .05 : 0);
    const bx = fx * s, by = -48 * s, tx = bx + Math.sin(a) * L, ty = by - Math.cos(a) * L;
    if (ext[i] < .5) { shape(g, ellipse((bx + tx) / 2, by - 10 * s, fw * .62 * s, 22 * s, a), { fill: HSKIN, shade: HSKIN_SH, k: .8, w: lw * .9, seed: seed + 10 + i, amt: .3 }); return; }
    if (pose === 'hold') { const P2 = rrect(bx - fw * .5 * s, ty - 4 * s, fw * s, by - ty + 16 * s, fw * .5 * s); shape(g, xf(P2.map(([px, py]) => [px - bx, py - by]), bx, by, 1, a), { fill: HSKIN, shade: HSKIN_SH, form: 'block', k: .8, w: lw * .9, seed: seed + 10 + i, amt: .3 }); shape(g, ellipse(tx, ty + 12 * s, fw * .28 * s, 9 * s, a), { fill: '#f8dcc4', w: 2 * s, seed: seed + 20 + i, form: false, amt: .2 }); return; }
    const P = spline([[bx - fw * .5 * s, by + 8 * s], [tx - fw * .5 * s * Math.cos(a), ty + fw * .5 * s * Math.sin(a) + 10 * s], [tx, ty - fw * .1 * s], [tx + fw * .5 * s * Math.cos(a), ty - fw * .5 * s * Math.sin(a) + 10 * s], [bx + fw * .5 * s, by + 8 * s]], true, 5);
    shape(g, P, { fill: HSKIN, shade: HSKIN_SH, form: 'block', k: .8, w: lw * .9, seed: seed + 10 + i, amt: .3 });
    // the nail and the knuckle creases
    shape(g, ellipse(tx - Math.sin(a) * 12 * s, ty + Math.cos(a) * 14 * s, fw * .26 * s, 11 * s, a), { fill: '#f8dcc4', w: 2 * s, seed: seed + 20 + i, form: false, amt: .2 });
    for (const u of [.42, .7]) { const cxk = lerp(bx, tx, u), cyk = lerp(by, ty, u); stroke(g, [[cxk - fw * .22 * s, cyk + 2 * s], [cxk, cyk - 1 * s], [cxk + fw * .22 * s, cyk + 2 * s]], { w: 2 * s, seed: seed + 30 + i + u, color: HSKIN_SH }); }
  };
  if (pose !== 'hold') for (let i = 3; i >= 0; i--) finger(i);
  // the back of the hand
  const back = spline([[-52 * s, -50 * s], [-20 * s, -60 * s], [24 * s, -60 * s], [52 * s, -46 * s], [50 * s, 20 * s], [40 * s, 70 * s], [-40 * s, 70 * s], [-54 * s, 20 * s]], true, 5);
  shape(g, back, { fill: HSKIN, shade: HSKIN_SH, form: 'round', cx: .4, cy: .3, k: .8, w: lw, seed: seed + 40 });
  for (let i = 0; i < 4; i++) stroke(g, [[F[i][0] * s - 6 * s, -44 * s], [F[i][0] * s, -48 * s], [F[i][0] * s + 6 * s, -44 * s]], { w: 2.2 * s, seed: seed + 41 + i, color: HSKIN_SH });
  if (pose === 'hold') for (let i = 3; i >= 0; i--) finger(i);
  // the thumb, on the left of a right hand seen from behind (behind the thing it holds, for 'hold')
  if (pose === 'hold') { g.restore(); return; }
  const thumbA = pose === 'hold' ? -.2 : pose === 'pinch' ? .2 : -.6, tl = (pose === 'hold' ? 70 : 76) * s;
  const tb = [-46 * s, 4 * s], tt = [tb[0] + Math.sin(thumbA) * tl, tb[1] - Math.cos(thumbA) * tl];
  const T = spline([[tb[0] - 14 * s, tb[1] + 22 * s], [tt[0] - 16 * s, tt[1] + 6 * s], [tt[0], tt[1] - 10 * s], [tt[0] + 16 * s, tt[1] + 8 * s], [tb[0] + 22 * s, tb[1] + 6 * s]], true, 5);
  shape(g, T, { fill: HSKIN, shade: HSKIN_SH, form: 'block', k: .8, w: lw * .95, seed: seed + 50 });
  shape(g, ellipse(tt[0] + Math.sin(thumbA) * -6 * s, tt[1] + 10 * s, 7 * s, 10 * s, thumbA), { fill: '#f8dcc4', w: 2 * s, seed: seed + 51, form: false, amt: .2 });
  g.restore();
}
// Your hand offered palm up, seen from the side, in from the right (dir 1) or the left (dir −1):
// (x, y) is the middle of the palm's upturned surface, where something can stand on it. The fingers
// reach toward the middle of the frame and curl up a little at their tips; the thumb rises behind;
// the white cuff and the dark sleeve run back out of the frame's edge.
export function yourPalm(g, x, y, s = 1, dir = 1, o = {}) {
  g.save(); g.translate(x, y); g.scale(dir, 1);
  const lw = 6 * s, seed = o.seed ?? 3380, cup = o.cup ?? 0;
  // the sleeve and cuff, back out to the edge
  shape(g, [[96 * s, -18 * s], [2400, -40 * s], [2400, 150 * s], [96 * s, 92 * s]], { fill: SLEEVE, shade: '#14151c', lit: '#4a5064', form: 'block', w: lw, seed: seed + 1, amt: .5 });
  stroke(g, [[180 * s, 30 * s], [360 * s, 40 * s], [560 * s, 36 * s]], { w: 3 * s, seed: seed + 2, color: '#4a5064' });
  shape(g, rrect(70 * s, -26 * s, 54 * s, 124 * s, 14 * s), { fill: WHITE, shade: '#cfc6b4', form: 'block', w: lw, seed: seed + 3 });
  shape(g, ellipse(104 * s, 30 * s, 10 * s, 12 * s), { fill: GOLD, w: 3 * s, seed: seed + 5, gloss: { x: .3, y: .25, w: .2, h: .14, dot: false } });
  // the thumb, rising behind the palm
  shape(g, spline([[30 * s, 4 * s], [10 * s, -40 * s], [-14 * s, -64 * s], [-34 * s, -60 * s], [-26 * s, -36 * s], [-6 * s, -4 * s]], true, 5), { fill: HSKIN_SH, shade: '#a8704c', form: 'block', k: .7, w: lw * .9, seed: seed + 6 });
  // the hand: thick at the wrist, the palm's surface on top, the fingers tapering, their tips curling up
  const tip = -150 * s, curl = (14 + cup * 26) * s;
  const H = spline([[78 * s, -14 * s], [20 * s, -6 * s], [-60 * s, -6 * s], [-118 * s, -10 * s], [tip + 6 * s, -10 * s - curl], [tip - 4 * s, -4 * s - curl * .6], [tip, 8 * s], [-110 * s, 26 * s], [-30 * s, 52 * s], [40 * s, 74 * s], [80 * s, 80 * s]], true, 6);
  shape(g, H, { fill: HSKIN, shade: HSKIN_SH, form: 'round', cx: .5, cy: .2, k: .8, w: lw, seed: seed + 7 });
  // the upturned palm, a shade lighter, and its creases
  shape(g, spline([[70 * s, -10 * s], [0, -4 * s], [-70 * s, -4 * s], [-112 * s, -8 * s], [-70 * s, 6 * s], [0, 8 * s], [60 * s, 4 * s]], true, 5), { fill: '#f8dcc0', form: false, w: 0, seed: seed + 8 });
  stroke(g, [[30 * s, 0], [-20 * s, 4 * s], [-60 * s, 2 * s]], { w: 2.2 * s, seed: seed + 9, color: HSKIN_SH });
  // the fingers' ends, one behind another, and their nails
  for (let i = 0; i < 3; i++) { const fx = tip + (14 + i * 20) * s, fy = -6 * s - curl * (1 - i * .25); stroke(g, [[fx, fy], [fx + 10 * s, fy + 18 * s], [fx + 4 * s, fy + 36 * s]], { w: 2.4 * s, seed: seed + 10 + i, color: HSKIN_SH }); }
  stroke(g, [[-124 * s, 22 * s], [-80 * s, 32 * s], [-30 * s, 42 * s]], { w: 2.4 * s, seed: seed + 14, color: HSKIN_SH });
  g.restore();
}
// The hand's travel: in from below over `d` seconds from t0, out again from t1. Returns 0..1.
export function reach(t, t0, t1, d = .22) { return t < t0 || t > t1 + d ? 0 : Math.min(easeOut(clamp((t - t0) / d), 3), 1 - easeOut(clamp((t - t1) / d), 2) * 1); }

// A white cartoon glove pointing straight at the camera, foreshortened: the fist, its curled fingers,
// the thumb, and the index finger coming at you. (x, y) the fist; `from` the arm's direction.
export function pointAtYou(g, x, y, s = 1, o = {}) {
  const sh0 = '#cfc3ae', lw = 5.5 * s, from = o.from ?? .6;
  const cx = x + Math.cos(from) * 44 * s, cy = y + Math.sin(from) * 44 * s;
  shape(g, ellipse(cx, cy, 36 * s, 32 * s, from), { fill: WHITE, shade: sh0, form: 'round', w: lw, seed: 3360 });
  stroke(g, [[cx - Math.sin(from) * 28 * s, cy + Math.cos(from) * 28 * s], [cx + Math.sin(from) * 28 * s, cy - Math.cos(from) * 28 * s]], { w: lw * .6, seed: 3361 });
  shape(g, ellipse(x, y, 52 * s, 46 * s), { fill: WHITE, shade: sh0, form: 'round', cx: .35, cy: .3, w: lw, seed: 3362 });
  for (let i = 0; i < 3; i++) shape(g, ellipse(x + (i - 1) * 26 * s + 6 * s, y + 30 * s, 15 * s, 12 * s), { fill: WHITE, shade: sh0, k: .6, w: lw * .8, seed: 3363 + i });
  shape(g, ellipse(x + 20 * s, y - 2 * s, 30 * s, 13 * s, -.5), { fill: WHITE, shade: sh0, k: .6, w: lw * .85, seed: 3366 });
  // the finger: its side, then its round tip toward us
  shape(g, ellipse(x - 12 * s, y - 16 * s, 27 * s, 25 * s), { fill: WHITE, shade: sh0, form: 'round', cx: .3, cy: .25, w: lw, seed: 3367, gloss: { x: .3, y: .25, w: .14, h: .1, dot: false } });
  stroke(g, [[x - 26 * s, y - 20 * s], [x - 12 * s, y - 30 * s], [x + 2 * s, y - 22 * s]], { w: lw * .45, seed: 3368, color: '#bfb3a0' });
}

// ---------------------------------------------------------------- the crate
// A shipping crate standing on (x, y). Stencilled with a bot's face and "this way up" arrows. o.age:
// seconds since it burst (planks fly, straw puffs), o.squash.
export function crate(g, x, y, s = 1, o = {}) {
  const w = 360 * s, h = 250 * s, age = o.age ?? -1, sq = o.squash ?? 0;
  const W2 = w * (1 + sq * .4), H2 = h * (1 - sq * .3);
  const x0 = x - W2 / 2, y0 = y - H2;
  const wood = '#c4935c', woodD = '#8a5a30';
  const plank = (P, seed, col = wood) => shape(g, P, { fill: col, shade: sh(col, .35), lit: lt(col, .25), form: 'block', w: 6 * s, seed, amt: .6 });
  if (age < 0) {
    // the top: a thin strip of lid seen from a little above
    plank([[x0 - 6 * s, y0 - 24 * s], [x0 + W2 + 6 * s, y0 - 24 * s], [x0 + W2 + 6 * s, y0 + 4 * s], [x0 - 6 * s, y0 + 4 * s]], 3401, '#d8a86c');
    for (let i = 0; i < 4; i++) { const py = y0 + 4 * s + i * H2 / 4; plank(rrect(x0, py, W2, H2 / 4 - 4 * s, 4 * s), 3402 + i); stroke(g, [[x0 + 30 * s, py + H2 / 8 + 4 * s], [x0 + W2 - 30 * s, py + H2 / 8 - 2 * s]], { w: 2 * s, seed: 3410 + i, color: woodD }); }
    for (const d of [0, 1]) plank(rrect(x0 + d * (W2 - 34 * s), y0 + 2 * s, 34 * s, H2 - 2 * s, 4 * s), 3420 + d, '#b07e48');
    // the stencils, in a dark ink worn into the grain: a bot's face, and "this way up"
    g.save(); g.globalAlpha *= .88;
    const fx = x - 50 * s, fy = y0 + H2 * .5;
    shape(g, rrect(fx - 84 * s, fy - 62 * s, 168 * s, 124 * s, 30 * s), { fill: null, w: 10 * s, seed: 3430, line: '#3a2414' });
    for (const d of [-1, 1]) shape(g, ellipse(fx + d * 32 * s, fy - 6 * s, 13 * s, 30 * s), { fill: '#3a2414', w: 0, seed: 3431 + d, form: false });
    stroke(g, [[fx - 26 * s, fy + 34 * s], [fx, fy + 44 * s], [fx + 26 * s, fy + 34 * s]], { w: 7 * s, seed: 3432, color: '#3a2414' });
    for (const d of [-1, 1]) { const ax = x + 104 * s + d * 24 * s; stroke(g, [[ax, fy + 40 * s], [ax, fy - 30 * s]], { w: 9 * s, seed: 3433 + d, color: '#3a2414', taper: false, raw: true }); shape(g, [[ax - 19 * s, fy - 22 * s], [ax, fy - 50 * s], [ax + 19 * s, fy - 22 * s]], { fill: '#3a2414', w: 0, seed: 3435 + d, form: false }); }
    stroke(g, [[x + 66 * s, fy + 52 * s], [x + 142 * s, fy + 52 * s]], { w: 8 * s, seed: 3437, color: '#3a2414', taper: false, raw: true });
    g.restore();
    return;
  }
  // bursting: the boards fly out and tumble; the straw puffs up
  const R = rng(3440);
  const fly = (P, seed, col, vx, vy, spin) => {
    const b = bbox(P), cx0 = (b.x0 + b.x1) / 2, cy0 = (b.y0 + b.y1) / 2;
    const px = cx0 + vx * age * s, py = cy0 + vy * age * s + 2600 * age * age * s, rot = spin * age;
    g.save(); g.translate(px, py); g.rotate(rot); g.translate(-cx0, -cy0); plank(P, seed, col); g.restore();
  };
  // the straw: a nest left in the bottom, and wisps flung out
  for (let i = 0; i < 40; i++) {
    const a = -Math.PI * (.1 + R() * .8), sp = lerp(200, 900, R()), L = lerp(18, 40, R()) * s;
    const px = x + lerp(-W2 * .4, W2 * .4, R()) + Math.cos(a) * sp * age * s, py = y - 30 * s + Math.sin(a) * sp * age * s + 1800 * age * age * s;
    if (age > .9) continue;
    stroke(g, [[px, py], [px + L * .5, py - L * .3], [px + L, py + L * .1]], { w: 3 * s, seed: 3450 + i, color: R() < .5 ? '#e8c46a' : '#c99a40' });
  }
  for (let i = 0; i < 4; i++) { const sd = i % 2 ? 1 : -1, v = sd * (1100 + R() * 900); fly(rrect(x0, y0 + 4 * s + i * H2 / 4, W2, H2 / 4 - 4 * s, 4 * s), 3460 + i, wood, v, -700 - R() * 900, sd * (8 + R() * 8)); }
  for (const d of [0, 1]) fly(rrect(x0 + d * (W2 - 34 * s), y0, 34 * s, H2, 4 * s), 3470 + d, '#b07e48', (d ? 1 : -1) * 1600, -600, (d ? 1 : -1) * 11);
  fly([[x0 - 6 * s, y0 - 24 * s], [x0 + W2 + 6 * s, y0 - 24 * s], [x0 + W2 + 6 * s, y0 + 4 * s], [x0 - 6 * s, y0 + 4 * s]], 3475, '#d8a86c', 200, -1700, 6);
  // the crate's floor and a nest of straw stay behind
  plank(rrect(x0 + 10 * s, y - 26 * s, W2 - 20 * s, 26 * s, 6 * s), 3480, '#a87444');
  for (let i = 0; i < 26; i++) { const px = x + lerp(-W2 * .42, W2 * .42, R()), py = y - 22 * s - R() * 30 * s; stroke(g, [[px - 16 * s, py], [px, py - 10 * s], [px + 18 * s, py + 2 * s]], { w: 3 * s, seed: 3490 + i, color: R() < .5 ? '#e8c46a' : '#c99a40' }); }
}
// A coil spring from (x, yBase) up to (x, yTop).
export function spring(g, x, yBase, yTop, s = 1, o = {}) {
  const n = o.n ?? 7, r = (o.r ?? 22) * s, P = [];
  for (let i = 0; i <= n * 16; i++) { const a = i / 16 * TAU; P.push([x + Math.cos(a) * r + (o.lean ?? 0) * (i / (n * 16)), lerp(yBase, yTop, i / (n * 16)) + Math.sin(a) * r * .28]); }
  line(g, P, { w: 9 * s, taper: false, seed: 3500, heavy: .1 });
  line(g, P, { w: 4 * s, taper: false, seed: 3501, color: '#c9c4b8', heavy: 0, boilAmt: .3 });
}

// ---------------------------------------------------------------- a browser window
// (x, y) top left, w × h. o.content(g, cx, cy, cw, ch) draws the page, clipped. o.tabs: 1..3.
export function browserWin(g, x, y, w, h, o = {}) {
  const k = w / 600, frame = o.frame || '#e7dfcc';
  shape(g, rrect(x, y, w, h, 22 * k), { fill: frame, shade: '#b8ab90', lit: '#fbf6ea', form: 'block', w: 7 * k, seed: 3600 + (o.seed ?? 0), gloss: { x: .05, y: .04, w: .03, h: .02 } });
  // the tab strip
  const ty = y + 14 * k, th = 46 * k;
  for (let i = (o.tabs ?? 2) - 1; i >= 0; i--) {
    const tx = x + 92 * k + i * 150 * k, act = i === 0;
    shape(g, spline([[tx - 6 * k, ty + th], [tx + 10 * k, ty + 4 * k], [tx + 26 * k, ty], [tx + 128 * k, ty], [tx + 144 * k, ty + 4 * k], [tx + 160 * k, ty + th]], true, 4), { fill: act ? '#fbf7ec' : '#d6ccb4', form: false, w: 4.5 * k, seed: 3610 + i });
    shape(g, ellipse(tx + 34 * k, ty + th * .52, 9 * k, 9 * k), { fill: act ? (o.favicon || '#d6677f') : '#a89c84', w: 3 * k, seed: 3615 + i, form: false });
    squig(g, tx + 52 * k, ty + th * .52, 76 * k, { w: 3.4 * k, amp: 3 * k, seed: 3617 + i, col: act ? '#6a5a52' : '#8a7e6a' });
  }
  // three round buttons, in colours that mean nothing
  for (let i = 0; i < 3; i++) shape(g, ellipse(x + 26 * k + i * 22 * k, ty + th * .5, 7.5 * k, 7.5 * k), { fill: ['#c9a06a', '#e2c87e', '#b9b3a4'][i], w: 2.6 * k, seed: 3620 + i, form: false });
  // the toolbar: back, forward, the reload arrow, and an address bar of squiggles
  const by = ty + th, bh = 54 * k;
  shape(g, rrect(x + 6 * k, by, w - 12 * k, bh, 6 * k), { fill: '#fbf7ec', form: false, w: 0, seed: 3625 });
  for (const d of [0, 1]) { const ax = x + 34 * k + d * 38 * k, ay = by + bh / 2, dir = d ? 1 : -1; stroke(g, [[ax - dir * 12 * k, ay], [ax + dir * 10 * k, ay]], { w: 5 * k, seed: 3626 + d, color: '#8a7e6a', taper: false }); stroke(g, [[ax + dir * 2 * k, ay - 10 * k], [ax + dir * 12 * k, ay], [ax + dir * 2 * k, ay + 10 * k]], { w: 5 * k, seed: 3628 + d, color: '#8a7e6a', taper: false }); }
  reloadArrow(g, x + 128 * k, by + bh / 2, 13 * k, '#8a7e6a', o.spin ?? 0);
  shape(g, rrect(x + 160 * k, by + 9 * k, w - 190 * k, bh - 18 * k, (bh - 18 * k) / 2), { fill: WHITE, form: false, w: 3.5 * k, seed: 3630, line: '#9a8e78' });
  squig(g, x + 186 * k, by + bh / 2, Math.min(240 * k, w - 260 * k), { w: 3.4 * k, amp: 3 * k, seed: 3631, col: '#8a7e6a' });
  // the page
  const cx = x + 12 * k, cy = by + bh + 4 * k, cw = w - 24 * k, ch = h - (cy - y) - 14 * k;
  shape(g, rrect(cx, cy, cw, ch, 8 * k), { fill: o.page || '#fbf7ec', form: false, w: 4 * k, seed: 3640, amt: .3 });
  if (o.content) { g.save(); g.beginPath(); g.rect(cx + 2 * k, cy + 2 * k, cw - 4 * k, ch - 4 * k); g.clip(); o.content(g, cx, cy, cw, ch, k); g.restore(); }
  return { x, y, w, h, page: [cx, cy, cw, ch], k };
}
// The reload arrow: three-quarters of a circle with an arrowhead.
export function reloadArrow(g, x, y, r, col = INK, rot = 0) {
  const P = []; for (let i = 0; i <= 20; i++) { const a = rot - Math.PI * .35 + i / 20 * Math.PI * 1.55; P.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
  stroke(g, P, { w: r * .36, seed: 3650, color: col, taper: false, raw: true });
  const a = rot - Math.PI * .35 + Math.PI * 1.55, ex = x + Math.cos(a) * r, ey = y + Math.sin(a) * r, tx = -Math.sin(a), ty = Math.cos(a);
  shape(g, [[ex + Math.cos(a) * r * .45, ey + Math.sin(a) * r * .45], [ex + tx * r * .55, ey + ty * r * .55], [ex - Math.cos(a) * r * .45, ey - Math.sin(a) * r * .45]], { fill: col, w: 0, seed: 3651, form: false });
}
// A globe, the web: blue sea, sand-coloured lands drifting round, meridians, on (x, y) radius r.
export function globe(g, x, y, r, t = now()) {
  const P = ellipse(x, y, r, r, 0, 48);
  shape(g, P, { fill: '#7fb3d6', shade: '#3f6f98', lit: '#d4ecf6', form: 'round', w: Math.max(3, r * .07), seed: 3660, gloss: { x: .28, y: .2, w: .1, h: .07 } });
  g.save(); pathOf(g, P, true); g.clip();
  const lands = [[-.5, -.35, .38, .26], [.2, -.1, .3, .4], [-.15, .45, .4, .2], [.7, .3, .26, .3], [-.9, .1, .3, .3]];
  const spin = (t * .25) % 2;
  for (let k = -1; k <= 1; k++) for (const [lx, ly, rx, ry] of lands) {
    let u = lx + spin + k * 2; if (u < -1.4 || u > 1.4) continue;
    const sx = Math.sin(u * Math.PI / 2.8) * r * 1.02, sq = Math.cos(u * Math.PI / 2.8);
    shape(g, spline(ellipse(x + sx, y + ly * r, rx * r * Math.max(.15, sq), ry * r, 0, 10).map(([a, b], i) => [a + Math.sin(i * 2.1 + lx * 9) * r * .05 * sq, b + Math.cos(i * 1.7 + ly * 9) * r * .05]), true, 3), { fill: '#e6c886', shade: '#b08f4c', form: false, w: Math.max(2, r * .035), seed: 3661 + lx * 10, amt: .2 });
  }
  for (const k of [-.5, 0, .5]) { g.save(); g.strokeStyle = C('#2f5a7c'); g.globalAlpha *= .35; g.lineWidth = Math.max(1.5, r * .02); g.beginPath(); g.ellipse(x, y, r * Math.abs(Math.cos(k * Math.PI / 2 + spin)), r, 0, 0, TAU); g.stroke(); g.beginPath(); g.ellipse(x, y + k * r * .9, r * Math.sqrt(1 - k * k * .81), r * .12, 0, 0, TAU); g.stroke(); g.restore(); }
  g.restore();
  line(g, P, { w: Math.max(3, r * .07), closed: true, seed: 3662 });
}

// ---------------------------------------------------------------- the playbook
// A coach's book of plays on (x, y) (its centre), w wide; o.open 0..1 swings the cover open.
export function playbook(g, x, y, w, o = {}) {
  const p = clamp(o.open ?? 1), h = w * .62, pw = w / 2, k = w / 400;
  const cover = '#6a3a5c';
  // the back cover and the right page
  shape(g, rrect(x - pw - 8 * k, y - h / 2 - 8 * k, w + 16 * k, h + 16 * k, 10 * k), { fill: cover, form: 'block', w: 6 * k, seed: 3700 });
  const page = (x0, flip, seed) => {
    shape(g, rrect(x0, y - h / 2, pw, h, 6 * k), { fill: '#f7f0dc', shade: '#d6c8a8', form: 'block', k: .5, w: 4.5 * k, seed });
    // the play: O's in a line, X's facing them, arrows curling round
    const cx = x0 + pw / 2;
    for (let i = 0; i < 3; i++) { const ox = cx + (i - 1) * 46 * k * flip, oy = y + 40 * k; shape(g, ellipse(ox, oy, 13 * k, 13 * k), { fill: null, w: 5.5 * k, seed: seed + 1 + i }); }
    for (let i = 0; i < 2; i++) { const xx = cx + (i - .5) * 70 * k * flip, xy = y - 46 * k; stroke(g, [[xx - 13 * k, xy - 13 * k], [xx + 13 * k, xy + 13 * k]], { w: 6 * k, seed: seed + 5 + i, taper: false }); stroke(g, [[xx + 13 * k, xy - 13 * k], [xx - 13 * k, xy + 13 * k]], { w: 6 * k, seed: seed + 7 + i, taper: false }); }
    const A = (a, b, c, seed2) => { const P = spline([a, b, c], false, 8); stroke(g, P, { w: 4.5 * k, seed: seed2, taper: false, raw: true }); const e = P[P.length - 1], f = P[P.length - 3], ang = Math.atan2(e[1] - f[1], e[0] - f[0]); shape(g, [[e[0] + Math.cos(ang) * 12 * k, e[1] + Math.sin(ang) * 12 * k], [e[0] + Math.cos(ang + 2.4) * 12 * k, e[1] + Math.sin(ang + 2.4) * 12 * k], [e[0] + Math.cos(ang - 2.4) * 12 * k, e[1] + Math.sin(ang - 2.4) * 12 * k]], { fill: INK, w: 0, seed: seed2 + 1, form: false }); };
    A([cx - 46 * k * flip, y + 24 * k], [cx - 70 * k * flip, y - 10 * k], [cx - 40 * k * flip, y - 74 * k], seed + 10);
    A([cx + 46 * k * flip, y + 24 * k], [cx + 20 * k * flip, y], [cx + 50 * k * flip, y - 30 * k], seed + 12);
    A([cx, y + 24 * k], [cx + 10 * k * flip, y - 6 * k], [cx - 8 * k * flip, y - 40 * k], seed + 14);
  };
  page(x, 1, 3710);
  // the left leaf: the cover swinging over the spine, then the left page
  const a = p * Math.PI, wl = Math.cos(a) * pw;
  if (wl > 0) {
    g.save(); g.translate(x, 0); g.scale(Math.max(.02, wl / pw), 1); g.translate(-x, 0);
    shape(g, rrect(x, y - h / 2 - 8 * k, pw + 8 * k, h + 16 * k, 10 * k), { fill: cover, shade: sh(cover, .4), lit: lt(cover, .3), form: 'block', w: 6 * k, seed: 3730, gloss: { x: .2, y: .1, w: .06, h: .04 } });
    // a gold emblem on the cover: a curling arrow, as a coach draws a run
    const ex = x + pw * .5, A = spline([[ex - 50 * k, y + 24 * k], [ex - 20 * k, y - 30 * k], [ex + 20 * k, y + 10 * k], [ex + 44 * k, y - 26 * k]], false, 8);
    stroke(g, A, { w: 7 * k, seed: 3731, color: GOLD, taper: false, raw: true });
    const e = A[A.length - 1], f = A[A.length - 3], an = Math.atan2(e[1] - f[1], e[0] - f[0]);
    shape(g, [[e[0] + Math.cos(an) * 18 * k, e[1] + Math.sin(an) * 18 * k], [e[0] + Math.cos(an + 2.3) * 16 * k, e[1] + Math.sin(an + 2.3) * 16 * k], [e[0] + Math.cos(an - 2.3) * 16 * k, e[1] + Math.sin(an - 2.3) * 16 * k]], { fill: GOLD, w: 0, seed: 3732, form: false });
    g.restore();
  } else {
    const ww = -wl;
    g.save(); g.translate(x, 0); g.scale(-Math.max(.02, ww / pw), 1); g.translate(-x, 0);
    page(x, -1, 3740);
    g.restore();
  }
  stroke(g, [[x, y - h / 2 - 4 * k], [x, y + h / 2 + 4 * k]], { w: 4 * k, seed: 3750, taper: false });
}

// ---------------------------------------------------------------- a thought bubble
// A cloud centred (x, y), w × h, with puffs trailing to `from`. o.inside(g, x, y, w, h) draws in it.
export function thought(g, x, y, w, h, o = {}) {
  const p = clamp(o.p ?? 1), n = 11, P = [];
  for (let i = 0; i < n; i++) {
    const a0 = i / n * TAU, a1 = (i + 1) / n * TAU;
    for (let j = 0; j <= 6; j++) { const a = lerp(a0, a1, j / 6), bump = Math.sin(j / 6 * Math.PI) * .14; P.push([x + Math.cos(a) * w / 2 * (1 + bump), y + Math.sin(a) * h / 2 * (1 + bump * 1.2)]); }
  }
  if (o.from) {
    const [fx, fy] = o.from;
    for (let i = 0; i < 3; i++) { const u = (i + 1) / 4, r = lerp(10, 26, u) * (w / 420); if (p < u * .6) continue; shape(g, ellipse(lerp(fx, x - w * .18, u), lerp(fy, y + h * .42, u), r, r * .85), { fill: WHITE, form: false, w: 4, seed: 3800 + i }); }
  }
  if (p < .45) return;
  const sc = backOut(clamp((p - .45) / .55), 2);
  g.save(); g.translate(x, y); g.scale(sc, sc); g.translate(-x, -y);
  shape(g, P, { fill: WHITE, shade: '#dcd2c0', form: 'round', k: .5, w: 6, seed: 3810 });
  if (o.inside) { g.save(); pathOf(g, ellipse(x, y, w / 2 * .98, h / 2 * .96, 0, 40), true); g.clip(); o.inside(g, x, y, w, h); g.restore(); }
  g.restore();
}

// ---------------------------------------------------------------- icons: barbell, padlock, coin
export function barbellIcon(g, x, y, s = 1, o = {}) {
  const col = o.col || BAR, lw = (o.w ?? 4) * s;
  if (o.pencil) {
    // Mabel's pencil sketch: a sketchy bar and plates, graphite grey, a little wobbly
    const pc = '#5d5a62', R = rng(o.seed ?? 1);
    for (let k = 0; k < 2; k++) stroke(g, [[x - 50 * s, y + R() * 2 * s], [x, y - 1.5 * s + R() * 2 * s], [x + 50 * s, y + R() * 2 * s]], { w: 3 * s, seed: (o.seed ?? 1) + k, color: pc });
    for (const d of [-1, 1]) for (const [ox, hh] of [[34, 22], [44, 16]]) { const px = x + d * ox * s; stroke(g, [[px + R() * 2 * s, y - hh * s], [px - R() * 2 * s, y + hh * s]], { w: 6.5 * s, seed: (o.seed ?? 1) + ox + d, color: pc, taper: false }); }
    return;
  }
  stroke(g, [[x - 54 * s, y], [x + 54 * s, y]], { w: 6 * s, seed: 3900, color: col, taper: false, raw: true });
  for (const d of [-1, 1]) { shape(g, rrect(x + d * 36 * s - 7 * s, y - 24 * s, 14 * s, 48 * s, 5 * s), { fill: col, w: lw * .6, seed: 3901 + d, form: false }); shape(g, rrect(x + d * 48 * s - 5 * s, y - 17 * s, 10 * s, 34 * s, 4 * s), { fill: col, w: lw * .6, seed: 3903 + d, form: false }); }
}
export function padlock(g, x, y, s = 1, o = {}) {
  const open = clamp(o.open ?? 0), col = o.col || '#d9a83a';
  // the shackle: lifts and swings when it springs open
  const lift = open * 34 * s, swing = open * .5;
  g.save(); g.translate(x + 26 * s, y - 30 * s - lift); g.rotate(-swing); g.translate(-(x + 26 * s), -(y - 30 * s));
  const S = []; for (let i = 0; i <= 20; i++) { const a = Math.PI + i / 20 * Math.PI; S.push([x + Math.cos(a) * 26 * s, y - 30 * s + Math.sin(a) * 34 * s]); }
  S.unshift([x - 26 * s, y - 6 * s]); S.push([x + 26 * s, y - 6 * s]);
  line(g, S, { w: 17 * s, taper: false, seed: 3910 }); line(g, S, { w: 9 * s, taper: false, seed: 3911, color: '#c9c4b8', boilAmt: .3 });
  g.restore();
  shape(g, rrect(x - 42 * s, y - 34 * s, 84 * s, 70 * s, 14 * s), { fill: col, shade: sh(col, .4), lit: lt(col, .35), form: 'block', w: 6 * s, seed: 3912, gloss: { x: .18, y: .16, w: .1, h: .07 } });
  shape(g, ellipse(x, y - 6 * s, 9 * s, 9 * s), { fill: INK, w: 0, seed: 3913, form: false });
  shape(g, [[x - 5 * s, y - 4 * s], [x + 5 * s, y - 4 * s], [x + 7 * s, y + 16 * s], [x - 7 * s, y + 16 * s]], { fill: INK, w: 0, seed: 3914, form: false });
}
export function coin(g, x, y, r, o = {}) {
  shape(g, ellipse(x, y, r, r * (o.flat ?? 1)), { fill: GOLD, shade: GOLD_SH, lit: '#fff0b8', form: 'round', w: Math.max(2.5, r * .14), seed: o.seed ?? 3920, gloss: { x: .3, y: .25, w: .14, h: .1, dot: false } });
  if ((o.flat ?? 1) > .5) shape(g, ellipse(x, y, r * .62, r * .62 * (o.flat ?? 1)), { fill: null, w: Math.max(1.6, r * .08), seed: (o.seed ?? 3920) + 1, line: GOLD_SH });
}
// A tick, fat and inked, for a pass.
export function tick(g, x, y, s = 1, col = GREEN) {
  const P = spline([[-60, 0], [-38, -20], [-16, 6], [44, -64], [66, -44], [-14, 50], [-60, 0]].map(([a, b]) => [x + a * s, y + b * s]), true, 2);
  shape(g, P, { fill: '!' + col, shade: '!' + sh(col, .35), lit: '!' + lt(col, .3), form: 'block', w: 7 * s, seed: 3930 });
}
// A power symbol: a broken ring and a bar through its gap.
export function powerIcon(g, x, y, r, col = CREAM) {
  const P = []; for (let i = 0; i <= 24; i++) { const a = -Math.PI / 2 + .55 + i / 24 * (TAU - 1.1); P.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
  line(g, P, { w: r * .42, taper: false, seed: 3940 }); line(g, P, { w: r * .22, taper: false, seed: 3941, color: col, boilAmt: .3 });
  line(g, [[x, y - r * 1.15], [x, y - r * .1]], { w: r * .42, taper: false, seed: 3942 }); line(g, [[x, y - r * 1.15], [x, y - r * .1]], { w: r * .22, taper: false, seed: 3943, color: col, boilAmt: .3 });
}
// A loading spinner: a ring of dots fading round, turning with t.
export function spinner(g, x, y, r, t, col = CREAM) {
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + Math.floor(t * 12) / 12 * TAU, f = (i + 1) / 8; g.save(); g.globalAlpha *= f; shape(g, ellipse(x + Math.cos(a) * r, y + Math.sin(a) * r, r * .17 * (.6 + f * .4), r * .17 * (.6 + f * .4)), { fill: col, w: 0, seed: 3950 + i, form: false }); g.restore(); }
}
// An eye, for an observation: an almond with an iris and a glint.
export function eyeMark(g, x, y, s = 1, o = {}) {
  const P = [];
  for (let i = 0; i <= 16; i++) { const u = i / 16; P.push([x + lerp(-56, 56, u) * s, y - Math.pow(Math.sin(u * Math.PI), .8) * 34 * s]); }
  for (let i = 15; i >= 1; i--) { const u = i / 16; P.push([x + lerp(-56, 56, u) * s, y + Math.pow(Math.sin(u * Math.PI), .9) * 28 * s]); }
  const Q = shape(g, P, { fill: WHITE, shade: '#d8ccb8', form: 'round', k: .5, w: 6 * s, seed: o.seed ?? 3960 });
  g.save(); pathOf(g, Q, true); g.clip();
  const ix = x + (o.lx ?? 0) * 12 * s;
  shape(g, ellipse(ix, y - 2 * s, 24 * s, 24 * s), { fill: o.iris || '#4f86a8', shade: '#2a5070', w: 4 * s, seed: (o.seed ?? 3960) + 1, form: 'round' });
  dot(g, ix, y - 2 * s, 11 * s); dot(g, ix - 8 * s, y - 10 * s, 4.5 * s, WHITE);
  g.restore();
  line(g, P, { w: 6 * s, closed: true, seed: (o.seed ?? 3960) + 2 });
  for (let i = 0; i < 3; i++) stroke(g, [[x + (i - 1) * 26 * s, y - 36 * s + Math.abs(i - 1) * 6 * s], [x + (i - 1) * 34 * s, y - 50 * s + Math.abs(i - 1) * 6 * s]], { w: 4 * s, seed: (o.seed ?? 3960) + 3 + i });
}
// A pushpin's head, brass.
export function pin(g, x, y, s = 1) { shape(g, ellipse(x, y, 13 * s, 13 * s), { fill: '#d8a840', shade: '#8e6a1c', w: 4 * s, seed: 3970, gloss: { x: .3, y: .25, w: .18, h: .14, dot: false } }); }
// Red string, sagging between two points.
export function redString(g, a, b, sag = 30, p = 1, seed = 3980) {
  if (p <= 0) return;
  const P = []; for (let k = 0; k <= 24; k++) { const u = k / 24 * clamp(p); P.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u) + Math.sin(u * Math.PI) * sag]); }
  stroke(g, P, { w: 5, seed, color: '#b8342a', taper: false, raw: true });
}

// ---------------------------------------------------------------- the board game
// A board lying on the desk, seen from above at a slant: (cx, nearY) the middle of its near edge.
// Its squares run from a start in the middle and fork three ways toward the far edge.
export const BOARD = { nw: 980, fw: 720, d: 520 };
export function boardPt(cx, nearY, u, v) { const hw = lerp(BOARD.nw, BOARD.fw, v) / 2; return [cx + u * hw, nearY - v * BOARD.d]; }
export const PATHS = [
  [[-.34, .08], [-.38, .2], [-.44, .32], [-.5, .44], [-.56, .56], [-.6, .68]],
  [[0, .08], [0, .2], [.02, .32], [0, .44], [-.02, .56], [0, .68]],
  [[.34, .08], [.38, .2], [.44, .32], [.5, .44], [.56, .56], [.6, .68]],
];
export const GOAL_AT = [[-.64, .82], [0, .82], [.64, .82]];
export const GOAL_ICON = ['lock', 'coin', 'barbell'];
export function board(g, cx, nearY, o = {}) {
  const corners = [boardPt(cx, nearY, -1.04, -.04), boardPt(cx, nearY, 1.04, -.04), boardPt(cx, nearY, 1.04, 1.04), boardPt(cx, nearY, -1.04, 1.04)];
  shape(g, corners, { fill: '#2f4f6a', shade: '#1c3246', form: 'block', w: 7, seed: 4000, amt: .6 });
  const inner = [boardPt(cx, nearY, -.97, .02), boardPt(cx, nearY, .97, .02), boardPt(cx, nearY, .97, .97), boardPt(cx, nearY, -.97, .97)];
  shape(g, inner, { fill: '#efe2bf', shade: '#cdb98e', form: 'block', k: .6, w: 4, seed: 4001, amt: .4 });
  // a compass rose in one corner, a winding river and a little wood in the others
  const cr = boardPt(cx, nearY, .82, .12);
  star(g, cr[0], cr[1], 30, '#c9a868', { n: 4, inner: .3, w: 3, seed: 4002, gloss: false, form: false });
  const riv = [[-.95, .3], [-.8, .36], [-.86, .5], [-.72, .6], [-.8, .74], [-.7, .9]].map(([u, v]) => boardPt(cx, nearY, u, v));
  stroke(g, spline(riv, false, 8), { w: 14, seed: 4003, color: '#9cc0d8', taper: true, raw: true });
  for (const [u, v] of [[.8, .5], [.86, .62], [.76, .7], [.9, .78]]) { const [px, py] = boardPt(cx, nearY, u, v); shape(g, [[px, py - 30], [px + 16, py], [px - 16, py]], { fill: '#8aa68e', w: 3, seed: 4004 + u * 10 + v, form: false }); }
  // the far edge is the app itself: its pink header, with the barbell
  const hb = [boardPt(cx, nearY, -.97, .86), boardPt(cx, nearY, .97, .86), boardPt(cx, nearY, .97, .97), boardPt(cx, nearY, -.97, .97)];
  shape(g, hb, { fill: APP.header, shade: APP.rule, form: 'block', k: .5, w: 4, seed: 4005, amt: .3 });
  const hc = boardPt(cx, nearY, 0, .915);
  if (o.header) o.header(g, hc[0], hc[1]);
  const cols = [['#a8d4c4', '#c4e4d8'], ['#e7b860', '#f2d08a'], ['#c4b0dc', '#d8c8ea']];
  PATHS.forEach((P, pi) => P.forEach(([u, v], i) => {
    const q = [[u - .1, v - .058], [u + .1, v - .058], [u + .1, v + .058], [u - .1, v + .058]].map(([a, b]) => boardPt(cx, nearY, a, b));
    shape(g, q, { fill: i === 0 ? '#fbf6e8' : cols[pi][i % 2], form: 'block', k: .5, w: 4, seed: 4010 + pi * 10 + i, amt: .3 });
  }));
}
// A pennant on a pin: (x, y) its foot; icon: 'barbell' | 'lock' | 'coin'; p 0..1 springs it up.
export function pennant(g, x, y, s, icon, o = {}) {
  const p = o.p ?? 1; if (p <= 0) return;
  const sc = backOut(clamp(p), 2.6), t = o.t ?? now();
  g.save(); g.translate(x, y); g.scale(sc, sc); g.translate(-x, -y);
  shape(g, ellipse(x, y, 16 * s, 6 * s), { fill: '#3a2a20', w: 3 * s, seed: 4050, form: false });
  stroke(g, [[x, y], [x, y - 190 * s]], { w: 7 * s, seed: 4051, taper: false, raw: true });
  const wv = Math.sin(t * 7 + x) * 6 * s;
  const F = spline([[x, y - 186 * s], [x + 70 * s, y - 172 * s + wv * .4], [x + 140 * s, y - 150 * s + wv], [x + 70 * s, y - 126 * s + wv * .4], [x, y - 112 * s]], true, 5);
  shape(g, F, { fill: o.col || '#fbf6e8', shade: '#d8cbb0', form: 'block', w: 5 * s, seed: 4052 });
  const ix = x + 52 * s, iy = y - 150 * s + wv * .4;
  if (o.badge) shape(g, ellipse(ix, iy, 30 * s, 30 * s, 0, 24), { fill: APP.logo, w: 3 * s, seed: 4054, form: false });
  if (icon === 'barbell') barbellIcon(g, ix, iy, .52 * s);
  else if (icon === 'lock') padlock(g, ix, iy + 4 * s, .4 * s);
  else coin(g, ix, iy, 19 * s);
  shape(g, ellipse(x, y - 192 * s, 11 * s, 11 * s), { fill: o.ball || GOLD, w: 3.5 * s, seed: 4053, gloss: { x: .3, y: .25, w: .2, h: .16, dot: false } });
  g.restore();
}
// A round pawn base for a bot standing on the board.
export function pawnBase(g, x, y, s, col) {
  shape(g, ellipse(x, y + 4 * s, 70 * s, 20 * s), { fill: sh(col, .25), w: 5 * s, seed: 4060, form: false });
  shape(g, ellipse(x, y - 4 * s, 66 * s, 18 * s), { fill: col, shade: sh(col, .3), lit: lt(col, .3), form: 'round', w: 5 * s, seed: 4061 });
}

// ---------------------------------------------------------------- Mabel's notebook and the app's log
// Her notebook standing open on (x, y) (the middle of its foot), w wide; n barbells in pencil.
export function notebook(g, x, y, w, o = {}) {
  const k = w / 300, h = 230 * k, n = o.n ?? 4;
  shape(g, rrect(x - w / 2 - 8 * k, y - h - 8 * k, w + 16 * k, h + 12 * k, 10 * k), { fill: '#7a4a32', shade: '#4a2a1a', form: 'block', w: 5 * k, seed: 4100 });
  for (const d of [-1, 1]) {
    shape(g, rrect(x + (d < 0 ? -w / 2 : 0), y - h, w / 2, h - 2 * k, 5 * k), { fill: '#fbf5e4', shade: '#ddd0b2', form: 'block', k: .5, w: 4 * k, seed: 4101 + d });
    for (let i = 0; i < 6; i++) stroke(g, [[x + (d < 0 ? -w / 2 + 14 * k : 14 * k), y - h + 40 * k + i * 32 * k], [x + (d < 0 ? -14 * k : w / 2 - 14 * k), y - h + 40 * k + i * 32 * k]], { w: 1.6 * k, seed: 4110 + i + d * 10, color: '#b9c8d8', taper: false });
  }
  // the left page: a doodle of a barbell and her squiggled notes; the right page: one barbell per set
  squigLines(g, x - w / 2 + 22 * k, y - h + 40 * k, w / 2 - 50 * k, 5, 32 * k, { w: 2.6 * k, amp: 3 * k, seed: 4120, col: '#5d5a62' });
  for (let i = 0; i < n; i++) barbellIcon(g, x + w / 4, y - h + 44 * k + i * 44 * k, .62 * k, { pencil: true, seed: 4130 + i * 3 });
  // the spiral
  for (let i = 0; i < 8; i++) shape(g, ellipse(x, y - h + 16 * k + i * 27 * k, 7 * k, 9 * k), { fill: null, w: 3.4 * k, seed: 4140 + i, line: '#8a8578' });
  // her red bow, stuck on the corner like a sticker
  if (o.bow !== false) { const bx = x + w / 2 - 22 * k, by = y - h + 18 * k; for (const d of [-1, 1]) shape(g, spline([[bx, by], [bx + d * 20 * k, by - 13 * k], [bx + d * 22 * k, by], [bx + d * 19 * k, by + 11 * k]], true, 4), { fill: '#c9483a', w: 3 * k, seed: 4150 + d }); shape(g, ellipse(bx, by, 6 * k, 6.5 * k), { fill: '#c9483a', w: 2.5 * k, seed: 4152 }); }
  return { h, rows: Array.from({ length: n }, (_, i) => [x + w / 4, y - h + 44 * k + i * 44 * k]) };
}
// The gym app's log for a phone's screen: a barbell and a bar per saved set; missing rows dashed.
export const logScreen = (n = 3, total = 4, o = {}) => (g, sx, sy, sw, sh, s) => {
  g.fillStyle = C('#efe9da'); g.fillRect(sx, sy, sw, 44 * s);
  barbellIcon(g, sx + 46 * s, sy + 22 * s, .34 * s, { col: '#8a7e6a' });
  const rh = (sh - 70 * s) / Math.max(total, 4);
  for (let i = 0; i < total; i++) {
    const ry = sy + 60 * s + i * rh;
    if (i < n) {
      shape(g, rrect(sx + 14 * s, ry, sw - 28 * s, rh - 14 * s, 10 * s), { fill: o.rowCol || '#e3eef0', form: false, w: 3 * s, seed: 4160 + i, amt: .3 });
      barbellIcon(g, sx + 60 * s, ry + (rh - 14 * s) / 2, .5 * s, { col: BAR });
      squig(g, sx + 110 * s, ry + (rh - 14 * s) / 2, sw - 150 * s, { w: 3.6 * s, amp: 3 * s, seed: 4170 + i });
    } else {
      // a dashed outline where a set should be
      const P = rrect(sx + 14 * s, ry, sw - 28 * s, rh - 14 * s, 10 * s);
      g.save(); g.setLineDash([16 * s, 12 * s]); g.lineDashOffset = -(o.t ?? 0) * 30 * s; g.strokeStyle = C(o.dashCol || '#8a7e6a'); g.lineWidth = 5 * s; pathOf(g, P, true); g.stroke(); g.restore();
    }
  }
};

// ---------------------------------------------------------------- the gavel
// A judge's gavel held at its handle's end (x, y), its head along ang.
export function gavel(g, x, y, ang, s = 1) {
  g.save(); g.translate(x, y); g.rotate(ang);
  shape(g, rrect(-10 * s, -9 * s, 150 * s, 18 * s, 9 * s), { fill: '#8a4e2a', shade: '#5a2e14', form: 'block', w: 5 * s, seed: 4200 });
  shape(g, rrect(130 * s, -46 * s, 54 * s, 92 * s, 14 * s), { fill: '#7a4424', shade: '#4a240e', lit: '#b0703e', form: 'block', w: 6 * s, seed: 4201, gloss: { x: .25, y: .12, w: .14, h: .06 } });
  for (const d of [-1, 1]) shape(g, rrect(128 * s, d * 30 * s - 7 * s, 58 * s, 14 * s, 6 * s), { fill: GOLD, shade: GOLD_SH, form: 'block', w: 4 * s, seed: 4202 + d });
  g.restore();
}
export function soundBlock(g, x, y, s = 1) {
  shape(g, ellipse(x, y, 70 * s, 18 * s), { fill: '#5a2e14', w: 5 * s, seed: 4210, form: false });
  shape(g, rrect(x - 70 * s, y - 34 * s, 140 * s, 34 * s, 6 * s), { fill: '#7a4424', shade: '#4a240e', form: 'block', w: 5 * s, seed: 4211 });
  shape(g, ellipse(x, y - 34 * s, 70 * s, 18 * s), { fill: '#9a5c32', lit: '#c88a56', form: 'round', w: 5 * s, seed: 4212 });
}

// ---------------------------------------------------------------- the chat
// A face in a round frame, for a chat's avatar: who 'bot' (with a beanie of colour k) or a critter kind.
export function avatar(g, x, y, r, who, o = {}) {
  shape(g, ellipse(x, y, r, r), { fill: o.bg || '#f3e7cc', form: false, w: Math.max(3, r * .1), seed: 4300 + r });
  g.save(); g.beginPath(); g.arc(x, y, r * .94, 0, TAU); g.clip();
  const t = o.t ?? now();
  if (who === 'bot') clawd(g, x, y + r * 1.32, r / 132, { t, hat: 'beanie', hatCol: BOT_COLS[o.k ?? 0], dance: .3, eyes: { expr: o.expr || 'open' }, sing: o.sing ?? 0 });
  else critter(g, x, y + r * 2.6, r / 92, { t, kind: who, dance: .3, eyes: { expr: o.expr || 'open', lx: o.lx ?? 0 }, sing: o.sing ?? 0 });
  g.restore();
  line(g, ellipse(x, y, r, r), { w: Math.max(3, r * .1), closed: true, seed: 4301 });
}
// A chat message: a rounded bubble of squiggles at (x, y) (its top left), w wide, tail left or right.
export function chatBubble(g, x, y, w, h, o = {}) {
  const right = !!o.right, col = o.col || (right ? '#cfe6dc' : '#fbe3ea');
  const tail = right ? [[x + w - 30, y + h - 4], [x + w + 18, y + h + 8], [x + w - 6, y + h - 22]] : [[x + 30, y + h - 4], [x - 18, y + h + 8], [x + 6, y + h - 22]];
  shape(g, tail, { fill: col, w: 4.5, seed: 4310 + (right ? 1 : 0), form: false });
  shape(g, rrect(x, y, w, h, 22), { fill: col, shade: sh(col, .15), form: 'block', k: .5, w: 5, seed: 4312 + (right ? 1 : 0) });
  const lines = o.lines ?? 2;
  squigLines(g, x + 22, y + 26, w - (o.heart ? 110 : 50), lines, 24, { w: 4, amp: 3.5, seed: 4320 + (o.seed ?? 0), col: '#5a4a52', last: .7 });
  if (o.heart) heart(g, x + w - 48, y + h / 2 + 4, 22 * (o.heartS ?? 1), '#e8789c', 4330);
}

// ---------------------------------------------------------------- the stethoscope
// Ear tips at a bot's head (two points), the tubes meeting at a Y, the chest piece pressed at `to`.
export function stethoscope(g, ears, yoke, to, s = 1) {
  for (const e of ears) { stroke(g, [e, [lerp(e[0], yoke[0], .5), lerp(e[1], yoke[1], .3)], yoke], { w: 7 * s, seed: 4400 + e[0], taper: false }); shape(g, ellipse(e[0], e[1], 7 * s, 7 * s), { fill: '#c9c4b8', w: 3 * s, seed: 4401, form: false }); }
  const mid = [(yoke[0] + to[0]) / 2, Math.max(yoke[1], to[1]) + 50 * s];
  stroke(g, spline([yoke, mid, to], false, 10), { w: 9 * s, seed: 4402, taper: false, raw: true });
  stroke(g, spline([yoke, mid, to], false, 10), { w: 4 * s, seed: 4403, taper: false, raw: true, color: '#3e4250' });
  shape(g, ellipse(to[0], to[1], 26 * s, 26 * s), { fill: '#c9c4b8', shade: '#8a8578', lit: '#f4f0e6', form: 'round', w: 5 * s, seed: 4404, gloss: { x: .3, y: .25, w: .16, h: .12, dot: false } });
  shape(g, ellipse(to[0], to[1], 16 * s, 16 * s), { fill: '#e8e4da', w: 3 * s, seed: 4405, form: false });
}

// ---------------------------------------------------------------- the gift and the new phone
// A wrapped present on (x, y) (its foot), w wide: lilac paper with gold dots and a gold ribbon.
export function gift(g, x, y, w, o = {}) {
  const h = w * .7, torn = clamp(o.torn ?? 0);
  if (torn > .98) return;
  g.save(); g.globalAlpha *= 1 - clamp((torn - .7) / .3);
  shape(g, rrect(x - w / 2, y - h, w, h, 8), { fill: '#b9a2d8', shade: '#7e66a4', form: 'block', w: 6, seed: 4500 });
  for (let i = 0; i < 9; i++) dot(g, x - w * .4 + (i % 3) * w * .4 + (Math.floor(i / 3) % 2) * w * .2, y - h * .2 - Math.floor(i / 3) * h * .3, w * .025, '#ebd58a');
  shape(g, rrect(x - w * .06, y - h, w * .12, h, 3), { fill: GOLD, form: 'block', w: 4, seed: 4501 });
  shape(g, rrect(x - w / 2, y - h * .58, w, h * .12, 3), { fill: GOLD, form: 'block', w: 4, seed: 4502 });
  g.restore();
}
// A bow, stuck on top of something new.
export function bow(g, x, y, s = 1) {
  for (const d of [-1, 1]) shape(g, spline([[x, y], [x + d * 34 * s, y - 26 * s], [x + d * 40 * s, y], [x + d * 32 * s, y + 20 * s]], true, 4), { fill: GOLD, shade: GOLD_SH, w: 4 * s, seed: 4510 + d });
  for (const d of [-1, 1]) stroke(g, [[x, y + 4 * s], [x + d * 16 * s, y + 30 * s], [x + d * 26 * s, y + 36 * s]], { w: 9 * s, seed: 4512 + d, color: GOLD_SH, taper: false });
  shape(g, ellipse(x, y, 12 * s, 11 * s), { fill: GOLD, w: 3.5 * s, seed: 4514 });
}

// ---------------------------------------------------------------- the grocery shop
export function grocery(g, kind, x, y, s = 1) {
  if (kind === 'loaf') { shape(g, spline([[x - 46 * s, y], [x - 50 * s, y - 30 * s], [x - 20 * s, y - 50 * s], [x + 20 * s, y - 52 * s], [x + 50 * s, y - 32 * s], [x + 46 * s, y]], true, 5), { fill: '#d39a54', shade: '#9a6430', lit: '#f0c88a', form: 'round', w: 5 * s, seed: 4600 }); for (const d of [-20, 0, 20]) stroke(g, [[x + d * s - 8 * s, y - 40 * s], [x + d * s + 6 * s, y - 28 * s]], { w: 3.5 * s, seed: 4601 + d, color: '#8a5424' }); }
  else if (kind === 'milk') { shape(g, spline([[x - 22 * s, y], [x - 24 * s, y - 50 * s], [x - 12 * s, y - 70 * s], [x - 12 * s, y - 84 * s], [x + 12 * s, y - 84 * s], [x + 12 * s, y - 70 * s], [x + 24 * s, y - 50 * s], [x + 22 * s, y]], true, 4), { fill: '#fbf8f0', shade: '#cfc8b8', form: 'round', w: 5 * s, seed: 4610, gloss: { x: .3, y: .3, w: .1, h: .1, dot: false } }); shape(g, rrect(x - 13 * s, y - 92 * s, 26 * s, 12 * s, 4 * s), { fill: '#7fa8c8', w: 3.5 * s, seed: 4611 }); }
  else if (kind === 'cheese') { shape(g, [[x - 44 * s, y], [x + 44 * s, y], [x + 44 * s, y - 24 * s], [x - 30 * s, y - 50 * s]], { fill: '#f0cc56', shade: '#c09a2a', form: 'block', w: 5 * s, seed: 4620 }); for (const [a, b, r] of [[-10, -18, 7], [16, -10, 5], [-28, -6, 4]]) shape(g, ellipse(x + a * s, y + b * s, r * s, r * .8 * s), { fill: '#c9a032', w: 2.5 * s, seed: 4621 + a, form: false }); }
  else if (kind === 'orange') { shape(g, ellipse(x, y - 30 * s, 30 * s, 29 * s), { fill: '#f0943a', shade: '#b8601a', lit: '#ffc888', form: 'round', w: 5 * s, seed: 4630, gloss: { x: .3, y: .25, w: .14, h: .1, dot: false } }); stroke(g, [[x, y - 58 * s], [x + 4 * s, y - 66 * s]], { w: 4 * s, seed: 4631 }); }
}
export function cart(g, x, y, s = 1, o = {}) {
  const col = '#8e959a';
  for (const d of [-1, 1]) { shape(g, ellipse(x + d * 52 * s, y - 14 * s, 14 * s, 14 * s), { fill: '#3a3a40', w: 4 * s, seed: 4700 + d }); shape(g, ellipse(x + d * 52 * s, y - 14 * s, 5 * s, 5 * s), { fill: '#c9c4b8', w: 0, seed: 4702 + d, form: false }); }
  stroke(g, [[x - 80 * s, y - 30 * s], [x + 80 * s, y - 30 * s]], { w: 6 * s, seed: 4704, color: INK, taper: false, raw: true });
  // the basket: a wire trapezoid, the goods drawn inside it by the caller
  const B = [[x - 92 * s, y - 130 * s], [x + 92 * s, y - 130 * s], [x + 76 * s, y - 34 * s], [x - 76 * s, y - 34 * s]];
  if (o.inside) o.inside(g, x, y - 34 * s);
  g.save(); g.strokeStyle = C(col); g.lineWidth = 3 * s; for (let i = 1; i < 7; i++) { const u = i / 7; g.beginPath(); g.moveTo(lerp(B[0][0], B[1][0], u), B[0][1]); g.lineTo(lerp(B[3][0], B[2][0], u), B[3][1]); g.stroke(); } for (let i = 1; i < 4; i++) { const v = i / 4; g.beginPath(); g.moveTo(lerp(B[0][0], B[3][0], v), lerp(B[0][1], B[3][1], v)); g.lineTo(lerp(B[1][0], B[2][0], v), lerp(B[1][1], B[2][1], v)); g.stroke(); } g.restore();
  line(g, B, { w: 6 * s, closed: true, seed: 4705 });
  stroke(g, [[x + 92 * s, y - 130 * s], [x + 124 * s, y - 168 * s], [x + 140 * s, y - 168 * s]], { w: 7 * s, seed: 4706, taper: false });
}
// A till: a brass cash register with a drawer that pops open.
export function till(g, x, y, s = 1, o = {}) {
  const open = clamp(o.open ?? 0);
  shape(g, rrect(x - 70 * s, y - 34 * s + open * 0, 140 * s + open * 0, 34 * s, 4 * s), { fill: '#a87a34', shade: '#6e4c16', form: 'block', w: 5 * s, seed: 4800 });
  if (open > 0) shape(g, rrect(x - 60 * s, y - 26 * s, 120 * s, 30 * s + open * 22 * s, 4 * s), { fill: '#c9963e', form: 'block', w: 4 * s, seed: 4801 });
  shape(g, spline([[x - 66 * s, y - 34 * s], [x - 56 * s, y - 120 * s], [x + 56 * s, y - 120 * s], [x + 66 * s, y - 34 * s]], true, 3), { fill: '#d0a24c', shade: '#8e6a1c', lit: '#f4d48a', form: 'block', w: 6 * s, seed: 4802, gloss: { x: .2, y: .15, w: .08, h: .06 } });
  for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) shape(g, ellipse(x - 36 * s + i * 24 * s, y - 92 * s + r * 26 * s, 8 * s, 8 * s), { fill: '#f4ecd6', w: 2.6 * s, seed: 4810 + r * 4 + i, form: false });
  shape(g, rrect(x - 40 * s, y - 158 * s, 80 * s, 40 * s, 8 * s), { fill: '#d0a24c', form: 'block', w: 5 * s, seed: 4820 });
  shape(g, rrect(x - 30 * s, y - 150 * s, 60 * s, 24 * s, 5 * s), { fill: '#2a2224', w: 3 * s, seed: 4821, form: false });
}

// ---------------------------------------------------------------- the power lever
// A knife switch on a slate panel standing on (x, y): p 0 up, 1 pulled down. The power symbol on it.
export function lever(g, x, y, s = 1, p = 0) {
  shape(g, rrect(x - 90 * s, y - 300 * s, 180 * s, 300 * s, 16 * s), { fill: '#3f4a4a', shade: '#232b2b', lit: '#6a7676', form: 'block', w: 7 * s, seed: 4900, gloss: { x: .12, y: .06, w: .05, h: .03 } });
  for (const [a, b] of [[-70, -280], [70, -280], [-70, -20], [70, -20]]) shape(g, ellipse(x + a * s, y + b * s, 7 * s, 7 * s), { fill: '#b0a890', w: 2.5 * s, seed: 4901 + a + b, form: false });
  powerIcon(g, x - 40 * s, y - 252 * s, 26 * s, CREAM);
  // the pivot half-way up; the arm swings from up (a little right) down through the right side
  const px = x, py = y - 150 * s, a = -Math.PI / 2 + .3 + easeOut(clamp(p), 2) * (Math.PI - .6);
  const L = 150 * s, ex = px + Math.cos(a) * L, ey = py + Math.sin(a) * L;
  shape(g, rrect(px - 30 * s, py - 18 * s, 60 * s, 36 * s, 8 * s), { fill: '#c9963e', form: 'block', w: 4 * s, seed: 4910 });
  stroke(g, [[px, py], [ex, ey]], { w: 22 * s, seed: 4911, taper: false, raw: true });
  stroke(g, [[px, py], [ex, ey]], { w: 12 * s, seed: 4912, taper: false, raw: true, color: '#b8b0a0' });
  shape(g, ellipse(ex, ey, 30 * s, 30 * s), { fill: '#2a2224', lit: '#6a5e60', form: 'round', w: 5 * s, seed: 4913, gloss: { x: .3, y: .25, w: .16, h: .12, dot: false } });
  dot(g, px, py, 9 * s, '#8e6a1c');
  return { grip: [ex, ey] };
}

// ---------------------------------------------------------------- the balance
// A brass merchant's balance standing on (x, y). tilt: the beam's angle (+ the right pan down).
// o.left/o.right(g, px, py) draw what sits in each pan.
export function balance(g, x, y, s = 1, tilt = 0, o = {}) {
  shape(g, ellipse(x, y - 4 * s, 110 * s, 22 * s), { fill: '#a8823a', shade: '#6a4c16', lit: '#e0bc6a', form: 'round', w: 6 * s, seed: 5000 });
  shape(g, [[x - 18 * s, y - 14 * s], [x + 18 * s, y - 14 * s], [x + 10 * s, y - 300 * s], [x - 10 * s, y - 300 * s]], { fill: '#c9a04a', shade: '#8e6a1c', lit: '#f4d48a', form: 'block', w: 6 * s, seed: 5001 });
  const py = y - 310 * s, L = 220 * s, c = Math.cos(tilt), sn = Math.sin(tilt);
  const ends = [[x - c * L, py - sn * L], [x + c * L, py + sn * L]];
  // the pointer above the pivot
  stroke(g, [[x, py], [x + Math.sin(tilt) * 90 * s, py - Math.cos(tilt) * 90 * s]], { w: 8 * s, seed: 5002, taper: true });
  stroke(g, [ends[0], ends[1]], { w: 16 * s, seed: 5003, taper: false, raw: true });
  stroke(g, [ends[0], ends[1]], { w: 8 * s, seed: 5004, taper: false, raw: true, color: '#d9b45a' });
  shape(g, ellipse(x, py, 18 * s, 18 * s), { fill: GOLD, w: 5 * s, seed: 5005, gloss: { x: .3, y: .25, w: .2, h: .16, dot: false } });
  ends.forEach(([ex, ey], i) => {
    const panY = ey + 150 * s;
    for (const d of [-1, 1]) stroke(g, [[ex, ey], [ex + d * 80 * s, panY]], { w: 3.4 * s, seed: 5010 + i * 2 + d, color: '#6a5a3a', taper: false });
    if ((i === 0 ? o.left : o.right)) (i === 0 ? o.left : o.right)(g, ex, panY - 6 * s);
    shape(g, spline([[ex - 96 * s, panY], [ex - 60 * s, panY + 30 * s], [ex + 60 * s, panY + 30 * s], [ex + 96 * s, panY]], true, 6), { fill: '#d0a24c', shade: '#8e6a1c', lit: '#f4d48a', form: 'block', w: 6 * s, seed: 5020 + i });
  });
  return { pivot: [x, py], pans: ends.map(([ex, ey]) => [ex, ey + 150 * s]) };
}
// A brown paper grocery bag with the shop's goods peeking out.
export function bag(g, x, y, s = 1) {
  grocery(g, 'loaf', x - 26 * s, y - 92 * s, .8 * s); grocery(g, 'milk', x + 24 * s, y - 84 * s, .8 * s);
  shape(g, [[x - 62 * s, y], [x + 62 * s, y], [x + 56 * s, y - 112 * s], [x - 56 * s, y - 112 * s]], { fill: '#c9a46c', shade: '#8a6a3a', lit: '#e8cc98', form: 'block', w: 6 * s, seed: 5100 });
  stroke(g, [[x - 56 * s, y - 112 * s], [x - 40 * s, y - 104 * s], [x - 24 * s, y - 112 * s], [x - 8 * s, y - 104 * s], [x + 8 * s, y - 112 * s], [x + 24 * s, y - 104 * s], [x + 40 * s, y - 112 * s], [x + 56 * s, y - 104 * s]], { w: 3 * s, seed: 5101, color: '#8a6a3a' });
}
// A heap of coins.
export function coins(g, x, y, s = 1, n = 6) {
  const R = rng(5200);
  for (let i = 0; i < n; i++) { const row = Math.floor(i / 3), k = i % 3; coin(g, x + (k - 1) * 34 * s + (row % 2) * 16 * s, y - 10 * s - row * 16 * s, 20 * s, { flat: .45, seed: 5201 + i }); }
}

// ---------------------------------------------------------------- gym gear, for the app's shop
// A cast-iron kettlebell standing on (x, y); s = 1 is about 130 tall.
export function kettlebell(g, x, y, s = 1, o = {}) {
  const A = spline([[x - 36 * s, y - 72 * s], [x - 40 * s, y - 118 * s], [x, y - 136 * s], [x + 40 * s, y - 118 * s], [x + 36 * s, y - 72 * s]], false, 8);
  line(g, A, { w: 22 * s, taper: false, seed: 4700 });
  line(g, A, { w: 11 * s, taper: false, seed: 4701, color: '#4a4442', boilAmt: .3 });
  shape(g, spline([[x - 52 * s, y - 50 * s], [x - 40 * s, y - 88 * s], [x, y - 100 * s], [x + 40 * s, y - 88 * s], [x + 52 * s, y - 50 * s], [x + 40 * s, y - 8 * s], [x, y], [x - 40 * s, y - 8 * s]], true, 6), { fill: '#2e2a2a', lit: '#7a7270', form: 'round', cx: .32, cy: .25, w: 6 * s, seed: 4702, gloss: { x: .26, y: .2, w: .12, h: .08 } });
  shape(g, rrect(x - 30 * s, y - 8 * s, 60 * s, 9 * s, 4 * s), { fill: '#1c1818', w: 3 * s, seed: 4703, form: false });
}
// A pair of dumbbells lying side by side on (x, y); s = 1 is about 150 wide.
export function dumbbells(g, x, y, s = 1) {
  for (const d of [0, 1]) {
    const by = y - 18 * s - d * 30 * s, bx = x + d * 14 * s;
    stroke(g, [[bx - 52 * s, by], [bx + 52 * s, by]], { w: 10 * s, seed: 4710 + d, taper: false, raw: true });
    for (const e of [-1, 1]) shape(g, rrect(bx + e * 52 * s - 14 * s, by - 20 * s, 28 * s, 40 * s, 8 * s), { fill: '#3a3434', lit: '#7a7270', form: 'block', w: 4 * s, seed: 4712 + d * 2 + e });
  }
}
// A skipping rope: two wooden handles and the rope looped between them, lying on (x, y).
export function skipRope(g, x, y, s = 1) {
  stroke(g, spline([[x - 46 * s, y - 20 * s], [x - 40 * s, y - 70 * s], [x, y - 90 * s], [x + 40 * s, y - 70 * s], [x + 46 * s, y - 20 * s]], false, 10), { w: 6 * s, seed: 4720, taper: false, color: '#6a4a8a' });
  for (const d of [-1, 1]) shape(g, rrect(x + d * 46 * s - 8 * s, y - 24 * s, 16 * s, 26 * s, 6 * s), { fill: '#c48a54', shade: '#7a4a24', form: 'block', w: 3.5 * s, seed: 4722 + d });
}
// A price tag of n coin icons under a thing on a shelf, at (x, y).
export function priceTag(g, x, y, n, s = 1) {
  const w = (n * 26 + 14) * s;
  shape(g, rrect(x - w / 2, y - 16 * s, w, 32 * s, 8 * s), { fill: '#fbf6e8', w: 3 * s, seed: 4730 + n, form: false });
  for (let i = 0; i < n; i++) coin(g, x - w / 2 + 20 * s + i * 26 * s, y, 10 * s, { seed: 4731 + i });
}

// ---------------------------------------------------------------- picture cards of the finds
export function findCard(g, x, y, s, kind, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0);
  shape(g, rrect(-70 * s, -90 * s, 140 * s, 180 * s, 10 * s), { fill: '#fbf6e8', shade: '#d6c8a8', form: 'block', k: .5, w: 6 * s, seed: 5300 + (o.seed ?? 0) });
  shape(g, rrect(-56 * s, -76 * s, 112 * s, 112 * s, 6 * s), { fill: '#e8ddc4', form: false, w: 3 * s, seed: 5301 });
  if (kind === 'lock') padlock(g, 0, -12 * s, .78 * s, { open: 1 });
  else if (kind === 'scale') { stroke(g, [[-44 * s, -36 * s], [44 * s, -36 * s]], { w: 6 * s, seed: 5302, taper: false }); stroke(g, [[0, -36 * s], [0, 22 * s]], { w: 6 * s, seed: 5303, taper: false }); for (const d of [-1, 1]) shape(g, spline([[d * 44 * s - 24 * s, -6 * s], [d * 44 * s, 4 * s], [d * 44 * s + 24 * s, -6 * s]], true, 4), { fill: '#d0a24c', w: 4 * s, seed: 5304 + d }); shape(g, rrect(-20 * s, 18 * s, 40 * s, 10 * s, 3 * s), { fill: '#d0a24c', w: 3 * s, seed: 5306 }); kettlebell(g, -44 * s, -12 * s, .26 * s); coin(g, 44 * s, -16 * s, 10 * s, { flat: .5 }); coin(g, 40 * s, -22 * s, 10 * s, { flat: .5 }); }
  else { g.save(); g.setLineDash([10 * s, 8 * s]); g.strokeStyle = C('#6a5a52'); g.lineWidth = 4.5 * s; pathOf(g, rrect(-44 * s, -36 * s, 88 * s, 40 * s, 8 * s), true); g.stroke(); g.restore(); barbellIcon(g, 0, -60 * s, .36 * s, { col: '#8a7e6a' }); }
  squigLines(g, -50 * s, 56 * s, 100 * s, 2, 18 * s, { w: 3 * s, amp: 2.5 * s, seed: 5310 + (o.seed ?? 0) });
  g.restore();
}

// ---------------------------------------------------------------- the candlestick telephone
// Standing on (x, y). o.ring 0..1 (shakes and hops), o.off (the receiver's off its hook).
export function candlestick(g, x, y, s = 1, o = {}) {
  const t = o.t ?? now(), ring = clamp(o.ring ?? 0);
  const hop = ring * Math.abs(Math.sin(t * 38)) * 16 * s, wob = ring * Math.sin(t * 61) * .06;
  g.save(); g.translate(x, y - hop); g.rotate(wob); g.translate(-x, -(y - hop));
  const Y = y - hop;
  shape(g, spline([[x - 92 * s, Y], [x - 84 * s, Y - 34 * s], [x - 30 * s, Y - 56 * s], [x + 30 * s, Y - 56 * s], [x + 84 * s, Y - 34 * s], [x + 92 * s, Y]], true, 6), { fill: '#2a2426', lit: '#6a5e60', form: 'round', w: 7 * s, seed: 5400, gloss: { x: .25, y: .2, w: .1, h: .1 } });
  shape(g, rrect(x - 17 * s, Y - 420 * s, 34 * s, 370 * s, 14 * s), { fill: '#2a2426', lit: '#6a5e60', form: 'block', w: 7 * s, seed: 5401, gloss: { x: .2, y: .05, w: .2, h: .02 } });
  for (const yy of [Y - 120 * s, Y - 300 * s]) shape(g, rrect(x - 22 * s, yy, 44 * s, 18 * s, 6 * s), { fill: GOLD, shade: GOLD_SH, form: 'block', w: 4 * s, seed: 5402 + yy });
  // the mouthpiece: a flared horn facing us at the top
  shape(g, rrect(x - 26 * s, Y - 470 * s, 52 * s, 60 * s, 12 * s), { fill: '#2a2426', form: 'block', w: 6 * s, seed: 5404 });
  shape(g, ellipse(x, Y - 498 * s, 60 * s, 46 * s), { fill: '#2a2426', lit: '#6a5e60', form: 'round', w: 7 * s, seed: 5405 });
  shape(g, ellipse(x, Y - 498 * s, 38 * s, 28 * s), { fill: '#141012', w: 4 * s, seed: 5406, form: false });
  for (let i = 0; i < 5; i++) dot(g, x - 16 * s + i * 8 * s, Y - 498 * s, 3 * s, '#4a4044');
  // the hook on the right, with the receiver hanging on it unless it's off
  const hx = x + 30 * s, hy = Y - 380 * s;
  stroke(g, [[x + 16 * s, hy + 40 * s], [hx + 34 * s, hy + 30 * s], [hx + 46 * s, hy]], { w: 10 * s, seed: 5407, taper: false });
  if (!o.off) receiver(g, hx + 46 * s, hy + 10 * s, Math.PI / 2 - .08 + wob * 3, s);
  g.restore();
  return { cord: [x + 60 * s, Y - 20 * s], hook: [hx + 46 * s, hy + 10 * s] };
}
// The receiver (the earpiece), held at (x, y) by its middle, pointing its cup along ang.
export function receiver(g, x, y, ang, s = 1) {
  g.save(); g.translate(x, y); g.rotate(ang);
  shape(g, rrect(-80 * s, -15 * s, 130 * s, 30 * s, 13 * s), { fill: '#2a2426', lit: '#6a5e60', form: 'block', w: 6 * s, seed: 5420 });
  shape(g, spline([[40 * s, -18 * s], [70 * s, -44 * s], [96 * s, -48 * s], [96 * s, 48 * s], [70 * s, 44 * s], [40 * s, 18 * s]], true, 5), { fill: '#2a2426', lit: '#6a5e60', form: 'round', w: 6 * s, seed: 5421, gloss: { x: .4, y: .2, w: .1, h: .1, dot: false } });
  shape(g, ellipse(96 * s, 0, 14 * s, 46 * s), { fill: '#141012', w: 4 * s, seed: 5422, form: false });
  shape(g, rrect(-90 * s, -10 * s, 14 * s, 20 * s, 4 * s), { fill: GOLD, w: 3 * s, seed: 5423, form: false });
  g.restore();
}
// Ring marks round something ringing: little arcs flicking out on each side.
export function ringMarks(g, x, y, r, t, k = 1) {
  if (k <= 0) return;
  const ph = (t * 6) % 1;
  for (const d of [-1, 1]) for (let i = 0; i < 3; i++) { const rr = r * (1 + i * .22 + ph * .2), a0 = d > 0 ? -.5 : Math.PI - .5; g.save(); g.globalAlpha *= k * (1 - ph * .5); stroke(g, Array.from({ length: 7 }, (_, j) => { const a = a0 + j / 6 * 1; return [x + Math.cos(a) * rr, y + Math.sin(a) * rr]; }), { w: 7, seed: 5430 + i + d, taper: true }); g.restore(); }
}

// ---------------------------------------------------------------- the velvet cushion
export function cushion(g, x, y, w, o = {}) {
  const h = w * .36, col = o.col || '#6e3b6c';
  const P = spline([[x - w / 2, y - h * .1], [x - w * .3, y - h * .5], [x, y - h * .56], [x + w * .3, y - h * .5], [x + w / 2, y - h * .1], [x + w * .3, y + h * .42], [x, y + h * .48], [x - w * .3, y + h * .42]], true, 7);
  shape(g, P, { fill: col, shade: sh(col, .45), lit: lt(col, .35), form: 'round', cx: .4, cy: .3, w: 6, seed: 5500, gloss: { x: .3, y: .2, w: .1, h: .06, a: .5 } });
  stroke(g, spline([[x - w * .46, y - h * .08], [x - w * .28, y - h * .4], [x, y - h * .44], [x + w * .28, y - h * .4], [x + w * .46, y - h * .08]], false, 6), { w: 4, seed: 5501, color: GOLD, taper: false });
  for (const d of [-1, 1]) { const tx = x + d * w / 2, ty = y - h * .1; stroke(g, [[tx, ty], [tx + d * 8, ty + 20]], { w: 4, seed: 5502 + d, color: GOLD_SH }); shape(g, spline([[tx + d * 8 - 9, ty + 18], [tx + d * 8 + 9, ty + 18], [tx + d * 8 + 12, ty + 50], [tx + d * 8 - 12, ty + 50]], true, 3), { fill: GOLD, shade: GOLD_SH, form: 'block', w: 3.5, seed: 5504 + d }); }
}
