// The pen for "Pencil Polka": coloured-pencil lines and scribbled colour that boil, drawn on the canvas.
//
// Every stroke is a ribbon (a polygon whose width swells and tapers like a pencil's pressure)
// filled with a grain pattern in the pencil's colour, so the hand is in the line itself and not in
// a texture laid over the frame. And every shape is drawn the way a hand draws it, as a process and
// not as a path: a box is a few strokes that stop short of a corner or run past it, a circle is a
// loop that doesn't quite close, and colour is one scribble going back and forth that spills over
// the edge and misses patches, with no clip line at the edge. All the randomness comes from a seed
// and the boil's current version (kit.js: variant), so a frame is a pure function of the song's time
// and the drawing changes fifteen times a second.
import { clamp, lerp, hash, noise, rng, hexRgb, rgba, mix, variant, boil, TAU, kk } from './kit.js';
import { pageTone, PAGE } from './paper.js';

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
//   press   how much the pressure varies along the line (0..1)     skip   chance of a lifted pencil
//   over    px the stroke runs past its end (default: half of all lines run on a little)
//   bow     px a long line sags sideways (default: a hand never draws a straight line)
export function line(g, pts, o = {}) {
  const { w = 5, col = '#2b2a33', seed = 1, t = 0, from = 0, to = 1, wob: wob0 = 1.9, wl = 80, passes = 2, taper = [.12, .18],
    alpha = .92, tooth = .62, spline: sp = true, closed = false, flat = false, press = .34, skip = 0 } = o;
  if (to - from <= 0.001) return;
  const wob = wob0 * (.45 + .55 * kk());
  const v = variant(t), bo = boil(t);
  let base = sp ? spline(pts, closed, 7) : pts;
  const rs = resample(base, Math.max(3, w * .8), closed);
  let P = rs.p;
  const N = P.length;
  if (N < 2) return;
  // A hand doesn't draw a straight line: a long one sags to one side; and a stroke tends to run on past its end.
  const bowAmt = o.bow ?? (closed || flat || rs.len < 70 ? 0 : (hash(seed, 13) - .5) * 2 * Math.min(rs.len * .018, 7) * kk(.7));
  if (bowAmt) {
    const src = P;
    P = src.map((p, i) => {
      const a = src[Math.max(i - 1, 0)], c = src[Math.min(i + 1, N - 1)];
      let nx = -(c[1] - a[1]), ny = c[0] - a[0];
      const l = Math.hypot(nx, ny) || 1;
      const off = bowAmt * Math.sin(Math.PI * rs.s[i] / rs.len);
      return [p[0] + nx / l * off, p[1] + ny / l * off];
    });
  }
  const over = o.over ?? (closed || flat || from > 0 ? 0 : hash(seed, 21) < .5 ? (2 + hash(seed, 22) * 7) * Math.max(.7, w / 6) : 0);
  const i0 = Math.floor(from * (N - 1)), i1 = Math.max(i0 + 1, Math.ceil(to * (N - 1)));
  for (let pass = 0; pass < passes; pass++) {
    let Q = wobble(P, seed + pass * 17, v, wob * (pass ? 1.3 : 1), wl, .55, closed);
    if (pass) { const ox = (hash(seed, v, 1) - .5) * w * .8, oy = (hash(seed, v, 2) - .5) * w * .8; Q = Q.map(p => [p[0] + ox, p[1] + oy]); }
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
      // Pressure: slow swells and lulls, and a blot where the pencil was pressed down to start.
      const pr = 1 - press * (.5 + .5 * noise(i * .13 + hash(seed, pass, 3) * 30, seed + pass * 5)) * (flat ? .5 : 1);
      const blot = i < 3 && !flat ? 1.5 - i * .15 : 1;
      wd[i] = w * (pass ? .62 : 1) * lerp(.35, 1, Math.sqrt(clamp(tp))) * pr * blot;
    }
    const pat = shift(g, grain(g, col, tooth), hash(seed, pass, 1) * 128, hash(seed, pass, 2) * 128);
    // A skip: the pencil lifts for a moment, so the line is two pieces.
    if (skip && !flat && m > 30) {
      const cut = Math.floor(m * (.3 + hash(seed, pass, 8) * .4)), gap = 3 + Math.floor(hash(seed, pass, 9) * 4);
      if (hash(seed, pass, 7) < skip) {
        ribbon(g, S.slice(0, cut), wd.slice(0, cut), pat, alpha * (pass ? .55 : 1));
        ribbon(g, S.slice(cut + gap), wd.slice(cut + gap), pat, alpha * (pass ? .55 : 1));
        continue;
      }
    }
    ribbon(g, S, wd, pat, alpha * (pass ? .55 : 1));
  }
}

// ---------------------------------------------------------------- a shape, drawn the way a hand draws it
// The closed outline as evenly spaced samples.
function closedSamples(pts, step) {
  const p = resample(spline(pts, true, 8), step, true).p;
  if (p.length > 3 && Math.hypot(p[0][0] - p[p.length - 1][0], p[0][1] - p[p.length - 1][1]) < step * .6) p.pop();
  return p;
}
// Where the outline turns sharply (a box's corners, a star's points): places a hand would lift the pencil.
function findCorners(P, step) {
  const n = P.length;
  const k = Math.max(2, Math.round(18 / step));
  const turn = new Array(n);
  for (let i = 0; i < n; i++) {
    const a = P[(i - k + n) % n], b = P[i], c = P[(i + k) % n];
    const x1 = b[0] - a[0], y1 = b[1] - a[1], x2 = c[0] - b[0], y2 = c[1] - b[1];
    turn[i] = Math.abs(Math.atan2(x1 * y2 - y1 * x2, x1 * x2 + y1 * y2));
  }
  const med = [...turn].sort((x, y) => x - y)[n >> 1];
  const thr = Math.max(.6, med * 2.6);
  const sep = Math.max(k * 2, Math.round(50 / step));
  const out = [];
  for (let i = 0; i < n; i++) {
    if (turn[i] < thr) continue;
    let top = true;
    for (let d = -sep; d <= sep && top; d++) {
      if (!d) continue;
      const tj = turn[(i + d + n) % n];
      if (tj > turn[i] || (tj === turn[i] && d < 0)) top = false;
    }
    if (top) out.push(i);
  }
  return out;
}
// Continue a stroke past its end (len > 0), along its own tangent and curl, or cut it short (len < 0).
function extendEnd(P, len, st) {
  const n = P.length;
  if (len < 0) {
    let cut = -len, i = n - 1;
    while (i > 3 && cut > 0) { cut -= Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); i--; }
    return P.slice(0, i + 1);
  }
  if (n < 6) return P;
  const m = Math.min(3, (n - 1) >> 1);
  const a = P[n - 1 - 2 * m], b = P[n - 1 - m], c = P[n - 1];
  const x1 = b[0] - a[0], y1 = b[1] - a[1], x2 = c[0] - b[0], y2 = c[1] - b[1];
  let ang = Math.atan2(y2, x2);
  const rate = Math.atan2(x1 * y2 - y1 * x2, x1 * x2 + y1 * y2) / m * .55;
  const out = P.slice();
  let x = c[0], y = c[1];
  const k = Math.max(1, Math.round(len / st));
  for (let i = 0; i < k; i++) { ang += rate; x += Math.cos(ang) * st; y += Math.sin(ang) * st; out.push([x, y]); }
  return out;
}
const extendStart = (P, len, st) => extendEnd(P.slice().reverse(), len, st).reverse();
// Push a stroke sideways: its two ends by e0 and e1, and its middle by a bow.
function bend(P, e0, e1, bow) {
  const n = P.length;
  return P.map((p, i) => {
    const a = P[Math.max(i - 1, 0)], c = P[Math.min(i + 1, n - 1)];
    let nx = -(c[1] - a[1]), ny = c[0] - a[0];
    const l = Math.hypot(nx, ny) || 1;
    const u = i / (n - 1);
    const off = lerp(e0, e1, u) + bow * Math.sin(Math.PI * u);
    return [p[0] + nx / l * off, p[1] + ny / l * off];
  });
}

// A closed outline through the points, drawn as a hand draws it.
//   A shape with corners is a few strokes, each one starting somewhere on a corner's curve and running
//   past it or stopping short; a shape without (an egg, a face) is one loop that doesn't quite close,
//   drifting a little in or out where it overlaps itself, now and then gone round twice.
export function outline(g, pts, o = {}) {
  // On a dark page the film's graphite outlines are drawn in cream: the same pencil, the other paper.
  if (PAGE.dark && (o.col === '#2c2b36' || o.col === '#2b2a33')) o = { ...o, col: '#efe6cf' };
  const { seed = 1, w = 6.6 } = o;
  const st = Math.max(4, w * .7);
  const P = closedSamples(pts, st);
  const n = P.length;
  if (n < 8) return;
  const rand = rng(hash(seed, 900) * 1e6 + 7);
  const per = n * st;
  const base = clamp(per * .011, 4, 15) * kk(.6);
  const corners = findCorners(P, st);
  const draw = (path, j, extra = {}) => line(g, path, { ...o, spline: false, closed: false, over: 0, seed: seed * 7 + j * 13, taper: [.07, .16], skip: path.length * st > 300 ? .22 : 0, ...extra });
  if (corners.length >= 3) {
    // Most corners lift the pencil; the odd one is turned without lifting.
    let br = corners.filter((c, i) => i === 0 || rand() < .8);
    if (br.length < 2) br = corners.slice(0, 2);
    const arc = Math.max(2, Math.round(18 / st));
    br.forEach((a, j) => {
      const b = br[(j + 1) % br.length];
      const len = ((b - a + n) % n) || n;
      const room = Math.max(0, Math.floor(len / 2) - 2);
      // Each end starts and stops somewhere on the corner's curve: nearer the corner's tip, or well before it.
      const fa = Math.min(room, Math.round((.2 + rand() * .8) * arc)), fb = Math.min(room, Math.round((.2 + rand() * .8) * arc));
      const i0 = a + fa, i1 = a + len - fb;
      let path = [];
      for (let i = i0; i <= i1; i++) path.push(P[i % n]);
      if (path.length < 4) return;
      const endErr = () => { const r = rand(); return r < .62 ? base * (.4 + rand() * 1.1) : r < .87 ? -base * (.2 + rand() * .5) : 0; };
      const e0 = endErr(), e1 = endErr();
      if (e1) path = extendEnd(path, e1, st);
      if (e0) path = extendStart(path, e0, st);
      const sl = path.length * st;
      path = bend(path, (rand() - .5) * 5, (rand() - .5) * 5, (rand() - .5) * 2 * Math.min(sl * .02, 5));
      draw(path, j);
    });
    return;
  }
  // A loop: start anywhere, go round, run past the start (drifting in or out) or stop short.
  const cx = P.reduce((a, p) => a + p[0], 0) / n, cy = P.reduce((a, p) => a + p[1], 0) / n;
  const loop = (k0, ov, drift, fade) => {
    const ring = [...P.slice(k0), ...P.slice(0, k0)];
    let path = ring;
    if (ov > 0) {
      const extra = ring.slice(0, ov).map(([x, y], i) => {
        const dx = x - cx, dy = y - cy, l = Math.hypot(dx, dy) || 1, k = drift * (.3 + i / ov);
        return [x + dx / l * k, y + dy / l * k];
      });
      path = [...ring, ...extra];
    } else path = ring.slice(0, n + ov);
    return path;
  };
  const k0 = Math.floor(rand() * n);
  const ov = rand() < .8 ? Math.round(n * (.05 + rand() * .11)) : -Math.round(n * (.03 + rand() * .03));
  draw(loop(k0, ov, (rand() - .5) * Math.min(14, per * .04)), 0);
  // Gone round a second time, lighter, a little off.
  if (rand() < .3) draw(loop(Math.floor(rand() * n), Math.round(n * .04), (rand() - .5) * 8), 1, { w: w * .6, alpha: .5, passes: 1 });
}

// ---------------------------------------------------------------- colouring in
// The pencil's colouring, scribbled the way a child colours in: one back-and-forth stroke that never
// quite stays parallel, uneven in length and pressure. It runs past the outline in places and stops
// short in others, leaves white gaps, and there's no clip at the edge; a patch is gone over again,
// heavier, at another angle, where the child cared.
//   gap     spacing of the strokes         angle   general direction in radians     w   line width
//   spill   how far the strokes may wander past (or stop short of) the outline      dens   0..1 how much is covered
export function hatch(g, pts, o = {}) {
  const { col = '#d97757', seed = 1, t = 0, angle = -.9, gap = 6, w = 5.4, spill: spill0 = 5, alpha = .9, tooth = .58, dens = 1, prog = 1, cross = false, slop = 1 } = o;
  const spill = spill0 * (.5 + .5 * kk());
  const v = variant(t), bo = boil(t);
  const base = resample(pts, 10, true).p;
  // The colour is a little out of register with the line: shifted, and wandering more than the outline does.
  const mx = (hash(seed, 60) - .5) * 7 * slop * kk(), my = (hash(seed, 61) - .5) * 7 * slop * kk();
  const poly = wobble(base.map(([x, y]) => [x + mx, y + my]), seed + 401, 0, spill * .6, 55, 1.2, true);
  const b = bounds(poly);
  const pat = shift(g, grain(g, col, tooth), hash(seed, 5) * 128, hash(seed, 6) * 128);
  const A = g.globalAlpha;
  g.save();
  g.strokeStyle = pat;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  const layers = [{ a: angle, gap, w, al: alpha, dens }];
  if (cross) layers.push({ a: angle + 1.05, gap: gap * 1.3, w: w * .9, al: alpha * .75, dens: dens * .7 });
  // Gone over again at another angle, more lightly and in places, as a child shades: pressed harder where they cared.
  layers.push({ a: angle + .55 + hash(seed, 62) * .7, gap: gap * .8, w: w * 1.08, al: alpha * .5, dens: .42 });
  layers.forEach((L, li) => scribble(g, poly, L, rng(hash(seed, li, 77) * 1e6 + 1), spill, prog, A, hash(seed, li, 3) * 1000, v));
  g.restore();
}
// One layer of scribble over a polygon: rows across it, each row's stretch inside the polygon drawn as a
// stroke that overruns or falls short of the edge, consecutive rows joined into one zigzag until the
// pencil lifts.
function scribble(g, poly, L, rand, spill, prog, A, js, v) {
  // The strokes are decided once per shape; each drawing moves them by a hair (a pixel or two).
  const J = (r, k) => (hash(js, v, r, k) - .5) * 2.2;
  const ca = Math.cos(L.a), sa = Math.sin(L.a);
  const Q = poly.map(([x, y]) => [x * ca + y * sa, -x * sa + y * ca]);
  let wmin = 1e9, wmax = -1e9;
  for (const q of Q) { if (q[1] < wmin) wmin = q[1]; if (q[1] > wmax) wmax = q[1]; }
  const toXY = (u, wv) => [u * ca - wv * sa, u * sa + wv * ca];
  // The patch, as a circle in the strokes' frame.
  let pc = null;
  if (L.patch) { const c = L.patch; pc = [c[0] * ca + c[1] * sa, -c[0] * sa + c[1] * ca, c[2]]; }
  const rows = [];
  const off0 = rand() * L.gap;
  for (let wv = wmin + off0; wv <= wmax; wv += L.gap) {
    const wj = wv + (rand() - .5) * L.gap * .55;
    const xs = [];
    for (let i = 0; i < Q.length; i++) {
      const p = Q[i], q = Q[(i + 1) % Q.length];
      if ((p[1] <= wj) !== (q[1] <= wj)) xs.push(p[0] + (wj - p[1]) / (q[1] - p[1]) * (q[0] - p[0]));
    }
    xs.sort((m, n) => m - n);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      let a = xs[k], b = xs[k + 1];
      if (pc) {
        const dv = wj - pc[1];
        if (Math.abs(dv) >= pc[2]) continue;
        const h = Math.sqrt(pc[2] * pc[2] - dv * dv);
        a = Math.max(a, pc[0] - h); b = Math.min(b, pc[0] + h);
      }
      if (b - a > 4) rows.push({ w: wj, a, b, k, r: rows.length });
    }
  }
  const N = Math.ceil(rows.length * prog);
  const groups = [[], [], []];
  let dir = 1, chain = null, prev = null, gi = 0;
  const flush = () => { if (chain && chain.length) groups[gi].push(chain); chain = null; };
  for (let r = 0; r < N; r++) {
    const R = rows[r];
    if (rand() > L.dens) { flush(); prev = null; continue; }
    // The stroke's ends: some overshoot the edge, some fall short of it.
    const ea = spill * (rand() * 1.5 - .5), eb = spill * (rand() * 1.5 - .5);
    let s0 = R.a - ea, s1 = R.b + eb;
    if (s1 - s0 < 3) { flush(); prev = null; continue; }
    if (dir < 0) [s0, s1] = [s1, s0];
    const p0 = [s0 + J(r, 1), R.w + (rand() - .5) * L.gap * .9 + J(r, 2)], p1 = [s1 + J(r, 3), R.w + (rand() - .5) * L.gap * .9 + J(r, 4)];
    const bow = (rand() - .5) * L.gap * .8;
    const joined = prev && prev.r === R.r - 1 && prev.k === R.k && rand() > .1;
    if (!joined) { flush(); chain = []; gi = Math.floor(rand() * 3); }
    chain.push({ p0, p1, bow });
    prev = R; dir = -dir;
  }
  flush();
  groups.forEach((G, k) => {
    if (!G.length) return;
    g.globalAlpha = A * L.al * (.62 + k * .19);
    g.lineWidth = L.w * (.85 + k * .12);
    g.beginPath();
    for (const ch of G) {
      ch.forEach((s, i) => {
        const P0 = toXY(s.p0[0], s.p0[1]), P1 = toXY(s.p1[0], s.p1[1]);
        const C = toXY((s.p0[0] + s.p1[0]) / 2, (s.p0[1] + s.p1[1]) / 2 + s.bow);
        if (i === 0) g.moveTo(P0[0], P0[1]); else g.lineTo(P0[0], P0[1]);
        g.quadraticCurveTo(C[0], C[1], P1[0], P1[1]);
      });
    }
    g.stroke();
  });
}

// A pale wash under the colouring, so the paper doesn't show through a coloured area completely.
export function wash(g, pts, col, a = .22, seed = 1, t = 0) {
  const v = variant(t);
  const poly = wobble(resample(pts, 12, true).p, seed + 903, 0, 3, 60, 1, true);
  g.save();
  g.fillStyle = rgba(col, a * (.7 + hash(seed, 66) * .5));
  g.beginPath();
  poly.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y));
  g.closePath();
  g.fill();
  g.restore();
}

// The part of a polygon at or below y = cut.
function clipBelow(P, cut) {
  const out = [];
  const n = P.length;
  for (let i = 0; i < n; i++) {
    const a = P[i], b = P[(i + 1) % n];
    const ia = a[1] >= cut, ib = b[1] >= cut;
    if (ia) out.push(a);
    if (ia !== ib) { const u = (cut - a[1]) / (b[1] - a[1]); out.push([a[0] + (b[0] - a[0]) * u, cut]); }
  }
  return out;
}

// Paper-coloured ground for a shape to be drawn on, so lines and colour drawn earlier don't show through it.
function knockOut(g, P) {
  const m = g.getTransform();
  const c = bounds(P);
  const k0 = g.canvas.width / 1080;
  const px = (m.a * c.cx + m.c * c.cy + m.e) / k0, py = (m.b * c.cx + m.d * c.cy + m.f) / k0;
  g.save();
  g.fillStyle = pageTone(px, py);
  g.beginPath();
  P.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y));
  g.closePath();
  g.fill();
  g.restore();
}

// A coloured shape: wash, scribbled colour, an optional shade, and the sketched outline on top.
//   fill / shade / line: colours     lw: outline width     open: don't close the outline
export function blob(g, pts, o = {}) {
  const { fill, shade, line: lc = '#2b2a33', lw = 6.6, seed = 1, t = 0, gap = 6.2, hw = 5.6, angle = -.9, tone = .3, dens = 1, sh = .38, solid = true } = o;
  const P = spline(pts, true, 8);
  // A drawn shape is opaque: what was drawn beneath it doesn't show through the gaps in its colour.
  if (fill && solid) knockOut(g, P);
  if (fill === 'paper') { if (lc && lw) outline(g, pts, { col: lc, w: lw, seed: seed + 11, t, alpha: .86, tooth: .55 }); return; }
  if (fill) { wash(g, P, fill, tone * .55, seed, t); hatch(g, P, { col: fill, seed, t, gap, w: hw, angle: angle + (hash(seed, 64) - .5) * .7, dens: dens * (.9 + hash(seed, 65) * .1) }); }
  if (shade) {
    // The shade: a second, darker scribble across the lower part of the shape, its top edge the ragged ends of strokes.
    const b = bounds(P);
    const cut = b.y1 - b.h * sh + (hash(seed, 67) - .5) * b.h * .08;
    // Its top edge wanders: it was never ruled.
    const low = clipBelow(P, cut);
    const ragged = low.length > 3 ? resample(low, 10, true).p.map(([x, y]) => Math.abs(y - cut) < .6 ? [x, y + b.h * .09 * noise(x / 70, seed + 3)] : [x, y]) : low;
    if (ragged.length > 3) hatch(g, ragged, { col: shade, seed: seed + 5, t, gap: gap * 1.1, w: hw * .9, angle: angle + .55, alpha: .6, spill: 9 });
  }
  if (lc && lw) outline(g, pts, { col: lc, w: lw, seed: seed + 11, t, alpha: .86, tooth: .55 });
}

// A dot or a small filled scribble (an eye, a nose): a few tight strokes round a centre; a big one is
// scribbled dark like any other colouring.
export function dot(g, x, y, r, o = {}) {
  const { col = '#2b2a33', seed = 1, t = 0, alpha = .95 } = o;
  const v = variant(t);
  const pts = [];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + hash(seed, v, i) * .5;
    const rr = r * (0.86 + .28 * hash(seed, v, i + 40));
    pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * .96]);
  }
  const P = spline(pts, true, 5);
  if (r >= 10) {
    g.save(); g.globalAlpha *= alpha;
    // Scribbled solid: two passes at different angles, so no paper shows through.
    const gp = Math.max(2.6, r * .13), wd = Math.max(5, r * .3);
    hatch(g, P, { col, seed: seed + 3, t, gap: gp, w: wd, spill: r * .04, alpha: 1, tooth: .8, angle: -.9 + (hash(seed, 5) - .5) * 1.4, slop: 0 });
    hatch(g, P, { col, seed: seed + 4, t, gap: gp * 1.1, w: wd, spill: r * .04, alpha: .9, tooth: .8, angle: .5 + (hash(seed, 6) - .5) * 1.2, slop: 0 });
    g.restore();
    return;
  }
  g.save();
  g.fillStyle = shift(g, grain(g, col, .8), hash(seed, 9) * 128, hash(seed, 10) * 128);
  g.globalAlpha *= alpha;
  g.beginPath(); P.forEach(([px, py], i) => i ? g.lineTo(px, py) : g.moveTo(px, py)); g.closePath(); g.fill();
  g.restore();
}

// A big loose crayon scribble over a region, for washes of colour behind a scene: broad, faint,
// sweeping strokes that don't try to stay in the lines, with a ragged edge where the child stopped.
export function scrub(g, box, o = {}) {
  const { col = '#9ccb3b', seed = 1, t = 0, gap = 22, w = 26, alpha = .34, angle = -.35, wig = 30 } = o;
  const v = variant(t);
  const [x0, y0, x1, y1] = box;
  const pat = shift(g, grain(g, col, .42), hash(seed, 3) * 128, hash(seed, 4) * 128);
  g.save();
  // A ragged edge: the region's outline wanders by a hand's width, slowly (a soft edge, not a saw).
  const edge = [];
  const N = 64;
  for (let i = 0; i <= N; i++) edge.push([x0 + (x1 - x0) * i / N, y0 + 26 * noise(i * .11, seed) + 8 * noise(i * .37, seed + 4)]);
  for (let i = 0; i <= N; i++) edge.push([x1 - (x1 - x0) * i / N, y1 + 26 * noise(i * .12 + 9, seed + 1) + 8 * noise(i * .41, seed + 5)]);
  g.beginPath();
  edge.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y));
  g.closePath();
  g.clip();
  g.strokeStyle = pat; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round';
  g.globalAlpha *= alpha;
  const ca = Math.cos(angle), sa = Math.sin(angle);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + 40;
  const rand = rng(hash(seed, 8) * 1e6 + 3);
  g.beginPath();
  let dir = 1;
  const n = Math.ceil(2 * R / gap);
  for (let i = 0; i < n; i++) {
    if (rand() < .08) { dir = -dir; continue; }
    const off = -R + i * gap + (rand() - .5) * gap * .9;
    const e = R * (.9 + rand() * .15);
    const tl = (rand() - .5) * .25, c2 = Math.cos(angle + tl), s2 = Math.sin(angle + tl);
    const ax = cx + c2 * (-e * dir) - s2 * off, ay = cy + s2 * (-e * dir) + c2 * off;
    const bx = cx + c2 * (e * dir) - s2 * (off + gap * .6), by = cy + s2 * (e * dir) + c2 * (off + gap * .6);
    g.moveTo(ax, ay);
    g.quadraticCurveTo((ax + bx) / 2 + (rand() - .5) * wig, (ay + by) / 2 + (rand() - .5) * wig, bx, by);
    dir = -dir;
  }
  g.stroke();
  g.restore();
}
