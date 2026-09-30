// "The Counter": the cast.
//
// Clawd is a crab, because Clawd is a crab. He is the only warm thing in a manila-and-ink world, so
// the eye always knows which side of the partition he is on.
//
// The people on the street are drawn the way a print draws people: one flat tint, a strong
// contour, two or three interior cuts. That is a deliberate look, not a dodge — a fully modelled
// person drawn from shapes shows its construction, and a crowd of those is worse than no crowd.

import { P } from './palette.js';
import { drawText, measure } from './type.js';
import { rng, hash, line, path, inkFill, outline, stipple, hatch, rect, curve, quad, shape } from './kit.js';
import { tollensMark } from './marks.js';

export const CL = { body: '#c9663f', deep: '#a44e2e', pale: '#e2a17d', claw: '#b85a35' };

// ---------------------------------------------------------------- Clawd

// o = {arm: 0 down .. 1 up, look: -1..1, s: scale, boil}
// Each limb is one closed polygon drawn twice — once in ink, once in the body colour a hair
// inside — so the outline can never disagree with the fill. Clawd is a crab: two claws, four pairs
// of legs, a broad carapace and eyes on stalks.
export function clawd(g, x, y, s = 1, o = {}) {
  const arm = o.arm ?? 0;
  const look = o.look ?? 0;
  const b = o.boil ?? 0;
  // The groove: Clawd moves with the record, so he is never a held drawing. `o.beat` is 0..1 within
  // the current beat and `o.beatI` how strong the pulse is (the chorus beats harder).
  const bp = o.beat ?? 0;
  const bi = o.beatI ?? 0.35;
  const hit = (1 - bp) ** 2 * bi;
  const id = `cl${Math.round(x / 10)}${Math.round(y / 10)}${Math.round(arm * 5)}${Math.round(look * 4)}`;
  g.save();
  g.translate(x, y);
  g.scale(s, s);

  // A limb: the fill is the shape itself, and the ink is one closed nib stroke drawn round that
  // same shape, so the two can never disagree. (Insetting the fill towards the centroid does
  // disagree — on a long thin arm it pulls the far end into a spike.)
  const limb = (pts, fill, seed, w = 7) => {
    const poly = shape(curve(pts, 0.5, 5));
    inkFill(g, id + seed + 'f', poly, { colour: fill, bleed: 0, w: 0 });
    line(g, id + seed + 'o', poly.concat([poly[0]]), { w, colour: P.ink, boil: b, rough: 1.2, over: 0.9, taper: 0.15 });
  };

  // legs: four pairs, back pair first
  for (let k = 0; k < 2; k++) {
    for (const sx of [1, -1]) {
      const bx = sx * (34 + k * 26), by = 30 + k * 12;
      limb([[sx * 16, 22], [bx, by], [bx + sx * 16, by + 30 - k * 6], [bx + sx * 36, by + 42 - k * 9]],
        k ? CL.body : CL.deep, `lg${k}${sx}`, 6);
    }
  }

  // arms and claws: the claw is a pincer of two jaws, drawn as one shape with the arm
  for (const sx of [-1, 1]) {
    const raise = sx < 0 ? arm : arm * 0.7 + 0.08;
    const sh = [sx * 40, 4];
    const el = [sx * (66 + raise * 8), -6 - raise * 56];
    const cl = [sx * (94 + raise * 12), 2 - raise * 92];
    const cs = 34 + raise * 4;
    const open = 7 + (1 - Math.abs(raise)) * 12;              // a claw at rest is nearly shut
    const jawA = [
      sh, el,
      [cl[0] - sx * 4, cl[1] - cs],
      [cl[0] + sx * (cs * 0.9), cl[1] - cs * 0.62],
      [cl[0] + sx * (cs * 0.2), cl[1] - open],
    ];
    const jawB = [
      sh, el,
      [cl[0] - sx * 4, cl[1] + cs],
      [cl[0] + sx * (cs * 0.9), cl[1] + cs * 0.66],
      [cl[0] + sx * (cs * 0.2), cl[1] + open],
    ];
    limb(jawA, CL.body, `ja${sx}`, 8);
    limb(jawB, CL.deep, `jb${sx}`, 8);
    // the gap between the jaws, so the pincer reads as a pincer
    line(g, id + `gap${sx}`, [[cl[0] + sx * (cs * 0.16), cl[1] - open * 0.4], [cl[0] + sx * (cs * 0.2), cl[1] + open * 0.5]],
      { w: 4.5, colour: P.ink, boil: b, rough: 0.8 });
  }

  // the carapace
  const shell = curve([
    [-62, 22], [-68, -8], [-46, -32], [0, -38], [46, -32], [68, -8], [62, 22], [32, 40], [-32, 40],
  ], 0.5, 9);
  inkFill(g, id + 'shf', shell, { colour: CL.body, bleed: 1, voids: 1, w: 6 });
  line(g, id + 'sho', shell.concat([shell[0]]), { w: 9, colour: P.ink, boil: b, rough: 1.4, over: 1.1, taper: 0.2 });
  hatch(g, id + 'shh', -46, -24, 92, 52, { gap: 15, w: 4, ang: -0.62, colour: CL.deep, boil: (b + 2) % 3 });
  line(g, id + 'spine', [[0, -32], [0, 34]], { w: 5, colour: CL.deep, boil: b });

  // eyes on stalks, looking where the words are going
  for (const sx of [-1, 1]) {
    const ex = sx * 25 + look * sx * 10, ey = -52 - hit * 5;
    line(g, id + 'st' + sx, [[sx * 20, -30], [ex, ey + 13]], { w: 8, colour: P.ink, boil: b, rough: 0.8 });
    g.beginPath(); g.ellipse(ex, ey, 13, 14, 0, 0, 6.283); g.fillStyle = P.paperLit; g.fill();
    g.strokeStyle = P.ink; g.lineWidth = 5.5; g.stroke();
    g.fillStyle = P.ink;
    g.beginPath(); g.arc(ex + look * 4.5, ey + 1, 5.5, 0, 6.283); g.fill();
  }
  tollensMark(g, -34, 16, 15, { colour: P.paperLit });
  g.restore();
}

// ---------------------------------------------------------------- the people

const COATS = [P.ink, P.petrol, P.ox, P.paperDeep, P.inkSoft, P.petrolDeep];
const SKINS = ['#d9b48c', '#b98a5f', '#e8cba6', '#8d6242', '#c99a70'];

// A person as a print draws one: a silhouette with a contour and three interior cuts. `kind` picks
// the shape so a crowd is told apart at a glance.
export function person(g, x, y, s, o = {}) {
  const b = o.boil ?? 0;
  const kind = o.kind ?? 0;
  const coat = o.coat ?? COATS[kind % COATS.length];
  const id = `pp${x}${y}${kind}${Math.round(s * 10)}`;
  const r = rng(hash(id));
  const head = 26, sh = 62, hip = 40;
  g.save();
  g.translate(x, y);
  g.scale(s, s);
  // coat / body: the shape that tells them apart
  let body;
  if (kind % 5 === 0) body = [[-34, -sh], [34, -sh], [40, -6], [30, hip], [-30, hip], [-40, -6]];        // coat
  else if (kind % 5 === 1) body = [[-28, -sh], [28, -sh], [34, -4], [24, hip], [-24, hip], [-34, -4]];    // jacket
  else if (kind % 5 === 2) body = [[-30, -sh - 6], [30, -sh - 6], [36, -2], [26, hip], [-26, hip], [-36, -2]]; // dress
  else if (kind % 5 === 3) body = [[-32, -sh], [32, -sh], [38, -4], [22, hip], [-22, hip], [-38, -4]];    // anorak
  else body = [[-26, -sh], [26, -sh], [30, -6], [28, hip], [-28, hip], [-30, -6]];                        // shirt
  const neck = [[-8, -sh - 4], [8, -sh - 4], [10, -sh + 8], [-10, -sh + 8]];
  const cy = -sh - 22, ry = 26;
  const headp = curve(Array.from({ length: 15 }, (_, i) => {
    const a = i / 15 * 6.283;
    return [Math.cos(a) * head, cy + Math.sin(a) * ry];
  }), 0.5, 3);
  const legs = [];
  for (const sx of [-1, 1]) {
    legs.push([[sx * 13, hip - 6], [sx * 17, 96], [sx * 13, 150]]);
    line(g, id + 'lg' + sx, legs[legs.length - 1], { w: 15, colour: coat, boil: b, rough: 0.9 });
    line(g, id + 'sh' + sx, legs[legs.length - 1], { w: 15, colour: coat, boil: b, rough: 0.9 });
    // a shoe, so nobody floats
    const sx2 = sx * 13;
    inkFill(g, id + 'sh' + sx, [[sx2 - 17, 150], [sx2 + 20, 152], [sx2 + 22, 166], [sx2 - 18, 165]], { colour: P.ink, bleed: 0, w: 5 });
  }
  inkFill(g, id + 'bd', body, { colour: coat, bleed: 2, voids: 1, w: 7 });
  outline(g, id + 'bo', body, { w: 7, colour: P.ink, boil: b });
  inkFill(g, id + 'nk', neck, { colour: SKINS[kind % SKINS.length], bleed: 0, w: 5 });
  inkFill(g, id + 'hd', headp, { colour: SKINS[kind % SKINS.length], bleed: 1, w: 6 });
  outline(g, id + 'hdo', headp, { w: 6, colour: P.ink, boil: (b + 1) % 3 });
  // interior cuts: two lines and a pocket, which is what makes it a print
  line(g, id + 'c1', [[-6, -sh + 6], [-10, hip - 8]], { w: 4, colour: P.paperLit, boil: b, taper: 0.9 });
  if (kind % 3 === 0) line(g, id + 'pk', [[8, -18], [30, -18]], { w: 4.5, colour: P.paperLit, boil: b, taper: 0.9 });
  if (kind % 4 === 1) line(g, id + 'c2', [[-30, -sh + 16], [30, -sh + 16]], { w: 4.5, colour: P.paperLit, boil: b, taper: 0.9 });
  // whatever the person carries, carried
  if (o.holding === 'bag') {
    inkFill(g, id + 'bg', [[16, -10], [46, -8], [50, 30], [18, 32]], { colour: P.paperDeep, bleed: 1, w: 5 });
    outline(g, id + 'bgo', [[16, -10], [46, -8], [50, 30], [18, 32]], { w: 5, colour: P.ink, boil: b });
    line(g, id + 'bgh', [[24, -10], [30, -34], [42, -12]], { w: 4, colour: P.ink, boil: b });
  } else if (o.holding === 'phone') {
    inkFill(g, id + 'ph', [[16, -18], [36, -16], [37, 12], [17, 12]], { colour: P.ink, bleed: 0, w: 4 });
    g.fillStyle = P.petrolSoft; g.fillRect(19, -14, 14, 22);
  } else if (o.holding === 'lead') {
    line(g, id + 'ld', [[14, -30], [22, 20], [18, 78], [26, 128]], { w: 4.5, colour: P.ink, boil: b });
    line(g, id + 'cuff', [[30, 74], [24, 80]], { w: 4, colour: P.inkSoft, boil: b });
  } else if (o.holding === 'pram') {
    line(g, id + 'pr', [[20, -6], [24, 34]], { w: 5, colour: P.ink, boil: b });
    inkFill(g, id + 'prb', [[-2, 30], [62, 30], [56, 74], [4, 74]], { colour: P.paperDeep, bleed: 1, w: 6 });
    outline(g, id + 'prbo', [[-2, 30], [62, 30], [56, 74], [4, 74]], { w: 6, colour: P.ink, boil: b });
    g.strokeStyle = P.ink; g.lineWidth = 6;
    g.beginPath(); g.arc(14, 84, 15, 0, 6.283); g.stroke();
    g.beginPath(); g.arc(48, 84, 15, 0, 6.283); g.stroke();
  }
  if (o.hat === 'beanie') {
    const pts = curve([[-head - 4, cy - 6], [-head, cy - ry - 4], [0, cy - ry - 12], [head, cy - ry - 2], [head + 4, cy - 6], [head + 5, cy + 6], [-head - 5, cy + 6]], 0.5, 6);
    inkFill(g, id + 'ht', pts, { colour: o.hatCol || P.ox, bleed: 1, w: 6 });
    outline(g, id + 'hto', pts, { w: 6, colour: P.ink, boil: b });
    line(g, id + 'hb', [[-head - 5, cy + 2], [head + 5, cy + 2]], { w: 7, colour: P.inkSoft, boil: (b + 1) % 3, taper: 0.9 });
  }
  if (o.hat === 'cap') {
    const pts = curve([[-head - 2, cy - 4], [-head + 2, cy - ry - 6], [0, cy - ry - 12], [head - 2, cy - ry - 4], [head + 2, cy - 4], [head + 2, cy + 8], [-head - 2, cy + 8]], 0.5, 6);
    inkFill(g, id + 'cp', pts, { colour: o.hatCol || P.petrol, bleed: 1, w: 6 });
    outline(g, id + 'cpo', pts, { w: 6, colour: P.ink, boil: b });
    const peak = curve([[-head + 6, cy + 6], [-head - 34, cy + 12], [-head - 30, cy + 22], [-head + 4, cy + 18]], 0.5, 5);
    inkFill(g, id + 'cv', peak, { colour: o.hatCol || P.petrol, bleed: 0, w: 5 });
    outline(g, id + 'cvo', peak, { w: 5, colour: P.ink, boil: (b + 1) % 3 });
  }
  if (o.hat === 'bun') {
    g.beginPath(); g.arc(0, cy - ry - 4, 15, 0, 6.283); g.fillStyle = P.ink; g.fill();
  }
  g.restore();
}

// A crowd, drawn from the back row forward so nearer people hide those behind.
export function crowd(g, n, x, y, w, o = {}) {
  const b = o.boil ?? 0;
  const order = [];
  const r = rng(hash(`cw${n}${w}${o.seed ?? 0}`));
  for (let i = 0; i < n; i++) {
    const depth = i / Math.max(1, n - 1);                  // 0 = back
    order.push({ i, depth, x: x + (i + 0.5) * (w / n) + (r() - 0.5) * (w / n) * 0.5, s: (o.s ?? 1) * (0.62 + depth * 0.5), kind: Math.floor(r() * 9) });
  }
  order.sort((a, c) => a.depth - c.depth);
  for (const p of order) {
    g.save();
    g.globalAlpha = 0.72 + p.depth * 0.28;
    person(g, p.x, y, p.s, { kind: p.kind, boil: (b + p.i) % 3, holding: r() < 0.4 ? 'bag' : r() < 0.7 ? 'phone' : null });
    g.restore();
  }
}

// ---------------------------------------------------------------- the bots' marks

// Three classic symbols for the three "and me!"s: a star, a sun, a moon. Never a corporate logo
// redrawn in this film's style.
export function botBadge(g, x, y, s, kind, o = {}) {
  const b = o.boil ?? 0, col = o.colour || P.petrol;
  const pts = [];
  if (kind === 0) for (let i = 0; i < 10; i++) { const a = -1.571 + i * 0.628, rr = i % 2 ? s * 0.36 : s * 0.9; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
  else if (kind === 1) { for (let i = 0; i < 16; i++) { const a = i * 0.393, rr = i % 2 ? s * 0.52 : s * 0.9; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } }
  else { for (let i = 0; i <= 18; i++) { const a = -1.571 + i * 0.35; pts.push([x + Math.cos(a) * s * 0.9, y + Math.sin(a) * s * 0.9]); } }
  inkFill(g, `bb${x}${y}${kind}`, pts, { colour: col, bleed: 1, w: 5 });
  outline(g, `bbo${x}${y}${kind}`, pts, { w: 5, colour: P.ink, boil: b });
  if (kind === 2) {
    // the moon's crescent, bitten out of it
    g.save();
    g.globalCompositeOperation = 'destination-out';
    g.beginPath(); g.ellipse(x + s * 0.42, y - s * 0.1, s * 0.62, s * 0.66, 0, 0, 6.283); g.fill();
    g.restore();
  }
}