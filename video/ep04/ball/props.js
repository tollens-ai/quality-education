// Props: the things the cast carry and the machines they test.
import { TAU, clamp, lerp, now, hash } from './kit.js';
import { INK, WHITE, CREAM, BROWN, WOOD, WOOD_SH, OCHRE, OCHRE_SH, SKY, GOLD, C } from './palette.js';
import { shape, line, stroke, rrect, ellipse, spline, xf, dot, paint } from './ink.js';

// A magnifying glass held at its handle (x, y), the lens along `ang`. Returns the lens centre and
// radius so a scene can draw what the lens shows inside it.
export function magnifier(g, x, y, ang, s = 1, o = {}) {
  const c = Math.cos(ang), sn = Math.sin(ang);
  const hl = 95 * s, r = (o.r ?? 70) * s;
  const lx = x + c * (hl + r), ly = y + sn * (hl + r);
  // handle
  const hp = [[x - c * 18 * s, y - sn * 18 * s], [x + c * hl, y + sn * hl]];
  line(g, hp, { w: 26 * s, taper: false, seed: 131, color: INK });
  line(g, hp, { w: 15 * s, taper: false, seed: 132, color: C(o.handle || BROWN), boilAmt: .4 });
  // lens and its brass rim
  shape(g, ellipse(lx, ly, r + 12 * s, r + 12 * s, 0, 44), { fill: GOLD, w: 6 * s, seed: 133, amt: .6 });
  shape(g, ellipse(lx, ly, r, r, 0, 44), { fill: o.glass ?? '#dff0ea', w: 5 * s, seed: 134, amt: .5 });
  if (o.inside) { g.save(); g.beginPath(); g.arc(lx, ly, r - 3 * s, 0, TAU); g.clip(); o.inside(g, lx, ly, r); g.restore(); }
  // the glint
  g.strokeStyle = C(WHITE); g.lineWidth = 7 * s; g.lineCap = 'round'; g.globalAlpha = .9;
  g.beginPath(); g.arc(lx, ly, r * .72, -2.6, -1.9); g.stroke(); g.globalAlpha = 1;
  return { x: lx, y: ly, r };
}
