// The lettering: every sung word is set in Noto Serif Display, cut to condensed Black for the
// shouts and italic for the echoes, and moves as an instrument in the band. A word finishes
// arriving on its sung onset, so its entrance starts a fraction of a beat before (Qing,
// 2026-09-28: "you want it to ideally finish or be almost finished appearing by the time it's
// sung"), then it keeps playing: it chugs with the palm-muted verses, kicks with the kick drum,
// flashes with the strobe and shatters with the glass.
//
// The audit hook (window.__typo) records every string drawn, in the same form as the episode 1
// and episode 2 v1 renderers, so tools/typo-audit.mjs and typo-report.py judge it the same way.
import { C, clamp, lerp, easeOut, easeIn, backOut, hash, noise, twos } from './kit.js';

const F = 'video/ep02/mirror/fonts/';
export const fonts = [
  ['NSD-BlackX', F + 'NotoSerifDisplay-BlackXCond.ttf'],
  ['NSD-BlackC', F + 'NotoSerifDisplay-BlackCond.ttf'],
  ['NSD-XBold', F + 'NotoSerifDisplay-XBoldSemi.ttf'],
  ['NSD-Semi', F + 'NotoSerifDisplay-SemiCond.ttf'],
  ['NSD-Med', F + 'NotoSerifDisplay-MediumSemi.ttf'],
  ['NSD-Ital', F + 'NotoSerifDisplay-SemiCondItalic.ttf'],
  ['NSD-XItal', F + 'NotoSerifDisplay-XBoldCondItalic.ttf'],
  ['Grenze', F + 'GrenzeGotisch-800.ttf'],
  ['CourierB', F + 'CourierPrime-Bold.ttf'],
  ['CourierR', F + 'CourierPrime-Regular.ttf'],
  ['Dafoe', F + 'MrDafoe-Regular.ttf'],
  ['Grace', F + 'CoveredByYourGrace.ttf'],
  ['ShipporiJP', F + 'ShipporiMinchoB1-ExtraBold-subset.ttf'],
];
export const FACE = {
  black: 'NSD-BlackX', blackc: 'NSD-BlackC', xbold: 'NSD-XBold', semi: 'NSD-Semi', med: 'NSD-Med',
  ital: 'NSD-Ital', xital: 'NSD-XItal', goth: 'Grenze', mono: 'CourierB', monor: 'CourierR',
  lip: 'Dafoe', hand: 'Grace', jp: 'ShipporiJP',
};

// ---------------------------------------------------------------- the audit
export const AUDIT = { on: false, recs: [], ctx: null };
if (typeof window !== 'undefined') window.__typo = AUDIT;
const lin = c => { c /= 255; return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); };
const lumOf = (r, g, b) => .2126 * lin(r) + .7152 * lin(g) + .0722 * lin(b);
function colLum(col) {
  if (typeof col !== 'string') return null;
  let m = col.match(/^#([0-9a-f]{6})$/i);
  if (m) { const v = parseInt(m[1], 16); return lumOf(v >> 16 & 255, v >> 8 & 255, v & 255); }
  m = col.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/);
  return m ? lumOf(+m[1], +m[2], +m[3]) : null;
}
const CAP = {};
function capRatio(g, face) {
  if (CAP[face] === undefined) {
    g.save(); g.font = `100px "${FACE[face] || face}"`;
    CAP[face] = (g.measureText('H').actualBoundingBoxAscent || 70) / 100;
    g.restore();
  }
  return CAP[face];
}
function auditText(g, str, tw, size, face, o) {
  const m = g.getTransform();
  const asc = size * .95, desc = size * .28, pad = size * .08;
  const pts = [[-pad, -asc], [tw + pad, -asc], [tw + pad, desc], [-pad, desc]]
    .map(([px, py]) => [m.a * px + m.c * py + m.e, m.b * px + m.d * py + m.f]);
  const cw = g.canvas.width, chh = g.canvas.height, k = cw / 1080;
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const x0 = Math.max(0, Math.floor(Math.min(...xs))), x1 = Math.min(cw, Math.ceil(Math.max(...xs)));
  const y0 = Math.max(0, Math.floor(Math.min(...ys))), y1 = Math.min(chh, Math.ceil(Math.max(...ys)));
  const full = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)].map(v => v / k);
  const sc = Math.sqrt(Math.abs(m.a * m.d - m.b * m.c));
  const rec = {
    str, cap: size * capRatio(g, face) * sc / k, rot: Math.atan2(m.b, m.a), base: [m.e / k, m.f / k],
    strokeW: size * .09 * sc, alpha: g.globalAlpha, prog: o.prog ?? 1,
    textL: [o.fill, ...(o.cols || [])].map(colLum).filter(v => v !== null),
    shade: !!o.shadow, outline: !!o.stroke, ctx: o.ctx ?? AUDIT.ctx, main: g.canvas.id === 'c', box: full,
    offscreen: full[0] < -2 || full[1] < -2 || full[2] > 1082 || full[3] > 1922,
  };
  if (x1 - x0 > 2 && y1 - y0 > 2) {
    const d = g.getImageData(x0, y0, x1 - x0, y1 - y0).data;
    let s = 0, s2 = 0, n = 0;
    for (let i = 0; i < d.length; i += 12) { const l = lumOf(d[i], d[i + 1], d[i + 2]); s += l; s2 += l * l; n++; }
    rec.bgL = s / n; rec.bgStd = Math.sqrt(Math.max(0, s2 / n - rec.bgL * rec.bgL));
    rec._dev = [x0, y0, x1 - x0, y1 - y0];
  }
  AUDIT.recs.push(rec);
  return rec;
}
function auditMask(g, rec, draw) {
  if (!rec?._dev) return;
  const [x0, y0, w0, h0] = rec._dev;
  const mc = document.createElement('canvas'); mc.width = w0; mc.height = h0;
  const mx = mc.getContext('2d');
  const m = g.getTransform();
  mx.setTransform(m.a, m.b, m.c, m.d, m.e - x0, m.f - y0);
  mx.font = g.font; mx.fillStyle = '#fff'; mx.textBaseline = g.textBaseline;
  draw(mx);
  const md = mx.getImageData(0, 0, w0, h0).data, mask = new Uint8Array(w0 * h0);
  for (let i = 0; i < mask.length; i++) mask[i] = md[i * 4 + 3];
  rec._mask = mask;
}
// Record lettering drawn some other way, or mark a group, without drawing.
export function auditNote(g, str, x, y, size, face, o = {}) {
  if (!AUDIT.on) return;
  g.save(); g.translate(x, y);
  g.font = `${size}px "${FACE[face] || face}"`;
  const rec = auditText(g, str, g.measureText(str).width, size, face, o);
  rec.note = true; delete rec._dev;
  g.restore();
}

// ---------------------------------------------------------------- setting type
export function font(g, size, face) { g.font = `${size}px "${FACE[face] || face}"`; }
const MW = new Map();
export function measure(g, str, size, face, track = 0) {
  const key = `${face}|${size}|${track}|${str}`;
  let v = MW.get(key);
  if (v === undefined) {
    g.save(); font(g, size, face);
    v = g.measureText(str).width + track * Math.max(0, [...str].length - 1);
    g.restore();
    if (MW.size > 20000) MW.clear();
    MW.set(key, v);
  }
  return v;
}
// The size at which a row of text fits a width.
export function fitSize(g, str, face, maxW, maxSize, track = 0) {
  const w = measure(g, str, 100, face, track * 100 / maxSize);
  return Math.min(maxSize, 100 * maxW / w);
}

// Draw a string with its baseline at (x, y). The string is drawn from its left edge; use align
// to anchor. Options:
//   fill, alpha, stroke {w, col} (outline under the fill), shadow {dx, dy, col} (hard),
//   sx (extra horizontal squeeze), skew, rot, track (letter spacing in px),
//   letter(i, ch) -> {dx, dy, rot, s, alpha} per-letter motion,
//   reflect {gap, alpha, len}: a flipped copy below, fading, as in a lacquered floor,
//   ctx: the audit's name for it ({line, word} for a sung word, {deco: true} for picture text).
export function text(g, str, x, y, size, face, o = {}) {
  if (!str) return 0;
  const f = FACE[face] || face;
  const track = o.track || 0;
  font(g, size, face);
  const chars = [...str];
  const letterW = chars.map(ch => g.measureText(ch).width);
  const tw = (o.letter || track) ? letterW.reduce((a, b) => a + b, 0) + track * (chars.length - 1) : g.measureText(str).width;
  const ax = o.align === 'center' ? -tw / 2 : o.align === 'right' ? -tw : 0;
  g.save();
  g.translate(x, y);
  if (o.rot) g.rotate(o.rot);
  if (o.skew) g.transform(1, 0, o.skew, 1, 0, 0);
  if (o.sx) g.scale(o.sx, o.sy || 1);
  g.translate(ax, 0);
  g.textBaseline = 'alphabetic';
  if (o.alpha !== undefined) g.globalAlpha *= clamp(o.alpha);
  g.font = `${size}px "${f}"`;
  const rec = AUDIT.on && !o.noAudit ? auditText(g, str, tw, size, face, o) : null;
  const paint = (ctx, mode) => {
    if (o.letter || track) {
      let cx = 0;
      chars.forEach((ch, i) => {
        const L = o.letter ? o.letter(i, ch, cx, tw) : null;
        ctx.save();
        ctx.translate(cx + (L?.dx || 0), L?.dy || 0);
        if (L?.rot) ctx.rotate(L.rot);
        if (L?.s && L.s !== 1) { ctx.translate(letterW[i] / 2, -size * .35); ctx.scale(L.s, L.s); ctx.translate(-letterW[i] / 2, size * .35); }
        if (L?.alpha !== undefined) ctx.globalAlpha *= clamp(L.alpha);
        mode(ctx, ch);
        ctx.restore();
        cx += letterW[i] + track;
      });
    } else mode(ctx, str);
  };
  if (o.shadow) {
    g.save(); g.translate(o.shadow.dx, o.shadow.dy); g.fillStyle = o.shadow.col;
    if (o.stroke) { g.lineJoin = 'miter'; g.miterLimit = 3; g.lineWidth = o.stroke.w * 2; g.strokeStyle = o.shadow.col; paint(g, (c, s) => c.strokeText(s, 0, 0)); }
    paint(g, (c, s) => c.fillText(s, 0, 0));
    g.restore();
  }
  if (o.stroke) {
    g.lineJoin = o.stroke.join || 'miter'; g.miterLimit = 3;
    g.lineWidth = o.stroke.w * 2; g.strokeStyle = o.stroke.col;
    paint(g, (c, s) => c.strokeText(s, 0, 0));
  }
  if (o.fill !== null) {
    g.fillStyle = o.fill || C.bone;
    paint(g, (c, s) => c.fillText(s, 0, 0));
  }
  if (o.hollow) {
    g.lineJoin = 'miter'; g.miterLimit = 3; g.lineWidth = o.hollow.w; g.strokeStyle = o.hollow.col;
    paint(g, (c, s) => c.strokeText(s, 0, 0));
  }
  if (rec) auditMask(g, rec, mx => paint(mx, (c, s) => {
    if (o.fill === null && o.hollow) { c.lineWidth = o.hollow.w; c.strokeStyle = '#fff'; c.strokeText(s, 0, 0); } else c.fillText(s, 0, 0);
  }));
  if (o.reflect) {
    const R = o.reflect;
    g.save();
    g.translate(0, (R.gap ?? size * .08) * 2);
    g.scale(1, -1);
    g.globalAlpha *= R.alpha ?? .22;
    g.fillStyle = R.col || o.fill || C.bone;
    // Fade the reflection out with a stack of clipped bands (no gradients on type: flat steps).
    const bands = 4, len = (R.len ?? .8) * size;
    for (let b = 0; b < bands; b++) {
      g.save();
      g.beginPath(); g.rect(-50, -b * len / bands, tw + 100, -len / bands); g.clip();
      g.globalAlpha *= 1 - b / bands;
      paint(g, (c, s) => c.fillText(s, 0, 0));
      g.restore();
    }
    g.restore();
  }
  g.restore();
  return tw * (o.sx || 1);
}

// ---------------------------------------------------------------- word motion
// How far a word has arrived at time t, for an entrance that lands on its onset s: 0 before
// s - lead, 1 from s on.
export const arrive = (t, s, lead = .12) => clamp((t - (s - lead)) / lead);

// Entrance styles: each maps arrival p (0..1) to a pose { alpha, s (scale), dx, dy, rot, sx }.
export const ENTER = {
  // Slams down from big: the loud words.
  slam: p => ({ alpha: clamp(p * 3), s: lerp(1.9, 1, easeIn(p, 2)), dx: 0, dy: 0, rot: 0 }),
  // Cuts straight in, a frame before the onset: the fast words.
  cut: p => ({ alpha: p > .7 ? 1 : 0, s: 1, dx: 0, dy: 0, rot: 0 }),
  // Drops from above and bites: verse words.
  drop: p => ({ alpha: clamp(p * 2.5), s: 1, dx: 0, dy: -.32 * (1 - easeIn(p, 2)), rot: 0, rel: true }),
  // Whips in from the side, stretched: a smear frame, as anime does for speed.
  whipL: p => ({ alpha: clamp(p * 3), s: 1, dx: -220 * (1 - easeIn(p, 2)), sx: lerp(2.2, 1, easeIn(p, 2)), dy: 0, rot: 0 }),
  whipR: p => ({ alpha: clamp(p * 3), s: 1, dx: 220 * (1 - easeIn(p, 2)), sx: lerp(2.2, 1, easeIn(p, 2)), dy: 0, rot: 0 }),
  // Rises out of the glass like breath on a mirror: the soft words.
  fog: p => ({ alpha: easeOut(p, 2), s: lerp(1.08, 1, p), dx: 0, dy: 10 * (1 - p), rot: 0 }),
  // Flips over like a card turning in a mirror: the echoes.
  flip: p => ({ alpha: clamp(p * 2), s: 1, sx: Math.max(.04, Math.abs(Math.cos((1 - p) * Math.PI / 2 * 1.0))), dx: 0, dy: 0, rot: 0 }),
  // Stamped: in at once, a size too big, and pressed down onto the onset. The chugging verses.
  stamp: p => ({ alpha: p > .15 ? 1 : 0, s: lerp(1.28, 1, easeOut(p, 2)), dx: 0, dy: 0, rot: 0 }),
  // Pops with a little overshoot: small words and labels.
  pop: p => ({ alpha: clamp(p * 3), s: p < 1 ? backOut(p, 2.4) * .95 + .05 : 1, dx: 0, dy: 0, rot: 0 }),
};

// The shake a loud onset gives, decaying after it.
export function kickback(t, s, amp = 10, decay = .09) {
  if (t < s) return { dx: 0, dy: 0 };
  const e = Math.exp(-(t - s) / decay);
  return { dx: noise((t - s) * 60, s * 7) * amp * e, dy: noise((t - s) * 60, s * 13) * amp * e };
}

// Split sung words into rows that fit a width, returning [[word...]...].
export function wrapWords(g, words, size, face, maxW, spaceK = .26) {
  const rows = [[]];
  let x = 0;
  for (const w of words) {
    const ww = measure(g, w.w, size, face);
    if (x + ww > maxW && rows[rows.length - 1].length) { rows.push([]); x = 0; }
    rows[rows.length - 1].push(w);
    x += ww + size * spaceK;
  }
  return rows;
}

// Display text for a sung word: capitals, and the brackets of backing lines dropped (the echo's
// style says it's an echo).
export const shout = w => w.replace(/[()]/g, '').toUpperCase();
export const quiet = w => w.replace(/[()]/g, '');
