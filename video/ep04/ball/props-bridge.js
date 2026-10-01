// The bridge's props: the fresh bots, a browser window, the playbook, a signpost, the balance scale
// of an oracle, the chat and shop screens, the restart lever, newspapers and a candlestick telephone.
import { TAU, clamp, lerp, now, hash, noise, easeOut, backOut } from './kit.js';
import { INK, WHITE, CREAM, CORAL, TEAL, TEAL_SH, OCHRE, ROSE, ROSE_SH, PLUM, GOLD, GREEN, RED, WOOD, WOOD_SH, GREY, SLATE, MINT, PEACH, SKY, BROWN, C } from './palette.js';
import { shape, line, stroke, rrect, ellipse, spline, xf, dot, paint, pieEye, glove, hose } from './ink.js';
import { label, word, DISPLAY, PATTER, SCRIPT, fitSize } from './type.js';
import { blinkAt, groove, mouth } from './rig.js';

// A fresh bot: small, shiny, with its NEW tag. kind 0 mint dome, 1 peach box, 2 sky bell.
export const FRESH = [['#9fd6c0', '#6aa894'], ['#f2b48b', '#c98460'], ['#9cc3df', '#6d97b6']];
export function freshBot(g, x, y, s, kind, o = {}) {
  const t = o.t ?? now(), gr = groove(t, o.dance ?? .8, kind * .3);
  const [col, sh] = FRESH[kind];
  const cy = y - 60 * s - 80 * s + gr.bob * s - (o.jump ?? 0) * 60 * s;
  // legs
  for (const d of [-1, 1]) { hose(g, [x + d * 30 * s, cy + 60 * s], [x + d * 38 * s, y - 14 * s], { w: 10 * s, bend: .05, seed: 9000 + kind * 10 + d }); shape(g, ellipse(x + d * 44 * s, y - 10 * s, 20 * s, 11 * s), { fill: INK, w: 3 * s, seed: 9003 + kind * 10 + d }); }
  const P = kind === 0 ? spline([[x - 70 * s, cy + 70 * s], [x - 74 * s, cy - 20 * s], [x - 40 * s, cy - 78 * s], [x + 40 * s, cy - 78 * s], [x + 74 * s, cy - 20 * s], [x + 70 * s, cy + 70 * s]], true, 5)
    : kind === 1 ? rrect(x - 72 * s, cy - 76 * s, 144 * s, 146 * s, 22 * s)
      : spline([[x - 82 * s, cy + 70 * s], [x - 50 * s, cy - 10 * s], [x - 30 * s, cy - 80 * s], [x + 30 * s, cy - 80 * s], [x + 50 * s, cy - 10 * s], [x + 82 * s, cy + 70 * s]], true, 5);
  // antenna
  stroke(g, [[x, cy - 76 * s], [x + 6 * s, cy - 118 * s]], { w: 5 * s, seed: 9010 + kind });
  shape(g, ellipse(x + 6 * s, cy - 124 * s, 10 * s, 10 * s), { fill: o.light ? GOLD : CREAM, w: 3 * s, seed: 9011 + kind });
  shape(g, P, { fill: col, shade: sh, shadeOff: [-8 * s, -8 * s], w: 6 * s, seed: 9012 + kind, gloss: { x: .25, y: .18, w: .1, h: .07 } });
  // porthole face
  shape(g, ellipse(x, cy - 10 * s, 50 * s, 42 * s), { fill: '#fbf6e8', w: 5 * s, seed: 9013 + kind });
  const e = o.eyes || {}, bl = blinkAt(t, 90 + kind);
  for (const d of [-1, 1]) {
    if (e.expr === 'happy') { stroke(g, [[x + d * 18 * s - 9 * s, cy - 10 * s], [x + d * 18 * s, cy - 18 * s], [x + d * 18 * s + 9 * s, cy - 10 * s]], { w: 4 * s, seed: 9014 + d }); continue; }
    pieEye(g, x + d * 18 * s, cy - 14 * s, 7 * s, 11 * s, { white: e.expr === 'wide' ? 1.8 : 0, lx: e.lx ?? 0, ly: e.ly ?? 0, blink: bl, lw: 2.5 * s, seed: 9015 + d });
  }
  if (o.sing) mouth(g, x, cy + 12 * s, 24 * s, typeof o.sing === 'number' ? o.sing : .5, { lw: 3 * s });
  else stroke(g, [[x - 10 * s, cy + 12 * s], [x, cy + 17 * s], [x + 10 * s, cy + 12 * s]], { w: 3.5 * s, seed: 9017 });
  // the NEW tag on a string
  if (o.tag !== false) { stroke(g, [[x + 40 * s, cy + 20 * s], [x + 70 * s, cy + 40 * s]], { w: 2.5 * s, seed: 9018 }); g.save(); g.translate(x + 80 * s, cy + 50 * s); g.rotate(.3); shape(g, rrect(-24 * s, -14 * s, 48 * s, 28 * s, 4 * s), { fill: GOLD, w: 3 * s, seed: 9019 }); label(g, 'NEW', 0, 1 * s, 17 * s, { font: PATTER }); g.restore(); }
  // arms
  const hands = {};
  for (const [k, d] of [['L', -1], ['R', 1]]) {
    const NAMED = { hips: { to: [.25, .45], pose: 'fist' }, up: { to: [.4, -1.0], pose: 'wave' }, out: { to: [1, -.1], pose: 'open' } };
    const sp = typeof o[k] === 'string' ? NAMED[o[k]] : (o[k] || { to: [.5, .7], pose: 'open' });
    const sx = x + d * 70 * s, sy = cy + 10 * s, hx = sx + d * sp.to[0] * 100 * s, hy = sy + sp.to[1] * 100 * s;
    hose(g, [sx, sy], [hx, hy], { w: 9 * s, bend: d * -.2, seed: 9020 + d });
    glove(g, hx, hy, sp.ang ?? Math.atan2(hy - sy, hx - sx), 15 * s, sp.pose || 'open', { flip: d < 0, seed: 9022 + d });
    if (o.hold && o.hold[k]) o.hold[k](g, hx, hy, s);
    hands[k] = [hx, hy];
  }
  return { hands, cy, top: cy - 130 * s };
}

// A browser window: frame, tabs, an address bar; `draw` fills the page area.
export function browser(g, x, y, w, h, title, draw, o = {}) {
  shape(g, rrect(x - w / 2, y - h / 2, w, h, 18), { fill: o.frame || '#d9d2c2', w: 7, seed: 9100 + (o.seed || 0) });
  // tab and buttons
  shape(g, rrect(x - w / 2 + 70, y - h / 2 + 10, Math.min(260, w * .45), 40, 10), { fill: '#f7f1e2', w: 4, seed: 9101 + (o.seed || 0) });
  label(g, title, x - w / 2 + 70 + Math.min(260, w * .45) / 2, y - h / 2 + 31, fitSize(g, title, PATTER, 26, Math.min(240, w * .42)), { font: PATTER });
  for (let i = 0; i < 3; i++) dot(g, x - w / 2 + 22 + i * 16, y - h / 2 + 30, 6, [RED, GOLD, GREEN][i]);
  shape(g, rrect(x - w / 2 + 16, y - h / 2 + 58, w - 32, 36, 18), { fill: WHITE, w: 3.5, seed: 9102 + (o.seed || 0) });
  if (o.url) label(g, o.url, x - w / 2 + 36, y - h / 2 + 77, 22, { font: PATTER, col: GREY, align: 'left' });
  const px = x - w / 2 + 16, py = y - h / 2 + 104, pw = w - 32, ph = h - 120;
  shape(g, rrect(px, py, pw, ph, 8), { fill: o.page || '#fbf6e8', w: 4, seed: 9103 + (o.seed || 0) });
  if (draw) { g.save(); g.beginPath(); g.rect(px, py, pw, ph); g.clip(); draw(g, px, py, pw, ph); g.restore(); }
  return { px, py, pw, ph };
}
// A chat bubble inside a page.
export function chatBubble(g, x, y, text, who, col, right = false) {
  const size = 44, w = Math.max(200, text.length * size * .5 + 50);
  const bx = right ? x - w : x;
  shape(g, rrect(bx, y - 42, w, 84, 30), { fill: col, w: 4, seed: 9110 + y });
  label(g, text, bx + w / 2, y + 2, size, { font: PATTER });
  label(g, who, right ? x - w - 12 : x + w + 12, y + 2, 26, { font: PATTER, col: GREY, align: right ? 'right' : 'left' });
}
// The playbook: a red book with its title.
export function playbook(g, x, y, s, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot);
  shape(g, rrect(-60 * s, -80 * s, 120 * s, 160 * s, 8 * s), { fill: RED, shade: '#9a2319', shadeOff: [-6 * s, -6 * s], w: 5 * s, seed: 9120 });
  shape(g, rrect(-48 * s, -60 * s, 96 * s, 50 * s, 4 * s), { fill: CREAM, w: 3 * s, seed: 9121 });
  label(g, 'PLAY', 0, -45 * s, 22 * s, { font: PATTER }); label(g, 'BOOK', 0, -24 * s, 22 * s, { font: PATTER });
  g.restore();
}
// A small browser as a prop, held.
export function miniBrowser(g, x, y, s, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  browser(g, 0, 0, 200, 150, 'WEB', null, { seed: 7 });
  g.restore();
}
// A signpost with arrow boards.
export function signpost(g, x, y, s, boards, t = now()) {
  stroke(g, [[x, y], [x, y - 360 * s]], { w: 18 * s, color: WOOD_SH, seed: 9130, taper: false });
  boards.forEach(([text, dir, col, p], i) => {
    if (!p) return;
    const by = y - 320 * s + i * 90 * s, w = 280 * s;
    g.save(); g.translate(x, by); g.scale(p, p); g.rotate(dir * .04 + Math.sin(t * 3 + i) * .02);
    const P = dir > 0 ? [[-20 * s, -32 * s], [w - 40 * s, -32 * s], [w, 0], [w - 40 * s, 32 * s], [-20 * s, 32 * s]] : [[20 * s, -32 * s], [-w + 40 * s, -32 * s], [-w, 0], [-w + 40 * s, 32 * s], [20 * s, 32 * s]];
    shape(g, P, { fill: col || CREAM, w: 5 * s, seed: 9131 + i });
    label(g, text, dir * (w / 2 - 10 * s), 2 * s, fitSize(g, text, PATTER, 34 * s, w - 60 * s), { font: PATTER });
    g.restore();
  });
}
// A balance scale on (x, y): tilt -1..1 (positive: right pan down).
export function scale(g, x, y, s, tilt, left, right) {
  shape(g, [[x - 110 * s, y], [x + 110 * s, y], [x + 40 * s, y - 40 * s], [x - 40 * s, y - 40 * s]], { fill: GOLD, w: 6 * s, seed: 9140 });
  stroke(g, [[x, y - 40 * s], [x, y - 420 * s]], { w: 16 * s, color: GOLD, seed: 9141, taper: false });
  line(g, [[x - 8 * s, y - 40 * s], [x - 8 * s, y - 420 * s]], { w: 3 * s, seed: 9142 });
  const a = tilt * .28, bx = Math.cos(a) * 280 * s, byy = Math.sin(a) * 280 * s, top = y - 420 * s;
  stroke(g, [[x - bx, top - byy], [x + bx, top + byy]], { w: 14 * s, color: GOLD, seed: 9143, taper: false });
  shape(g, ellipse(x, top, 20 * s, 20 * s), { fill: GOLD, w: 5 * s, seed: 9144 });
  for (const [d, draw] of [[-1, left], [1, right]]) {
    const px = x + d * bx, py = top + d * byy, pany = py + 190 * s;
    stroke(g, [[px, py], [px - 90 * s, pany]], { w: 3.5 * s, seed: 9145 + d }); stroke(g, [[px, py], [px + 90 * s, pany]], { w: 3.5 * s, seed: 9147 + d });
    if (draw) draw(g, px, pany);
    shape(g, spline([[px - 120 * s, pany], [px + 120 * s, pany], [px + 80 * s, pany + 34 * s], [px - 80 * s, pany + 34 * s]], true, 4), { fill: GOLD, w: 5 * s, seed: 9149 + d });
  }
}
// A lever on a box: `p` 0 up, 1 pulled down.
export function lever(g, x, y, s, p, text = 'RESTART') {
  shape(g, rrect(x - 110 * s, y - 120 * s, 220 * s, 120 * s, 12 * s), { fill: SLATE, w: 6 * s, seed: 9160 });
  label(g, text, x, y - 60 * s, 36 * s, { font: PATTER, col: GOLD });
  const a = lerp(-2.1, -.7, p), L = 200 * s;
  stroke(g, [[x + 80 * s, y - 100 * s], [x + 80 * s + Math.cos(a) * L, y - 100 * s + Math.sin(a) * L]], { w: 14 * s, seed: 9161, taper: false });
  shape(g, ellipse(x + 80 * s + Math.cos(a) * L, y - 100 * s + Math.sin(a) * L, 26 * s, 26 * s), { fill: RED, w: 5 * s, seed: 9162 });
  return [x + 80 * s + Math.cos(a) * L, y - 100 * s + Math.sin(a) * L];
}
// A newspaper held open with its headline.
export function newspaper(g, x, y, s, head, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot);
  shape(g, rrect(-130 * s, -170 * s, 260 * s, 340 * s, 4 * s), { fill: '#f3ecd9', w: 5 * s, seed: 9170 + head.length });
  label(g, 'THE DAILY FINDING', 0, -140 * s, 22 * s, { font: DISPLAY });
  stroke(g, [[-110 * s, -118 * s], [110 * s, -118 * s]], { w: 3 * s, seed: 9171, taper: false });
  label(g, 'EXTRA!', 0, -85 * s, 34 * s, { font: PATTER, col: RED });
  const words = head.split(' '); let yy = -34 * s;
  for (const w of words) { label(g, w, 0, yy, fitSize(g, w, DISPLAY, 50 * s, 220 * s), { font: DISPLAY }); yy += 54 * s; }
  for (let i = 0; i < 4; i++) stroke(g, [[-110 * s, yy + i * 18 * s], [110 * s, yy + i * 18 * s]], { w: 3 * s, color: GREY, seed: 9172 + i, taper: false });
  g.restore();
}
// A candlestick telephone; the receiver is drawn by whoever holds it (see receiver()).
export function candlestick(g, x, y, s, ring = 0, t = now()) {
  const sh = ring * Math.sin(t * 60) * 5 * s;
  g.save(); g.translate(sh, -ring * Math.abs(Math.sin(t * 30)) * 10 * s);
  shape(g, ellipse(x, y - 14 * s, 90 * s, 22 * s), { fill: INK, w: 5 * s, seed: 9180 });
  stroke(g, [[x, y - 20 * s], [x, y - 300 * s]], { w: 26 * s, seed: 9181, taper: false });
  shape(g, spline([[x - 44 * s, y - 330 * s], [x + 44 * s, y - 330 * s], [x + 30 * s, y - 290 * s], [x - 30 * s, y - 290 * s]], true, 4), { fill: INK, w: 4 * s, seed: 9182, gloss: { col: '#6d6a74', x: .3, y: .3 } });
  g.restore();
}
export function receiver(g, x, y, s, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot);
  stroke(g, [[0, -70 * s], [0, 70 * s]], { w: 22 * s, seed: 9190, taper: false });
  shape(g, ellipse(0, -80 * s, 30 * s, 22 * s), { fill: INK, w: 4 * s, seed: 9191 });
  g.restore();
}
