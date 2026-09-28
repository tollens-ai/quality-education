// "Cut Light", episode 2's video: a band of Clawds in a box of mirrors, who can only see
// themselves. Every word they sing is cut out of the mirror, and through the letters comes the
// day outside, where the people they built for are.
//
//   node video/lib/render.mjs --scene video/ep02/cutlight/main.js --song music/ep02 --stills 15
//
// Each scene file registers its shots (start, end, draw) once the song and the words are loaded.
// A shot draws everything in its frame, lettering included, as a pure function of song time.
import { W, H, loadAudio, setSong, setLyrics } from './kit.js';
import { fonts as typeFonts, loadGlyphs, flat, AUDIT } from './type.js';
import { setScale } from './post.js';
import { SHOTS, OVERLAYS } from './shots.js';
import { INK } from './ink.js';
import * as intro from './scenes/intro.js';
import * as verse1 from './scenes/verse1.js';
import * as pre from './scenes/pre.js';
import * as chorus from './scenes/chorus.js';
import * as brk from './scenes/brk.js';
import * as verse2 from './scenes/verse2.js';
import * as bridge from './scenes/bridge.js';
import * as outro from './scenes/outro.js';

export const fonts = typeFonts;
const SCENES = [intro, verse1, pre, chorus, brk, verse2, bridge, outro];

export async function init(S) {
  await loadAudio('/video/ep02/cutlight/audio.json');
  setSong(S); setLyrics(S.lyrics);
  await loadGlyphs();
  for (const sc of SCENES) sc.register(S);
  SHOTS.sort((a, b) => a.a - b.a);
  if (typeof window !== 'undefined') window.__shots = SHOTS.map(s => [+s.a.toFixed(3), +s.b.toFixed(3)]);
}

export function draw(g, t, S) {
  setScale(g.canvas.width / W);
  let sh = null;
  for (const s of SHOTS) if (t >= s.a && t < s.b) sh = s;
  if (!sh) { g.fillStyle = INK.col; g.fillRect(0, 0, W, H); return; }
  g.save(); sh.draw(g, t, sh); g.restore();
  for (const o of OVERLAYS) if (t >= o.a && t < o.b) { g.save(); o.draw(g, t, o); g.restore(); }
}

// The corner marks, small, in the machine's face: the handle and Tollens's ∴ (three dots at the
// corners of an equilateral triangle, drawn so it's exact).
export function drawMarks(g) {
  const prev = AUDIT.ctx; AUDIT.ctx = { mark: true };
  g.save();
  g.globalAlpha = .66;
  flat(g, '@yanqingcheng', 40, 64, 25, 'mono', { fill: INK.paper });
  const x = W - 190, y = 55, r = 3.6, d = 11;
  g.fillStyle = INK.paper;
  for (const [px, py] of [[x, y - d * .58], [x - d / 2, y + d * .29], [x + d / 2, y + d * .29]]) { g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2); g.fill(); }
  flat(g, 'tollens', x + 16, 64, 25, 'mono', { fill: INK.paper });
  g.restore();
  AUDIT.ctx = prev;
}
