// "The Counter": the film's entry point.
//
// The renderer loads this module against music/ep01. Every shot's boundaries are the sung lines'
// boundaries, so a cut never lands inside a word, and each shot draws its own words after it has
// released the camera — the type is never scaled by the picture.

import { P } from './palette.js';
import { drawText } from './type.js';
import { tollensMark } from './marks.js';
import { boilAt, smooth, clamp01, easeOut } from './kit.js';
import * as a from './scenes/a.js';
import * as b from './scenes/b.js';
import * as c from './scenes/c.js';

const PARTS = [a, b, c];

// Every shot's window, in the order they are sung. The cut is on the line boundary.
const CUTS = [
  0.00, 4.52, 8.00, 10.76, 13.20, 15.64, 17.04, 18.66, 20.80, 22.32, 24.00, 25.04,
  27.20, 29.92, 32.72, 35.44, 38.08, 40.76, 43.62, 46.46, 51.00, 53.38, 56.10, 58.44,
  61.64, 64.32, 66.98, 69.74, 76.54, 78.08, 79.76, 80.76, 82.96, 85.68, 88.44, 91.04,
  93.82, 96.54, 99.30, 102.20, 107.10, 112.30, 117.32, 123.36, 128.80, 134.68, 137.48,
  139.24, 142.42, 147.56, 150.36, 153.32, 155.22, 160.50, 163.18, 166.17, 168.74, 171.34,
  174.12, 176.74, 179.72, 184.84, 187.70, 190.40, 193.26, 200.02,
];

// The end card holds past the song's last word, so the credits can actually be read. The take ends
// at 200.74s and the last sung line at 200.02s, so the card gets eight seconds of silence.
export const CARD_END = 209.0;

// The player takes the film's length from the song, so it is corrected here.
export function init(S) { S.duration = CARD_END; }

export function shotAt(t) {
  let i = 0;
  for (let k = 0; k < CUTS.length; k++) if (t >= CUTS[k]) i = k;
  return { i, from: CUTS[i], to: CUTS[i + 1] ?? CARD_END };
}

// Every shot moves. The world is a flat wall, so the motion has to come from the camera and from
// the things on it — a held drawing with a still camera is a slideshow, and the motion check says so
// (video/lib/motion.py: anything under 1.2 of mean change a second is a near-still second).
//
// The camera's move is chosen per shot from a cycle of push, pull, pan and hold-and-drift, so two
// shots in a row never drift the same way, and it eases across the shot's own window.
const MOVES = [
  { z: [1.00, 1.16], x: [0, -70], y: [0, -40] },   // push in and up
  { z: [1.18, 1.00], x: [0, 80], y: [0, 30] },     // pull back
  { z: [1.04, 1.09], x: [-110, 110], y: [0, 0] },  // pan across the wall
  { z: [1.14, 1.03], x: [70, -70], y: [50, -24] }, // drift down and back
  { z: [1.02, 1.20], x: [0, 0], y: [-90, 90] },    // a long vertical slide
  { z: [1.22, 1.04], x: [-60, 60], y: [-30, 40] }, // ease out
  { z: [1.03, 1.10], x: [96, -110], y: [56, -18] }, // pan the other way
  { z: [1.16, 1.02], x: [0, 0], y: [70, -56] },    // settle
];

export function draw(g, t, S) {
  const { i, from, to } = shotAt(t);
  const part = PARTS[i < 12 ? 0 : i < 40 ? 1 : 2];
  const m = MOVES[i % MOVES.length];
  const p = smooth(clamp01((t - from) / Math.max(0.2, to - from)));
  const z = m.z[0] + (m.z[1] - m.z[0]) * p;
  const cx = m.x[0] + (m.x[1] - m.x[0]) * p;
  const cy = m.y[0] + (m.y[1] - m.y[0]) * p;
  // a small pulse on the beat, so even a nearly-still shot breathes with the record
  const beat = S.beatPos(t) % 1;
  const pulse = 1 + (1 - easeOut(beat)) * (S.section(t).name.startsWith('Chorus') ? 0.02 : 0.009);
  g.save();
  g.translate(540, 960);
  g.scale(z * pulse, z * pulse);
  g.translate(-(540 + cx), -(960 + cy));
  part.draw(g, t, S, { i, from, to });
  g.restore();
}

// The two corner marks, set in this film's own type.
export function drawMarks(g) {
  const ink = P.inkSoft;
  drawText(g, '@yanqingcheng', 36, 62, 24, { colour: ink, boil: 0, id: 'mark1', tracking: 0.1 });
  tollensMark(g, 1006, 46, 15, { colour: ink });
  drawText(g, 'tollens', 936, 62, 24, { colour: ink, boil: 0, id: 'mark2', tracking: 0.1 });
}

export { boilAt };