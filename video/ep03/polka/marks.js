import { W } from './kit.js';
import { write } from './hand.js';
import { GRAPHITE } from './palette.js';

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
