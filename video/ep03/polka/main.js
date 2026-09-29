// "Pencil Polka", episode 3's video: a page of coloured-pencil doodles that dance to the oompah.
//
//   node video/lib/render.mjs --scene video/ep03/polka/main.js --song music/ep03 --stills 15,41.5 --w 1080
//
// Each scene file registers its shots (start, end, draw) and the joins between them once the song and
// its words are loaded. A shot draws its whole frame, lettering included, as a pure function of song
// time; drawings change about twelve times a second (the boil) while everything else moves on every frame.
import { W, H, loadRecord } from './kit.js';
import { SHOTS, JOINS, drawFrame } from './shots.js';
import { write } from './hand.js';
import { AUDIT } from './lyrics.js';
import { GRAPHITE } from './palette.js';
import * as intro from './scenes/intro.js';
import * as verse1 from './scenes/verse1.js';
import * as chorus1 from './scenes/chorus1.js';

const SCENES = [intro, verse1, chorus1];

export async function init(S) {
  await loadRecord(S, '/music/ep03/audio.json');
  for (const sc of SCENES) sc.register(S);
  SHOTS.sort((a, b) => a.a - b.a);
  if (typeof window !== 'undefined') window.__shots = SHOTS.map(s => [+s.a.toFixed(3), +s.b.toFixed(3)]);
}

export function draw(g, t, S) {
  window.__t = t;
  drawFrame(g, t);
}

// The corner marks, small, in the film's own pencil: the handle and Tollens's ∴ (three dots at the
// corners of an equilateral triangle, drawn so it is exact).
export function drawMarks(g) {
  const t = window.__t || 0;
  const c = window.__markInk || GRAPHITE;
  g.save();
  g.globalAlpha = .72;
  write(g, '@YANQINGCHENG', 40, 66, 24, { col: c, seed: 90, t, track: 6, w: .1 });
  const x = W - 196, y = 54, r = 3.8, d = 12;
  g.fillStyle = c;
  for (const [px, py] of [[x, y - d * .58], [x - d / 2, y + d * .29], [x + d / 2, y + d * .29]]) { g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2); g.fill(); }
  write(g, 'TOLLENS', x + 20, 66, 24, { col: c, seed: 91, t, track: 6, w: .1 });
  g.restore();
}
