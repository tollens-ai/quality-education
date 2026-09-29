// Outline generators for the pencil: ellipses, rectangles, beans, stars and scallops as lists of
// control points, drawn the way a child draws them and not the way a program does. A child's circle is a
// lumpy, lopsided egg; a child's box has bowed sides, uneven corners and runs a little off the square.
// Every shape here gets a persistent character from its size (so it is the same shape however it is
// moved) or from a seed you pass (so four legs of one size aren't four copies), and it morphs a little
// between the boil's versions, so its lumps shift as it is redrawn.
import { TAU, hash, noise2, NOW, variant, kk } from './kit.js';

const vv = () => variant(NOW.t);
// Push points about by a slow noise field, measured from the shape's own centre (so it doesn't
// shimmer when the shape moves): the way a hand bows an edge or fattens a corner.
export function warp(pts, cx, cy, seed, amp, lam) {
  const v = vv();
  const ox = hash(seed, 1) * 40, oy = hash(seed, 2) * 40;
  return pts.map(([x, y]) => {
    const u = (x - cx) / lam + ox + v * .34, w = (y - cy) / lam + oy - v * .29;
    return [x + amp * kk() * noise2(u, w, seed), y + amp * kk() * noise2(u + 17.3, w + 9.1, seed + 3)];
  });
}
// A shape's own slant and spin, fixed by its seed.
function skew(pts, cx, cy, seed, k = 1) {
  const sh = (hash(seed, 5) - .5) * .12 * k * kk(), rot = (hash(seed, 6) - .5) * .06 * k * kk();
  const c = Math.cos(rot), s = Math.sin(rot);
  return pts.map(([x, y]) => {
    const dx = x - cx, dy = y - cy;
    const X = dx + dy * sh, Y = dy;
    return [cx + X * c - Y * s, cy + X * s + Y * c];
  });
}
const key = (...n) => hash(...n.map(v => Math.round(v)));

// A lumpy egg, not an ellipse.
export function ellipse(cx, cy, rx, ry, n = 12, rot = 0, seed) {
  seed = seed ?? key(rx, ry, 17);
  const v = vv();
  const M = Math.max(16, n * 2);
  const a1 = (.04 + hash(seed, 1) * .06) * kk(), a2 = (.03 + hash(seed, 3) * .05) * kk(), a3 = (.015 + hash(seed, 5) * .03) * kk();
  const p1 = hash(seed, 2) * TAU, p2 = hash(seed, 4) * TAU, p3 = hash(seed, 6) * TAU;
  const start = hash(seed, 10) * TAU;
  const tilt = (hash(seed, 9) - .5) * .4 * kk() + rot;
  const c = Math.cos(tilt), s = Math.sin(tilt);
  const pts = [];
  for (let i = 0; i < M; i++) {
    const a = start + i / M * TAU;
    const k = 1 + a1 * Math.sin(a + p1 + v * .5) + a2 * Math.sin(2 * a + p2 - v * .4) + a3 * Math.sin(3 * a + p3 + v * .7);
    const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k;
    pts.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return pts;
}

// A rounded polygon through corner points, each corner rounded by its own radius (a quadratic through the corner).
export function roundPoly(V, R, n = 3) {
  const m = V.length, pts = [];
  for (let i = 0; i < m; i++) {
    const p = V[(i + m - 1) % m], c = V[i], q = V[(i + 1) % m];
    const a = Math.hypot(p[0] - c[0], p[1] - c[1]) || 1, b = Math.hypot(q[0] - c[0], q[1] - c[1]) || 1;
    const r = Math.min(R[i], a * .48, b * .48);
    const A = [c[0] + (p[0] - c[0]) / a * r, c[1] + (p[1] - c[1]) / a * r], B = [c[0] + (q[0] - c[0]) / b * r, c[1] + (q[1] - c[1]) / b * r];
    for (let k = 0; k <= n; k++) {
      const u = k / n, w = 1 - u;
      pts.push([w * w * A[0] + 2 * w * u * c[0] + u * u * B[0], w * w * A[1] + 2 * w * u * c[1] + u * u * B[1]]);
    }
    // A point part-way along the next side, pushed off the straight, so no side is quite straight.
    pts.push([(B[0] + q[0]) / 2, (B[1] + q[1]) / 2]);
  }
  return pts;
}

// A wonky box: the four corners not quite where a rectangle would put them, bowed sides, corners of
// different roundness, a slight slant. `wonk` scales the whole effect (0 for a true rectangle).
export function rrect(cx, cy, w, h, r = 20, n = 3, seed, wonk = 1) {
  seed = seed ?? key(w, h, r, 29);
  const m = Math.min(w, h);
  const j = m * .045 * wonk * kk();
  const jit = i => [(hash(seed, 60 + i) - .5) * 2 * j, (hash(seed, 70 + i) - .5) * 2 * j];
  const C = [[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]].map((p, i) => { const d = jit(i); return [p[0] + d[0], p[1] + d[1]]; });
  const rr = C.map((_, i) => r * (.6 + hash(seed, 40 + i) * .9));
  const pts = roundPoly(C, rr.map(v => Math.min(v, w / 2, h / 2)), n);
  return skew(warp(pts, cx, cy, seed, m * .045 * wonk, m * .9), cx, cy, seed, wonk);
}

// A limb: a tapered sausage from a to b, half-width r0 at a and r1 at b, lumpy.
export function capsule(a, b, r0, r1 = r0, n = 5, seed = 1) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const pts = [];
  for (let i = 0; i <= n; i++) { const t = ang - Math.PI / 2 + i / n * Math.PI; pts.push([b[0] + Math.cos(t) * r1, b[1] + Math.sin(t) * r1]); }
  for (let i = 0; i <= n; i++) { const t = ang + Math.PI / 2 + i / n * Math.PI; pts.push([a[0] + Math.cos(t) * r0, a[1] + Math.sin(t) * r0]); }
  const cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2;
  return warp(pts, cx, cy, seed, Math.max(r0, r1) * .16, 70);
}

// A bean: a body, lumpy and a little pinched.
export function bean(cx, cy, w, h, pinch = .12, n = 14, lean = 0, seed) {
  seed = seed ?? key(w, h, 31);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU;
    const x = Math.cos(a) * w / 2, y = Math.sin(a) * h / 2;
    pts.push([cx + x + Math.sin(a) * lean, cy + y * (1 - pinch * Math.cos(a * 2) * .5)]);
  }
  return skew(warp(pts, cx, cy, seed, Math.min(w, h) * .07, Math.min(w, h) * .9), cx, cy, seed);
}
export function star(cx, cy, r0, r1, n = 5, rot = -Math.PI / 2, seed) {
  seed = seed ?? key(r0, r1, n, 37);
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = rot + i / (n * 2) * TAU, r = (i % 2 ? r1 : r0) * (.86 + hash(seed, i) * .28);
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}
// Scalloped circle (a flower, a poodle's pom-pom, a rosette's frill): uneven frills.
export function scallop(cx, cy, r, bumps = 10, depth = .14, rot = 0, seed) {
  seed = seed ?? key(r, bumps, 41);
  const pts = [];
  for (let i = 0; i < bumps * 2; i++) {
    const a = rot + i / (bumps * 2) * TAU;
    const rr = (i % 2 ? r * (1 - depth) : r) * (.9 + hash(seed, i) * .2);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return skew(warp(pts, cx, cy, seed, r * .05, r * .9), cx, cy, seed, .6);
}
export const move = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]);
export const scale = (pts, sx, sy = sx, cx = 0, cy = 0) => pts.map(([x, y]) => [cx + (x - cx) * sx, cy + (y - cy) * sy]);
export const rotate = (pts, a, cx = 0, cy = 0) => { const c = Math.cos(a), s = Math.sin(a); return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]); };
