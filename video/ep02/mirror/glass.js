// Glass: the mirror wall, and what glass does in this film. It reflects the band (a one-way
// mirror seen from the lit side), turns see-through where the far side is lit, cracks when it's
// hit, fogs when breathed on, and shatters.
import { C, W, H, TAU, clamp, lerp, rgba, hash, rng, easeIn, easeOut } from './kit.js';
import { P, gpen, glint, crackShape, drawCrack, shards } from './pen.js';

// A vertical mirror edge (the frame between the real side and the reflected side of a split).
export function mirrorEdge(g, x, y0, y1, o = {}) {
  const w = o.w ?? 16;
  g.fillStyle = o.col || C.steel2;
  g.fillRect(x - w / 2, y0, w, y1 - y0);
  g.fillStyle = C.steel;
  g.fillRect(x - w / 2 + 3, y0, 3, y1 - y0);
  gpen(g, [[x - w / 2, y0], [x - w / 2, y1]], 3, { col: C.ink, taper: [0, 0], boil: false, wobble: .3 });
  gpen(g, [[x + w / 2, y0], [x + w / 2, y1]], 3, { col: C.ink, taper: [0, 0], boil: false, wobble: .3 });
}

// A film of glass over a region: a flat cold tint and the cartoon glints of a pane.
export function pane(g, x, y, w, h, o = {}) {
  g.save();
  g.fillStyle = rgba(o.tint || C.glass, o.a ?? .06);
  g.fillRect(x, y, w, h);
  if (o.glints !== false) {
    const R = rng(o.seed ?? 1);
    for (let i = 0; i < (o.n ?? 2); i++) glint(g, x + w * lerp(.15, .85, R()), y + h * lerp(.1, .6, R()), Math.min(w, h) * lerp(.18, .32, R()), { col: rgba(C.bone, o.glintA ?? .35) });
  }
  g.restore();
}

// Draw something twice: as it is, and as its reflection in a mirror at x = mx (the reflection
// is drawn by the same function with mirrored = true, so it can differ: a reflection with a mind
// of its own). The reflection is clipped to the mirror's side.
export function reflected(g, mx, side, drawIt, o = {}) {
  g.save();
  g.beginPath();
  if (side > 0) g.rect(mx, -2000, 4000, 6000); else g.rect(-4000, -2000, 4000 + mx, 6000);
  g.clip();
  g.translate(2 * mx, 0);
  g.scale(-1, 1);
  drawIt(g, true);
  g.restore();
  g.save();
  g.beginPath();
  if (side > 0) g.rect(-4000, -2000, 4000 + mx, 6000); else g.rect(mx, -2000, 4000, 6000);
  g.clip();
  drawIt(g, false);
  g.restore();
}

// Cracks that stay: cached by seed so a crack keeps its shape from frame to frame.
const CK = new Map();
export function crackAt(seed, x, y, r, n = 9) {
  const key = `${seed}|${x}|${y}|${r}|${n}`;
  if (!CK.has(key)) CK.set(key, crackShape(seed, x, y, r, n));
  return CK.get(key);
}
export function crack(g, seed, x, y, r, p, o = {}) {
  if (p <= 0) return;
  drawCrack(g, crackAt(seed, x, y, r, o.n ?? 9), easeOut(p, 2), o);
}

// A pane bursting: pieces fly out from the impact and fall, turning. draw(g, poly, s) paints each
// piece (clipped to it), e.g. the picture that was in the glass, so the picture shatters too.
const SH = new Map();
export function shatter(g, seed, rect, cx, cy, q, paintPiece, o = {}) {
  const key = `${seed}|${rect}|${cx}|${cy}`;
  if (!SH.has(key)) SH.set(key, shards(seed, rect[0], rect[1], rect[2], rect[3], cx, cy, o.n ?? 12, o.rings ?? 4));
  const pcs = SH.get(key);
  for (const s of pcs) {
    const R = rng(s.seed * 1000);
    const dirX = (s.c[0] - cx) / (s.r + 1), dirY = (s.c[1] - cy) / (s.r + 1);
    const spd = lerp(500, 1400, R()) * (o.force ?? 1) * (1.2 - s.r / 1500);
    const tt = q * (o.dur ?? .9);
    const dx = dirX * spd * tt + (R() - .5) * 60 * tt, dy = dirY * spd * tt + 1600 * tt * tt;
    const rot = (R() - .5) * 6 * tt;
    g.save();
    g.translate(s.c[0] + dx, s.c[1] + dy);
    g.rotate(rot);
    g.translate(-s.c[0], -s.c[1]);
    const p = P().poly(s.poly);
    g.save(); p.trace(g); g.clip();
    paintPiece(g, s);
    g.restore();
    // The piece's edge catches the light.
    p.trace(g); g.lineWidth = 3; g.strokeStyle = rgba(C.bone, .8); g.stroke();
    g.restore();
  }
}
