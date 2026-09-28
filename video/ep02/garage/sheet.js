// The cast sheet: ASYNC and their instruments on one page, for checking the look.
//   node video/lib/render.mjs --scene video/ep02/garage/sheet.js --song music/ep02 --stills 20 --w 1080
import { W, H, C, INK, makeClock } from './kit.js';
import { inkify } from './ink.js';
import { GROOVE } from './cast.js';
import { play, member } from './band.js';
import { field, cut, doodleField, checker, tape, sunburst } from './zine.js';
import { letter } from './hand.js';
import { rr } from './kit.js';

let K;
export async function init(S) {
  const audio = await fetch('/video/ep02/garage/audio.json').then(r => r.json());
  K = makeClock(S.beats, audio);
}

export function draw(g0, t) {
  const g = inkify(g0);
  INK.boil = Math.floor(t * 15 + 1e-4) % 3;
  INK.res = g0.canvas.width / W;
  GROOVE.bp = K.beatPos(t); GROOVE.amp = .8;
  sunburst(g, 540, 700, 1600, 20, C.pink, '#ff5a9d', t * .05);
  checker(g, { x0: -300, x1: 1380, yTop: 1180, yBot: 1960, cols: 12, rows: 7, c1: C.ink, c2: C.cream });
  doodleField(g, 40, 180, 1000, 500, 18, 3, { col: C.ink, cols: [C.yellow, C.cream, C.mint] });
  cut(g, () => rr(g, 170, 120, 740, 150, 10), C.yellow, { drop: 12, border: 0 });
  tape(g, 200, 130, 120, -.3); tape(g, 880, 130, 120, .3);
  letter(g, 'MEET ASYNC', 540, 235, 96, { col: C.ink, w: .2, align: 'center', seed: 3 });
  play(g, t, K, 'bad', 540, 1140, { s: 210 });
  play(g, t, K, 'elder', 220, 1420, { s: 230 });
  play(g, t, K, 'builder', 860, 1420, { s: 230 });
  play(g, t, K, 'soft', 250, 1760, { s: 240 });
  play(g, t, K, 'lead', 820, 1760, { s: 250, sing: 1 });
  member(g, 540, 1800, 'gran', { s: 170, t, eyes: 'happy', smile: 1 });
}
