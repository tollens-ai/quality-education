// The shot list and the camera. A shot is { a, b, draw(g, t, sh) }; scenes register theirs, and
// main.js draws whichever holds the frame, then the overlays (lettering that runs across cuts).
import { W, H, clamp, lerp, smooth, easeInOut, noise, hit, SONG } from './kit.js';
import { cam } from './space.js';

export const SHOTS = [];
export const OVERLAYS = [];
export function shot(a, b, draw, extra = {}) { const s = { a, b, draw, ...extra }; SHOTS.push(s); return s; }
export function overlay(a, b, draw) { const o = { a, b, draw }; OVERLAYS.push(o); return o; }
export const prog = (t, sh, ease = smooth) => ease(clamp((t - sh.a) / (sh.b - sh.a)));

// A camera that moves between two setups over a shot, with a hand-held drift, a breath on the
// kick and a shake on the snare. A setup is { pos: [x, y, z], at: [x, y, z], fov, roll }.
export function move(t, sh, from, to, o = {}) {
  const p = (o.ease || smooth)(clamp((t - sh.a) / (sh.b - sh.a)));
  const L = (a, b) => [lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p)];
  const hand = o.hand ?? 1, shake = o.shake ?? 0;
  const hx = noise(t * .45, 5) * 3 * hand, hy = noise(t * .4, 6) * 2.2 * hand;
  const sx = shake * noise(t * 31, 1) * hit('snare', t, .08), sy = shake * noise(t * 31, 2) * hit('snare', t, .08);
  const pos = L(from.pos, to.pos || from.pos);
  pos[0] += hx + sx; pos[1] += hy + sy;
  const at = L(from.at, to.at || from.at);
  const fov = lerp(from.fov ?? .7, to.fov ?? from.fov ?? .7, p) * (1 - (o.breathe ?? .008) * hit('kick', t, .1));
  const roll = lerp(from.roll ?? 0, to.roll ?? from.roll ?? 0, p) + noise(t * .35, 7) * .006 * hand;
  return cam(pos, at, { fov, roll });
}
