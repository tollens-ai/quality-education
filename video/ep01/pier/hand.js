// The film's own alphabet: capitals drawn as brush strokes, the way a signwriter would letter
// them. Each glyph is its strokes in writing order (SVG path syntax, cap height 100, baseline 0),
// so a word can be written on as it's sung, and the same skeletons can be painted, lit with
// bulbs, chalked or drawn in the sand.
import { clamp, lerp, noise2, rnd, INK } from './kit.js';

// [advance width, path]. Paths use M, L, C, Q and Z; a stroke of one point ("M x y D") is a dot.
const G = {
  A: [70, 'M3 0 L35 -100 L67 0 M15 -36 L55 -36'],
  B: [58, 'M7 -100 L7 0 M7 -100 L29 -100 C55 -100 55 -54 29 -54 L7 -54 M7 -54 L32 -54 C61 -54 61 0 32 0 L7 0'],
  C: [62, 'M58 -84 C51 -96 42 -101 32 -100 C12 -98 3 -76 3 -50 C3 -22 14 -1 34 0 C45 1 54 -5 60 -16'],
  D: [64, 'M7 -100 L7 0 M7 -100 L25 -100 C51 -100 61 -77 61 -50 C61 -22 50 0 25 0 L7 0'],
  E: [52, 'M50 -100 L7 -100 L7 0 L50 0 M7 -52 L41 -52'],
  F: [50, 'M49 -100 L7 -100 L7 0 M7 -52 L40 -52'],
  G: [68, 'M60 -83 C53 -96 43 -101 33 -100 C12 -98 3 -76 3 -50 C3 -21 15 0 36 0 C54 0 64 -13 64 -38 L64 -45 L38 -45'],
  H: [64, 'M7 -100 L7 0 M57 -100 L57 0 M7 -52 L57 -52'],
  I: [16, 'M8 -100 L8 0'],
  J: [46, 'M40 -100 L40 -30 C40 -8 30 1 19 0 C9 -1 3 -9 2 -20'],
  K: [60, 'M7 -100 L7 0 M55 -100 L8 -44 M23 -61 L58 0'],
  L: [48, 'M7 -100 L7 0 L47 0'],
  M: [80, 'M5 0 L9 -100 L40 -28 L71 -100 L75 0'],
  N: [64, 'M7 0 L7 -100 L57 0 L57 -100'],
  O: [72, 'M36 -100 C13 -100 3 -77 3 -50 C3 -22 14 0 36 0 C58 0 69 -22 69 -50 C69 -77 58 -100 36 -100 Z'],
  P: [56, 'M7 0 L7 -100 L29 -100 C56 -100 56 -47 29 -47 L7 -47'],
  Q: [72, 'M36 -100 C13 -100 3 -77 3 -50 C3 -22 14 0 36 0 C58 0 69 -22 69 -50 C69 -77 58 -100 36 -100 Z M43 -24 L69 5'],
  R: [60, 'M7 0 L7 -100 L29 -100 C56 -100 56 -50 29 -50 L7 -50 M27 -50 L57 0'],
  S: [56, 'M51 -85 C45 -96 37 -101 28 -100 C14 -99 6 -90 6 -77 C6 -62 22 -57 31 -53 C44 -47 53 -40 53 -26 C53 -10 42 1 28 0 C16 0 7 -6 3 -16'],
  T: [60, 'M3 -100 L57 -100 M30 -100 L30 0'],
  U: [62, 'M7 -100 L7 -33 C7 -11 17 0 31 0 C45 0 55 -11 55 -33 L55 -100'],
  V: [66, 'M3 -100 L33 0 L63 -100'],
  W: [92, 'M3 -100 L23 0 L46 -72 L69 0 L89 -100'],
  X: [62, 'M5 -100 L57 0 M57 -100 L5 0'],
  Y: [62, 'M3 -100 L31 -48 L59 -100 M31 -48 L31 0'],
  Z: [56, 'M5 -100 L52 -100 L5 0 L53 0'],
  0: [58, 'M29 -100 C10 -100 4 -76 4 -50 C4 -22 12 0 29 0 C46 0 54 -22 54 -50 C54 -76 46 -100 29 -100 Z'],
  1: [34, 'M6 -80 L23 -100 L23 0'],
  2: [54, 'M6 -80 C10 -95 21 -101 29 -100 C43 -99 51 -88 49 -74 C47 -57 29 -38 4 0 L51 0'],
  3: [54, 'M6 -91 C13 -99 23 -101 30 -100 C44 -98 49 -86 47 -76 C45 -63 34 -56 21 -56 C38 -56 51 -46 51 -28 C51 -10 40 0 26 0 C16 0 7 -5 3 -14'],
  4: [58, 'M41 0 L41 -100 L3 -30 L56 -30'],
  5: [54, 'M49 -100 L13 -100 L9 -56 C17 -62 26 -64 32 -62 C47 -58 53 -44 51 -28 C49 -10 38 0 26 0 C16 0 8 -4 2 -12'],
  6: [56, 'M45 -94 C39 -100 32 -101 26 -98 C10 -90 4 -66 4 -40 C4 -14 14 0 30 0 C45 0 53 -14 53 -30 C53 -48 42 -58 30 -58 C18 -58 9 -48 5 -38'],
  7: [52, 'M4 -100 L50 -100 L20 0'],
  8: [56, 'M28 -56 C15 -58 9 -67 9 -78 C9 -92 18 -100 28 -100 C38 -100 47 -92 47 -78 C47 -67 41 -58 28 -56 C13 -54 5 -42 5 -28 C5 -10 16 0 28 0 C40 0 51 -10 51 -28 C51 -42 43 -54 28 -56 Z'],
  9: [56, 'M51 -62 C47 -51 38 -44 28 -44 C14 -44 4 -56 4 -72 C4 -90 16 -100 28 -100 C43 -100 52 -88 52 -64 C52 -30 42 -4 22 0 C14 1 8 -2 4 -8'],
  '?': [48, 'M6 -80 C10 -95 21 -101 28 -100 C41 -99 47 -88 45 -76 C43 -62 26 -57 24 -41 L24 -29 M24 -5 D'],
  '!': [18, 'M9 -100 L9 -31 M9 -5 D'],
  ',': [15, 'M9 -6 C9 3 7 9 2 15'],
  '.': [14, 'M7 -5 D'],
  "'": [14, 'M8 -100 C8 -90 7 -84 4 -77'],
  '’': [14, 'M8 -100 C8 -90 7 -84 4 -77'],
  '"': [26, 'M8 -100 L6 -78 M20 -100 L18 -78'],
  '-': [36, 'M5 -44 L31 -44'],
  ':': [16, 'M8 -50 D M8 -5 D'],
  ';': [16, 'M8 -50 D M9 -6 C9 3 7 9 2 15'],
  '(': [26, 'M22 -104 C6 -84 4 -60 4 -46 C4 -30 8 -10 22 10'],
  ')': [26, 'M4 -104 C20 -84 22 -60 22 -46 C22 -30 18 -10 4 10'],
  '&': [66, 'M58 0 L18 -60 C10 -72 12 -94 28 -98 C40 -101 48 -92 46 -80 C44 -68 30 -62 20 -54 C8 -45 3 -34 4 -22 C6 -6 20 2 34 0 C48 -2 56 -14 62 -30'],
  '/': [40, 'M36 -104 L4 8'],
  '+': [52, 'M26 -72 L26 -22 M4 -47 L48 -47'],
  '=': [48, 'M5 -58 L43 -58 M5 -34 L43 -34'],
  '%': [66, 'M18 -100 C8 -100 4 -92 4 -82 C4 -72 8 -64 18 -64 C28 -64 32 -72 32 -82 C32 -92 28 -100 18 -100 Z M58 -100 L8 0 M48 -36 C38 -36 34 -28 34 -18 C34 -8 38 0 48 0 C58 0 62 -8 62 -18 C62 -28 58 -36 48 -36 Z'],
  '#': [62, 'M22 -96 L14 -4 M46 -96 L38 -4 M6 -66 L58 -66 M4 -34 L56 -34'],
  '@': [84, 'M56 -56 C52 -66 40 -68 32 -60 C24 -52 24 -38 32 -32 C40 -26 52 -32 56 -44 L58 -56 L56 -40 C55 -30 60 -26 66 -28 C76 -32 80 -46 78 -58 C74 -82 54 -94 38 -92 C16 -89 3 -70 4 -48 C5 -22 22 -6 44 -6 C54 -6 62 -9 68 -14'],
  '∴': [60, 'M30 -74 D M6 -6 D M54 -6 D'],
  '·': [20, 'M10 -46 D'],
};
// Spacing: each glyph carries its own sidebearings in its width; pairs that need tightening.
const KERN = { AV: -9, AT: -7, AY: -9, AW: -7, LT: -8, LY: -8, LV: -8, TA: -8, VA: -9, WA: -7, YA: -9, FA: -6, PA: -5, 'T.': -8, 'T,': -8, 'Y.': -7, 'V.': -7, 'L\'': -8, 'TO': -3, 'OT': -3, 'LO': -2, 'RT': -2, 'AC': -2, 'AO': -3, 'AG': -3, 'OA': -3 };
const TRACK = 9, SPACE = 30;

// ---------------------------------------------------------------- parsing and flattening
const cache = new Map();
function strokesOf(ch) {
  if (cache.has(ch)) return cache.get(ch);
  const def = G[ch];
  if (!def) { cache.set(ch, null); return null; }
  const toks = def[1].match(/[MLCQZD]|-?\d*\.?\d+/g);
  const strokes = [];
  let cur = null, x = 0, y = 0, sx = 0, sy = 0, i = 0;
  const num = () => +toks[i++];
  const add = (px, py) => cur.pts.push([px, py]);
  while (i < toks.length) {
    const c = toks[i++];
    if (c === 'M') { x = num(); y = num(); sx = x; sy = y; cur = { pts: [[x, y]], dot: false }; strokes.push(cur); }
    else if (c === 'L') { x = num(); y = num(); const [px, py] = cur.pts[cur.pts.length - 1]; const n = Math.max(2, Math.ceil(Math.hypot(x - px, y - py) / 5)); for (let k = 1; k <= n; k++) add(lerp(px, x, k / n), lerp(py, y, k / n)); }
    else if (c === 'Q') { const x1 = num(), y1 = num(); const x0 = x, y0 = y; x = num(); y = num(); for (let k = 1; k <= 12; k++) { const t = k / 12, u = 1 - t; add(u * u * x0 + 2 * u * t * x1 + t * t * x, u * u * y0 + 2 * u * t * y1 + t * t * y); } }
    else if (c === 'C') { const x1 = num(), y1 = num(), x2 = num(), y2 = num(); const x0 = x, y0 = y; x = num(); y = num(); for (let k = 1; k <= 16; k++) { const t = k / 16, u = 1 - t; add(u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x, u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y); } }
    else if (c === 'Z') { add(sx, sy); cur.closed = true; x = sx; y = sy; }
    else if (c === 'D') { cur.dot = true; }
  }
  // Arc lengths, for writing on and for the brush's pressure.
  for (const s of strokes) { s.len = [0]; for (let k = 1; k < s.pts.length; k++) s.len.push(s.len[k - 1] + Math.hypot(s.pts[k][0] - s.pts[k - 1][0], s.pts[k][1] - s.pts[k - 1][1])); s.L = s.len[s.len.length - 1]; }
  const out = { w: def[0], strokes, ink: strokes.reduce((a, s) => a + (s.dot ? 8 : s.L), 0) };
  cache.set(ch, out);
  return out;
}

// Lay a string out: glyph positions in cap-height units (x advance, including kerning).
export function layout(str, weight = .15) {
  const s = str.toUpperCase().replace(/[‘’]/g, "'");
  const out = []; let x = 0;
  const track = TRACK + Math.max(0, weight - .15) * 70;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === ' ') { x += SPACE; continue; }
    const gl = strokesOf(ch);
    if (!gl) { x += SPACE * .6; continue; }
    const k = KERN[(s[i - 1] || '') + ch] || 0;
    x += k;
    out.push({ ch, x, gl, i });
    x += gl.w + track;
  }
  return { glyphs: out, w: Math.max(0, x - track) };
}
export const measure = (str, size, weight = .15) => layout(str, weight).w * size / 100;

// ---------------------------------------------------------------- drawing
// Each copy of a letter is its own drawing: a little tilt, lift and stretch, fixed per copy,
// plus the boil. seed identifies the copy (e.g. line and word index), so it's stable over time.
function jitterOf(seed, i, amt) {
  return {
    rot: (rnd(i, seed + 1) - .5) * .06 * amt,
    dy: (rnd(i, seed + 2) - .5) * 4 * amt,
    sx: 1 + (rnd(i, seed + 3) - .5) * .06 * amt,
    sy: 1 + (rnd(i, seed + 4) - .5) * .05 * amt,
  };
}

// The point set of one stroke, placed (glyph units → user-space px) and wobbled a touch; frac
// cuts it short for writing on.
function place(st, gl, size, jit, boilAmp, seed, frac = 1) {
  const k = size / 100;
  const ccx = gl.gl.w / 2, ccy = -50;
  const cr = Math.cos(jit.rot), sr = Math.sin(jit.rot);
  const b = INK.boil * 4.7 + seed * .37;
  const tr = (px, py) => {
    const x = (px - ccx) * jit.sx, y = (py - ccy) * jit.sy;
    const X = (x * cr - y * sr + ccx + gl.x) * k, Y = (x * sr + y * cr + ccy + jit.dy) * k;
    return [X + noise2(X * .02 + b, Y * .02, 41) * boilAmp, Y + noise2(X * .02, Y * .02 - b, 42) * boilAmp];
  };
  const L = st.L * frac;
  const pts = [];
  for (let j = 0; j < st.pts.length; j++) {
    if (j > 0 && st.len[j] > L) {
      const a = st.pts[j - 1], c = st.pts[j];
      const f = (L - st.len[j - 1]) / Math.max(1e-6, st.len[j] - st.len[j - 1]);
      pts.push(tr(lerp(a[0], c[0], f), lerp(a[1], c[1], f)));
      break;
    }
    pts.push(tr(st.pts[j][0], st.pts[j][1]));
  }
  return pts;
}

// Brush a stroke (user space, px): pressure swells in the middle and lifts at the ends; strokes
// running across are a little thinner than those coming down, like a brush held at an angle.
// Sharp corners keep their weight (mitred, then rounded) so a W or an M never pinches.
function brushStroke(g, pts, w, closed, taper = 1) {
  const n = pts.length;
  if (n < 2) return;
  const s = [0];
  for (let i = 1; i < n; i++) s.push(s[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = s[n - 1] || 1;
  const L1 = [], R1 = [], hws = [], corners = [];
  // A closed stroke (O, 0, 8) wraps round, so its start and end share one tangent and don't notch.
  const wrap = closed && Math.hypot(pts[0][0] - pts[n - 1][0], pts[0][1] - pts[n - 1][1]) < 1e-3 && n > 3;
  for (let i = 0; i < n; i++) {
    const a = pts[i > 0 ? i - 1 : wrap ? n - 2 : 0], c = pts[i < n - 1 ? i + 1 : wrap ? 1 : n - 1], p = pts[i];
    let ux = p[0] - a[0], uy = p[1] - a[1], vx = c[0] - p[0], vy = c[1] - p[1];
    const ul = Math.hypot(ux, uy), vl = Math.hypot(vx, vy);
    if (ul > 1e-6) { ux /= ul; uy /= ul; } else { ux = vx / (vl || 1); uy = vy / (vl || 1); }
    if (vl > 1e-6) { vx /= vl; vy /= vl; } else { vx = ux; vy = uy; }
    let tx = ux + vx, ty = uy + vy;
    const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    const cosHalf = Math.max(.001, tx * vx + ty * vy);
    const down = .86 + .2 * Math.abs(ty);
    const u = s[i] / L;
    const press = closed ? 1 : lerp(1, .6 + .4 * Math.min(1, u * 5, (1 - u) * 5), taper);
    const hw = w * .5 * down * press;
    const miter = Math.min(1.7, 1 / cosHalf);
    if (ux * vx + uy * vy < .5 && i > 0 && i < n - 1) corners.push([p, hw]);
    hws.push(hw);
    L1.push([p[0] - ty * hw * miter, p[1] + tx * hw * miter]); R1.push([p[0] + ty * hw * miter, p[1] - tx * hw * miter]);
  }
  g.beginPath();
  L1.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y));
  for (let i = n - 1; i >= 0; i--) g.lineTo(R1[i][0], R1[i][1]);
  g.closePath(); g.fill();
  const disc = (p, r) => { g.beginPath(); g.arc(p[0], p[1], r, 0, Math.PI * 2); g.fill(); };
  for (const [p, hw] of corners) disc(p, hw);
  if (!closed) { disc(pts[0], hws[0]); disc(pts[n - 1], hws[n - 1]); }
}

// All the placed strokes of a string, with how much of each is written by `progress` (0..1 of the
// whole string's ink, in writing order).
function strokesFor(str, size, o, progress = 1) {
  const L = layout(str, o.w ?? .15);
  const seed = o.seed ?? 7;
  const total = L.glyphs.reduce((a, gl) => a + gl.gl.ink, 0);
  let budget = progress * total;
  const out = [];
  L.glyphs.forEach((gl, gi) => {
    const jit = jitterOf(seed, gi, o.jitter ?? 1);
    for (const st of gl.gl.strokes) {
      const need = st.dot ? 8 : st.L;
      if (budget <= 0) return;
      const frac = Math.min(1, budget / need);
      budget -= need;
      if (st.dot) { if (frac >= .5) out.push({ gi, dot: true, p: place(st, gl, size, jit, o.boil ?? .7, seed + gi)[0] }); continue; }
      out.push({ gi, pts: place(st, gl, size, jit, o.boil ?? .7, seed + gi, frac), closed: st.closed && frac >= 1, partial: frac < 1 });
    }
  });
  return { strokes: out, w: L.w * size / 100 };
}

// Letter a string at (x, y) — y is the baseline — at cap height `size`.
// o: { col, w (stroke weight, fraction of size), shade: {col, dx, dy} (a signwriter's drop shade),
//      outline: {col, w}, align: 'left'|'center'|'right', progress 0..1 (written so far),
//      seed, jitter, boil, rot, raw (skip the ink wrapper) }
export function letter(g, str, x, y, size, o = {}) {
  const raw = g.raw || g;
  const wFrac = o.w ?? .15;
  const w = size * wFrac;
  const { strokes, w: tw } = strokesFor(str, size, o, o.progress ?? 1);
  const ax = o.align === 'center' ? -tw / 2 : o.align === 'right' ? -tw : 0;
  raw.save();
  raw.translate(x, y);
  if (o.rot) raw.rotate(o.rot);
  raw.translate(ax, 0);
  if (o.alpha !== undefined) raw.globalAlpha *= o.alpha;
  const pass = (col, extra, dx, dy, cols) => {
    raw.fillStyle = col;
    raw.save(); raw.translate(dx, dy);
    for (const s of strokes) {
      if (cols) raw.fillStyle = cols[s.gi % cols.length];
      if (s.dot) { raw.beginPath(); raw.arc(s.p[0], s.p[1], (w * .62) + extra / 2, 0, Math.PI * 2); raw.fill(); continue; }
      brushStroke(raw, s.pts, w + extra, s.closed, s.partial ? .3 : 1);
    }
    raw.restore();
  };
  if (o.shade) pass(o.shade.col, (o.outline?.w ?? 0) * size, o.shade.dx * size, o.shade.dy * size);
  if (o.outline) pass(o.outline.col, o.outline.w * size, 0, 0);
  pass(o.col || '#fff4e2', 0, 0, 0, o.cols);
  raw.restore();
  return tw;
}

// The skeleton of a string, for things that follow the strokes (bulbs, stitches, stars): points
// every `step` px along every stroke, in user space relative to (x, y).
export function skeleton(str, x, y, size, o = {}) {
  const { strokes, w } = strokesFor(str, size, { ...o, boil: 0 }, 1);
  const ax = o.align === 'center' ? -w / 2 : o.align === 'right' ? -w : 0;
  const step = o.step || size * .12;
  const pts = [];
  strokes.forEach((s, si) => {
    if (s.dot) { pts.push([s.p[0] + ax + x, s.p[1] + y, si]); return; }
    let acc = step / 2;
    for (let i = 1; i < s.pts.length; i++) {
      const a = s.pts[i - 1], c = s.pts[i];
      const d = Math.hypot(c[0] - a[0], c[1] - a[1]);
      while (acc <= d) { const f = acc / d; pts.push([lerp(a[0], c[0], f) + ax + x, lerp(a[1], c[1], f) + y, si]); acc += step; }
      acc -= d;
    }
  });
  return { pts, w };
}

// Letter a string along a circle of radius r about (cx, cy), centred on angle a (radians, 0 =
// right, -PI/2 = top). bottom: letters sit inside the bottom of the circle, still upright.
export function letterArc(g, str, cx, cy, r, a, size, o = {}) {
  const L = layout(str, o.w ?? .15);
  const k = size / 100;
  const total = L.w * k;
  const dir = o.bottom ? -1 : 1;
  const raw = g.raw || g;
  const prog = o.progress ?? 1;
  const n = L.glyphs.length;
  L.glyphs.forEach((gl, i) => {
    const mid = (gl.x + gl.gl.w / 2) * k - total / 2;
    const ang = a + dir * mid / r;
    const gp = clamp(prog * n - i);
    if (gp <= 0) return;
    raw.save();
    raw.translate(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
    raw.rotate(ang + dir * Math.PI / 2);
    letter(g, gl.ch, -gl.gl.w * k / 2, o.bottom ? size * .5 : size * .5, size, { ...o, progress: gp, seed: (o.seed ?? 3) + i });
    raw.restore();
  });
  return total;
}
