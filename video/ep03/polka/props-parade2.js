// The parade's second half (Break 2, lines 41-44: flexibility ... enjoyability): eight gags, one per word, drawn
// in the runway parade1 built (props-parade1.js: the tent, valance, stage, lamps, crowd); then what the line
// "I could name you a hundred" and the held "you" need: the tent seen from far off, the stream of dogs on the
// stage, a crowd of a hundred and more from behind that turns to face you, a red carpet aisle, Clawd's lead
// and the spotlight on the viewer. Everything is drawn with the pen and is a pure function of the song's time.
// A gag is drawn in its own space: the origin is the mark it stands on, on the top edge of the stage, x across,
// y up is negative; `k.a` is the time since its word landed (negative while it is being set up).
import { W, H, TAU, clamp, lerp, inv, hash, easeOut, easeInOut, backOut, smooth, beatPos, beatPulse, downPulse, sway, loud } from './kit.js';
import { blob, line, dot, hatch, scrub } from './pencil.js';
import { rrect, ellipse, capsule, star, scallop, roundPoly } from './shapes.js';
import { write } from './hand.js';
import { paper } from './paper.js';
import { GRAPHITE, C } from './palette.js';
import { dachshund, clawd } from './chars.js';
import { dogFront } from './people.js';
import { bunting, sun } from './world.js';
import { spring, shake, hop, gate, ease, idle, blink } from './life.js';
import { bubble, rosette, sparkle } from './props.js';
import { ROSETTES } from './ringcast.js';
import { STAGE_Y, sideDog, DOGS, valance, runway, crowd } from './props-parade1.js';

const ink = GRAPHITE;
export const GAGS = {};
const steady = { over: 0, bow: 0 };                     // a line that is not to run on or sag: for things that are ruled
const puff = (a, b = 1) => Math.max(0, Math.min(1, a)) * b;
const sharp = (pts, r = 9) => roundPoly(pts, pts.map(() => r), 3);   // a polygon with true corners
// Piecewise-linear through [[a, v], ...], held at the ends.
function pl(a, pts) {
  if (a <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (a < pts[i][0]) { const [a0, v0] = pts[i - 1], [a1, v1] = pts[i]; const u = (a - a0) / (a1 - a0); return v0 + (v1 - v0) * u * u * (3 - 2 * u); }
  return pts[pts.length - 1][1];
}
// Pen shortcuts: every shape gets the seed base + id, so a gag's shapes keep their own looks.
function pens(g, t, base) {
  return {
    B: (id, pts, o = {}) => blob(g, pts, { line: ink, lw: 6, hw: 5, tone: .6, seed: base + id, t, ...o }),
    L: (id, pts, o = {}) => line(g, pts, { w: 6, col: ink, seed: base + id, t, passes: 1, ...o }),
    D: (id, x, y, r, o = {}) => dot(g, x, y, r, { col: ink, seed: base + id, t, ...o }),
    H: (id, pts, o = {}) => hatch(g, pts, { seed: base + id, t, ...o }),
    W: (id, str, x, y, size, o = {}) => write(g, str, x, y, size, { col: ink, seed: base + id, t, ...o }),
  };
}
// How a unit's dog moves while the parade carries it: mv 0..1 (how fast), a hop, a lean into the run.
function travel(k) {
  const mv = clamp(Math.abs(k.vel) / 1100);
  return { mv, hop: mv * Math.abs(Math.sin(k.dist / 110 * Math.PI)) * 32, lean: mv * .1 * Math.sign(k.vel), walk: mv > .08 ? (k.dist / 230) % 1 : 0 };
}
function twinkle(g, t, x, y, r, seed, col = C.yellow, rot = 0) {
  if (r < 2) return;
  const p = [];
  for (let i = 0; i < 8; i++) { const an = rot + i / 8 * TAU, rr = i % 2 ? r * .3 : r; p.push([x + Math.cos(an) * rr, y + Math.sin(an) * rr]); }
  blob(g, p, { fill: col, line: ink, lw: 3.8, seed, t, gap: 5, hw: 4.2, tone: .6 });
}
// A front paw seen from the front: an oval with three toe lines.
function paw(g, t, x, y, s, seed, col = '#fbf8ef') {
  blob(g, ellipse(x, y, 30 * s, 22 * s, 8, 0, seed), { fill: col, line: ink, lw: 5.2, seed, t, hw: 4.6, tone: .95, dens: .3 });
  [-1, 0, 1].forEach((f, i) => line(g, [[x + f * 10 * s, y - 2 * s], [x + f * 10 * s, y + 9 * s]], { w: 3.6, col: ink, seed: seed + 1 + i, t, spline: false, passes: 1, alpha: .6, over: 0, bow: 0 }));
}
// A small rosette in the word's colour, popped on the gag as the word is sung: a rosette is a quality.
function pin(g, t, x, y, r, col, a, seed) {
  if (a < 0 || !col) return;
  const k = backOut(puff(a / .18), 2.6);
  g.save(); g.translate(x, y); g.scale(k, k); g.rotate(.12 + Math.sin(t * 5 + seed) * .07);
  rosette(g, 0, 0, r, col, t, { seed });
  g.restore();
}
// The red-and-white ball every reuse of a ball is the same ball.
function ball(g, t, x, y, r, seed, spin = 0) {
  g.save(); g.translate(x, y); g.rotate(spin);
  blob(g, ellipse(0, 0, r, r, 12, 0, seed), { fill: C.red, shade: '#a3271f', line: ink, lw: Math.max(3.4, r * .12), seed, t, hw: 5, tone: .8, sh: .3 });
  line(g, [[-r * .62, -r * .5], [-r * .1, -r * .12], [r * .18, r * .62]], { w: Math.max(4, r * .2), col: '#fbf8ef', seed: seed + 1, t, spline: true, passes: 1, over: 0, bow: 0, taper: [.08, .08], tooth: .5 });
  dot(g, r * .38, -r * .34, r * .13, { col: '#fbf8ef', seed: seed + 2, t });
  g.restore();
}
// Three chasing arrows in a triangle: the recycle sign (sustainability's alone).
function recycle(g, t, x, y, r, seed, col = C.green) {
  for (let i = 0; i < 3; i++) {
    const a0 = -Math.PI / 2 + i * TAU / 3 + .25, a1 = a0 + TAU / 3 - .5;
    const pts = []; for (let j = 0; j <= 6; j++) { const an = lerp(a0, a1, j / 6), rr = r * (1 - .18 * Math.sin(j / 6 * Math.PI)); pts.push([x + Math.cos(an) * rr, y + Math.sin(an) * rr]); }
    line(g, pts, { w: r * .3, col, seed: seed + i, t, spline: true, passes: 1, over: 0, bow: 0, taper: [.05, .3], flat: true, tooth: .5 });
    const tip = pts[pts.length - 1], tan = Math.atan2(tip[1] - pts[pts.length - 2][1], tip[0] - pts[pts.length - 2][0]);
    blob(g, [[tip[0] + Math.cos(tan) * r * .34, tip[1] + Math.sin(tan) * r * .34], [tip[0] + Math.cos(tan + 2.2) * r * .3, tip[1] + Math.sin(tan + 2.2) * r * .3], [tip[0] + Math.cos(tan - 2.2) * r * .3, tip[1] + Math.sin(tan - 2.2) * r * .3]], { fill: col, line: null, seed: seed + 5 + i, t, tone: .9, dens: .9, hw: 4 });
  }
}

// ================================================================= 1. flexibility
// Bruce reshapes: a ring inside a hoop, a long straight line through a tunnel shorter than he is (nose out of one
// end, tail out of the other), and small enough for a cat flap (his rear behind the door, his head out of the
// flap): the same dog in a different shape for each. (Can it adapt when needs change?)
const NSP = 10, LSP = 316;
const spineStraight = (cx, cy) => Array.from({ length: NSP }, (_, i) => { const u = i / (NSP - 1); return [cx - LSP / 2 + LSP * u, cy + Math.sin(u * Math.PI) * 7]; });
const spineRing = (cx, cy) => { const R = LSP * .93 / TAU * .84; return Array.from({ length: NSP }, (_, i) => { const u = i / (NSP - 1), th = Math.PI * .62 - u * TAU * .93; return [cx + Math.cos(th) * R, cy + Math.sin(th) * R]; }); };
const spineCoil = (cx, cy) => Array.from({ length: NSP }, (_, i) => { const u = i / (NSP - 1), th = Math.PI - u * TAU * 1.3, r = 34 - u * 12; return [cx + Math.cos(th) * r, cy + Math.sin(th) * r]; });
const mixSpine = (A, B, e) => A.map((p, i) => [lerp(p[0], B[i][0], e), lerp(p[1], B[i][1], e)]);
// A dachshund with a spine: a body that can bend, four legs, a tail and Bruce's head. `headOnly` draws just the head.
function bruceNoodle(g, t, spine, o = {}) {
  const { seed = 1, eyes = 'open', mouth = .2, headOnly = false, collar = C.blue, coat = '#c9772f', shade = '#8f4a1c', muzzle = '#f0c48f' } = o;
  const N = spine.length, sd = seed * 37;
  const tan = spine.map((p, i) => { const a = spine[Math.max(0, i - 1)], b = spine[Math.min(N - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; });
  const nor = tan.map(([tx, ty]) => [-ty, tx]);
  const hw = i => 21 + 8 * Math.sin(Math.PI * i / (N - 1));
  if (!headOnly) {
    // Legs first (the body covers their tops), back pair and front pair.
    [1, 2, 7, 8].forEach((i, j) => {
      const r = [spine[i][0] + nor[i][0] * hw(i) * .5, spine[i][1] + nor[i][1] * hw(i) * .5], f = [r[0] + nor[i][0] * 44 + tan[i][0] * (j < 2 ? -6 : 8), r[1] + nor[i][1] * 44 + tan[i][1] * (j < 2 ? -6 : 8)];
      blob(g, capsule(r, f, 12, 10, 5, sd + j), { fill: j < 2 ? shade : coat, shade, line: ink, lw: 5.4, seed: sd + j, t, hw: 4.6, tone: .8, sh: .3 });
      blob(g, ellipse(f[0] + tan[i][0] * 8, f[1] + tan[i][1] * 8, 15, 9, 8, Math.atan2(tan[i][1], tan[i][0]), sd + 5 + j), { fill: coat, line: ink, lw: 4.6, seed: sd + 5 + j, t, hw: 4.4, tone: .8 });
    });
    // The tail: a short whip off the back end.
    const t0 = spine[0], tn = tan[0], nn = nor[0];
    line(g, [[t0[0], t0[1]], [t0[0] - tn[0] * 22 - nn[0] * 6, t0[1] - tn[1] * 22 - nn[1] * 6], [t0[0] - tn[0] * 38 - nn[0] * 24, t0[1] - tn[1] * 38 - nn[1] * 24]], { w: 12, col: coat, seed: sd + 9, t, spline: true, passes: 1, over: 0, bow: 0, taper: [.02, .6], tooth: .5 });
    line(g, [[t0[0], t0[1]], [t0[0] - tn[0] * 22 - nn[0] * 6, t0[1] - tn[1] * 22 - nn[1] * 6], [t0[0] - tn[0] * 38 - nn[0] * 24, t0[1] - tn[1] * 38 - nn[1] * 24]], { w: 5, col: ink, seed: sd + 10, t, spline: true, passes: 1, over: 0, bow: 0, taper: [.02, .6] });
    const L = spine.map((p, i) => [p[0] + nor[i][0] * hw(i), p[1] + nor[i][1] * hw(i)]), R = spine.map((p, i) => [p[0] - nor[i][0] * hw(i), p[1] - nor[i][1] * hw(i)]).reverse();
    blob(g, [...L, ...R], { fill: coat, shade, line: ink, lw: 6.4, seed: sd + 11, t, hw: 5, tone: .8, sh: .3 });
    // The collar across the neck.
    const c = N - 3;
    line(g, [[spine[c][0] + nor[c][0] * hw(c) * 1.05, spine[c][1] + nor[c][1] * hw(c) * 1.05], [spine[c][0] - nor[c][0] * hw(c) * 1.05, spine[c][1] - nor[c][1] * hw(c) * 1.05]], { w: 13, col: collar, seed: sd + 12, t, spline: false, passes: 1, over: 0, bow: 0 });
  }
  // The head at the front end, turned along the spine, its ear hanging under gravity.
  const e = spine[N - 1], te = tan[N - 1], ang = Math.atan2(te[1], te[0]), up = Math.cos(ang) < -.05;
  const I = idle(t, seed);
  g.save(); g.translate(e[0] + te[0] * 16, e[1] + te[1] * 16); g.rotate(ang); if (up) g.scale(1, -1);
  blob(g, rrect(56, 14, 84, 36, 17, 3, sd + 20), { fill: muzzle, shade: coat, line: ink, lw: 5.6, seed: sd + 20, t, hw: 4.6, tone: .5, sh: .2 });
  blob(g, ellipse(0, 0, 44, 40, 11, 0, sd + 21), { fill: coat, shade, line: ink, lw: 6, seed: sd + 21, t, hw: 5, tone: .8, sh: .28 });
  blob(g, ellipse(100, 4, 17, 13, 8, .2, sd + 22), { fill: ink, line: null, seed: sd + 22, t, gap: 3.2, hw: 4.6, tone: .95 });
  dot(g, 94, -1, 3.4, { col: '#fbf8ef', seed: sd + 29, t, alpha: .7 });
  if (mouth > .25) blob(g, [[30, 24], [82, 26], [76, 24 + 10 + mouth * 14], [42, 24 + 12 + mouth * 14]], { fill: '#7a2e2a', line: ink, lw: 4.4, seed: sd + 23, t, tone: .9 });
  else line(g, [[80, 22], [56, 30], [34, 26]], { w: 5, col: ink, seed: sd + 23, t, spline: true, passes: 1, over: 0, bow: 0 });
  if (eyes === 'happy') line(g, [[14, -3], [24, -14], [34, -3]], { w: 6.4, col: ink, seed: sd + 24, t, spline: true, passes: 1, over: 0, bow: 0 });
  else if (I.blink > .5) line(g, [[14, -2], [34, -2]], { w: 6, col: ink, seed: sd + 24, t, spline: false, passes: 1, over: 0, bow: 0 });
  else { const r = eyes === 'wide' ? 14 : 12; if (eyes === 'wide') blob(g, ellipse(28, -8, r + 5, r + 6, 8, 0, sd + 25), { fill: '#fbf8ef', line: ink, lw: 4.4, seed: sd + 25, t, tone: .95 }); dot(g, 30, -7, r, { col: ink, seed: sd + 26, t }); dot(g, 25, -13, 4, { col: '#fbf8ef', seed: sd + 27, t }); }
  g.save(); g.translate(-8, -20); g.rotate(-ang - (up ? Math.PI : 0)); if (up) g.scale(1, -1);
  blob(g, [[-12, 0], [8, -3], [18, 20], [8, 56], [-6, 62], [-20, 36]], { fill: shade, shade: '#5d331a', line: ink, lw: 5.6, seed: sd + 28, t, hw: 4.8, tone: .8, sh: .3 });
  g.restore();
  g.restore();
}
GAGS.flex = (g, t, k) => {
  const { a, gr } = k;
  const P = pens(g, t, 3100), tr = travel(k);
  const CY = -78, HC = [0, -150];
  const P0 = spineStraight(-6, CY), P1 = spineRing(0, HC[1]), P3 = spineCoil(-34, -58);
  const e1 = spring(a, -.06, { f: 2.3, z: .34 }), e2 = spring(a, .42, { f: 2.3, z: .34 }), e3 = spring(a, .9, { f: 2.3, z: .34 });
  const sp = P0.map((p, i) => [p[0] + (P1[i][0] - p[0]) * (e1 - e2) + (P3[i][0] - p[0]) * e3, p[1] + (P1[i][1] - p[1]) * (e1 - e2) + (P3[i][1] - p[1]) * e3]);
  const hop_ = a < -.06 ? tr.hop * .5 + gr.bob * .3 : gr.bob * .25;
  const sp2 = sp.map(([x, y]) => [x, y - hop_]);
  // 1. The hoop, standing on a post; it pops in as the word lands and out as the tunnel comes.
  const hoop = backOut(puff((a + .2) / .14), 2.4) * (1 - puff((a - .34) / .1));
  if (hoop > .02) { g.save(); g.translate(0, HC[1]); g.scale(hoop, hoop); g.translate(0, -HC[1]);
    P.L(1, [[0, 0], [0, HC[1] + 100]], { w: 13, col: '#e6b73a', spline: false, ...steady, alpha: 1 });
    P.L(2, [[-52, 1], [52, 1]], { w: 12, col: '#e6b73a', spline: false, ...steady });
    const ring = []; for (let i = 0; i <= 28; i++) { const an = i / 28 * TAU; ring.push([Math.cos(an) * 100, HC[1] + Math.sin(an) * 100]); }
    P.L(3, ring, { w: 22, col: C.red, spline: true, closed: true, flat: true, ...steady, alpha: 1, tooth: .5 });
    P.L(4, ring.map(([x, y]) => [x * 1.13, HC[1] + (y - HC[1]) * 1.13]), { w: 5, col: ink, spline: true, closed: true, flat: true, ...steady, alpha: .8 });
    P.L(5, ring.map(([x, y]) => [x * .87, HC[1] + (y - HC[1]) * .87]), { w: 5, col: ink, spline: true, closed: true, flat: true, ...steady, alpha: .8 });
    g.restore(); }
  // The dog.
  const ring_ = a > -.06 && a < .42, tun = a >= .42 && a < .9;
  bruceNoodle(g, t, sp2, { seed: 5, eyes: ring_ ? 'wide' : tun ? 'open' : 'happy', mouth: ring_ ? .5 : .2 });
  // 2. The tunnel slides over the middle of him, striped; he is longer than it is.
  const tin = pl(a, [[.36, -430], [.5, 0], [.84, 0], [.96, 430]]);
  if (tin > -420 && tin < 420) { g.save(); g.translate(tin, 0);
    P.B(10, rrect(0, -62, 236, 124, 44, 3, 3110), { fill: C.orange, shade: '#b5541a', lw: 6.4, hw: 5.2, tone: .85, sh: .3 });
    [-1, 0, 1].forEach((f, i) => P.B(11 + i, rrect(f * 62, -62, 24, 116, 6, 2, 3120 + i), { fill: '#fbf8ef', line: null, tone: .9, dens: .5 }));
    P.B(14, ellipse(112, -62, 15, 58, 12, 0, 3114), { fill: '#3a2a26', line: ink, lw: 5.6, tone: .95 });
    g.restore(); }
  // 3. The fence with the cat flap: he is a small curl behind it, his head out of the flap.
  const dr = backOut(puff((a - .86) / .12), 2.4);
  if (dr > .02) { g.save(); g.translate(0, 0); g.scale(dr, dr);
    P.B(20, sharp([[-84, 0], [-84, -182], [-56, -198], [0, -182], [56, -198], [84, -182], [84, 0]], 5), { fill: '#d6a466', shade: '#93662f', lw: 6.4, hw: 5.2, tone: .85, sh: .28 });
    [-42, 0, 42].forEach((x, i) => P.L(21 + i, [[x, -10], [x, -176]], { w: 4.4, col: '#93662f', alpha: .7, spline: false, ...steady }));
    P.B(25, rrect(0, -62, 80, 70, 24, 3, 3125), { fill: '#3a2a26', line: ink, lw: 5.6, tone: .95 });
    g.restore();
    if (dr > .9) {
      const fo = pl(a, [[.9, 0], [1.02, 1.3]]);
      g.save(); g.translate(0, -93); g.scale(1, Math.cos(fo));
      P.B(30, rrect(0, 29, 74, 62, 20, 3, 3130), { fill: '#a4692f', shade: '#6d4a1e', lw: 5.4, hw: 4.6, tone: .8, sh: .3 });
      g.restore();
      g.save(); g.translate(14, -66); g.scale(1.12, 1.12); g.translate(-14, 66);
      bruceNoodle(g, t, Array.from({ length: 10 }, (_, i) => [-100 + i * 10, -62]), { seed: 5, eyes: 'happy', mouth: .4, headOnly: true });
      g.restore();
    } }
  { const nk = sp2[7]; pin(g, t, a > .9 ? 0 : nk[0] + 6, a > .9 ? -232 : nk[1] - 44, 26, k.col, a, 3140); }
};

// ================================================================= 2. detectability
// A flea with a jingle bell drops on a beagle's nose; the bell rings the moment it appears, and the beagle's
// eyes snap to it. (Would you notice when it goes wrong? The bell, not a magnifier.)
function flea(g, t, x, y, s, o = {}) {
  const { seed = 1, squash = 0, ring = 0, rot = 0 } = o;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s * (1 + squash * .2), s * (1 - squash * .2));
  const L = (id, pts, w = 7) => line(g, pts, { w, col: ink, seed: seed + id, t, spline: true, passes: 1, over: 0, bow: 0 });
  L(1, [[-12, -22], [-34, -40], [-46, -4]], 9);            // the big jumping leg
  L(2, [[-4, -14], [-8, -2], [-16, 2]], 6); L(3, [[10, -14], [14, -2], [22, 2]], 6);
  blob(g, ellipse(0, -30, 27, 23, 10, 0, seed + 4), { fill: '#a0522d', shade: '#6b2f18', line: ink, lw: 5, seed: seed + 4, t, hw: 4.6, tone: .9, sh: .3 });
  blob(g, ellipse(28, -38, 17, 16, 9, 0, seed + 5), { fill: '#a0522d', line: ink, lw: 5, seed: seed + 5, t, hw: 4.4, tone: .9 });
  L(6, [[30, -52], [36, -68], [50, -72]], 5); L(7, [[22, -52], [22, -70], [10, -76]], 5);
  [[24, -42], [36, -42]].forEach(([ex, ey], i) => { dot(g, ex, ey, 6.4, { col: '#fbf8ef', seed: seed + 8 + i, t }); dot(g, ex + 1.5, ey + 1, 3.2, { col: ink, seed: seed + 10 + i, t }); });
  L(12, [[24, -30], [32, -26], [40, -32]], 4.4);
  // The collar and the bell.
  line(g, [[12, -46], [10, -30], [16, -14]], { w: 6, col: C.red, seed: seed + 13, t, spline: true, passes: 1, over: 0, bow: 0 });
  blob(g, ellipse(14, -8, 15, 15, 8, 0, seed + 14), { fill: '#f4c93a', shade: '#b8860b', line: ink, lw: 4, seed: seed + 14, t, hw: 4, tone: .9, sh: .3 });
  line(g, [[4, -8], [24, -8]], { w: 3.4, col: ink, seed: seed + 15, t, spline: false, passes: 1, over: 0, bow: 0 });
  dot(g, 14, -2, 3.6, { col: ink, seed: seed + 16, t });
  // The jingle: arcs either side of the bell, pulsing.
  if (ring > 0) [-1, 1].forEach((sd, j) => [34, 54].forEach((r, i) => line(g, [[14 + sd * (r - 8), -8 - r * .7], [14 + sd * r, -8], [14 + sd * (r - 8), -8 + r * .7]], { w: 6, col: '#e0a020', seed: seed + 17 + i * 2 + j, t, spline: true, passes: 1, over: 0, bow: 0, alpha: ring * (1 - i * .3) })));
  g.restore();
}
GAGS.detect = (g, t, k) => {
  const { a, gr } = k;
  const P = pens(g, t, 3300), tr = travel(k);
  const appear = -.2, DX = -10, NOSE = [DX + 14, -352];
  const fp = inv(appear, 0, a);
  // The flea: appears above, hops down to the nose.
  let fx = 130, fy = -560, sq = 0;
  if (a >= appear) { const u = easeOut(fp, 2); fx = lerp(130, NOSE[0], u); fy = lerp(-560, NOSE[1] + 6, u) - Math.sin(u * Math.PI) * 80; sq = a > 0 ? Math.exp(-a * 12) * Math.cos(a * 34) : 0; }
  const noticed = a >= appear + .04, onNose = a >= 0;
  dogFront(g, { x: DX, y: -118 - gr.bob * .55 - tr.hop, s: 1.5, t, seed: 61, breed: 'lab', eyes: noticed ? 'wide' : 'dot', look: noticed ? [clamp((fx - DX) / 90, -1, 1) * .8, -1] : [-.4, .3], mouth: onNose ? .25 : 0, collar: C.red, body: true, tilt: gr.lean + tr.lean, ear: noticed ? .9 : Math.sin(t * 2) * .2 });
  if (a >= appear) flea(g, t, fx, fy + (onNose ? Math.abs(Math.sin(t * 9)) * -6 : 0), 1.75, { seed: 3310, squash: sq, ring: .5 + .5 * Math.abs(Math.sin(t * 22)), rot: onNose ? 0 : (1 - fp) * -.5 });
  // The dog's "!".
  if (a > .03) { const q = backOut(puff((a - .03) / .16), 2.6); g.save(); g.translate(DX + 168, -396); g.scale(q, q); bubble(g, 0, 0, 92, 96, -50, 66, t, { seed: 3340, r: 30 }); P.W(20, '!', 0, 36, 70, { col: C.red, align: 'center', w: .14 }); g.restore(); }
  pin(g, t, DX - 112, -60, 28, k.col, a, 3345);
};

// ================================================================= 3. suitability
// A dog in a yellow raincoat and boots, under an umbrella, for the wet walk; beside him a dog in a tuxedo and a
// top hat, soaked. (Does it fit what the person needs?)
function rainDrops(g, t, x0, x1, yTop, yBot, n, seed, stop) {
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, hash(seed, i)), sp = 520 + hash(seed, i, 2) * 160, ph = hash(seed, i, 3) * (yBot - yTop);
    const y = yTop + ((t * sp + ph) % (yBot - yTop));
    if (stop && stop(x, y)) continue;
    line(g, [[x, y], [x - 8, y + 30]], { w: 7, col: '#3a7fd0', seed: seed * 10 + i, t, spline: false, passes: 1, over: 0, bow: 0, alpha: .9, taper: [.2, .5] });
  }
}
GAGS.suit = (g, t, k) => {
  const { a, gr } = k;
  const P = pens(g, t, 3400), tr = travel(k);
  const AX = -110, BX = 112, CHIN = -122;
  const wet = clamp((a + .06) / .3), shakeB = shake(t, k.L + .1, { dur: .6, amp: 9, f: 11 }), rain = smooth(inv(-.3, -.1, a)), cl = backOut(puff((a + .34) / .16), 2.2);
  // The dry dog: hood, coat, boots; the umbrella over him.
  P.B(1, ellipse(AX, CHIN - 92, 96, 88, 12, 0, 3401), { fill: '#f5c02c', shade: '#c48a10', lw: 6, hw: 5, tone: .8, sh: .3 });
  P.B(2, rrect(AX, CHIN + 4 - 62 + 60, 150, 116, 34, 3, 3402), { fill: '#f5c02c', shade: '#c48a10', lw: 6.4, hw: 5.2, tone: .8, sh: .3 });
  [0, 1, 2].forEach(i => P.D(3 + i, AX + 4, CHIN - 6 + 30 + i * 30, 6, { col: '#8a5a10' }));
  [-1, 1].forEach((sd, i) => P.B(6 + i, rrect(AX + sd * 40, -14, 52, 34, 12, 3, 3406 + i), { fill: C.red, shade: '#8f2226', lw: 5.6, hw: 4.8, tone: .85, sh: .3 }));
  dogFront(g, { x: AX, y: CHIN - gr.bob * .5 - tr.hop * .6, s: 1.0, t, seed: 63, breed: 'lab', eyes: 'happy', mouth: .35, tongue: false, collar: null, tilt: gr.lean * .8 + tr.lean, ear: Math.sin(t * 4) * .2 });
  // Umbrella: a red dome with a white stripe, its pole to his paw.
  const UY = -330;
  P.L(10, [[AX + 36, UY + 10], [AX + 36, -96]], { w: 8, col: '#5b5a66', spline: false, ...steady });
  const dome = []; for (let i = 0; i <= 14; i++) { const an = Math.PI * (1 - i / 14); dome.push([AX + 30 + Math.cos(an) * 176, UY - Math.sin(an) * 74 + (i % 2 ? 0 : 0)]); }
  P.B(11, [...dome, [AX + 30 + 176 * .55, UY + 12], [AX + 30, UY + 4], [AX + 30 - 176 * .55, UY + 12]], { fill: C.red, shade: '#8f2226', lw: 6.4, hw: 5.2, tone: .85, sh: .25 });
  P.L(12, [[AX + 30, UY - 70], [AX + 30 + 60, UY - 40], [AX + 30 + 90, UY + 8]], { w: 12, col: '#fbf8ef', spline: true, alpha: .9, ...steady });
  P.L(13, [[AX + 30, UY - 70], [AX + 30 - 60, UY - 40], [AX + 30 - 90, UY + 8]], { w: 12, col: '#fbf8ef', spline: true, alpha: .9, ...steady });
  paw(g, t, AX + 36, -92, .7, 3414, '#f6dfa4');
  // The wet dog: a soaked beagle in a tuxedo and a limp top hat.
  P.B(20, rrect(BX + shakeB, CHIN + 60 - 4, 148, 116, 28, 3, 3420), { fill: '#2b2a33', shade: '#111', lw: 6.4, hw: 5.2, tone: .9, sh: .25 });
  P.B(21, sharp([[BX - 30 + shakeB, CHIN + 2], [BX + 30 + shakeB, CHIN + 2], [BX + shakeB, CHIN + 96]], 4), { fill: '#fbf8ef', line: ink, lw: 4.6, tone: .9, dens: .4 });
  P.B(22, sharp([[BX - 22 + shakeB, CHIN + 14], [BX + shakeB, CHIN + 2], [BX + 22 + shakeB, CHIN + 14], [BX + 8 + shakeB, CHIN + 26], [BX - 8 + shakeB, CHIN + 26]], 5), { fill: C.red, line: ink, lw: 4.6, tone: .9 });
  P.B(23, ellipse(BX + shakeB, 4, 120, 16, 12, 0, 3423), { fill: '#7fb0d8', line: ink, lw: 4.6, tone: .7, dens: .8 });
  dogFront(g, { x: BX + shakeB, y: CHIN - gr.bob * .2, s: 1.0, t, seed: 65, breed: 'beagle', eyes: wet > .3 ? 'sad' : 'dot', mouth: 0, collar: null, tilt: gr.lean * .4 + shakeB * .01, ear: 1, sweat: wet > .6,
    hat: (g2, top, rx) => { g2.save(); g2.translate(0, top + 12); g2.rotate(.16);
      blob(g2, sharp([[-rx * .5, 0], [-rx * .46, -110], [rx * .5, -100], [rx * .54, 0]], 8), { fill: '#3a3947', shade: '#1a1a22', line: ink, lw: 6, seed: 3430, t, hw: 4.6, tone: .9, sh: .3 });
      blob(g2, ellipse(0, 8, rx * .95, 15, 10, 0, 3431), { fill: '#3a3947', line: ink, lw: 6, seed: 3431, t, hw: 4.6, tone: .9 });
      g2.restore(); } });
  // Rain from a cloud over both; the umbrella keeps it off the dry one.
  const cx0 = -20;
  [[-118, -452, 46], [118, -452, 44], [-64, -486, 58], [66, -486, 56], [0, -498, 64], [-30, -450, 52], [40, -448, 54]].forEach(([x, y, r], i) => cl > .02 && P.B(30 + i, ellipse((x - 14) * cl - 20 * (1 - cl), -450 + (y + 450) * cl, r * cl, r * .86 * cl, 10, 0, 3430 + i), { fill: '#b6c0d6', shade: '#8a96b4', lw: 5.4, hw: 5, tone: .85, sh: .3 }));
  if (rain > .02) rainDrops(g, t, -236, 236, -400, 0, Math.round(46 * rain), 3450, (x, y) => Math.abs(x - (AX + 30)) < 176 && y > UY - Math.sqrt(Math.max(0, 1 - ((x - AX - 30) / 176) ** 2)) * 74);
  // Drips off the top hat and the wet dog's chin.
  if (wet > .3) [0, 1, 2].forEach(i => { const ph = (t * 1.6 + i * .33) % 1; blob(g, ellipse(BX - 40 + i * 36, CHIN - 190 + ph * 190, 6, 10, 6, 0, 3470 + i), { fill: '#4d8fd6', line: null, seed: 3470 + i, t, tone: .9, hw: 4 }); });
  pin(g, t, AX - 88, -226, 28, k.col, a, 3480);
};

// ================================================================= 4. reusability
// One ball, three games: three medallions pop up round a happy dog, each with the same ball in a different game
// (fetch, tug, a hoop). (Can you use it again elsewhere?)
function medal(g, t, x, y, r, seed, col, draw, k = 1, rot = 0) {
  if (k <= 0) return;
  g.save(); g.translate(x, y); g.scale(k, k); g.rotate(rot);
  blob(g, scallop(0, 0, r, 14, .07, 0, seed), { fill: col, shade: ink, line: ink, lw: 5.4, seed, t, hw: 5, tone: .8, sh: .2 });
  blob(g, ellipse(0, 0, r * .82, r * .82, 12, 0, seed + 1), { fill: '#fbf8ef', line: ink, lw: 4.4, seed: seed + 1, t, hw: 4.6, tone: .95, dens: .25 });
  draw(g, r * .82);
  g.restore();
}
GAGS.reuse = (g, t, k) => {
  const { a, gr } = k;
  const P = pens(g, t, 3600), tr = travel(k);
  const bp = beatPulse(t, .17);
  // The dog with the ball in his lap.
  dogFront(g, { x: 0, y: -100 - gr.bob * .5 - tr.hop, s: 1.12, t, seed: 67, breed: 'corgi', eyes: 'happy', mouth: .5, tongue: true, collar: C.blue, body: true, tilt: gr.lean + tr.lean, ear: bp * .6 });
  ball(g, t, 0, -46 - gr.bob * .5 - tr.hop, 40, 3610, t * 1.6);
  const K1 = backOut(puff((a + .02) / .2), 2.4), K2 = backOut(puff((a - .07) / .2), 2.4), K3 = backOut(puff((a - .16) / .2), 2.4);
  // 1. fetch: a ball arcs to a dog's open mouth.
  medal(g, t, -178, -398, 78, 3620, C.sky, (g2, r) => {
    dogFront(g2, { x: 26, y: 46, s: .36, t, seed: 68, breed: 'mutt', eyes: 'happy', mouth: .9, tongue: true, collar: C.red });
    line(g2, [[-52, 34], [-40, -14], [-10, -30], [8, -10]], { w: 5, col: ink, seed: 3625, t, spline: true, passes: 1, over: 0, bow: 0, alpha: .7 });
    ball(g2, t, -6, -22, 17, 3626, t * 4);
  }, K1, -.12);
  // 2. tug: a rope with the ball for a knot, pulled both ways.
  medal(g, t, 0, -448, 78, 3630, C.orange, (g2, r) => {
    line(g2, [[-58, 6], [-30, -2], [0, 6], [30, -2], [58, 6]], { w: 12, col: '#c99a5a', seed: 3635, t, spline: true, passes: 1, over: 0, bow: 0 });
    ball(g2, t, 0, 4, 21, 3636, 0);
    [-1, 1].forEach((sd, i) => line(g2, [[sd * 44, -30], [sd * 62, -22], [sd * 44, -14]], { w: 6, col: C.red, seed: 3637 + i, t, spline: false, passes: 1, over: 0, bow: 0 }));
  }, K2, .05);
  // 3. a hoop game: the ball on its way through a hoop.
  medal(g, t, 178, -398, 78, 3640, C.lime, (g2, r) => {
    const ring = []; for (let i = 0; i <= 20; i++) { const an = i / 20 * TAU; ring.push([30 + Math.cos(an) * 17, -6 + Math.sin(an) * 40]); }
    line(g2, ring, { w: 8, col: C.red, seed: 3645, t, spline: true, closed: true, passes: 1, over: 0, bow: 0 });
    line(g2, [[30, 30], [30, 50]], { w: 7, col: '#8b5f2a', seed: 3646, t, spline: false, passes: 1, over: 0, bow: 0 });
    line(g2, [[-54, 38], [-40, -8], [-14, -10]], { w: 5, col: ink, seed: 3647, t, spline: true, passes: 1, over: 0, bow: 0, alpha: .7 });
    ball(g2, t, -12, -12, 17, 3648, t * 4);
  }, K3, .12);
  pin(g, t, -100, -30, 28, k.col, a, 3650);
};

// ================================================================= 5. sustainability
// A dog waters a sapling; calendar pages flip and it grows into a tree, under a small sun beside a solar panel.
// The recycle sign is on his watering can. (Does it last without wasting energy?)
GAGS.sustain = (g, t, k) => {
  const { a, gr } = k;
  const P = pens(g, t, 3500), tr = travel(k);
  const gp = smooth(inv(-.02, 1.2, a)), TX = 54;
  // The sun and the solar panel.
  sun(g, t, 196, -436, 42, { mood: 'happy', look: [-.5, .8], seed: 3510, rays: 10 });
  P.L(1, [[176, -20], [176, -168]], { w: 10, col: '#5b5a66', spline: false, ...steady });
  g.save(); g.translate(176, -184); g.rotate(-.42);
  P.B(2, rrect(0, 0, 118, 66, 8, 2, 3502), { fill: '#3f6fd6', shade: '#25397c', lw: 5.6, hw: 4.8, tone: .85, sh: .25 });
  [-1, 0, 1].forEach((f, i) => P.L(3 + i, [[f * 30 + 15, -30], [f * 30 + 15, 30]], { w: 3.4, col: '#dfe9ff', spline: false, alpha: .8, ...steady }));
  P.L(6, [[-56, 0], [56, 0]], { w: 3.4, col: '#dfe9ff', spline: false, alpha: .8, ...steady });
  g.restore();
  // The tree: a sapling that grows.
  const H_ = 44 + 190 * gp, R = 22 + 88 * gp, tw = 8 + 20 * gp, sw = sway(t) * 3 * gp;
  P.L(7, [[TX, 0], [TX + 3, -H_ * .5], [TX + sw, -H_]], { w: tw * 2, col: '#8b5f2a', spline: true, taper: [.05, .5], ...steady, alpha: 1, tooth: .5 });
  if (gp > .3) { P.L(8, [[TX, -H_ * .5], [TX - 34 * gp, -H_ * .72]], { w: tw * .7, col: '#8b5f2a', spline: false, ...steady }); P.L(9, [[TX, -H_ * .6], [TX + 38 * gp, -H_ * .8]], { w: tw * .7, col: '#8b5f2a', spline: false, ...steady }); }
  P.B(10, scallop(TX + sw, -H_ - R * .45, R, 9, .16, 0, 3510), { fill: C.green, shade: '#2f8a4a', lw: 6, hw: 5, tone: .85, sh: .35 });
  if (gp > .92) [[-.4, -.1], [.3, -.3], [.1, .3]].forEach(([dx, dy], i) => P.D(11 + i, TX + sw + dx * R, -H_ - R * .45 + dy * R, 11, { col: C.red }));
  // The dog and the watering can.
  dogFront(g, { x: -128, y: -108 - gr.bob * .5 - tr.hop, s: 1.05, t, seed: 69, breed: 'lab', eyes: 'happy', mouth: .4, collar: C.green, body: true, tilt: gr.lean + tr.lean, ear: Math.sin(t * 4) * .2 });
  const cx = -40, cy = -94;
  P.B(20, sharp([[cx - 30, cy - 30], [cx + 30, cy - 30], [cx + 36, cy + 30], [cx - 36, cy + 30]], 10), { fill: '#3fae5a', shade: '#1f6b34', lw: 5.6, hw: 4.8, tone: .85, sh: .3 });
  P.L(21, [[cx + 32, cy - 6], [cx + 66, cy - 40], [cx + 84, cy - 56]], { w: 12, col: '#3fae5a', spline: true, ...steady, alpha: 1 });
  P.L(22, [[cx - 34, cy - 24], [cx - 66, cy - 6], [cx - 40, cy + 22]], { w: 7, col: '#1f6b34', spline: true, ...steady });
  recycle(g, t, cx, cy + 2, 17, 3525, '#fbf8ef');
  [0, 1, 2, 3, 4].forEach(i => { const ph = (t * 2.2 + i * .2) % 1; P.B(30 + i, ellipse(cx + 88 + ph * 14, cy - 50 + ph * ph * (H_ * .5 - 20 + 50) * .9, 4.6, 8, 6, 0, 3530 + i), { fill: '#4d8fd6', line: null, tone: .9, hw: 4 }); });
  // The calendar, its pages flipping as the years go.
  const CX = -108, CY = -388, fl = a * 5.2, nfl = Math.floor(clamp(fl, 0, 6.99)), ph = fl - Math.floor(fl);
  P.B(40, rrect(CX, CY, 112, 104, 10, 2, 3540), { fill: '#fbf8ef', line: ink, lw: 5.4, tone: .95, dens: .25 });
  P.B(41, rrect(CX, CY - 40, 112, 26, 8, 2, 3541), { fill: C.red, line: ink, lw: 4.6, tone: .85 });
  [-30, 30].forEach((x, i) => P.L(42 + i, [[CX + x, CY - 56], [CX + x, CY - 34]], { w: 6, col: ink, spline: false, ...steady }));
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) P.D(44 + r * 4 + c, CX - 39 + c * 26, CY - 6 + r * 30, 4.4, { col: '#8d8c97' });
  if (a > 0 && a < 1.3 && fl < 7) { g.save(); g.translate(CX, CY - 28); g.scale(1, Math.max(.06, Math.abs(Math.cos(ph * Math.PI * .95)))); P.B(60, rrect(0, 44, 108, 88, 8, 2, 3560 + nfl), { fill: '#fbf8ef', line: ink, lw: 4.6, tone: .95, dens: .2 }); g.restore(); }
  pin(g, t, -190, -218, 28, k.col, a, 3570);
};

// ================================================================= 6. changeability
// A red phone box; the dog inside changes hats in a flurry (chef, party, top hat, crown), a poof each time.
// (How easy is it to make changes?)
function hat(g, t, kind, x, y, s, seed) {
  g.save(); g.translate(x, y); g.scale(s, s);
  if (kind === 0) { [[-30, -34, 26], [0, -48, 30], [30, -34, 26]].forEach(([dx, dy, r], i) => blob(g, ellipse(dx, dy, r, r * .9, 9, 0, seed + i), { fill: '#fbf8ef', line: ink, lw: 5, seed: seed + i, t, hw: 4.6, tone: .95, dens: .3 })); blob(g, rrect(0, -6, 80, 32, 8, 2, seed + 4), { fill: '#fbf8ef', line: ink, lw: 5, seed: seed + 4, t, hw: 4.6, tone: .95, dens: .3 }); }
  else if (kind === 1) { blob(g, [[-38, 0], [0, -108], [38, 0]], { fill: C.blue, shade: '#25397c', line: ink, lw: 5.4, seed, t, hw: 4.8, tone: .85, sh: .25 }); dot(g, 0, -112, 9, { col: C.yellow, seed: seed + 1, t }); [[-8, -50], [10, -30], [-4, -76]].forEach(([dx, dy], i) => dot(g, dx, dy, 4.6, { col: '#fbf8ef', seed: seed + 2 + i, t })); }
  else if (kind === 2) { blob(g, sharp([[-30, 0], [-28, -74], [28, -74], [30, 0]], 6), { fill: '#3a3947', shade: '#1a1a22', line: ink, lw: 5.4, seed, t, hw: 4.6, tone: .9, sh: .3 }); blob(g, ellipse(0, 2, 56, 11, 10, 0, seed + 1), { fill: '#3a3947', line: ink, lw: 5.4, seed: seed + 1, t, hw: 4.6, tone: .9 }); line(g, [[-29, -14], [29, -14]], { w: 9, col: C.red, seed: seed + 2, t, spline: false, passes: 1, over: 0, bow: 0 }); }
  else { blob(g, sharp([[-40, 0], [-42, -52], [-22, -30], [0, -64], [22, -30], [42, -52], [40, 0]], 5), { fill: '#f4c93a', shade: '#b8860b', line: ink, lw: 5.4, seed, t, hw: 4.8, tone: .85, sh: .3 }); [-24, 0, 24].forEach((dx, i) => dot(g, dx, -14, 5.4, { col: C.red, seed: seed + 1 + i, t })); }
  g.restore();
}
GAGS.change = (g, t, k) => {
  const { a, gr } = k;
  const P = pens(g, t, 3800), tr = travel(k);
  const CHIN = -108, HT = CHIN - 2 * 76 * 1.0 + 16;
  // The hats: the times each lands (the last, the crown, on the word); the earlier ones fly up and out.
  const T = [-.4, -.26, -.12, 0];
  const cur = T.filter(x => a >= x).length - 1;
  // The box's inside, then the dog and the hats, then the box's red frame over them.
  P.B(1, rrect(0, -200, 176, 350, 10, 2, 3801), { fill: '#e9dcc0', line: ink, lw: 5, tone: .7, dens: .6 });
  dogFront(g, { x: 0, y: CHIN - gr.bob * .4, s: 1.0, t, seed: 71, breed: 'pug', eyes: 'happy', mouth: .4, tongue: cur >= 3, collar: C.red, body: true, tilt: gr.lean * .6 + tr.lean, ear: bp2(t) * .5 });
  // A poof of white at each change.
  T.forEach((ta, i) => { const d = a - ta; if (d > 0 && d < .16) { const f = d / .16; [[-34, 6], [30, 0], [0, -20]].forEach(([dx, dy], j) => blob(g, ellipse(dx * (1 + f), HT + dy - f * 20, 24 * (.5 + f), 20 * (.5 + f), 8, 0, 3850 + i * 4 + j), { fill: '#fbf8ef', line: ink, lw: 4.4, seed: 3850 + i * 4 + j, t, tone: .95, dens: .2, hw: 4.4 })); } });
  T.forEach((ta, i) => {
    const d = a - ta, nx = i + 1 < T.length ? T[i + 1] : 9;
    if (d < 0) return;
    if (a < nx) { const pop = backOut(puff(d / .09), 2.6); hat(g, t, i, 0, HT + 8 - (1 - pop) * 26, pop * 1.25, 3810 + i * 10); }
    else { const f = puff((a - nx) / .18); if (f < 1) hat(g, t, i, f * 40, HT + 8 - f * f * 230, 1.25, 3810 + i * 10); }
  });
  // The frame: posts, the base panel, a roof with its top band; glazing bars.
  P.B(5, rrect(-92, -200, 22, 350, 6, 2, 3805), { fill: C.red, shade: '#8f2226', lw: 6, hw: 5, tone: .85, sh: .25 });
  P.B(6, rrect(92, -200, 22, 350, 6, 2, 3806), { fill: C.red, shade: '#8f2226', lw: 6, hw: 5, tone: .85, sh: .25 });
  P.B(7, rrect(0, -48, 176, 96, 8, 2, 3807), { fill: C.red, shade: '#8f2226', lw: 6.4, hw: 5.2, tone: .85, sh: .25 });
  P.B(8, sharp([[-104, -372], [104, -372], [96, -420], [40, -452], [0, -458], [-40, -452], [-96, -420]], 10), { fill: C.red, shade: '#8f2226', lw: 6.4, hw: 5.2, tone: .85, sh: .25 });
  P.B(9, rrect(0, -368, 150, 26, 6, 2, 3809), { fill: '#fbf8ef', line: ink, lw: 4.6, tone: .95, dens: .25 });
  if (a > 0 && a < .3) twinkle(g, t, 78, HT - 40, 24 * Math.min(1, a * 9), 3860, C.yellow, t * 3);
  pin(g, t, 128, -420, 28, k.col, a, 3870);
};
const bp2 = t => beatPulse(t, .17);

// ================================================================= 7. deployability
// A dog presses a big DEPLOY button; on a little cart he glides down a gentle ramp into the ring, and beside the
// button a lever marked BACK is ready to bring him home. (How easy is it to ship changes live?)
GAGS.deploy = (g, t, k) => {
  const { a, gr } = k;
  const P = pens(g, t, 3900), tr = travel(k);
  const RX0 = -136, RX1 = 64, RTOP = -104, CXc = -208, RC = 178, RRX = 88;
  const rampY = x => RTOP * (1 - clamp((x - RX0) / (RX1 - RX0)));
  const press = a < -.16 ? 0 : a < -.08 ? (a + .16) / .08 : a < .05 ? 1 - (a + .08) / .13 : 0;
  // The dog: waiting at the top of the ramp, then down it (faster and faster), then across the ring and stopping.
  const X0 = RX0 + 48;
  const dx = a <= 0 ? X0 : a < .46 ? lerp(X0, RX1, Math.pow(a / .46, 2)) : lerp(RX1, RC, easeOut(clamp((a - .46) / .44), 2.2));
  const dy = dx < RX1 ? rampY(dx) : 0;
  const slope = dx < RX1 ? Math.atan(-RTOP / (RX1 - RX0)) : 0;
  const rolling = a > 0 && a < .9;
  // The ring: a flat oval of sawdust with a red rope on posts, back arc first.
  P.B(1, ellipse(RC, -14, RRX + 8, 32, 12, 0, 3901), { fill: '#d9a35a', shade: '#b07a2e', lw: 5.4, hw: 5, tone: 1, sh: .4 });
  const back = []; for (let i = 0; i <= 10; i++) { const an = Math.PI * (1 + i / 10); back.push([RC + Math.cos(an) * (RRX + 6), -14 + Math.sin(an) * 32 - 46]); }
  P.L(2, back, { w: 11, col: C.red, spline: true, ...steady, alpha: 1 });
  [-1, 1].forEach((sd, i) => { P.L(3 + i, [[RC + sd * (RRX + 6), -14], [RC + sd * (RRX + 6), -62]], { w: 11, col: '#8b5f2a', spline: false, ...steady }); P.D(42 + i, RC + sd * (RRX + 6), -66, 9, { col: '#fbf8ef' }); });
  // The ramp: a long low wedge with slats.
  P.B(6, sharp([[RX0 - 8, RTOP], [RX0 - 8, 0], [RX1 + 30, 0]], 6), { fill: '#d6a466', shade: '#93662f', lw: 6.4, hw: 5.2, tone: .85, sh: .3 });
  for (let i = 1; i < 6; i++) { const x = lerp(RX0, RX1, i / 6); P.L(7 + i, [[x, rampY(x) + 10], [x, -4]], { w: 3.6, col: '#93662f', alpha: .6, spline: false, ...steady }); }
  P.L(15, [[RX0 - 8, RTOP], [RX1 + 30, 0]], { w: 8, col: '#8b5f2a', spline: false, ...steady });
  // The console: a plaque, a big green button (a down arrow on it) on a grey post, and the red-knobbed lever.
  P.B(16, rrect(CXc, -62, 74, 124, 8, 2, 3916), { fill: '#7a7987', shade: '#4d4c58', lw: 6, hw: 5, tone: .85, sh: .3 });
  P.B(17, sharp([[CXc - 40, -122], [CXc - 34, -150 + press * 14], [CXc + 34, -150 + press * 14], [CXc + 40, -122]], 10), { fill: '#3fae5a', shade: '#1f6b34', lw: 6, hw: 5, tone: .9, sh: .3 });
  P.L(18, [[CXc, -140 + press * 14], [CXc, -128 + press * 12]], { w: 8, col: '#fbf8ef', spline: false, ...steady });
  P.L(19, [[CXc - 11, -133 + press * 12], [CXc, -122 + press * 12], [CXc + 11, -133 + press * 12]], { w: 8, col: '#fbf8ef', spline: false, ...steady });
  P.B(20, rrect(CXc, -192, 116, 34, 8, 2, 3920), { fill: '#fbf8ef', line: ink, lw: 4.6, tone: .95, dens: .25 });
  P.W(21, 'DEPLOY', CXc, -182, 24, { col: ink, align: 'center', w: .12, track: 3 });
  const lv = pl(a, [[-.5, .5], [.6, .5], [.9, .15], [1.2, .15]]);
  P.L(22, [[CXc + 40, -36], [CXc + 40 + Math.sin(lv) * 34, -36 - Math.cos(lv) * 34]], { w: 8, col: '#fbf8ef', spline: false, ...steady });
  P.B(23, ellipse(CXc + 40 + Math.sin(lv) * 38, -36 - Math.cos(lv) * 38, 13, 13, 8, 0, 3923), { fill: C.red, shade: '#8f2226', lw: 4.6, tone: .9 });
  P.W(24, 'BACK', CXc, -14, 18, { col: '#fbf8ef', align: 'center', w: .13, track: 3 });
  // The dog on his cart.
  const bob = a < 0 ? gr.bob * .4 : 0;
  g.save(); g.translate(dx, dy - bob); g.rotate(-slope);
  P.B(30, rrect(0, -13, 176, 17, 6, 2, 3930), { fill: '#3fae5a', shade: '#1f6b34', lw: 5, hw: 4.6, tone: .85 });
  [-58, 58].forEach((wx, i) => P.B(31 + i, ellipse(wx, -1, 14, 14, 8, 0, 3931 + i), { fill: '#3a3947', line: ink, lw: 4.4, tone: .9 }));
  g.restore();
  g.save(); g.translate(dx, dy - bob); g.rotate(-slope); g.translate(-dx, -dy + bob);
  sideDog(g, 'pup', { x: dx, y: dy - 12 - bob, s: .6, t, seed: 73, eyes: a > .8 ? 'happy' : rolling ? 'wide' : 'open', mouth: a > 0 ? .5 : .2, collar: C.blue, walk: 0, tail: t * 3, ear: rolling ? .8 : .1, squash: rolling ? -.3 : 0 });
  g.restore();
  // His paw on the button before the release.
  if (a < .1) { const py = -158 + press * 14; P.B(40, capsule([dx - 34, dy - 92], [CXc + 8, py + 6], 15, 12, 5, 3940), { fill: '#f0d59a', shade: '#c9a865', lw: 5.4, hw: 4.6, tone: .6, sh: .3 }); paw(g, t, CXc + 4, py - 2, .8, 3945, '#fbf1d8'); }
  // The ring's front rope, and stars when he arrives.
  const front = []; for (let i = 0; i <= 10; i++) { const an = Math.PI * (i / 10); front.push([RC + Math.cos(an) * (RRX + 6), -14 + Math.sin(an) * 32 - 46 + 46]); }
  P.L(41, front, { w: 11, col: C.red, spline: true, ...steady, alpha: 1 });
  if (a > .78) [[RC - 40, -196, 0], [RC + 60, -176, .06], [RC + 8, -250, .12]].forEach(([x, y, d], i) => { const s2 = a - .78 - d; if (s2 > 0) twinkle(g, t, x, y, 26 * Math.min(1, s2 * 9) * (1 + Math.sin(t * 9 + i) * .2), 3950 + i, i % 2 ? C.yellow : '#fff3b0', t * 1.4 + i); });
  pin(g, t, RC, -132, 28, k.col, a, 3960);
};

// ================================================================= 8. enjoyability
// The happiest dog in the world: eyes shut in a grin, tongue out, ears flying, hopping in a burst of confetti.
// (Is it a pleasure to use?)
GAGS.enjoy = (g, t, k) => {
  const { a, gr } = k;
  const P = pens(g, t, 4000), tr = travel(k);
  const joy = a >= 0 ? Math.abs(Math.sin(a * 11)) * Math.exp(-a * 1.3) * 46 : 0;
  const y = -134 - gr.bob * .7 - tr.hop - joy;
  dogFront(g, { x: 0, y, s: 1.7, t, seed: 75, breed: 'lab', eyes: a >= -.04 ? 'happy' : 'dot', mouth: a >= -.04 ? .95 : .3, tongue: true, collar: C.red, body: true, tilt: gr.lean * 1.2 + tr.lean + (a >= 0 ? Math.sin(t * 14) * .03 : 0), ear: Math.sin(t * 19) * .7 });
  [-1, 1].forEach((sd, i) => hatch(g, ellipse(sd * 88, y - 96, 24, 15, 8, 0, 4001 + i), { col: C.pink, seed: 4001 + i, t, gap: 5, w: 4.4, alpha: .8, spill: 2.5 }));
  // Confetti: a burst from above the dog, tumbling down; streamers curling.
  if (a > -.02) for (let i = 0; i < 40; i++) {
    const an = -Math.PI / 2 + (hash(4010, i) - .5) * 2.9, v = 260 + hash(4010, i, 2) * 420, tt = a + .02;
    const x = Math.cos(an) * v * tt * 1.15, yy = -400 + Math.sin(an) * v * tt + 640 * tt * tt;
    if (yy > 0) continue;
    const r = tt * (5 + hash(4010, i, 3) * 6) + i;
    line(g, [[x - Math.cos(r) * 15, yy - Math.sin(r) * 15], [x + Math.cos(r) * 15, yy + Math.sin(r) * 15]], { w: 15, col: ROSETTES[i % 12], seed: 4100 + i, t, spline: false, passes: 1, over: 0, bow: 0, alpha: .95 });
  }
  if (a > 0) [[-120, -350, 0], [128, -330, .05], [4, -420, .1], [-176, -230, .14], [180, -240, .18]].forEach(([x, yy, d], i) => { const s = a - d; if (s > 0) twinkle(g, t, x, yy, 22 * Math.min(1, s * 9) * (1 + Math.sin(t * 9 + i) * .2), 4050 + i, i % 2 ? C.yellow : C.pink, t * 1.4 + i); });
  pin(g, t, -128, -50, 28, k.col, a, 4060);
};

// ================================================================= the tent from far off
// The wide view is the same tent, drawn again to the left and right of the frame, seen from further away:
// the camera scales the world about (540, 640), the valance's top edge, so the picture zone keeps its top and
// the room that opens up is below the stage, where the crowd is.
export const CAM = { K: .42, t0: 166.0, t1: 167.25, px: 540, py: 640 };
export function camK(t) { const e = smooth(inv(CAM.t0, CAM.t1, t)); return Math.exp(lerp(0, Math.log(CAM.K), e)); }
export function withCam(g, k, fn) { g.save(); g.translate(CAM.px, CAM.py); g.scale(k, k); g.translate(-CAM.px, -CAM.py); fn(); g.restore(); }
// Draw in wide-view screen coordinates: what is placed there lands where it says once the camera has pulled all the way back.
export function inWS(g, k, fn) {
  g.save(); g.translate(CAM.px, CAM.py); g.scale(k, k); g.translate(-CAM.px, -CAM.py);
  g.translate(CAM.px, CAM.py); g.scale(1 / CAM.K, 1 / CAM.K); g.translate(-CAM.px, -CAM.py);
  fn(); g.restore();
}
// The page and its faint peach wash: the same as tentBack's, but not part of the world (it does not shrink).
export function backPaper(g, t) {
  paper(g);
  scrub(g, [-20, -40, W + 20, 660], { col: '#f3b48c', seed: 501, t, gap: 30, w: 36, alpha: .2, angle: .07, wig: 26 });
  scrub(g, [-20, 330, W + 20, 800], { col: '#f3b48c', seed: 502, t, gap: 48, w: 34, alpha: .1, angle: -.06, wig: 28 });
}
// Seams and the two strings of bunting, as tentBack draws them, and (once the camera has moved) copies to either side.
export function backWorld(g, t, k) {
  for (const d of [-1, 0, 1]) {
    if (d && k > .999) continue;
    g.save(); g.translate(d * W, 0);
    [176, 540, 904].forEach((x, i) => line(g, [[x - 6, 730], [x + 5, 990], [x - 3, STAGE_Y]], { w: 4, col: '#b8a888', seed: 510 + i + d * 7, t, spline: true, passes: 1, alpha: .32, over: 0 }));
    bunting(g, t, -20, 744, W + 20, 752, { n: 7, sag: 42, seed: 41 + d * 5, size: 42 });
    bunting(g, t, -20, 794, W + 20, 786, { n: 6, sag: 54, seed: 47 + d * 5, size: 44, cols: [C.blue, C.pink, C.yellow, C.red, C.green, C.orange] });
    bulbs(g, t, 418, 52, 21, 560 + d * 90, 0);
    bulbs(g, t, 528, 44, 17, 590 + d * 90, 1.9);
    g.restore();
  }
}
// The strings of lamps across the tent's roof that tentBack hangs in the band under the lyric (drawn again here
// so the wide view has them too): a sagging cord and a bulb at each of n points, glowing a little on the beat.
function bulbs(g, t, y0, sag, n, seed, phase) {
  const P = u => [lerp(-20, W + 20, u), y0 + Math.sin(u * Math.PI) * sag];
  line(g, Array.from({ length: 17 }, (_, i) => P(i / 16)), { w: 4.4, col: '#8b7f60', seed, t, spline: true, passes: 1, alpha: .8, over: 0, bow: 0 });
  const bp = beatPulse(t, .16);
  for (let i = 1; i < n; i++) {
    const [x, y] = P(i / n);
    const gl = clamp(.62 + .3 * Math.sin(t * 3.4 + i * 1.7 + phase) + bp * .25);
    hatch(g, ellipse(x, y + 22, 34, 34, 10, 0, seed + 60 + i), { col: '#ffd97a', seed: seed + 60 + i, t, gap: 9, w: 14, alpha: .2 * gl, spill: 4, angle: .3 });
    line(g, [[x, y], [x, y + 8]], { w: 3.4, col: '#8b7f60', seed: seed + i, t, spline: false, passes: 1, over: 0, bow: 0 });
    dot(g, x, y + 22, 11, { col: i % 3 === 0 ? '#ff9f6b' : i % 3 === 1 ? '#ffe07a' : '#ffd0a0', seed: seed + 30 + i, t });
  }
}
// The grass of the tent floor, from the stage's foot to well below the frame.
export function floorWide(g, t, k = 1) {
  const y0 = 1408;
  scrub(g, [-1400, y0, 2500, 4300], { col: C.green, seed: 21, t, gap: 20, w: 26, alpha: .55, angle: -.12, wig: 26 });
  scrub(g, [-1400, y0 + 30, 2500, 4300], { col: C.lime, seed: 25, t, gap: 36, w: 22, alpha: .38, angle: .18, wig: 22 });
  scrub(g, [-1400, y0 + 300, 2500, 4300], { col: '#2f8a4a', seed: 30, t, gap: 30, w: 24, alpha: .3, angle: -.3, wig: 20 });
  // Tufts along the front, as the meadow has them (and a few more to either side once the camera has moved).
  for (const d of [-1, 0, 1]) {
    if (d && k > .999) continue;
    for (let i = 0; i < 9; i++) {
      const x = d * W + 60 + i * 125 + ((i * 37) % 40), y = 1600 + ((i * 53) % 220);
      for (let j = -1; j <= 1; j++) line(g, [[x + j * 14, y], [x + j * 20, y - 44 - (j === 0 ? 12 : 0)]], { w: 6, col: '#2f8a4a', seed: 300 + i * 3 + j + d * 40, t, spline: false, passes: 1, alpha: .7, taper: [.05, .8] });
    }
  }
}
// The runway and the valance, repeated to either side (each copy joins the next).
export function stageWide(g, t, scroll, k) {
  for (const d of [-1, 0, 1]) {
    if (d && k > .999) continue;
    g.save(); g.translate(d * 1160, 0); runway(g, t, scroll); g.restore();
  }
}
export function valanceWide(g, t, k) {
  for (const d of [-1, 0, 1]) {
    if (d && k > .999) continue;
    g.save(); g.translate(d * 1140, 0); valance(g, t); g.restore();
  }
}
// The singing row at the stage's foot, to either side too.
export function rowWide(g, t, k) {
  crowd(g, t);
  if (k > .999) return;
  crowd(g, t, { x0: 92 - 1150, x1: 988 - 1150, seed: 6 });
  crowd(g, t, { x0: 92 + 1150, x1: 988 + 1150, seed: 4 });
}

// ================================================================= the stream of dogs on the stage
const STREAM_KINDS = [
  { kind: 'pup', coat: '#f0d59a', shade: '#c9a865', muzzle: '#fbf1d8' }, { kind: 'hound', coat: '#c98f56', shade: '#95622f', muzzle: '#efd6ae' },
  { kind: 'white', coat: '#fbf8ef', shade: '#cfcabd', muzzle: '#fbf8ef' }, { kind: 'hound', coat: '#3a3947', shade: '#1c1b24', muzzle: '#8d8c97' },
  { kind: 'pup', coat: '#e6913a', shade: '#b56a1c', muzzle: '#fbf0dc' }, { kind: 'hound', coat: '#a7a2b0', shade: '#726d7c', muzzle: '#c4c0cb' },
];
export function streamDog(g, t, i, x, o = {}) {
  const S = STREAM_KINDS[i % STREAM_KINDS.length];
  const { gr, vel = 0, look = 0 } = o;
  const mv = clamp(Math.abs(vel) / 500);
  sideDog(g, S.kind, { ...S, x, y: 0, s: .62, t, seed: 900 + i, walk: mv > .05 ? (x / 190) % 1 : 0, tail: t * 2 + i, eyes: 'happy', mouth: .3, collar: ROSETTES[(i * 5) % 12], bob: (gr ? gr.bob * .8 : 0) + mv * Math.abs(Math.sin(x / 95 * Math.PI)) * 14, squash: gr ? gr.sq * .5 : 0, lean: gr ? gr.lean : 0 });
}

// ================================================================= the crowd, from behind and then from the front
const BACKS = {
  lab: ['#e2b04a', '#b07f22', 'floppy', '#b07f22'], beagle: ['#b8783a', '#7f4c1e', 'floppy', '#6b3f1c'], corgi: ['#e6913a', '#b56a1c', 'pointy'],
  poodle: ['#f1e4c8', '#c9b58a', 'pom'], pug: ['#e3c08a', '#a98550', 'fold', '#3a3947'], husky: ['#9a9aa8', '#63636f', 'pointy'],
  mutt: ['#c98f56', '#95622f', 'floppy', '#95622f'], dalmatian: ['#fbf8ef', '#cfcabd', 'floppy', '#2b2a33'], bulldog: ['#d6a165', '#a26f3a', 'rose'],
  sheepdog: ['#c9c7cf', '#8f8d99', 'floppy'], greyhound: ['#a7a2b0', '#726d7c', 'fold'], chihuahua: ['#e9c9a0', '#b8946a', 'pointy'],
};
const BREEDS = Object.keys(BACKS);
// A dog seen from behind: shoulders, a bandana, a round head with its ears. (x, y) is the base of the neck.
export function backDog(g, t, x, y, d, seed, breed, col, tilt = 0) {
  const [fill, shade, ear, earCol] = BACKS[breed];
  const lw = clamp(d * .05, 2.6, 5.4), gp = Math.max(3.2, d * .07), hw = Math.max(3, d * .065);
  const o = { lw, gap: gp, hw, t };
  g.save(); g.translate(x, y); g.rotate(tilt);
  blob(g, ellipse(0, d * .16, d * .6, d * .4, 10, 0, seed), { fill, shade, line: ink, seed, ...o, tone: .8, sh: .35 });
  blob(g, [[-d * .34, -d * .04], [d * .34, -d * .04], [0, d * .36]], { fill: col, line: ink, seed: seed + 1, ...o, tone: .85 });
  const ec = earCol || shade;
  if (ear === 'floppy') [-1, 1].forEach((sd, i) => blob(g, ellipse(sd * d * .5, -d * .34, d * .14, d * .3, 8, sd * .12, seed + 2 + i), { fill: ec, line: ink, seed: seed + 2 + i, ...o, tone: .8 }));
  else if (ear === 'pointy') [-1, 1].forEach((sd, i) => blob(g, [[sd * d * .18, -d * .78], [sd * d * .36, -d * 1.22], [sd * d * .52, -d * .66]], { fill, line: ink, seed: seed + 2 + i, ...o, tone: .8 }));
  else if (ear === 'pom') [-1, 1].forEach((sd, i) => blob(g, ellipse(sd * d * .5, -d * .46, d * .2, d * .2, 9, 0, seed + 2 + i), { fill, shade, line: ink, seed: seed + 2 + i, ...o, tone: .8, sh: .3 }));
  else if (ear === 'fold') [-1, 1].forEach((sd, i) => blob(g, ellipse(sd * d * .44, -d * .62, d * .15, d * .2, 8, sd * .5, seed + 2 + i), { fill: ec, line: ink, seed: seed + 2 + i, ...o, tone: .8 }));
  else [-1, 1].forEach((sd, i) => blob(g, [[sd * d * .3, -d * .74], [sd * d * .52, -d * .92], [sd * d * .52, -d * .6]], { fill: ec, line: ink, seed: seed + 2 + i, ...o, tone: .8 }));
  blob(g, ellipse(0, -d * .42, d * .5, d * .47, 11, 0, seed + 5), { fill, shade, line: ink, seed: seed + 5, ...o, tone: .8, sh: .28 });
  if (breed === 'dalmatian') [[-.18, -.5, .07], [.2, -.3, .06], [.05, -.66, .05]].forEach(([dx, dy, r], i) => dot(g, dx * d, dy * d, r * d, { col: ink, seed: seed + 8 + i, t }));
  g.restore();
}
// The rows of the crowd in wide-view coordinates: [chin y, head diameter], far to near.
const ROWS = [[1052, 52], [1098, 62], [1150, 74], [1212, 88], [1284, 104], [1370, 124], [1470, 146]];
const AISLE = { y0: 1000, hw0: 20, k: .3, cx: 540 };
export const aisleHalf = y => AISLE.hw0 + Math.max(0, y - AISLE.y0) * AISLE.k;
export const CLAWD_SEAT = { row: 4, x: 352 };
export const CROWD = [];
ROWS.forEach(([y, d], j) => {
  const step = d * .94;
  let x = -24 + hash(j, 1) * step, i = 0;
  while (x < W + 30) {
    const seed = j * 100 + i;
    const yy = y + (i % 2 ? d * .05 : -d * .04) + (hash(seed, 3) - .5) * d * .04;
    const dd = d * (.94 + hash(seed, 4) * .12);
    const clawdHere = j === CLAWD_SEAT.row && Math.abs(x - CLAWD_SEAT.x) < step * .55;
    if (clawdHere) CROWD.push({ j, i, x: CLAWD_SEAT.x, y: yy, d: dd, clawd: true, seed, popT: 166.28 + j * .085 + hash(seed, 1) * .12, turnT: 169.4 + (ROWS.length - 1 - j) * .125 + hash(seed, 2) * .12 });
    else if (Math.abs(x - AISLE.cx) > aisleHalf(y) + d * .42) CROWD.push({ j, i, x: x + (hash(seed, 5) - .5) * step * .16, y: yy, d: dd, breed: BREEDS[Math.floor(hash(seed, 6) * BREEDS.length)], col: ROSETTES[Math.floor(hash(seed, 7) * 12)], seed, popT: 166.28 + j * .085 + hash(seed, 1) * .12, turnT: 169.4 + (ROWS.length - 1 - j) * .125 + hash(seed, 2) * .12 });
    x += step; i++;
  }
});
// Clawd from behind, one of the crowd: a terracotta loaf with four feet, a tuft, and an arm up.
export function clawdBack(g, t, x, y, s, o = {}) {
  const { seed = 1, arm = 0 } = o;
  g.save(); g.translate(x, y); g.scale(s, s);
  [-114, -40, 44, 116].forEach((lx, i) => blob(g, capsule([lx, -80], [lx + (i < 2 ? -6 : 6), -10], 21, 22, 5, seed + i), { fill: '#d4643a', shade: '#a2452a', line: ink, lw: 6, seed: seed + i, t, hw: 5, tone: .8, sh: .4 }));
  [-1, 1].forEach((sd, i) => blob(g, capsule([sd * 142, -150], [sd * (176 + arm * 12), -150 - 60 - arm * 40], 21, 22, 5, seed + 9 + i), { fill: '#d4643a', shade: '#a2452a', line: ink, lw: 6, seed: seed + 9 + i, t, hw: 5, tone: .8, sh: .3 }));
  blob(g, rrect(0, -148, 320, 206, 46, 3, seed + 20), { fill: '#d4643a', shade: '#a2452a', line: ink, lw: 7, seed: seed + 20, t, hw: 5.4, tone: .8, sh: .36 });
  line(g, [[-22, -252], [-30, -286]], { w: 9, col: '#a2452a', seed: seed + 30, t, spline: false, passes: 1, over: 0, bow: 0, taper: [.05, .8] });
  line(g, [[6, -252], [10, -294]], { w: 9, col: '#a2452a', seed: seed + 31, t, spline: false, passes: 1, over: 0, bow: 0, taper: [.05, .8] });
  g.restore();
}
// One dog of the crowd at time t: nothing before it pops up; from behind until its turn; then front-on.
function crowdDog(g, t, D, gr, sw) {
  const pk = t < D.popT ? 0 : backOut(inv(D.popT, D.popT + .3, t), 2.4);
  if (pk <= .01) return;
  const u = clamp((t - D.turnT) / .22);
  const bp = beatPulse(t - D.j * .03, .17), calm = t > 172.5 ? .3 : 1;
  const lift = bp * D.d * .07 * calm * (u > 0 ? .7 : 1);
  const tilt = Math.sin(t * 2.3 + D.seed) * .035 * (t > 173 ? 1.4 : 1) + sw * .02;
  g.save(); g.translate(D.x, D.y - lift); g.scale(pk, pk);
  if (u > 0 && u < 1) { g.scale(u < .5 ? Math.cos(u * Math.PI) : Math.sin((u - .5) * Math.PI), 1 + Math.sin(u * Math.PI) * .1); }
  g.translate(-D.x, -D.y + lift);
  const y = D.y - lift;
  if (D.clawd) {
    if (u < .5) clawdBack(g, t, D.x, y + D.d * .3, D.d / 250, { seed: 1, arm: bp });
  } else if (u < .5) backDog(g, t, D.x, y, D.d, D.seed, D.breed, D.col, tilt);
  else {
    const since = t - D.turnT - .11;
    const vox = loud('vocals', t);
    const sing_ = t > 171.4;
    dogFront(g, { x: D.x, y, s: D.d / 150, t, seed: D.seed, breed: D.breed, eyes: since < .35 ? 'wide' : blink(t, D.seed) > .5 ? 'shut' : (D.seed % 3 === 1 ? 'happy' : 'dot'), mouth: sing_ ? clamp(vox * 1.5 - .1 + (D.seed % 2) * .1) : (since < .35 ? .3 : 0), tongue: false, collar: D.col, tilt });
  }
  g.restore();
}
// The whole crowd, far rows first; Clawd, once he steps out, is drawn among them by how far forward he stands.
export function crowdWS(g, t, gr, clawdY = 0, drawClawd = null) {
  const sw = sway(t);
  let cj = -1;
  for (let j = 0; j < ROWS.length; j++) {
    if (drawClawd && cj < 0 && ROWS[j][0] + 8 > clawdY) { drawClawd(); cj = j; }
    CROWD.forEach(D => { if (D.j === j && !(D.clawd && drawClawd)) crowdDog(g, t, D, gr, sw); });
  }
  if (drawClawd && cj < 0) drawClawd();
}
// The red carpet down the middle of the crowd, unrolling from the stage towards you.
export function aisle(g, t, prog) {
  if (prog <= 0) return;
  const y1 = lerp(AISLE.y0, 1990, prog);
  const hw = y => aisleHalf(y);
  const poly = [[AISLE.cx - hw(AISLE.y0), AISLE.y0], [AISLE.cx + hw(AISLE.y0), AISLE.y0], [AISLE.cx + hw(y1), y1], [AISLE.cx - hw(y1), y1]];
  blob(g, poly, { fill: '#cf3a35', shade: '#8f2226', line: ink, lw: 4, seed: 4200, t, hw: 6, gap: 8, tone: .8, sh: .2 });
  if (prog < .99) { blob(g, rrect(AISLE.cx, y1 + 4, hw(y1) * 2 + 24, 30, 14, 3, 4230), { fill: '#a8282c', shade: '#6e1a1e', line: ink, lw: 4.4, seed: 4230, t, hw: 5, tone: .85, sh: .3 }); line(g, [[AISLE.cx - hw(y1) - 4, y1 + 4], [AISLE.cx + hw(y1) + 4, y1 + 6]], { w: 5, col: '#f4d778', seed: 4231, t, spline: false, passes: 1, over: 0, bow: 0, alpha: .8 }); }
  [-1, 1].forEach((sd, i) => line(g, [[AISLE.cx + sd * (hw(AISLE.y0) - 6), AISLE.y0], [AISLE.cx + sd * (hw(y1) - 8), y1]], { w: 9, col: '#e6b73a', seed: 4210 + i, t, spline: false, passes: 1, over: 0, bow: 0, tooth: .5 }));
  for (let n = 0, y = AISLE.y0 + 30; y < y1 - 10; n++, y += 30 + n * 12) line(g, [[AISLE.cx - hw(y) + 10, y], [AISLE.cx, y + 10], [AISLE.cx + hw(y) - 10, y]], { w: 5, col: '#f4d778', seed: 4220 + n, t, spline: true, passes: 1, over: 0, bow: 0, alpha: .85 });
}
// A pool of warm light on the ground at the foot of the frame: the spot, on you.
export function pool(g, t, k) {
  if (k <= 0) return;
  const cx = 540, cy = 1690, br = 1 + Math.sin(t * 1.3) * .015;
  [[560, 190, .5, 4300], [470, 158, .55, 4310], [370, 124, .6, 4320], [250, 84, .62, 4330]].forEach(([rx, ry, al, sd]) => hatch(g, ellipse(cx, cy, rx * k * br, ry * k * br, 14, 0, sd), { col: '#fff4b0', seed: sd, t, gap: 10, w: 12, alpha: al, spill: 10, angle: -.1, dens: .95 }));
}
// A spotlight from a lamp at the frame's top corner down to a pool at (tx, ty), as parade1's beam but to any height.
export function beamTo(g, t, side, tx, ty, o = {}) {
  const { pow = 1, seed = 1, half = 150 } = o;
  const lx = side < 0 ? 86 : W - 86, ly = 748;
  const poly = [[lx - 18, ly], [lx + 18, ly], [tx + half, ty], [tx - half, ty]];
  hatch(g, poly, { col: '#f7d96a', seed, t, gap: 14, w: 12, alpha: .3 * pow, spill: 7, angle: Math.atan2(ty - ly, tx - lx), dens: .95 });
}
// What Clawd holds out: a red lead from his hand, looped at the handle, hanging down towards you (his local space).
export function leadProp(g, t, hR, o = {}) {
  const { sway_ = 0, swing = 0, prog = 1 } = o;
  const [hx, hy] = hR;
  const Q = ([x, y]) => [hx + (x - hx) * prog, hy + (y - hy) * prog];
  line(g, [[hx + 12, hy + 50], [hx + 26 + swing, hy + 150], [hx + 8 + swing * 1.5, hy + 340], [hx - 30 + sway_, hy + 560]].map(Q), { w: 13, col: '#3f6fd6', seed: 4400, t, spline: true, passes: 1, over: 0, bow: 0, taper: [.05, .05], tooth: .5 });
  const lp = []; for (let i = 0; i <= 16; i++) { const an = i / 16 * TAU; lp.push([hx + 12 + Math.cos(an) * 22, hy + 26 + Math.sin(an) * 28]); }
  line(g, lp, { w: 12, col: '#6f95ec', seed: 4401, t, spline: true, closed: true, passes: 1, over: 0, bow: 0, tooth: .5 });
}
// Hopeful brows on Clawd's face (his own space): the inner ends up. He has none of his own high enough to show.
export function hopeBrows(g, t, k = 1) {
  [-1, 1].forEach((sd, i) => line(g, [[sd * 120, -222], [sd * 92, -231 - 3 * k], [sd * 62, -240 - 9 * k]], { w: 8, col: ink, seed: 4500 + i, t, spline: true, passes: 1, over: 0, bow: 0, taper: [.1, .3] }));
}
