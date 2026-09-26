// The paper kit for "The Mobile": gouache-painted paper cut with scissors and pinned to a wall,
// after Matisse's Jazz. Shapes are point lists; `cut` roughens them once (seeded, so edges never
// flicker) and caches the Path2D. `paint` fills a cut with colour, brush texture, a lit edge and a
// soft shadow whose depth says how far the paper stands off the wall.
//
// Everything is in 1080×1920 master units. K (the canvas scale) must be set by the scene each
// frame, because canvas shadows are measured in device pixels, not in the current transform.

export const W = 1080, H = 1920, TAU = Math.PI * 2;

export const PAL = {
  wall: '#F7F1E4', wallLo: '#E8DECB', cream: '#FBF3E2',
  blue: '#2743A6', blueDk: '#16276B', night: '#12205C',
  red: '#D33A2C', yellow: '#F3C233', black: '#1B1A19', green: '#2F8C5A',
  pink: '#EE8FA2', teal: '#2C9A9A', violet: '#6A4FA0', white: '#FBF8F1',
  clawd: '#D97757', clawdDk: '#B85C3E',
  ink: '#1E2A5A',          // your handwriting
  scrap: '#FAF6EC',
};

let K = 1;
export const setScale = k => { K = k; };

// ---------- seeded randomness ----------
export function hash(n) {
  let x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
export function rng(seed) {
  let a = (seed * 2654435761) >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Smooth periodic noise on [0, 1) with `n` knots.
function loopNoise(seed, n) {
  const r = rng(seed), k = Array.from({ length: n }, () => r() * 2 - 1);
  return u => {
    const x = (((u % 1) + 1) % 1) * n, i = Math.floor(x), f = x - i, s = f * f * (3 - 2 * f);
    return k[i % n] * (1 - s) + k[(i + 1) % n] * s;
  };
}

// ---------- easing ----------
export const clamp01 = x => Math.max(0, Math.min(1, x));
export const lerp = (a, b, p) => a + (b - a) * p;
export const smooth = p => { p = clamp01(p); return p * p * (3 - 2 * p); };
export const easeOut = p => 1 - Math.pow(1 - clamp01(p), 3);
export const easeIn = p => Math.pow(clamp01(p), 3);
export const between = (t, a, b) => clamp01((t - a) / (b - a));
// A paper-light settle: overshoots a little and comes to rest, like a pinned sheet.
export const settle = p => { p = clamp01(p); return 1 - Math.exp(-6 * p) * Math.cos(9 * p); };

// ---------- shapes as point lists ----------
export const shape = {
  rect(w, h, x = -w / 2, y = -h / 2) { return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; },
  ellipse(rx, ry = rx, n = 48, cx = 0, cy = 0) {
    return Array.from({ length: n }, (_, i) => [cx + rx * Math.cos(i / n * TAU), cy + ry * Math.sin(i / n * TAU)]);
  },
  star(n, r1, r2, rot = -Math.PI / 2) {
    return Array.from({ length: n * 2 }, (_, i) => {
      const r = i % 2 ? r2 : r1, a = rot + i / (n * 2) * TAU;
      return [r * Math.cos(a), r * Math.sin(a)];
    });
  },
  // Matisse's seaweed: a wavy leaf with lobes down both sides.
  algae(len, wid, lobes, seed) {
    const r = rng(seed), L = [], R = [], N = lobes * 6;
    for (let i = 0; i <= N; i++) {
      const u = i / N, y = -len / 2 + u * len;
      const taper = Math.sin(Math.PI * Math.min(1, u * 1.05)) ** 0.7;
      const lobe = 0.55 + 0.45 * Math.abs(Math.sin(u * lobes * Math.PI));
      const bend = Math.sin(u * 2.2 + seed) * wid * 0.35;
      const j = 1 + (r() - 0.5) * 0.12;
      L.push([bend - wid / 2 * taper * lobe * j, y]);
      R.push([bend + wid / 2 * taper * (1.4 - lobe) * j + wid * 0.12 * taper, y]);
    }
    return [...L, ...R.reverse()];
  },
  // Closed Catmull-Rom through control points, sampled `per` points per span.
  smooth(pts, per = 8) {
    const n = pts.length, out = [];
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      for (let j = 0; j < per; j++) {
        const t = j / per, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map(k => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
      }
    }
    return out;
  },
  move(pts, dx, dy, rot = 0, s = 1) {
    const c = Math.cos(rot), si = Math.sin(rot);
    return pts.map(([x, y]) => [dx + s * (x * c - y * si), dy + s * (x * si + y * c)]);
  },
};

// Resample a closed polygon so edges have points every `step` units (straight sides need them to
// take scissor wobble).
function resample(pts, step) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
    const d = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(d / step));
    for (let j = 0; j < n; j++) out.push([x0 + (x1 - x0) * j / n, y0 + (y1 - y0) * j / n]);
  }
  return out;
}

// Scissors: a slow wander along the edge plus short straight facets where the blades closed.
function roughen(pts, seed, amp) {
  const P = resample(pts, 5), n = P.length;
  let per = 0;
  for (let i = 0; i < n; i++) per += Math.hypot(P[(i + 1) % n][0] - P[i][0], P[(i + 1) % n][1] - P[i][1]);
  const slow = loopNoise(seed, Math.max(6, Math.round(per / 90)));
  const fast = loopNoise(seed + 17, Math.max(12, Math.round(per / 22)));
  const out = [];
  let acc = 0;
  for (let i = 0; i < n; i++) {
    const a = P[(i - 1 + n) % n], b = P[(i + 1) % n], p = P[i];
    let nx = -(b[1] - a[1]), ny = b[0] - a[0];
    const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const u = acc / per, d = amp * (slow(u) * 1.0 + fast(u) * 0.35);
    out.push([p[0] + nx * d, p[1] + ny * d]);
    acc += Math.hypot(b[0] - p[0], b[1] - p[1]) / 2 + Math.hypot(p[0] - a[0], p[1] - a[1]) / 2;
  }
  // facets: keep every few points, so the edge is a chain of short straight cuts
  return out.filter((_, i) => i % 2 === 0);
}

const cutCache = new Map();
// cut(key, () => pts | [pts, ...holes], {amp, seed}) → Path2D. Holes (e.g. eyes) cut through.
export function cut(key, make, { amp = 2.2, seed } = {}) {
  let p = cutCache.get(key);
  if (p) return p;
  const s = seed ?? [...key].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);
  const made = make();
  const rings = Array.isArray(made[0][0]) ? made : [made];
  p = new Path2D();
  rings.forEach((ring, ri) => {
    const r = roughen(ring, s + ri * 101, ri ? amp * 0.6 : amp);
    r.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y)));
    p.closePath();
  });
  cutCache.set(key, p);
  return p;
}

// ---------- gouache ----------
let TEX = null, GRAIN = null;
function makeTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const g = c.getContext('2d'), r = rng(9);
  // Long brush drags, lighter and darker than the base, mostly one direction with drift.
  for (let i = 0; i < 420; i++) {
    const x = r() * 640 - 64, y = r() * 640 - 64, len = 60 + r() * 220, a = -0.3 + r() * 0.25 + (y / 512) * 0.15;
    const w = 4 + r() * 18, light = r() < 0.5;
    g.strokeStyle = light ? `rgba(255,255,255,${0.025 + r() * 0.04})` : `rgba(0,0,0,${0.02 + r() * 0.035})`;
    g.lineWidth = w; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a) * len / 2 + (r() - 0.5) * 30, y + Math.sin(a) * len / 2 + (r() - 0.5) * 30, x + Math.cos(a) * len, y + Math.sin(a) * len);
    g.stroke();
    // bristle lines inside the drag
    g.lineWidth = 1; g.strokeStyle = light ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.03)';
    for (let k = 0; k < 4; k++) {
      const o = (r() - 0.5) * w;
      g.beginPath(); g.moveTo(x - Math.sin(a) * o, y + Math.cos(a) * o);
      g.lineTo(x + Math.cos(a) * len - Math.sin(a) * o, y + Math.sin(a) * len + Math.cos(a) * o); g.stroke();
    }
  }
  // pigment speckle
  const img = g.getImageData(0, 0, 512, 512), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = r();
    if (v < 0.012) { d[i] = d[i + 1] = d[i + 2] = 0; d[i + 3] += 16; }
    else if (v > 0.99) { d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] += 20; }
  }
  g.putImageData(img, 0, 0);
  return c;
}

function makeGrain() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'), img = g.createImageData(256, 256), d = img.data, r = rng(4);
  for (let i = 0; i < d.length; i += 4) {
    const v = r() < 0.5 ? 0 : 255;
    d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 5 + r() * 7;
  }
  g.putImageData(img, 0, 0);
  return c;
}

let WALL = null;
function makeWall() {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'), r = rng(21);
  g.fillStyle = PAL.wall; g.fillRect(0, 0, W, H);
  // big soft mottling of the plaster
  for (let i = 0; i < 70; i++) {
    const x = r() * W, y = r() * H, rad = 120 + r() * 380, dark = r() < 0.5;
    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, dark ? 'rgba(170,140,95,0.03)' : 'rgba(255,255,250,0.06)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  // paper fibres
  g.lineCap = 'round';
  for (let i = 0; i < 2600; i++) {
    const x = r() * W, y = r() * H, a = r() * TAU, l = 4 + r() * 16;
    g.strokeStyle = r() < 0.5 ? 'rgba(120,95,60,0.05)' : 'rgba(255,255,255,0.14)';
    g.lineWidth = 0.6 + r();
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 0.6) * l / 2, y + Math.sin(a + 0.6) * l / 2, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  // old pin holes, where earlier sheets were pinned
  for (let i = 0; i < 46; i++) {
    const x = r() * W, y = r() * H;
    g.fillStyle = 'rgba(70,55,35,0.28)'; g.beginPath(); g.arc(x, y, 1.3 + r(), 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.arc(x + 1.2, y + 1.2, 1, 0, TAU); g.fill();
  }
  // daylight from the top left
  const lg = g.createLinearGradient(0, 0, W * 0.6, H);
  lg.addColorStop(0, 'rgba(255,252,242,0.30)'); lg.addColorStop(1, 'rgba(120,90,50,0.05)');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  const vg = g.createRadialGradient(W / 2, H * 0.45, H * 0.35, W / 2, H * 0.5, H * 0.8);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(90,60,30,0.08)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  return c;
}

export function init() {
  TEX = makeTexture(); GRAIN = makeGrain(); WALL = makeWall();
}

// The wall, optionally tinted (a coloured panel on it, or night).
export function wall(g, tint = null, tintA = 0) {
  g.drawImage(WALL, 0, 0, W, H);
  if (tint && tintA > 0) {
    g.save(); g.globalAlpha = tintA; g.globalCompositeOperation = 'multiply';
    g.fillStyle = tint; g.fillRect(0, 0, W, H); g.restore();
  }
}

// Film-still grain over the whole frame; `t` shifts it so it lives a little without boiling shapes.
export function grain(g, t) {
  const pat = g.createPattern(GRAIN, 'repeat');
  const f = Math.floor(t * 12) % 4;
  pat.setTransform(new DOMMatrix().translateSelf(f * 67, f * 131));
  g.save(); g.fillStyle = pat; g.fillRect(0, 0, W, H); g.restore();
}

// Paint a cut. opts: lift (0 = flat on the wall, 1 = pinned, 2+ = held away), tex (brush
// strength), seed (texture offset), edge (lit rim), alpha.
export function paint(g, path, color, { lift = 1, tex = 0.8, seed = 0, edge = true, alpha = 1 } = {}) {
  g.save();
  if (alpha < 1) g.globalAlpha *= alpha;
  if (lift > 0) {
    g.shadowColor = `rgba(55,38,20,${0.2 + 0.05 * Math.min(lift, 3)})`;
    g.shadowBlur = (4 + 7 * lift) * K;
    g.shadowOffsetX = (2 + 4 * lift) * K;
    g.shadowOffsetY = (3 + 6 * lift) * K;
  }
  g.fillStyle = color; g.fill(path, 'evenodd');
  g.shadowColor = 'transparent';
  if (tex > 0) {
    const pat = g.createPattern(TEX, 'repeat');
    pat.setTransform(new DOMMatrix().translateSelf(hash(seed) * 512, hash(seed + 1) * 512).rotateSelf(hash(seed + 2) * 40 - 20));
    g.globalAlpha *= Math.min(1, tex);
    g.fillStyle = pat; g.fill(path, 'evenodd');
    g.globalAlpha /= Math.min(1, tex) || 1;
  }
  if (edge) {
    g.lineWidth = 1.4; g.strokeStyle = 'rgba(255,250,240,0.28)'; g.stroke(path);
  }
  g.restore();
}

// A Jazz plate: a big sheet of painted colour pinned to the wall, with a margin of wall around it.
export function panel(g, color, { m = 54, top = 150, bottom = 150, rot = 0.004, seed = 1 } = {}) {
  const w = W - 2 * m, h = H - top - bottom;
  at(g, W / 2, top + h / 2, rot, 1, () => {
    paint(g, cut(`panel-${w}-${h}-${seed}`, () => shape.rect(w, h), { amp: 3, seed }), color, { lift: 0.5, tex: 0.4, seed });
    for (const [x, y] of [[-w / 2 + 22, -h / 2 + 22], [w / 2 - 22, -h / 2 + 22]]) pin(g, x, y, PAL.black, 0.8);
  });
}

// A dressmaker's pin: a round head with a highlight.
export function pin(g, x, y, color = PAL.red, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.shadowColor = 'rgba(40,25,10,0.35)'; g.shadowBlur = 4 * K; g.shadowOffsetX = 3 * K; g.shadowOffsetY = 4 * K;
  g.fillStyle = color; g.beginPath(); g.arc(0, 0, 7, 0, TAU); g.fill();
  g.shadowColor = 'transparent';
  g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.arc(-2.2, -2.4, 2.2, 0, TAU); g.fill();
  g.restore();
}

// Draw a function in a local frame: at (x, y), rotated, scaled.
export function at(g, x, y, rot, s, fn) {
  g.save(); g.translate(x, y); if (rot) g.rotate(rot); if (s !== 1) g.scale(s, s); fn(); g.restore();
}
