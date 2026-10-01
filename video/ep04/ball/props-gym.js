// Verse 2's props: Mabel's phone (a gym log with a face, standing as tall as she is, the old cartoon
// way), the net as a real cable and wall socket, the barbell, and the STORE drawer inside the phone.
import { TAU, clamp, lerp, now, hash, noise, easeOut, backOut } from './kit.js';
import { INK, WHITE, CREAM, CORAL, TEAL, TEAL_SH, OCHRE, ROSE, ROSE_SH, PLUM, GOLD, GREEN, GREEN_SH, RED, WOOD, WOOD_SH, GREY, SLATE, MINT, C } from './palette.js';
import { shape, line, stroke, rrect, ellipse, spline, xf, dot, paint, pieEye } from './ink.js';
import { label, word, DISPLAY, PATTER, SCRIPT, fitSize } from './type.js';
import { blinkAt } from './rig.js';

// The phone standing on (x, y) (its foot), s = 1 is 340 wide. o:
//  bars 0..4 (signal), rows: [{text, gone (0..1), fresh (0..1)}], toast: 0..1 ("Saved!"),
//  spin: 0..1 (reloading), face: 'smug'|'wink'|'open'|'worried', lx, reloadPress 0..1.
export function phone(g, x, y, s = 1, o = {}) {
  const t = o.t ?? now();
  const w = 340 * s, h = 620 * s, top = y - h - 30 * s;
  // a little stand
  shape(g, [[x - 90 * s, y], [x + 90 * s, y], [x + 40 * s, y - 40 * s], [x - 40 * s, y - 40 * s]], { fill: SLATE, w: 6 * s, seed: 7001 });
  // body: a rose case
  shape(g, rrect(x - w / 2, top, w, h, 46 * s), { fill: ROSE, shade: ROSE_SH, shadeOff: [-10 * s, -10 * s], w: 8 * s, seed: 7002, gloss: { x: .16, y: .08, w: .05, h: .04 } });
  // the face on the top bezel
  const bl = blinkAt(t, 71), face = o.face || 'open';
  for (const d of [-1, 1]) {
    const ex = x + d * 50 * s, ey = top + 50 * s;
    if (face === 'wink' && d > 0) { stroke(g, [[ex - 14 * s, ey], [ex, ey - 8 * s], [ex + 14 * s, ey]], { w: 5 * s, seed: 7003 }); continue; }
    if (face === 'smug') { stroke(g, [[ex - 15 * s, ey - 2 * s], [ex + 15 * s, ey - 2 * s]], { w: 5 * s, seed: 7004 + d }); dot(g, ex, ey + 5 * s, 6 * s); continue; }
    pieEye(g, ex, ey, 8 * s, 12 * s, { white: 1.7, lx: o.lx ?? 0, ly: o.ly ?? 0, blink: bl, lw: 3 * s, seed: 7005 + d });
    if (face === 'worried') stroke(g, [[ex - 16 * s, ey - 24 * s - d * 5 * s], [ex + 14 * s, ey - 26 * s + d * 5 * s]], { w: 4 * s, seed: 7007 + d });
  }
  // screen
  const sx = x - w / 2 + 26 * s, sy = top + 86 * s, sw = w - 52 * s, sh = h - 170 * s;
  shape(g, rrect(sx, sy, sw, sh, 14 * s), { fill: '#fbf6e8', w: 6 * s, seed: 7010 });
  g.save(); g.beginPath(); g.rect(sx + 3 * s, sy + 3 * s, sw - 6 * s, sh - 6 * s); g.clip();
  // status bar: signal bars, or NO NET
  const bars = o.bars ?? 4;
  for (let i = 0; i < 4; i++) { const bh = (8 + i * 7) * s; paint(g, rrect(sx + 14 * s + i * 13 * s, sy + 38 * s - bh, 9 * s, bh, 2 * s), i < bars ? INK : '#d8d0bc', { raw: true, off: 0 }); }
  if (bars === 0) { label(g, 'NO NET', sx + 118 * s, sy + 26 * s, 26 * s, { font: PATTER, col: RED }); }
  // header
  paint(g, rrect(sx, sy + 48 * s, sw, 58 * s, 0), TEAL, { raw: true, off: 0 });
  label(g, 'GYM LOG', x, sy + 78 * s, 36 * s, { font: PATTER, col: CREAM });
  // the list of sets, rotating while it reloads
  const spin = o.spin ?? 0;
  g.save();
  if (spin > 0 && spin < 1) { g.globalAlpha = Math.abs(Math.cos(spin * Math.PI)); }
  let yy = sy + 124 * s;
  for (const r of (spin > 0 && spin < .5 ? (o.rowsBefore || o.rows || []) : (o.rows || []))) {
    const gone = r.gone ?? 0, fresh = r.fresh ?? 1;
    if (gone >= 1) { yy += 0; continue; }
    g.save(); g.globalAlpha *= (1 - gone) * clamp(fresh * 2); g.translate(0, (1 - clamp(fresh)) * -20 * s);
    shape(g, rrect(sx + 12 * s, yy, sw - 24 * s, 62 * s, 10 * s), { fill: r.col || '#efe6cf', w: 4 * s, seed: 7020 + yy, amt: .3 });
    label(g, r.text, sx + 28 * s, yy + 33 * s, fitSize(g, r.text, PATTER, 40 * s, sw - 80 * s), { font: PATTER, col: INK, align: 'left' });
    if (r.tick) { stroke(g, [[sx + sw - 50 * s, yy + 32 * s], [sx + sw - 40 * s, yy + 44 * s], [sx + sw - 22 * s, yy + 18 * s]], { w: 5 * s, color: GREEN, seed: 7030 + yy }); }
    g.restore();
    yy += 74 * s;
  }
  if (o.hole) { g.setLineDash([10 * s, 8 * s]); g.strokeStyle = C(RED); g.lineWidth = 4 * s; g.strokeRect(sx + 12 * s, yy, sw - 24 * s, 62 * s); g.setLineDash([]); label(g, '?', x, yy + 33 * s, 44 * s, { font: DISPLAY, col: RED }); }
  g.restore();
  // the reloading arrow
  if (spin > 0 && spin < 1) {
    const a0 = spin * TAU * 2;
    g.strokeStyle = C(TEAL); g.lineWidth = 12 * s; g.lineCap = 'round'; g.beginPath(); g.arc(x, sy + sh * .55, 60 * s, a0, a0 + 4.6); g.stroke();
  }
  // the "Saved!" toast
  const toast = o.toast ?? 0;
  if (toast > 0) {
    const p = backOut(clamp(toast * 3), 2.2) * (toast > .8 ? 1 - (toast - .8) / .2 : 1);
    g.save(); g.translate(x, sy + sh - 70 * s); g.scale(p, p);
    shape(g, rrect(-120 * s, -38 * s, 240 * s, 76 * s, 38 * s), { fill: GREEN, w: 6 * s, seed: 7040 });
    label(g, 'Saved!', 0, 2 * s, 50 * s, { font: SCRIPT, col: WHITE });
    g.restore();
  }
  g.restore();
  // the reload button below the screen
  const rp = o.reloadPress ?? 0;
  shape(g, ellipse(x, top + h - 44 * s + rp * 4 * s, 34 * s, 30 * s * (1 - rp * .3)), { fill: CREAM, w: 5 * s, seed: 7050 });
  g.strokeStyle = C(INK); g.lineWidth = 5 * s; g.beginPath(); g.arc(x, top + h - 44 * s + rp * 4 * s, 15 * s, -2.2, 2.4); g.stroke();
  shape(g, [[x + 12 * s, top + h - 58 * s], [x + 22 * s, top + h - 44 * s], [x + 4 * s, top + h - 46 * s]].map(([a, b]) => [a, b + rp * 4 * s]), { fill: INK, w: 2, seed: 7051 });
  return { x, top, sx, sy, sw, sh, port: [x, y - 40 * s], side: [x - w / 2, top + h * .5] };
}

// The net: a wall socket at (x, y); the plug either in it or dangling at `plug`. The cable runs to `to`.
export function socket(g, x, y, s, plugged, to, o = {}) {
  shape(g, rrect(x - 60 * s, y - 80 * s, 120 * s, 160 * s, 14 * s), { fill: CREAM, w: 6 * s, seed: 7101 });
  label(g, 'NET', x, y - 48 * s, 34 * s, { font: PATTER, col: TEAL });
  for (const d of [-1, 1]) shape(g, rrect(x + d * 20 * s - 6 * s, y - 4 * s, 12 * s, 30 * s, 3 * s), { fill: INK, w: 2, seed: 7102 + d });
  const plug = plugged ? [x, y + 10 * s] : (o.plugAt || [x + 40 * s, y + 220 * s]);
  // cable: a sagging curve from the plug to the phone
  const mid = [(plug[0] + to[0]) / 2, Math.max(plug[1], to[1]) + (o.sag ?? 120) * s];
  const P = spline([plug, mid, to], false, 12);
  line(g, P, { w: 14 * s, taper: false, seed: 7104, color: INK });
  line(g, P, { w: 7 * s, taper: false, seed: 7105, color: SLATE, boilAmt: .4 });
  g.save(); g.translate(plug[0], plug[1]); g.rotate(plugged ? 0 : (o.plugRot ?? .5));
  shape(g, rrect(-34 * s, -10 * s, 68 * s, 70 * s, 12 * s), { fill: OCHRE, w: 6 * s, seed: 7106 });
  if (!plugged) for (const d of [-1, 1]) shape(g, rrect(d * 20 * s - 5 * s, -32 * s, 10 * s, 24 * s, 2 * s), { fill: GOLD, w: 3, seed: 7107 + d });
  g.restore();
  if (o.spark) for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; stroke(g, [[x + Math.cos(a) * 30 * s, y + Math.sin(a) * 30 * s], [x + Math.cos(a) * (60 + o.spark * 40) * s, y + Math.sin(a) * (60 + o.spark * 40) * s]], { w: 6 * s, color: GOLD, seed: 7110 + i }); }
}

// A barbell centred on (x, y), plates in two colours.
export function barbell(g, x, y, s, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot);
  stroke(g, [[-300 * s, 0], [300 * s, 0]], { w: 16 * s, seed: 7201, taper: false, color: INK });
  stroke(g, [[-298 * s, 0], [298 * s, 0]], { w: 7 * s, seed: 7202, taper: false, color: GREY });
  for (const d of [-1, 1]) {
    shape(g, rrect(d * 250 * s - 26 * s, -95 * s, 52 * s, 190 * s, 14 * s), { fill: INK, w: 6 * s, seed: 7203 + d, gloss: { col: '#6d6a74', a: .6, x: .3, y: .2 } });
    shape(g, rrect(d * 200 * s - 20 * s, -70 * s, 40 * s, 140 * s, 12 * s), { fill: RED, w: 6 * s, seed: 7205 + d });
  }
  g.restore();
}

// Inside the phone, seen through a lens: the STORE drawer, holding `cards` (0..n), with a moth if empty.
export function storeView(g, x, y, r, cards, t, o = {}) {
  g.fillStyle = C('#2b2230'); g.fillRect(x - r, y - r, 2 * r, 2 * r);
  // circuit traces
  for (let i = 0; i < 5; i++) stroke(g, [[x - r, y - r + i * r * .45], [x - r * .4, y - r + i * r * .45], [x - r * .2, y - r * .8 + i * r * .45]], { w: 3, color: GOLD, seed: 7300 + i, raw: true });
  shape(g, rrect(x - r * .62, y - r * .3, r * 1.24, r * .9, 8), { fill: WOOD, w: 5, seed: 7310 });
  shape(g, rrect(x - r * .52, y - r * .2, r * 1.04, r * .7, 6), { fill: '#4a2c18', w: 4, seed: 7311 });
  label(g, 'STORE', x, y - r * .45, r * .26, { font: PATTER, col: CREAM });
  for (let i = 0; i < cards; i++) shape(g, rrect(x - r * .45 + i * r * .08, y - r * .1 - i * 6, r * .8, r * .42, 4), { fill: CREAM, w: 3, seed: 7320 + i });
  if (!cards) { // a moth flutters out of the empty drawer
    const mx = x + Math.sin(t * 5) * r * .3, my = y - r * .1 - ((t * .6) % 1) * r * .5, f = Math.abs(Math.sin(t * 25));
    for (const d of [-1, 1]) shape(g, ellipse(mx + d * 12 * f, my, 12 * f + 2, 9), { fill: '#d9ccb2', w: 2.5, seed: 7330 + d });
    dot(g, mx, my, 4);
  }
}
