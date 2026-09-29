// "Pencil Polka", episode 3's video: a page of coloured-pencil doodles that dance to the oompah.
//
//   node video/lib/render.mjs --scene video/ep03/polka/main.js --song music/ep03 --stills 15,41.5 --w 1080
//
// Each scene file registers its shots (start, end, draw) and the joins between them once the song and
// its words are loaded. A shot draws its whole frame, lettering included, as a pure function of song
// time; outlines are redrawn fifteen times a second (on twos) while the colouring holds still and the
// cameras and joins move on every frame.
import { W, H, loadRecord, twos, setNow } from './kit.js';
import { SHOTS, JOINS, drawFrame } from './shots.js';
// The film's parts, in song order. A part that isn't there yet (or fails to load) leaves its stretch blank
// and says so in the console, so a cut of the film can be rendered at any stage.
const PARTS = ['intro', 'verse1', 'verse1b', 'chorus1', 'verse2', 'chorus2', 'trials', 'bridge', 'parade1', 'parade2', 'leadin', 'chorus3', 'outro', 'joins'];

export async function init(S) {
  await loadRecord(S, '/music/ep03/audio.json');
  const loaded = [];
  for (const name of PARTS) {
    try { (await import(`./scenes/${name}.js`)).register(S); loaded.push(name); }
    catch (e) { console.error(`part ${name} not drawn: ${e.message}`); }
  }
  SHOTS.sort((a, b) => a.a - b.a);
  if (typeof window !== 'undefined') { window.__parts = loaded; window.__shots = SHOTS.map(s => [+s.a.toFixed(3), +s.b.toFixed(3)]); window.__joins = JOINS.map(j => [j.a, j.b]); }
}

export function draw(g, t, S) {
  // Drawings are made every other frame (on twos); a drawing's clock is the time of its own frame.
  const tq = twos(t);
  window.__t = tq;
  setNow(tq);
  drawFrame(g, t, tq);
}

export { drawMarks } from './marks.js';
