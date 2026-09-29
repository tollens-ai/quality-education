// The outro (208.3-211.95) and the end card. After the held "know!" the last band tag: drum hits at
// 209.3, 209.8 and a strong one at 210.83, a low bass note at 210.4, the last chord at 211.27 ringing out.
// The show is over in the golden light: on each hit another dog flops down asleep in a heap, Clawd nods
// off with the three rosettes that were his pinned on, and on the last chord Bruce lifts his head and
// winks at the camera; then the picture closes to a circle on his eye, on the end card.
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
import { confetti, ROSETTES } from '../ringcast.js';
import { GRAPHITE, C } from '../palette.js';
import { endCard } from './endcard.js';

const HITS = [209.3, 209.8, 210.25, 210.55, 210.83];    // the band's tag: a dog goes down on each
const WINK = 211.27;

// The pile of dogs: [breed, x, y, scale, tilt, the moment it goes to sleep].
const PILE = [
  ['poodle', 240, 1190, 1.3, -.05, 209.3], ['lab', 520, 1175, 1.4, .03, 209.8], ['corgi', 800, 1190, 1.32, .05, 210.25], ['husky', 1000, 1215, 1.2, .08, 210.55],
  ['beagle', 380, 1300, 1.3, -.07, 209.55], ['pug', 660, 1305, 1.35, .04, 210.05], ['bulldog', 920, 1315, 1.28, .06, 210.4], ['dalmatian', 150, 1330, 1.2, -.09, 210.7],
];

export function register(S) {
  shot(208.3, 212.0, drawOutro, { id: 'outro' });
  shot(211.9, 230, (g, t) => endCard(g, t), { id: 'endcard' });
  join(211.55, 211.95, 'irisclose', { at: [820, 1280], col: '#3a2a1a' });
}

function drawOutro(g, t) {
  const gr = groove(t, .6);
  window.__markInk = GRAPHITE;
  ringBackdrop(g, t, { mood: 'gold', sunMood: t > 209.3 ? 'sleepy' : 'happy', look: [0, .4], bunt: true });
  // The last confetti, settling.
  confetti(g, t, 205.4, 4.2, { seed: 9, n: 60, y0: 120, y1: 1450 });
  // Clawd, at the left, with the three rosettes that are his; he nods off after the last dog.
  const asleep = t > 210.83;
  clawd(g, { x: 215, y: 1500, s: 1.0, t, seed: 1, eyes: asleep ? 'shut' : 'happy', mouth: asleep ? 0 : clamp(loud('vocals', t) * 1.4), bob: asleep ? 0 : gr.bob, squash: asleep ? .12 : gr.sq, lean: asleep ? -.08 : gr.lean, armL: { up: asleep ? -.5 : .4 }, armR: { up: asleep ? -.5 : .4 }, cheeks: true });
  [[C.blue, 130, 1400], [C.purple, 205, 1380], [C.teal, 280, 1400]].forEach(([col, x, y], i) => rosette(g, x, y - (asleep ? 0 : Math.sin(t * 6 + i) * 4), 34, col, t, { seed: 700 + i, tilt: (i - 1) * .2 }));
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
  // Bruce in front, awake while the others sleep; he winks on the last chord.
  const winking = t > WINK && t < WINK + .55;
  const w = spring(t, WINK, { f: 3, z: .35 });
  dachshund(g, { x: 520, y: 1500, s: .9, t, seed: 2, walk: 0, tail: t * .8, wag: t > WINK ? 1.2 : .5, eyes: winking ? 'happy' : 'open', mouth: t > WINK ? .55 : .1, tongue: t > WINK, ear: 0, bob: t > WINK ? Math.sin(w * Math.PI) * 10 : 0, squash: t > WINK ? (1 - w) * .2 : 0 });
  if (t > WINK && t < WINK + .5) sparkle(g, 838, 1268, 26 * Math.sin((t - WINK) / .5 * Math.PI) + 4, t, { seed: 730, rot: (t - WINK) * 5 });
  pigeon(g, t, 1005, 1030, .62, { flip: -1, state: 'sleep', bounce: 0 });
}
