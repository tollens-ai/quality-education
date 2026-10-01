// Props for the breakdown and chorus 3, drawn in the film's ink: the viewer's own hand, the rule as a
// stencil with a star cut out of it, toy blocks to try in it, a check's printed report, the beetles
// caught in a check, the crew's doctor's bag and what goes in it (the glass, a playbook, a browser
// window), and chorus 3's buzzer, barbell, fireworks, footprints and a glove pointing out at you.
// Nothing is lettered: the report slip carries a digit, the playbook X's and O's.
import { TAU, clamp, lerp, now, hash, noise, rng } from './kit.js';
import { INK, WHITE, CREAM, SKIN, SKIN_SH, GOLD, GOLD_SH, RED, RED_SH, GREY, TIN, TIN_SH, SLATE, C, sh, lt } from './palette.js';
import { shape, line, stroke, rrect, ellipse, spline, xf, dot, paint, pathOf, glove, bbox } from './ink.js';
import { bang, qmark, pops } from './rig.js';
import { magnifier } from './cast.js';
import { digits } from './props.js';

// ---------------------------------------------------------------- the viewer's hand
// Your hand, reaching into the picture from the side: a human hand, not a cartoon glove, seen from
// the thumb's side, pinching the edge of what it holds between thumb (in front) and forefinger
// (behind), the other fingers curled under; a white shirt cuff with a gold cufflink, and a dark suit
// sleeve running off the edge of the frame. (x, y) is the pinch, at the held thing's edge; `ang` the
// way the fingers point (Math.PI: in from the right). Draw it in two parts around what it holds: part
// 'back' (sleeve, cuff, hand, forefinger), then the held thing, then part 'thumb'. o.open 0..1 lets go.
export function viewerHand(g, x, y, ang, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.rotate(ang - Math.PI); g.scale(s, s);   // local: fingers toward -x
  const part = o.part || 'back', seed = o.seed ?? 9000, open = clamp(o.open ?? 0);
  const skin = { fill: SKIN, shade: SKIN_SH, lit: '#ffe8cc', form: 'round', k: .75 };
  if (part === 'back') {
    // the sleeve, off to the side, its creases catching the light
    shape(g, spline([[150, -66], [700, -84], [2400, -110], [2400, 120], [700, 96], [150, 80]], true, 4), { fill: '#2d2a36', shade: '#14131a', lit: '#4c4a5c', form: 'block', k: .9, w: 6, seed: seed + 1 });
    for (const [a, b, c] of [[[210, -40], [250, -6], [236, 40]], [[330, -60], [370, -10], [352, 60]], [[480, -70], [510, 0], [500, 76]]]) stroke(g, [a, b, c], { w: 3, seed: seed + 2 + a[0], color: '#5c5a6e' });
    // the cuff and its cufflink
    shape(g, spline([[112, -60], [140, -66], [166, -62], [170, 4], [166, 76], [140, 82], [112, 76], [106, 8]], true, 5), { fill: WHITE, shade: '#cbbfa8', lit: '#ffffff', form: 'block', k: .8, w: 5.5, seed: seed + 5 });
    stroke(g, [[134, -60], [128, 8], [134, 78]], { w: 2.2, seed: seed + 6, color: '#b8ac96' });
    shape(g, ellipse(150, 56, 9, 10), { fill: GOLD, shade: GOLD_SH, w: 2.6, seed: seed + 7, gloss: { x: .3, y: .25, w: .2, h: .16, dot: false } });
    // the forefinger, reaching behind the held thing's edge
    shape(g, spline([[-22, -6], [-10, -16], [30, -18], [58, -14], [62, 8], [30, 10], [-10, 10], [-24, 4]], true, 4), { ...skin, seed: seed + 10 });
    stroke(g, [[14, -16], [10, -3], [14, 9]], { w: 1.8, seed: seed + 11, color: '#b07a52' });
    // the hand, from the knuckles back to the wrist, its curled fingers under it
    shape(g, spline([[118, -42], [92, -48], [56, -42], [36, -22], [34, 6], [44, 34], [68, 52], [98, 56], [120, 48]], true, 5), { ...skin, cx: .5, cy: .3, seed: seed + 20 });
    for (const [cx, cy, rx, ry] of [[44, 26, 16, 12], [58, 42, 15, 11], [76, 52, 13, 9]]) shape(g, ellipse(cx, cy, rx, ry, -.3, 18), { ...skin, k: .5, w: 3.4, seed: seed + 21 + cx });
    stroke(g, [[60, -30], [80, -24], [104, -26]], { w: 1.6, seed: seed + 25, color: '#d9a47c' });
  } else {
    // the thumb, in front, its pad on the held thing (lifted away as the hand lets go)
    g.translate(open * 10, -open * 22); g.rotate(-open * .3);
    shape(g, spline([[78, -40], [52, -46], [20, -36], [-6, -24], [-18, -14], [-10, -4], [16, -12], [46, -18], [76, -18]], true, 5), { ...skin, cx: .3, seed: seed + 30 });
    shape(g, spline([[-16, -16], [-4, -22], [6, -16], [-2, -8], [-14, -8]], true, 3), { fill: '#f9dcc0', w: 1.8, seed: seed + 31, form: false, line: '#c08a62' });
    stroke(g, [[30, -40], [24, -30], [28, -20]], { w: 1.6, seed: seed + 32, color: '#b07a52' });
  }
  g.restore();
}

// ---------------------------------------------------------------- the rule: a star stencil
export function starPts(cx, cy, R, rot = 0, inner = .46) {
  const P = [];
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + rot + i / 10 * TAU, r = i % 2 ? R * inner : R; P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return P;
}
const trace = (g, P) => { g.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) g.lineTo(P[i][0], P[i][1]); g.closePath(); };
// The star in a stencil w × h centred on (x, y): its centre and outer radius.
export const holeOf = (x, y, w, h) => { const R = Math.min(w, h) * .45; return { x, y: y + R * .095, R }; };
// The stencil: a cream card with a star cut out of it, the dark of the tin showing through. o.inside
// (g, hx, hy, R) draws what's in the hole, clipped to it; o.plug paints the star block home in it.
export function stencil(g, x, y, w, h, s = 1, o = {}) {
  const { x: hx, y: hy, R } = holeOf(x, y, w, h), S = starPts(hx, hy, R);
  g.save(); g.beginPath(); trace(g, S); g.clip();
  // seated in a check, the hole shows the dark inside the tin; held in the air (o.see), what's behind
  if (!o.see) { const dg = g.createLinearGradient(0, hy - R, 0, hy + R); dg.addColorStop(0, C('#0c0806')); dg.addColorStop(1, C('#3a3026')); g.fillStyle = dg; g.fillRect(hx - R - 4, hy - R - 4, R * 2 + 8, R * 2 + 8); }
  // the cut edge's own shadow along the top of the hole
  if (!o.see) { g.save(); g.globalCompositeOperation = 'multiply'; const eg = g.createLinearGradient(0, hy - R, 0, hy - R * .3); eg.addColorStop(0, 'rgba(20,12,6,.6)'); eg.addColorStop(1, 'rgba(20,12,6,0)'); g.fillStyle = eg; g.fillRect(hx - R, hy - R, R * 2, R * .7); g.restore(); }
  if (o.plug) { shape(g, starPts(hx, hy, R * .985), { fill: o.plug, shade: sh(o.plug, .3), lit: lt(o.plug, .35), form: 'block', w: 0, amt: 0, seed: 9101 }); }
  if (o.inside) o.inside(g, hx, hy, R);
  g.restore();
  const card = rrect(x - w / 2, y - h / 2, w, h, 6 * s);
  g.save(); g.beginPath(); trace(g, card); trace(g, S.slice().reverse()); g.fillStyle = C(o.col || '#f3e4c2'); g.fill('evenodd');
  const lg = g.createLinearGradient(x - w / 2, y - h / 2, x + w * .2, y + h / 2); lg.addColorStop(0, 'rgba(255,250,236,.35)'); lg.addColorStop(.5, 'rgba(255,250,236,0)'); lg.addColorStop(1, 'rgba(120,80,40,.22)');
  g.fillStyle = lg; g.fill('evenodd'); g.restore();
  line(g, card, { w: 4 * s, closed: true, seed: 9102 });
  line(g, S, { w: 3.4 * s, closed: true, seed: 9103, heavy: .3 });
  // the card's lit cut edge along the bottom of the hole
  stroke(g, [S[5], S[6], S[7]].map(([px, py]) => [px, py - 2 * s]), { w: 2 * s, seed: 9104, color: '#fff6e0' });
  return { hx, hy, R };
}

// A wooden toy block seen face-on, its depth showing down and to the right: kind 'star' | 'square' |
// 'circle' | 'tri' | 'pebble'. (x, y) its centre, R its size (the star's outer radius, the
// circle's radius, the square's half-side).
export function facePts(kind, x, y, R, rot = 0) {
  if (kind === 'star') return starPts(x, y, R, rot);
  if (kind === 'square') return xf(rrect(-R, -R, R * 2, R * 2, R * .14), x, y, 1, rot);
  if (kind === 'tri') return xf([[0, -R * 1.1], [R * 1.05, R * .75], [-R * 1.05, R * .75]], x, y, 1, rot);
  if (kind === 'pebble') { const P = []; for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; const r = R * (1 + noise(i * 1.3, 77) * .22); P.push([x + Math.cos(a + rot) * r * 1.15, y + Math.sin(a + rot) * r * .9]); } return spline(P, true, 4); }
  return ellipse(x, y, R, R, 0, 36);
}
export function block(g, kind, x, y, R, o = {}) {
  const col = o.col || '#d9573f', rot = o.rot ?? 0, s = o.s ?? Math.max(.4, R / 50), seed = o.seed ?? 9200;
  const P = facePts(kind, x, y, R, rot);
  if (kind === 'pebble') { shape(g, P, { fill: col, shade: sh(col, .45), lit: lt(col, .4), form: 'round', w: 3.2 * s, seed, gloss: { x: .3, y: .25, w: .14, h: .12, dot: false } }); return P; }
  const d = R * (o.depth ?? .2);
  shape(g, P.map(([px, py]) => [px + d * .55, py + d * .75]), { fill: sh(col, .45), form: false, w: 4 * s, seed: seed + 1 });
  // join the face to its back with the corners' edges, for a solid
  if (kind !== 'circle') for (let i = 0; i < P.length; i += kind === 'star' ? 2 : Math.max(1, Math.floor(P.length / 4))) stroke(g, [P[i], [P[i][0] + d * .55, P[i][1] + d * .75]], { w: 2.4 * s, seed: seed + 2 + i, taper: false, raw: true });
  shape(g, P, { fill: col, shade: sh(col, .28), lit: lt(col, .35), form: 'block', w: 5 * s, seed: seed + 3, gloss: { x: .26, y: .2, w: .1, h: .07, dot: false } });
  // a little wood grain on the face
  stroke(g, [[x - R * .4, y + R * .15], [x, y + R * .05], [x + R * .3, y + R * .2]], { w: 1.6 * s, seed: seed + 4, color: sh(col, .2) });
  return P;
}

// The crate of shapes: an open slatted box with big blocks crowding its top. (x, y) its front foot,
// s its scale (s = 1: 230 wide). o.out lists the kinds already taken out, o.jostle shakes the rest.
export function shapeCrate(g, x, y, s = 1, o = {}) {
  const w = 230 * s, h = 150 * s, j = o.jostle ?? 0, out = o.out || [];
  const big = [['circle', -62, -150, 54, '#e0b040'], ['square', 50, -168, 50, '#4a72a8'], ['tri', -6, -196, 52, '#8a5aa0'], ['circle', 64, -118, 40, '#c8503c']];
  big.forEach(([k, dx, dy, R, col], i) => { if (out.includes(i)) return; block(g, k, x + dx * s + Math.sin(now() * 40 + i) * j * 4 * s, y + dy * s - Math.abs(Math.sin(now() * 30 + i * 2)) * j * 8 * s, R * s, { col, rot: [.1, -.12, .05, 0][i], seed: 9300 + i * 10 }); });
  // the box's back rim, then its front: slats, posts, nails, a rope handle
  shape(g, rrect(x - w / 2, y - h, w, h, 6 * s), { fill: '#b07a48', shade: '#6a4426', lit: '#d8a46c', form: 'block', w: 6 * s, seed: 9350 });
  for (let i = 1; i < 3; i++) stroke(g, [[x - w / 2 + 8 * s, y - h + i * h / 3], [x + w / 2 - 8 * s, y - h + i * h / 3]], { w: 3 * s, seed: 9351 + i, color: '#5a3418', taper: false });
  for (const d of [-1, 1]) shape(g, rrect(x + d * (w / 2 - 14 * s) - 12 * s, y - h, 24 * s, h, 4 * s), { fill: '#9a6438', shade: '#5a3418', form: 'block', w: 4 * s, seed: 9355 + d });
  for (const d of [-1, 1]) for (const yy of [.15, .5, .85]) dot(g, x + d * (w / 2 - 14 * s), y - h + h * yy, 2.6 * s, '#2a1a10');
  stroke(g, [[x + w / 2 - 2 * s, y - h * .7], [x + w / 2 + 16 * s, y - h * .55], [x + w / 2 - 2 * s, y - h * .4]], { w: 5 * s, seed: 9360, color: '#c9a878' });
}

// ---------------------------------------------------------------- a check's report
// A paper slip feeding up out of a slot in a check's lid, curling over at the top, printed with a
// digit. (x, y) the slot, p 0..1 how far it has fed.
export function reportSlip(g, x, y, s, p, digit = '5', o = {}) {
  if (p <= 0) return;
  const w = 58 * s, L = 130 * s * clamp(p), lean = o.lean ?? .1;
  shape(g, rrect(x - w * .62, y - 7 * s, w * 1.24, 14 * s, 5 * s), { fill: '#3a3f40', w: 3 * s, seed: 9401, form: false });
  g.save(); g.translate(x, y); g.rotate(lean);
  const curl = clamp(p * 1.4 - .4) * 26 * s;
  shape(g, [[-w / 2, 0], [-w / 2, -L], [w / 2, -L - 4 * s], [w / 2, 0]], { fill: '#fbf6e6', shade: '#d8ccb0', form: 'block', k: .6, w: 3.5 * s, seed: 9402 });
  if (curl > 1) shape(g, spline([[-w / 2, -L], [-w / 2 + 4 * s, -L - curl], [w / 2 + 2 * s, -L - curl - 2 * s], [w / 2, -L - 4 * s]], true, 4), { fill: '#e8dcc2', w: 3 * s, seed: 9403, form: false });
  for (let i = 0; i < 2; i++) stroke(g, [[-w * .32, -L * (.18 + i * .1)], [w * .3, -L * (.18 + i * .1)]], { w: 1.6 * s, seed: 9404 + i, color: '#b8ac94' });
  if (p > .55) digits(g, digit, 0, -L * .58, 50 * s, { ow: 0, col: INK });
  g.restore();
}

// ---------------------------------------------------------------- caught in the check
// A check drawn by crew.check() with its lid lifted off: the tin's open rim, two beetles inside frozen
// with their legs up, and the lid itself in someone's hand. Draw over the check, using the same (x,
// y, s). `p` 0..1 how far the lid is up (which also shows the beetles), lidAt [x, y] where the lid
// is held, `look` -1..1 where the beetles' eyes dart.
export function openCheck(g, x, y, s, p, o = {}) {
  if (p <= 0) return null;
  const bw = 92 * s, bh = 118 * s, cy = y - 30 * s - bh / 2, top = cy - bh / 2, col = TIN;
  // cover the lid with the tin's open rim, the dark inside showing
  shape(g, rrect(x - bw / 2 - 6 * s, top - 13 * s, bw + 12 * s, 21 * s, 9 * s), { fill: sh(col, .12), shade: sh(col, .3), form: 'block', w: 5 * s, seed: 9501 });
  shape(g, ellipse(x, top - 3 * s, bw / 2 - 2 * s, 7 * s, 0, 32), { fill: '#16120e', w: 3 * s, seed: 9502, form: false });
  // the beetles, rising out of the dark as the lid comes up
  const rise = clamp(p * 1.3), t = o.t ?? now();
  g.save(); g.beginPath(); g.rect(x - bw, top - 200 * s, bw * 2, 200 * s - 3 * s); g.clip();
  for (const [d, ph] of [[-1, 0], [1, .5]]) caughtBug(g, x + d * 21 * s, top - 3 * s + (1 - rise) * 60 * s, s * .9, { t, dir: d, look: o.look ?? 0, ph });
  g.restore();
  // the front lip of the rim over their feet
  stroke(g, [[x - bw / 2 + 2 * s, top - 3 * s], [x, top + 4 * s], [x + bw / 2 - 2 * s, top - 3 * s]], { w: 4.5 * s, seed: 9503 });
  // the lid, held up and tipped back
  const [lx, ly] = o.lidAt || [x + bw * .1, top - 40 * s - p * 70 * s];
  g.save(); g.translate(lx, ly); g.rotate(o.lidRot ?? -.35);
  if (o.slip) reportSlip(g, 8 * s, -11 * s, o.slipS ?? s * .56, o.slip);
  shape(g, rrect(-bw / 2 - 6 * s, -11 * s, bw + 12 * s, 21 * s, 9 * s), { fill: sh(col, .15), shade: sh(col, .35), lit: lt(col, .4), form: 'block', w: 5 * s, seed: 9504, gloss: { x: .15, y: .2, w: .08, h: .14 } });
  shape(g, ellipse(0, 10 * s, bw / 2 - 4 * s, 6 * s, 0, 28), { fill: sh(col, .4), w: 3 * s, seed: 9505, form: false });
  g.restore();
  return { top, lid: [lx, ly] };
}
// A beetle standing up, caught: shell, head, wide eyes darting, antennae on end, front legs up.
export function caughtBug(g, x, y, s, o = {}) {
  const t = o.t ?? now(), dir = o.dir ?? 1, shake = Math.sin(t * 60 + (o.ph ?? 0) * 7) * 1.2 * s;
  g.save(); g.translate(x + shake, y);
  // front legs up, middle legs out
  for (const d of [-1, 1]) {
    stroke(g, [[d * 16 * s, -48 * s], [d * 34 * s, -66 * s], [d * 30 * s, -92 * s]], { w: 4 * s, seed: 9510 + d });
    shape(g, ellipse(d * 30 * s, -96 * s, 6 * s, 6 * s), { fill: '#2a2224', w: 2.4 * s, seed: 9512 + d, form: false });
    stroke(g, [[d * 22 * s, -30 * s], [d * 40 * s, -34 * s], [d * 48 * s, -22 * s]], { w: 4 * s, seed: 9514 + d });
  }
  // the shell, its parting and spots
  const P = ellipse(0, -28 * s, 25 * s, 30 * s, 0, 32);
  shape(g, P, { fill: '#8c2f2a', lit: '#d0645a', shade: '#4a1412', form: 'round', w: 4 * s, seed: 9516, gloss: { x: .3, y: .2, w: .12, h: .08 } });
  stroke(g, [[0, -58 * s], [0, 2 * s]], { w: 2.6 * s, seed: 9517 });
  for (const [a, b] of [[-11, -34], [12, -22], [-8, -12]]) dot(g, a * s, b * s, 3.6 * s);
  // the head, the antennae standing straight up in fright
  shape(g, ellipse(0, -66 * s, 19 * s, 16 * s), { fill: '#2a2224', lit: '#6a5e60', form: 'round', w: 4 * s, seed: 9518 });
  for (const d of [-1, 1]) stroke(g, [[d * 6 * s, -80 * s], [d * 9 * s, -100 * s], [d * 12 * s, -116 * s]], { w: 3 * s, seed: 9519 + d });
  const lk = (o.look ?? 0) + Math.sin(t * 9 + (o.ph ?? 0) * 3) * .5;
  for (const d of [-1, 1]) { shape(g, ellipse(d * 8 * s, -68 * s, 7.5 * s, 9.5 * s), { fill: WHITE, w: 2.2 * s, seed: 9521 + d, form: false }); dot(g, d * 8 * s + lk * 3.5 * s, -68 * s, 2.6 * s); }
  stroke(g, [[-5 * s, -56 * s], [0, -58 * s], [5 * s, -56 * s]], { w: 2 * s, seed: 9523, color: WHITE });
  g.restore();
}

// ---------------------------------------------------------------- the crew's bag and its kit
// A doctor's bag (a Gladstone), standing with its foot at (x, y): w ≈ 400 s. open 0..1 swings its
// jaws apart; o.inside(g, mx, my, mw) draws what stands in it (mx, my the middle of its mouth, mw the
// mouth's width), between its back and its front.
export function doctorBag(g, x, y, s = 1, o = {}) {
  const open = clamp(o.open ?? 0), w = 400 * s, h = 210 * s, col = '#5c3420', dark = '#2c160c';
  const my = y - h, mw = w * .9, jaw = open * 70 * s;
  // the back jaw, swung up and away when open
  if (open > .02) {
    const B = spline([[x - mw / 2, my], [x - mw * .46, my - jaw * .9], [x, my - jaw * 1.15], [x + mw * .46, my - jaw * .9], [x + mw / 2, my]], false, 6);
    shape(g, [...B, [x + mw / 2, my + 10 * s], [x - mw / 2, my + 10 * s]], { fill: col, shade: dark, lit: '#8a5434', form: 'block', w: 6 * s, seed: 9601 });
    stroke(g, B.map(([px, py]) => [px, py + 4 * s]), { w: 9 * s, seed: 9602, color: '#b89a5a', taper: false });
    // its inside: the dark mouth
    shape(g, ellipse(x, my + 4 * s, mw / 2 - 8 * s, 26 * s * open + 4 * s, 0, 40), { fill: '#120a06', w: 4 * s, seed: 9603, form: false });
  }
  if (o.inside && open > .3) { g.save(); g.beginPath(); g.rect(x - w, y - h * 4, w * 2, h * 4 - h + 14 * s); g.clip(); o.inside(g, x, my, mw); g.restore(); }
  // the body: wider at the foot, a seam, studs on the base, stitching
  const body = spline([[x - mw / 2, my], [x + mw / 2, my], [x + w * .5, y - h * .45], [x + w * .47, y - 4 * s], [x, y + 4 * s], [x - w * .47, y - 4 * s], [x - w * .5, y - h * .45]], true, 6);
  shape(g, body, { fill: col, shade: dark, lit: '#8a5434', form: 'block', w: 7 * s, seed: 9604, gloss: { x: .16, y: .2, w: .05, h: .06, a: .5 } });
  stroke(g, [[x - w * .46, y - h * .3], [x, y - h * .26], [x + w * .46, y - h * .3]], { w: 3 * s, seed: 9605, color: '#2a140a' });
  for (let i = 0; i < 18; i++) dot(g, lerp(x - w * .42, x + w * .42, i / 17), lerp(y - h * .25, y - h * .25, 0) + Math.sin(i / 17 * Math.PI) * 4 * s, 1.6 * s, '#c9a878');
  for (const d of [-.36, -.12, .12, .36]) shape(g, ellipse(x + d * w, y - 4 * s, 9 * s, 5 * s), { fill: GOLD, w: 2.4 * s, seed: 9606 + d, form: false });
  // the front jaw: a brass frame along the mouth, the clasp, and the handles
  const fr = spline([[x - mw / 2, my], [x - mw * .25, my + jaw * .12], [x, my + jaw * .15], [x + mw * .25, my + jaw * .12], [x + mw / 2, my]], false, 6);
  stroke(g, fr, { w: 11 * s, seed: 9607, color: '#c9a050', taper: false });
  stroke(g, fr.map(([px, py]) => [px, py - 3 * s]), { w: 3 * s, seed: 9608, color: '#f0d890', taper: false });
  const cl = o.click ?? 0;
  shape(g, rrect(x - 22 * s, my - 10 * s + jaw * .15, 44 * s, 30 * s, 6 * s), { fill: GOLD, shade: GOLD_SH, form: 'block', w: 4 * s, seed: 9609, gloss: { x: .25, y: .25, w: .14, h: .14 } });
  dot(g, x, my + 6 * s + jaw * .15 - cl * 3 * s, 5 * s, '#5a3a0c');
  for (const [d, hy] of [[-1, open], [1, open]]) {
    const hx = x + d * mw * .2, up = (my - 60 * s) - (d < 0 ? jaw * .9 : -jaw * .1);
    stroke(g, [[hx - 50 * s, my - (d < 0 ? jaw * .7 : -jaw * .05)], [hx - 40 * s, up], [hx + 40 * s, up], [hx + 50 * s, my - (d < 0 ? jaw * .7 : -jaw * .05)]], { w: 13 * s, seed: 9610 + d, color: '#3a1e10', taper: false });
    stroke(g, [[hx - 44 * s, up + 8 * s], [hx + 44 * s, up + 8 * s]], { w: 2.4 * s, seed: 9612 + d, color: '#8a5a3a' });
  }
}
// A small browser window: frame, a title bar with its three dots, an address bar, greeked lines.
export function browserWin(g, x, y, w, h, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0);
  shape(g, rrect(-w / 2, -h / 2, w, h, 8 * s), { fill: '#eef0ea', shade: '#b8bcb2', form: 'block', w: 4.5 * s, seed: 9701 });
  shape(g, rrect(-w / 2, -h / 2, w, h * .22, [8 * s, 8 * s, 0, 0]), { fill: '#c9cfc8', form: false, w: 3.5 * s, seed: 9702 });
  for (let i = 0; i < 3; i++) dot(g, -w / 2 + (12 + i * 12) * s, -h / 2 + h * .11, 3.6 * s, ['#d5392b', '#ebb942', '#8a8a80'][i]);
  shape(g, rrect(-w / 2 + 50 * s, -h / 2 + h * .05, w - 62 * s, h * .12, 5 * s), { fill: '#ffffff', w: 2.4 * s, seed: 9703, form: false });
  for (let i = 0; i < 4; i++) stroke(g, [[-w * .38, -h * .1 + i * h * .17], [-w * .38 + w * (.5 + hash(i, 97) * .25), -h * .1 + i * h * .17]], { w: 4 * s, seed: 9704 + i, color: '#9aa0a8' });
  shape(g, rrect(w * .2, -h * .12, w * .2, h * .32, 3 * s), { fill: '#c8d8e8', w: 2.4 * s, seed: 9708, form: false });
  g.restore();
}
// A coach's playbook: a board with a sheet of X's, O's and arrows.
export function playbook(g, x, y, w, h, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0);
  shape(g, rrect(-w / 2, -h / 2, w, h, 6 * s), { fill: '#3a4a3c', shade: '#1e2a20', form: 'block', w: 4.5 * s, seed: 9711 });
  shape(g, rrect(-w / 2 + 8 * s, -h / 2 + 10 * s, w - 16 * s, h - 18 * s, 3 * s), { fill: '#f4ecd6', form: false, w: 3 * s, seed: 9712 });
  shape(g, rrect(-14 * s, -h / 2 - 6 * s, 28 * s, 14 * s, 3 * s), { fill: '#a8a8a0', w: 3 * s, seed: 9713, form: false });
  const xs = [[-.28, -.2], [.05, -.24], [-.1, .2]], os = [[.28, .12], [-.3, .22], [.22, -.18]];
  for (const [a, b] of xs) { const cx = a * w, cy = b * h, r = 7 * s; stroke(g, [[cx - r, cy - r], [cx + r, cy + r]], { w: 3 * s, seed: 9714 + a, taper: false, raw: true }); stroke(g, [[cx + r, cy - r], [cx - r, cy + r]], { w: 3 * s, seed: 9715 + a, taper: false, raw: true }); }
  for (const [a, b] of os) shape(g, ellipse(a * w, b * h, 7 * s, 7 * s), { fill: null, w: 3 * s, seed: 9716 + a });
  stroke(g, [[-.24 * w, -.12 * h], [-.05 * w, .05 * h], [.2 * w, .02 * h]], { w: 2.6 * s, seed: 9717, color: '#a8402e' });
  stroke(g, [[.2 * w - 9 * s, -.04 * h], [.2 * w, .02 * h], [.2 * w - 10 * s, .08 * h]], { w: 2.6 * s, seed: 9718, color: '#a8402e' });
  g.restore();
}

// ---------------------------------------------------------------- chorus 3's props
// A big red button on a wooden box, a quiz-show buzzer: p 0..1 presses it home.
export function buzzer(g, x, y, s = 1, p = 0) {
  shape(g, rrect(x - 90 * s, y - 90 * s, 180 * s, 90 * s, 10 * s), { fill: '#a8703e', shade: '#5e3818', lit: '#d09a5c', form: 'block', w: 6 * s, seed: 9801 });
  stroke(g, [[x - 80 * s, y - 42 * s], [x + 80 * s, y - 42 * s]], { w: 2.4 * s, seed: 9802, color: '#6a4420' });
  shape(g, ellipse(x, y - 92 * s, 70 * s, 18 * s), { fill: '#3a3a36', w: 5 * s, seed: 9803, form: false });
  const dh = lerp(54, 14, clamp(p)) * s;
  shape(g, spline([[x - 58 * s, y - 92 * s], [x - 52 * s, y - 92 * s - dh * .8], [x, y - 92 * s - dh], [x + 52 * s, y - 92 * s - dh * .8], [x + 58 * s, y - 92 * s], [x, y - 84 * s]], true, 6), { fill: RED, shade: RED_SH, lit: '#ff8a70', form: 'round', w: 5 * s, seed: 9804, gloss: { x: .3, y: .25, w: .12, h: .14 } });
}
// A barbell, its bar bending under the plates by `bend` (0..1). (x, y) the bar's middle, s scale.
export function barbell(g, x, y, s = 1, o = {}) {
  const L = 300 * s, bend = (o.bend ?? 0) * 26 * s, rot = o.rot ?? 0;
  g.save(); g.translate(x, y); g.rotate(rot);
  const bar = spline([[-L / 2 - 30 * s, bend], [-L / 4, bend * .3], [0, 0], [L / 4, bend * .3], [L / 2 + 30 * s, bend]], false, 6);
  stroke(g, bar, { w: 15 * s, seed: 9811, taper: false, color: INK });
  stroke(g, bar, { w: 8 * s, seed: 9812, taper: false, color: '#a8a8a0' });
  for (const d of [-1, 1]) for (const [k, ph] of [[0, 1], [1, .78]]) {
    const px = d * (L / 2 - 10 * s + k * 26 * s), py = bend * (.9 + k * .1);
    shape(g, rrect(px - 13 * s, py - 86 * s * ph, 26 * s, 172 * s * ph, 9 * s), { fill: '#2e2c2a', lit: '#6a6660', form: 'block', w: 5 * s, seed: 9813 + d + k * 3, gloss: { x: .25, y: .12, w: .14, h: .05, dot: false } });
  }
  g.restore();
}
// A firework, p 0..1 through its life: a rising streak, then a ring of sparks and a "!" blooming
// in it. (x, y) where it bursts.
export function firework(g, x, y, p, s = 1, col = GOLD, seed = 1) {
  if (p <= 0 || p >= 1) return;
  if (p < .22) { const u = p / .22; const yy = lerp(y + 520 * s, y, 1 - (1 - u) * (1 - u)); stroke(g, [[x, yy + 90 * s], [x, yy]], { w: 6 * s, seed, color: col, taper: true }); dot(g, x, yy, 7 * s, '#fff2c0'); return; }
  const u = (p - .22) / .78, R = 150 * s * (1 - Math.pow(1 - u, 3)), fade = 1 - clamp((u - .6) / .4);
  g.save(); g.globalAlpha *= fade;
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * TAU + hash(seed, i) * .2, r0 = R * .55, r1 = R * (1 + hash(seed, i, 2) * .15), droop = u * u * 30 * s;
    stroke(g, [[x + Math.cos(a) * r0, y + Math.sin(a) * r0 + droop * .5], [x + Math.cos(a) * r1, y + Math.sin(a) * r1 + droop]], { w: 7 * s * (1 - u * .6), seed: seed + i, color: i % 2 ? col : '#fff2c0' });
  }
  const bs = clamp(u * 3) * (1 - clamp((u - .7) / .3) * .3);
  if (bs > .05) bang(g, x, y + 4 * s, 120 * s * bs, col, { seed: seed + 40 });
  g.restore();
}
// A cartoon footprint (a shoe's sole and its heel), pointing along `ang`; side ±1 for left/right.
export function footprint(g, x, y, s, ang, side = 1, a = 1) {
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(ang); g.translate(0, side * 9 * s);
  g.fillStyle = C('#3a2414'); g.globalAlpha *= .72;
  g.beginPath(); g.ellipse(10 * s, 0, 17 * s, 11 * s, 0, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(-17 * s, 0, 9 * s, 8.5 * s, 0, 0, TAU); g.fill();
  g.restore();
}
// A glove pointing straight out of the picture at you: the fist end-on, the finger toward the lens.
export function youGlove(g, x, y, s = 1, o = {}) {
  const lw = Math.max(3, 4.5 * s), seed = o.seed ?? 9900, tilt = o.tilt ?? 0;
  g.save(); g.translate(x, y); g.rotate(tilt);
  // the cuff ring behind
  shape(g, ellipse(0, 22 * s, 30 * s, 16 * s, 0, 28), { fill: WHITE, shade: '#cfc3ae', form: 'block', w: lw, seed: seed + 1 });
  // the fist: curled fingers seen from the front, the thumb across them
  shape(g, spline([[-30 * s, -6 * s], [-26 * s, -30 * s], [0, -36 * s], [28 * s, -28 * s], [32 * s, 0], [24 * s, 22 * s], [-22 * s, 22 * s]], true, 5), { fill: WHITE, shade: '#cfc3ae', form: 'round', k: .7, w: lw, seed: seed + 2 });
  for (const dx of [-14, 2, 18]) stroke(g, [[dx * s, 4 * s], [dx * s + 2 * s, 18 * s]], { w: lw * .45, seed: seed + 3 + dx });
  shape(g, ellipse(-6 * s, 10 * s, 24 * s, 9 * s, -.15, 24), { fill: WHITE, shade: '#cfc3ae', k: .7, w: lw * .85, seed: seed + 4 });
  // the pointing finger, foreshortened to its round tip, nearest of all
  shape(g, ellipse(4 * s, -24 * s, 17 * s, 16 * s, 0, 28), { fill: WHITE, shade: '#cfc3ae', lit: '#ffffff', form: 'round', cx: .35, cy: .3, k: .8, w: lw, seed: seed + 5, gloss: { x: .3, y: .25, w: .1, h: .08, dot: false } });
  stroke(g, [[-6 * s, -24 * s], [4 * s, -16 * s], [14 * s, -24 * s]], { w: lw * .4, seed: seed + 6, color: '#b8ac96' });
  g.restore();
}
