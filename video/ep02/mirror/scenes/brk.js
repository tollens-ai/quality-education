// Break 1: the riff again, and the hook sung once more on its own: "So give me something I can
// prove!" The mirror CLAWD just punched is cracked, and the riff turns the cracked glass into a
// kaleidoscope of the band, one tick a note, before he shouts the hook at it again.
import { C, W, H, TAU, clamp, lerp, easeOut, hit, last, A, lastIndex, rgba, mix } from '../kit.js';
import { fill, layer, put, strobe, impact, kaleido, burst, cone } from '../world.js';
import { crack, pane } from '../glass.js';
import { shot, camera } from '../shots.js';
import { words, rows, STYLE } from '../lyric.js';
import { kickback } from '../type.js';
import { singer, riffNote } from '../playing.js';
import { bandFront } from './stage.js';
import { roseWindow } from './intro.js';

function ticks(t) {
  const L = A.ev.riff, i = lastIndex(L, t);
  return i < 0 ? 0 : i + easeOut((t - L[i]) / .07, 3);
}
const live = (tt, w) => kickback(tt, w.v, 7, .08);

export function register(S) {
  const Hk = words('Break 1', 'So give me');
  const a = 53.9, b = Hk[0].v - .12, c = words('Verse 2', 'Give me a tool')[0].v - .05;
  // The middle bar of the break: the whole band, jumping.
  const j0 = 55.31, j1 = 57.075;
  shot(j0, j1, (g, t, S, sh) => {
    fill(g, C.ink);
    g.save();
    camera(g, t, sh, { z: 1.1, y: 1100 }, { z: 1.0, y: 1000 }, { shake: 12, hand: 2 });
    bandFront(g, t, { jump: 1, floor: 1560 });
    g.restore();
    strobe(g, hit('snare', t, .05) * .3);
    if (t - last('crash', t) < .034) impact(g);
  });
  const rose = (g, t, S, sh) => {
    fill(g, C.ink);
    const n = riffNote(t);
    const acc = n ? Math.exp(-n.age / .08) * clamp(n.st) : 0;
    const L = layer(g, 'bsrc');
    L.fillStyle = C.ink; L.fillRect(0, 0, W, H);
    L.save(); L.globalAlpha = .5; bandFront(L, t, {}); L.restore();
    crack(L, 111, 540, 960, 700, 1, { n: 13, w: 5 });
    roseWindow(L, t, 540, 960, [C.red, C.glass2, C.bone, C.red2, C.clawd, C.ink3], { rot: -(t - a) * .2 });
    const tk = ticks(t);
    const strong = n && n.st > .75 && n.age < .11;
    kaleido(g, L, 540, 960, strong ? 12 : 6, tk * TAU / 24, 540, 960, { zoom: lerp(.95, 1.2, (t - a) / (b - a)) * (1 + acc * .06), seams: rgba(C.bone, .2 + acc * .5) });
    strobe(g, hit('crash', t, .06) * .7);
    if (t - last('crash', t) < .034) impact(g);
  };
  shot(a, j0, rose);
  shot(j1, b, rose);
  shot(b, c, (g, t, S, sh) => {
    fill(g, C.red3);
    g.save();
    camera(g, t, sh, { z: 1.05, r: -.08 }, { z: 1.15, r: -.1 }, { shake: 12 });
    burst(g, 540, 1300, 24, C.red3, C.ink, -t * .1);
    singer(g, 540, 2150, 1000, t, { rim: C.red, eyes: 'fierce', look: [0, -.3] });
    crack(g, 111, 700, 1200, 900, 1, { n: 13, w: 6 });
    pane(g, 0, 0, W, H, { a: .05, n: 3, seed: 5 });
    g.restore();
    rows(g, t, Hk, { y: 90, face: 'black', rows: [
      { w: [0, 1, 2], size: 150, style: STYLE.bone, dy: 150, align: 'left', x: 70 },
      { w: [3], size: 230, style: STYLE.bone, dy: 215, align: 'left', x: 60 },
      { w: [4, 5], size: 260, style: STYLE.red, dy: 250, align: 'right', x: 1010 },
      { w: [6], size: 300, style: STYLE.red, dy: 285, align: 'right', x: 1010 },
    ] }, { enter: 'slam', lead: .1, live });
    if (t - last('crash', t) < .034) impact(g);
  });
}
