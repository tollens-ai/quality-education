// Shots and the joins between them. A shot is a stretch of song time and a function that draws
// the whole picture for it (not the lyric, which runs on its own over every shot). Joins are the
// old cartoon ones: a cut, an iris closing to black and opening on the next shot, or a wipe.
import { W, H, clamp, smooth, easeInOut, lerp } from './kit.js';
import { iris } from './film.js';
import { INK } from './palette.js';

export const SHOTS = [];
export const JOINS = [];
// shot(a, b, draw, {id}): draw(g, t, u) with u the shot's progress 0..1.
export function shot(a, b, draw, o = {}) { SHOTS.push({ a, b, draw, ...o }); }
// An iris join at time t: closes over `close` seconds before t, opens over `open` after, centred on (x, y).
export function irisJoin(t, o = {}) { JOINS.push({ kind: 'iris', t, close: o.close ?? .35, open: o.open ?? .4, x: o.x ?? W / 2, y: o.y ?? H * .55, x2: o.x2, y2: o.y2, hold: o.hold ?? 0 }); }
export function wipeJoin(t, o = {}) { JOINS.push({ kind: 'wipe', t, d: o.d ?? .3, dir: o.dir ?? 1 }); }

export function shotAt(t) {
  let s = null;
  for (const x of SHOTS) if (t >= x.a && t < x.b) s = x;
  return s;
}
// Draw the picture at t, then the join over it.
export function drawShots(g, t) {
  // a wipe shows two shots at once
  for (const j of JOINS) if (j.kind === 'wipe' && t >= j.t - j.d && t < j.t) {
    const p = easeInOut((t - (j.t - j.d)) / j.d);
    const A = shotAt(j.t - j.d - 1e-3), B = shotAt(j.t + 1e-3);
    if (A) { g.save(); A.draw(g, t, clamp((t - A.a) / (A.b - A.a))); g.restore(); }
    if (B) {
      g.save(); g.beginPath();
      const x = j.dir > 0 ? W * (1 - p) : 0, w = W * p;
      g.rect(x, 0, w, H); g.clip();
      B.draw(g, t, 0); g.restore();
      g.save(); g.fillStyle = INK; g.fillRect(j.dir > 0 ? x - 10 : w, 0, 10, H); g.restore();
    }
    return;
  }
  const s = shotAt(t);
  if (s) { g.save(); s.draw(g, t, clamp((t - s.a) / (s.b - s.a))); g.restore(); }
  else { g.fillStyle = INK; g.fillRect(0, 0, W, H); }
}
export function drawJoins(g, t) {
  for (const j of JOINS) if (j.kind === 'iris') {
    const R = Math.hypot(W, H) * .62;
    if (t >= j.t - j.close && t < j.t) { const p = smooth((t - (j.t - j.close)) / j.close); iris(g, j.x, j.y, R * (1 - p)); }
    else if (t >= j.t && t < j.t + j.hold) iris(g, W / 2, H / 2, 0);
    else if (t >= j.t + j.hold && t < j.t + j.hold + j.open) { const p = smooth((t - j.t - j.hold) / j.open); iris(g, j.x2 ?? j.x, j.y2 ?? j.y, R * p); }
  }
}

// A camera for a shot: keys [[t, x, y, zoom, rot]]; returns a function applying it around the frame centre.
export function camera(g, keys, t) {
  let k = keys[0];
  if (t >= keys[keys.length - 1][0]) k = keys[keys.length - 1];
  else for (let i = 0; i < keys.length - 1; i++) if (t >= keys[i][0] && t < keys[i + 1][0]) {
    const A = keys[i], B = keys[i + 1], p = (B[5] || easeInOut)((t - A[0]) / (B[0] - A[0]));
    k = [t, lerp(A[1], B[1], p), lerp(A[2], B[2], p), lerp(A[3], B[3], p), lerp(A[4] || 0, B[4] || 0, p)];
    break;
  }
  if (t < keys[0][0]) k = keys[0];
  g.translate(W / 2, H / 2); g.rotate(k[4] || 0); g.scale(k[3], k[3]); g.translate(-k[1], -k[2]);
  return k;
}
