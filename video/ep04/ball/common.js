// What the scenes share: placing a painted place under the camera, time ramps keyed to words and
// beats, a crowd of checks stamped from sprites, and small effects (confetti, sparkle, dust).
import { W, H, TAU, clamp, lerp, smooth, easeOut, backOut, easeInOut, now, hash, noise, rng, beatPos, when, wordsOf, REC, mono } from './kit.js';
import { INK, CREAM, CORAL, TEAL, OCHRE, ROSE, GOLD, GREEN, RED, WHITE, MINT, C } from './palette.js';
import { PLACE_OFF } from './places.js';
import { check } from './crew.js';
import { shape, ellipse, stroke, rrect } from './ink.js';
import { LEAD } from './lyrics.js';

// A place under a camera. cam = {x, y, z, r}: the world point at the frame's centre, zoom and roll.
export function place(g, canvas, cam = {}) {
  const z = cam.z ?? 1, x = cam.x ?? W / 2, y = cam.y ?? H / 2;
  g.translate(W / 2, H / 2); g.rotate(cam.r || 0); g.scale(z, z); g.translate(-x, -y);
  const m = mono();
  if (m > 0) g.filter = `sepia(${m.toFixed(3)}) saturate(${(1 - m * .6).toFixed(3)})`;
  g.drawImage(canvas, -PLACE_OFF[0], -PLACE_OFF[1]);
  g.filter = 'none';
}
// A camera that puts the floor line `floor` (world y) at screen y `at`, zoomed by z, centred on x.
export const floorCam = (x, z, floor, atY = 1480) => ({ x, y: floor - (atY - H / 2) / z, z });
// A camera moving between keys by song time: keys [[t, {x, y, z, r}]].
export function cam(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [ta, a] = keys[i], [tb, b] = keys[i + 1];
    if (t < tb) { const p = (b.ease || easeInOut)((t - ta) / (tb - ta)); return { x: lerp(a.x ?? W / 2, b.x ?? W / 2, p), y: lerp(a.y ?? H / 2, b.y ?? H / 2, p), z: lerp(a.z ?? 1, b.z ?? 1, p), r: lerp(a.r || 0, b.r || 0, p) }; }
  }
  return keys[keys.length - 1][1];
}
// The time a picture answers a sung word: the word's onset less the lettering's lead.
export const at = (line, w, nth = 0) => when(line, w, nth) - LEAD;
// Ramps: 0 → 1 over d seconds from a.
export const ramp = (t, a, d = .25) => clamp((t - a) / d);
export const pop = (t, a, d = .3) => backOut(clamp((t - a) / d), 2.2);
export const ease = (t, a, d = .4) => easeInOut(clamp((t - a) / d));
// A kick that decays after time a.
export const kick = (t, a, d = .25) => t < a ? 0 : Math.exp(-(t - a) / d);
// Shake offset for t after a.
export const shakeAt = (t, a, amp = 10, d = .35) => t < a ? 0 : Math.sin((t - a) * 55) * amp * Math.exp(-(t - a) / d);

// Sprites of a check at small size, keyed by flag state and frame, so a crowd of two hundred costs little.
const SPR = new Map();
export function checkSprite(flag, frame, s, card) {
  const k = `${flag}|${frame}|${s}|${card}`;
  let c = SPR.get(k);
  if (!c) {
    c = document.createElement('canvas'); c.width = Math.ceil(260 * s); c.height = Math.ceil(300 * s);
    const g = c.getContext('2d');
    check(g, c.width * .55, c.height - 4 * s, s, { t: frame / 12, card, flag, wave: true, phase: 0 });
    SPR.set(k, c);
  }
  return c;
}
export function stampCheck(g, x, y, s, flag, t, phase = 0, card = '✓') {
  const frame = Math.floor((t + phase) * 12) % 12;
  const spr = checkSprite(flag, frame, Math.round(s * 20) / 20, card);
  g.drawImage(spr, x - spr.width * .55, y - spr.height + 4 * s);
}

// Confetti falling over the frame from t0 (drawn on twos by `now`).
export function confetti(g, t, t0, n = 60, o = {}) {
  if (t < t0) return;
  const R = rng(o.seed ?? 3), cols = o.cols || [CORAL, TEAL, OCHRE, ROSE, GOLD, CREAM];
  const age = t - t0;
  for (let i = 0; i < n; i++) {
    const x0 = (o.x0 ?? 0) + R() * (o.w ?? W), v = 300 + R() * 400, sw = R() * 6;
    const y = (o.y0 ?? -60) + age * v - (o.burst ? Math.max(0, 600 - age * 1200) * R() : 0);
    const x = x0 + Math.sin(age * 3 + sw) * 40;
    if (y > H + 50) continue;
    g.save(); g.translate(x, y); g.rotate(age * 5 + sw); g.scale(1, Math.cos(age * 7 + sw));
    g.fillStyle = C(cols[i % cols.length]); g.fillRect(-9, -5, 18, 10);
    g.strokeStyle = C(INK); g.lineWidth = 2; g.strokeRect(-9, -5, 18, 10);
    g.restore();
  }
}
// A starburst of short ink lines around (x, y), for impacts.
export function burst(g, x, y, r, p, n = 10, col = INK, seed = 1) {
  if (p <= 0 || p >= 1) return;
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + hash(seed, i) * .3, r0 = r * (.5 + p * .8), r1 = r * (.8 + p * 1.2);
    stroke(g, [[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], { w: 9 * (1 - p) + 2, seed: seed + i, color: col });
  }
}
// A cartoon thought bubble with a tail toward (tx, ty).
export function bubble(g, x, y, w, h, tx, ty, o = {}) {
  const P = []; const n = 14;
  for (let i = 0; i < n; i++) { const a = i / n * TAU; const bump = 1 + (i % 2 ? .08 : 0); P.push([x + Math.cos(a) * w / 2 * bump, y + Math.sin(a) * h / 2 * bump]); }
  if (o.speech) {
    shape(g, [[x - w * .08, y + h * .35], [tx, ty], [x + w * .1, y + h * .38]], { fill: o.fill || WHITE, w: 5, seed: 1402 });
    shape(g, rrect(x - w / 2, y - h / 2, w, h, Math.min(w, h) * .3), { fill: o.fill || WHITE, w: 6, seed: 1401 });
    return;
  }
  for (let i = 0; i < 3; i++) { const u = (i + 1) / 4; shape(g, ellipse(lerp(tx, x, u * .7), lerp(ty, y + h * .4, u * .7), 8 + i * 6, 7 + i * 5), { fill: o.fill || WHITE, w: 4, seed: 1410 + i }); }
  shape(g, P, { fill: o.fill || WHITE, w: 6, seed: 1400, amt: 2 });
}
// Sparkles: little four-point stars twinkling around (x, y).
export function sparkle(g, x, y, r, t, n = 5, col = GOLD, seed = 7) {
  for (let i = 0; i < n; i++) {
    const ph = (t * 1.3 + hash(seed, i)) % 1, a = hash(seed, i, 2) * TAU, d = r * (.4 + hash(seed, i, 3) * .7);
    const sx = x + Math.cos(a) * d, sy = y + Math.sin(a) * d, k = Math.sin(ph * Math.PI) * (12 + hash(seed, i, 4) * 12);
    if (k < 1) continue;
    shape(g, [[sx, sy - k], [sx + k * .25, sy - k * .25], [sx + k, sy], [sx + k * .25, sy + k * .25], [sx, sy + k], [sx - k * .25, sy + k * .25], [sx - k, sy], [sx - k * .25, sy - k * .25]], { fill: col, w: 3, seed: seed + i, amt: .2 });
  }
}
// Speed lines behind a moving thing.
export function speedLines(g, x, y, dir, len, n = 5, seed = 3) {
  for (let i = 0; i < n; i++) { const oy = (i - (n - 1) / 2) * 22; stroke(g, [[x - dir * 30, y + oy], [x - dir * (30 + len * (0.6 + hash(seed, i) * .5)), y + oy]], { w: 5, seed: seed + i }); }
}
