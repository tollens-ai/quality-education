// The title page: the notebook's first page. "THE 'ILITIES" is written on over the first four bars, the
// pencil drawing a title card for Clawd and Bruce, who jump in on the oom.
import { W, H, clamp, inv, easeOut, backOut, beatPos, beatPulse, downPulse, lerp } from '../kit.js';
import { shot, join } from '../shots.js';
import { paper } from '../paper.js';
import { write, measure } from '../hand.js';
import { blob } from '../pencil.js';
import { clawd, dachshund } from '../chars.js';
import { rosette, sparkle, burst } from '../props.js';
import { ground, meadow, sky, groove, pop, ramp } from '../common.js';
import { park, pigeon, butterfly } from '../world.js';
import { hop } from '../life.js';
import { GRAPHITE, C } from '../palette.js';

export function register(S) {
  const flipA = 2.321, flipB = 2.737;
  shot(0, flipB + .05, drawIntro, { id: 'intro' });
  join(flipA, flipB, 'push', { dir: [-1, 0] });
}

function drawIntro(g, t) {
  park(g, t, { horizon: 1300, sunAt: [965, 1150], sunR: 74, mood: t > 1.85 ? 'shades' : 'happy', look: [-.3, -.7], seed: 11, clouds: false, trees: false });
  const gr = groove(t, 1);
  // The rays go behind the title, so the letters sit on top of them.
  if (t > 1.85) burst(g, W / 2, 660, 250, 330 + 60 * ramp(t, 1.85, 2.2), t, { col: C.yellow, seed: 3, prog: ramp(t, 1.85, 2.15), n: 18, w: 8 });
  write(g, 'SOFTWARE QUALITY THEORY 101', W / 2, 300, 50, { col: '#2a4fa8', seed: 3, t, align: 'center', prog: ramp(t, .25, 1.15, x => x), track: 6 });
  write(g, 'EPISODE 3', W / 2, 372, 40, { col: '#2a4fa8', seed: 4, t, align: 'center', prog: ramp(t, .6, 1.05, x => x), track: 10 });
  write(g, 'THE', W / 2, 540, 118, { col: GRAPHITE, seed: 5, t, align: 'center', prog: ramp(t, .35, .8, x => x) });
  const ip = ramp(t, .7, 1.85, x => x);
  write(g, "'ILITIES", W / 2, 780, 212, { seed: 6, t, align: 'center', prog: ip, bubble: { fill: '#f5a03a', edge: '#8a4a1d', e: 2.0, f: 1.35 }, w: .1, dance: 12, beat: beatPos(t), pulse: gr.bp, track: 5 });
  // Prize ribbons on the beat.
  [[130, 950, C.red, 1.06, -.25], [W - 130, 940, C.teal, 1.48, .25], [W / 2, 1000, C.yellow, 1.91, 0]].forEach(([x, y, col, a, tilt], i) => {
    const k = pop(t, a);
    if (k > 0) { g.save(); g.translate(x, y); g.scale(k, k); g.translate(-x, -y); rosette(g, x, y, 62, col, t, { seed: 20 + i, tilt: tilt + gr.lean * 2 }); g.restore(); }
  });
  // A pigeon flaps in and lands on the title's first I (after its apostrophe); a butterfly drifts through.
  if (t > 1.2) {
    const u = clamp(inv(1.35, 1.95, t));
    const px = lerp(-120, 214, easeOut(u, 2)), py = lerp(260, 592, u * u) - Math.sin(u * Math.PI) * 120;
    pigeon(g, t, px, py, .8, { state: u < 1 ? 'flap' : 'perch', look: 1 });
  }
  butterfly(g, t, 800 + Math.sin(t * 1.4) * 70, 1030 + Math.sin(t * 2.2) * 26, .9, C.pink);
  // Clawd jumps in on the first beat of the flourish (0.233) and lands on the pah (0.653): something happens in the first half second.
  const jump = clamp(inv(.233, .653, t));
  const cy = 1340 - Math.sin(jump * Math.PI) * 150 * (t < .653 ? 1 : 0);
  clawd(g, { x: 330, y: t < .233 ? 2400 : cy + 130, s: 1.34, t, seed: 1, eyes: t > 2.1 ? 'happy' : 'open', mouth: 0, bob: gr.bob, squash: t > .653 ? gr.sq : (jump > 0 && jump < 1 ? -.25 * Math.sin(jump * Math.PI) : 0), lean: gr.lean, armR: { up: .6 + gr.bp * .4 }, armL: { up: .3 } });
  const dx = 1300 - 540 * ramp(t, 1.5, 2.2);
  dachshund(g, { x: dx, y: 1600, s: .78, flip: -1, t, seed: 2, walk: (beatPos(t) * .5) % 1, tail: beatPos(t) * .5, ear: gr.lean * 20, eyes: 'happy', mouth: .1, bob: gr.bob * .6 });
}
