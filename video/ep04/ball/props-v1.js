// Verse 1's props: the app (a cash register with eyes), the paste pot, the camera, the photographs,
// the comma, the alarm bell, the score thermometer, the hoop, the school desk, the stamping press.
import { TAU, clamp, lerp, now, hash, noise, easeOut, backOut } from './kit.js';
import { INK, WHITE, CREAM, CARD, CORAL, TEAL, TEAL_SH, OCHRE, OCHRE_SH, GOLD, RED, RED_SH, GREEN, GREEN_SH, BROWN, WOOD, WOOD_SH, GREY, SLATE, ROSE, PLUM, MINT, C } from './palette.js';
import { shape, line, stroke, rrect, ellipse, spline, xf, dot, paint, pieEye } from './ink.js';
import { label, word, DISPLAY, PATTER, SCRIPT, fitSize } from './type.js';
import { blinkAt, pops } from './rig.js';

// The app: a cash register on (x, y) (its base), s = 1 about 420 wide. It shows `shows` on its
// pop-up display, rings when `ring` (0..1 decaying) and looks toward (lx, ly).
export function register(g, x, y, s = 1, o = {}) {
  const t = o.t ?? now(), ring = o.ring ?? 0, shake = ring * Math.sin(t * 60) * 4 * s;
  g.save(); g.translate(shake, -ring * 8 * s);
  const w = 420 * s, h = 300 * s, top = y - h;
  // cash drawer and base
  shape(g, rrect(x - w * .55, y - 70 * s, w * 1.1, 70 * s, 10 * s), { fill: WOOD, shade: WOOD_SH, shadeOff: [-6 * s, -6 * s], w: 7 * s, seed: 801 });
  shape(g, ellipse(x, y - 35 * s, 20 * s, 10 * s), { fill: GOLD, w: 4 * s, seed: 802 });
  // body: a tall brass-and-teal cabinet, sloping keyboard
  const body = spline([[x - w * .46, y - 70 * s], [x - w * .44, top + 90 * s], [x - w * .32, top + 40 * s], [x + w * .32, top + 40 * s], [x + w * .44, top + 90 * s], [x + w * .46, y - 70 * s]], true, 5);
  shape(g, body, { fill: o.col || TEAL, shade: TEAL_SH, shadeOff: [-12 * s, -12 * s], w: 8 * s, seed: 803, gloss: { x: .2, y: .2, w: .05, h: .08 } });
  // scroll ornaments
  for (const d of [-1, 1]) stroke(g, [[x + d * w * .38, top + 120 * s], [x + d * w * .3, top + 150 * s], [x + d * w * .36, top + 180 * s], [x + d * w * .28, top + 200 * s]], { w: 4 * s, seed: 804 + d, color: GOLD });
  // keys: three rows of round keys
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
    const kx = x - w * .3 + c * w * .12, ky = top + 175 * s + r * 36 * s;
    const pressed = o.pressKey === r * 6 + c ? 5 * s : 0;
    shape(g, ellipse(kx, ky + pressed, 17 * s, 14 * s), { fill: CREAM, w: 4 * s, seed: 810 + r * 6 + c, amt: .3 });
    if (o.keyLabels) label(g, o.keyLabels[r * 6 + c] || '', kx, ky + pressed + 1 * s, 16 * s, { font: PATTER });
  }
  // crank on the side
  const ca = (o.crank ?? 0) * TAU;
  stroke(g, [[x + w * .46, top + 170 * s], [x + w * .46 + Math.cos(ca) * 50 * s, top + 170 * s + Math.sin(ca) * 50 * s]], { w: 9 * s, seed: 830, taper: false });
  shape(g, ellipse(x + w * .46 + Math.cos(ca) * 50 * s, top + 170 * s + Math.sin(ca) * 50 * s, 13 * s, 13 * s), { fill: RED, w: 4 * s, seed: 831 });
  // the display: a brass crown with pop-up number flags
  const dw = w * .64, dh = 96 * s, dy = top - 30 * s;
  shape(g, rrect(x - dw / 2, dy, dw, dh, 16 * s), { fill: GOLD, shade: OCHRE_SH, shadeOff: [-6 * s, -6 * s], w: 7 * s, seed: 840 });
  shape(g, rrect(x - dw / 2 + 16 * s, dy + 14 * s, dw - 32 * s, dh - 28 * s, 8 * s), { fill: CREAM, w: 5 * s, seed: 841 });
  if (o.shows != null) {
    const pop = o.pop ?? 1, sz = fitSize(g, o.shows, DISPLAY, 60 * s, dw - 60 * s);
    g.save(); g.beginPath(); g.rect(x - dw / 2 + 16 * s, dy + 14 * s, dw - 32 * s, dh - 28 * s); g.clip();
    label(g, o.shows, x, dy + dh / 2 + (1 - pop) * 60 * s + 3 * s, sz, { font: DISPLAY, col: o.showCol || INK });
    g.restore();
  }
  // a little marquee on top: THE APP
  shape(g, rrect(x - 90 * s, dy - 56 * s, 180 * s, 50 * s, 10 * s), { fill: CORAL, w: 6 * s, seed: 842 });
  label(g, 'THE APP', x, dy - 30 * s, 34 * s, { font: PATTER, col: CREAM });
  // eyes on the cabinet's brow
  if (o.eyes !== false) {
    const bl = blinkAt(t, 55);
    for (const d of [-1, 1]) pieEye(g, x + d * 58 * s, top + 96 * s, 13 * s, 20 * s, { white: 1.7, lx: o.lx ?? 0, ly: o.ly ?? 0, blink: o.shut ? 1 : bl, lw: 4 * s, seed: 850 + d });
    if (o.smile != null) stroke(g, [[x - 30 * s, top + 132 * s], [x, top + 132 * s + o.smile * 12 * s], [x + 30 * s, top + 132 * s]], { w: 5 * s, seed: 853 });
  }
  // the code tape feeding out of its side (what Clawd snips)
  if (o.tape) o.tape(g, x - w * .46, top + 130 * s, s);
  g.restore();
  return { dispX: x, dispY: dy + dh / 2, top: dy - 56 * s, w };
}

// A strip of paper tape with a formula on it, from (x, y), length L, angle a.
export function tape(g, x, y, L, a, text, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.rotate(a);
  const h = 54 * s, P = [];
  for (let i = 0; i <= 12; i++) P.push([i / 12 * L, Math.sin(i * .9 + (o.wave ?? 0)) * 4 * s]);
  for (let i = 12; i >= 0; i--) P.push([i / 12 * L, h + Math.sin(i * .9 + (o.wave ?? 0)) * 4 * s]);
  shape(g, P, { fill: o.col || WHITE, w: 5 * s, seed: 860 + (o.seed ?? 0), amt: .4 });
  if (o.paste) { g.globalAlpha = .45; paint(g, P, '#e8f0c8', { raw: true, off: 0 }); g.globalAlpha = 1; }
  label(g, text, L / 2, h / 2 + 2 * s, fitSize(g, text, PATTER, 38 * s, L - 20 * s), { font: PATTER, col: o.textCol || INK });
  g.restore();
}

// The paste pot and its brush.
export function pastePot(g, x, y, s = 1, o = {}) {
  shape(g, spline([[x - 60 * s, y - 100 * s], [x + 60 * s, y - 100 * s], [x + 54 * s, y], [x - 54 * s, y]], true, 3), { fill: CREAM, shade: '#d9c79d', shadeOff: [-8 * s, -6 * s], w: 7 * s, seed: 870 });
  shape(g, ellipse(x, y - 100 * s, 62 * s, 16 * s), { fill: '#f4f7e6', w: 6 * s, seed: 871 });
  label(g, 'PASTE', x, y - 50 * s, 38 * s, { font: PATTER, col: RED });
  // drips
  for (let i = 0; i < 3; i++) shape(g, spline([[x - 40 * s + i * 34 * s, y - 100 * s], [x - 32 * s + i * 34 * s, y - 100 * s], [x - 34 * s + i * 34 * s, y - (78 - i * 8) * s]], true, 3), { fill: '#f4f7e6', w: 3.5 * s, seed: 872 + i });
}
export function brush(g, x, y, ang, s = 1, o = {}) {
  const c = Math.cos(ang), sn = Math.sin(ang);
  stroke(g, [[x - c * 30 * s, y - sn * 30 * s], [x + c * 110 * s, y + sn * 110 * s]], { w: 16 * s, seed: 875, taper: false, color: INK });
  stroke(g, [[x - c * 28 * s, y - sn * 28 * s], [x + c * 108 * s, y + sn * 108 * s]], { w: 8 * s, seed: 876, taper: false, color: WOOD });
  const bx = x + c * 110 * s, by = y + sn * 110 * s;
  shape(g, xf(spline([[0, -22], [40, -26], [72, -10], [80, 0], [72, 10], [40, 26], [0, 22]], true, 4), bx, by, s, ang), { fill: '#f0f3dc', w: 5 * s, seed: 877 });
  shape(g, xf(rrect(-8, -24, 20, 48, 4), bx, by, s, ang), { fill: GREY, w: 4 * s, seed: 878 });
}
export function scissors(g, x, y, ang, s = 1, open = .5) {
  g.save(); g.translate(x, y); g.rotate(ang);
  for (const d of [-1, 1]) {
    g.save(); g.rotate(d * open * .35);
    shape(g, spline([[0, -6 * s], [120 * s, -4 * s * d - 6 * s], [130 * s, 0], [0, 6 * s]], true, 3), { fill: '#c9d2d0', w: 4 * s, seed: 880 + d });
    shape(g, ellipse(-38 * s, d * 22 * s, 30 * s, 20 * s), { fill: RED, w: 5 * s, seed: 882 + d });
    shape(g, ellipse(-38 * s, d * 22 * s, 16 * s, 9 * s), { fill: '#f6e9cb', w: 3 * s, seed: 884 + d });
    g.restore();
  }
  dot(g, 0, 0, 6 * s, GOLD);
  g.restore();
}
// A lollipop swirl, held at (x, y).
export function lollipop(g, x, y, ang, s = 1) {
  const c = Math.cos(ang), sn = Math.sin(ang), L = 110 * s;
  stroke(g, [[x, y], [x + c * L, y + sn * L]], { w: 9 * s, seed: 890, taper: false, color: INK });
  stroke(g, [[x, y], [x + c * L, y + sn * L]], { w: 4 * s, seed: 891, taper: false, color: WHITE });
  const cx = x + c * (L + 44 * s), cy = y + sn * (L + 44 * s);
  shape(g, ellipse(cx, cy, 48 * s, 48 * s), { fill: ROSE, w: 6 * s, seed: 892 });
  const P = []; for (let i = 0; i < 60; i++) { const a = i * .35, r = i / 60 * 42 * s; P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  stroke(g, P, { w: 9 * s, seed: 893, color: CREAM, taper: false, raw: true });
}
// A bellows camera on a tripod; `flash` 0..1 fires the flash-pan.
export function camera(g, x, y, s = 1, o = {}) {
  const t = o.t ?? now();
  for (const a of [-.35, 0, .35]) stroke(g, [[x, y - 230 * s], [x + Math.sin(a) * 160 * s, y]], { w: 8 * s, seed: 900 + a, taper: false, color: WOOD_SH });
  shape(g, rrect(x - 90 * s, y - 330 * s, 110 * s, 120 * s, 8 * s), { fill: WOOD, shade: WOOD_SH, shadeOff: [-6 * s, -6 * s], w: 7 * s, seed: 903 });
  // bellows
  const P = [[x + 20 * s, y - 322 * s], [x + 120 * s, y - 300 * s], [x + 120 * s, y - 238 * s], [x + 20 * s, y - 216 * s]];
  shape(g, P, { fill: INK, w: 6 * s, seed: 904, amt: .5 });
  for (let i = 1; i < 4; i++) stroke(g, [[x + 20 * s + i * 25 * s, y - 318 * s + i * 5 * s], [x + 20 * s + i * 25 * s, y - 222 * s - i * 5 * s]], { w: 3 * s, seed: 905 + i, color: '#5a4636', taper: false });
  shape(g, ellipse(x + 132 * s, y - 269 * s, 26 * s, 36 * s), { fill: GOLD, w: 6 * s, seed: 909 });
  shape(g, ellipse(x + 136 * s, y - 269 * s, 14 * s, 22 * s), { fill: '#28313a', w: 4 * s, seed: 910 });
  // black cloth draped at the back
  if (o.cloth !== false) shape(g, spline([[x - 90 * s, y - 330 * s], [x - 150 * s, y - 300 * s], [x - 170 * s, y - 180 * s], [x - 120 * s, y - 200 * s], [x - 90 * s, y - 210 * s]], true, 4), { fill: INK, w: 5 * s, seed: 911 });
  // flash pan, held up
  const fl = o.flash ?? 0;
  if (fl > 0) {
    const fx = x - 10 * s, fy = y - 440 * s;
    g.save(); g.globalAlpha = clamp(fl * 1.3);
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + t; stroke(g, [[fx + Math.cos(a) * 40 * s, fy + Math.sin(a) * 40 * s], [fx + Math.cos(a) * (70 + fl * 90) * s, fy + Math.sin(a) * (70 + fl * 90) * s]], { w: 8 * s, seed: 912 + i, color: GOLD }); }
    shape(g, ellipse(fx, fy, (40 + fl * 40) * s, (40 + fl * 40) * s), { fill: WHITE, w: 5 * s, seed: 930 });
    g.restore();
  }
}
// A photograph of the app's greeting, pinned or held: text with or without its comma.
export function photo(g, x, y, s, text, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0);
  const w = 330 * s, h = 250 * s;
  shape(g, rrect(-w / 2, -h / 2, w, h, 6 * s), { fill: WHITE, w: 6 * s, seed: 940 + (o.seed ?? 0), amt: .5 });
  shape(g, rrect(-w / 2 + 16 * s, -h / 2 + 16 * s, w - 32 * s, h - 70 * s, 4 * s), { fill: o.screen || '#e9efe2', w: 4 * s, seed: 941 + (o.seed ?? 0), amt: .4 });
  // a tiny app header bar
  paint(g, rrect(-w / 2 + 18 * s, -h / 2 + 18 * s, w - 36 * s, 26 * s, 3 * s), TEAL, { raw: true, off: 0 });
  if (text) label(g, text, 0, -h / 2 + 16 * s + (h - 70 * s) / 2 + 14 * s, fitSize(g, text, DISPLAY, 50 * s, w - 60 * s), { font: DISPLAY, col: INK });
  if (o.caption) label(g, o.caption, 0, h / 2 - 28 * s, 30 * s, { font: PATTER, col: o.capCol || INK });
  if (o.hi != null) { // circle a spot on the photo
    g.strokeStyle = C(RED); g.lineWidth = 7 * s; g.beginPath(); g.ellipse(o.hi[0] * s, o.hi[1] * s, 36 * s, 34 * s, 0, 0, TAU * clamp(o.hiP ?? 1)); g.stroke();
  }
  g.restore();
}
// The comma: a tadpole of ink with pie eyes. `swoon` 0..1 lays it down in a faint.
export function comma(g, x, y, s = 1, o = {}) {
  const t = o.t ?? now();
  g.save(); g.translate(x, y); g.rotate((o.swoon ?? 0) * 1.4 + Math.sin(t * 5) * .05);
  const P = spline([[0, -34], [26, -18], [24, 12], [8, 40], [-8, 64], [0, 34], [-16, 20], [-26, -8]], true, 5);
  shape(g, xf(P, 0, 0, s), { fill: INK, w: 3 * s, seed: 950 });
  for (const d of [-1, 1]) pieEye(g, d * 9 * s, -8 * s, 5 * s, 8 * s, { white: 1.8, lw: 2 * s, seed: 951 + d, blink: o.shut ? 1 : 0, ly: .3 });
  g.restore();
  if (o.tears) for (let i = 0; i < 2; i++) { const p = (t * 2 + i * .5) % 1; shape(g, ellipse(x + (i ? 1 : -1) * (12 + p * 30) * s, y - 4 * s + p * p * 50 * s, 5 * s, 7 * s), { fill: '#8fd0e8', w: 2 * s, seed: 955 + i }); }
}
// An alarm bell on the wall, ringing (0..1).
export function bell(g, x, y, s = 1, ring = 0, t = now()) {
  const a = ring * Math.sin(t * 50) * .25;
  g.save(); g.translate(x, y); g.rotate(a);
  shape(g, rrect(-20 * s, -110 * s, 40 * s, 30 * s, 6 * s), { fill: GREY, w: 5 * s, seed: 960 });
  shape(g, spline([[-80 * s, 0], [-70 * s, -60 * s], [-30 * s, -95 * s], [30 * s, -95 * s], [70 * s, -60 * s], [80 * s, 0], [0, 12 * s]], true, 5), { fill: RED, shade: RED_SH, shadeOff: [-8 * s, -8 * s], w: 7 * s, seed: 961, gloss: { x: .3, y: .25, w: .08, h: .1 } });
  shape(g, ellipse(0, 12 * s, 16 * s, 16 * s), { fill: GOLD, w: 5 * s, seed: 962 });
  g.restore();
  if (ring > .1) { g.save(); g.globalAlpha = ring; pops(g, x, y - 50 * s, 110 * s, 5); pops(g, x, y - 50 * s, 110 * s, 5, { a0: Math.PI * .1 - Math.PI * .8, span: Math.PI * .8 }); g.restore(); }
}
// A big thermometer gauge for the score, `p` 0..1 filled.
export function thermometer(g, x, y, s, p, labelText = 'SCORE') {
  const h = 520 * s;
  shape(g, rrect(x - 50 * s, y - h - 50 * s, 100 * s, h + 40 * s, 50 * s), { fill: CREAM, w: 7 * s, seed: 970 });
  shape(g, ellipse(x, y, 70 * s, 70 * s), { fill: GREEN, shade: GREEN_SH, shadeOff: [-8 * s, -8 * s], w: 7 * s, seed: 971, gloss: { x: .3, y: .25 } });
  const fh = (h - 40 * s) * clamp(p);
  paint(g, rrect(x - 26 * s, y - 40 * s - fh, 52 * s, fh + 30 * s, 20 * s), GREEN, { raw: true, off: 0 });
  for (let i = 0; i <= 10; i++) stroke(g, [[x + 30 * s, y - 50 * s - i * (h - 60 * s) / 10], [x + (i % 5 ? 44 : 56) * s, y - 50 * s - i * (h - 60 * s) / 10]], { w: 4 * s, seed: 972 + i });
  label(g, labelText, x, y - h - 90 * s, 44 * s, { font: PATTER, col: CREAM, ow: .25 });
  label(g, Math.round(p * 100) + '%', x, y + 4 * s, 40 * s, { font: PATTER, col: WHITE, ow: .22 });
}
// A gold star (the grade's treat).
export function goldStar(g, x, y, r, rot = 0) {
  const P = []; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU - Math.PI / 2 + rot; const rr = i % 2 ? r * .45 : r; P.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
  shape(g, P, { fill: GOLD, shade: OCHRE_SH, shadeOff: [-r * .12, -r * .12], w: Math.max(3, r * .1), seed: 980, amt: .5, gloss: { x: .4, y: .3, w: .08, h: .08 } });
}
