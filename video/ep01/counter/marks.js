// The marks in "The Counter": the things that put words on things.
//
// A rubber stamp is a beautiful object for this film because it asserts without checking. Every
// word in the film arrives through one of these: an impression that bites, a stencil sprayed
// through a plate, a marker gone over by hand, a printed label, or a rubber band and a tag. They
// are the art direction, not decoration on top of a picture.

import { P } from './palette.js';
import { drawText, measure } from './type.js';
import { rng, hash, line, path, inkFill, outline, stipple, hatch, rect, quad, curve, blot } from './kit.js';

// ---------------------------------------------------------------- a stamp impression

// What a rubber stamp leaves: two rules and the letters, all bitten at the edges and unevenly
// inked, sitting at a slight angle because nobody aligns a stamp by hand.
export function impression(g, text, cx, cy, size, o = {}) {
  const colour = o.colour || P.ox;
  // The box is derived from the type: cap height plus the rule's margin. Sizing the box first and
  // the type second is what puts a double rule straight through the middle of a word.
  const textW = measure(text, size, o.tracking ?? 0.075);
  const pad = size * 0.42;
  const w = o.w ?? Math.max(textW + pad * 2, size * 1.6);
  const h = o.h ?? size * 1.72;
  const ang = o.ang ?? (((hash(text + (o.seed ?? 0)) % 1000) / 1000 - 0.5) * 0.09);
  g.save();
  g.translate(cx, cy);
  g.rotate(ang);
  const x = -w / 2, y = -h / 2;
  const r = rng(hash(text) + (o.seed ?? 0));
  const rule = 9, inset = size * 0.16;
  outline(g, `imp${hash(text)}${o.seed}`, rect(x, y, w, h, h * 0.1), { w: rule, colour, boil: o.boil, rough: 2.4, over: 1.7 });
  if (w > inset * 6 && h > inset * 6) {
    outline(g, `imp2${hash(text)}${o.seed}`, rect(x + inset, y + inset, w - inset * 2, h - inset * 2, h * 0.08),
      { w: rule * 0.5, colour, boil: (o.boil ?? 0) + 1, rough: 2 });
  }
  // The letters, sitting on the box's own baseline so the rule never crosses them.
  g.save();
  g.globalAlpha = 0.84 + r() * 0.16;
  drawText(g, text, 0, size * 0.36, size, { colour, align: 'center', boil: o.boil, tracking: o.tracking, id: `imp-t${text}` });
  g.restore();
  // Where the stamp was not pressed flat the ink is thin, not absent: a stamp never leaves white.
  g.save();
  g.globalAlpha = 0.34;
  for (let i = 0; i < 3; i++) {
    const px = x + inset + r() * (w - inset * 2), py = y + inset + r() * (h - inset * 2);
    const rad = size * (0.04 + r() * 0.07);
    g.beginPath(); g.ellipse(px, py, rad, rad * 0.5, r() * 3, 0, 6.283);
    g.fillStyle = P.paper; g.fill();
  }
  g.restore();
  g.restore();
}

// The stamp itself, in the hand that swings it: a wooden knob on a block, seen from the side.
export function stampTool(g, x, y, s, o = {}) {
  const ang = o.ang ?? 0, tilt = o.tilt ?? 0.6;
  g.save();
  g.translate(x, y);
  g.rotate(ang);
  const knob = [
    [-30 * s, -150 * s], [26 * s, -158 * s], [34 * s, -104 * s], [22 * s, -96 * s],
    [18 * s, -58 * s], [-18 * s, -58 * s], [-26 * s, -96 * s], [-36 * s, -104 * s],
  ];
  inkFill(g, 'knob' + x, knob, { colour: P.paperDeep, bleed: 2, w: 7 * s });
  outline(g, 'knob' + x, knob, { w: 7 * s, colour: P.ink });
  hatch(g, 'kg' + x, -30 * s, -158 * s, 66 * s, 100 * s, { gap: 11 * s, w: 4 * s, ang: 0.9, colour: P.paperDim, boil: o.boil });
  // The block: the rubber face is the part that prints.
  const blk = [[-96 * s, -58 * s], [96 * s, -58 * s], [104 * s, 14 * s], [-104 * s, 14 * s]];
  inkFill(g, 'blk' + x, blk, { colour: P.oxDeep, bleed: 2, w: 8 * s });
  outline(g, 'blk' + x, blk, { w: 8 * s, colour: P.ink });
  const face = [[-88 * s, 14 * s], [88 * s, 14 * s], [88 * s, 26 * s], [-88 * s, 26 * s]];
  inkFill(g, 'fce' + x, face, { colour: P.ox, bleed: 1, w: 5 * s });
  outline(g, 'fce' + x, face, { w: 5 * s, colour: P.ink });
  for (let i = 0; i < 5; i++) {
    const px = -70 * s + i * 35 * s;
    line(g, `fc${x}${i}`, [[px, 20 * s], [px + 6 * s, 14 * s]], { w: 5 * s, colour: P.oxDeep, boil: o.boil });
  }
  g.restore();
}

// ---------------------------------------------------------------- the other marks

// Letters sprayed through a cut plate: hard edges, overspray, the bridge tabs holding the stencil
// together. Used where the film wants a word that looks made, not written.
export function stencil(g, text, cx, cy, size, o = {}) {
  const colour = o.colour || P.petrol;
  const w = measure(text, size);
  g.save();
  g.translate(cx + (o.jx ?? 0), cy + (o.jy ?? 0));
  g.rotate(o.ang ?? 0);
  const strokes = [];
  // overspray first: the halo of colour around the hole
  g.save();
  g.globalAlpha = 0.3;
  for (let k = 0; k < 3; k++) drawText(g, text, (k - 1) * 5, (k - 1) * 4, size, { colour, align: 'center', boil: o.boil, w: size * 0.16, id: `stn-s${text}${k}` });
  g.restore();
  g.save();
  g.globalAlpha = o.alpha ?? 1;
  const w2 = drawText(g, text, 0, 0, size, { colour, align: 'center', boil: o.boil, id: `stn-${text}` });
  g.restore();
  g.restore();
  return w2;
}

// A marker gone over by hand, with a doubled stroke, because the hand went round twice.
export function marked(g, text, cx, cy, size, o = {}) {
  const colour = o.colour || P.ink;
  const align = o.align || 'left';
  const x = align === 'center' ? cx : align === 'right' ? cx - measure(text, size) : cx;
  g.save();
  g.globalAlpha = 0.5;
  drawText(g, text, x + 3, cy + 4, size, { colour, align, boil: (o.boil ?? 0) + 1, w: size * 0.135, id: `mk2-${text}` });
  g.globalAlpha = 1;
  drawText(g, text, x, cy, size, { colour, align, boil: o.boil, w: size * 0.13, id: `mk-${text}` });
  g.restore();
}

// A printed label: type from a machine, off-register, on a stuck-on rectangle.
export function label(g, text, x, y, size, o = {}) {
  const w = o.w ?? measure(text, size) + size * 0.7, h = o.h ?? size * 1.5;
  const ang = o.ang ?? 0;
  g.save();
  g.translate(x + w / 2, y + h / 2);
  g.rotate(ang);
  inkFill(g, `lb${hash(text)}`, rect(-w / 2, -h / 2, w, h, 4), { colour: o.paper || P.paperLit, bleed: 2, w: 6 });
  g.globalAlpha = 0.55;
  drawText(g, text, 2.5, 3, size, { colour: o.colour || P.ink, align: 'center', boil: o.boil, id: `lb2-${text}` });
  g.globalAlpha = 1;
  drawText(g, text, 0, 0, size, { colour: o.colour || P.ink, align: 'center', boil: o.boil, id: `lb-${text}` });
  outline(g, `lbo${hash(text)}`, rect(-w / 2, -h / 2, w, h, 4), { w: 4, colour: o.edge || P.inkSoft, boil: o.boil, rough: 1.6 });
  g.restore();
}

// A blank customs form: the object the film is about. Returns where its boxes are so a scene can
// write on them.
export function form(g, x, y, w, h, o = {}) {
  const rows = o.rows ?? 5, cols = o.cols ?? 1;
  inkFill(g, `fm${x}`, rect(x, y, w, h, 6), { colour: P.paperLit, bleed: 2, voids: 2, w: 8 });
  outline(g, `fm${x}`, rect(x, y, w, h, 6), { w: 8, colour: P.ink, boil: o.boil });
  outline(g, `fmc${x}`, rect(x + 16, y + 16, w - 32, h - 32, 4), { w: 3.5, colour: P.inkSoft, boil: o.boil });
  drawText(g, o.head || 'FORM 7', x + w / 2, y + 62, o.headSize ?? 40, { colour: P.ink, align: 'center', boil: o.boil, id: `fmh${x}` });
  line(g, `fmr${x}`, [[x + 16, y + 88], [x + w - 16, y + 88]], { w: 4, colour: P.ink, boil: o.boil });
  const top = y + 118, rowH = (h - (top - y) - 24) / rows;
  for (let i = 0; i < rows; i++) {
    const ry = top + i * rowH;
    line(g, `fml${x}${i}`, [[x + 34, ry], [x + w - 34, ry]], { w: 3, colour: P.inkSoft, boil: o.boil, taper: 0.9 });
  }
  return { top, rowH, left: x + 34, right: x + w - 34 };
}

// A rubber band and a tag: something tied on, which is how you show who a thing is for.
export function tag(g, x, y, s, o = {}) {
  const ang = o.ang ?? 0;
  g.save();
  g.translate(x, y);
  g.rotate(ang);
  const pts = [[-30 * s, -20 * s], [34 * s, -26 * s], [40 * s, 22 * s], [-26 * s, 26 * s]];
  inkFill(g, `tg${x}`, pts, { colour: P.paperLit, bleed: 1, w: 5 * s });
  outline(g, `tgo${x}`, pts, { w: 4 * s, colour: P.ink, boil: o.boil });
  g.beginPath(); g.ellipse(6 * s, -24 * s, 7 * s, 7 * s, 0, 0, 6.283); g.fillStyle = P.paper; g.fill();
  g.beginPath(); g.ellipse(6 * s, -24 * s, 7 * s, 7 * s, 0, 0, 6.283); g.strokeStyle = P.ink; g.lineWidth = 3.5 * s; g.stroke();
  if (o.text) drawText(g, o.text, 4 * s, 12 * s, 22 * s, { colour: P.ink, align: 'center', boil: o.boil, id: `tg${x}` });
  g.restore();
}

// A cross, ruled out by hand. The film's most-used gesture: something marked without checking it.
export function crossed(g, id, x, y, w, h, o = {}) {
  const colour = o.colour || P.ox;
  line(g, `cx1${id}`, [[x - w * 0.06, y + h * 0.1], [x + w * 1.04, y + h * 0.86]], { w: o.w ?? 11, colour, boil: o.boil, rough: 1.3 });
  line(g, `cx2${id}`, [[x + w * 1.02, y + h * 0.08], [x - w * 0.05, y + h * 0.88]], { w: o.w ?? 11, colour, boil: (o.boil ?? 0) + 1, rough: 1.3 });
}

// A tick in a box: a thing checked off, which is the good version of a stamp.
export function ticked(g, x, y, s, o = {}) {
  const colour = o.colour || P.ink;
  line(g, `tk${x}${y}`, [[x, y + s * 0.5], [x + s * 0.36, y + s * 0.86], [x + s * 1.02, y]], { w: o.w ?? s * 0.2, colour, boil: o.boil, rough: 0.9 });
}

// Tollens's mark: three dots at the corners of an equilateral triangle.
export function tollensMark(g, x, y, s, o = {}) {
  const colour = o.colour || P.ink;
  const pts = [[x, y - s * 0.58], [x - s * 0.5, y + s * 0.29], [x + s * 0.5, y + s * 0.29]];
  g.fillStyle = colour;
  for (const [px, py] of pts) { g.beginPath(); g.arc(px, py, s * 0.17, 0, 6.283); g.fill(); }
}