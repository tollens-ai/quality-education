// "Press, Stress & Guess", episode 4's film: a rubber-hose sing-along cartoon of about 1930.
//
//   node video/lib/render.mjs --scene video/ep04/ball/main.js --song music/ep04/piano --stills 5,40 --w 1080
//
// Each part of the song registers its shots once the record is loaded. A shot draws its picture as a
// pure function of song time; the drawings change twelve times a second (on twos, as the old cartoons
// were animated), while the camera and the joins move on every frame. The lyric and its bouncing ball
// are drawn over every shot by lyrics.js, in one place for the whole film, so a sung line holds across
// the cuts. No other words are drawn while the song plays (tools/text-audit checks it).
import { W, H, TAU, loadRecord, twos, setNow, setMono, REC, stabHit } from './kit.js';
import { SHOTS, JOINS, drawShots, drawJoins } from './shots.js';
import { drawLyrics, build } from './lyrics.js';
import { finish, weave } from './film.js';
import { INK, CREAM } from './palette.js';
import { label, PATTER } from './type.js';

export const fonts = [['Corben', 'video/ep04/ball/fonts/Corben-Bold.ttf'], ['Lilita', 'video/ep04/ball/fonts/LilitaOne-Regular.ttf']];

const PARTS = ['intro', 'verse1', 'cutaways', 'chorus1', 'verse2', 'chorus2', 'bridge', 'breakdown', 'chorus3', 'outro', 'endcard'];
const q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
export const MONO = [];   // [[t0, t1, ramp]]: stretches drained to sepia (the breakdown)

export async function init(S) {
  await loadRecord(S, '/music/ep04/piano/audio.json');
  const only = q.get('part');
  for (const name of PARTS) {
    if (only && !only.split(',').includes(name)) continue;
    try { (await import(`./scenes/${name}.js`)).register(S, { MONO }); }
    catch (e) { if (!/Failed to fetch|Cannot find|404/.test(e.message)) console.error(`part ${name} not drawn: ${e.message}\n${e.stack}`); }
  }
  SHOTS.sort((a, b) => a.a - b.a);
  build();
  if (typeof window !== 'undefined') window.__shots = SHOTS.map(s => [+s.a.toFixed(3), +s.b.toFixed(3), s.id || '']);
}

function monoAt(t) {
  let m = 0;
  for (const [a, b, r] of MONO) m = Math.max(m, Math.min(Math.max(0, Math.min(1, (t - a) / r)), Math.max(0, Math.min(1, (b - t) / r))));
  return m;
}

export function draw(g, t) {
  const tq = twos(t);
  setNow(tq);
  setMono(monoAt(t));
  const [wx, wy] = weave(t);
  g.save();
  g.translate(wx, wy);
  g.fillStyle = INK; g.fillRect(-10, -10, W + 20, H + 20);
  // the picture breathes with the piano's strong stabs (not the lyric, which holds still to be read)
  const pulse = 1 + .007 * stabHit(t, .14);
  g.save(); g.translate(W / 2, H / 2); g.scale(pulse, pulse); g.translate(-W / 2, -H / 2);
  drawShots(g, t);
  g.restore();
  drawJoins(g, t);
  setMono(0);
  drawLyrics(g, t);
  g.restore();
  finish(g, t);
}

// The corner marks, small, in the film's lettering: the handle, and Tollens's ∴ (three dots at the
// corners of an equilateral triangle, drawn exactly). Qing asked for them (2026-09-25); they're the
// only letters on screen that aren't sung.
export function drawMarks(g) {
  if (typeof window !== 'undefined') window.__textTag = 'marks';
  g.save();
  g.globalAlpha = .82;
  label(g, '@yanqingcheng', 40, 56, 28, { align: 'left', col: CREAM, ow: .24, ink: INK });
  const x = W - 200, y = 54, r = 4.4, d = 13;
  g.fillStyle = INK;
  for (const [px, py] of [[x, y - d * .577], [x - d / 2, y + d * .289], [x + d / 2, y + d * .289]]) { g.beginPath(); g.arc(px, py, r + 2.2, 0, TAU); g.fill(); }
  g.fillStyle = CREAM;
  for (const [px, py] of [[x, y - d * .577], [x - d / 2, y + d * .289], [x + d / 2, y + d * .289]]) { g.beginPath(); g.arc(px, py, r, 0, TAU); g.fill(); }
  label(g, 'tollens', x + 19, 56, 28, { align: 'left', col: CREAM, ow: .24, ink: INK });
  g.restore();
  if (typeof window !== 'undefined') window.__textTag = null;
}
