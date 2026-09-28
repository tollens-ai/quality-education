// The mirror box: a room whose floor and walls are black mirror glass in big panes, set in
// thin chrome frames. From inside you see only yourselves, the band reflected over and over.
// The back wall is where the words are cut.
import { W, H, clamp, lerp, mix, rgba, hash, noise } from './kit.js';
import { ap, M, T, RY, project, projPoly, tracePoly, reflector, mirrored, depth, vsub, norm } from './space.js';
import { P } from './palette.js';
import { layer, put, blurred } from './post.js';
import { INK } from './ink.js';

export const ROOM = { back: -160, left: -420, right: 420, ceil: 520, floor: 0, pane: 120 };

// A plane polygon in world space, projected and filled.
function quad(g, c, pts, fill) {
  const pp = projPoly(c, pts);
  if (!pp) return null;
  g.beginPath(); tracePoly(g, pp); g.fillStyle = fill; g.fill();
  return pp;
}
function seg(g, c, a, b, col, w) {
  const pa = project(c, a), pb = project(c, b);
  if (pa.z < c.near || pb.z < c.near) return;
  g.strokeStyle = col; g.lineWidth = w;
  g.beginPath(); g.moveTo(pa.x, pa.y); g.lineTo(pb.x, pb.y); g.stroke();
}

// The back wall (z = ROOM.back), dark glass with its frames. Returns its matrix, for cutting.
export const WALL = M(T(0, 0, ROOM.back));
export function backWall(g, c, o = {}) {
  const z = ROOM.back, x0 = ROOM.left * 2, x1 = ROOM.right * 2, top = ROOM.ceil * 1.6;
  const pp = quad(g, c, [[x0, 0, z], [x1, 0, z], [x1, top, z], [x0, top, z]], o.col || P.glass0);
  // What the glass reflects goes under its gloss and its frames, so it reads as in the mirror.
  o.under?.(g);
  if (pp && o.ink) {
    // Black glass, inked: solid black with a few vertical strokes of gloss, the manga shorthand
    // for a mirror.
    g.save(); g.strokeStyle = rgba(INK.paper, .16); g.lineCap = 'round';
    for (let i = 0; i < 22; i++) {
      const x = -700 + hash(i, 4) * 1400, y0 = hash(i, 5) * 300, len = 60 + hash(i, 6) * 260;
      const a = project(c, [x, y0, z + .4]), b = project(c, [x + len * .12, y0 + len, z + .4]);
      g.lineWidth = Math.max(.8, a.s * (1 + hash(i, 7) * 2.5));
      g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
    }
    g.restore();
  } else if (pp) {
    // A faint sheen across the glass, brighter low down where the stage lights hit it.
    const a = project(c, [0, 0, z]), b = project(c, [0, top * .6, z]);
    const gr = g.createLinearGradient(a.x, a.y, b.x, b.y);
    gr.addColorStop(0, rgba(o.sheen || '#2b3445', .55));
    gr.addColorStop(1, rgba('#0b0e14', 0));
    g.beginPath(); tracePoly(g, pp); g.fillStyle = gr; g.fill();
  }
  frames(g, c, 'back', o);
}
export function floorPlane(g, c, o = {}) {
  const x0 = ROOM.left * 2, x1 = ROOM.right * 2, z0 = ROOM.back, z1 = 1400;
  const pp = quad(g, c, [[x0, 0, z0], [x1, 0, z0], [x1, 0, z1], [x0, 0, z1]], o.col || '#06070b');
  frames(g, c, 'floor', o);
  return pp;
}
// The chrome frames between panes: thin lines, lit where the light catches them.
function frames(g, c, which, o) {
  const pane = ROOM.pane, col = o.frame || '#39424f', hi = o.frameHi || '#a9b4c4';
  g.save();
  g.lineCap = 'butt';
  if (which === 'back') {
    const z = ROOM.back + .5;
    for (let x = -pane * 6; x <= pane * 6; x += pane) {
      const s = clamp(project(c, [x, 100, z]).s * 1.2, .6, 4);
      seg(g, c, [x, 0, z], [x, ROOM.ceil * 1.6, z], col, s * 1.6);
      seg(g, c, [x + .6, 0, z], [x + .6, ROOM.ceil * 1.6, z], rgba(hi, .35), s * .5);
    }
    for (let y = 150; y < ROOM.ceil * 1.6; y += 150) {
      const s = clamp(project(c, [0, y, z]).s * 1.2, .6, 4);
      seg(g, c, [-pane * 6, y, z], [pane * 6, y, z], col, s * 1.4);
    }
  } else {
    for (let x = -pane * 6; x <= pane * 6; x += pane) {
      seg(g, c, [x, .2, ROOM.back], [x, .2, 1400], col, clamp(project(c, [x, 0, 200]).s * 1.1, .5, 4));
    }
    for (let z = ROOM.back + pane; z < 1400; z += pane) {
      seg(g, c, [-pane * 6, .2, z], [pane * 6, .2, z], col, clamp(project(c, [0, 0, z]).s * 1.1, .5, 4));
    }
  }
  g.restore();
}

// Reflections. draw(g, c) draws the things to reflect; it's called again with the camera
// mirrored in the plane, into a layer, which is laid over the plane faded and softened.
export function floorReflection(g, c, draw, o = {}) {
  const L = layer('reflFloor');
  draw(L, mirrored(c, reflector([0, 0, 0], [0, 1, 0])));
  // Fade with distance below the feet: a black mirror floor shows the nearest part strongly.
  const F = layer('reflFade');
  F.drawImage(L.canvas, 0, 0, W, H);
  F.globalCompositeOperation = 'destination-in';
  const a = project(c, [0, 0, o.z ?? 0]);
  const gr = F.createLinearGradient(0, a.y, 0, a.y + (o.fade ?? 520) * clamp(a.s, .3, 3));
  gr.addColorStop(0, 'rgba(0,0,0,.62)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  F.fillStyle = gr; F.fillRect(0, 0, W, H);
  F.globalCompositeOperation = 'source-over';
  const B = blurred('reflBlur', F, o.blur ?? 3, .5);
  put(g, B, { alpha: o.alpha ?? .75 });
}
// The back wall's reflections: with a mirror behind the camera too (at o.front), the band repeats
// down a tunnel, each image fainter, alternately from behind and in front.
import { mmul } from './space.js';
export function wallReflection(g, c, draw, o = {}) {
  const Rb = reflector([0, 0, ROOM.back], [0, 0, 1]);
  const Rf = reflector([0, 0, o.front ?? 900], [0, 0, 1]);
  const levels = o.levels ?? 1;
  const ms = [Rb];
  for (let k = 1; k < levels; k++) ms.push(mmul(ms[k - 1], k % 2 ? Rf : Rb));
  for (let k = levels - 1; k >= 0; k--) {
    const L = layer('reflWall');
    draw(L, mirrored(c, ms[k]), k);
    const B = blurred('reflWallBlur', L, (o.blur ?? 2.5) * (1 + k * .8), .5);
    put(g, B, { alpha: (o.alpha ?? .28) * Math.pow(o.decay ?? .55, k) });
  }
}

// A cone of stage light in the haze, from a lamp at `from` down to a pool on the floor.
export function beam(g, c, from, to, radius, col, k = 1, E = null) {
  const a = project(c, from), b = project(c, to);
  if (a.z < c.near || b.z < c.near) return;
  const r0 = Math.max(2, 6 * a.s), r1 = Math.max(4, radius * b.s);
  const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  const pts = [[a.x + nx * r0, a.y + ny * r0], [b.x + nx * r1, b.y + ny * r1], [b.x - nx * r1, b.y - ny * r1], [a.x - nx * r0, a.y - ny * r0]];
  const draw = (ctx, kk) => {
    const gr = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
    gr.addColorStop(0, rgba(col, .34 * kk)); gr.addColorStop(.7, rgba(col, .12 * kk)); gr.addColorStop(1, rgba(col, .02 * kk));
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    ctx.beginPath(); ctx.moveTo(...pts[0]); for (const p of pts.slice(1)) ctx.lineTo(...p); ctx.closePath();
    ctx.fillStyle = gr; ctx.fill();
    // The pool on the floor.
    const pool = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r1 * 1.1);
    pool.addColorStop(0, rgba(col, .45 * kk)); pool.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = pool;
    ctx.beginPath(); ctx.ellipse(b.x, b.y, r1 * 1.1, r1 * .32, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };
  draw(g, k);
  if (E) draw(E, k * .5);
}
