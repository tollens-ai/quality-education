// "Press, Stress & Guess", episode 4's film: a 1930s rubber-hose sing-along cartoon.
//
//   node video/lib/render.mjs --scene video/ep04/ball/main.js --song music/ep04/piano --stills 5,40 --w 1080
//
// Each part of the song registers its shots once the record is loaded. A shot draws its picture as a
// pure function of song time; the drawings change twelve times a second (on twos, as the old cartoons
// were animated), while the camera and the joins move on every frame. The lyric and its bouncing ball
// are drawn over every shot by lyrics.js, so a sung line holds across the cuts.
import { W, H, TAU, loadRecord, twos, setNow, setMono, REC } from './kit.js';
import { SHOTS, JOINS, drawShots, drawJoins } from './shots.js';
import { drawLyrics, build } from './lyrics.js';
import { finish, weave } from './film.js';
import { INK, CREAM } from './palette.js';
import { label, PATTER } from './type.js';

export const fonts = [['Corben', 'video/ep04/ball/fonts/Corben-Bold.ttf'], ['Lilita', 'video/ep04/ball/fonts/LilitaOne-Regular.ttf'], ['Oleo', 'video/ep04/ball/fonts/OleoScript-Bold.ttf']];

const PARTS = ['title', 'intro', 'verse1', 'verse1b', 'chorus1', 'verse2', 'chorus2', 'bridge', 'bridge2', 'breakdown', 'chorus3', 'outro', 'endcard'];
const q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
export const MONO = [];   // [[t0, t1, ramp]]: stretches drawn in ink and cream alone

export async function init(S) {
  await loadRecord(S, '/music/ep04/piano/audio.json');
  const only = q.get('part');
  for (const name of PARTS) {
    if (only && !only.split(',').includes(name) && name !== 'endcard') continue;
    try { (await import(`./scenes/${name}.js`)).register(S, { MONO }); }
    catch (e) { console.error(`part ${name} not drawn: ${e.message}`); }
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
  drawShots(g, t);
  drawJoins(g, t);
  drawLyrics(g, t);
  g.restore();
  setMono(0);
  finish(g, t);
}

// The corner marks, small, in the film's lettering: the handle, and Tollens's ∴ (three dots at the
// corners of an equilateral triangle, drawn exactly).
export function drawMarks(g) {
  g.save();
  g.globalAlpha = .8;
  label(g, '@yanqingcheng', 40, 58, 30, { align: 'left', col: CREAM, ow: .22, ink: INK });
  const x = W - 206, y = 56, r = 4.6, d = 14;
  g.fillStyle = INK;
  for (const [px, py] of [[x, y - d * .577], [x - d / 2, y + d * .289], [x + d / 2, y + d * .289]]) { g.beginPath(); g.arc(px, py, r + 2.2, 0, TAU); g.fill(); }
  g.fillStyle = CREAM;
  for (const [px, py] of [[x, y - d * .577], [x - d / 2, y + d * .289], [x + d / 2, y + d * .289]]) { g.beginPath(); g.arc(px, py, r, 0, TAU); g.fill(); }
  label(g, 'tollens', x + 20, 58, 30, { align: 'left', col: CREAM, ow: .22, ink: INK });
  g.restore();
}
