// Props, drawn as the same child would draw them: ribbons and rosettes, phones, a clipboard, ticks,
// bursts, a rubber stamp, a shop counter. Each takes a position and a size in master pixels, and
// the song's time so it can boil; anything that draws on or fills in takes a `prog` (0..1).
import { clamp, lerp, hash, TAU, easeOut, backOut } from './kit.js';
import { blob, line, dot, hatch, wash, spline, outline, bounds } from './pencil.js';
import { write, measure } from './hand.js';
import { rrect, ellipse, star, scallop, move, rotate, scale } from './shapes.js';
import { GRAPHITE, C } from './palette.js';

const ink = GRAPHITE;

// ---------------------------------------------------------------- prize ribbons
// A rosette: a frilled disc with a paler medallion and two ribbon tails. `state` 'new', 'wilt' (droops,
// its tails hang crooked) or 'ghost' (only a dashed outline, waiting for its prize).
export function rosette(g, x, y, r, col, t, o = {}) {
  const { seed = 1, label = '', state = 'new', tilt = 0, spin = 0, q = false, medal = C.cream, lw = 5.4, alpha = 1 } = o;
  g.save();
  g.globalAlpha *= alpha;
  g.translate(x, y);
  g.rotate(tilt);
  const wilt = state === 'wilt';
  const tail = side => {
    const k = wilt ? .7 : 1, s = side;
    return [[s * r * .25, r * .45], [s * r * (.72 + (wilt ? .1 : 0)), r * 1.85 * k], [s * r * .5, r * 1.6 * k], [s * r * .3, r * 2.1 * k], [s * r * .04, r * .7]];
  };
  if (state === 'ghost') {
    for (const [a, b] of [[0, 1]]) line(g, [...scallop(0, 0, r, 12, .1), ...scallop(0, 0, r, 12, .1).slice(0, 3)], { w: 6, col: ink, seed: seed + 3, t, spline: true, passes: 1, alpha: .8, taper: [.02, .02] });
    blob(g, ellipse(0, 0, r * .95, r * .95, 12), { fill: col, line: null, seed: seed + 6, t, gap: 9, hw: 3.6, tone: .25, dens: .55 });
    if (q) write(g, '?', 0, r * .3, r * .9, { col: ink, seed: seed + 9, t, align: 'center', alpha: .7 });
    g.restore();
    return;
  }
  blob(g, tail(-1), { fill: col, line: ink, lw: lw * .8, seed: seed + 1, t, hw: 4.6 });
  blob(g, tail(1), { fill: col, line: ink, lw: lw * .8, seed: seed + 2, t, hw: 4.6 });
  blob(g, scallop(0, 0, r, 14, wilt ? .2 : .1, spin), { fill: col, shade: ink, line: ink, lw, seed: seed + 3, t, hw: 5, sh: .3 });
  blob(g, ellipse(0, 0, r * .62, r * .62, 12), { fill: medal, line: ink, lw: lw * .75, seed: seed + 4, t, hw: 4.6, tone: .55 });
  if (label) write(g, label, 0, r * .16, r * .34, { col: ink, seed: seed + 5, t, align: 'center', track: 2 });
  if (q) write(g, '?', 0, r * .3, r * .9, { col: ink, seed: seed + 9, t, align: 'center' });
  g.restore();
}

// ---------------------------------------------------------------- marks
// A scribbled tick, written on.
export function tick(g, x, y, s, t, o = {}) {
  const { col = C.green, seed = 1, prog = 1, w = 12 } = o;
  line(g, [[x - s * .5, y + s * .05], [x - s * .12, y + s * .42], [x + s * .55, y - s * .5]], { w, col, seed, t, from: 0, to: prog, spline: false, passes: 2, taper: [.02, .05], wob: 1.4 });
}
export function cross(g, x, y, s, t, o = {}) {
  const { col = C.red, seed = 1, prog = 1, w = 12 } = o;
  line(g, [[x - s / 2, y - s / 2], [x + s / 2, y + s / 2]], { w, col, seed, t, from: 0, to: clamp(prog * 2), spline: false, passes: 1 });
  if (prog > .5) line(g, [[x + s / 2, y - s / 2], [x - s / 2, y + s / 2]], { w, col, seed: seed + 3, t, from: 0, to: clamp(prog * 2 - 1), spline: false, passes: 1 });
}
export function sparkle(g, x, y, r, t, o = {}) {
  const { col = C.yellow, seed = 1, rot = 0 } = o;
  const p = [];
  for (let i = 0; i < 8; i++) { const a = rot + i / 8 * TAU, rr = i % 2 ? r * .28 : r; p.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
  blob(g, p, { fill: col, line: ink, lw: 3.8, seed, t, gap: 5, hw: 4.2, tone: .6 });
}
// A "ta-da" burst: short lines radiating, drawn on.
export function burst(g, x, y, r0, r1, t, o = {}) {
  const { col = C.orange, n = 14, seed = 1, prog = 1, w = 9, rot = 0 } = o;
  for (let i = 0; i < n; i++) {
    const a = rot + i / n * TAU + (hash(seed, i) - .5) * .2;
    const k0 = r0 + (hash(seed, i, 2) - .5) * r0 * .3, k1 = lerp(r0, r1, prog * (.75 + hash(seed, i, 3) * .25));
    if (k1 <= k0 + 2) continue;
    line(g, [[x + Math.cos(a) * k0, y + Math.sin(a) * k0], [x + Math.cos(a) * k1, y + Math.sin(a) * k1]], { w, col, seed: seed + i, t, spline: false, passes: 1, taper: [.1, .5] });
  }
}
export function paw(g, x, y, s, t, o = {}) {
  const { col = C.brown, seed = 1, alpha = .85, rot = 0 } = o;
  g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha *= alpha;
  blob(g, ellipse(0, s * .18, s * .34, s * .28, 8), { fill: col, line: null, seed, t, gap: 4, hw: 4.6, tone: .8 });
  [[-.42, -.14], [-.16, -.36], [.16, -.36], [.42, -.14]].forEach(([dx, dy], i) => blob(g, ellipse(dx * s, dy * s, s * .13, s * .16, 6), { fill: col, line: null, seed: seed + i + 1, t, gap: 4, hw: 4.6, tone: .8 }));
  g.restore();
}

// ---------------------------------------------------------------- speech
// A speech bubble with a tail towards (tx, ty).
export function bubble(g, x, y, w, h, tx, ty, t, o = {}) {
  const { seed = 1, fill = '#fbf8ef', lw = 5.6, tone = .9, r = 34 } = o;
  const body = rrect(x, y, w, h, r, 3);
  // The tail: a triangle from the bottom edge towards the speaker.
  const dx = clamp(tx - x, -w / 2 + r, w / 2 - r), by = y + h / 2;
  blob(g, [[x + dx - 22, by - 4], [tx, ty], [x + dx + 24, by - 4]], { fill, line: ink, lw, seed: seed + 3, t, tone, dens: .5 });
  blob(g, body, { fill, line: ink, lw, seed, t, tone, dens: .35 });
  // Cover the seam where the tail joins.
  line(g, [[x + dx - 18, by - 2], [x + dx + 20, by - 2]], { w: 10, col: fill, seed: seed + 8, t, spline: false, passes: 1, alpha: 1, tooth: 1 });
}

// ---------------------------------------------------------------- phones
// A phone: a rounded slab with a screen. `screen(g, {x, y, w, h})` draws inside it.
export function phone(g, x, y, w, h, t, o = {}) {
  const { seed = 1, body = C.navy, screen = null, glow = null, tilt = 0, lw = 6.4 } = o;
  g.save();
  g.translate(x, y); g.rotate(tilt);
  blob(g, rrect(0, 0, w, h, w * .14, 3), { fill: body, line: ink, lw, seed, t, hw: 5, tone: .6, sh: .25, shade: '#111' });
  const sw = w * .84, sh = h * .86;
  blob(g, rrect(0, 0, sw, sh, w * .08, 3), { fill: glow || '#fbf8ef', line: ink, lw: lw * .6, seed: seed + 5, t, hw: 4.6, tone: glow ? .55 : .95, dens: glow ? .5 : .3 });
  if (screen) screen(g, { x: -sw / 2, y: -sh / 2, w: sw, h: sh });
  g.restore();
}
// An old brick of a phone, with an aerial, a tiny grey screen and a big keypad.
export function oldPhone(g, x, y, s, t, o = {}) {
  const { seed = 3, tilt = 0, cracked = true } = o;
  g.save();
  g.translate(x, y); g.rotate(tilt); g.scale(s, s);
  line(g, [[70, -168], [70, -232]], { w: 9, col: ink, seed: seed + 9, t, spline: false, passes: 1 });
  dot(g, 70, -238, 9, { col: ink, seed: seed + 10, t });
  blob(g, rrect(0, 0, 178, 340, 26, 3), { fill: '#6d6b76', shade: '#3c3b46', line: ink, lw: 6.6, seed, t, hw: 5, tone: .6, sh: .25 });
  blob(g, rrect(0, -92, 128, 88, 12, 3), { fill: '#b9d3a4', line: ink, lw: 5, seed: seed + 1, t, hw: 4.4, tone: .8 });
  if (cracked) {
    line(g, [[-38, -128], [-6, -100], [-22, -78], [30, -58]], { w: 4, col: ink, seed: seed + 2, t, spline: false, passes: 1, alpha: .8 });
    line(g, [[-6, -100], [24, -122]], { w: 3.4, col: ink, seed: seed + 3, t, spline: false, passes: 1, alpha: .7 });
  }
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
    blob(g, rrect(-46 + c * 46, -20 + r * 42, 34, 26, 8, 2), { fill: '#a8a7b2', line: ink, lw: 3.6, seed: seed + 10 + r * 3 + c, t, hw: 4, tone: .7, dens: .4 });
  }
  g.restore();
}

// ---------------------------------------------------------------- clipboard
// A clipboard with a sheet, three tick boxes and their ticks written on by `prog` (an array of three, or one number).
export function clipboard(g, x, y, s, t, o = {}) {
  const { seed = 5, prog = [0, 0, 0], tilt = 0, col = C.green, labels = null } = o;
  g.save();
  g.translate(x, y); g.rotate(tilt); g.scale(s, s);
  blob(g, rrect(0, 0, 250, 330, 20, 3), { fill: '#c99a5a', line: ink, lw: 6.6, seed, t, hw: 5, tone: .6, sh: .25, shade: '#8b5f2a' });
  blob(g, rrect(0, 10, 206, 276, 8, 2), { fill: '#fbf8ef', line: ink, lw: 4.6, seed: seed + 1, t, hw: 4.4, tone: .95, dens: .2 });
  blob(g, rrect(0, -150, 96, 40, 12, 2), { fill: '#a8a7b2', shade: '#6d6b76', line: ink, lw: 5, seed: seed + 2, t, hw: 4.4, sh: .3 });
  for (let i = 0; i < 3; i++) {
    const y0 = -84 + i * 84;
    line(g, [[-84, y0], [-52, y0], [-52, y0 + 32], [-84, y0 + 32], [-84, y0]], { w: 5, col: ink, seed: seed + 10 + i, t, spline: false, passes: 1 });
    if (labels) write(g, labels[i], -28, y0 + 30, 26, { col: ink, seed: seed + 20 + i, t, track: 3, w: .11 });
    else line(g, [[-30, y0 + 16], [76, y0 + 14]], { w: 5, col: C.grey, seed: seed + 20 + i, t, spline: false, passes: 1, alpha: .8 });
    const p = Array.isArray(prog) ? prog[i] : (i < prog ? 1 : 0);
    if (p > 0) tick(g, -68, y0 + 12, 46, t, { col, seed: seed + 30 + i, prog: p, w: 10 });
  }
  g.restore();
}

// ---------------------------------------------------------------- calendar
// A calendar board of cells; `stamps` is the number of cells with a paw stamped in them.
export function calendar(g, x, y, w, h, t, o = {}) {
  const { seed = 7, cols = 4, rows = 3, stamps = 0, pop = 1 } = o;
  g.save();
  g.translate(x, y);
  blob(g, rrect(0, 0, w, h, 20, 3), { fill: '#fbf8ef', line: ink, lw: 6, seed, t, hw: 4.6, tone: .9, dens: .25 });
  blob(g, rrect(0, -h / 2 + 30, w, 60, 18, 2), { fill: C.red, line: ink, lw: 5, seed: seed + 1, t, hw: 4.6 });
  const cw = (w - 40) / cols, ch = (h - 110) / rows;
  let n = 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const cx = -w / 2 + 20 + cw * (c + .5), cy = -h / 2 + 78 + ch * (r + .5);
    line(g, [[cx - cw / 2, cy + ch / 2], [cx + cw / 2, cy + ch / 2]], { w: 3, col: C.grey, seed: seed + 10 + n, t, spline: false, passes: 1, alpha: .6 });
    if (n < Math.floor(stamps)) {
      const k = n === Math.floor(stamps) - 1 ? backOut(clamp((stamps - n - 1 + 1) * 1)) : 1;
      paw(g, cx, cy, Math.min(cw, ch) * .7 * (n === Math.floor(stamps) - 1 ? clamp(pop) : 1), t, { col: [C.brown, C.blue, C.green, C.orange][n % 4], seed: seed + 40 + n });
    }
    n++;
  }
  g.restore();
}

// ---------------------------------------------------------------- the stamp
// A rubber stamp seen from the side, bringing its pad down: `down` 0..1 (0 raised, 1 stamped).
export function rubberStamp(g, x, y, s, t, o = {}) {
  const { seed = 9, down = 0, col = C.red, label = 'NO' } = o;
  g.save();
  g.translate(x, y + (1 - down) * -90 * s); g.scale(s, s);
  blob(g, rrect(0, -78, 120, 34, 12, 2), { fill: '#8b5f2a', line: ink, lw: 5, seed, t, hw: 4.6 });
  blob(g, rrect(0, -32, 44, 72, 12, 2), { fill: '#c99a5a', line: ink, lw: 5, seed: seed + 1, t, hw: 4.6 });
  blob(g, rrect(0, 20, 170, 36, 10, 2), { fill: col, line: ink, lw: 5.4, seed: seed + 2, t, hw: 4.6 });
  g.restore();
}
