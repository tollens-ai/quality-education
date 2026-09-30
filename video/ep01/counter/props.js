// The things in "The Counter" that aren't the wall, the counter, the cast or the type.
//
// Every prop here exists because a sung line names it. Nothing is drawn that the song doesn't ask
// for, which is why the set stays small and the story carries.

import { P } from './palette.js';
import { drawText, measure } from './type.js';
import { rng, hash, line, inkFill, outline, stipple, hatch, rect, curve, quad, shape, easeOut, clamp01, lerp, smooth, between } from './kit.js';
import { crate } from './world.js';
import { impression, stencil, marked, label, crossed, ticked, tag, tollensMark } from './marks.js';

// Confetti: the film's only bright clutter, thrown on the beat and gone in a second.
export function confetti(g, id, x, y, t, n = 90, o = {}) {
  const r = rng(hash(id));
  const cols = [P.ox, P.petrol, P.lamp, P.ink, P.oxSoft, P.petrolSoft];
  for (let i = 0; i < n; i++) {
    const a = -2.6 + r() * 2.2, sp = 380 + r() * 620;
    const px = x + Math.cos(a) * sp * t * (0.5 + r() * 0.4);
    const py = y + Math.sin(a) * sp * t + 900 * t * t;
    if (py > 1950) continue;
    const w = 9 + r() * 12, h = 6 + r() * 8, rot = t * (3 + r() * 7) + r() * 6.283;
    g.save();
    g.translate(px, py);
    g.rotate(rot);
    g.globalAlpha = clamp01(1.35 - t * 0.75);
    g.fillStyle = cols[i % cols.length];
    g.fillRect(-w / 2, -h / 2, w, h * Math.abs(Math.cos(rot * 1.4) * 0.8 + 0.2));
    g.restore();
  }
}

// A padlock, drawn as a body with a thick shackle through its own shackle holes — the shackle is
// two straight legs and a curve, not a wire, so it reads at phone size.
export function padlock(g, id, x, y, s, o = {}) {
  const b = o.boil ?? 0, open = o.open ?? false;
  const bw = s, bh = s * 0.78;
  const body = curve([[x - bw / 2, y - bh * 0.1], [x - bw / 2, y + bh * 0.62], [x - bw * 0.36, y + bh * 0.78],
    [x + bw * 0.36, y + bh * 0.78], [x + bw / 2, y + bh * 0.62], [x + bw / 2, y - bh * 0.1]], 0.25, 4);
  inkFill(g, id + 'b', body, { colour: open ? P.paperDeep : P.oxDeep, bleed: 1, w: 7 });
  outline(g, id + 'bo', body, { w: 7, colour: P.ink, boil: b });
  // the keyhole, and the two holes the shackle goes through
  g.beginPath(); g.ellipse(x, y + bh * 0.3, s * 0.1, s * 0.13, 0, 0, 6.283);
  g.fillStyle = P.ink; g.fill();
  const arcR = s * 0.3, legW = s * 0.17;
  if (open) {
    // hanging open: the shackle is pushed to one side and its legs are out of the holes
    line(g, id + 's1', [[x - arcR, y - bh * 0.08], [x - arcR, y - arcR * 1.1], [x - arcR * 0.2, y - arcR * 1.5]],
      { w: legW, colour: P.ink, boil: b, rough: 0.9 });
    line(g, id + 's2', [[x + arcR, y - bh * 0.08], [x + arcR, y - arcR * 1.1], [x + arcR * 0.2, y - arcR * 1.5]],
      { w: legW, colour: P.ink, boil: (b + 1) % 3, rough: 0.9 });
  } else {
    const sh = curve([[x - arcR, y - bh * 0.06], [x - arcR, y - arcR * 1.15], [x, y - arcR * 1.55],
      [x + arcR, y - arcR * 1.15], [x + arcR, y - bh * 0.06]], 0.5, 8);
    line(g, id + 'sh', sh, { w: legW, colour: P.ink, boil: b, rough: 0.8 });
  }
}

// A crane on the wall, and something small hanging off it.
export function crane(g, id, x, y, s, t, o = {}) {
  const b = o.boil ?? 0;
  line(g, id + 'jib', [[x - s * 2.2, y], [x + s * 2.0, y - s * 0.28]], { w: 13, colour: P.ink, boil: b });
  line(g, id + 'mast', [[x - s * 1.7, y], [x - s * 1.55, y + s * 1.5]], { w: 11, colour: P.ink, boil: (b + 1) % 3 });
  hatch(g, id + 'mg', x - s * 2.05, y, s * 0.55, s * 1.5, { gap: 22, w: 4, ang: 1.2, colour: P.paperDeep, boil: b });
  const hx = x + s * 1.1;
  line(g, id + 'rope', [[hx, y - s * 0.2], [hx, y + s * o.drop]], { w: 4, colour: P.ink, boil: b });
  return [hx, y + s * o.drop];
}

// A shed: the whole blog, one room, absurdly small.
export function shed(g, id, x, y, s, o = {}) {
  const b = o.boil ?? 0;
  const roof = [[x - s, y - s * 0.72], [x, y - s * 1.28], [x + s, y - s * 0.72]];
  const body = [[x - s * 0.82, y - s * 0.72], [x + s * 0.82, y - s * 0.72], [x + s * 0.82, y], [x - s * 0.82, y]];
  inkFill(g, id + 'bd', body, { colour: P.paperDeep, bleed: 1, w: 6 });
  outline(g, id + 'bdo', body, { w: 6, colour: P.ink, boil: b });
  inkFill(g, id + 'rf', roof, { colour: P.ox, bleed: 1, w: 6 });
  outline(g, id + 'rfo', roof, { w: 6, colour: P.ink, boil: (b + 1) % 3 });
  g.fillStyle = P.ink;
  g.fillRect(x - s * 0.16, y - s * 0.56, s * 0.32, s * 0.56);
  line(g, id + 'ln', [[x - s * 0.82, y - s * 0.3], [x + s * 0.82, y - s * 0.34]], { w: 3, colour: P.paperDeep, boil: b, taper: 0.9 });
}

// A handset with three enormous buttons, for the phone nobody was told about.
export function handset(g, id, x, y, s, o = {}) {
  const b = o.boil ?? 0;
  const body = rect(x - s * 0.5, y - s, s, s * 2, s * 0.16);
  inkFill(g, id + 'b', body, { colour: P.petrol, bleed: 1, w: 7 });
  outline(g, id + 'bo', body, { w: 7, colour: P.ink, boil: b });
  g.fillStyle = P.paperLit;
  g.fillRect(x - s * 0.34, y - s * 0.86, s * 0.68, s * 0.5);
  const cols = [P.ox, P.lamp, P.paperLit];
  for (let i = 0; i < 3; i++) {
    const cy = y - s * 0.16 + i * s * 0.34;
    g.beginPath(); g.arc(x, cy, s * 0.14, 0, 6.283);
    g.fillStyle = cols[i]; g.fill();
    g.strokeStyle = P.ink; g.lineWidth = 5; g.stroke();
  }
}

// A speaker grille, and the sound coming out of it as rings.
export function speaker(g, id, x, y, s, t, o = {}) {
  const b = o.boil ?? 0;
  const body = rect(x - s * 0.7, y - s * 0.5, s * 1.4, s, s * 0.1);
  inkFill(g, id + 'b', body, { colour: P.petrolDeep, bleed: 1, w: 6 });
  outline(g, id + 'bo', body, { w: 6, colour: P.ink, boil: b });
  for (let i = 0; i < 7; i++) stipple(g, id + 'h' + i, x - s * 0.56 + i * s * 0.16, y - s * 0.34, s * 0.1, s * 0.68, 26, { colour: P.petrolSoft, r: s * 0.022, boil: b });
  for (let i = 0; i < 3; i++) {
    const p = (t * 1.4 + i / 3) % 1;
    if (p > 0.7) continue;
    g.save();
    g.globalAlpha = (1 - p / 0.7) * 0.75;
    g.beginPath(); g.arc(x + s * 0.78, y, s * (0.2 + p * 0.9), -0.9, 0.9);
    g.strokeStyle = P.petrol; g.lineWidth = 6; g.stroke();
    g.restore();
  }
}

// A leaking pipe: the data leak, as water, because nobody reads a diagram.
export function leak(g, id, x, y, s, t, o = {}) {
  const b = o.boil ?? 0;
  line(g, id + 'p', [[x - s * 2, y], [x + s * 0.4, y], [x + s * 0.4, y + s * 0.5]], { w: 16, colour: P.petrolDeep, boil: b, rough: 0.8 });
  outline(g, id + 'jo', [[x + s * 0.1, y - s * 0.16], [x + s * 0.7, y - s * 0.16], [x + s * 0.7, y + s * 0.16], [x + s * 0.1, y + s * 0.16]], { w: 5, colour: P.ink, boil: (b + 1) % 3 });
  const drip = (t * 1.6) % 1;
  const dy = y + s * 0.5 + drip * s * 2.4;
  g.save();
  g.globalAlpha = clamp01(1 - drip);
  g.beginPath(); g.ellipse(x + s * 0.4, dy, s * 0.13, s * 0.2, 0, 0, 6.283);
  g.fillStyle = P.petrol; g.fill();
  g.restore();
}

// A log on a roll: the diagnostics, drawn as a paper tape with marks on it.
export function logTape(g, id, x, y, w, h, o = {}) {
  const b = o.boil ?? 0;
  const pts = curve([[x - w / 2, y], [x - w * 0.2, y - h * 0.16], [x + w * 0.2, y + h * 0.12], [x + w / 2, y - h * 0.1], [x + w / 2 + 14, y + h * 0.5], [x - w / 2 - 14, y + h * 0.5]], 0.4, 6);
  inkFill(g, id + 'p', pts, { colour: P.paperLit, bleed: 1, w: 5 });
  outline(g, id + 'po', pts, { w: 5, colour: P.ink, boil: b });
  const r = rng(hash(id));
  for (let i = 0; i < 5; i++) {
    const ly = y + h * (0.06 + i * 0.09);
    const lw = w * (0.3 + r() * 0.5);
    line(g, id + `l${i}`, [[x - w * 0.36, ly], [x - w * 0.36 + lw, ly - 3]], { w: 4, colour: i === 2 ? P.ox : P.inkSoft, boil: (b + i) % 3, taper: 0.9 });
  }
  return pts;
}

// A balance with three crates on it: the film's one diagram, and it is a real one.
export function balance(g, id, x, y, s, t, o = {}) {
  const b = o.boil ?? 0;
  const tilt = Math.sin(t * 1.5) * 0.05;
  line(g, id + 'post', [[x, y], [x, y - s]], { w: 13, colour: P.ink, boil: b });
  line(g, id + 'base', [[x - s * 0.5, y], [x + s * 0.5, y]], { w: 11, colour: P.ink, boil: (b + 1) % 3 });
  const beam = [[x - s * 1.6, y - s + tilt * s], [x + s * 1.6, y - s - tilt * s]];
  line(g, id + 'beam', beam, { w: 11, colour: P.ink, boil: b });
  for (const sx of [-1, 1]) {
    const bx = x + sx * s * 1.6, by = y - s + (sx < 0 ? tilt : -tilt) * s;
    line(g, id + 'hang' + sx, [[bx, by], [bx, by + s * 0.34]], { w: 4, colour: P.ink, boil: b });
    const pan = [[bx - s * 0.42, by + s * 0.34], [bx + s * 0.42, by + s * 0.34], [bx + s * 0.32, by + s * 0.62], [bx - s * 0.32, by + s * 0.62]];
    inkFill(g, id + 'pan' + sx, pan, { colour: P.paperDeep, bleed: 0, w: 5 });
    outline(g, id + 'pano' + sx, pan, { w: 5, colour: P.ink, boil: (b + 1) % 3 });
  }
  return { beam };
}

// Fireworks: what "wow for a week" turns into.
export function fireworks(g, id, x, y, t, o = {}) {
  if (t > 1.5) return;
  const cols = [P.ox, P.lamp, P.petrol, P.paperLit];
  for (let k = 0; k < 3; k++) {
    const t0 = k * 0.34;
    const p = t - t0;
    if (p <= 0 || p > 1.1) continue;
    const n = 22, sp = 300 + k * 90;
    for (let i = 0; i < n; i++) {
      const a = i / n * 6.283;
      const d = sp * p * (0.6 + 0.4 * Math.sin(i * 2.3));
      g.save();
      g.globalAlpha = clamp01(1 - p / 1.1) * 0.95;
      g.beginPath();
      g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d + 260 * p * p, 6 + (1 - p) * 5, 0, 6.283);
      g.fillStyle = cols[(i + k) % cols.length];
      g.fill();
      g.restore();
    }
  }
}

// Hands held out over the counter, waiting: the film's most important image and its emptiest.
//
// One continuous outline, drawn the way a print draws a hand: up the thumb, across the knuckles,
// down the outside of the little finger, round the wrist. Fingers are cut into the top edge as
// scallops, not drawn as separate shapes laid over a palm (which leaves gaps, and reads as a
// scribble). Nothing is drawn below the wrist, so the hand is offered into empty air.
export function handsOut(g, id, n, y, s, o = {}) {
  const b = o.boil ?? 0;
  const skin = o.skin || '#d9b48c';
  for (let i = 0; i < n; i++) {
    const x = o.x0 + (o.x1 - o.x0) * (n === 1 ? 0.5 : i / (n - 1)) + (o.jitter ?? 0) * ((i % 2) ? -1 : 1);
    const px = x + Math.sin((o.t ?? 0) * 2.2 + i * 1.7) * s * 0.06;
    const py = y;

    // four fingers as scallops across the top of the palm, longest in the middle
    const top = [];
    for (let f = 0; f < 4; f++) {
      const fx = px - s * 0.30 + (f + 0.5) * (s * 0.6 / 4);
      const h = s * (f === 1 || f === 2 ? 0.34 : 0.27);
      const hw = s * 0.075;
      top.push([fx - hw, py - s * 0.16]);
      top.push([fx - hw * 0.5, py - s * 0.16 - h * 0.8]);
      top.push([fx, py - s * 0.16 - h]);
      top.push([fx + hw * 0.5, py - s * 0.16 - h * 0.8]);
      top.push([fx + hw, py - s * 0.16]);
    }
    const hand = curve([
      ...top,
      [px + s * 0.36, py + s * 0.02],          // round the outside of the little finger
      [px + s * 0.30, py + s * 0.26],
      [px + s * 0.22, py + s * 0.34],          // the wrist
      [px - s * 0.22, py + s * 0.34],
      [px - s * 0.30, py + s * 0.26],
      [px - s * 0.36, py + s * 0.02],          // round the outside of the thumb side
      [px - s * 0.30, py - s * 0.16],
    ], 0.42, 4);
    inkFill(g, id + i + 'h', hand, { colour: skin, bleed: 1, w: 6 });
    outline(g, id + i + 'ho', hand, { w: 6, colour: P.ink, boil: (b + i) % 3 });

    // the creases: two across the palm and a thumb line, which is what makes it read as a hand
    line(g, id + i + 'c1', [[px - s * 0.2, py - s * 0.04], [px + s * 0.22, py + s * 0.02]],
      { w: 3.5, colour: P.inkSoft, boil: b, rough: 0.8, taper: 0.9 });
    line(g, id + i + 'c2', [[px - s * 0.18, py + s * 0.12], [px + s * 0.18, py + s * 0.16]],
      { w: 3.5, colour: P.inkSoft, boil: (b + 1) % 3, rough: 0.8, taper: 0.9 });
    line(g, id + i + 'th', [[px - s * 0.3, py + s * 0.04], [px - s * 0.1, py + s * 0.16]],
      { w: s * 0.16, colour: skin, boil: (b + 2) % 3, rough: 0.9 });
    line(g, id + i + 'tho', [[px - s * 0.34, py + s * 0.02], [px - s * 0.08, py + s * 0.2]],
      { w: 4.5, colour: P.ink, boil: (b + 1) % 3, rough: 0.9 });
  }
}

// A crate travelling over the wall: the film's central movement, so it gets its own function.
export function overTheWall(g, id, x, y, w, h, p, o = {}) {
  // p = 0 at the hatch, 1 on the street: an arc that clears the top edge and comes down on this side
  const top = o.top ?? 150;
  const ax = o.x0 ?? 540, ay = o.y0 ?? 700, bx = o.x1 ?? 540, by = o.y1 ?? 1500;
  const cx = (ax + bx) / 2, cy = Math.min(ay, by) - (o.lift ?? 520);
  const q = 1 - p;
  const px = q * q * ax + 2 * q * p * cx + p * p * bx;
  const py = q * q * ay + 2 * q * p * cy + p * p * by;
  const rot = (p - 0.5) * 1.5;
  g.save();
  g.globalAlpha = 1;
  crate(g, px, py, w, h, { ang: rot, boil: o.boil ?? 0, grounded: false, text: o.text, mark: o.mark, markColour: o.markColour });
  g.restore();
  return [px, py, rot];
}