// The outro (208.3-211.95) and the end card. After the held "know!" the last band tag: drum hits at
// 209.3, 209.8 and a strong one at 210.83 s, a low bass note at 210.4 s, the last chord at 211.27 s ringing out.
// The show is over in the golden light: on each hit another dog flops down asleep in a heap behind Clawd, who
// stays awake in front of them in his bowler with the three rosettes that are his pinned on, glancing round at
// each; on the last chord he turns to you and winks, and the picture closes to a circle on his open eye, on the
// end card. (A fresh viewer wanted the film to end on Clawd's face, asking you, not on a nap.)
import { W, H, TAU, clamp, lerp, hash, inv, easeOut, easeIn, backOut, beatPulse, hit, lastHit, loud } from '../kit.js';
import { shot, join } from '../shots.js';
import { blob, line, dot } from '../pencil.js';
import { write } from '../hand.js';
import { clawd, dachshund } from '../chars.js';
import { dogFront } from '../people.js';
import { rosette, sparkle } from '../props.js';
import { ringBackdrop, RING } from '../ring.js';
import { pigeon } from '../world.js';
import { groove, pop } from '../common.js';
import { spring, gate, ease, wander } from '../life.js';
import { confetti, ROSETTES, bowler } from '../ringcast.js';
import { GRAPHITE, C } from '../palette.js';
import { endCard, PAGE_BREAK } from './endcard.js';

const HITS = [209.3, 209.8, 210.25, 210.55, 210.83];    // the band's tag: a dog goes down on each
const WINK = 211.27;

// The pile of dogs: [breed, x, y, scale, tilt, the moment it goes to sleep].
const PILE = [
  ['poodle', 150, 1200, 1.15, -.05, 209.3], ['lab', 400, 1150, 1.25, .03, 209.8], ['corgi', 690, 1150, 1.2, .05, 210.25], ['husky', 940, 1190, 1.1, .08, 210.55],
  ['beagle', 260, 1320, 1.15, -.07, 209.55], ['pug', 830, 1330, 1.15, .04, 210.05], ['bulldog', 1000, 1330, 1.0, .06, 210.4], ['dalmatian', 90, 1330, 1.0, -.09, 210.7],
];

export function register(S) {
  shot(208.3, 212.0, drawOutro, { id: 'outro' });
  shot(211.9, PAGE_BREAK + .4, (g, t) => endCard(g, t, 0), { id: 'endcard-1' });
  shot(PAGE_BREAK, 230, (g, t) => endCard(g, t, 1), { id: 'endcard-2' });
  join(211.55, 211.95, 'irisclose', { at: [653, 1300], col: '#3a2a1a' });
  join(PAGE_BREAK, PAGE_BREAK + .4, 'push', { dir: [-1, 0] });
}

function drawOutro(g, t) {
  const gr = groove(t, .6);
  window.__markInk = GRAPHITE;
  ringBackdrop(g, t, { mood: 'gold', sunMood: t > 209.3 ? 'sleepy' : 'happy', look: [0, .4], bunt: true });
  // The last confetti, settling.
  confetti(g, t, 205.4, 4.2, { seed: 9, n: 60, y0: 120, y1: 1450 });
  // The heap.
  PILE.forEach(([breed, x, y, s, tilt, sleepAt], i) => {
    const down = t > sleepAt, k = clamp((t - sleepAt) / .25);
    const bp = down ? Math.sin(t * 2.2 + i) * 3 : gr.bp * 8;
    dogFront(g, { x, y: y + k * 22 - bp, s, t, seed: 60 + i, breed, eyes: down ? 'shut' : 'happy', mouth: down ? 0 : clamp(loud('vocals', t) * 1.2 + .1), tilt: tilt * k + (down ? 0 : gr.lean * 1.5), body: true, collar: ROSETTES[(i * 3) % 12], ear: down ? .8 : gr.lean * 10 });
  });
  // Z's floating up from the dogs that are asleep.
  PILE.forEach(([breed, x, y, s, tilt, sleepAt], i) => {
    const u = ((t - sleepAt - i * .17) % 1.6) / 1.6;
    if (t < sleepAt + .3 || u < 0) return;
    g.save(); g.globalAlpha *= Math.sin(clamp(u) * Math.PI) * .9;
    write(g, i % 2 ? 'Z' : 'z', x + 60 + Math.sin(u * 5 + i) * 14, y - 200 * s - u * 130, 34 + u * 22, { col: '#6b5a3a', seed: 720 + i, t, align: 'center', w: .12 });
    g.restore();
  });
  // Bruce is asleep too, curled at the front on the right.
  dachshund(g, { x: 905, y: 1500, s: .74, flip: -1, t, seed: 2, walk: 0, tail: t * .5, wag: .15, eyes: 'happy', mouth: 0, ear: 0, bob: Math.sin(t * 2.2) * 2, life: .4 });
  // Clawd, awake, in front: in his bowler with the blue, purple and teal rosettes on it; he looks round at each dog that
  // goes down, then at you, and on the last chord he winks (left eye shut) and the light catches his open eye.
  const last = t > 210.83, wink = t > WINK && t < WINK + 1.0;
  const glance = t < 210.83 ? Math.sin(t * 3.1) * .8 : 0;
  const c = { x: 540, y: 1540, s: 1.32 };
  clawd(g, { ...c, t, seed: 1, eyes: wink ? ['happy', 'open'] : 'open', mouth: wink ? .2 : t < 209.3 ? clamp(loud('vocals', t) * 1.4) : 0, look: last ? [0, .1] : [glance, .2], bob: t < 209.3 ? gr.bob : 0, squash: t < 209.3 ? gr.sq : .05, lean: t < 209.3 ? gr.lean : 0,
    armL: { up: last ? .5 : .15 }, armR: { up: last ? .5 : .15 }, cheeks: true, brow: last ? -.2 : 0,
    prop: (g2, po) => {
      bowler(g2, t, po);
      [[C.blue, -52, -300], [C.purple, 0, -318], [C.teal, 52, -300]].forEach(([col, x, y], i) => rosette(g2, x, y, 25, col, t, { seed: 700 + i, tilt: (i - 1) * .25 }));
    } });
  if (t > WINK && t < WINK + .5) sparkle(g, 653, 1300, 34 * Math.sin((t - WINK) / .5 * Math.PI) + 4, t, { seed: 730, rot: (t - WINK) * 5 });
  pigeon(g, t, 1005, 1030, .62, { flip: -1, state: 'sleep', bounce: 0 });
}
