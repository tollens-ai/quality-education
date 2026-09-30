// "The Counter": the world.
//
// One set, drawn flat and frontal like a printed certificate: the wall of the depot, its top edge
// seen from a little above, and the street at the bottom with the queue cropped by the frame. No
// room, no perspective, no texture over the whole picture. Everything is a shape with an edge.
//
// The composition does the teaching. Clawd works behind the wall and can only get things out
// through the hatch, so every crate he builds has to go up and over the top of the wall and come
// down in the street: that is "throw it over the wall" before the song says it. Nothing on this
// side of the wall is addressed, because nobody on this side said who anything was for.

import { P } from './palette.js';
import { drawText, measure } from './type.js';
import { rng, hash, line, path, inkFill, outline, stipple, rect, curve, quad, blot, easeOut, clamp01, lerp, smooth } from './kit.js';
import { impression, stencil, marked, label, form, crossed, ticked, tag, tollensMark } from './marks.js';
import { person } from './cast.js';

// The film's composition, in master pixels. The wall's face carries the title zone and nothing
// else, so a sung line always has a clear place to land; the street fills the bottom third, so the
// queue is always cropped by the frame instead of floating on an empty field.
export const SKY = 148;             // the paper above the wall
export const WALLTOP = 186;         // the wall's top face
export const WALLBOT = 1170;        // where the wall meets the street
export const HATCH = { x: 244, y: 236, w: 592, h: 468 };   // Clawd's opening
// Where a sung line lands: on the street, in front of the counter, because the words are for the
// people on this side. Nothing else is ever drawn in this band (LYRIC.y-120 .. LYRIC.y+240).
export const LYRIC = { x: 456, y: 1298, w: 896, maxSize: 78, rows: 3 };
export const KERB = 1660;
export const REACH = 1380;         // where hands go over the counter           // what stands on the street
export const CROWD = 2090;          // the queue's feet, so only heads are cropped by the frame
export const BENCH = 762;           // the counter board under the hatch
export const FLOOR = 1170;

export function ground(g, t, o = {}) {
  const b = o.boil ?? 0;
  inkFill(g, 'gfl', [[0, WALLBOT], [1080, WALLBOT], [1080, 1920], [0, 1920]], { colour: P.paperDim, bleed: 0, w: 0 });
  line(g, 'gfll', [[-20, WALLBOT], [1100, WALLBOT]], { w: 9, colour: P.ink, boil: b });
  // one kerb line and nothing else: the street is a floor, not a pattern
  line(g, 'kerb', [[-20, 1730], [1100, 1730]], { w: 4, colour: P.paperDeep, boil: (b + 1) % 3, taper: 0.95 });
  stipple(g, 'gfs', 0, WALLBOT, 1080, 1920 - WALLBOT, 170, { colour: P.paperDeep, r: 2.2, boil: b });
}

// The wall: its top face, its face, and a border, all one shape with one edge.
export function wall(g, b) {
  inkFill(g, 'wtop', [[-30, SKY], [1110, SKY + 16], [1110, WALLTOP], [-30, WALLTOP + 16]], { colour: P.paperDeep, bleed: 0, w: 0 });
  outline(g, 'wtopo', [[-30, SKY], [1110, SKY + 16], [1110, WALLTOP], [-30, WALLTOP + 16]], { w: 8, colour: P.ink, boil: b });
  inkFill(g, 'wface', [[-30, WALLTOP + 16], [1110, WALLTOP], [1110, WALLBOT], [-30, WALLBOT + 16]], { colour: P.paper, bleed: 0, w: 0 });
  outline(g, 'wfaceo', [[-30, WALLTOP + 16], [1110, WALLTOP], [1110, WALLBOT], [-30, WALLBOT + 16]], { w: 8, colour: P.ink, boil: b });
  // the wall's courses of blockwork: five joints and three perpends, nothing more
  // The title zone is left clear: no course lines between TITLE.y - 210 and WALLBOT - 40.
  for (let i = 1; i <= 3; i++) {
    const y = WALLTOP + 150 + i * 150;
    line(g, `wsl${i}`, [[-30, y + 8], [1110, y - 6]], { w: 3.5, colour: P.paperDim, boil: (b + i) % 3, taper: 0.98, rough: 1.1 });
  }
  for (let i = 0; i < 3; i++) {
    const x = 150 + i * 340, y = WALLTOP + 150 + (i % 2) * 150;
    line(g, `wsp${i}`, [[x, y + 6], [x - 4, y + 150]], { w: 3.5, colour: P.paperDim, boil: (b + i + 2) % 3, taper: 0.98, rough: 1.1 });
  }
}

// The opening Clawd works in: an opening with a reveal, a counter board, and the dark inside.
export function opening(g, b, o = {}) {
  const H = o.h ?? HATCH.h, Y = o.y ?? HATCH.y, X = o.x ?? HATCH.x, W = o.w ?? HATCH.w;
  // the reveal: a band of wall thickness inside the opening
  inkFill(g, 'hrv', [[X - 26, Y - 26], [X + W + 26, Y - 26], [X + W + 26, Y + H + 26], [X - 26, Y + H + 26]], { colour: P.paperDeep, bleed: 1, w: 6 });
  // inside: Clawd's side, a darker flat
  inkFill(g, 'hin', [[X, Y], [X + W, Y], [X + W, Y + H], [X, Y + H]], { colour: o.inside || '#d8c6a0', bleed: 0, w: 0 });
  outline(g, 'hino', [[X, Y], [X + W, Y], [X + W, Y + H], [X, Y + H]], { w: 9, colour: P.ink, boil: b });
  outline(g, 'hrvo', [[X - 26, Y - 26], [X + W + 26, Y - 26], [X + W + 26, Y + H + 26], [X - 26, Y + H + 26]], { w: 6, colour: P.ink, boil: (b + 1) % 3, rough: 1.4 });
  // a shelf of manuals inside, at the back
  const sy = Y + 96;
  line(g, 'hsl', [[X + 14, sy], [X + W - 14, sy]], { w: 6, colour: P.inkSoft, boil: b });
  const r = rng(hash('hbk'));
  let mx = X + 24;
  for (let i = 0; i < 9 && mx < X + W - 60; i++) {
    const w = 26 + r() * 14, h = 52 + r() * 26;
    const pts = [[mx, sy], [mx, sy - h], [mx + w, sy - h - 2], [mx + w, sy]];
    inkFill(g, `hb${i}`, pts, { colour: [P.oxSoft, P.petrolSoft, P.paperDeep][i % 3], bleed: 0, w: 4 });
    outline(g, `hbo${i}`, pts, { w: 4, colour: P.inkSoft, boil: (b + i) % 3 });
    mx += w + 3 + r() * 5;
  }
  // the counter board, coming towards us out of the opening
  const by = Y + H + 24;
  inkFill(g, 'hbrd', [[X - 40, by], [X + W + 40, by], [X + W + 84, by + 76], [X - 84, by + 76]], { colour: P.paperLit, bleed: 2, w: 7 });
  outline(g, 'hbrdo', [[X - 40, by], [X + W + 40, by], [X + W + 84, by + 76], [X - 84, by + 76]], { w: 7, colour: P.ink, boil: (b + 1) % 3 });
  line(g, 'hbrdl', [[X - 40, by], [X - 84, by + 76]], { w: 7, colour: P.ink, boil: (b + 2) % 3 });
  line(g, 'hbrdr', [[X + W + 40, by], [X + W + 84, by + 76]], { w: 7, colour: P.ink, boil: b });
  // the brass edge, the one shine in the film
  line(g, 'hbrass', [[X - 82, by + 70], [X + W + 82, by + 70]], { w: 8, colour: P.lamp, boil: (b + 2) % 3, rough: 0.7 });
  return by + 76;
}

// A crate, with a label on it. Everything Clawd builds leaves in one of these.
export function crate(g, x, y, w, h, o = {}) {
  const b = o.boil ?? 0, ang = o.ang ?? 0;
  if (o.grounded !== false) {
    // the shadow it drops on the floor, so it stands on the street instead of hovering over it
    g.save();
    g.globalAlpha = 0.3;
    g.beginPath(); g.ellipse(x + h * 0.1, y + 6, w * 0.56, h * 0.13, 0, 0, 6.283);
    g.fillStyle = P.paperDeep; g.fill();
    g.restore();
  }
  g.save();
  g.translate(x, y);
  g.rotate(ang);
  const pts = [[-w / 2, -h], [w / 2, -h], [w / 2, 0], [-w / 2, 0]];
  inkFill(g, `cr${x.toFixed(0)}${y.toFixed(0)}${w.toFixed(0)}`, pts, { colour: o.colour || P.paperDeep, bleed: 2, voids: o.voids ?? 1, w: 7 });
  outline(g, `cro${x.toFixed(0)}${y.toFixed(0)}${w.toFixed(0)}`, pts, { w: 7, colour: P.ink, boil: b });
  line(g, `crh${x.toFixed(0)}${y.toFixed(0)}`, [[-w / 2, -h * 0.66], [w / 2, -h * 0.66]], { w: 4, colour: P.inkSoft, boil: b, taper: 0.92 });
  line(g, `crd${x.toFixed(0)}${y.toFixed(0)}`, [[-w / 2, -h * 0.3], [w / 2, -h * 0.34]], { w: 3, colour: P.inkSoft, boil: (b + 2) % 3, taper: 0.92 });
  if (o.text) {
    const per = measure(o.text, 100) / 100;
    // A stamp degenerates into a red bar below about 34px, so a small crate gets a printed label
    // instead, and never type too small to read on a phone.
    let size = o.size ?? Math.min(h * 0.34, (w * 0.78) / per);
    let mark = o.mark || label;
    // A stamp degenerates into a red bar below about 34px, so a small crate gets a printed label.
    if (size < 34 && mark === impression) { mark = label; }
    // Never so big the mark runs off the crate: impression and stencil both size themselves from
    // the text, so cap the size to what fits the face.
    size = Math.min(size, (w * 0.78) / per, h * 0.34);
    const opts = { colour: o.markColour || P.ink, boil: b };
    if (mark === impression) { opts.w = Math.min(w * 0.9, size * per + size * 0.9); opts.h = Math.min(h * 0.66, size * 1.5); }
    mark(g, o.text, 0, h * (o.labelY ?? -0.5), size, opts);
  }
  g.restore();
}

// The slip the brief arrives on: the only thing in the film anyone actually wrote.
export function slip(g, x, y, w, o = {}) {
  const b = o.boil ?? 0;
  const h = w * 0.6, ang = o.ang ?? 0.05;
  g.save();
  g.translate(x, y);
  g.rotate(ang);
  const pts = curve([[-w / 2, -h / 2], [0, -h / 2 - 7], [w / 2, -h / 2], [w / 2 + 5, 0], [w / 2 - 3, h / 2], [-w / 2, h / 2 + 4], [-w / 2 - 5, 0]], 0.4, 6);
  inkFill(g, `sl${x.toFixed(0)}${y.toFixed(0)}`, pts, { colour: P.paperLit, bleed: 1, w: 5 });
  outline(g, `slo${x.toFixed(0)}${y.toFixed(0)}`, pts, { w: 5, colour: P.ink, boil: b });
  g.restore();
  return { h, ang };
}

// A meter that pegs and empties: the quota.
export function meter(g, x, y, w, h, frac, o = {}) {
  const b = o.boil ?? 0;
  const outer = rect(x - w / 2, y - h, w, h, 10);
  inkFill(g, `mt${x}${y}`, outer, { colour: P.paperLit, bleed: 1, w: 6 });
  outline(g, `mto${x}${y}`, outer, { w: 6, colour: P.ink, boil: b });
  const inner = rect(x - w / 2 + 13, y - h + 13, w - 26, h - 26, 6);
  inkFill(g, `mti${x}${y}`, inner, { colour: P.paper, bleed: 0, w: 0 });
  const n = 16;
  for (let i = 0; i < n; i++) {
    if (i / n >= frac) break;
    const px = x - w / 2 + 20 + i * (w - 40) / n;
    inkFill(g, `mtb${x}${y}${i}`, [[px, y - 26], [px + 13, y - 26], [px + 13, y - 15], [px, y - 15]], { colour: i > n * 0.78 ? P.ox : P.petrol, bleed: 0, w: 3 });
  }
  outline(g, `mtio${x}${y}`, inner, { w: 4, colour: P.inkSoft, boil: b });
}

// A clock face, with twelve tokens going round it.
export function clock(g, x, y, r, hands, o = {}) {
  const b = o.boil ?? 0;
  g.save();
  g.translate(x, y);
  g.beginPath(); g.arc(0, 0, r, 0, 6.283);
  g.fillStyle = P.paperLit; g.fill();
  g.strokeStyle = P.ink; g.lineWidth = 7; g.stroke();
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * 6.283 - 1.571;
    line(g, `ckt${i}`, [[Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.78], [Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9]], { w: 5, colour: P.ink, boil: (b + i) % 3 });
  }
  if (hands?.h != null) line(g, 'ckh', [[0, 0], [Math.cos(hands.h) * r * 0.48, Math.sin(hands.h) * r * 0.48]], { w: 8, colour: P.ink, boil: b });
  if (hands?.m != null) line(g, 'ckm', [[0, 0], [Math.cos(hands.m) * r * 0.74, Math.sin(hands.m) * r * 0.74]], { w: 6, colour: P.ox, boil: (b + 1) % 3 });
  g.beginPath(); g.arc(0, 0, 7, 0, 6.283); g.fillStyle = P.ink; g.fill();
  g.restore();
}

// The queue on the street side. Returns the placements so a scene can put a crate in a pair of
// hands; drawn back row first, so nearer people hide those behind and nobody stands in mid-air.
export function queue(g, n, y, o = {}) {
  const b = o.boil ?? 0;
  const r = rng(hash(`q${n}${y}${o.seed ?? 0}`));
  const out = [];
  for (let i = 0; i < n; i++) {
    const depth = i / Math.max(1, n - 1);                 // 0 = nearest
    out.push({
      i, depth,
      x: -30 + (i + 0.5) * (1140 / n) + (r() - 0.5) * 46,
      s: (o.s ?? 1.5) * (1 - depth * 0.34),
      kind: Math.floor(r() * 9),
      hat: r() < 0.3 ? 'beanie' : r() < 0.42 ? 'cap' : r() < 0.5 ? 'bun' : null,
      holding: r() < 0.35 ? 'bag' : r() < 0.6 ? 'phone' : null,
    });
  }
  out.sort((a, c) => c.depth - a.depth);                    // back row first
  const bp = o.beat ?? 0, bi = o.beatI ?? 0.3;
  const hit = (1 - bp) ** 2 * bi;
  for (const p of out) {
    const shift = hit * (1 - p.depth) * 16;                  // the near row moves most
    g.save();
    g.globalAlpha = 0.7 + (1 - p.depth) * 0.3;
    person(g, p.x + shift, y + hit * 9 * (1 - p.depth), p.s * (1 + hit * 0.03),
      { kind: p.kind, hat: p.hat, holding: p.holding, boil: (b + p.i) % 3 });
    g.restore();
  }
  return out;
}

// The whole establishing composition, in order.
export function theCounter(g, t, o = {}) {
  const b = o.boil ?? 0;
  g.fillStyle = P.paper;
  g.fillRect(0, 0, 1080, 1920);
  ground(g, t, { boil: b });
  wall(g, b);
}