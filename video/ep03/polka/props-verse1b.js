// Props for Verse 1's second half (lines 5-8): the three owners peeking over their giant phones, the
// screens that fail them, a maze, robot speech, the cat, coins, a warning sign, stones, a banner.
// Everything is a handful of pen shapes in its own local space, like the rest of the film.
import { W, H, TAU, clamp, lerp, hash, rng, inv, easeOut, backOut, noise, beatPulse, beatPos, sway } from './kit.js';
import { blob, line, dot, hatch, scrub, spline } from './pencil.js';
import { rrect, ellipse, capsule, scallop, star, roundPoly } from './shapes.js';
import { write, measure, layout } from './hand.js';
import { idle } from './life.js';
import { GRAPHITE, C, CLAWD } from './palette.js';
import { paw } from './props.js';
import { paper } from './paper.js';
import { sky } from './common.js';
import { sun, cloud, tree } from './world.js';
import { RING, RING_MOODS } from './ring.js';
import { beatsIn } from './lyrics.js';

const INK = GRAPHITE;
const CREAM = '#fbf8ef';
const B = (g, pts, o) => blob(g, pts, { line: INK, lw: 5.6, hw: 4.8, tone: .6, ...o });
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));

// The colour of accessibility's rosette. Purple is scalability's, so accessibility gets pink.
export const ACCESS = C.pink;

// ---------------------------------------------------------------- an owner, peeking over a phone
// A head (with hair, ears, face) as `person()` draws one, centred on (x, y), with the extras that make
// these three who they are: headphones, a hearing aid, glasses and a moustache.
//   eyes 'dot' 'wide' 'happy' 'squint' 'shut' 'swirl'      brow  > 0 worried, < 0 cross; browAsym lifts one
//   mouth 'smile' 'o' 'open' 'flat' 'wavy' 'grit' 'tongue'   look [-1..1, -1..1]   tilt radians
export function peeker(g, o = {}) {
  const { x = 540, y = 1000, s = 1, t = 0, seed = 1, skin = '#efc7a0', shade = '#d9a878', hair = { style: 'curls', col: '#2b2a33' },
    eyes = 'dot', brow = 0, browAsym = 0, mouth = 'smile', look = [0, 0], tilt = 0, squash = 0, headphones = false, aid = false, glasses = false,
    moustache = false, cheeks = true, sweat = 0, life = 1, spin = 0 } = o;
  const I = idle(t, seed);
  const sd = seed * 211;
  const hr = 58;
  g.save();
  g.translate(x, y);
  g.rotate(tilt);
  g.scale(s * (1 + squash * .08), s * (1 - squash * .1));
  // Ears.
  [-1, 1].forEach((side, i) => {
    B(g, ellipse(side * (hr + 1), 10, 11, 15, 8, 0, sd + 1 + i), { fill: skin, lw: 4.6, seed: sd + 1 + i, t, hw: 4.4, tone: .6 });
  });
  // The head.
  B(g, ellipse(0, 0, hr, hr * 1.02, 12, 0, sd + 3), { fill: skin, shade, lw: 6, seed: sd + 3, t, hw: 5, tone: .5, sh: .2 });
  // Hair.
  const hc = hair.col;
  if (hair.style === 'curls') {
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI * 1.04 + i / 6 * Math.PI * 1.08;
      B(g, ellipse(Math.cos(a) * hr * 1.03, Math.sin(a) * hr * .98 - 2, 25, 24, 8, 0, sd + 10 + i), { fill: hc, lw: 4.8, seed: sd + 10 + i, t, hw: 4.4, tone: .6 });
    }
  } else if (hair.style === 'bob') {
    B(g, spline([[-hr * 1.1, 34], [-hr * 1.08, -hr * .5], [0, -hr * 1.14], [hr * 1.08, -hr * .5], [hr * 1.1, 34], [hr * .62, -hr * .34], [-hr * .62, -hr * .34]], true, 5), { fill: hc, lw: 5, seed: sd + 10, t, hw: 4.6, tone: .6 });
  } else if (hair.style === 'cap') {
    // Tufts of white hair at the sides, then a flat cap.
    [-1, 1].forEach((side, i) => B(g, ellipse(side * (hr * .96), -6, 15, 20, 7, 0, sd + 10 + i), { fill: '#f3f0e8', shade: '#c9c4b5', lw: 4.4, seed: sd + 10 + i, t, hw: 4.2, tone: .7 }));
    B(g, spline([[-hr * 1.06, -14], [-hr * .96, -hr * .86], [-hr * .3, -hr * 1.16], [hr * .5, -hr * 1.1], [hr * 1.02, -hr * .7], [hr * 1.06, -14], [hr * .3, -hr * .34], [-hr * .5, -hr * .34]], true, 5), { fill: hc, shade: '#3b4a3c', lw: 5.4, seed: sd + 12, t, hw: 4.6, tone: .7, sh: .3 });
    B(g, rrect(hr * .12, -hr * .34, hr * 1.5, 15, 7, 2, sd + 13), { fill: '#3b4a3c', lw: 4.6, seed: sd + 13, t, hw: 4.2, tone: .8 });
    dot(g, hr * .1, -hr * 1.0, 6, { col: '#3b4a3c', seed: sd + 14, t });
  } else if (hair.style === 'bun') {
    B(g, ellipse(0, -hr - 20, 26, 24, 9, 0, sd + 10), { fill: hc, lw: 5, seed: sd + 10, t, hw: 4.6, tone: .6 });
    B(g, spline([[-hr * .98, -6], [-hr * .8, -hr * .9], [0, -hr * 1.12], [hr * .8, -hr * .9], [hr * .98, -6], [hr * .5, -hr * .5], [-hr * .5, -hr * .5]], true, 5), { fill: hc, lw: 5, seed: sd + 11, t, hw: 4.6, tone: .55 });
  } else if (hair.style === 'long') {
    B(g, spline([[-hr - 14, -20], [-hr - 24, 96], [0, 66], [hr + 24, 96], [hr + 14, -20]], true, 6), { fill: hc, lw: 5, seed: sd + 9, t, hw: 4.8, tone: .5 });
    B(g, ellipse(0, 0, hr, hr * 1.02, 12, 0, sd + 3), { fill: skin, shade, lw: 6, seed: sd + 3, t, hw: 5, tone: .5, sh: .2 });
    B(g, spline([[-hr * 1.06, 26], [-hr * 1.05, -hr * .5], [0, -hr * 1.12], [hr * 1.05, -hr * .5], [hr * 1.06, 26], [hr * .55, -hr * .34], [-hr * .55, -hr * .34]], true, 5), { fill: hc, lw: 5, seed: sd + 11, t, hw: 4.6, tone: .6 });
  }
  // The face.
  const ex = 20, ey = -2, my = 26;
  const shut = I.blink * life > .5;
  const lk = [look[0] + I.look[0] * .5 * life, look[1] + I.look[1] * .5 * life];
  [-1, 1].forEach((side, i) => {
    const cx = side * ex, cy = ey;
    if (shut && eyes !== 'swirl' && eyes !== 'wide') { line(g, [[cx - 10, cy + 2], [cx, cy + 8], [cx + 10, cy + 2]], { w: 5.6, col: INK, seed: sd + 40 + i, t, spline: true, passes: 1 }); return; }
    if (eyes === 'happy') line(g, [[cx - 11, cy + 4], [cx, cy - 8], [cx + 11, cy + 4]], { w: 6, col: INK, seed: sd + 40 + i, t, spline: true, passes: 1 });
    else if (eyes === 'squint') line(g, [[cx - 11, cy], [cx + 11, cy]], { w: 6, col: INK, seed: sd + 40 + i, t, spline: false, passes: 1 });
    else if (eyes === 'shut') line(g, [[cx - 10, cy + 2], [cx, cy + 8], [cx + 10, cy + 2]], { w: 5.6, col: INK, seed: sd + 40 + i, t, spline: true, passes: 1 });
    else if (eyes === 'swirl') {
      const pts = [];
      for (let k = 0; k <= 26; k++) { const a = k / 26 * TAU * 2.1 + spin * (i ? -1 : 1), r = 2 + k / 26 * 14; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
      blob(g, ellipse(cx, cy, 19, 19, 8, 0, sd + 42 + i), { fill: CREAM, line: INK, lw: 4, seed: sd + 42 + i, t, tone: .95 });
      line(g, pts, { w: 4, col: INK, seed: sd + 46 + i, t, spline: true, passes: 1 });
    } else {
      const wide = eyes === 'wide';
      if (wide) blob(g, ellipse(cx, cy, 16, 17, 8, 0, sd + 42 + i), { fill: CREAM, line: INK, lw: 4, seed: sd + 42 + i, t, hw: 4, tone: .95 });
      dot(g, cx + lk[0] * (wide ? 5 : 3), cy + lk[1] * (wide ? 5 : 3), wide ? 7 : 8.6, { col: INK, seed: sd + 44 + i, t });
      if (!wide) dot(g, cx + lk[0] * 3 - 3, cy + lk[1] * 3 - 3.5, 2.6, { col: CREAM, seed: sd + 48 + i, t, alpha: .95 });
    }
  });
  // Brows: worried slopes the inner ends up; one can be lifted.
  if (brow || browAsym) [-1, 1].forEach((side, i) => {
    const b = brow, lift = i === 1 ? browAsym : 0;
    const yy = ey - 20 - Math.abs(brow) * 3 - lift * 9;
    line(g, [[side * ex - 14, yy - b * 5 * side], [side * ex + 12, yy + b * 5 * side + lift * -5]], { w: 5.4, col: INK, seed: sd + 50 + i, t, spline: false, passes: 1 });
  });
  if (glasses) {
    [-1, 1].forEach((side, i) => B(g, ellipse(side * ex, ey, 22, 20, 9, 0, sd + 55 + i), { fill: null, lw: 4.6, seed: sd + 55 + i, t }));
    line(g, [[-ex + 21, ey - 2], [ex - 21, ey - 2]], { w: 4.6, col: INK, seed: sd + 58, t, spline: false, passes: 1 });
  }
  if (moustache) [-1, 1].forEach((side, i) => B(g, ellipse(side * 13, my - 8, 19, 9, 7, side * -.35, sd + 60 + i), { fill: '#f3f0e8', shade: '#c9c4b5', lw: 4.4, seed: sd + 60 + i, t, hw: 4.2, tone: .8 }));
  // The mouth.
  const mo = moustache ? 6 : 0;
  if (mouth === 'o') B(g, ellipse(0, my + 4 + mo, 8, 10, 8, 0, sd + 62), { fill: '#7a2e2a', lw: 4, seed: sd + 62, t, gap: 4, hw: 4, tone: .85 });
  else if (mouth === 'open') { B(g, ellipse(0, my + 5 + mo, 14, 13, 8, 0, sd + 62), { fill: '#7a2e2a', lw: 4.4, seed: sd + 62, t, gap: 4, hw: 4, tone: .85 }); B(g, ellipse(0, my + 12 + mo, 8, 5, 6, 0, sd + 63), { fill: C.pink, line: null, seed: sd + 63, t, gap: 4, hw: 3.6, tone: .8 }); }
  else if (mouth === 'flat') line(g, [[-12, my + 4 + mo], [12, my + 4 + mo]], { w: 5.4, col: INK, seed: sd + 62, t, spline: false, passes: 1 });
  else if (mouth === 'wavy') line(g, [[-17, my + 5 + mo], [-9, my + 1 + mo], [0, my + 7 + mo], [9, my + 2 + mo], [17, my + 6 + mo]], { w: 5.2, col: INK, seed: sd + 62, t, spline: true, passes: 1 });
  else if (mouth === 'grit') { B(g, rrect(0, my + 4 + mo, 30, 15, 6, 2, sd + 62), { fill: CREAM, lw: 4.4, seed: sd + 62, t, hw: 4, tone: .95, dens: .3 }); [-6, 6].forEach((k, i) => line(g, [[k, my - 2 + mo], [k, my + 10 + mo]], { w: 3.6, col: INK, seed: sd + 64 + i, t, spline: false, passes: 1 })); }
  else if (mouth === 'tongue') { line(g, [[-14, my - 1 + mo], [0, my + 7 + mo], [15, my - 2 + mo]], { w: 5.4, col: INK, seed: sd + 62, t, spline: true, passes: 1 }); B(g, ellipse(9, my + 9 + mo, 6, 8, 6, 0, sd + 63), { fill: C.pink, lw: 3.8, seed: sd + 63, t, gap: 4, hw: 3.8, tone: .8 }); }
  else line(g, [[-16, my - 2 + mo], [0, my + 8 + mo], [16, my - 2 + mo]], { w: 5.4, col: INK, seed: sd + 62, t, spline: true, passes: 1 });
  if (cheeks) [-1, 1].forEach((side, i) => hatch(g, ellipse(side * 35, my - 6, 12, 8, 6, 0, sd + 65 + i), { col: C.pink, seed: sd + 65 + i, t, gap: 4.4, w: 3.6, alpha: .8, spill: 2 }));
  // Headphones over the hair.
  if (headphones) {
    line(g, [[-hr * 1.18, 10], [-hr * 1.22, -hr * .5], [-hr * .7, -hr * 1.24], [0, -hr * 1.42], [hr * .7, -hr * 1.24], [hr * 1.22, -hr * .5], [hr * 1.18, 10]], { w: 15, col: '#3a3947', seed: sd + 70, t, spline: true, passes: 1, taper: [.02, .02], tooth: .8, wob: 1 });
    [-1, 1].forEach((side, i) => B(g, rrect(side * hr * 1.2, 12, 32, 56, 13, 3, sd + 71 + i), { fill: C.yellow, shade: C.orange, lw: 5, seed: sd + 71 + i, t, hw: 4.6, tone: .8, sh: .3 }));
  }
  // The hearing aid: a beige hook over the top of the ear, with a bud in the ear and a blue light.
  if (aid) {
    line(g, [[hr * .94, -22], [hr * 1.14, -18], [hr * 1.26, 6], [hr * 1.2, 34]], { w: 13, col: '#e2b48a', seed: sd + 74, t, spline: true, passes: 1, taper: [.06, .2], tooth: .7, wob: .8 });
    line(g, [[hr * .94, -22], [hr * 1.14, -18], [hr * 1.26, 6], [hr * 1.2, 34]], { w: 4.4, col: INK, seed: sd + 75, t, spline: true, passes: 1, taper: [.06, .2], alpha: .55 });
    dot(g, hr * 1.2, 30, 8, { col: '#e2b48a', seed: sd + 76, t });
    dot(g, hr * 1.14, -8, 3.6, { col: C.sky, seed: sd + 77, t });
  }
  if (sweat) B(g, [[hr * .78, -hr * .56], [hr * .92, -hr * .22], [hr * .74, -hr * .1], [hr * .62, -hr * .3]], { fill: C.sky, lw: 4, seed: sd + 78, t, hw: 4, tone: .8 });
  g.restore();
}

// Fingers curling over an edge: a mitten with three little creases, hanging down from (x, y).
export function grip(g, x, y, s, t, o = {}) {
  const { skin = '#efc7a0', seed = 1, tilt = 0 } = o;
  g.save(); g.translate(x, y); g.rotate(tilt); g.scale(s, s);
  B(g, ellipse(0, 6, 20, 25, 8, 0, seed), { fill: skin, shade: '#d9a878', lw: 4.8, seed, t, hw: 4.4, tone: .6, sh: .25 });
  [-8, 0, 8].forEach((k, i) => line(g, [[k, 8], [k, 22]], { w: 3.4, col: INK, seed: seed + 5 + i, t, spline: false, passes: 1, alpha: .8 }));
  g.restore();
}

// ---------------------------------------------------------------- the screens
// The app's header, as on line 1's phone: WALKIES in blue and a paw. `r` is the screen's rectangle.
export function appHeader(g, r, t, seed = 1, o = {}) {
  const { col = C.blue } = o;
  write(g, 'WALKIES', r.x + r.w / 2 - 14, r.y + 52, 38, { col, seed, t, align: 'center', track: 3 });
  paw(g, r.x + r.w / 2 + 92, r.y + 30, 30, t, { col: C.brown, seed: seed + 3 });
}

// Small line glyphs for the unlabelled buttons.
function glyph(g, kind, x, y, t, seed) {
  const L = (pts, o = {}) => line(g, pts, { w: 5, col: INK, seed: seed++, t, spline: true, passes: 1, ...o });
  if (kind === 0) paw(g, x, y + 2, 38, t, { col: C.brown, seed });
  else if (kind === 1) { L([[x - 20, y - 14], [x + 20, y - 14], [x + 20, y + 20], [x - 20, y + 20], [x - 20, y - 14]], { spline: false }); L([[x - 20, y - 4], [x + 20, y - 4]], { spline: false }); L([[x - 9, y - 21], [x - 9, y - 10]], { spline: false }); L([[x + 9, y - 21], [x + 9, y - 10]], { spline: false }); }
  else if (kind === 2) { L([[x - 18, y + 14], [x - 14, y - 8], [x, y - 22], [x + 14, y - 8], [x + 18, y + 14], [x - 18, y + 14]]); dot(g, x, y + 22, 4.4, { col: INK, seed, t }); }
  else if (kind === 3) L([[x, y + 20], [x - 22, y - 2], [x - 18, y - 18], [x - 4, y - 16], [x, y - 8], [x + 4, y - 16], [x + 18, y - 18], [x + 22, y - 2], [x, y + 20]]);
  else if (kind === 4) { L([[x - 16, y], [x - 8, y - 14], [x + 8, y - 14], [x + 16, y], [x + 8, y + 14], [x - 8, y + 14], [x - 16, y]]); dot(g, x, y, 5, { col: INK, seed, t }); }
  else { L([[x - 18, y - 6], [x - 8, y - 20], [x + 8, y - 20], [x + 18, y - 6], [x + 14, y + 16], [x - 14, y + 16], [x - 18, y - 6]]); dot(g, x - 6, y - 2, 3.4, { col: INK, seed, t }); dot(g, x + 6, y - 2, 3.4, { col: INK, seed: seed + 1, t }); }
}
const BTN = ['#cfe6fb', '#fbd3df', '#fbe9b0', '#d9efb8', '#dcd0f3', '#fbd9b8'];

// Screen A: a grid of six buttons with pictures and no words; `focus` is the one being read out.
export function buttonsScreen(g, r, t, o = {}) {
  const { seed = 1, focus = -1, header = true, hop = 0 } = o;
  const K = r.h / 404;
  if (header) appHeader(g, r, t, seed);
  for (let i = 0; i < 6; i++) {
    const c = i % 2, rw = Math.floor(i / 2);
    const bx = r.x + r.w / 2 + (c ? 62 : -62), by = r.y + (128 + rw * 106) * K;
    blob(g, rrect(bx, by, 96, 80, 20, 3, seed + 10 + i), { fill: BTN[i], line: INK, lw: 4.6, seed: seed + 10 + i, t, hw: 4.4, tone: .8, dens: .7 });
    glyph(g, i, bx, by, t, seed + 30 + i * 4);
    // Where its label should be: a dashed nothing.
    for (let k = 0; k < 3; k++) line(g, [[bx - 30 + k * 22, by + 52 * K], [bx - 18 + k * 22, by + 52 * K]], { w: 3.6, col: C.grey, seed: seed + 60 + i * 3 + k, t, spline: false, passes: 1, alpha: .7 });
  }
  if (focus >= 0) {
    const c = focus % 2, rw = Math.floor(focus / 2);
    const bx = r.x + r.w / 2 + (c ? 62 : -62), by = r.y + (128 + rw * 106) * K - hop;
    blob(g, rrect(bx, by, 108, 92, 24, 3, seed + 90), { fill: null, line: C.orange, lw: 9, seed: seed + 90, t });
  }
}

// Screen B: a video of a barking dog, its captions bar empty.
export function videoScreen(g, r, t, o = {}) {
  const { seed = 1, bark = 0, header = true } = o;
  const K = r.h / 404;
  if (header) appHeader(g, r, t, seed);
  const cx = r.x + r.w / 2, vy = r.y + 170 * K;
  blob(g, rrect(cx, vy, 216, 150, 16, 3, seed + 1), { fill: '#bfe3f7', line: INK, lw: 4.6, seed: seed + 1, t, hw: 4.4, tone: .8, dens: .6 });
  blob(g, [[cx - 108, vy + 46], [cx - 60, vy + 26], [cx + 10, vy + 40], [cx + 70, vy + 24], [cx + 108, vy + 40], [cx + 108, vy + 75], [cx - 108, vy + 75]], { fill: '#a6cf45', line: null, seed: seed + 2, t, hw: 4.4, tone: .8, dens: .7 });
  miniDog(g, cx - 14, vy + 22, .78, t, { seed: seed + 3, bark });
  // The picture is playing: a red progress bar.
  line(g, [[cx - 100, vy + 66], [cx + 100, vy + 66]], { w: 5, col: CREAM, seed: seed + 5, t, spline: false, passes: 1, alpha: .9 });
  line(g, [[cx - 100, vy + 66], [cx - 100 + 70 + (o.prog || 0) * 60, vy + 66]], { w: 5, col: C.red, seed: seed + 6, t, spline: false, passes: 1 });
  // The captions bar: black, and empty. A CC badge with a red slash through it.
  const cy = r.y + 282 * K;
  blob(g, rrect(cx, cy, 216, 50, 12, 3, seed + 7), { fill: '#2b2a33', line: INK, lw: 4.6, seed: seed + 7, t, hw: 4.6, tone: .95, dens: .9 });
  blob(g, rrect(cx - 82, cy, 40, 28, 8, 2, seed + 8), { fill: null, line: CREAM, lw: 3.6, seed: seed + 8, t });
  write(g, 'CC', cx - 82, cy + 10, 20, { col: CREAM, seed: seed + 9, t, align: 'center', track: 2 });
  line(g, [[cx - 100, cy + 18], [cx - 64, cy - 18]], { w: 6, col: C.red, seed: seed + 10, t, spline: false, passes: 1 });
  // Lines of small print underneath.
  [0, 1].forEach(k => line(g, [[cx - 100, r.y + 330 * K + k * 22], [cx + 100 - k * 60, r.y + 330 * K + k * 22]], { w: 5, col: C.grey, seed: seed + 12 + k, t, spline: false, passes: 1, alpha: .7 }));
}

// Screen C: an empty page with a tiny target (a tick box) that a shaky hand keeps missing.
export function targetScreen(g, r, t, o = {}) {
  const { seed = 1, header = true, marks = [], glow = 0 } = o;
  const K = r.h / 404;
  if (header) appHeader(g, r, t, seed);
  [[0, 210], [1, 150], [2, 180]].forEach(([k, w]) => line(g, [[r.x + 24, r.y + (118 + k * 26) * K], [r.x + 24 + w, r.y + (118 + k * 26) * K]], { w: 5, col: C.grey, seed: seed + k, t, spline: false, passes: 1, alpha: .7 }));
  blob(g, rrect(r.x + r.w / 2, r.y + 262 * K, r.w - 34, 92 * K, 16, 3, seed + 5), { fill: '#eaf4ff', line: INK, lw: 4.4, seed: seed + 5, t, hw: 4.4, tone: .8, dens: .5 });
  line(g, [[r.x + 34, r.y + 240 * K], [r.x + 130, r.y + 240 * K]], { w: 5, col: C.grey, seed: seed + 6, t, spline: false, passes: 1, alpha: .7 });
  line(g, [[r.x + 34, r.y + 270 * K], [r.x + 100, r.y + 270 * K]], { w: 5, col: C.grey, seed: seed + 7, t, spline: false, passes: 1, alpha: .7 });
  const T = o.target || [r.x + r.w - 46, r.y + 262 * K];
  // The target: tiny, in green, with a ring that pulses to say "here, here".
  blob(g, rrect(T[0], T[1], 24, 24, 5, 2, seed + 8), { fill: C.green, line: INK, lw: 3.6, seed: seed + 8, t, hw: 4, tone: .9 });
  tick(g, T[0], T[1], 20, t, { col: CREAM, seed: seed + 9, w: 4 });
  if (glow > 0) blob(g, ellipse(T[0], T[1], 25 + glow * 8, 25 + glow * 8, 8, 0, seed + 10), { fill: null, line: C.red, lw: 3.6, seed: seed + 10, t });
  // Where the finger has landed instead.
  marks.forEach(([mx, my, k], i) => {
    if (k <= 0) return;
    const a = 9 * k;
    line(g, [[mx - a, my - a], [mx + a, my + a]], { w: 5, col: C.red, seed: seed + 20 + i * 2, t, spline: false, passes: 1, alpha: .9 });
    line(g, [[mx + a, my - a], [mx - a, my + a]], { w: 5, col: C.red, seed: seed + 21 + i * 2, t, spline: false, passes: 1, alpha: .9 });
  });
}

// A tick box tick, small.
function tick(g, x, y, s, t, o = {}) {
  const { col = C.green, seed = 1, w = 8 } = o;
  line(g, [[x - s * .5, y + s * .05], [x - s * .12, y + s * .4], [x + s * .5, y - s * .45]], { w, col, seed, t, spline: false, passes: 1, taper: [.05, .05] });
}

// A little dog's head, front on, for a video: floppy ears, a muzzle, a mouth that opens when it barks.
export function miniDog(g, x, y, s, t, o = {}) {
  const { seed = 1, bark = 0, fill = '#e2b04a', shade = '#b07f22' } = o;
  g.save(); g.translate(x, y); g.scale(s, s);
  [-1, 1].forEach((side, i) => B(g, spline([[side * 34, -44], [side * 62, -30], [side * 66, 24], [side * 44, 20], [side * 32, -20]], true, 5), { fill: shade, lw: 5, seed: seed + i, t, hw: 4.4, tone: .7 }));
  B(g, ellipse(0, 0, 54, 50, 10, 0, seed + 3), { fill, shade, lw: 5.6, seed: seed + 3, t, hw: 4.8, tone: .5, sh: .25 });
  B(g, rrect(0, 20, 56, 38, 18, 3, seed + 4), { fill: '#f6dfa4', lw: 4.6, seed: seed + 4, t, hw: 4.4, tone: .6 });
  B(g, ellipse(0, 6, 15, 11, 7, 0, seed + 5), { fill: INK, line: null, seed: seed + 5, t, gap: 3.2, hw: 4.4, tone: .95 });
  [-1, 1].forEach((side, i) => dot(g, side * 22, -14, 7.4, { col: INK, seed: seed + 6 + i, t }));
  if (bark > .15) {
    const mh = 8 + bark * 26;
    B(g, ellipse(0, 30 + mh * .3, 17, 5 + mh * .5, 7, 0, seed + 8), { fill: '#7a2e2a', lw: 4, seed: seed + 8, t, gap: 4, hw: 4, tone: .9 });
    if (bark > .5) B(g, ellipse(0, 30 + mh * .7, 9, 5, 6, 0, seed + 9), { fill: C.pink, line: null, seed: seed + 9, t, gap: 4, hw: 3.6, tone: .8 });
  } else line(g, [[-12, 30], [0, 36], [12, 30]], { w: 4.6, col: INK, seed: seed + 8, t, spline: true, passes: 1 });
  g.restore();
}

// Sound as curved lines, going out from (x, y) to the right; k 0..1 is how far out the newest has got.
export function waves(g, x, y, t, o = {}) {
  const { seed = 1, k = 1, col = '#6d6b76', n = 3, r0 = 30, gap = 26, dir = 1, w = 7, spread = .8 } = o;
  for (let i = 0; i < n; i++) {
    const u = cl(k * (n + .6) - i * .55 * 1, 0, 1) * (1 - i * .06);
    if (u <= 0.02) continue;
    const r = r0 + i * gap + k * 8;
    const a0 = -spread, a1 = spread;
    const pts = [];
    for (let j = 0; j <= 8; j++) { const a = lerp(a0, a1, j / 8); pts.push([x + dir * Math.cos(a) * r, y + Math.sin(a) * r]); }
    line(g, pts, { w, col, seed: seed + i, t, spline: true, passes: 1, alpha: .85 * (1 - cl((k - .55) / .45)), taper: [.2, .2] });
  }
}

// ---------------------------------------------------------------- robot speech
// A speech bubble in a machine's voice: a squarer bubble, flat even capitals.
export function robotBubble(g, x, y, w, h, tx, ty, t, o = {}) {
  const { seed = 1, text = 'BUTTON.', fill = '#dbe8f6', col = '#25397c', size = 44, prog = 1 } = o;
  const body = rrect(x, y, w, h, 14, 3, seed);
  const dx = clamp(tx - x, -w / 2 + 24, w / 2 - 24), by = y + h / 2;
  blob(g, [[x + dx - 18, by - 4], [tx, ty], [x + dx + 20, by - 4]], { fill, line: INK, lw: 5, seed: seed + 3, t, tone: .9, dens: .5 });
  blob(g, body, { fill, line: INK, lw: 5, seed, t, tone: .9, dens: .4 });
  line(g, [[x + dx - 14, by - 2], [x + dx + 16, by - 2]], { w: 9, col: fill, seed: seed + 8, t, spline: false, passes: 1, alpha: 1, tooth: 1 });
  write(g, text, x, y + size / 2, size, { col, seed: seed + 9, t, align: 'center', track: 9, wonk: 0, w: .085, prog });
}

// ---------------------------------------------------------------- a maze
// A maze of walls, the same one wherever it is drawn (a fixed seed), that draws itself: `prog` 0..1.
// The walls are merged into runs along grid lines, drawn one stroke each, sweeping out from the corner.
const MAZE = {};
function mazeRuns(cols, rows, sd) {
  const key = cols + 'x' + rows + ':' + sd;
  if (MAZE[key]) return MAZE[key];
  const rand = rng(sd * 977 + 13);
  // Cells and their open passages, made by a random walk that backtracks.
  const openR = Array.from({ length: rows }, () => Array(cols).fill(false));     // passage to the right
  const openD = Array.from({ length: rows }, () => Array(cols).fill(false));     // passage downward
  const seen = Array.from({ length: rows }, () => Array(cols).fill(false));
  const stack = [[0, 0]]; seen[0][0] = true;
  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const nb = [[r, c + 1, 'R'], [r + 1, c, 'D'], [r, c - 1, 'L'], [r - 1, c, 'U']].filter(([rr, cc]) => rr >= 0 && rr < rows && cc >= 0 && cc < cols && !seen[rr][cc]);
    if (!nb.length) { stack.pop(); continue; }
    const [rr, cc, d] = nb[Math.floor(rand() * nb.length)];
    if (d === 'R') openR[r][c] = true; else if (d === 'D') openD[r][c] = true; else if (d === 'L') openR[rr][cc] = true; else openD[rr][cc] = true;
    seen[rr][cc] = true; stack.push([rr, cc]);
  }
  const runs = [];
  // Horizontal grid lines y = 0..rows: a wall wherever there is no passage between the cell above and below.
  for (let y = 0; y <= rows; y++) {
    let x0 = -1;
    for (let c = 0; c <= cols; c++) {
      const wall = c < cols && (y === 0 ? !(c === 0) : y === rows ? !(c === cols - 1) : !openD[y - 1][c]);
      if (wall && x0 < 0) x0 = c;
      if (!wall && x0 >= 0) { runs.push({ x0, y0: y, x1: c, y1: y }); x0 = -1; }
    }
  }
  for (let x = 0; x <= cols; x++) {
    let y0 = -1;
    for (let r = 0; r <= rows; r++) {
      const wall = r < rows && (x === 0 || x === cols ? true : !openR[r][x - 1]);
      if (wall && y0 < 0) y0 = r;
      if (!wall && y0 >= 0) { runs.push({ x0: x, y0, x1: x, y1: r }); y0 = -1; }
    }
  }
  runs.forEach(r => { r.d = (r.x0 + r.x1) / 2 + (r.y0 + r.y1) / 2; });
  const dmax = Math.max(...runs.map(r => r.d));
  runs.forEach(r => { r.d /= dmax; });
  MAZE[key] = runs;
  return runs;
}
// Draw the maze in the box (x, y, w, h).
export function maze(g, x, y, w, h, t, o = {}) {
  const { seed = 1, prog = 1, cols = 5, rows = 7, col = INK, lw = 6.4, sd = 4 } = o;
  const runs = mazeRuns(cols, rows, sd);
  const cw = w / cols, ch = h / rows;
  runs.forEach((r, i) => {
    const p = cl((prog * 1.7 - r.d * .7) / .3 * 1.0, 0, 1);
    if (p <= 0) return;
    line(g, [[x + r.x0 * cw, y + r.y0 * ch], [x + r.x1 * cw, y + r.y1 * ch]], { w: lw, col, seed: seed + i, t, from: 0, to: p, spline: false, passes: 1, taper: [.02, .02], wob: 1.2 });
  });
}

// ---------------------------------------------------------------- the cat
// A cat's head, as a child draws one: a round face, two pointed ears, big eyes, whiskers.
//   eyes 'open' 'half' (unimpressed) 'happy' 'shut'      mouth 0..1     origin: the middle of the face
export function catHead(g, x, y, s, t, o = {}) {
  const { seed = 1, fill = '#f2a65a', shade = '#c9772f', eyes = 'open', mouth = 0, look = [0, 0], whisk = 0 } = o;
  g.save(); g.translate(x, y); g.scale(s, s);
  [-1, 1].forEach((side, i) => {
    B(g, [[side * 48, -18], [side * 56, -74], [side * 14, -44]], { fill, shade, lw: 5.4, seed: seed + i, t, hw: 4.6, tone: .6 });
    B(g, [[side * 40, -28], [side * 46, -60], [side * 22, -42]], { fill: C.pink, line: null, seed: seed + 3 + i, t, hw: 4, tone: .8, dens: .6 });
  });
  B(g, ellipse(0, 0, 58, 49, 10, 0, seed + 5), { fill, shade, lw: 5.8, seed: seed + 5, t, hw: 4.8, tone: .5, sh: .25 });
  [-15, 0, 15].forEach((k, i) => line(g, [[k, -47], [k * .75, -32]], { w: 4.6, col: shade, seed: seed + 8 + i, t, spline: false, passes: 1, taper: [.1, .5], alpha: .9 }));
  [-1, 1].forEach((side, i) => {
    const cx = side * 22, cy = -6;
    if (eyes === 'happy') line(g, [[cx - 11, cy + 4], [cx, cy - 8], [cx + 11, cy + 4]], { w: 6, col: INK, seed: seed + 12 + i, t, spline: true, passes: 1 });
    else if (eyes === 'shut') line(g, [[cx - 11, cy], [cx, cy + 6], [cx + 11, cy]], { w: 5.6, col: INK, seed: seed + 12 + i, t, spline: true, passes: 1 });
    else {
      B(g, ellipse(cx, cy, 12.5, 14.5, 8, 0, seed + 14 + i), { fill: '#b9dd6a', lw: 4.4, seed: seed + 14 + i, t, hw: 4, tone: .9 });
      dot(g, cx + look[0] * 3, cy + look[1] * 2, 7, { col: INK, seed: seed + 16 + i, t });
      if (eyes === 'half') { B(g, [[cx - 15, cy - 18], [cx + 15, cy - 18], [cx + 15, cy - 2], [cx - 15, cy - 2]], { fill, line: null, seed: seed + 18 + i, t, hw: 4, tone: 1, dens: 1 }); line(g, [[cx - 14, cy - 2], [cx + 14, cy - 3]], { w: 5.4, col: INK, seed: seed + 20 + i, t, spline: false, passes: 1 }); }
      else dot(g, cx - 3, cy - 5, 2.6, { col: CREAM, seed: seed + 22 + i, t });
    }
  });
  B(g, [[-7, 7], [7, 7], [0, 15]], { fill: '#e58aa0', lw: 3.6, seed: seed + 24, t, hw: 3.6, tone: .9 });
  if (mouth > .25) B(g, ellipse(0, 24, 10, 6 + mouth * 8, 6, 0, seed + 25), { fill: '#7a2e2a', lw: 3.6, seed: seed + 25, t, gap: 4, hw: 3.6, tone: .9 });
  else line(g, [[-14, 20], [-7, 26], [0, 19], [7, 26], [14, 20]], { w: 4.6, col: INK, seed: seed + 25, t, spline: true, passes: 1 });
  [-1, 1].forEach((side, i) => [0, 1, 2].forEach(k => line(g, [[side * 30, 12 + k * 6], [side * (68 + whisk * 4), 2 + k * 15 + whisk * (k - 1) * 4]], { w: 3.2, col: INK, seed: seed + 30 + i * 3 + k, t, spline: false, passes: 1, alpha: .8, taper: [.05, .5] })));
  g.restore();
}
// A sitting cat: a round loaf of a body, front paws, a tail that swishes, and the head. Origin at its feet.
export function cat(g, x, y, s, t, o = {}) {
  const { seed = 1, fill = '#f2a65a', shade = '#c9772f', tailPh = 0, eyes = 'open', mouth = 0, look = [0, 0], flip = 1, bob = 0 } = o;
  g.save(); g.translate(x, y - bob); g.scale(s * flip, s);
  const sw = Math.sin(tailPh * TAU) * 16;
  const tl = [[38, -22], [80, -26], [98 + sw, -68], [78 + sw * 1.3, -108]];
  line(g, tl, { w: 22, col: fill, seed: seed + 1, t, spline: true, passes: 1, taper: [.02, .5], tooth: .55 });
  line(g, tl, { w: 5.6, col: INK, seed: seed + 2, t, spline: true, passes: 1, taper: [.02, .5], alpha: .7 });
  line(g, [tl[2], tl[3]], { w: 22, col: shade, seed: seed + 3, t, spline: false, passes: 1, taper: [.02, .5], tooth: .55, alpha: .8 });
  B(g, ellipse(0, -46, 52, 46, 10, 0, seed + 4), { fill, shade, lw: 6.4, seed: seed + 4, t, hw: 5, tone: .5, sh: .3 });
  [-1, 1].forEach((side, i) => B(g, ellipse(side * 24, -8, 18, 11, 8, 0, seed + 5 + i), { fill: '#f7d8ac', lw: 5, seed: seed + 5 + i, t, hw: 4.4, tone: .6 }));
  catHead(g, 0, -106, .78, t, { seed: seed + 10, fill, shade, eyes, mouth, look });
  g.restore();
}
// Shape-sorter holes for the booking form: a dog (side on) and a cat's head (front on).
const DOGSIL = [[98, -14], [86, -30], [64, -46], [54, -62], [44, -40], [30, -30], [-10, -30], [-44, -30], [-72, -26], [-86, -52], [-98, -64], [-102, -46], [-90, -16], [-82, 2], [-86, 38], [-64, 38], [-56, 12], [-30, 14], [18, 14], [28, 38], [48, 38], [52, 8], [64, 4], [84, 8], [98, -2]];
const CATSIL = [[-46, -8], [-54, -66], [-18, -42], [18, -42], [54, -66], [46, -8], [34, 26], [0, 38], [-34, 26]];
export function slot(g, kind, x, y, s, t, o = {}) {
  const { seed = 1, flash = 0, fill = '#3a3947' } = o;
  g.save(); g.translate(x, y); g.scale(s, s);
  if (kind === 'cat') g.scale(1.12, 1.12);
  blob(g, kind === 'dog' ? DOGSIL : CATSIL, { fill: flash > 0 ? '#b03a34' : fill, line: INK, lw: 5.4, seed, t, hw: 4.8, tone: .95, dens: 1 });
  g.restore();
}

// ---------------------------------------------------------------- money
export function coin(g, x, y, r, t, o = {}) {
  const { seed = 1, rot = 0 } = o;
  g.save(); g.translate(x, y); g.rotate(rot);
  B(g, ellipse(0, 0, r, r * .92, 8, 0, seed), { fill: C.yellow, shade: C.orange, lw: 4.2, seed, t, hw: 4, tone: .8, sh: .3 });
  line(g, [[-r * .42, -r * .18], [-r * .1, -r * .46]], { w: 3.4, col: CREAM, seed: seed + 1, t, spline: false, passes: 1, alpha: .9 });
  g.restore();
}
// A sack of coins; tilt it to pour. Origin at its middle.
export function moneyBag(g, x, y, s, t, o = {}) {
  const { seed = 1, tilt = 0 } = o;
  g.save(); g.translate(x, y); g.rotate(tilt); g.scale(s, s);
  B(g, [[-30, -60], [-50, -22], [-46, 24], [0, 40], [46, 24], [50, -22], [30, -60], [10, -66], [-10, -66]], { fill: '#d6b482', shade: '#9c6a3d', lw: 6, seed, t, hw: 5, tone: .6, sh: .3 });
  B(g, [[-20, -70], [-34, -96], [-8, -80], [0, -100], [8, -80], [34, -96], [20, -70]], { fill: '#d6b482', shade: '#9c6a3d', lw: 5, seed: seed + 1, t, hw: 4.6, tone: .6 });
  line(g, [[-30, -64], [0, -58], [30, -64]], { w: 9, col: C.red, seed: seed + 2, t, spline: true, passes: 1 });
  B(g, ellipse(0, -8, 20, 19, 8, 0, seed + 3), { fill: C.yellow, lw: 4.4, seed: seed + 3, t, hw: 4, tone: .9 });
  g.restore();
}
// A bill: a sheet with BILL on it in red and a total that hurts.
export function bill(g, x, y, s, t, o = {}) {
  const { seed = 1, rot = 0 } = o;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  B(g, rrect(0, 0, 150, 190, 10, 3, seed), { fill: CREAM, lw: 5, seed, t, hw: 4.4, tone: .9, dens: .25 });
  write(g, 'BILL', 0, -48, 46, { col: C.red, seed: seed + 1, t, align: 'center', track: 6 });
  [0, 1, 2].forEach(k => line(g, [[-50, -12 + k * 22], [52 - (k === 2 ? 40 : 0), -12 + k * 22]], { w: 4.4, col: C.grey, seed: seed + 2 + k, t, spline: false, passes: 1, alpha: .8 }));
  write(g, '$$$', 0, 76, 36, { col: C.red, seed: seed + 6, t, align: 'center', track: 4 });
  g.restore();
}
// A small display table with a cloth to the floor. (x, y) is the middle of its feet; the top is 210 up.
export function display(g, x, y, w, t, o = {}) {
  const { seed = 1, cloth = C.blue } = o;
  const top = y - 210;
  B(g, [[x - w / 2 + 8, top], [x + w / 2 - 8, top], [x + w / 2 - 2, y - 10], [x + w / 2 - 44, y - 24], [x, y - 8], [x - w / 2 + 44, y - 24], [x - w / 2 + 2, y - 10]], { fill: cloth, shade: '#233b7a', lw: 6, seed, t, hw: 5, tone: .6, sh: .25 });
  for (let i = 0; i < 4; i++) B(g, star(x - w * .3 + i * w * .2, top + 96, 20, 8, 5, -Math.PI / 2 + i * .2, seed + 10 + i), { fill: CREAM, line: null, seed: seed + 2 + i, t, gap: 5, hw: 4.6, tone: .9 });
  B(g, rrect(x, top - 12, w, 30, 9, 2, seed + 30), { fill: '#e2b878', shade: '#a9793a', lw: 6, seed: seed + 30, t, hw: 5, tone: .7, sh: .4 });
}

// ---------------------------------------------------------------- a fluffy tail
// A plume from `base` in direction `ang`, `len` long and up to `w` wide, curling by `bend` radians: a
// bushy tail that widens to a rounded, scalloped tip.
export function plume(g, base, ang, len, w, bend, t, o = {}) {
  const { seed = 1, fill = '#e6e3ee', shade = '#aaa7b8' } = o;
  const N = 12, cl_ = [];
  let x = base[0], y = base[1], a = ang;
  for (let i = 0; i <= N; i++) { cl_.push([x, y, a]); a += bend / N; x += Math.cos(a) * len / N; y += Math.sin(a) * len / N; }
  const L = [], R = [];
  cl_.forEach(([px, py, pa], i) => {
    const u = i / N;
    let ww = w * .5 * (.3 + .7 * Math.sin(Math.min(1, u * 1.05) * Math.PI * .5));
    if (u > .82) ww *= Math.sqrt(Math.max(0, 1 - Math.pow((u - .82) / .18, 2)));
    const bump = i % 2 ? 1.14 : .94;
    L.push([px + Math.cos(pa - Math.PI / 2) * ww * bump, py + Math.sin(pa - Math.PI / 2) * ww * bump]);
    R.push([px + Math.cos(pa + Math.PI / 2) * ww * (i % 2 ? .94 : 1.14), py + Math.sin(pa + Math.PI / 2) * ww * (i % 2 ? .94 : 1.14)]);
  });
  const tip = cl_[N];
  B(g, [...L, [tip[0] + Math.cos(tip[2]) * w * .1, tip[1] + Math.sin(tip[2]) * w * .1], ...R.reverse()], { fill, shade, lw: 6, seed, t, hw: 5, tone: .5, sh: .3, gap: 6.6 });
  cl_.slice(2, -1).forEach(([px, py, pa], i) => line(g, [[px, py], [px + Math.cos(pa + .6) * w * .3, py + Math.sin(pa + .6) * w * .3]], { w: 4, col: '#7d7a90', seed: seed + 20 + i, t, spline: false, passes: 1, alpha: .55, taper: [.1, .7] }));
}

// ---------------------------------------------------------------- a warning sign
// A red triangle with a "!", drawn with the pen, centred on (x, y) with circumradius r.
export function warnTri(g, x, y, r, t, o = {}) {
  const { seed = 1, col = C.red, tilt = 0 } = o;
  g.save(); g.translate(x, y); g.rotate(tilt);
  const P = [[0, -r], [r * .866, r * .5], [-r * .866, r * .5]];
  blob(g, roundPoly(P, [r * .2, r * .2, r * .2], 3), { fill: '#fff1c2', line: col, lw: r * .17, seed, t, hw: 4.6, tone: .9, dens: .3 });
  write(g, '!', 0, r * .36, r * .82, { col, seed: seed + 3, t, align: 'center', w: .16 });
  g.restore();
}

// ---------------------------------------------------------------- a stone
// A grey lump standing on the ground at (x, y); `under` shows its damp underside.
export function stone(g, x, y, s, t, o = {}) {
  const { seed = 1, under = false, fill = '#b9b8c6', shade = '#8d8c99' } = o;
  g.save(); g.translate(x, y); g.scale(s, s);
  const pts = [[-58, 0], [-64, -26], [-44, -56], [-4, -66], [42, -58], [64, -28], [58, 0], [22, 7], [-26, 7]];
  B(g, pts, { fill: under ? '#8d8c99' : fill, shade: under ? '#5b5a66' : shade, lw: 6, seed, t, hw: 5, tone: .6, sh: .35 });
  if (!under) { line(g, [[-10, -58], [4, -42], [-6, -28]], { w: 4, col: INK, seed: seed + 1, t, spline: true, passes: 1, alpha: .6 }); line(g, [[26, -44], [40, -34]], { w: 3.6, col: INK, seed: seed + 2, t, spline: false, passes: 1, alpha: .5 }); }
  else [[[-34, -40], [-16, -30]], [[6, -44], [22, -30]], [[30, -24], [44, -14]]].forEach(([a, b], i) => line(g, [a, b], { w: 4.6, col: '#5b5a66', seed: seed + 3 + i, t, spline: false, passes: 1, alpha: .6 }));
  g.restore();
}
// The dark hollow a stone leaves.
export function hollow(g, x, y, s, t, o = {}) {
  const { seed = 1 } = o;
  B(g, ellipse(x, y - 4 * s, 66 * s, 20 * s, 10, 0, seed), { fill: '#b8945a', line: null, seed, t, hw: 4.6, tone: .8, gap: 5.6 });
}
// A rosette that costs two blobs: for many small ones.
export function rosetteLite(g, x, y, r, col, t, o = {}) {
  const { seed = 1, tilt = 0 } = o;
  g.save(); g.translate(x, y); g.rotate(tilt);
  [-1, 1].forEach((side, i) => line(g, [[side * r * .3, r * .5], [side * r * .8, r * 1.8]], { w: r * .5, col, seed: seed + i, t, spline: false, passes: 1, taper: [.1, .5], tooth: .55 }));
  B(g, scallop(0, 0, r, 12, .12, 0, seed + 3), { fill: col, shade: INK, lw: Math.max(3.6, r * .1), seed: seed + 3, t, hw: 4.4, tone: .6, sh: .3 });
  dot(g, 0, 0, r * .42, { col: C.cream, seed: seed + 4, t });
  g.restore();
}

// ---------------------------------------------------------------- a banner
// A cloth banner hung from (x, y) (its top middle), w wide and h deep, with a wavy foot.
export function banner(g, x, y, w, h, t, o = {}) {
  const { seed = 1, wave = 0 } = o;
  const top = [], bot = [];
  for (let i = 0; i <= 10; i++) {
    const u = i / 10, xx = x - w / 2 + u * w;
    top.push([xx, y + Math.sin(u * Math.PI) * 20]);
    bot.push([xx, y + h + Math.sin(u * Math.PI) * 20 + Math.sin(u * 9 + wave) * 5 * Math.min(1, h / 60)]);
  }
  B(g, [...top, ...bot.reverse()], { fill: '#fff6d8', shade: '#e9d79a', lw: 7, seed, t, hw: 4.8, tone: .8, sh: .3, dens: .5, line: C.red });
  line(g, top, { w: 10, col: '#8b5f2a', seed: seed + 5, t, spline: true, passes: 1 });
}

// ---------------------------------------------------------------- a tail in many colours
// The line's last word as bubble letters, each its own colour, written on and bobbing like sing()'s tail.
const MANY = [['#e8504a', '#7a1f1a'], ['#f5a03a', '#8a4a1d'], ['#f7d24a', '#8a6b12'], ['#6cc27a', '#1f5c2a'], ['#56aee6', '#1f3f8f'], ['#a27be0', '#4a2f8a'], ['#f27eaa', '#8a2f55']];
export function multiTail(g, t, it, wd, o = {}) {
  const { seed = 9, w = .1, track = 4, dance = 9.8 } = o;
  const n = it.str.length, dur = clamp(.07 + .026 * n, .12, .34);
  const v = wd.v, a = v - dur, prog = clamp((t - a) / dur);
  if (prog <= 0) return;
  const bts = beatsIn(wd.s - .06, Math.max(wd.e, wd.s + .3));
  let pulse = 0;
  for (const b of bts) { const dt = t - b.t; if (dt >= -.02 && dt < .5) pulse = Math.max(pulse, Math.exp(-Math.max(0, dt) / .13) * (b.down ? 1 : .6)); }
  const settle = t > v ? backOut(inv(v, v + .16, t), 2.4) : 1;
  const pop_ = 1 + (1 - clamp(settle)) * -.12 + pulse * .05;
  const L = layout(it.str, it.size, { track, seed: seed * 7, wonk: .8 });
  const total = L.letters.reduce((s, l) => s + l.len, 0) || 1;
  const bp = beatPos(t), bpu = beatPulse(t, .16);
  g.save();
  const cx = it.x + it.w / 2, cy = it.y - it.size / 2;
  g.translate(cx, cy - pulse * 9); g.scale(pop_, pop_); g.translate(-cx, -cy);
  let acc = 0;
  L.letters.forEach((l, i) => {
    const a0 = acc / total, a1 = (acc + l.len) / total; acc += l.len;
    const lp = clamp((prog - a0) / (a1 - a0 || 1));
    if (lp <= 0 || l.ch === ' ') return;
    const c = MANY[i % MANY.length];
    write(g, l.ch, it.x + l.x, it.y + l.dy, l.size, { col: c[0], bubble: { fill: c[0], edge: c[1], e: 2.0, f: 1.35 }, seed: seed * 31 + i * 7, t, prog: lp, w, track: 0, dance, beat: bp + i * .08, pulse: bpu, wonk: 0 });
  });
  g.restore();
}

// ---------------------------------------------------------------- the show ring, drawn on as the view widens
// The same drawing as ring.js's ringBackdrop (day), with the rope, the posts and the bunting brought in
// by reveals 0..1 so they can appear as a camera pulls back. At 1, 1, 1 it is that backdrop exactly.
export function ringWorld(g, t, o = {}) {
  const { seed = 21, rope = 1, posts = 1, bunt = 1, sunMood = 'happy', look = [0, .4] } = o;
  const P = RING_MOODS.day, R = RING;
  paper(g, { base: P.paper, vignette: P.vignette });
  sky(g, t, 900, { alpha: P.skyA, col: P.sky, seed });
  sun(g, t, 990, 700, 84, { mood: sunMood, look, seed: seed + 1 });
  cloud(g, t, 190, 720, .9, { seed: seed + 2, drift: 3 });
  scrub(g, [0, 880, W, 1010], { col: P.hedge, seed: seed + 5, t, gap: 24, w: 28, alpha: .35, angle: -.06, wig: 16 });
  [[70, .5], [230, .36], [860, .42], [1010, .34]].forEach(([tx, ts], i) => tree(g, t, tx, 930, ts, { seed: 60 + i, crown: '#8fcf7a', shade: '#5fae5a', far: true }));
  scrub(g, [0, 940, W, H], { col: P.grass, seed: seed + 6, t, gap: 20, w: 28, alpha: .55, angle: -.1, wig: 20 });
  scrub(g, [0, 1000, W, H], { col: P.grass2, seed: seed + 7, t, gap: 36, w: 24, alpha: .35, angle: .16, wig: 18 });
  blob(g, ellipse(R.cx, R.cy, R.rx, R.ry, 18, 0, seed + 8), { fill: P.sawdust, shade: P.sawdust2, line: P.ink, lw: 5.4, seed: seed + 8, t, hw: 5.6, gap: 7, tone: .55, sh: .35 });
  const posts_ = [];
  for (let i = 0; i <= 8; i++) { const a = Math.PI * (1.02 + i / 8 * .96); posts_.push([R.cx + Math.cos(a) * (R.rx + 24), R.cy + Math.sin(a) * (R.ry + 14)]); }
  if (rope > 0) line(g, posts_.map(([x, y]) => [x, y - 96]), { w: 11, col: P.rope, seed: seed + 9, t, spline: true, passes: 1, tooth: .5, to: Math.min(1, rope) });
  posts_.forEach(([x, y], i) => {
    const k = clamp(posts * 9 - i * .9, 0, 1);
    if (k <= 0) return;
    line(g, [[x, y + 8 - (y + 8 - (y - 118)) * k], [x, y + 8]], { w: 15, col: P.post, seed: seed + 20 + i, t, spline: false, passes: 1, flat: true });
    if (k >= 1) dot(g, x, y - 120, 9, { col: '#fbf8ef', seed: seed + 40 + i, t });
  });
  if (bunt > 0) { g.save(); g.globalAlpha *= .6; buntingProg(g, t, 20, 96, W - 20, 96, { n: 13, sag: 40, seed: seed + 60, size: 34, prog: bunt }); g.restore(); }
}
// world.js's bunting, coming in from the left: `prog` 0..1.
function buntingProg(g, t, x0, y0, x1, y1, o = {}) {
  const { n = 8, sag = 60, cols = [C.red, C.yellow, C.blue, C.green, C.orange, C.pink], seed = 2, size = 40, prog = 1 } = o;
  const sw = sway(t) * 4;
  const P = u => [lerp(x0, x1, u), lerp(y0, y1, u) + Math.sin(u * Math.PI) * sag + sw * Math.sin(u * Math.PI)];
  line(g, Array.from({ length: 13 }, (_, i) => P(i / 12)), { w: 5, col: '#8b5f2a', seed, t, passes: 1, to: prog });
  for (let i = 0; i < n; i++) {
    const u = (i + .5) / n;
    if (u > prog) break;
    const k = clamp((prog - u) * n * 1.5 + .1, 0, 1);
    const [px, py] = P(u), [qx, qy] = P(u + .02);
    const ang = Math.atan2(qy - py, qx - px);
    g.save(); g.translate(px, py); g.rotate(ang * .6); g.scale(k, k);
    blob(g, [[-size * .5, 0], [size * .5, 0], [0, size * 1.15]], { fill: cols[i % cols.length], line: INK, lw: 4.6, seed: seed + 5 + i, t, gap: 5.6, hw: 4.8, tone: .7 });
    g.restore();
  }
}
