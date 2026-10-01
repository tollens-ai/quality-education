// What the scenes share: a painted place under a camera, cameras keyed to song time, time ramps
// keyed to words and beats, and small effects (confetti, bursts, sparkles, speed lines, dust).
import { W, H, TAU, clamp, lerp, smooth, easeOut, backOut, easeInOut, now, hash, noise, rng, beatPos, when, wordsOf, REC, mono } from './kit.js';
import { INK, CREAM, CORAL, TEAL, OCHRE, ROSE, GOLD, GREEN, RED, WHITE, MINT, C } from './palette.js';
import { FLOOR_Y } from './places.js';
import { shape, ellipse, stroke, rrect } from './ink.js';
import { LEAD } from './lyrics.js';

// Put world coordinates under a camera {x, y, z, r}: the world point (x, y) lands at the frame's
// centre. Then draw a place's canvas (its world is its own pixels).
export function look(g, cam) {
  const z = cam.z ?? 1;
  g.translate(W / 2 + (cam.sx ?? 0), H / 2 + (cam.sy ?? 0)); g.rotate(cam.r || 0); g.scale(z, z); g.translate(-(cam.x ?? W / 2), -(cam.y ?? H / 2));
}
export function place(g, canvas, cam = {}) {
  look(g, cam);
  const m = mono();
  if (m > 0) g.filter = `sepia(${m.toFixed(3)}) saturate(${(1 - m * .6).toFixed(3)})`;
  g.drawImage(canvas, -(canvas.ox || 0), 0);
  g.filter = 'none';
}
// A camera that puts the world floor line `floor` at screen y `at` (FLOOR_Y), zoomed by z, centred on x.
export const floorCam = (x, z, floor, at = FLOOR_Y) => ({ x, y: floor - (at - H / 2) / z, z });
// A camera moving between keys by song time: keys [[t, {x, y, z, r}], ...].
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
export const ramp = (t, a, d = .25) => clamp((t - a) / d);
export const pop = (t, a, d = .3) => backOut(clamp((t - a) / d), 2.2);
export const ease = (t, a, d = .4) => easeInOut(clamp((t - a) / d));
export const kick = (t, a, d = .25) => t < a ? 0 : Math.exp(-(t - a) / d);
export const shakeAt = (t, a, amp = 10, d = .35) => t < a ? 0 : Math.sin((t - a) * 55) * amp * Math.exp(-(t - a) / d);

// Confetti falling over the frame from t0.
export function confetti(g, t, t0, n = 60, o = {}) {
  if (t < t0) return;
  const R = rng(o.seed ?? 3), cols = o.cols || [CORAL, TEAL, OCHRE, ROSE, GOLD, CREAM];
  const age = t - t0;
  for (let i = 0; i < n; i++) {
    const x0 = (o.x0 ?? 0) + R() * (o.w ?? W), v = 300 + R() * 400, sw = R() * 6, burst = o.burst ? (R() * 900 + 300) : 0;
    const y = (o.y0 ?? -60) + age * v - (o.burst ? Math.max(0, burst - age * burst * 2.2) : 0);
    const x = x0 + Math.sin(age * 3 + sw) * 40;
    if (y > H + 50) continue;
    g.save(); g.translate(x, y); g.rotate(age * 5 + sw); g.scale(1, Math.cos(age * 7 + sw));
    g.fillStyle = C(cols[i % cols.length]); g.fillRect(-10, -6, 20, 12);
    g.strokeStyle = C(INK); g.lineWidth = 2.2; g.strokeRect(-10, -6, 20, 12);
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
// Sparkles: little four-point stars twinkling around (x, y).
export function sparkle(g, x, y, r, t, n = 5, col = GOLD, seed = 7) {
  for (let i = 0; i < n; i++) {
    const ph = (t * 1.3 + hash(seed, i)) % 1, a = hash(seed, i, 2) * TAU, d = r * (.4 + hash(seed, i, 3) * .7);
    const sx = x + Math.cos(a) * d, sy = y + Math.sin(a) * d, k = Math.sin(ph * Math.PI) * (12 + hash(seed, i, 4) * 12);
    if (k < 1) continue;
    shape(g, [[sx, sy - k], [sx + k * .25, sy - k * .25], [sx + k, sy], [sx + k * .25, sy + k * .25], [sx, sy + k], [sx - k * .25, sy + k * .25], [sx - k, sy], [sx - k * .25, sy - k * .25]], { fill: col, w: 3, seed: seed + i, amt: .2, form: false });
  }
}
// Speed lines behind a moving thing.
export function speedLines(g, x, y, dir, len, n = 5, seed = 3, col = INK) {
  for (let i = 0; i < n; i++) { const oy = (i - (n - 1) / 2) * 22; stroke(g, [[x - dir * 30, y + oy], [x - dir * (30 + len * (0.6 + hash(seed, i) * .5)), y + oy]], { w: 5, seed: seed + i, color: col }); }
}
// A soft shadow on the floor under a character.
export function footShadow(g, x, y, w, a = .3) {
  g.save(); g.globalAlpha *= a; g.fillStyle = '#1a0c04'; g.filter = 'blur(6px)';
  g.beginPath(); g.ellipse(x, y + 4, w / 2, w * .09, 0, 0, TAU); g.fill(); g.restore();
}
// The lower frame falling into shade, for a close-up that would otherwise put something pale (a
// phone's page, a sheet of paper) behind the lyric: clear above y0, `a` dark from y0 + 190 down.
// Call it last in the shot, outside any camera transform (in the frame's own pixels); the lyric is
// drawn over it.
export function lowerShade(g, a = .55, y0 = 1040) {
  g.save();
  const gr = g.createLinearGradient(0, y0, 0, y0 + 190);
  gr.addColorStop(0, 'rgba(20,10,5,0)'); gr.addColorStop(1, `rgba(20,10,5,${a})`);
  g.fillStyle = gr; g.fillRect(-20, y0, W + 40, H - y0 + 20); g.restore();
}

// An iris insert, the silent film's close-up: black all round, and a circle (centre cx, cy, radius
// r, in screen pixels) through which `inside(g)` draws its picture. The lyric's apron stays dark.
// `open` 0..1 lets the circle grow in.
export function irisInsert(g, cx, cy, r, inside, open = 1, o = {}) {
  const R = r * Math.max(0, open), dark = o.dark ?? 1;
  g.save(); g.globalAlpha = dark; g.fillStyle = INK; g.beginPath(); g.rect(-20, -20, W + 40, H + 40); if (R >= 2) g.arc(cx, cy, R, 0, TAU, true); g.fill('evenodd'); g.restore();
  if (R < 2) return;
  g.save(); g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.clip();
  inside(g, cx, cy, R);
  // the lens's own soft vignette, and its inked rim
  const vg = g.createRadialGradient(cx, cy, R * .6, cx, cy, R);
  vg.addColorStop(0, 'rgba(20,10,4,0)'); vg.addColorStop(1, 'rgba(20,10,4,.55)');
  g.fillStyle = vg; g.fillRect(cx - R, cy - R, R * 2, R * 2);
  g.restore();
  g.save(); g.strokeStyle = C(o.rim || INK); g.lineWidth = o.rimW ?? 10; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.stroke(); g.restore();
}
// Draw into an offscreen layer the size of the frame (with the same transform), then treat the
// layer as a whole (tint it, light it) and lay it on the frame. `post(lg)` runs on the layer's
// context after drawing, e.g. to darken everything drawn (a backlit silhouette).
let LAYER = null;
export function withLayer(g, draw, post) {
  const cv = g.canvas;
  if (!LAYER || LAYER.width !== cv.width || LAYER.height !== cv.height) { LAYER = document.createElement('canvas'); LAYER.width = cv.width; LAYER.height = cv.height; }
  const lg = LAYER.getContext('2d');
  lg.setTransform(1, 0, 0, 1, 0, 0); lg.clearRect(0, 0, LAYER.width, LAYER.height);
  lg.setTransform(g.getTransform());
  draw(lg);
  if (post) { lg.save(); lg.setTransform(1, 0, 0, 1, 0, 0); post(lg, LAYER.width, LAYER.height); lg.restore(); }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(LAYER, 0, 0); g.restore();
}
// A post for withLayer: darken what's drawn toward a silhouette, keeping a rim of light.
export const backlit = (k = .7, col = '30,16,10') => (lg, w, h) => { lg.globalCompositeOperation = 'source-atop'; lg.fillStyle = `rgba(${col},${k})`; lg.fillRect(0, 0, w, h); };
