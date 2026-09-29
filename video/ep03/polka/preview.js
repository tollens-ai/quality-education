// A scene entry for previewing parts of the film on their own, so a section can be built and looked at
// without the rest:  ... --scene video/ep03/polka/preview.js --query part=verse2   (or part=intro,verse1)
// Each named part is scenes/<name>.js and registers its own shots.
import { loadRecord, twos, setNow } from './kit.js';
import { SHOTS, drawFrame } from './shots.js';

export async function init(S) {
  await loadRecord(S, '/music/ep03/audio.json');
  const parts = (new URLSearchParams(location.search).get('part') || '').split(',').filter(Boolean);
  for (const name of parts) (await import(`./scenes/${name}.js`)).register(S);
  SHOTS.sort((a, b) => a.a - b.a);
  if (typeof window !== 'undefined') window.__shots = SHOTS.map(s => [+s.a.toFixed(3), +s.b.toFixed(3)]);
}

export function draw(g, t, S) {
  const tq = twos(t);
  window.__t = tq;
  setNow(tq);
  drawFrame(g, t, tq);
}

export { drawMarks } from './marks.js';
