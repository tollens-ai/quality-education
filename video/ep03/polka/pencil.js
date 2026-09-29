// The pen for "Pencil Polka": coloured-pencil lines and hatching that boil, drawn on the canvas.
//
// Every stroke is a ribbon (a polygon whose width swells and tapers like a pencil's pressure)
// filled with a grain pattern in the pencil's colour, so the hand is in the line itself and not in
// a texture laid over the frame. A shape is coloured by scribbling (hatch strokes that overshoot
// and undershoot its edge) and outlined twice, a little apart, as a sketch is. All the randomness
// comes from a seed and the boil's current version (kit.js: variant), so a frame is a pure
// function of the song's time and the drawing changes about twelve times a second.
import { clamp, lerp, hash, noise, rng, hexRgb, rgba, mix, variant, boil, TAU } from './kit.js';

// ---------------------------------------------------------------- the pencil's grain
// A tile of alpha noise in one colour, tileable, with streaks along the stroke's usual direction.
const TILES = new Map();
function tile(col, tooth) {
  const key = col + tooth;
  if (TILES.has(key)) return TILES.get(key);
  const N = 128;
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const x = c.getContext('2d');
  const id = x.createImageData(N, N);
  const [r, g, b] = hexRgb(col);
  const wrap = (i) => ((i % N) + N) % N;
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      // Speckle (paper tooth) and soft mottling, wrapped so the tile repeats.
      const sp = hash(wrap(i), wrap(j), 3);
      const sp2 = hash(wrap(i + 1), wrap(j - 1), 7);
      const mot = (noise((i + j * .35) / 9, 5) * .5 + noise((i - j * .6) / 23, 9) * .5) * .5 + .5;
      let a = (sp * .5 + sp2 * .25 + mot * .35) - (1 - tooth) * .55;
      a = clamp(a * 2.1 + .15);
      const k = (j * N + i) * 4;
      id.data[k] = r; id.data[k + 1] = g; id.data[k + 2] = b; id.data[k + 3] = Math.round(255 * a);
    }
  }
  x.putImageData(id, 0, 0);
  TILES.set(key, c);
  return c;
}
const PATS = new Map();
export function grain(g, col, tooth = .62) {
  const key = col + tooth;
  if (!PATS.has(key)) PATS.set(key, g.createPattern(tile(col, tooth), 'repeat'));
  return PATS.get(key);
}
// Move a pattern so the grain is different in each stroke and each drawing, and keep its scale the
// same whatever the drawing has been scaled by (so big and small letters share one paper tooth).
function shift(g, p, ox, oy) {
  if (p.setTransform) {
    const m = g.getTransform();
    const k0 = g.canvas.width / 1080;
    const k = Math.hypot(m.a, m.b) / k0 || 1;
    p.setTransform(new DOMMatrix([1 / k, 0, 0, 1 / k, ox, oy]));
  }
  return p;
}

// ---------------------------------------------------------------- paths
// Catmull-Rom through the control points; closed paths wrap.
export function spline(pts, closed = false, per = 8) {
  const n = pts.length;
  if (n < 3) return pts.slice();
  const out = [];
  const P = i => closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)];
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    for (let k = 0; k < per; k++) {
      const t = k / per, t2 = t * t, t3 = t2 * t;
      out.push([
        .5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        .5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  if (!closed) out.push(pts[n - 1].slice());
  return out;
}
// Equal spacing along the path, returning points with their arc length.
export function resample(pts, step = 5, closed = false) {
  const P = closed ? [...pts, pts[0]] : pts;
  const out = [], s = [];
  let acc = 0, next = 0;
  out.push(P[0].slice()); s.push(0);
  for (let i = 1; i < P.length; i++) {
    const [ax, ay] = P[i - 1], [bx, by] = P[i];
    const d = Math.hypot(bx - ax, by - ay);
    if (d === 0) continue;
    while (next + step <= acc + d) {
      next += step;
      const u = (next - acc) / d;
      out.push([ax + (bx - ax) * u, ay + (by - ay) * u]); s.push(next);
    }
    acc += d;
  }
  const last = P[P.length - 1];
  if (Math.hypot(last[0] - out[out.length - 1][0], last[1] - out[out.length - 1][1]) > step * .4) { out.push(last.slice()); s.push(acc); }
  return { p: out, s, len: acc };
}
export const pathLen = pts => { let d = 0; for (let i = 1; i < pts.length; i++) d += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return d; };
export function bounds(pts) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of pts) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
}
// The hand's wander: displace points along their normals by slow noise plus a little jitter.
export function wobble(pts, seed, v, amp = 1.6, wl = 90, jit = .5, closed = false) {
  const n = pts.length;
  const out = new Array(n);
  let s = 0;
  for (let i = 0; i < n; i++) {
    if (i) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    const a = pts[closed ? (i - 1 + n) % n : Math.max(i - 1, 0)], b = pts[closed ? (i + 1) % n : Math.min(i + 1, n - 1)];
    let nx = -(b[1] - a[1]), ny = b[0] - a[0];
    const l = Math.hypot(nx, ny) || 1;
    nx /= l; ny /= l;
    const d = amp * noise(s / wl + v * 3.7, seed * 13 + v) + jit * noise(s / 7 + v * 5.1, seed * 29 + 7 * v);
    out[i] = [pts[i][0] + nx * d, pts[i][1] + ny * d];
  }
  return out;
}

// ---------------------------------------------------------------- strokes
// The ribbon: a variable-width polygon along the path, filled with the pencil's grain.
function ribbon(g, P, widths, pat, alpha) {
  const n = P.length;
  if (n < 2) return;
  const L = new Array(n), R = new Array(n);
  for (let i = 0; i < n; i++) {
    const a = P[Math.max(i - 1, 0)], b = P[Math.min(i + 1, n - 1)];
    let nx = -(b[1] - a[1]), ny = b[0] - a[0];
    const l = Math.hypot(nx, ny) || 1;
    nx /= l; ny /= l;
    const h = widths[i] / 2;
    L[i] = [P[i][0] + nx * h, P[i][1] + ny * h];
    R[i] = [P[i][0] - nx * h, P[i][1] - ny * h];
  }
  g.save();
  g.globalAlpha *= alpha;
  g.fillStyle = pat;
  g.beginPath();
  g.moveTo(L[0][0], L[0][1]);
  for (let i = 1; i < n; i++) g.lineTo(L[i][0], L[i][1]);
  for (let i = n - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]);
  g.closePath();
  g.fill();
  // Rounded ends.
  g.beginPath(); g.arc(P[0][0], P[0][1], widths[0] / 2, 0, TAU); g.arc(P[n - 1][0], P[n - 1][1], widths[n - 1] / 2, 0, TAU); g.fill();
  g.restore();
}

// One pencil line through the control points.
//   w       width in px            col   colour
//   seed    which line it is       t     the song's time (sets the boil's version)
//   from/to how much of the line is drawn, 0..1 (write-on)
//   wob     how far the hand wanders, px          passes   1 or 2 (a second, fainter pass beside it)
//   taper   [start, end] fractions of the line that swell in and out
export function line(g, pts, o = {}) {
  const { w = 5, col = '#2b2a33', seed = 1, t = 0, from = 0, to = 1, wob = 1.5, wl = 90, passes = 2, taper = [.12, .18],
    alpha = .92, tooth = .62, spline: sp = true, closed = false, over = 0, flat = false } = o;
  if (to - from <= 0.001) return;
  const v = variant(t), bo = boil(t);
  let base = sp ? spline(pts, closed, 7) : pts;
  const rs = resample(base, Math.max(3, w * .8), closed);
  let P = rs.p;
  const N = P.length;
  if (N < 2) return;
  const i0 = Math.floor(from * (N - 1)), i1 = Math.max(i0 + 1, Math.ceil(to * (N - 1)));
  for (let pass = 0; pass < passes; pass++) {
    let Q = wobble(P, seed + pass * 17, v, wob * (pass ? 1.25 : 1), wl, .45, closed);
    if (pass) { const ox = (hash(seed, v, 1) - .5) * w * .9, oy = (hash(seed, v, 2) - .5) * w * .9; Q = Q.map(p => [p[0] + ox, p[1] + oy]); }
    // A hand overshoots the end of a line.
    if (over && !closed && pass === 0 && to >= 1) {
      const a = Q[N - 2], b = Q[N - 1];
      const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      Q.push([b[0] + (b[0] - a[0]) / d * over, b[1] + (b[1] - a[1]) / d * over]);
    }
    const S = Q.slice(i0, (to >= 1 ? Q.length : i1 + 1));
    const m = S.length;
    if (m < 2) continue;
    const wd = new Array(m);
    for (let i = 0; i < m; i++) {
      const u = m === 1 ? 0 : i / (m - 1);
      const tp = closed || flat ? 1 : Math.min(1, u / Math.max(taper[0], 1e-3)) * Math.min(1, (1 - u) / Math.max(taper[1], 1e-3));
      const pr = .72 + .28 * noise(i * .18 + bo * .37, seed + pass * 5);
      wd[i] = w * (pass ? .62 : 1) * lerp(.35, 1, Math.sqrt(clamp(tp))) * pr;
    }
    const pat = shift(g, grain(g, col, tooth), hash(seed, bo, pass, 1) * 128, hash(seed, bo, pass, 2) * 128);
    ribbon(g, S, wd, pat, alpha * (pass ? .55 : 1));
  }
}

// A closed outline through the points, drawn as a hand draws a circle: round, and a little past the start.
export function outline(g, pts, o = {}) {
  const { over = .05 } = o;
  const P = spline(pts, true, 8);
  const k = Math.max(2, Math.floor(P.length * over));
  const ring = [...P, ...P.slice(0, k)];
  line(g, ring, { ...o, spline: false, closed: false, taper: [.05, .12] });
}

// ---------------------------------------------------------------- colouring in
// The pencil's colouring: zigzag hatching across the shape, clipped to a wandering copy of its
// edge so the colour spills over and falls short as a hand's does.
//   gap     spacing of the hatch lines     angle   direction in radians     w   line width
//   spill   how far the colour may wander beyond the outline      dens   0..1 how much of the shape it covers
export function hatch(g, pts, o = {}) {
  const { col = '#d97757', seed = 1, t = 0, angle = -.9, gap = 6, w = 5.4, spill = 3.4, alpha = .9, tooth = .58, dens = 1, prog = 1, cross = false } = o;
  const v = variant(t), bo = boil(t);
  const poly = wobble(resample(pts, 12, true).p, seed + 401, v, spill, 55, 1.2, true);
  const b = bounds(poly);
  const pat = shift(g, grain(g, col, tooth), hash(seed, bo, 5) * 128, hash(seed, bo, 6) * 128);
  g.save();
  g.beginPath();
  poly.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y));
  g.closePath();
  g.clip();
  g.strokeStyle = pat;
  g.lineWidth = w;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.globalAlpha *= alpha;
  const passes = cross ? [angle, angle + 1.05] : [angle];
  for (const [pi, a] of passes.entries()) {
    const ca = Math.cos(a), sa = Math.sin(a);
    const R = Math.hypot(b.w, b.h) / 2 + 12;
    const rand = rng(hash(seed, v, pi, 77) * 1e6 + 1);
    const n = Math.ceil((2 * R) / gap);
    g.beginPath();
    let first = true, dir = 1;
    const lim = Math.ceil(n * prog);
    for (let i = 0; i < lim; i++) {
      if (dens < 1 && rand() > dens) continue;
      const off = -R + i * gap + (rand() - .5) * gap * .55;
      const j1 = (rand() - .5) * gap * .6, j2 = (rand() - .5) * gap * .6;
      // Line ends, in the rotated frame: across the whole shape, plus a hand's uneven stops.
      const ext = R * (0.96 + rand() * .1);
      const ax = b.cx + ca * (-ext * dir) - sa * off, ay = b.cy + sa * (-ext * dir) + ca * off + j1;
      const bx = b.cx + ca * (ext * dir) - sa * (off + gap * .5), by = b.cy + sa * (ext * dir) + ca * (off + gap * .5) + j2;
      if (first) { g.moveTo(ax, ay); first = false; } else g.lineTo(ax, ay);
      g.lineTo(bx, by);
      dir = -dir;
    }
    g.stroke();
  }
  g.restore();
}

// A pale wash under the hatching, so the paper doesn't show through a coloured area completely.
export function wash(g, pts, col, a = .22, seed = 1, t = 0) {
  const v = variant(t);
  const poly = wobble(resample(pts, 12, true).p, seed + 903, v, 2.2, 60, .8, true);
  g.save();
  g.fillStyle = rgba(col, a);
  g.beginPath();
  poly.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y));
  g.closePath();
  g.fill();
  g.restore();
}

// A coloured shape: wash, hatching, an optional shade, and the sketched outline on top.
//   fill / shade / line: colours     lw: outline width     open: don't close the outline
export function blob(g, pts, o = {}) {
  const { fill, shade, line: lc = '#2b2a33', lw = 6.6, seed = 1, t = 0, gap = 5.6, hw = 5.4, angle = -.9, tone = .34, dens = 1, sh = .38 } = o;
  const P = spline(pts, true, 8);
  if (fill) { wash(g, P, fill, tone, seed, t); hatch(g, P, { col: fill, seed, t, gap, w: hw, angle, dens }); }
  if (shade) {
    // The shade: a second, darker hatch across the lower part of the shape.
    const b = bounds(P);
    const cut = b.y1 - b.h * sh;
    g.save();
    g.beginPath(); g.rect(b.x0 - 40, cut - 4 + (hash(seed, variant(t)) - .5) * 6, b.w + 80, b.h + 80); g.clip();
    hatch(g, P, { col: shade, seed: seed + 5, t, gap: gap * 1.1, w: hw * .9, angle: angle + .55, alpha: .6, spill: 2 });
    g.restore();
  }
  if (lc && lw) outline(g, pts, { col: lc, w: lw, seed: seed + 11, t });
}

// A dot or a small filled scribble (an eye, a nose): a few tight strokes round a centre.
export function dot(g, x, y, r, o = {}) {
  const { col = '#2b2a33', seed = 1, t = 0, alpha = .95 } = o;
  const v = variant(t);
  g.save();
  g.fillStyle = shift(g, grain(g, col, .3), hash(seed, boil(t), 9) * 128, hash(seed, boil(t), 10) * 128);
  g.globalAlpha *= alpha;
  const pts = [];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + hash(seed, v, i) * .5;
    const rr = r * (0.86 + .28 * hash(seed, v, i + 40));
    pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * .96]);
  }
  const P = spline(pts, true, 5);
  g.beginPath(); P.forEach(([px, py], i) => i ? g.lineTo(px, py) : g.moveTo(px, py)); g.closePath(); g.fill();
  g.restore();
}

// A big loose crayon scribble over a region, for washes of colour behind a scene: broad, faint,
// sweeping strokes that don't try to stay in the lines.
export function scrub(g, box, o = {}) {
  const { col = '#9ccb3b', seed = 1, t = 0, gap = 22, w = 26, alpha = .34, angle = -.35, wig = 30 } = o;
  const v = variant(t);
  const [x0, y0, x1, y1] = box;
  const pat = shift(g, grain(g, col, .42), hash(seed, boil(t), 3) * 128, hash(seed, boil(t), 4) * 128);
  g.save();
  g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
  g.strokeStyle = pat; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round';
  g.globalAlpha *= alpha;
  const ca = Math.cos(angle), sa = Math.sin(angle);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + 20;
  const rand = rng(hash(seed, v, 8) * 1e6 + 3);
  g.beginPath();
  let dir = 1;
  const n = Math.ceil(2 * R / gap);
  for (let i = 0; i < n; i++) {
    const off = -R + i * gap + (rand() - .5) * gap * .7;
    const e = R * (.9 + rand() * .15);
    const ax = cx + ca * (-e * dir) - sa * off, ay = cy + sa * (-e * dir) + ca * off;
    const bx = cx + ca * (e * dir) - sa * (off + gap * .6), by = cy + sa * (e * dir) + ca * (off + gap * .6);
    g.moveTo(ax, ay);
    g.quadraticCurveTo((ax + bx) / 2 + (rand() - .5) * wig, (ay + by) / 2 + (rand() - .5) * wig, bx, by);
    dir = -dir;
  }
  g.stroke();
  g.restore();
}
