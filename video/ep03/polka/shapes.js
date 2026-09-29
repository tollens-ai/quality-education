// Outline generators for the pencil: rounded rectangles, ellipses, beans and stars as lists of
// control points (the pen's spline turns them into hand-drawn curves).
import { TAU, hash } from './kit.js';

// A rounded rectangle centred on (cx, cy), corners as short arcs, drawn clockwise from the top edge.
export function rrect(cx, cy, w, h, r = 20, n = 3) {
  r = Math.min(r, w / 2, h / 2);
  const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2;
  const pts = [];
  const corner = (px, py, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + i / n * Math.PI / 2; pts.push([px + Math.cos(a) * r, py + Math.sin(a) * r]); } };
  corner(x1 - r, y0 + r, -Math.PI / 2);
  corner(x1 - r, y1 - r, 0);
  corner(x0 + r, y1 - r, Math.PI / 2);
  corner(x0 + r, y0 + r, Math.PI);
  return pts;
}
export function ellipse(cx, cy, rx, ry, n = 10, rot = 0) {
  const pts = [];
  const c = Math.cos(rot), s = Math.sin(rot);
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU;
    const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    pts.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return pts;
}
// A bean: an ellipse pinched at the waist, for bodies.
export function bean(cx, cy, w, h, pinch = .12, n = 14, lean = 0) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU;
    const x = Math.cos(a) * w / 2, y = Math.sin(a) * h / 2;
    const k = 1 - pinch * Math.max(0, Math.sin(a)) * Math.cos(a * 2) * 0;
    pts.push([cx + x * k + Math.sin(a) * lean, cy + y * (1 - pinch * Math.cos(a * 2) * .5)]);
  }
  return pts;
}
export function star(cx, cy, r0, r1, n = 5, rot = -Math.PI / 2) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = rot + i / (n * 2) * TAU, r = i % 2 ? r1 : r0;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}
// Scalloped circle (a flower, a poodle's pom-pom, a rosette's frill).
export function scallop(cx, cy, r, bumps = 10, depth = .14, rot = 0) {
  const pts = [];
  for (let i = 0; i < bumps * 2; i++) {
    const a = rot + i / (bumps * 2) * TAU;
    const rr = i % 2 ? r * (1 - depth) : r;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return pts;
}
export const move = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]);
export const scale = (pts, sx, sy = sx, cx = 0, cy = 0) => pts.map(([x, y]) => [cx + (x - cx) * sx, cy + (y - cy) * sy]);
export const rotate = (pts, a, cx = 0, cy = 0) => { const c = Math.cos(a), s = Math.sin(a); return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]); };
