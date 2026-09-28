// Layers and light. Each frame is built from offscreen layers at the render's own resolution,
// drawn in master coordinates, then composited: glow from what emits light (never a threshold
// over everything), shafts of light from the cut words, a little chromatic split on the hits,
// and a vignette. Canvas 2D does all of it; blurs run at a quarter size, where they're cheap.
import { W, H, clamp, lerp, hash, rgba } from './kit.js';

export const R = { k: .5, w: 540, h: 960, frame: 0 };   // render scale, set every frame
const pool = new Map();
export function setScale(k) { R.k = k; R.w = Math.round(W * k); R.h = Math.round(H * k); }

// A layer: a canvas at render size, cleared, with the master-coordinate transform set.
export function layer(name, o = {}) {
  const kk = o.scale ?? 1;
  const w = Math.max(1, Math.round(R.w * kk)), h = Math.max(1, Math.round(R.h * kk));
  let L = pool.get(name);
  if (!L || L.canvas.width !== w || L.canvas.height !== h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    L = c.getContext('2d');
    pool.set(name, L);
  }
  L.setTransform(1, 0, 0, 1, 0, 0);
  L.globalAlpha = 1; L.globalCompositeOperation = 'source-over'; L.filter = 'none';
  if (o.keep !== true) L.clearRect(0, 0, w, h);
  L.setTransform(R.k * kk, 0, 0, R.k * kk, 0, 0);
  return L;
}
// Draw a layer onto a context whose transform is master coordinates.
export function put(g, L, o = {}) {
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  const k = g.canvas.width / W;
  g.globalAlpha = o.alpha ?? 1;
  if (o.op) g.globalCompositeOperation = o.op;
  if (o.filter) g.filter = o.filter;
  g.drawImage(L.canvas, 0, 0, W * k, H * k);
  g.restore();
}

// Blur a layer into another, at a fraction of the size (the blur is in master pixels).
export function blurred(name, L, px, scale = .25) {
  const B = layer(name, { scale });
  B.setTransform(1, 0, 0, 1, 0, 0);
  B.filter = `blur(${Math.max(.5, px * R.k * scale)}px)`;
  B.drawImage(L.canvas, 0, 0, B.canvas.width, B.canvas.height);
  B.filter = 'none';
  B.setTransform(R.k * scale, 0, 0, R.k * scale, 0, 0);
  return B;
}

// Glow: what's in the emissive layer, blurred at two radii and added.
export function glow(g, E, o = {}) {
  const a = blurred('glowA', E, o.r1 ?? 14, .5);
  const b = blurred('glowB', E, o.r2 ?? 60, .25);
  put(g, a, { op: 'lighter', alpha: o.k1 ?? .8 });
  put(g, b, { op: 'lighter', alpha: o.k2 ?? .7 });
}

// Shafts of light: the emissive layer smeared out radially from a point (cx, cy), the way light
// through a cut-out spills into haze. n steps, each a little bigger and fainter.
export function shafts(g, E, cx, cy, o = {}) {
  const sc = .25;
  const B = layer('shaftSrc', { scale: sc });
  B.setTransform(1, 0, 0, 1, 0, 0);
  B.filter = `blur(${Math.max(.5, (o.soft ?? 6) * R.k * sc)}px)`;
  B.drawImage(E.canvas, 0, 0, B.canvas.width, B.canvas.height);
  B.filter = 'none';
  const A = layer('shaftAcc', { scale: sc });
  A.setTransform(1, 0, 0, 1, 0, 0);
  const n = o.n ?? 22, len = o.len ?? .5;
  const w = B.canvas.width, h = B.canvas.height;
  const px = cx * R.k * sc, py = cy * R.k * sc;
  A.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const s = 1 + len * (i / n) ** 1.2;
    A.globalAlpha = (o.k ?? 1) * (1 - i / n) ** 1.6 / n * 3.2;
    A.drawImage(B.canvas, px - px * s, py - py * s, w * s, h * s);
  }
  A.globalCompositeOperation = 'source-over'; A.globalAlpha = 1;
  put(g, A, { op: 'lighter', alpha: o.alpha ?? 1 });
}

// Grain: a few frames of fine noise, cycled; very light, so it reads as film, not texture.
const grains = [];
function grainTile(i) {
  if (grains[i]) return grains[i];
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const x = c.getContext('2d');
  const id = x.createImageData(256, 256);
  for (let p = 0; p < 256 * 256; p++) {
    const v = Math.floor(hash(p, i, 7) * 255);
    id.data[p * 4] = id.data[p * 4 + 1] = id.data[p * 4 + 2] = v; id.data[p * 4 + 3] = 255;
  }
  x.putImageData(id, 0, 0);
  grains[i] = c;
  return c;
}
export function grain(g, t, a = .045) {
  const tile = grainTile(Math.floor(t * 24) % 4);
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = a;
  g.globalCompositeOperation = 'overlay';
  const pat = g.createPattern(tile, 'repeat');
  g.fillStyle = pat;
  g.translate(Math.floor(hash(t) * 256), Math.floor(hash(t, 3) * 256));
  g.fillRect(-256, -256, g.canvas.width + 512, g.canvas.height + 512);
  g.restore();
}

export function vignette(g, a = .5, col = '#000000') {
  const gr = g.createRadialGradient(W / 2, H * .46, H * .25, W / 2, H * .5, H * .78);
  gr.addColorStop(0, rgba(col, 0));
  gr.addColorStop(1, rgba(col, a));
  g.fillStyle = gr;
  g.fillRect(0, 0, W, H);
}

// Chromatic split: the frame's red and blue pulled apart by d master pixels (on the big hits).
export function split(g, d) {
  if (d < .3) return;
  const src = layer('splitSrc');
  src.setTransform(1, 0, 0, 1, 0, 0);
  src.drawImage(g.canvas, 0, 0);
  const ch = (name, col) => {
    const L = layer(name);
    L.setTransform(1, 0, 0, 1, 0, 0);
    L.drawImage(src.canvas, 0, 0);
    L.globalCompositeOperation = 'multiply';
    L.fillStyle = col; L.fillRect(0, 0, L.canvas.width, L.canvas.height);
    L.globalCompositeOperation = 'source-over';
    return L;
  };
  const r = ch('splitR', '#ff0000'), gg = ch('splitG', '#00ff00'), b = ch('splitB', '#0000ff');
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = '#000'; g.fillRect(0, 0, g.canvas.width, g.canvas.height);
  g.globalCompositeOperation = 'lighter';
  const px = d * R.k;
  g.drawImage(r.canvas, -px, 0);
  g.drawImage(gg.canvas, 0, 0);
  g.drawImage(b.canvas, px, 0);
  g.restore();
}

// Glitch: horizontal bands of the frame knocked sideways, for a hit that breaks something.
export function glitch(g, t, amt, seed = 0) {
  if (amt < .02) return;
  const src = layer('glitchSrc');
  src.setTransform(1, 0, 0, 1, 0, 0);
  src.drawImage(g.canvas, 0, 0);
  const k = g.canvas.width / W;
  const f = Math.floor(t * 30);
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  const n = 3 + Math.floor(hash(f, seed) * 6);
  for (let i = 0; i < n; i++) {
    const y = hash(f, i, seed) * H, h = 8 + hash(f, i, seed + 1) ** 2 * 160;
    const dx = (hash(f, i, seed + 2) - .5) * 260 * amt;
    g.drawImage(src.canvas, 0, y * k, W * k, h * k, dx * k, y * k, W * k, h * k);
  }
  g.restore();
}

// Rim light for anything drawn by draw(L): its silhouette, where a step towards the light
// (lx, ly, a screen direction) leaves the shape, painted in the light's colour: a crescent on
// the lit side, the way a strong backlight edges a figure. d is the rim's width in master px.
// An ink line round whatever's in layer C: its silhouette grown by d px, in ink, laid under it.
export function outlineUnder(g, C, d, col) {
  const Mk = layer('olMask');
  Mk.setTransform(1, 0, 0, 1, 0, 0);
  Mk.drawImage(C.canvas, 0, 0);
  Mk.globalCompositeOperation = 'source-in'; Mk.fillStyle = col; Mk.fillRect(0, 0, Mk.canvas.width, Mk.canvas.height);
  Mk.globalCompositeOperation = 'source-over';
  const k = d * R.k;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; g.drawImage(Mk.canvas, Math.cos(a) * k, Math.sin(a) * k); }
  g.restore();
}
export function rimmed(g, name, draw, rims, o = {}) {
  const C = layer(name);
  draw(C);
  if (o.outline) outlineUnder(g, C, o.outline.d, o.outline.col);
  put(g, C, { alpha: o.alpha ?? 1 });
  for (const r of rims) {
    const Rl = layer(name + 'Rim');
    Rl.setTransform(1, 0, 0, 1, 0, 0);
    Rl.drawImage(C.canvas, 0, 0);
    Rl.globalCompositeOperation = 'source-in';
    Rl.fillStyle = r.col; Rl.fillRect(0, 0, Rl.canvas.width, Rl.canvas.height);
    Rl.globalCompositeOperation = 'destination-out';
    const len = Math.hypot(r.lx, r.ly) || 1, d = r.d * R.k;
    Rl.drawImage(C.canvas, -r.lx / len * d, -r.ly / len * d);
    Rl.globalCompositeOperation = 'source-over';
    if (r.soft) { const B = blurred(name + 'RimB', Rl, r.soft, .5); put(g, B, { alpha: r.k ?? 1, op: r.op || 'source-over' }); }
    else put(g, Rl, { alpha: r.k ?? 1, op: r.op || 'source-over' });
    if (o.E) put(o.E, Rl, { alpha: (r.glow ?? .6) });
  }
  return C;
}
