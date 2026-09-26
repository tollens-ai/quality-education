// The audience in the foreground of close shots: backlit heads and shoulders, hands up on the
// beat, phone torches. `people` can put named characters in the front row.
import { W, H, C, TAU, clamp, lerp, rnd, rr, circle, ellipse, line, glow, rgba, mix, vgrad, rgrad } from '../kit.js';
import { person } from '../cast.js';

export function crowdFront(g, t, K, amount = 1, o = {}) {
  const bp = K.beatPos(t);
  g.save(); g.ink = null;
  const rows = o.rows ?? 3;
  const tops = ['#2a1a4a', '#3a1a3a', '#1a2a4a', '#2a2a3a', '#40203a'];
  for (let r = rows - 1; r >= 0; r--) {
    const n = Math.round((9 - r * 2) * amount) + 2;
    const y0 = 1920 - r * 150 + 40, s = 1 - r * .22;
    for (let i = 0; i < n; i++) {
      const x = (i + .5 + (r % 2) * .5) / n * (W + 160) - 80 + (rnd(i + r * 17, 501) - .5) * 60;
      const hop = Math.max(0, Math.sin((bp + rnd(i, 502) * .25) * Math.PI)) * 18 * s * (o.energy ?? 1);
      const hr = 70 * s, cy = y0 - 250 * s - hop;
      const dark = mix('#07030f', tops[(i + r) % tops.length], .5 - r * .1);
      g.fillStyle = dark;
      rr(g, x - 150 * s, cy + hr * .8, 300 * s, 500 * s, 110 * s); g.fill();
      circle(g, x, cy, hr); g.fill();
      // Hair tufts.
      g.beginPath(); g.ellipse(x, cy - hr * .2, hr * 1.06, hr * .85, 0, Math.PI, TAU); g.fill();
      // Stage light catching the edges.
      const rim = (i + r) % 2 ? C.pink : C.cyan;
      g.strokeStyle = rgba(rim, .55 - r * .12); g.lineWidth = 5 * s;
      g.beginPath(); g.arc(x, cy, hr, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
      g.beginPath(); g.arc(x, cy + hr * 2.4, 150 * s, Math.PI * 1.15, Math.PI * 1.4); g.stroke();
      // Hands up on the beat; some hold phones.
      if (rnd(i + r * 31, 503) > .45) {
        const side = rnd(i, 504) > .5 ? 1 : -1;
        const up = .6 + .4 * Math.sin((bp + rnd(i, 505)) * Math.PI);
        const hx = x + side * (90 + 30 * up) * s, hy = cy - (140 + 110 * up) * s;
        g.strokeStyle = dark; g.lineWidth = 46 * s; g.lineCap = 'round';
        line(g, x + side * 110 * s, cy + hr * 1.6, hx, hy); g.stroke();
        g.fillStyle = dark; circle(g, hx, hy - 10 * s, 30 * s); g.fill();
        if (rnd(i + r, 506) > .5) {
          glow(g, hx, hy - 50 * s, 120 * s, '#dfe8ff', .4);
          g.fillStyle = '#eef4ff'; rr(g, hx - 18 * s, hy - 90 * s, 36 * s, 64 * s, 8 * s); g.fill();
        } else if (rnd(i + r, 507) > .5) {
          // Devil horns / a wave.
          g.strokeStyle = dark; g.lineWidth = 14 * s;
          line(g, hx - 12 * s, hy - 30 * s, hx - 18 * s, hy - 70 * s); g.stroke(); line(g, hx + 12 * s, hy - 30 * s, hx + 18 * s, hy - 70 * s); g.stroke();
        }
      }
    }
  }
  g.restore();
  // Named people in the very front row, facing the stage (seen from behind at a three-quarter).
  if (o.people) for (const p of o.people) person(g, p.x, p.y, { ...p.o, s: p.s });
}
