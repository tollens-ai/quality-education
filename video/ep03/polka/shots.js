// Shots and the joins between them. A shot is a time range and a function that draws its whole frame
// (page, picture and lettering) as a pure function of the song's time. A join draws the incoming shot
// underneath and the outgoing one over it, moved out of the way: pushed off the side, or opened up by an
// iris on the picture's subject. Joins move at the film's full frame rate; what is drawn inside a shot
// steps on twos (`tq`, the drawing's own clock).
import { W, H, clamp, lerp, hash, smooth, easeOut, easeInOut, inv, TAU, rng, beatPos } from './kit.js';
import { paper } from './paper.js';
import { line } from './pencil.js';
import { GRAPHITE } from './palette.js';

export const SHOTS = [];
export const JOINS = [];
export function shot(a, b, draw, o = {}) { const s = { a, b, draw, ...o }; SHOTS.push(s); return s; }
// kind: 'push' (o.dir: [dx, dy] the direction the old picture leaves in) or 'iris' (o.at: [x, y], the incoming picture opening from there).
export function join(a, b, kind, o = {}) { JOINS.push({ a, b, kind, ...o }); }
export function shotAt(t) { let s = null; for (const x of SHOTS) if (t >= x.a && t < x.b) s = x; return s; }
export function shotEnding(t) { let s = null; for (const x of SHOTS) if (x.a <= t && (!s || x.a > s.a)) s = x; return s; }

// The canvas a join draws the outgoing shot into.
let OFF = null;
function off(g) {
  if (!OFF || OFF.width !== g.canvas.width || OFF.height !== g.canvas.height) {
    OFF = document.createElement('canvas');
    OFF.width = g.canvas.width; OFF.height = g.canvas.height;
  }
  return OFF;
}

// Draw the frame at t (the film's clock) with its drawings made at tq (their own).
export function drawFrame(g, t, tq = t) {
  const cur = shotAt(t);
  const j = JOINS.find(x => t >= x.a && t < x.b);
  if (!j) { if (cur) { g.save(); cur.draw(g, tq, cur); g.restore(); } else { paper(g); } return; }
  const p = clamp((t - j.a) / (j.b - j.a));
  const from = SHOTS.find(s => s.id === j.from) || shotEnding(j.a - 1e-3);
  const to = SHOTS.find(s => s.id === j.to) || shotAt(j.b + 1e-3);
  const k = g.canvas.width / W;
  // The outgoing picture into its own canvas: its own drawing clock holds at the join's end at the latest.
  const oc = off(g), og = oc.getContext('2d');
  og.setTransform(1, 0, 0, 1, 0, 0);
  og.clearRect(0, 0, oc.width, oc.height);
  if (from) {
    og.setTransform(k, 0, 0, k, 0, 0);
    og.save();
    from.draw(og, Math.min(tq, from.b + .2), from);
    og.restore();
  }
  const e = easeInOut(p);
  if (j.kind === 'push') {
    const [dx, dy] = j.dir || [-1, 0];
    // The incoming picture arrives from the far side, the old one leaves the way it was pushed.
    g.save();
    g.translate(-dx * (1 - e) * W, -dy * (1 - e) * H);
    if (to) { g.save(); to.draw(g, tq, to); g.restore(); } else paper(g);
    g.restore();
    if (from) {
      g.save();
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.drawImage(oc, 0, 0, oc.width, oc.height, dx * e * oc.width, dy * e * oc.height, oc.width, oc.height);
      g.restore();
    }
  } else {
    // The iris: the incoming picture opens as a growing circle over the outgoing one.
    if (from) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(oc, 0, 0); g.restore(); }
    const [cx, cy] = j.at || [W / 2, H * .62];
    const R = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) * 1.05 * easeOut(p, 2.2);
    g.save();
    g.beginPath(); g.arc(cx, cy, Math.max(.1, R), 0, TAU); g.clip();
    if (to) { to.draw(g, tq, to); } else paper(g);
    g.restore();
    // A crayon ring at the edge of the opening.
    if (p > 0 && p < .98) line(g, Array.from({ length: 41 }, (_, i) => [cx + Math.cos(i / 40 * TAU) * R, cy + Math.sin(i / 40 * TAU) * R]), { w: 10, col: j.col || GRAPHITE, seed: 3, t: tq, spline: false, passes: 1, closed: true, alpha: .85 });
  }
}
