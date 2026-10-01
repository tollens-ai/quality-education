// The painted backgrounds: watercolour and gouache on paper, as the old studios painted theirs,
// softer and a little paler than the cels in front of them. Each place is painted once into its own
// canvas (bigger than the frame, for the camera) and then only moved. The painter's moves are here:
// a wash with its granulation and dried rim, glazes of shadow and light, brush streaks for grain,
// soft cast shadows, a thin brown line where an edge wants one, and the paper under it all.
import { W, H, TAU, clamp, lerp, rng, noise, hash, mix, rgba, mono, setMono } from './kit.js';
import { C } from './palette.js';

const CACHE = new Map();
// `o.ox` widens a place by that much on each side without moving its coordinates: the painter gets
// the bounds {x0, x1} and paints the extra width at negative x and beyond w (the wide frame needs it).
export function bake(key, w, h, fn, o = {}) {
  let c = CACHE.get(key);
  if (!c) {
    const ox = o.ox || 0;
    c = document.createElement('canvas'); c.width = w + 2 * ox; c.height = h;
    const g = c.getContext('2d');
    g.translate(ox, 0);
    // a place is painted in full colour, whenever it's first needed; place() drains it when it's shown
    const m = mono(); setMono(0);
    fn(g, w, h, { x0: -ox, x1: w + ox });
    setMono(m);
    c.ox = ox;
    CACHE.set(key, c);
  }
  return c;
}

// ---------------------------------------------------------------- textures, made once
let GRAIN = null, PAPER = null;
// Watercolour granulation: pigment settling in the paper's tooth, a soft cloudy noise with specks.
function grainCanvas() {
  if (GRAIN) return GRAIN;
  const n = 512; GRAIN = document.createElement('canvas'); GRAIN.width = n; GRAIN.height = n;
  const g = GRAIN.getContext('2d'), img = g.createImageData(n, n), d = img.data, R = rng(17);
  const oct = (x, y) => { let v = 0, a = .5, f = 1 / 64; for (let k = 0; k < 4; k++) { v += a * (vn(x * f, y * f, k) * 2 - 1); a *= .5; f *= 2; } return v; };
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const v = 200 + oct(x, y) * 70 + (R() - .5) * 46;
    const i = (y * n + x) * 4; d[i] = d[i + 1] = d[i + 2] = clamp(v, 0, 255); d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return GRAIN;
}
// tileable value noise on a 512 lattice
function vn(x, y, k) {
  const p = 512 / 64 * Math.pow(2, k);
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const h2 = (a, b) => hash(((a % p) + p) % p, ((b % p) + p) % p, k + 3);
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return lerp(lerp(h2(xi, yi), h2(xi + 1, yi), u), lerp(h2(xi, yi + 1), h2(xi + 1, yi + 1), u), v);
}
function paperCanvas() {
  if (PAPER) return PAPER;
  const n = 512; PAPER = document.createElement('canvas'); PAPER.width = n; PAPER.height = n;
  const g = PAPER.getContext('2d'), R = rng(29);
  g.fillStyle = 'rgb(128,128,128)'; g.fillRect(0, 0, n, n);
  for (let i = 0; i < 2600; i++) { const x = R() * n, y = R() * n, l = 2 + R() * 9, a = R() * TAU; g.strokeStyle = R() < .5 ? 'rgba(90,90,90,.35)' : 'rgba(170,170,170,.35)'; g.lineWidth = .6 + R(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  for (let i = 0; i < 900; i++) { g.fillStyle = R() < .5 ? 'rgba(70,70,70,.4)' : 'rgba(200,200,200,.4)'; g.fillRect(R() * n, R() * n, 1 + R() * 1.6, 1 + R() * 1.6); }
  return PAPER;
}

// ---------------------------------------------------------------- the painter's moves
export function path(g, P) { g.beginPath(); g.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) g.lineTo(P[i][0], P[i][1]); g.closePath(); }
export function wob(P, amt, seed) { return P.map(([x, y], i) => [x + noise(i * .37 + x * .01, seed) * amt, y + noise(i * .37 + y * .01, seed + 3) * amt]); }
export const box = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
// Subdivide a polygon's edges so a wobble bends them rather than only moving corners.
export function dense(P, step = 30) {
  const out = [];
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / step));
    for (let k = 0; k < n; k++) out.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]);
  }
  return out;
}
function bounds(P) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of P) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 }; }

// A wash: flat colour (or a gradient), the pigment's granulation, its blooms, and the darker rim
// where it dried at the edge. o: grad [[stop, col], ...] with dir (from, to points), gran (0..1),
// rim (0..1), rimW, blooms (count), amt (edge wobble), ink (line width), inkA, seed.
export function wash(g, P0, col, o = {}) {
  const seed = o.seed ?? 1, R = rng(seed);
  const P = o.amt === 0 ? P0 : wob(dense(P0, o.step ?? 26), o.amt ?? 1.6, seed);
  const b = bounds(P);
  g.save();
  path(g, P);
  if (o.grad) {
    const [p0, p1] = o.dir || [[b.x0, b.y0], [b.x0, b.y1]];
    const gr = g.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
    for (const [s, c] of o.grad) gr.addColorStop(s, C(c));
    g.fillStyle = gr;
  } else if (o.radial) {
    const [cx, cy, r0, r1, stops] = o.radial;
    const gr = g.createRadialGradient(cx, cy, r0, cx, cy, r1);
    for (const [s, c] of stops) gr.addColorStop(s, C(c));
    g.fillStyle = gr;
  } else g.fillStyle = C(col);
  g.fill();
  g.clip();
  // blooms: soft cauliflower edges of wetter paint, lighter and darker
  const nb = o.blooms ?? Math.round(clamp(b.w * b.h / 26000, 2, 40));
  if (nb) {
    g.filter = `blur(${o.bloomBlur ?? 14}px)`;
    for (let i = 0; i < nb; i++) {
      const bx = lerp(b.x0, b.x1, R()), by = lerp(b.y0, b.y1, R()), br = lerp(24, 110, R()) * (o.bloomScale ?? 1);
      g.fillStyle = rgba(R() < .55 ? mix(C(col), '#2a1a10', .22) : mix(C(col), '#fff4dc', .22), .14 * (o.bloom ?? 1));
      g.beginPath(); g.ellipse(bx, by, br, br * lerp(.45, 1, R()), R() * 3, 0, TAU); g.fill();
    }
    g.filter = 'none';
  }
  // granulation
  if ((o.gran ?? .5) > 0) {
    g.globalCompositeOperation = 'multiply';
    g.globalAlpha = .18 * (o.gran ?? .5) * 2;
    const pat = g.createPattern(grainCanvas(), 'repeat');
    g.save(); g.translate(R() * 512, R() * 512); g.fillStyle = pat; g.fillRect(b.x0 - 600, b.y0 - 600, b.w + 1200, b.h + 1200); g.restore();
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
  // the dried rim
  if ((o.rim ?? .5) > 0) {
    g.filter = `blur(${o.rimBlur ?? 3}px)`;
    path(g, P); g.strokeStyle = rgba(mix(C(col), '#2a1408', .5), .55 * (o.rim ?? .5)); g.lineWidth = o.rimW ?? 7; g.stroke();
    g.filter = 'none';
  }
  g.restore();
  if (o.ink) inkLine(g, P, { w: o.ink, a: o.inkA ?? .7, seed: seed + 9, closed: true, col: o.inkCol });
  return P;
}
// A glaze over a shape or the whole canvas: a transparent layer of colour, in multiply (shadow) or
// screen (light). fill may be a colour or a gradient made by the caller.
export function glaze(g, P, fill, a = .4, mode = 'multiply', blur = 0) {
  g.save(); g.globalCompositeOperation = mode; g.globalAlpha = a;
  if (blur) g.filter = `blur(${blur}px)`;
  g.fillStyle = typeof fill === 'string' ? C(fill) : fill;
  if (P) { path(g, P); g.fill(); } else g.fillRect(-2000, -2000, 9000, 9000);
  g.restore();
}
// A pool of light: a soft radial glow (screen), its colour warm.
export function light(g, x, y, r, col = '#ffd99a', a = .5, ry = r, mode = 'screen') {
  g.save(); g.globalCompositeOperation = mode;
  g.translate(x, y); g.scale(1, ry / r);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, r);
  gr.addColorStop(0, rgba(C(col), a)); gr.addColorStop(.45, rgba(C(col), a * .45)); gr.addColorStop(1, rgba(C(col), 0));
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
  g.restore();
}
// Darkness gathering: a radial vignette over a place, keeping a lit centre.
export function gloom(g, w, h, cx, cy, r0, r1, col = '#1c0e06', a = .7) {
  g.save(); g.globalCompositeOperation = 'multiply';
  const gr = g.createRadialGradient(cx, cy, r0, cx, cy, r1);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, rgba(mix('#ffffff', C(col), a), 1));
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.restore();
}
// A soft cast shadow under something.
export function shadow(g, P, a = .35, blur = 12, col = '#2a1206') {
  g.save(); g.globalCompositeOperation = 'multiply'; g.filter = `blur(${blur}px)`;
  g.fillStyle = rgba(C(col), a); path(g, P); g.fill(); g.restore();
}
// Brush streaks: many thin strokes in a direction inside a shape (wood grain, plaster, fabric).
export function streaks(g, P, col, o = {}) {
  const R = rng(o.seed ?? 5), b = bounds(P);
  g.save(); path(g, P); g.clip();
  const n = o.n ?? Math.round(b.w * b.h / 900), ang = o.ang ?? Math.PI / 2, len = o.len ?? 80;
  for (let i = 0; i < n; i++) {
    const x = lerp(b.x0, b.x1, R()), y = lerp(b.y0, b.y1, R()), L = len * lerp(.4, 1.4, R());
    const a = ang + (R() - .5) * (o.jit ?? .12);
    g.strokeStyle = rgba(R() < .5 ? mix(C(col), '#000000', .25 * (o.dark ?? 1)) : mix(C(col), '#ffffff', .2 * (o.lite ?? 1)), (o.a ?? .12) * lerp(.5, 1, R()));
    g.lineWidth = (o.w ?? 2) * lerp(.5, 1.6, R()); g.lineCap = 'round';
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * L * .5 + (R() - .5) * 6, y + Math.sin(a) * L * .5 + (R() - .5) * 6, x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke();
  }
  g.restore();
}
// Dabs: short round marks (foliage, stone, plaster).
export function dabs(g, P, cols, o = {}) {
  const R = rng(o.seed ?? 7), b = bounds(P);
  g.save(); path(g, P); g.clip();
  const n = o.n ?? Math.round(b.w * b.h / 1500);
  for (let i = 0; i < n; i++) { g.fillStyle = rgba(C(cols[Math.floor(R() * cols.length)]), (o.a ?? .2) * lerp(.4, 1, R())); const r = (o.r ?? 8) * lerp(.4, 1.3, R()); g.beginPath(); g.ellipse(lerp(b.x0, b.x1, R()), lerp(b.y0, b.y1, R()), r, r * lerp(.5, 1, R()), R() * 3, 0, TAU); g.fill(); }
  g.restore();
}
// The background's own line: thin, brown, broken in places, lighter than the cels' ink.
export function inkLine(g, P, o = {}) {
  const R = rng(o.seed ?? 3), w = o.w ?? 2.4, n = P.length, closed = !!o.closed;
  g.save(); g.strokeStyle = C(o.col || '#3e2a1e'); g.lineCap = 'round'; g.lineJoin = 'round';
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    if (R() < (o.gap ?? .06)) continue;
    const a = P[i], b = P[(i + 1) % n];
    g.globalAlpha = (o.a ?? .7) * lerp(.6, 1, R()); g.lineWidth = w * lerp(.6, 1.25, R());
    g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
  }
  g.restore();
}
// The paper under the paint: its fibres, faintly, over the finished place.
export function paper(g, w, h, a = .5) {
  g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = a;
  g.fillStyle = g.createPattern(paperCanvas(), 'repeat'); g.fillRect(0, 0, w, h);
  g.restore();
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .1 * a;
  g.fillStyle = g.createPattern(grainCanvas(), 'repeat'); g.fillRect(0, 0, w, h);
  g.restore();
}
// Ambient occlusion: a soft dark band along a line where two surfaces meet (a wall and a floor, a
// shelf and the wall under it).
export function ao(g, x0, y0, x1, y1, width = 40, a = .35, col = '#2a1206') {
  g.save(); g.globalCompositeOperation = 'multiply';
  const nx = -(y1 - y0), ny = x1 - x0, L = Math.hypot(nx, ny) || 1;
  const gr = g.createLinearGradient(x0, y0, x0 + nx / L * width, y0 + ny / L * width);
  gr.addColorStop(0, rgba(C(col), a)); gr.addColorStop(1, rgba(C(col), 0));
  g.fillStyle = gr; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.lineTo(x1 + nx / L * width, y1 + ny / L * width); g.lineTo(x0 + nx / L * width, y0 + ny / L * width); g.closePath(); g.fill();
  g.restore();
}
