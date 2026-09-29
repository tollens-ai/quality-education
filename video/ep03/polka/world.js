// The world the dogs live in, drawn the way the rest is: a sun that watches, clouds, trees, flowers, a
// pigeon, butterflies, bunting, a crowd. Each is a small drawn thing that moves a little on its own
// and on the oom-pah, so no picture is ever quite still.
import { W, H, TAU, clamp, lerp, hash, noise, sway, beatPulse, downPulse, beatPos, loud, easeOut } from './kit.js';
import { blob, line, dot, hatch, scrub } from './pencil.js';
import { ellipse, scallop, rrect, capsule, star, rotate } from './shapes.js';
import { paper } from './paper.js';
import { sky, meadow } from './common.js';
import { idle, blink as blinkAt, beatRing, downRing, wordRing } from './life.js';
import { GRAPHITE, C } from './palette.js';

const ink = GRAPHITE;
const SOFT = '#6f7f96';        // the pencil for things far away: a lighter blue-grey

// ---------------------------------------------------------------- the sun
// A sun with a face: a disc, rays that pulse on the oom, eyes that follow the action.
//   mood 'happy' 'worried' 'shades' 'sleepy' 'sweat' 'gasp'     look [-1..1, -1..1]
export function sun(g, t, x, y, r, o = {}) {
  const { mood = 'happy', look = [0, 0], seed = 3, alpha = 1, face = true, rays = 12 } = o;
  const I = idle(t, seed);
  const dp = downPulse(t, .2), bp = beatPulse(t, .16);
  g.save();
  g.globalAlpha *= alpha;
  const R = r * (1 + bp * .03);
  for (let i = 0; i < rays; i++) {
    const a = i / rays * TAU + .2 + Math.sin(t * .6 + i) * .04 + (hash(seed, i) - .5) * .12;
    const l0 = R * 1.14, l1 = R * (1.42 + (i % 2 ? .0 : .16) + dp * .1 + hash(seed, i, 2) * .1);
    line(g, [[x + Math.cos(a) * l0, y + Math.sin(a) * l0], [x + Math.cos(a) * l1, y + Math.sin(a) * l1]], { w: r * .11, col: C.orange, seed: seed * 20 + i, t, spline: false, passes: 1, taper: [.1, .55] });
  }
  blob(g, ellipse(x, y, R, R, 12, 0, seed), { fill: C.yellow, shade: C.orange, line: ink, lw: 6.4, seed, t, hw: 5.4, tone: .55, sh: .3 });
  if (face) {
    const ex = R * .36, ey = y - R * .12, lk = [look[0] + I.look[0], look[1] + I.look[1]];
    const shut = mood === 'sleepy' || I.blink > .5;
    [-1, 1].forEach((sd, i) => {
      const cx = x + sd * ex + lk[0] * 4, cy = ey + lk[1] * 3;
      if (mood === 'shades') return;
      if (shut) line(g, [[cx - R * .12, cy + 2], [cx, cy + R * .07], [cx + R * .12, cy + 2]], { w: 5.4, col: ink, seed: seed + 30 + i, t, passes: 1 });
      else if (mood === 'gasp') { blob(g, ellipse(cx, cy, R * .13, R * .16, 8, 0, seed + i), { fill: '#fbf8ef', line: ink, lw: 4, seed: seed + 40 + i, t, tone: .95 }); dot(g, cx + lk[0] * 3, cy + lk[1] * 3, R * .06, { col: ink, seed: seed + 50 + i, t }); }
      else dot(g, cx, cy, R * .085, { col: ink, seed: seed + 30 + i, t });
    });
    if (mood === 'shades') {
      blob(g, [[x - R * .66, ey - R * .16], [x + R * .66, ey - R * .16], [x + R * .55, ey + R * .26], [x + R * .08, ey + R * .22], [x, ey + R * .04], [x - R * .08, ey + R * .22], [x - R * .55, ey + R * .26]], { fill: ink, line: ink, lw: 4, seed: seed + 60, t, tone: .95, gap: 4, hw: 4.4 });
    }
    const my = y + R * .32;
    if (mood === 'worried' || mood === 'sweat') line(g, [[x - R * .22, my + R * .1], [x, my - R * .02], [x + R * .22, my + R * .1]], { w: 5.6, col: ink, seed: seed + 70, t, passes: 1 });
    else if (mood === 'gasp') blob(g, ellipse(x, my + R * .06, R * .1, R * .13, 8, 0, seed + 71), { fill: '#7a2e2a', line: ink, lw: 4, seed: seed + 71, t, tone: .9 });
    else line(g, [[x - R * .28, my - R * .02], [x - R * .1, my + R * .12], [x + R * .12, my + R * .12], [x + R * .3, my - R * .02]], { w: 5.8, col: ink, seed: seed + 70, t, passes: 1 });
    if (mood === 'worried' || mood === 'sweat') line(g, [[x - R * .58, ey - R * .3], [x - R * .2, ey - R * .22]], { w: 5, col: ink, seed: seed + 72, t, passes: 1, spline: false });
    if (mood === 'sweat') blob(g, [[x + R * .74, y - R * .5], [x + R * .86, y - R * .2], [x + R * .7, y - R * .1], [x + R * .6, y - R * .3]], { fill: C.sky, line: ink, lw: 4, seed: seed + 73, t, tone: .8 });
    hatchCheeks(g, x, y, R, seed, t);
  }
  g.restore();
}
function hatchCheeks(g, x, y, R, seed, t) {
  [-1, 1].forEach((sd, i) => hatch(g, ellipse(x + sd * R * .58, y + R * .2, R * .17, R * .1, 7, 0, seed + 80 + i), { col: C.pink, seed: seed + 80 + i, t, gap: 5, w: 4, alpha: .7, spill: 2 }));
}

// ---------------------------------------------------------------- clouds
// The outline of a cloud: the top of a handful of overlapping circles, standing on a flat, slightly sagging base.
function cloudShape(cx, cy, s, seed) {
  const n = 4 + Math.floor(hash(seed, 1) * 2);
  const base = cy + 34 * s, wTot = 190 * s;
  const C = [];
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1);
    const r = (34 + Math.sin(u * Math.PI) * 40 + hash(seed, 10 + i) * 14) * s;
    C.push({ x: cx - wTot / 2 + u * wTot, y: base - r * .7, r });
  }
  const pts = [];
  C.forEach((c, j) => {
    for (let a = -Math.PI * 1.1; a <= Math.PI * .1; a += .1) {
      const x = c.x + Math.cos(a) * c.r, y = c.y + Math.sin(a) * c.r;
      if (y > base - 2) continue;
      if (C.some((d, k) => k !== j && Math.hypot(x - d.x, y - d.y) < d.r * .97)) continue;
      pts.push([x, y]);
    }
  });
  const x0 = C[0].x - C[0].r * .5, x1 = C[n - 1].x + C[n - 1].r * .5;
  for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push([lerp(x0, x1, u), base + Math.sin(u * Math.PI) * 6 * s]); }
  const mx = cx, my = cy;
  return pts.sort((p, q) => Math.atan2(p[1] - my, p[0] - mx) - Math.atan2(q[1] - my, q[0] - mx));
}
// A cloud is the paper left white, outlined in a pale pencil, with a smudge of blue under it.
export function cloud(g, t, x, y, s = 1, o = {}) {
  const { seed = 1, drift = 5, alpha = 1 } = o;
  const dx = ((t * drift) % 40) - 20 + Math.sin(t * .35 + seed) * 6;
  g.save();
  g.globalAlpha *= alpha;
  const P = cloudShape(x + dx, y, s, seed);
  blob(g, P, { fill: 'paper', line: SOFT, lw: 5.4, seed: seed + 4, t });
  hatch(g, P.filter(p => p[1] > y + 6 * s).concat([[x + dx + 100 * s, y + 40 * s], [x + dx - 100 * s, y + 40 * s]]), { col: '#a9cbe8', seed: seed + 5, t, gap: 9, w: 6, alpha: .4, spill: 3, dens: .6 });
  g.restore();
}

// ---------------------------------------------------------------- trees and flowers
// A lollipop tree: a trunk, a green cloud of a crown that sways with the oom-pah, an apple or two.
export function tree(g, t, x, y, s = 1, o = {}) {
  const { seed = 7, crown = C.green, shade = '#2f8a4a', apples = 0, far = false } = o;
  const sw = sway(t) * 5 * s;
  const lc = far ? SOFT : ink;
  blob(g, capsule([x, y], [x + 6 * s, y - 150 * s], 22 * s, 15 * s, 5, seed), { fill: '#a9793a', shade: '#6d4a1e', line: lc, lw: 5.6, seed, t, hw: 5, sh: .4 });
  const cx = x + sw + 6 * s, cy = y - 240 * s;
  blob(g, scallop(cx, cy, 128 * s, 9, .16, 0, seed + 1), { fill: crown, shade, line: lc, lw: 6, seed: seed + 1, t, hw: 5.4, sh: .38 });
  for (let i = 0; i < apples; i++) {
    const a = hash(seed, i, 9) * TAU, d = 50 + hash(seed, i, 8) * 50;
    dot(g, cx + Math.cos(a) * d * s, cy + Math.sin(a) * d * s * .8, 11 * s, { col: C.red, seed: seed + 20 + i, t });
  }
}
// A flower on a stem that leans with the oom-pah.
export function flower(g, t, x, y, s = 1, col = C.pink, o = {}) {
  const { seed = 5, petals = 6, phase = 0 } = o;
  const lean = sway(t + phase) * 8 * s + (hash(seed, 1) - .5) * 14 * s;
  const top = [x + lean, y - 120 * s];
  line(g, [[x, y], [x + lean * .3 + 4 * s, y - 60 * s], top], { w: 6 * s, col: '#3f9a4d', seed, t, passes: 1, taper: [.02, .1] });
  blob(g, [[x + lean * .2, y - 44 * s], [x + lean * .2 + 26 * s, y - 62 * s], [x + lean * .3 + 4 * s, y - 40 * s]], { fill: C.lime, line: ink, lw: 3.6, seed: seed + 1, t, tone: .7, gap: 5, hw: 4 });
  for (let i = 0; i < petals; i++) {
    const a = i / petals * TAU + hash(seed, 2) * 1.2 + lean * .01;
    blob(g, ellipse(top[0] + Math.cos(a) * 20 * s, top[1] + Math.sin(a) * 20 * s, 15 * s, 11 * s, 7, a, seed + 10 + i), { fill: col, line: ink, lw: 3.4, seed: seed + 10 + i, t, gap: 5, hw: 4, tone: .7 });
  }
  blob(g, ellipse(top[0], top[1], 11 * s, 11 * s, 8, 0, seed + 30), { fill: C.yellow, line: ink, lw: 3.4, seed: seed + 30, t, gap: 4, hw: 4, tone: .8 });
}

// ---------------------------------------------------------------- the pigeon
// A pigeon: it watches, bobs its head on the beat and reacts to what it sees. The film's one running
// witness; it sits on things.
//   state 'perch' 'gasp' 'flap' 'sleep' 'peck' 'smug'      flip -1 to face left
export function pigeon(g, t, x, y, s = 1, o = {}) {
  const { seed = 11, state = 'perch', flip = 1, look = 0, body = '#9aa3b8', shade = '#6c7590', bib = '#c6c1d6', bounce = 1 } = o;
  const I = idle(t, seed);
  const bob = Math.sin(beatPos(t) * Math.PI) * 5 * s * (state === 'sleep' ? 0 : bounce);
  g.save();
  g.translate(x, y); g.scale(flip * s, s);
  // Legs.
  [-14, 12].forEach((lx, i) => line(g, [[lx, -26], [lx + (i ? 4 : -2), 0]], { w: 6, col: C.orange, seed: seed + i, t, passes: 1, spline: false }));
  [-24, 0].forEach((lx, i) => line(g, [[lx + 12, 0], [lx + 26, 1]], { w: 5, col: C.orange, seed: seed + 3 + i, t, passes: 1, spline: false }));
  // Tail, body, wing.
  const wing = state === 'flap' ? Math.sin(t * 34) * .7 : 0;
  blob(g, [[-50, -60], [-88, -52], [-96, -40], [-52, -38]], { fill: shade, line: ink, lw: 5, seed: seed + 4, t, gap: 5, hw: 4.6 });
  blob(g, ellipse(-4, -58 - bob * .3, 50, 40, 10, .1, seed + 5), { fill: body, shade, line: ink, lw: 6, seed: seed + 5, t, hw: 5, sh: .34 });
  blob(g, ellipse(10, -46 - bob * .3, 30, 24, 8, 0, seed + 6), { fill: bib, line: null, seed: seed + 6, t, tone: .6, gap: 5, hw: 4.6, dens: .6 });
  g.save(); g.translate(-14, -66 - bob * .3); g.rotate(-wing);
  blob(g, [[0, 0], [-40, -14], [-58, 6], [-30, 24], [0, 20]], { fill: shade, line: ink, lw: 5, seed: seed + 7, t, gap: 5, hw: 4.6 });
  g.restore();
  // Head, beak, eye.
  const hx = 34 + look * 3, hy = -100 - bob;
  blob(g, ellipse(hx, hy, 26, 25, 8, 0, seed + 8), { fill: body, shade, line: ink, lw: 5.4, seed: seed + 8, t, hw: 4.8, sh: .3 });
  const open = state === 'gasp' ? 12 : 0;
  blob(g, [[hx + 22, hy - 4 - open * .4], [hx + 54, hy + 3], [hx + 22, hy + 6 + open]], { fill: C.orange, line: ink, lw: 4.4, seed: seed + 9, t, gap: 5, hw: 4.2, tone: .8 });
  const shut = state === 'sleep' || I.blink > .5;
  if (shut) line(g, [[hx + 4, hy - 4], [hx + 14, hy]], { w: 4.6, col: ink, seed: seed + 10, t, passes: 1, spline: false });
  else if (state === 'gasp') { blob(g, ellipse(hx + 10, hy - 6, 10, 11, 7, 0, seed + 11), { fill: '#fbf8ef', line: ink, lw: 3.6, seed: seed + 11, t, tone: .95 }); dot(g, hx + 12 + look * 2, hy - 5, 4.6, { col: ink, seed: seed + 12, t }); }
  else { dot(g, hx + 10 + look * 2, hy - 5, 6, { col: ink, seed: seed + 12, t }); dot(g, hx + 8, hy - 8, 2.2, { col: '#fbf8ef', seed: seed + 13, t }); }
  g.restore();
}

// ---------------------------------------------------------------- butterflies
export function butterfly(g, t, x, y, s = 1, col = C.pink, o = {}) {
  const { seed = 4 } = o;
  const f = Math.abs(Math.sin(t * 13 + seed));
  g.save(); g.translate(x, y); g.rotate(Math.sin(t * 2 + seed) * .25); g.scale(s, s);
  [-1, 1].forEach((sd, i) => {
    g.save(); g.scale(sd * (.25 + f * .75), 1);
    blob(g, ellipse(24, -16, 26, 20, 8, -.5, seed + i), { fill: col, line: ink, lw: 3.6, seed: seed + i, t, gap: 5, hw: 4, tone: .7 });
    blob(g, ellipse(18, 18, 18, 14, 8, .5, seed + 3 + i), { fill: C.yellow, line: ink, lw: 3.6, seed: seed + 3 + i, t, gap: 5, hw: 4, tone: .7 });
    g.restore();
  });
  line(g, [[0, -22], [0, 22]], { w: 6, col: ink, seed: seed + 6, t, passes: 1, spline: false });
  g.restore();
}

// ---------------------------------------------------------------- bunting
// A string of flags between two points, sagging, swaying on the oom-pah.
export function bunting(g, t, x0, y0, x1, y1, o = {}) {
  const { n = 8, sag = 60, cols = [C.red, C.yellow, C.blue, C.green, C.orange, C.pink], seed = 2, size = 40 } = o;
  const sw = sway(t) * 4;
  const P = u => [lerp(x0, x1, u), lerp(y0, y1, u) + Math.sin(u * Math.PI) * sag + sw * Math.sin(u * Math.PI)];
  line(g, Array.from({ length: 13 }, (_, i) => P(i / 12)), { w: 5, col: '#8b5f2a', seed, t, passes: 1 });
  for (let i = 0; i < n; i++) {
    const u = (i + .5) / n, [px, py] = P(u), [qx, qy] = P(u + .02);
    const ang = Math.atan2(qy - py, qx - px);
    g.save(); g.translate(px, py); g.rotate(ang * .6);
    blob(g, [[-size * .5, 0], [size * .5, 0], [0, size * 1.15]], { fill: cols[i % cols.length], line: ink, lw: 4.6, seed: seed + 5 + i, t, gap: 5.6, hw: 4.8, tone: .7 });
    g.restore();
  }
}

// ---------------------------------------------------------------- a park
// The backdrop for a day scene: blue crayon sky to the horizon, a sun peeking in at the corner, clouds
// drifting, a row of far trees on a pale green hill, then the meadow to the foot of the page with
// flowers at the sides. Nothing here is in the bottom 400 px where the phone's controls sit, except
// the grass. `sun: false` for a scene of its own (a night, a room).
//   horizon: where the meadow starts     sunAt: [x, y] (default the top-right corner just below the words)
export function park(g, t, o = {}) {
  const { horizon = 1330, sunAt = [1000, 760], sunR = 92, mood = 'happy', look = [0, 0], seed = 11, clouds = true, trees = true, flowers = true, sunOn = true, skyCol = '#79c2ef', skyA = .3, shadeSun = 1 } = o;
  paper(g);
  sky(g, t, horizon, { alpha: skyA, col: skyCol, seed });
  if (sunOn) sun(g, t, sunAt[0], sunAt[1], sunR, { mood, look, seed: seed + 1 });
  if (clouds) {
    cloud(g, t, 210, 730, 1.0, { seed: seed + 2, drift: 4 });
    cloud(g, t, 640, 900, .75, { seed: seed + 7, drift: 3 });
  }
  if (trees) {
    // A pale hill and a few far trees.
    scrub(g, [0, horizon - 90, W, horizon + 30], { col: '#b9dc8f', seed: seed + 9, t, gap: 24, w: 26, alpha: .5, angle: -.08, wig: 20 });
    [[80, .42], [250, .34], [880, .4], [1010, .3]].forEach(([tx, ts], i) => tree(g, t, tx, horizon - 6, ts, { seed: 30 + i, crown: '#8fcf7a', shade: '#5fae5a', far: true }));
  }
  meadow(g, t, horizon, { seed: seed + 3 });
  if (flowers) {
    [[70, 1560, C.pink, .9], [180, 1640, C.yellow, .8], [990, 1600, C.orange, .95], [880, 1690, C.pink, .75], [1040, 1740, C.yellow, .85]].forEach(([fx, fy, col, fs], i) => flower(g, t, fx, fy, fs, col, { seed: 40 + i, phase: i * .13 }));
  }
}

// ---------------------------------------------------------------- the crowd
// A row of front-on dog heads along the bottom of the ring, mouths going on the sung words, swaying.
// (dogFront is passed in to keep this file free of the people module's imports.)
export function crowdRow(g, t, dogFront, y, o = {}) {
  const { n = 6, s = .8, seed = 1, breeds = ['lab', 'beagle', 'corgi', 'poodle', 'pug', 'husky', 'mutt', 'dalmatian', 'bulldog'], sing = 0, x0 = 90, x1 = W - 90, special = null } = o;
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, n === 1 ? .5 : i / (n - 1)) + Math.sin(t * 2.2 + i) * 3;
    // special: { index: (g, x, y, s) => draw } puts something else in a seat (a Clawd in the crowd).
    if (special && special[i]) { special[i](g, x, y + (i % 2) * 22 - beatPulse(t + i * .01, .17) * 8, s); continue; }
    const b = breeds[(i + seed) % breeds.length];
    const bp = beatPulse(t + i * .01, .17);
    dogFront(g, { x, y: y + (i % 2) * 22 - bp * 8, s: s * (.92 + hash(seed, i) * .16), t, seed: seed * 20 + i, breed: b, eyes: i % 3 === 1 ? 'happy' : 'dot', mouth: sing ? clamp(loud('vocals', t) * 1.5 - .1 + (i % 2) * .1) : 0, tongue: false, collar: [C.red, C.blue, C.green, C.purple, C.orange][i % 5], tilt: Math.sin(t * 2.2 + i * 1.7) * .06 });
  }
}
