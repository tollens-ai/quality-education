// Shots and the joins between them. A shot is a time range and a function that draws its whole frame
// (page, picture and lettering) as a pure function of the song's time. A join draws the incoming
// shot underneath and the outgoing one over it, turned away: a notebook page flipped up, or wiped
// out by a pencil scribble.
import { W, H, clamp, lerp, hash, smooth, easeOut, inv, TAU, rng, beatPos } from './kit.js';
import { paper } from './paper.js';
import { line } from './pencil.js';
import { GRAPHITE } from './palette.js';

export const SHOTS = [];
export const JOINS = [];
export function shot(a, b, draw, o = {}) { const s = { a, b, draw, ...o }; SHOTS.push(s); return s; }
export function join(a, b, kind, o = {}) { JOINS.push({ a, b, kind, ...o }); }
export function shotAt(t) { let s = null; for (const x of SHOTS) if (t >= x.a && t < x.b) s = x; return s; }
export function shotEnding(t) { let s = null; for (const x of SHOTS) if (x.a <= t && (!s || x.a > s.a)) s = x; return s; }

// The canvases a join draws the outgoing shot into.
let OFF = null;
function off(g) {
  if (!OFF || OFF.width !== g.canvas.width || OFF.height !== g.canvas.height) {
    OFF = document.createElement('canvas');
    OFF.width = g.canvas.width; OFF.height = g.canvas.height;
  }
  return OFF;
}

// Spiral rings along the top edge, seen only while a page turns.
function rings(g, t, k = 1, y = 26) {
  for (let i = 0; i < 12; i++) {
    const x = 60 + i * (W - 120) / 11;
    line(g, [[x - 6, y + 8], [x - 7, y - 2], [x, y - 12], [x + 8, y - 4], [x + 6, y + 10]], { w: 6, col: '#6d6b76', seed: 800 + i, t, spline: true, passes: 1, alpha: .9 * k });
    g.save(); g.fillStyle = `rgba(60,55,50,${.35 * k})`; g.beginPath(); g.ellipse(x, y + 20, 7, 5, 0, 0, TAU); g.fill(); g.restore();
  }
}

// Draw the frame at t: the shot, then any join it belongs to.
export function drawFrame(g, t) {
  const cur = shotAt(t);
  const j = JOINS.find(x => t >= x.a && t < x.b);
  if (!j) { if (cur) { g.save(); cur.draw(g, t, cur); g.restore(); } else { paper(g); } return; }
  const p = clamp((t - j.a) / (j.b - j.a));
  const from = SHOTS.find(s => s.id === j.from) || shotEnding(j.a - 1e-3);
  const to = SHOTS.find(s => s.id === j.to) || shotAt(j.b + 1e-3);
  // The incoming page, live underneath.
  if (to) { g.save(); to.draw(g, t, to); g.restore(); } else paper(g);
  if (!from) return;
  const oc = off(g), og = oc.getContext('2d');
  const k0 = g.canvas.width / W;
  og.setTransform(1, 0, 0, 1, 0, 0);
  og.clearRect(0, 0, oc.width, oc.height);
  og.setTransform(k0, 0, 0, k0, 0, 0);
  og.save();
  // Keep the outgoing picture's own boil going but hold its clock at the join's end at the latest.
  from.draw(og, Math.min(t, from.b + .2), from);
  og.restore();
  const k = g.canvas.width / W;
  if (j.kind === 'flip') {
    // A top-bound notebook page turning up and away: it foreshortens towards the top edge.
    const e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    const cs = Math.cos(e * Math.PI / 2);
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.drawImage(oc, 0, 0, oc.width, oc.height, 0, 0, oc.width, oc.height * cs);
    // Shade the page as it turns, and cast its shadow on the one below.
    const sh = g.createLinearGradient(0, oc.height * cs, 0, oc.height * cs + 90 * k);
    sh.addColorStop(0, 'rgba(70,55,35,.34)'); sh.addColorStop(1, 'rgba(70,55,35,0)');
    g.fillStyle = sh; g.fillRect(0, oc.height * cs, oc.width, 90 * k);
    g.fillStyle = `rgba(90,70,40,${.3 * (1 - cs)})`; g.fillRect(0, 0, oc.width, oc.height * cs);
    g.restore();
    g.save(); g.setTransform(k, 0, 0, k, 0, 0); rings(g, t, 1); g.restore();
  } else if (j.kind === 'scribble') {
    // A pencil scribbles the old picture away, top to bottom, in wide zigzag passes.
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    const e = smooth(p);
    const front = e * (H + 260) - 130;  // y of the scribble's leading edge, master px
    const R = rng(hash(j.a, 7) * 1e6 + 5);
    g.beginPath();
    g.moveTo(0, front * k);
    const N = 14;
    for (let i = 0; i <= N; i++) { const x = W * i / N; g.lineTo(x * k, (front + Math.sin(i * 1.7 + j.a * 3) * 50 + (R() - .5) * 40) * k); }
    g.lineTo(oc.width, oc.height); g.lineTo(0, oc.height); g.closePath();
    g.clip();
    g.drawImage(oc, 0, 0);
    g.restore();
    // The scribble itself, on the front: a fat zigzag.
    g.save(); g.setTransform(k, 0, 0, k, 0, 0);
    const pts = [];
    for (let i = 0; i <= 26; i++) pts.push([(i % 2 ? W + 30 : -30) * (i % 2 ? 1 : 1) + (i % 2 ? 0 : 0), front - 70 + i * 6 + (R() - .5) * 20]);
    line(g, pts, { w: 34, col: j.col || '#8d8c97', seed: j.a * 7, t, spline: false, passes: 1, alpha: .75, taper: [.01, .01], tooth: .5 });
    g.restore();
  }
}
