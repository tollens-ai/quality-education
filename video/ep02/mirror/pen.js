// The G-pen: the hand in this film's line. Every outline is a run of tapered strokes, thick in
// the middle and sharp at both ends, broken where a real inker would lift the pen at a corner,
// overshooting a little, and redrawn on twos so the line boils. Fills are flat cel colour with
// one hard-edged shadow tone and a rim of the scene's light. There is no texture over anything.
import { C, TAU, clamp, lerp, noise, hash, rng, twos } from './kit.js';

// ---------------------------------------------------------------- paths
// A path is a list of subpaths, each a list of points (sampled curves) and a closed flag, so
// the same geometry can be filled, clipped and inked.
export class Pth {
  constructor() { this.subs = []; this.cur = null; }
  M(x, y) { this.cur = { pts: [[x, y]], closed: false }; this.subs.push(this.cur); return this; }
  L(x, y) { this.cur.pts.push([x, y]); return this; }
  Q(cx, cy, x, y) {
    const [x0, y0] = this.cur.pts[this.cur.pts.length - 1];
    const n = Math.max(4, Math.ceil((Math.hypot(cx - x0, cy - y0) + Math.hypot(x - cx, y - cy)) / 7));
    for (let i = 1; i <= n; i++) {
      const u = i / n, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u;
      this.cur.pts.push([a * x0 + b * cx + c * x, a * y0 + b * cy + c * y]);
    }
    return this;
  }
  C(c1x, c1y, c2x, c2y, x, y) {
    const [x0, y0] = this.cur.pts[this.cur.pts.length - 1];
    const len = Math.hypot(c1x - x0, c1y - y0) + Math.hypot(c2x - c1x, c2y - c1y) + Math.hypot(x - c2x, y - c2y);
    const n = Math.max(5, Math.ceil(len / 7));
    for (let i = 1; i <= n; i++) {
      const u = i / n, v = 1 - u;
      this.cur.pts.push([v * v * v * x0 + 3 * v * v * u * c1x + 3 * v * u * u * c2x + u * u * u * x,
        v * v * v * y0 + 3 * v * v * u * c1y + 3 * v * u * u * c2y + u * u * u * y]);
    }
    return this;
  }
  A(cx, cy, rx, ry, a0, a1) {
    const n = Math.max(6, Math.ceil(Math.abs(a1 - a0) * Math.max(rx, ry) / 7));
    for (let i = 0; i <= n; i++) {
      const a = lerp(a0, a1, i / n);
      const p = [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
      if (!this.cur) this.M(...p); else this.cur.pts.push(p);
    }
    return this;
  }
  Z() { this.cur.closed = true; return this; }
  // Catmull-Rom through points, for organic shapes (hair, cloth).
  S(pts, closed = true, k = .5) {
    const P = pts, n = P.length;
    const get = i => closed ? P[(i + n) % n] : P[Math.max(0, Math.min(n - 1, i))];
    this.M(...P[0]);
    const segs = closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
      const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
      const c1 = [p1[0] + (p2[0] - p0[0]) * k / 3, p1[1] + (p2[1] - p0[1]) * k / 3];
      const c2 = [p2[0] - (p3[0] - p1[0]) * k / 3, p2[1] - (p3[1] - p1[1]) * k / 3];
      this.C(c1[0], c1[1], c2[0], c2[1], p2[0], p2[1]);
    }
    if (closed) { this.cur.pts.pop(); this.Z(); }
    return this;
  }
  poly(pts, closed = true) { this.M(...pts[0]); for (let i = 1; i < pts.length; i++) this.L(...pts[i]); if (closed) this.Z(); return this; }
  rect(x, y, w, h) { return this.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]); }
  ell(cx, cy, rx, ry) { this.cur = null; this.A(cx, cy, rx, ry, 0, TAU); this.cur.pts.pop(); return this.Z(); }
  add(p) { this.subs.push(...p.subs); return this; }
  // A copy moved, turned and scaled about the origin.
  map(f) {
    const q = new Pth();
    for (const s of this.subs) q.subs.push({ pts: s.pts.map(p => f(p[0], p[1])), closed: s.closed });
    return q;
  }
  shift(dx, dy) { return this.map((x, y) => [x + dx, y + dy]); }
  trace(g) {
    g.beginPath();
    for (const s of this.subs) {
      g.moveTo(s.pts[0][0], s.pts[0][1]);
      for (let i = 1; i < s.pts.length; i++) g.lineTo(s.pts[i][0], s.pts[i][1]);
      if (s.closed) g.closePath();
    }
  }
  bounds() {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const s of this.subs) for (const [x, y] of s.pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    return [x0, y0, x1, y1];
  }
}
export const P = () => new Pth();

// The size of one master pixel in current device units (strokes are specified in master pixels
// on screen, so a small figure and a big one boil alike).
function pxScale(g) {
  const m = g.getTransform();
  return Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) / (g.canvas.width / 1080);
}

// ---------------------------------------------------------------- the stroke
// One G-pen stroke along a polyline. w is the full width in local units; taper [in, out] are the
// fractions of the length over which it swells from a point and thins back to one.
export function gpen(g, pts, w, o = {}) {
  if (pts.length < 2 || w <= 0) return;
  const k = pxScale(g) || 1;
  const step = 2.4 / k;
  // Resample by arc length.
  const R = [pts[0]];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    const d = Math.hypot(bx - ax, by - ay);
    if (d < 1e-6) continue;
    let s = step - acc;
    while (s <= d) { R.push([ax + (bx - ax) * s / d, ay + (by - ay) * s / d]); s += step; }
    acc = d - (s - step);
  }
  const lastP = pts[pts.length - 1];
  if (Math.hypot(lastP[0] - R[R.length - 1][0], lastP[1] - R[R.length - 1][1]) > step * .3) R.push(lastP);
  const n = R.length;
  if (n < 2) return;
  const L = (n - 1) * step;
  const [ti, to] = o.taper || [.14, .32];
  const seed = (o.seed ?? 1) + (o.boil === false ? 0 : twos(o.t ?? 0) * 13.7);
  const wob = (o.wobble ?? .7) / k, pres = o.pressure ?? .14;
  const left = [], right = [];
  for (let i = 0; i < n; i++) {
    const a = R[Math.max(0, i - 1)], b = R[Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    const nx = -ty, ny = tx;
    const s = i * step, u = n > 1 ? i / (n - 1) : 0;
    let prof = 1;
    if (ti > 0 && u < ti) prof = Math.sin(u / ti * Math.PI / 2);
    if (to > 0 && u > 1 - to) prof = Math.min(prof, Math.sin((1 - u) / to * Math.PI / 2));
    prof = Math.pow(Math.max(0, prof), .8);
    const hw = w / 2 * prof * (1 + pres * noise(s * k * .018, seed));
    const off = wob * noise(s * k * .03, seed * 3.1 + 7);
    const cx = R[i][0] + nx * off, cy = R[i][1] + ny * off;
    left.push([cx + nx * hw, cy + ny * hw]);
    right.push([cx - nx * hw, cy - ny * hw]);
  }
  g.beginPath();
  g.moveTo(left[0][0], left[0][1]);
  for (let i = 1; i < n; i++) g.lineTo(left[i][0], left[i][1]);
  for (let i = n - 1; i >= 0; i--) g.lineTo(right[i][0], right[i][1]);
  g.closePath();
  g.fillStyle = o.col || C.ink;
  g.fill();
}

// Split a subpath into pen strokes at its corners, each running a little past the corner.
function strokesOf(sub, o) {
  const pts = sub.pts, n = pts.length;
  if (n < 2) return [];
  const turn = o.corner ?? 0.9; // radians of turn that make a corner
  const cuts = [];
  for (let i = 1; i < n - (sub.closed ? 0 : 1); i++) {
    const a = pts[(i - 1 + n) % n], b = pts[i], c = pts[(i + 1) % n];
    const a1 = Math.atan2(b[1] - a[1], b[0] - a[0]), a2 = Math.atan2(c[1] - b[1], c[0] - b[0]);
    let d = Math.abs(a2 - a1); if (d > Math.PI) d = TAU - d;
    if (d > turn) cuts.push(i);
  }
  let runs = [];
  if (sub.closed) {
    const ring = [...pts, pts[0]];
    if (!cuts.length) {
      // A smooth loop: two or three strokes that overlap where they meet.
      const m = Math.max(2, Math.min(3, Math.round(n / 40)));
      const s0 = Math.floor(hash(n, o.seed ?? 0) * n);
      for (let j = 0; j < m; j++) {
        const a = s0 + Math.floor(j * n / m), b = s0 + Math.floor((j + 1) * n / m) + 2;
        const run = [];
        for (let i = a; i <= b; i++) run.push(pts[i % n]);
        runs.push(run);
      }
      return runs;
    }
    for (let j = 0; j < cuts.length; j++) {
      const a = cuts[j], b = cuts[(j + 1) % cuts.length];
      const run = [];
      for (let i = a; i !== b; i = (i + 1) % n) run.push(pts[i]);
      run.push(pts[b]);
      runs.push(run);
    }
    void ring;
  } else {
    let a = 0;
    for (const c of cuts) { runs.push(pts.slice(a, c + 1)); a = c; }
    runs.push(pts.slice(a));
  }
  return runs.filter(r => r.length > 1);
}
function extend(run, over) {
  if (over <= 0 || run.length < 2) return run;
  const [a, b] = [run[0], run[1]], [y, z] = [run[run.length - 2], run[run.length - 1]];
  const d1 = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, d2 = Math.hypot(z[0] - y[0], z[1] - y[1]) || 1;
  return [[a[0] + (a[0] - b[0]) / d1 * over, a[1] + (a[1] - b[1]) / d1 * over], ...run,
    [z[0] + (z[0] - y[0]) / d2 * over, z[1] + (z[1] - y[1]) / d2 * over]];
}

// Ink a path's outline. w: line width (local units).
export function outline(g, p, w, o = {}) {
  let k = 0;
  for (const sub of p.subs) {
    for (const run of strokesOf(sub, o)) {
      k++;
      gpen(g, extend(run, o.over ?? w * .9), w * (o.vary ? lerp(.8, 1.15, hash(k, o.seed ?? 0)) : 1),
        { ...o, seed: (o.seed ?? 0) + k * 1.37, taper: o.taper || [.1, .22] });
    }
  }
}

// Fill a path with flat colour, shade it, rim it and ink it.
//   o.fill      base colour
//   o.shade     { dx, dy, col } a shadow tone on the side away from the light: the part not
//               covered by a copy of itself moved toward the light by (dx, dy)
//   o.rim       { dx, dy, col } a thin crescent of the scene's light on the far edge
//   o.hatch     { ang, gap, w, col } pen hatching inside the shadow tone
//   o.line      outline width; 0 for none. o.col the ink colour.
export function ink(g, p, o = {}) {
  if (o.fill) { p.trace(g); g.fillStyle = o.fill; g.fill('evenodd'); }
  if (o.shade || o.rim || o.hatch) {
    g.save();
    p.trace(g); g.clip('evenodd');
    for (const key of ['shade', 'rim']) {
      const s = o[key];
      if (!s) continue;
      g.save();
      // Region = part minus (part moved by d): fill the part, then cut out the moved copy.
      const moved = p.shift(s.dx, s.dy);
      g.beginPath();
      const [x0, y0, x1, y1] = p.bounds();
      g.rect(x0 - 50, y0 - 50, x1 - x0 + 100, y1 - y0 + 100);
      for (const sub of moved.subs) {
        g.moveTo(sub.pts[0][0], sub.pts[0][1]);
        for (let i = 1; i < sub.pts.length; i++) g.lineTo(sub.pts[i][0], sub.pts[i][1]);
        g.closePath();
      }
      g.clip('evenodd');
      if (key === 'shade' && o.hatch) {
        const h = o.hatch;
        hatchRect(g, x0 - 20, y0 - 20, x1 - x0 + 40, y1 - y0 + 40, h.ang ?? .9, h.gap ?? 9, h.w ?? 2, h.col || C.ink, o.seed ?? 0, o.t);
      } else {
        g.fillStyle = s.col;
        g.fillRect(x0 - 50, y0 - 50, x1 - x0 + 100, y1 - y0 + 100);
      }
      g.restore();
    }
    g.restore();
  }
  if (o.line !== 0) outline(g, p, o.line ?? 4, { col: o.col, seed: o.seed, t: o.t, corner: o.corner, over: o.over, vary: o.vary, wobble: o.wobble });
}

// Parallel pen strokes filling a rectangle (clip first to shape them).
export function hatchRect(g, x, y, w, h, ang, gap, lw, col, seed = 0, t = 0) {
  const cx = x + w / 2, cy = y + h / 2, R = Math.hypot(w, h) / 2 + gap;
  const ca = Math.cos(ang), sa = Math.sin(ang);
  let i = 0;
  for (let d = -R; d <= R; d += gap) {
    i++;
    const jit = (hash(i, seed) - .5) * gap * .5;
    const l0 = -R * lerp(.7, 1, hash(i, seed + 1)), l1 = R * lerp(.7, 1, hash(i, seed + 2));
    const px = cx - sa * (d + jit), py = cy + ca * (d + jit);
    gpen(g, [[px + ca * l0, py + sa * l0], [px + ca * l1, py + sa * l1]], lw * lerp(.7, 1.2, hash(i, seed + 3)),
      { col, seed: seed + i, t, taper: [.3, .4], wobble: .5 });
  }
}

// Manga focus lines: tapered strokes pointing at (cx, cy), from radius r0 out past r1.
export function focusLines(g, cx, cy, r0, r1, n, o = {}) {
  const R = rng((o.seed ?? 1) + twos(o.t ?? 0) * 3);
  for (let i = 0; i < n; i++) {
    const a = R() * TAU, ra = r0 * lerp(.9, 1.4, R()), rb = r1 * lerp(1, 1.3, R());
    const w = (o.w ?? 6) * lerp(.4, 1.3, R());
    gpen(g, [[cx + Math.cos(a) * rb, cy + Math.sin(a) * rb], [cx + Math.cos(a) * ra, cy + Math.sin(a) * ra]], w,
      { col: o.col || C.ink, taper: [.05, .95], wobble: 0, boil: false, seed: i });
  }
}

// ---------------------------------------------------------------- glass
// A crack: jagged rays from an impact point, joined by rings of short chords, like a stone
// through a window. Returns { rays: [[pt...]], rings: [[a, b]...] } in local units.
export function crackShape(seed, x, y, r, n = 9) {
  const R = rng(seed);
  const rays = [];
  const a0 = R() * TAU;
  for (let i = 0; i < n; i++) {
    const a = a0 + i / n * TAU + (R() - .5) * .5;
    const len = r * lerp(.55, 1.15, R());
    const pts = [[x, y]];
    let ang = a, d = 0;
    while (d < len) {
      d += lerp(12, 34, R()) * r / 300;
      ang += (R() - .5) * .35;
      pts.push([x + Math.cos(ang) * d, y + Math.sin(ang) * d]);
    }
    rays.push(pts);
  }
  const rings = [];
  for (const f of [.18, .34, .55]) {
    for (let i = 0; i < n; i++) {
      if (R() < .3) continue;
      const A_ = rays[i], B_ = rays[(i + 1) % n];
      const ia = Math.min(A_.length - 1, Math.floor(A_.length * lerp(f * .8, f * 1.2, R())));
      const ib = Math.min(B_.length - 1, Math.floor(B_.length * lerp(f * .8, f * 1.2, R())));
      rings.push([A_[ia], B_[ib]]);
    }
  }
  return { rays, rings, x, y, r };
}
// Draw a crack grown to p (0..1): rays grow outward, rings follow.
export function drawCrack(g, ck, p, o = {}) {
  const w = o.w ?? 3.2;
  for (const ray of ck.rays) {
    const n = Math.max(2, Math.ceil(ray.length * clamp(p * 1.2)));
    const pts = ray.slice(0, n);
    if (o.dark !== false) gpen(g, pts.map(([x, y]) => [x + 1.5, y + 1.5]), w * 1.4, { col: o.dark || 'rgba(0,0,0,.55)', taper: [.02, .7], wobble: .2, boil: false });
    gpen(g, pts, w, { col: o.col || C.bone, taper: [.02, .7], wobble: .3, boil: false });
  }
  if (p > .45) {
    const q = clamp((p - .45) / .5);
    ck.rings.forEach(([a, b], i) => {
      if (i / ck.rings.length > q) return;
      gpen(g, [a, [lerp(a[0], b[0], .5) + (hash(i) - .5) * 6, lerp(a[1], b[1], .5) + (hash(i, 2) - .5) * 6], b], w * .6,
        { col: o.col || C.bone, taper: [.2, .2], wobble: .2, boil: false });
    });
  }
}

// Shards: cut a rectangle into pieces along a crack's rays and rings (a polar grid around the
// impact), each with its centre, for shattering.
export function shards(seed, x0, y0, w, h, cx, cy, n = 12, rings = 4) {
  const R = rng(seed);
  const maxR = Math.hypot(Math.max(cx - x0, x0 + w - cx), Math.max(cy - y0, y0 + h - cy)) * 1.05;
  const angs = [];
  const a0 = R() * TAU;
  for (let i = 0; i < n; i++) angs.push(a0 + (i + (R() - .5) * .6) / n * TAU);
  const rads = [0];
  for (let j = 1; j <= rings; j++) rads.push(maxR * Math.pow(j / rings, 1.35) * lerp(.9, 1.1, R()));
  const pt = (i, j) => {
    const a = angs[i % n] + (j ? (hash(i % n, j, seed) - .5) * .12 : 0), r = rads[j];
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };
  const out = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < rings; j++) {
      const poly = j === 0 ? [pt(i, 0), pt(i, 1), pt(i + 1, 1)] : [pt(i, j), pt(i, j + 1), pt(i + 1, j + 1), pt(i + 1, j)];
      const c = poly.reduce((s, p) => [s[0] + p[0] / poly.length, s[1] + p[1] / poly.length], [0, 0]);
      if (c[0] < x0 - 40 || c[0] > x0 + w + 40 || c[1] < y0 - 40 || c[1] > y0 + h + 40) continue;
      out.push({ poly, c, r: Math.hypot(c[0] - cx, c[1] - cy), seed: hash(i, j, seed) });
    }
  }
  return out;
}

// A glint on glass: two or three parallel diagonal strokes, the cartoon sign for a pane.
export function glint(g, x, y, s, o = {}) {
  const a = o.ang ?? -.9, ca = Math.cos(a), sa = Math.sin(a);
  [[0, 1], [s * .28, .55], [s * .45, .3]].forEach(([d, f], i) => {
    const px = x + -sa * d, py = y + ca * d, L = s * f;
    gpen(g, [[px - ca * L / 2, py - sa * L / 2], [px + ca * L / 2, py + sa * L / 2]], (o.w ?? s * .07) * (i ? .6 : 1),
      { col: o.col || 'rgba(238,232,220,.8)', taper: [.4, .4], wobble: 0, boil: false });
  });
}

// A hard offset shadow: fill the path moved by (dx, dy). No blur anywhere in this film.
export function drop(g, p, dx, dy, col) {
  p.shift(dx, dy).trace(g);
  g.fillStyle = col;
  g.fill('evenodd');
}
