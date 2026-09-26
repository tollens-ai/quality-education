// The audience in the foreground of close shots, seen from behind against the stage light: heads
// and shoulders, hands up on the beat, phones filming the band. `people` can put named characters
// in the front row.
import { W, C, lerp, rnd } from '../kit.js';
import { person } from '../cast.js';
import { behind, folk } from '../folk.js';

export function crowdFront(g, t, K, amount = 1, o = {}) {
  const bp = K.beatPos(t);
  const rows = o.rows ?? 3;
  const dawn = o.dawn || 0;
  for (let r = rows - 1; r >= 0; r--) {
    const n = Math.round((9 - r * 2) * amount) + 2;
    const k = 500 - r * 115, headY = 1740 - r * 100;
    for (let i = 0; i < n; i++) {
      const x = (i + .5 + (r % 2) * .5) / n * (W + 160) - 80 + (rnd(i + r * 17, 501) - .5) * 60;
      const f = folk(i + r * 40 + 500);
      const hop = Math.max(0, Math.sin((bp + rnd(i, 502) * .25) * Math.PI)) * .035 * k * (o.energy ?? 1);
      const pick = rnd(i + r * 31, 503);
      // Keep the singer clear: nobody right in front of Clawd holds anything up.
      const centre = Math.abs(x - 540) < 190 && r === 0;
      const arm = centre ? 'down' : pick > .66 ? 'phone' : pick > .5 ? 'wave' : pick > .42 ? 'fist' : 'down';
      const up = arm === 'phone' ? .55 + .1 * Math.sin(t * 1.3 + i) : .5 + .5 * Math.sin((bp + rnd(i, 505)) * Math.PI);
      behind(g, x, headY + (f.H - .15) * k, k, { ...f, lit: lerp(.17, .3, r / 2) + dawn * .22, night: dawn > .5 ? '#1c1024' : '#0b0612', rim: (i + r) % 2 ? C.pink : C.cyan, rimA: .65 - r * .12, arm, side: x < 540 ? 1 : -1, up, hop, sway: t * 2.2 + i, glow: .9 });
    }
  }
  // Named people in the very front row, facing the stage (seen from behind at a three-quarter).
  if (o.people) for (const p of o.people) person(g, p.x, p.y, { ...p.o, s: p.s });
}
