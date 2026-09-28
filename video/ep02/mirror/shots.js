// The shot list, and the camera. A shot is { a, b, draw(g, t, S, shot) }; scenes add theirs.
import { W, H, clamp, lerp, smooth, easeInOut, env, hit, noise } from './kit.js';

export const SHOTS = [];
// Lettering that runs across cuts (backing vocals mostly) keeps its own clock: an overlay is
// drawn on top of whatever shot is up, from a to b.
export const OVERLAYS = [];
export function overlay(a, b, draw) { const o = { a, b, draw }; OVERLAYS.push(o); return o; }
export function shot(a, b, draw, extra = {}) {
  const s = { a, b, draw, ...extra };
  SHOTS.push(s);
  return s;
}

// Put the frame under a camera that moves from `from` to `to` over the shot: {x, y, z, r} is the
// point at the frame's centre, the zoom and a roll. It breathes with the kick drum.
export function camera(g, t, sh, from, to, o = {}) {
  const p = (o.ease || smooth)(clamp((t - sh.a) / (sh.b - sh.a)));
  const x = lerp(from.x ?? W / 2, to.x ?? W / 2, p), y = lerp(from.y ?? H / 2, to.y ?? H / 2, p);
  let z = lerp(from.z ?? 1, to.z ?? 1, p);
  const r = lerp(from.r ?? 0, to.r ?? 0, p);
  z *= 1 + (o.breathe ?? .012) * hit('kick', t, .1);
  const sx = (o.shake ?? 0) * noise(t * 31, 1) * hit('snare', t, .08);
  const sy = (o.shake ?? 0) * noise(t * 31, 2) * hit('snare', t, .08);
  // A hand-held camera, as a 2000s rock video has: it drifts and rolls a little, always.
  const hand = o.hand ?? 1;
  const hx = noise(t * .45, 5) * 16 * hand, hy = noise(t * .4, 6) * 12 * hand, hr = noise(t * .35, 7) * .008 * hand;
  g.translate(W / 2 + sx + hx, H / 2 + sy + hy);
  g.rotate(r + hr);
  g.scale(z, z);
  g.translate(-x, -y);
  return { x, y, z, r, p };
}
