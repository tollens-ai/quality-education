// The people sheet: the cast the band built apps for, for checking the look.
import { W, H, C, INK, makeClock } from './kit.js';
import { inkify } from './ink.js';
import { GROOVE } from './cast.js';
import { CAST, who } from './people.js';
import { field, doodleField } from './zine.js';

let K;
export async function init(S) {
  const audio = await fetch('/video/ep02/garage/audio.json').then(r => r.json());
  K = makeClock(S.beats, audio);
}

export function draw(g0, t) {
  const g = inkify(g0);
  INK.boil = Math.floor(t * 15 + 1e-4) % 3;
  INK.res = g0.canvas.width / W;
  GROOVE.bp = K.beatPos(t); GROOVE.amp = .5;
  field(g, C.mint);
  const names = Object.keys(CAST);
  names.forEach((n, i) => {
    const x = 180 + (i % 3) * 360, y = 700 + Math.floor(i / 3) * 620;
    who(g, n, x, y, { s: 150, full: true, shadow: true });
  });
}
