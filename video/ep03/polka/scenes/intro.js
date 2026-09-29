// The title page: the notebook's first page. "THE ILITIES" is written on over the first four bars, the
// pencil drawing a title card for Clawd and Bruce, who jump in on the oom.
import { W, H, clamp, inv, easeOut, backOut, beatPos, beatPulse, downPulse } from '../kit.js';
import { shot, join } from '../shots.js';
import { paper } from '../paper.js';
import { write, measure } from '../hand.js';
import { blob } from '../pencil.js';
import { clawd, dachshund } from '../chars.js';
import { rosette, sparkle, burst } from '../props.js';
import { ground, meadow, sky, groove, pop, ramp } from '../common.js';
import { GRAPHITE, C } from '../palette.js';

export function register(S) {
  const flipA = 2.321, flipB = 2.737;
  shot(0, flipB + .05, drawIntro, { id: 'intro' });
  join(flipA, flipB, 'flip');
}

function drawIntro(g, t) {
  paper(g);
  sky(g, t, 780, { alpha: .26, col: '#79c2ef' });
  const gr = groove(t, 1);
  write(g, 'SOFTWARE QUALITY THEORY 101', W / 2, 290, 40, { col: C.blue, seed: 3, t, align: 'center', prog: ramp(t, .25, 1.15, x => x), track: 7 });
  write(g, 'EPISODE 3', W / 2, 352, 30, { col: C.blue, seed: 4, t, align: 'center', prog: ramp(t, .9, 1.35, x => x), track: 10 });
  write(g, 'THE', W / 2, 540, 118, { col: GRAPHITE, seed: 5, t, align: 'center', prog: ramp(t, .35, .8, x => x) });
  const ip = ramp(t, .7, 1.85, x => x);
  write(g, 'ILITIES', W / 2, 780, 212, { seed: 6, t, align: 'center', prog: ip, bubble: { fill: '#f5a03a', edge: '#8a4a1d', e: 2.0, f: 1.35 }, w: .1, dance: 12, beat: beatPos(t), pulse: gr.bp, track: 5 });
  if (t > 1.85) burst(g, W / 2, 660, 250, 330 + 60 * ramp(t, 1.85, 2.2), t, { col: C.yellow, seed: 3, prog: ramp(t, 1.85, 2.15), n: 18, w: 8 });
  // Prize ribbons on the beat.
  [[130, 950, C.red, 1.06, -.25], [W - 130, 940, C.teal, 1.48, .25], [W / 2, 1000, C.yellow, 1.91, 0]].forEach(([x, y, col, a, tilt], i) => {
    const k = pop(t, a);
    if (k > 0) { g.save(); g.translate(x, y); g.scale(k, k); g.translate(-x, -y); rosette(g, x, y, 62, col, t, { seed: 20 + i, tilt: tilt + gr.lean * 2 }); g.restore(); }
  });
  meadow(g, t, 1300);
  const jump = clamp(inv(1.06, 1.5, t));
  const cy = 1340 - Math.sin(jump * Math.PI) * 120 * (t < 1.5 ? 1 : 0);
  clawd(g, { x: 330, y: t < 1.06 ? 2100 : cy + 130, s: 1.34, t, seed: 1, eyes: t > 2.1 ? 'happy' : 'open', mouth: 0, bob: gr.bob, squash: t > 1.5 ? gr.sq : 0, lean: gr.lean, armR: { up: .6 + gr.bp * .4 }, armL: { up: .3 } });
  const dx = 1300 - 540 * ramp(t, 1.5, 2.2);
  dachshund(g, { x: dx, y: 1600, s: .78, flip: -1, t, seed: 2, walk: (beatPos(t) * .5) % 1, tail: beatPos(t) * .5, ear: gr.lean * 20, eyes: 'happy', mouth: .1, bob: gr.bob * .6 });
}
