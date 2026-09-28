// The world: a black-lacquered stage facing a wall of one-way mirror. This file holds what every
// shot shares: offscreen layers (for reflections), light as flat hard-edged shapes (a cone, a
// strobe, a spot), anime impact frames, and the grounds shots stand on.
import { C, W, H, TAU, clamp, lerp, rgba, hash, rng, twos, noise } from './kit.js';
import { gpen, P, ink } from './pen.js';

// ---------------------------------------------------------------- layers
const POOL = {};
// An offscreen canvas the size of the frame, cleared, in master coordinates.
export function layer(g, name) {
  const cw = g.canvas.width, ch = g.canvas.height;
  let L = POOL[name];
  if (!L || L.canvas.width !== cw || L.canvas.height !== ch) {
    const c = document.createElement('canvas'); c.width = cw; c.height = ch;
    L = POOL[name] = c.getContext('2d');
  }
  L.setTransform(1, 0, 0, 1, 0, 0);
  L.globalAlpha = 1; L.globalCompositeOperation = 'source-over';
  L.clearRect(0, 0, cw, ch);
  const k = cw / W;
  L.setTransform(k, 0, 0, k, 0, 0);
  return L;
}
// Paint a layer onto g. o: alpha, op (composite), flipX (mirror about x = flipX, master px),
// flipY (about y = flipY), clip [x, y, w, h] in master px, tint {col, a}.
export function put(g, L, o = {}) {
  let src = L.canvas;
  if (o.tint) {
    const T = layer(g, '_tint');
    T.setTransform(1, 0, 0, 1, 0, 0);
    T.drawImage(src, 0, 0);
    T.globalCompositeOperation = 'source-atop';
    T.fillStyle = o.tint.col; T.globalAlpha = o.tint.a;
    T.fillRect(0, 0, T.canvas.width, T.canvas.height);
    T.globalCompositeOperation = 'source-over'; T.globalAlpha = 1;
    src = T.canvas;
  }
  const k = g.canvas.width / W;
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (o.clip) { g.beginPath(); g.rect(o.clip[0] * k, o.clip[1] * k, o.clip[2] * k, o.clip[3] * k); g.clip(); }
  g.globalAlpha = o.alpha ?? 1;
  if (o.op) g.globalCompositeOperation = o.op;
  if (o.flipX !== undefined) g.setTransform(-1, 0, 0, 1, 2 * o.flipX * k, 0);
  if (o.flipY !== undefined) g.setTransform(1, 0, 0, -1, 0, 2 * o.flipY * k);
  if (o.dx || o.dy) g.translate((o.dx || 0) * k, (o.dy || 0) * k);
  g.drawImage(src, 0, 0);
  g.restore();
}

// ---------------------------------------------------------------- light
// A cone of stage light as flat, hard-edged bands: brightest in the core. No gradients.
export function cone(g, x, y, ang, spread, len, col, a = .18, bands = 3) {
  g.save();
  g.translate(x, y); g.rotate(ang);
  for (let b = 0; b < bands; b++) {
    const s = spread * (1 - b / bands * .55);
    g.globalAlpha = a;
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(-6 * (1 - b / bands), 0); g.lineTo(6 * (1 - b / bands), 0);
    g.lineTo(Math.tan(s / 2) * len, len); g.lineTo(-Math.tan(s / 2) * len, len);
    g.closePath(); g.fill();
  }
  g.restore();
}
// A pool of light on the floor: flat stepped ellipses.
export function pool(g, x, y, rx, ry, col, a = .25, bands = 3) {
  g.save();
  for (let b = 0; b < bands; b++) {
    g.globalAlpha = a;
    g.fillStyle = col;
    g.beginPath(); g.ellipse(x, y, rx * (1 - b * .25), ry * (1 - b * .25), 0, 0, TAU); g.fill();
  }
  g.restore();
}
// The whole frame flashes: a strobe on the snare.
export function strobe(g, amt, col = C.bone) {
  if (amt <= .01) return;
  g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = clamp(amt);
  g.fillStyle = col; g.fillRect(0, 0, W, H); g.restore();
}
// An impact frame: for a frame or two on a big hit, the picture inverts to a black-and-white
// negative, as in an anime fight.
export function impact(g, on = true) {
  if (!on) return;
  g.save();
  g.globalCompositeOperation = 'difference'; g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'saturation'; g.fillStyle = '#808080'; g.fillRect(0, 0, W, H);
  g.restore();
}
// Camera shake from a hit: an offset that decays.
export function shake(t, t0, amp, decay = .1) {
  if (t < t0) return [0, 0];
  const e = Math.exp(-(t - t0) / decay);
  return [noise((t - t0) * 50, t0) * amp * e, noise((t - t0) * 50, t0 + 9) * amp * e];
}

// ---------------------------------------------------------------- grounds
export function fill(g, col) { g.fillStyle = col; g.fillRect(-50, -50, W + 100, H + 100); }
// A sunburst of flat wedges, the manga background for a big moment.
export function burst(g, cx, cy, n, a, b, rot = 0) {
  g.save();
  g.fillStyle = a; g.fillRect(-50, -50, W + 100, H + 100);
  g.fillStyle = b;
  const R = 3000;
  for (let i = 0; i < n; i++) {
    const a0 = rot + i / n * TAU, a1 = a0 + TAU / n / 2;
    g.beginPath(); g.moveTo(cx, cy);
    g.lineTo(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R);
    g.lineTo(cx + Math.cos(a1) * R, cy + Math.sin(a1) * R);
    g.closePath(); g.fill();
  }
  g.restore();
}
// The lacquered stage floor: black, with the room's lights lying in it as hard streaks.
export function floor(g, y, o = {}) {
  g.fillStyle = o.col || C.ink;
  g.fillRect(-50, y, W + 100, H - y + 50);
  g.fillStyle = C.ink2;
  g.fillRect(-50, y, W + 100, 4);
  const R = rng(o.seed ?? 3);
  for (let i = 0; i < (o.streaks ?? 5); i++) {
    const x = R() * W, w = lerp(30, 140, R());
    g.fillStyle = rgba(o.light || C.bone, .05 + R() * .05);
    g.fillRect(x, y + 10, w, H - y);
  }
}

// ---------------------------------------------------------------- kaleidoscope
// Draw a layer as an n-fold kaleidoscope about (cx, cy): the wedge of the source around
// (sx, sy) at angle `srcRot`, repeated round the centre, every other wedge mirrored, as between
// three mirrors in a tube.
export function kaleido(g, src, cx, cy, n, rot, sx, sy, o = {}) {
  const k = g.canvas.width / W, R = o.R ?? 1500, zoom = o.zoom ?? 1;
  const half = Math.PI / n;
  for (let i = 0; i < n; i++) {
    g.save();
    g.translate(cx, cy);
    g.rotate(rot + i * 2 * half);
    if (i % 2) g.scale(1, -1);
    g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R, -half - .004, half + .004); g.closePath(); g.clip();
    g.rotate(-(o.srcRot ?? 0));
    g.scale(zoom / k, zoom / k);
    g.drawImage(src.canvas, -sx * k, -sy * k);
    g.restore();
    if (o.seams) {
      g.save(); g.translate(cx, cy); g.rotate(rot + i * 2 * half + half);
      g.fillStyle = o.seams; g.fillRect(0, -1.5, R, 3); g.restore();
    }
  }
}
