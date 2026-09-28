// Drawing a Clawd by hand over his 3D pose. The box is projected (so he sits right in the room
// from any angle), but what's drawn is an illustration: a silhouette with softened corners, each
// face painted with its light, a hand-inked outline that swells on the shadow side, hatching and
// grain in the shade, and a rim of light along the edges that face it.
import { clamp, lerp, hash, mix, rgba, noise } from './kit.js';
import { ap, apn, project, dot, norm, vsub, vadd, vmul, inkTone, LIGHT, M, T } from './space.js';
import { hatch, INK, boil } from './ink.js';

// Convex hull of screen points (monotone chain).
export function hull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  up.pop(); lo.pop();
  return lo.concat(up);
}

// A closed path through pts with each corner rounded by up to r px (quadratic at the corner).
export function roundPath(g, pts, r, wob = 0, seed = 0) {
  const n = pts.length;
  const J = (i, k) => wob ? (hash(i, seed, k) - .5) * wob : 0;
  const P = pts.map((p, i) => [p[0] + J(i, 1), p[1] + J(i, 2)]);
  for (let i = 0; i < n; i++) {
    const a = P[(i + n - 1) % n], b = P[i], c = P[(i + 1) % n];
    const la = Math.hypot(b[0] - a[0], b[1] - a[1]), lc = Math.hypot(c[0] - b[0], c[1] - b[1]);
    const ra = Math.min(r, la / 2), rc = Math.min(r, lc / 2);
    const p0 = [b[0] + (a[0] - b[0]) / la * ra, b[1] + (a[1] - b[1]) / la * ra];
    const p1 = [b[0] + (c[0] - b[0]) / lc * rc, b[1] + (c[1] - b[1]) / lc * rc];
    if (i === 0) g.moveTo(p0[0], p0[1]); else g.lineTo(p0[0], p0[1]);
    g.quadraticCurveTo(b[0], b[1], p1[0], p1[1]);
  }
  g.closePath();
}

// An ink outline: the path stroked twice, a thin pass everywhere and a heavier one offset
// towards the shadow side, so the line swells where the form turns from the light.
export function inkLine(g, draw, w, lx, ly, col = INK.col) {
  g.save();
  g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = col;
  g.lineWidth = w; g.beginPath(); draw(); g.stroke();
  g.translate(-lx * w * .45, -ly * w * .45);
  g.lineWidth = w * 1.5; g.beginPath(); draw(); g.stroke();
  g.restore();
}

// Grain: short ink flecks scattered over a region, denser where it's darker (k). Anchored to the
// face's own plane (m, u-v box) so it moves with him and doesn't swim.
export function grain(g, c, m, u0, v0, u1, v1, k, col, seed, t) {
  if (k < .05) return;
  // Flecks are a pen's size on screen whatever the distance, so a close-up gets more of them,
  // not bigger ones.
  const a = project(c, ap(m, [u0, v0, 0])), b = project(c, ap(m, [u1, v1, 0]));
  const area = Math.abs((b.x - a.x) * (b.y - a.y)) + 1;
  const n = Math.min(900, Math.round(area / 900 * k * 4));
  const bb = boil(t);
  g.save();
  g.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const u = lerp(u0, u1, hash(i, seed, 1)), v = lerp(v0, v1, hash(i, seed, 2) ** (1 / (1 + k)));
    const p = project(c, ap(m, [u, v, 0]));
    const r = .6 + hash(i, seed, 4) * 1.3 + (hash(i, bb, 6) - .5) * .3;
    g.beginPath(); g.ellipse(p.x, p.y, r * 1.5, r * .65, hash(i, seed, 5) * 3, 0, Math.PI * 2); g.fill();
  }
  g.restore();
}
