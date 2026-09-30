// The camera. Every shot is the same flat world seen from a different place, so a camera here is a
// scale and a point to hold in the middle, eased across the shot, plus the shake a stamp gives.

import { smooth, clamp01, lerp, easeOut } from './kit.js';

export const CX = 540, CY = 960;

export function cam(g, t, o) {
  const from = o.from || { x: CX, y: CY, z: 1 };
  const to = o.to || from;
  const p = o.hold ? smooth(clamp01((t - o.hold[0]) / (o.hold[1] - o.hold[0]))) : 1;
  const drift = o.drift ? o.drift(t) : 0;
  const e = (o.ease || smooth)(p);
  const z = lerp(from.z, to.z, e) * (1 + drift);
  g.translate(CX, CY);
  g.scale(z, z);
  g.translate(-lerp(from.x, to.x, e), -lerp(from.y, to.y, e));
}

// The whole frame moves when something lands hard, and settles.
export function shake(g, t, t0, amp = 9) {
  const p = t - t0;
  if (p < 0 || p > 0.5) return;
  const a = amp * (1 - p / 0.5) ** 2;
  g.translate(Math.sin(p * 74) * a, Math.cos(p * 61) * a * 0.7);
}

// Words must stay clear of the platform UI: the bottom 400px, and the right 140px below the middle.
export function safe(x, y, w) {
  return { ok: y + 60 < 1520 && (y < 960 || x + w / 2 <= 936), x, y, w };
}