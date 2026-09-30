// The hand. Everything drawn in "The Counter" is drawn by this, in master pixels.
//
// The rule from episode 3: noise added to a clean outline still reads as a child's drawing in
// Paint, so nothing here starts clean. A stroke overshoots its corner, tapers into the paper,
// misses its own endpoint now and then, and every stroke's shape is a function of a seed, not of
// the frame. Outlines boil on twos; fills hold still, or the film flashes.
//
// The boil dial (`HAND.clumsy`, 0..1) is the one number that decides how wrong the drawing is, so
// a note about it is a number and not a rewrite.

import { P } from './palette.js';

export const W = 1080, H = 1920;

// ---------------------------------------------------------------- randomness

export function rng(seed) {
  let s = seed >>> 0 || 0x9e3779b9;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// Drawing on twos: the boil is a frame index, not a time, and it cycles. A held drawing that
// changes three times a second reads as a drawing being held; a redraw every frame reads as a
// video and, if the fills move with it, as a flash.
export const HAND = { clumsy: 0.55, boils: 3 };

export function boilAt(t, fps = 30) { return Math.floor(t * fps / 2) % HAND.boils; }

// ---------------------------------------------------------------- the nib

const cache = new Map();

// A filled nib stroke: resample, wobble, taper, overshoot, return the outline polygon.
// `boil` picks one of a few cached variants of the same stroke, so outlines move on twos and
// nothing has to be recomputed per frame.
export function nib(id, pts, o = {}) {
  const w = o.w ?? 13;
  const rough = (o.rough ?? 1) * (0.55 + HAND.clumsy);
  const over = (o.over ?? 0.9) * HAND.clumsy;
  const taper = o.taper ?? 0.42;
  const key = `${id}|${w}|${rough.toFixed(3)}|${over.toFixed(3)}|${taper}|${pts.length}`;
  let variants = cache.get(key);
  if (!variants) { variants = [0, 1, 2, 3, 4, 5].map(b => build(pts, w, rough, over, taper, hash(key) + b * 7919)); cache.set(key, variants); }
  return variants[Math.max(0, Math.min(5, Math.round(o.boil ?? 0)))];
}

function build(pts, w, rough, over, taper, seed) {
  const r = rng(seed);
  const step = Math.max(3, w * 0.55);
  const line = resample(pts, step);
  const n = line.length;
  if (n < 2) return [];
  // Overshoot: run past the ends, unevenly, as a hand does.
  const o1 = (0.4 + r() * 1.5) * over * w * 0.7;
  const o2 = (0.4 + r() * 1.5) * over * w * 0.7;
  const dir = i => {
    const a = line[Math.max(0, Math.min(n - 1, i - 1))], b = line[Math.max(0, Math.min(n - 1, i + 1))];
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    return [dx / L, dy / L];
  };
  const [d0x, d0y] = dir(0), [d1x, d1y] = dir(n - 1);
  line[0] = [line[0][0] - d0x * o1, line[0][1] - d0y * o1];
  line[n - 1] = [line[n - 1][0] + d1x * o2, line[n - 1][1] + d1y * o2];

  // Two wobble harmonics along the length, plus a per-point miss.
  const L = pathLength(line);
  const a1 = w * 0.34 * rough, a2 = w * 0.13 * rough;
  const f1 = 0.9 + r() * 0.8, f2 = 3.1 + r() * 2.4;
  const p1 = r() * 6.28, p2 = r() * 6.28;
  const left = [], right = [];
  let s = 0;
  for (let i = 0; i < n; i++) {
    const prev = line[i - 1] || line[i];
    s += Math.hypot(line[i][0] - prev[0], line[i][1] - prev[1]);
    const [dx, dy] = dir(i);
    const nx = -dy, ny = dx;
    const u = s / L;
    const wob = a1 * Math.sin(6.283 * f1 * u + p1) + a2 * Math.sin(6.283 * f2 * u + p2) + (r() - 0.5) * w * 0.16 * rough;
    // Taper: thin where the pen leaves and lands, full in the middle.
    const hw = (w / 2) * (taper + (1 - taper) * Math.pow(Math.sin(Math.PI * u), 0.35));
    const cx = line[i][0] + nx * wob, cy = line[i][1] + ny * wob;
    left.push([cx + nx * hw, cy + ny * hw]);
    right.push([cx - nx * hw, cy - ny * hw]);
  }
  return left.concat(right.reverse());
}

// ---------------------------------------------------------------- drawing

export function path(g, poly, close = true) {
  g.beginPath();
  g.moveTo(poly[0][0], poly[0][1]);
  for (let i = 1; i < poly.length; i++) g.lineTo(poly[i][0], poly[i][1]);
  if (close) g.closePath();
}

// One hand-drawn line.
export function line(g, id, pts, o = {}) {
  if (!pts || !pts.length) throw new Error('line with no points: ' + id);
  const p = nib(id, pts, o);
  if (!p.length) return;
  g.fillStyle = o.colour || P.ink;
  path(g, p);
  g.fill();
  if (o.edge) { g.strokeStyle = o.edge; g.lineWidth = 1.6; g.lineJoin = 'round'; g.stroke(); }
}

// A hand-drawn outline of a closed shape: walk the loop, overshooting each corner a little.
export function outline(g, id, pts, o = {}) {
  line(g, id, pts, { ...o, over: o.over ?? 1.5, rough: o.rough ?? 0.85 });
}

// Fill a shape with the ink, letting it bleed past the outline in two places and miss in one.
export function inkFill(g, id, pts, o = {}) {
  const col = o.colour || P.ink;
  const poly = shape(pts);
  g.save();
  g.fillStyle = col;
  path(g, poly);
  g.fill();
  const r = rng(hash(id) ^ 0x5bf03635);
  if (o.bleed !== 0) {
    const b = o.bleed ?? 1;
    for (let i = 0; i < b; i++) {
      const [x, y] = poly[Math.floor(r() * poly.length)];
      const rad = w2(o.w ?? 8) * (0.5 + r() * 1.4);
      g.beginPath();
      for (let k = 0; k <= 10; k++) {
        const a = 6.283 * k / 10, rr = rad * (0.7 + r() * 0.5);
        g[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      }
      g.fill();
    }
  }
  if (o.voids) {
    // Knock a few holes out of the fill so it reads as ink on a board, not a vector shape.
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < o.voids; i++) {
      const [x, y] = poly[Math.floor(r() * poly.length)];
      const rad = w2(o.w ?? 8) * (0.3 + r() * 0.9);
      g.beginPath(); g.ellipse(x, y, rad, rad * (0.5 + r()), r() * 3, 0, 6.283); g.fill();
    }
    g.globalCompositeOperation = 'source-over';
  }
  g.restore();
}

// A solid shape, drawn once and used many times.
export function shape(pts) {
  if (!pts.length) return [];
  let poly = [pts[0]];
  for (const p of pts) {
    const last = poly[poly.length - 1];
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) > 1) poly.push(p);
  }
  return poly;
}

// ---------------------------------------------------------------- marks

// Parallel wobbling lines clipped to a region: shade, corrugation, a run of fence. The lines are
// really cut at the region's edge (the context is clipped), because running them past it is what
// made the film's first world read as graph paper.
export function hatch(g, id, x, y, w, h, o = {}) {
  if (w <= 0 || h <= 0) return;
  const ang = o.ang ?? -0.5;
  const gap = o.gap ?? 9;
  const cx = x + w / 2, cy = y + h / 2;
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const R = Math.hypot(w, h);
  const corners = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  const ts = corners.map(([px, py]) => -(px - cx) * sa + (py - cy) * ca);
  const t0 = Math.min(...ts), t1 = Math.max(...ts);
  const steps = Math.max(1, Math.round((t1 - t0) / gap));
  g.save();
  g.beginPath(); g.rect(x, y, w, h); g.clip();
  for (let i = 0; i <= steps; i++) {
    const t = t0 + (t1 - t0) * i / steps;
    line(g, `${id}:h${i}`, [
      [cx - ca * R - sa * t, cy - sa * R + ca * t],
      [cx + ca * R - sa * t, cy + sa * R + ca * t],
    ], { w: o.w ?? 4, colour: o.colour, rough: 1.4, over: 0.2, taper: 0.85, boil: o.boil });
  }
  g.restore();
}

// Dots: dirt, dust, grit, a spray of ink.
export function stipple(g, id, x, y, w, h, n, o = {}) {
  const r = rng(hash(id) + (o.boil ?? 0) * 131);
  g.fillStyle = o.colour || P.ink;
  for (let i = 0; i < n; i++) {
    const px = x + r() * w, py = y + r() * h, rad = (o.r ?? 2.4) * (0.4 + r());
    g.beginPath(); g.ellipse(px, py, rad, rad * (0.6 + r() * 0.8), r() * 3, 0, 6.283); g.fill();
  }
}

// An ink blot: a splash with satellites, for where a stamp bit too hard.
export function blot(g, id, x, y, r, o = {}) {
  const rr = rng(hash(id) + (o.boil ?? 0) * 17);
  g.fillStyle = o.colour || P.ox;
  g.beginPath();
  const n = 13;
  for (let i = 0; i <= n; i++) {
    const a = 6.283 * i / n;
    const rad = r * (0.7 + rr() * 0.6);
    g[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rad, y + Math.sin(a) * rad * 0.86);
  }
  g.closePath(); g.fill();
  for (let i = 0; i < 5; i++) {
    const a = rr() * 6.283, d = r * (1.1 + rr() * 1.7);
    g.beginPath(); g.ellipse(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.9, r * 0.16 * (0.5 + rr()), r * 0.13 * (0.5 + rr()), 0, 0, 6.283); g.fill();
  }
}

// ---------------------------------------------------------------- geometry

export function w2(n) { return n * 0.5; }

export function lerp(a, b, p) { return a + (b - a) * p; }
export function clamp01(x) { return Math.max(0, Math.min(1, x)); }
export function smooth(p) { p = clamp01(p); return p * p * (3 - 2 * p); }
export function easeOut(p) { return 1 - Math.pow(1 - clamp01(p), 3); }
export function easeIn(p) { return Math.pow(clamp01(p), 3); }
export function easeBack(p) { const c = 1.9; return 1 + (c + 1) * Math.pow(clamp01(p) - 1, 3) + c * Math.pow(clamp01(p) - 1, 2); }
export function between(t, a, b) { return clamp01((t - a) / (b - a)); }

// A wobbled rectangle, for boards, panels, crate faces and the counter's plates. Each edge is
// followed by its own corner arc, in order round the shape: walking the edges first and adding the
// corners afterwards joins the last corner to the first and draws a diagonal across the box.
export function rect(x, y, w, h, r = 0, wob = 2.4) {
  const rr = rng(hash(`${x}:${y}:${w}:${h}`));
  const j = () => (rr() - 0.5) * wob * 2;
  r = Math.min(r, w / 2 - 1, h / 2 - 1);
  const corners = [
    [x + w - r, y + r, -Math.PI / 2],           // top right
    [x + w - r, y + h - r, 0],                 // bottom right
    [x + r, y + h - r, Math.PI / 2],           // bottom left
    [x + r, y + r, Math.PI],                    // top left
  ];
  const pts = [];
  const edge = (ax, ay, bx, by, n) => {
    for (let i = 0; i <= n; i++) pts.push([ax + (bx - ax) * i / n + j(), ay + (by - ay) * i / n + j()]);
  };
  // Start at the top edge's left end and go clockwise, so each corner arc closes the edge before it.
  edge(x + r, y, x + w - r, y, 3);
  if (r > 0) for (let i = 0; i <= 4; i++) { const a = corners[0][2] + i / 4 * (Math.PI / 2); pts.push([corners[0][0] + Math.cos(a) * r + j(), corners[0][1] + Math.sin(a) * r + j()]); }
  edge(x + w, y + r, x + w, y + h - r, 3);
  if (r > 0) for (let i = 0; i <= 4; i++) { const a = corners[1][2] + i / 4 * (Math.PI / 2); pts.push([corners[1][0] + Math.cos(a) * r + j(), corners[1][1] + Math.sin(a) * r + j()]); }
  edge(x + w - r, y + h, x + r, y + h, 3);
  if (r > 0) for (let i = 0; i <= 4; i++) { const a = corners[2][2] + i / 4 * (Math.PI / 2); pts.push([corners[2][0] + Math.cos(a) * r + j(), corners[2][1] + Math.sin(a) * r + j()]); }
  edge(x, y + h - r, x, y + r, 3);
  if (r > 0) for (let i = 0; i <= 4; i++) { const a = corners[3][2] + i / 4 * (Math.PI / 2); pts.push([corners[3][0] + Math.cos(a) * r + j(), corners[3][1] + Math.sin(a) * r + j()]); }
  return pts;
}

// The four corners of a quad, wobbled: every flat plane in the film is one of these.
export function quad(p, wob = 2.2) {
  const rr = rng(hash(p.map(q => q.join(',')).join(';')));
  return p.map(([x, y]) => [x + (rr() - 0.5) * wob * 2, y + (rr() - 0.5) * wob * 2]);
}

// A curve through points: the only way anything rounded gets drawn, so nothing is an arc.
export function curve(pts, tension = 0.4, n = 8) {
  if (pts.length < 3) return pts.slice();
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      out.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t * 2 * tension + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t * 2 * tension + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

export function resample(pts, step) {
  const out = [pts[0]];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const L = Math.hypot(x1 - x0, y1 - y0);
    if (L < 1e-6) continue;
    let d = step - acc;
    while (d < L) { const u = d / L; out.push([x0 + (x1 - x0) * u, y0 + (y1 - y0) * u]); d += step; }
    acc = (acc + L) % step;
  }
  out.push(pts[pts.length - 1]);
  return out;
}

function pathLength(pts) {
  let s = 0;
  for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return s || 1;
}

// ---------------------------------------------------------------- the press

// Lay two plates one over the other with the second a hair off register, the way a two-colour
// print looks. `draw` is called once per plate; `blend` (default multiply) makes the overlap
// darker, which is where the third colour lives.
export function plates(g, draw, o = {}) {
  const dx = o.dx ?? 4, dy = o.dy ?? 5;
  g.save();
  g.globalCompositeOperation = 'multiply';
  draw('a', -dx, -dy);
  draw('b', dx * 0.4, dy);
  g.restore();
}