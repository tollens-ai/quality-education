// "The Mirror": episode 2's music video, "How Will I Know". Four visual-kei Clawds play a stage
// that faces a wall of one-way mirror: they see only their own reflections, and the people they
// built apps for stand in the dark on the other side of the glass. When a light comes on over
// there, the mirror turns to glass. Every oracle is a light on the people's side.
//
//   node video/lib/render.mjs --scene video/ep02/mirror/main.js --song music/ep02 --stills 34.3
//
// Each scene file registers its shots (start, end, draw) once the song and the words are loaded.
// A shot draws everything in its frame, lettering included, as a pure function of song time.
import { C, W, H, loadAudio, setLyrics, clamp } from './kit.js';
import { fonts as typeFonts, text, AUDIT } from './type.js';
import { SHOTS, OVERLAYS } from './shots.js';
import * as intro from './scenes/intro.js';
import * as verse1 from './scenes/verse1.js';
import * as pre from './scenes/pre.js';
import * as chorus from './scenes/chorus.js';
import * as brk from './scenes/brk.js';
import * as verse2 from './scenes/verse2.js';
import * as bridge from './scenes/bridge.js';
import * as outro from './scenes/outro.js';

export const fonts = typeFonts;

export async function init(S) {
  await loadAudio('/video/ep02/mirror/audio.json');
  setLyrics(S.lyrics);
  intro.register(S);
  verse1.register(S);
  pre.register(S);
  chorus.register(S);
  brk.register(S);
  verse2.register(S);
  bridge.register(S);
  outro.register(S);
  SHOTS.sort((a, b) => a.a - b.a);
  // For checking: where the shots leave a gap or overlap, so no stretch of the song goes undrawn.
  if (typeof window !== 'undefined') window.__shots = SHOTS.map(s => [+s.a.toFixed(3), +s.b.toFixed(3)]);
}

export function draw(g, t, S) {
  let sh = null;
  for (const s of SHOTS) if (t >= s.a && t < s.b) sh = s;
  if (!sh) { g.fillStyle = C.ink; g.fillRect(0, 0, W, H); return; }
  g.save();
  sh.draw(g, t, S, sh);
  g.restore();
  for (const o of OVERLAYS) if (t >= o.a && t < o.b) { g.save(); o.draw(g, t, S, o); g.restore(); }
}

// The two corner marks, small, in the typewriter face: the handle and Tollens's ∴ (three dots at
// the corners of an equilateral triangle, drawn rather than typed so it's exact).
export function drawMarks(g) {
  const prev = AUDIT.ctx; AUDIT.ctx = { mark: true };
  g.save();
  g.globalAlpha = .7;
  text(g, '@yanqingcheng', 40, 64, 26, 'monor', { fill: C.bone2, noAudit: true });
  const x = W - 196, y = 55, r = 3.6, d = 11;
  g.fillStyle = C.bone2;
  for (const [px, py] of [[x, y - d * .58], [x - d / 2, y + d * .29], [x + d / 2, y + d * .29]]) { g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2); g.fill(); }
  text(g, 'tollens', x + 16, 64, 26, 'monor', { fill: C.bone2, noAudit: true });
  g.restore();
  AUDIT.ctx = prev;
}
