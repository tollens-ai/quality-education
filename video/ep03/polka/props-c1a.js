// Props for chorus 1's third and fourth gags (builder "c1a"): a crate ship with a wheel that comes off, a
// snail carrying a crate, a puff of smoke; a CHECKING booth that is back in five minutes, a piggy bank
// that grins, little bugs, and bunting that falls. Everything is drawn with the pen in local coordinates
// (origin at the thing's foot, +x to the right, +y down), so a gag can move, squash and turn it, and
// every prop takes `ink` so the night chorus can draw it in cream.
import { clamp, lerp, hash, TAU, easeOut } from './kit.js';
import { blob, line, dot, hatch, spline, resample } from './pencil.js';
import { ellipse, rrect, capsule, roundPoly, warp } from './shapes.js';
import { write, measure } from './hand.js';
import { idle } from './life.js';
import { GRAPHITE, C } from './palette.js';

const WOOD = '#dcaa66', WOOD_D = '#a2703a', PLANK = '#c48d4b', CREAM = '#fbf8ef';
const centre = pts => [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];
// A hand-placed outline, wandering a little between drawings.
const wonk = (pts, seed, amp = 4, lam = 100) => { const [cx, cy] = centre(pts); return warp(pts, cx, cy, seed, amp, lam); };

// ---------------------------------------------------------------- a crate
// A shipping crate standing on (x, y): a frame of boards, a diagonal brace and nails; `label` is pasted on.
export function crate(g, t, x, y, w, h, o = {}) {
  const { seed = 1000, ink = GRAPHITE, label = null, labelCol = C.red, tilt = 0 } = o;
  g.save(); g.translate(x, y); g.rotate(tilt);
  blob(g, rrect(0, -h / 2, w, h, 10, 3, seed), { fill: WOOD, shade: WOOD_D, line: ink, lw: 6.4, seed, t, hw: 5.4, tone: .55, sh: .26 });
  const m = 15;
  // The frame: a second, inner rectangle of boards.
  line(g, [[-w / 2 + m, -m], [w / 2 - m, -m], [w / 2 - m, -h + m], [-w / 2 + m, -h + m]], { w: 4.4, col: ink, seed: seed + 1, t, closed: true, spline: false, passes: 1, alpha: .6 });
  // The brace: a board across the frame from the bottom-left to the top-right.
  const a = [-w / 2 + m + 4, -m - 4], b = [w / 2 - m - 4, -h + m + 4];
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = -(b[1] - a[1]) / d * 12, ny = (b[0] - a[0]) / d * 12;
  blob(g, [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]], { fill: PLANK, line: ink, lw: 4.6, seed: seed + 2, t, hw: 4.6, tone: .7, gap: 5 });
  [a, b].forEach((p, i) => dot(g, p[0], p[1], 4.6, { col: ink, seed: seed + 3 + i, t }));
  [[-w / 2 + 7, -h + 7], [w / 2 - 7, -7]].forEach((p, i) => dot(g, p[0], p[1], 4, { col: ink, seed: seed + 6 + i, t, alpha: .8 }));
  if (label) {
    const lw = w * .88, lh = Math.min(h * .42, 84), size = Math.min(lh * .62, lw * .88 / (measure(label, 100, 3) / 100));
    blob(g, rrect(0, -h / 2, lw, lh, 8, 2, seed + 9), { fill: CREAM, line: ink, lw: 4.6, seed: seed + 9, t, hw: 4.4, tone: .95, dens: .25 });
    write(g, label, 0, -h / 2 + size / 2, size, { col: labelCol, seed: seed + 10, t, align: 'center', track: 3, w: .12 });
  }
  g.restore();
}

// ---------------------------------------------------------------- the ship
// The hull is a crate too: a boat-shaped one, stern at x = -285, bow at x = +314, bottom at y = 0.
export function hullCrate(g, t, o = {}) {
  const { seed = 1300, ink = GRAPHITE } = o;
  const V = [[-285, -150], [-238, 2], [224, 2], [314, -180]];
  const P = warp(roundPoly(V, [14, 24, 24, 26], 3), 15, -85, seed, 4, 130);
  blob(g, P, { fill: WOOD, shade: WOOD_D, line: ink, lw: 7, seed, t, hw: 5.6, tone: .55, sh: .3 });
  const xl = y => lerp(-238, -285, clamp(-y / 150)), xr = y => lerp(224, 314, clamp(-y / 180));
  // Two plank seams, and a board along the top.
  [-50, -100].forEach((y, i) => line(g, [[xl(y) + 12, y], [xr(y) - 12, y]], { w: 4.6, col: ink, seed: seed + 3 + i, t, spline: false, passes: 1, alpha: .6 }));
  // The brace, corner to corner, and its nails.
  const a = [-196, -16], b = [232, -136];
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = -(b[1] - a[1]) / d * 15, ny = (b[0] - a[0]) / d * 15;
  blob(g, [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]], { fill: PLANK, line: ink, lw: 5, seed: seed + 6, t, hw: 4.8, tone: .7, gap: 5.4 });
  [a, b, [-236, -132], [292, -160]].forEach((p, i) => dot(g, p[0], p[1], 5.4, { col: ink, seed: seed + 8 + i, t }));
}

// Water under the hull: a blue band with a wavy top and foam on its crests. `phase` slides the waves.
export function waves(g, t, x0, x1, y, o = {}) {
  const { seed = 1350, phase = 0, amp = 9, ink = GRAPHITE, h = 44 } = o;
  const N = Math.max(4, Math.round((x1 - x0) / 40)), top = [], bot = [];
  for (let i = 0; i <= N; i++) {
    const x = lerp(x0, x1, i / N), k = Math.sin(x / 38 + phase);
    top.push([x, y - 10 + k * amp]);
  }
  for (let i = N; i >= 0; i--) bot.push([lerp(x0, x1, i / N), y + h + Math.sin(i * 1.7 + phase) * 4]);
  blob(g, [...top, ...bot], { fill: C.sky, shade: '#2f5fc0', line: ink, lw: 5.4, seed, t, hw: 5, tone: .65, sh: .5 });
  // Foam curls on the crests.
  for (let i = 1; i < N; i += 2) {
    const x = lerp(x0, x1, i / N), k = Math.sin(x / 38 + phase);
    line(g, [[x - 18, y - 8 + k * amp + 8], [x - 4, y - 16 + k * amp], [x + 14, y - 10 + k * amp + 4]], { w: 6, col: '#f2fbff', seed: seed + 20 + i, t, passes: 1, alpha: .95 });
  }
}

// A swallow-tailed flag streaming to the left from (x, y) on the mast; `len` how far it has unfurled.
export function pennant(g, t, x, y, o = {}) {
  const { len = 240, h = 104, text = 'SUN', col = C.yellow, seed = 1200, ink = GRAPHITE, droop = 0, wave = 1, size = 56, textCol = ink } = o;
  if (len < 8) return;
  const N = 8, top = [], bot = [];
  const rip = u => Math.sin(t * 13 - u * 6.2) * 15 * u * wave + u * u * droop * 70;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    top.push([x - len * u, y - h / 2 * (1 - u * .1) + rip(u)]);
    bot.push([x - len * u, y + h / 2 * (1 - u * .1) + rip(u)]);
  }
  // The swallow-tail: the last points pushed out to the tips, with a notch between them.
  const e = top[N], f = bot[N], notch = [x - len * .8, y + rip(.8)];
  const P = [...top.slice(0, N), [e[0] - 4, e[1] - 6], notch, [f[0] - 4, f[1] + 6], ...bot.slice(0, N).reverse()];
  blob(g, P, { fill: col, shade: C.orange, line: ink, lw: 6, seed, t, hw: 5, tone: .7, sh: .25 });
  if (len > 150) {
    const u = .36, cx = x - len * u, cy = y + rip(u);
    g.save(); g.translate(cx, cy); g.rotate(Math.atan2(rip(u + .1) - rip(u - .1), len * .2) * -1 * .0 + (rip(u + .08) - rip(u - .08)) / (len * .16));
    write(g, text, 0, size / 2, size, { col: textCol, seed: seed + 3, t, align: 'center', track: 3, w: .13 });
    g.restore();
  }
}

// A square sail hung from a yard: cream, seamed, bellied forward by `bulge` in a wind.
export function sail(g, t, o = {}) {
  const { x0 = 10, x1 = 292, top = -525, bot = -320, bulge = 26, seed = 1400, ink = GRAPHITE } = o;
  const mx = (x0 + x1) / 2, B = bulge;
  line(g, [[x0 - 20, top - 8], [x1 + 20, top - 8]], { w: 13, col: WOOD_D, seed: seed + 1, t, passes: 1, tooth: .5 });
  const P = [[x0, top], [mx, top + 5], [x1, top], [x1 + B * .8, lerp(top, bot, .35)], [x1 + B, lerp(top, bot, .68)], [x1 - 6, bot], [mx, bot + 16], [x0 + 6, bot], [x0 - B * .3, lerp(top, bot, .68)], [x0 - B * .4, lerp(top, bot, .35)]];
  blob(g, wonk(P, seed, 3.5, 120), { fill: '#fff2cc', shade: '#f4c76a', line: ink, lw: 6.4, seed, t, hw: 5.2, tone: .5, sh: .3, dens: .8 });
  line(g, [[x0 + 4, lerp(top, bot, .5) + 4], [mx, lerp(top, bot, .5) + 12 + B * .1], [x1 + B * .9, lerp(top, bot, .5) + 4]], { w: 30, col: C.sky, seed: seed + 3, t, passes: 1, alpha: .5, tooth: .5, taper: [.02, .02] });
  [.36, .68].forEach((u, i) => line(g, [[x0 - B * .3, lerp(top, bot, u)], [mx, lerp(top, bot, u) + 8 + B * .1], [x1 + B * .9, lerp(top, bot, u)]], { w: 4.2, col: ink, seed: seed + 5 + i, t, passes: 1, alpha: .5 }));
}

// A ship's wheel, face on, centred on (x, y): a rim, eight spokes with handles, a hub. `ang` turns it.
export function helmWheel(g, t, x, y, r, o = {}) {
  const { ang = 0, seed = 1100, ink = GRAPHITE } = o;
  g.save(); g.translate(x, y); g.rotate(ang);
  const ring = (rr, w, col, sd, al = 1) => line(g, Array.from({ length: 13 }, (_, i) => [Math.cos(i / 12 * TAU) * rr, Math.sin(i / 12 * TAU) * rr]), { w, col, seed: sd, t, closed: true, spline: true, passes: 1, alpha: al, tooth: .5 });
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * TAU + .2;
    line(g, [[Math.cos(a) * r * .18, Math.sin(a) * r * .18], [Math.cos(a) * r * 1.3, Math.sin(a) * r * 1.3]], { w: 11, col: WOOD_D, seed: seed + i, t, spline: false, passes: 1, flat: true, tooth: .5 });
    blob(g, ellipse(Math.cos(a) * r * 1.32, Math.sin(a) * r * 1.32, 11, 11, 7, 0, seed + 20 + i), { fill: WOOD, line: ink, lw: 4.2, seed: seed + 20 + i, t, gap: 4.4, hw: 4, tone: .7 });
  }
  ring(r * 1.0, 17, WOOD, seed + 40);
  ring(r * 1.0 + 8.5, 4.4, ink, seed + 41, .8);
  ring(r * 1.0 - 8.5, 4.4, ink, seed + 42, .8);
  blob(g, ellipse(0, 0, r * .24, r * .24, 9, 0, seed + 50), { fill: C.yellow, shade: C.orange, line: ink, lw: 5, seed: seed + 50, t, hw: 4.4, tone: .8, sh: .3 });
  g.restore();
}

// The whole ship: waves, crate hull, mast, sail, flag, and a helm with its wheel; `crew(g)` draws whoever
// stands on the deck (in the ship's own space, after the hull and before the wheel).
//   roll radians about the keel, flag 0..1 (how far unfurled), bulge (the wind in the sail), wheel {ang} or
//   null (a broken stub is left), fast 0..1 (bigger waves), droop (a sad flag)
export const SHIP = { wheel: [55, -274], wheelR: 62, deck: -152, stern: -165 };
export function ship(g, t, o = {}) {
  const { x = 560, y = 1345, s = 1, roll = 0, flag = 1, phase = 0, bulge = 26, wheel = { ang: 0, dx: 0 }, crew = null, seed = 1300, ink = GRAPHITE, fast = 0, droop = 0, sun = 'SUN' } = o;
  const [wx, wy] = SHIP.wheel;
  g.save(); g.translate(x, y); g.rotate(roll); g.scale(s, s);
  waves(g, t, -335, 350, 6, { phase, seed: seed + 50, amp: 9 + fast * 7, ink });
  hullCrate(g, t, { seed, ink });
  line(g, [[150, -150], [150, -628]], { w: 15, col: WOOD_D, seed: seed + 10, t, passes: 1, tooth: .5, taper: [.02, .04] });
  line(g, [[150, -622], [316, -190]], { w: 4.6, col: ink, seed: seed + 11, t, passes: 1, alpha: .8 });
  sail(g, t, { bulge, seed: seed + 20, ink });
  dot(g, 150, -636, 11, { col: C.yellow, seed: seed + 12, t });
  if (flag > .02) pennant(g, t, 150, -600, { len: 240 * flag, seed: seed + 30, ink, droop, text: sun });
  // The helm: a post on the deck that carries the wheel.
  line(g, [[wx, SHIP.deck + 4], [wx, wy + 26]], { w: 26, col: WOOD_D, seed: seed + 40, t, passes: 1, spline: false, flat: true, tooth: .5 });
  line(g, [[wx - 30, SHIP.deck - 2], [wx + 30, SHIP.deck - 2]], { w: 14, col: PLANK, seed: seed + 41, t, passes: 1, spline: false, flat: true, tooth: .5 });
  if (crew) crew(g);
  if (fast > .1) for (let i = 0; i < 3; i++) line(g, [[292 + i * 14, 2], [326 + i * 20, -34 - fast * 30 - i * 8], [372 + i * 22, -8 - i * 6]], { w: 8, col: '#e8f6ff', seed: seed + 70 + i, t, passes: 1, alpha: .95 * clamp(fast * 1.5) });
  if (wheel) helmWheel(g, t, wx + (wheel.dx || 0), wy, SHIP.wheelR, { ang: wheel.ang || 0, seed: seed + 60, ink });
  else {
    // A snapped axle: a jagged stub with splinters.
    blob(g, [[wx - 12, wy + 30], [wx - 14, wy - 6], [wx - 5, wy - 18], [wx + 2, wy - 4], [wx + 8, wy - 20], [wx + 14, wy - 2], [wx + 12, wy + 30]], { fill: WOOD_D, line: ink, lw: 4.6, seed: seed + 62, t, hw: 4.6, tone: .8 });
  }
  g.restore();
}

// ---------------------------------------------------------------- a puff of smoke
// Round lumps that swell out from (x, y) for the first third of k (0..1), then shrink away as they drift up.
export function puff(g, t, x, y, r, k, o = {}) {
  const { seed = 1500, ink = GRAPHITE, fill = '#f7f4ea', shade = '#c5cad6', n = 7, rise = 40, lw = 4.6 } = o;
  if (k <= 0 || k >= 1) return;
  const grow = easeOut(clamp(k / .3), 2), fade = clamp((k - .3) / .7), keep = 1 - fade * fade;
  for (let i = 0; i < n + 1; i++) {
    const c = i === n, a = i / n * TAU + hash(seed, i, 1) * .6, d = c ? 0 : r * (.5 + hash(seed, i, 2) * .3) * (.55 + .45 * grow), rr = r * (c ? .55 : .36 + hash(seed, i, 3) * .16) * grow * keep;
    if (rr < 7) continue;
    blob(g, ellipse(x + Math.cos(a) * d, y + Math.sin(a) * d * .78 - rise * fade, rr, rr * .92, 10, 0, seed + i), { fill, shade, line: ink, lw, seed: seed + i, t, hw: 5, tone: .9, sh: .4 });
  }
}

// ---------------------------------------------------------------- a snail carrying a crate
// Facing right, its foot on y = 0: a long foot, a neck and a head with two eyes on stalks, a spiral shell and, roped
// on top of the shell, a crate. `crawl` 0..1 is the phase of its ripple, `look` [-1..1, -1..1] where the eyes
// look, `crate` false for the bare shell, `wobble` tips the crate (radians).
export function snail(g, t, o = {}) {
  const { seed = 1550, ink = GRAPHITE, crawl = 0, look = [0, 0], label = 'CHANGES', hasCrate = true, wobble = 0, eyes = 'open', sad = 0 } = o;
  const I = idle(t, seed), sd = seed * 7;
  const rip = Math.sin(crawl * TAU);
  g.save(); g.scale(1 + rip * .028, 1 - rip * .022);
  const body = [[-238, -5], [-206, -30], [-140, -50], [-60, -58], [30, -60], [100, -66], [148, -94], [174, -140], [194, -176], [226, -180], [254, -152], [256, -118], [246, -88], [228, -64], [232, -30], [212, 0], [120, 4], [20, 5], [-90, 4], [-190, 3]];
  blob(g, wonk(body, sd, 4, 100), { fill: '#d5df8c', shade: '#a7b955', line: ink, lw: 7, seed: sd, t, hw: 5.4, tone: .55, sh: .3 });
  // A sheen on the wet foot.
  line(g, [[-170, -20], [-90, -30], [-10, -26]], { w: 7, col: '#f6ffd8', seed: sd + 1, t, passes: 1, alpha: .8 });
  // Eyes on stalks.
  const tips = [[184, -246], [250, -240]];
  [[[204, -172], tips[0]], [[236, -172], tips[1]]].forEach(([a, b], i) => blob(g, capsule(a, b, 9, 7, 4, sd + 2 + i), { fill: '#d5df8c', shade: '#a7b955', line: ink, lw: 5, seed: sd + 2 + i, t, gap: 5, hw: 4.4, tone: .6, sh: .3 }));
  tips.forEach(([ex, ey], i) => {
    const shut = eyes === 'shut' || I.blink > .5;
    blob(g, ellipse(ex, ey, 27, 28, 9, 0, sd + 6 + i), { fill: CREAM, line: ink, lw: 5.4, seed: sd + 6 + i, t, hw: 4.6, tone: .95, dens: .3 });
    if (shut) line(g, [[ex - 18, ey + 2], [ex, ey + 8], [ex + 18, ey + 2]], { w: 6, col: ink, seed: sd + 8 + i, t, passes: 1 });
    else {
      const lx = look[0] * 8 + I.look[0] * 3, ly = look[1] * 8 + I.look[1] * 2;
      dot(g, ex + lx + 3, ey + ly + 2, 11, { col: ink, seed: sd + 8 + i, t });
      dot(g, ex + lx - 1, ey + ly - 3, 3.8, { col: CREAM, seed: sd + 10 + i, t });
    }
    if (sad) { const sg = i ? 1 : -1; line(g, [[ex + sg * 26, ey - 30], [ex - sg * 14, ey - 30 - 14 * sad]], { w: 5.6, col: ink, seed: sd + 12 + i, t, passes: 1, spline: false }); }
  });
  // A cheek and a little smile.
  hatch(g, ellipse(232, -112, 19, 12, 7, 0, sd + 14), { col: C.pink, seed: sd + 14, t, gap: 5, w: 4, alpha: .85, spill: 2 });
  line(g, [[240, -92], [248, -84], [258, -92]], { w: 5.6, col: ink, seed: sd + 15, t, passes: 1 });
  // The shell, a spiral.
  blob(g, ellipse(-45, -140, 118, 112, 14, 0, sd + 20), { fill: '#e8a552', shade: '#b5661e', line: ink, lw: 7, seed: sd + 20, t, hw: 5.4, tone: .6, sh: .3 });
  const sp = Array.from({ length: 34 }, (_, i) => { const a = i * .34 + 1.1, r = 7 + i * 2.55; return [-45 + Math.cos(a) * r * 1.03, -140 + Math.sin(a) * r * .97]; });
  line(g, sp, { w: 7, col: '#8b4a1c', seed: sd + 21, t, passes: 1, taper: [.02, .1] });
  if (hasCrate) {
    // The load: a crate strapped on top, tipping as it goes.
    g.save(); g.translate(-45, -234); g.rotate(wobble);
    crate(g, t, 0, 0, 262, 190, { seed: sd + 30, ink, label, labelCol: C.red });
    [-84, 84].forEach((bx, i) => { line(g, [[bx, -190], [bx + (i ? 22 : -22), -100], [bx + (i ? 30 : -30), 14]], { w: 8, col: '#f3dfb4', seed: sd + 40 + i, t, passes: 1, alpha: .95 }); line(g, [[bx, -190], [bx + (i ? 22 : -22), -100], [bx + (i ? 30 : -30), 14]], { w: 3.2, col: ink, seed: sd + 42 + i, t, passes: 1, alpha: .55 }); });
    g.restore();
  }
  g.restore();
}

// ---------------------------------------------------------------- the CHECKING booth
// A kiosk with a striped awning, a service window, a shelf, a board that says CHECKING, and a sign hung on it:
// BACK IN 5 MIN. Nobody is in it; a cup of coffee steams on the shelf. `swing` swings the sign (radians).
export function booth(g, t, o = {}) {
  const { seed = 1600, ink = GRAPHITE, swing = 0, title = 'CHECKING', sign = ['BACK IN', '5 MIN'], empty = true } = o;
  // The wall, and the dark window with a stool.
  blob(g, rrect(0, -118, 300, 236, 12, 3, seed), { fill: '#8cc9ea', shade: '#4d95c9', line: ink, lw: 7, seed, t, hw: 5.4, tone: .6, sh: .3 });
  blob(g, rrect(0, -142, 228, 118, 10, 2, seed + 1), { fill: '#6e7ea6', shade: '#414c72', line: ink, lw: 6, seed: seed + 1, t, hw: 5, tone: .9, sh: .4 });
  if (empty) {
    line(g, [[26, -128], [26, -92]], { w: 8, col: WOOD_D, seed: seed + 2, t, passes: 1, spline: false });
    blob(g, ellipse(26, -136, 34, 9, 8, 0, seed + 3), { fill: WOOD, line: ink, lw: 4.6, seed: seed + 3, t, hw: 4.4, tone: .8 });
  }
  // The shelf, the cup and its steam.
  blob(g, rrect(0, -76, 262, 22, 8, 2, seed + 4), { fill: WOOD, shade: WOOD_D, line: ink, lw: 5.6, seed: seed + 4, t, hw: 4.8, tone: .8, sh: .35 });
  blob(g, rrect(96, -102, 38, 34, 8, 2, seed + 5), { fill: CREAM, line: ink, lw: 4.6, seed: seed + 5, t, hw: 4.4, tone: .95, dens: .3 });
  line(g, [[114, -110], [130, -108], [128, -92], [114, -90]], { w: 4.6, col: ink, seed: seed + 6, t, passes: 1 });
  for (let i = 0; i < 2; i++) {
    const ph = t * 2.6 + i * 2.1, px = 90 + i * 14;
    line(g, [[px, -122], [px + Math.sin(ph) * 8 + 6, -142], [px - Math.sin(ph + 1) * 8, -162], [px + Math.sin(ph + 2) * 6, -182]], { w: 5.4, col: '#dfe4ee', seed: seed + 7 + i, t, passes: 1, alpha: .95, taper: [.2, .6] });
  }
  // The awning: six stripes with a scalloped hem, a little wider than the wall.
  const AW = 364, n = 6, sw = AW / n, top = -246, hemY = -206;
  for (let i = 0; i < n; i++) {
    const x0 = -AW / 2 + i * sw, x1 = x0 + sw, t0 = -AW / 2 + 20 + i * (AW - 40) / n, t1 = t0 + (AW - 40) / n, hem = [];
    for (let k = 0; k <= 6; k++) { const a = Math.PI * k / 6; hem.push([x0 + sw / 2 + Math.cos(Math.PI - a) * sw / 2, hemY + Math.sin(a) * 22]); }
    blob(g, [[t0, top], [t1, top], ...hem.slice().reverse()], { fill: i % 2 ? CREAM : C.red, line: ink, lw: 5.4, seed: seed + 10 + i, t, hw: 4.6, tone: .7, dens: i % 2 ? .3 : 1 });
  }
  // The board: CHECKING, on two posts above the awning.
  [-130, 130].forEach((px, i) => line(g, [[px, top + 4], [px, top - 56]], { w: 12, col: WOOD_D, seed: seed + 20 + i, t, passes: 1, spline: false, flat: true }));
  blob(g, rrect(0, -332, 336, 88, 14, 3, seed + 22), { fill: '#fff3cf', shade: '#f4c76a', line: ink, lw: 6.4, seed: seed + 22, t, hw: 5, tone: .8, sh: .2, dens: .4 });
  write(g, title, 0, -332 + 27, 54, { col: C.navy, seed: seed + 23, t, align: 'center', track: 5, w: .12 });
  // The sign, hung by two strings from the awning: BACK IN 5 MIN.
  const sx = -30, sy = -184;
  g.save(); g.translate(sx, sy); g.rotate(swing);
  [-52, 52].forEach((dx, i) => line(g, [[dx, -22], [dx * .9, 8]], { w: 4.4, col: ink, seed: seed + 30 + i, t, passes: 1, spline: false, alpha: .8 }));
  blob(g, rrect(0, 66, 212, 130, 12, 3, seed + 32), { fill: CREAM, line: ink, lw: 6, seed: seed + 32, t, hw: 4.6, tone: .95, dens: .25 });
  write(g, sign[0], 0, 66 - 10, 38, { col: ink, seed: seed + 33, t, align: 'center', track: 4, w: .12 });
  write(g, sign[1], 0, 66 + 48, 54, { col: C.red, seed: seed + 34, t, align: 'center', track: 4, w: .13 });
  g.restore();
}

// ---------------------------------------------------------------- a piggy bank
// Facing right (flip -1 faces left), feet on y = 0. `grin` 0..1, `eyes` 'happy' | 'wide', `sweat`; a slot on its back.
export function piggy(g, t, o = {}) {
  const { seed = 1700, ink = GRAPHITE, grin = 1, eyes = 'happy', flip = 1, look = [0, 0], sweat = false, tail = 0 } = o;
  const sd = seed * 5, I = idle(t, seed), PINK = '#f7a8bc', PINK_D = '#d97a9a', SNOUT = '#f38aa5';
  g.save(); g.scale(flip, 1);
  // The curly tail.
  const tl = Array.from({ length: 16 }, (_, i) => { const a = i * .55 + tail; return [-160 + Math.cos(a) * (4 + i * 1.6), -150 + Math.sin(a) * (4 + i * 1.6)]; });
  line(g, [[-128, -138], ...tl], { w: 8, col: PINK_D, seed: sd, t, passes: 1, tooth: .5 });
  // Far legs, body, near legs.
  [-48, 102].forEach((lx, i) => blob(g, capsule([lx, -50], [lx + 2, -3], 21, 19, 4, sd + 1 + i), { fill: PINK_D, line: ink, lw: 5.6, seed: sd + 1 + i, t, hw: 4.6, tone: .7, gap: 5 }));
  blob(g, ellipse(0, -120, 140, 102, 14, 0, sd + 3), { fill: PINK, shade: PINK_D, line: ink, lw: 7, seed: sd + 3, t, hw: 5.4, tone: .6, sh: .3 });
  [-92, 64].forEach((lx, i) => blob(g, capsule([lx, -52], [lx + 3, -3], 22, 20, 4, sd + 5 + i), { fill: PINK, shade: PINK_D, line: ink, lw: 5.8, seed: sd + 5 + i, t, hw: 4.6, tone: .7, gap: 5, sh: .3 }));
  // The coin slot.
  line(g, [[-38, -216], [24, -220]], { w: 10, col: ink, seed: sd + 8, t, passes: 1, spline: false });
  // The ear, the snout, the face.
  blob(g, [[58, -196], [94, -246], [120, -190]], { fill: '#e8739a', line: ink, lw: 5.6, seed: sd + 9, t, hw: 4.6, tone: .8 });
  blob(g, ellipse(138, -104, 46, 38, 10, 0, sd + 10), { fill: SNOUT, shade: PINK_D, line: ink, lw: 6, seed: sd + 10, t, hw: 4.8, tone: .7, sh: .3 });
  [[132, -110], [152, -108]].forEach(([nx, ny], i) => dot(g, nx, ny, 6.4, { col: ink, seed: sd + 11 + i, t }));
  const ex = 92, ey = -148;
  if (eyes === 'happy' || I.blink > .5) line(g, [[ex - 17, ey + 8], [ex, ey - 12], [ex + 17, ey + 8]], { w: 8, col: ink, seed: sd + 13, t, passes: 1 });
  else {
    blob(g, ellipse(ex, ey, 21, 24, 8, 0, sd + 14), { fill: CREAM, line: ink, lw: 5, seed: sd + 14, t, hw: 4.4, tone: .95, dens: .3 });
    dot(g, ex + look[0] * 6, ey + look[1] * 6, 10, { col: ink, seed: sd + 15, t });
    dot(g, ex + look[0] * 6 - 3, ey + look[1] * 6 - 4, 3.4, { col: CREAM, seed: sd + 16, t });
  }
  hatch(g, ellipse(66, -112, 24, 15, 7, 0, sd + 17), { col: C.red, seed: sd + 17, t, gap: 5, w: 4, alpha: .55, spill: 2 });
  // The grin: a crescent from under the snout back to the cheek, with a row of teeth along its top.
  if (grin > .05) {
    const dp = 10 + grin * 24;
    blob(g, [[110, -80], [84, -66 + dp * .55], [54, -66 + dp * .5], [38, -94], [50, -84], [76, -76], [98, -80]], { fill: '#8a2f3a', line: ink, lw: 5, seed: sd + 18, t, hw: 4.2, tone: .95, gap: 4 });
    [[84, -76], [66, -79]].forEach(([tx, ty], i) => blob(g, rrect(tx, ty + 6, 13, 12, 3, 2, sd + 19 + i), { fill: CREAM, line: ink, lw: 3.2, seed: sd + 19 + i, t, hw: 4, tone: .95, dens: .2 }));
  }
  if (sweat) blob(g, [[118, -206], [130, -178], [116, -168], [104, -186]], { fill: C.sky, line: ink, lw: 4.4, seed: sd + 20, t, hw: 4, tone: .8 });
  g.restore();
}

// A coin, spinning about its upright axis (a = the angle).
export function coin(g, t, x, y, r, a, o = {}) {
  const { seed = 1750, ink = GRAPHITE } = o;
  const k = Math.max(.12, Math.abs(Math.cos(a)));
  blob(g, ellipse(x, y, r * k, r, 10, 0, seed), { fill: C.yellow, shade: C.orange, line: ink, lw: 4.6, seed, t, hw: 4.4, tone: .8, sh: .25 });
  if (k > .5) line(g, [[x - r * k * .4, y - r * .3], [x - r * k * .4, y + r * .3]], { w: 4.4, col: '#a86a10', seed: seed + 1, t, passes: 1, spline: false, alpha: .8 });
}

// ---------------------------------------------------------------- bugs
// A little bug in profile, feet on y = 0, facing right (flip -1 faces left). kind 'beetle' | 'lady' | 'flea' | 'stag' | 'violet'.
// `walk` the leg phase (0..1), `hop` px off the ground. No top hats: verse 2's flea has those.
const BUGS = {
  beetle: { shell: '#5cb85c', shade: '#2f7d3a', head: '#3d8f48', rx: 52, ry: 40 },
  lady: { shell: '#e8483c', shade: '#a52a20', head: '#2c2b36', rx: 50, ry: 40, spots: [[-26, -74, 8.5], [10, -86, 9.5], [-6, -52, 8], [30, -66, 7]] },
  stag: { shell: '#3f6fd6', shade: '#25397c', head: '#2b4aa0', rx: 54, ry: 40 },
  violet: { shell: '#9a6bd6', shade: '#5a3a9a', head: '#6a45b0', rx: 50, ry: 38 },
  flea: { shell: '#b8683c', shade: '#6f3a1e', head: '#8b4a2a', rx: 36, ry: 30, flea: true },
};
export function bug(g, t, x, y, s, o = {}) {
  const { kind = 'beetle', walk = 0, flip = 1, seed = 1, ink = GRAPHITE, hop = 0, look = 0, squash = 0 } = o;
  const B = BUGS[kind] || BUGS.beetle, sd = seed * 29;
  const fl = !!B.flea, by = fl ? -42 : -56;
  g.save(); g.translate(x, y - hop); g.scale(s * flip * (1 + squash * .1), s * (1 - squash * .13));
  // Legs (drawn first so the body covers the hips): a tripod gait.
  for (let i = 0; i < 3; i++) {
    const ph = walk + (i % 2) * .5, hx = -26 + i * 26, sw = Math.sin(ph * TAU) * 15, lift = Math.max(0, Math.cos(ph * TAU)) * 9;
    if (fl && i === 0) { line(g, [[hx - 6, by + 8], [hx - 40 - sw * .3, by - 16], [hx - 58, -6 - lift]], { w: 12, col: B.shade, seed: sd, t, passes: 1, spline: false, taper: [.05, .3] }); continue; }
    line(g, [[hx, by + 12], [hx + sw * .5 + (i - 1) * 9, by + 34 - lift * .4], [hx + sw + (i - 1) * 11, -lift]], { w: 6.6, col: ink, seed: sd + i, t, passes: 1, spline: false, taper: [.05, .3] });
  }
  // The body, its seam and shine, its spots.
  blob(g, ellipse(-6, by, B.rx, B.ry, 12, 0, sd + 5), { fill: B.shell, shade: B.shade, line: ink, lw: 6, seed: sd + 5, t, hw: 4.8, tone: .8, sh: .32, gap: 5 });
  if (!fl) line(g, [[-4, by - B.ry + 2], [-2, by], [-8, by + B.ry - 6]], { w: 4.6, col: ink, seed: sd + 6, t, passes: 1, alpha: .65 });
  line(g, [[-B.rx * .65, by - B.ry * .55], [-B.rx * .36, by - B.ry * .82], [-B.rx * .08, by - B.ry * .9]], { w: 6, col: '#ffffff', seed: sd + 7, t, passes: 1, alpha: .6 });
  (B.spots || []).forEach(([sx, sy, r], i) => dot(g, sx, sy + (56 + by), r, { col: ink, seed: sd + 8 + i, t }));
  // The head: a round face with one big glossy eye, a tiny smile, two feelers.
  const hx = B.rx + (fl ? 4 : 8), hy = by + 12;
  [[-8, -28, 30, -30], [8, -26, 26, -32]].forEach(([a, b, c, d], i) => { const ax = hx + a, ay = hy + b; line(g, [[ax, ay], [ax + c * .5 + i * 6, ay - 20 - i * 6], [ax + c + i * 14, ay - 34 - i * 10]], { w: 4.6, col: ink, seed: sd + 12 + i, t, passes: 1, spline: true, taper: [.02, .4] }); dot(g, ax + c + i * 14, ay - 34 - i * 10, 5.2, { col: ink, seed: sd + 14 + i, t }); });
  blob(g, ellipse(hx, hy, 27, 25, 9, 0, sd + 16), { fill: B.head, shade: B.shade, line: ink, lw: 5.6, seed: sd + 16, t, hw: 4.6, tone: .8, sh: .3, gap: 5 });
  blob(g, ellipse(hx + 6, hy - 4, 13, 14, 8, 0, sd + 17), { fill: CREAM, line: ink, lw: 3.8, seed: sd + 17, t, hw: 4, tone: .95, dens: .2 });
  dot(g, hx + 9 + look * 3, hy - 3, 6.4, { col: ink, seed: sd + 18, t });
  dot(g, hx + 6 + look * 3, hy - 7, 2.4, { col: CREAM, seed: sd + 19, t });
  line(g, [[hx + 6, hy + 12], [hx + 16, hy + 17], [hx + 25, hy + 9]], { w: 4.2, col: ink, seed: sd + 20, t, passes: 1 });
  g.restore();
}

// ---------------------------------------------------------------- bunting that falls
// One flag hanging from (x, y): `ang` from straight down, `size` px, `col`.
export function flagTri(g, t, x, y, size, ang, col, o = {}) {
  const { seed = 1800, ink = GRAPHITE } = o;
  g.save(); g.translate(x, y); g.rotate(ang);
  blob(g, [[-size * .5, 0], [size * .5, 0], [0, size * 1.15]], { fill: col, line: ink, lw: 4.6, seed, t, gap: 5.6, hw: 4.8, tone: .7 });
  g.restore();
}
// A rope through the points P, with `flags` hung along it (or none, for a plain rope).
export function garland(g, t, P, o = {}) {
  const { flags = 6, size = 50, cols = [C.red, C.yellow, C.blue, C.green, C.orange, C.pink], seed = 1810, ink = GRAPHITE, rope = '#8b5f2a', w = 6, flutter = 0 } = o;
  line(g, P, { w, col: rope, seed, t, passes: 1, spline: true, tooth: .5 });
  if (!flags) return;
  const S = resample(spline(P, false, 6), 8).p;
  for (let i = 0; i < flags; i++) {
    const idx = Math.round((i + .5) / flags * (S.length - 1)), p = S[idx], q = S[Math.min(idx + 2, S.length - 1)], r = S[Math.max(idx - 2, 0)];
    const tang = Math.atan2(q[1] - r[1], q[0] - r[0]);
    flagTri(g, t, p[0], p[1] - 1, size, -tang * .5 + Math.sin(t * 7 + i * 1.9) * flutter, cols[i % cols.length], { seed: seed + 2 + i, ink });
  }
}
