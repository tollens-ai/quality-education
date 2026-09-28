// Verse 1: the four apps that went wrong. Each line, a pane of the mirror lights from the far
// side, flickering on like a tube, and becomes a window onto what happened; CLAWD's reflection
// hangs over it, faint, a double exposure: he's looking at your disaster and seeing himself. On
// the "oooh", the light goes out, and the reflections sing it.
import { C, W, H, clamp, lerp, easeOut, env, hit, noise, rgba, hash } from '../kit.js';
import { clawd } from '../clawd.js';
import { fill, layer, put, strobe } from '../world.js';
import { pane } from '../glass.js';
import { shot, overlay, camera } from '../shots.js';
import { words, sing, rows, STYLE } from '../lyric.js';
import { kickback } from '../type.js';
import { singer } from '../playing.js';
import { BRIEFS, plate, bakery, clinic, school, wedding } from '../places.js';

// The verse's palm-muted chug: words shiver on sixteenths while they're up.
export const chug = (tt, w) => {
  const k = kickback(tt, w.v, 4, .07);
  const q = Math.floor(tt / (1.7626 / 16));
  return { dx: k.dx + (hash(q, w.s) - .5) * 3 * env('guitar', tt), dy: k.dy };
};

// A tube lighting: off, a stutter, then on; and off again, fast.
function tube(t, on, off) {
  if (t < on) return 0;
  const a = t - on;
  const stutter = a < .05 ? 1 : a < .09 ? .15 : a < .14 ? 1 : a < .17 ? .5 : 1;
  const fade = t > off ? clamp(1 - (t - off) / .12) : 1;
  return stutter * fade;
}

export function register(S) {
  const lines = [
    [words('Verse 1', 'Your checkout'), bakery, [[0, 1, 2], [3, 4, 5, 6], [7, 8, 9, 10, 11]], [3, 4, 8]],
    [words('Verse 1', "Your clinic's"), clinic, [[0, 1, 2], [3, 4, 5], [6, 7, 8, 9], [10, 11]], [5, 7]],
    [words('Verse 1', "Your school's"), school, [[0, 1, 2], [3, 4, 5], [6, 7], [8, 9, 10]], [8, 9, 10]],
    [words('Verse 1', 'Your wedding'), wedding, [[0, 1], [2, 3, 4], [5, 6, 7, 8], [9, 10]], [5, 9, 10]],
  ];
  const oohs = [0, 1, 2].map(i => words('Verse 1', 'oooh', i));
  const starts = [13.95, lines[1][0][0].v - .1, lines[2][0][0].v - .1, lines[3][0][0].v - .1, 28.3];
  lines.forEach(([ws, place, rowIdx, stress], i) => {
    const a = starts[i], b = starts[i + 1];
    const offAt = i < 3 ? oohs[i][0].v - .02 : 27.95;
    shot(a, b, (g, t, S, sh) => {
      fill(g, C.ink);
      const lit = tube(t, ws[0].v - .08, offAt);
      // The far side, in the pane.
      const F = layer(g, 'place');
      F.save(); F.translate(0, 630);
      const z = lerp(1, 1.12, (t - a) / (b - a)) * (1 + .012 * hit('kick', t, .1));
      const px = lerp(-30, 30, (t - a) / (b - a)) * (i % 2 ? -1 : 1) + noise(t * .5, i) * 12;
      F.translate(540 + px, 700 + noise(t * .4, i + 9) * 10); F.scale(z, z); F.translate(-540, -700);
      place(F, t, 'broken');
      F.restore();
      put(g, F, { alpha: lit, clip: [20, 560, 1040, 1360] });
      // The reflection over it: CLAWD's face, huge and faint, singing; strong when the light's off.
      const R = layer(g, 'ghost');
      singer(R, 560, 2250, 1250, t, { rim: C.red, eyes: 'sad' });
      put(g, R, { alpha: lerp(.95, .12, lit), op: lit > .5 ? 'screen' : 'source-over', clip: [20, 560, 1040, 1360] });
      pane(g, 20, 560, 1040, 1360, { a: .04, n: 3, seed: 60 + i, glintA: .3 });
      // The pane's frame.
      g.fillStyle = C.steel2;
      g.fillRect(0, 548, W, 12); g.fillRect(0, 548, 20, 1372); g.fillRect(1060, 548, 20, 1372);
      // Whose brief this is: the plate, and the Clawd who built it, watching over his shoulder.
      const bf = BRIEFS[i];
      clawd(g, bf.who === 'regex' || bf.who === 'null' ? 930 : 150, 2300, { who: bf.who, s: 420, t, back: true, silhouette: .85, rim: bf.who === 'null' ? C.bone : C.red, whip: .06 * Math.sin(t * 3) });
      plate(g, bf, 560);
      // The line, above the pane; its stressed words in red.
      rows(g, t, ws, { y: rowIdx.length > 3 ? 50 : 62, face: 'black', maxW: 980, rows: rowIdx.map(r => ({ w: r, size: rowIdx.length > 3 ? 108 : 118, style: STYLE.bone, dy: rowIdx.length > 3 ? 112 : 124 })) },
        { enter: 'stamp', lead: .09, live: chug, stress });
    });
  });
  // The "oooh"s: the reflections sing them, over the cut to the next pane.
  oohs.forEach((ow, i) => {
    overlay(ow[0].v - .14, ow[0].v + 1.0, (g, t) => {
      sing(g, t, ow[0], 1030, 500, 96, 'xital', { enter: 'flip', lead: .14, align: 'right', caps: false, str: 'oooh',
        style: { fill: C.glass, shadow: { dx: 0, dy: 6, col: C.ink } } });
    });
  });
}
