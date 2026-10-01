// Verse 2's props, all drawn and none lettered: Mabel's barbell and her lift, her phone's gym log
// (rows of barbell icons with ticks; a lost set is a dashed empty outline), the reload arrow, the
// app's big "Saved!" tick, the store drawer behind a hatch in the phone's back, a moth, the crew's
// pith helmets, an idea bulb, chalk footprints, snapshots, sparks, Mabel's notebook, and the
// lifters down the street.
import { TAU, clamp, lerp, now, hash, noise, rng, easeOut, easeInOut, backOut } from './kit.js';
import { INK, WHITE, CREAM, CORAL, TEAL, ROSE, ROSE_SH, PLUM, OCHRE, GOLD, GOLD_SH, GREEN, GREEN_SH, RED, RED_SH, WOOD, WOOD_SH, BROWN, SLATE, GREY, SKIN, C, sh, lt } from './palette.js';
import { shape, line, stroke, rrect, ellipse, spline, xf, dot, paint, pathOf, arc, bez, glove, hose, shoe, eye } from './ink.js';
import { blinkAt, groove, brows, mouth, cheeks, star } from './rig.js';
import { mabel, critter } from './people.js';
import { helmet } from './clawd.js';
import { wifiIcon, router, phone } from './cast.js';
import { guess, press, stress } from './crew.js';

export const PINK = '#e98aa0';             // Mabel's phone
const PINK_SH = '#b45a72', IRON = '#2b2826';

// ---------------------------------------------------------------- the barbell
// A strongman's globe barbell centred on (x, y): two iron globes on a bar. s = 1 is 600 wide.
// o: rot, bend (the bar bowing under a load, + down at the ends), r (globe radius scale).
export function barbell(g, x, y, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0);
  const L = 300 * s, gr = 66 * s * (o.r ?? 1), bend = (o.bend ?? 0) * 40 * s;
  const bar = spline([[-L, bend], [-L * .5, bend * .25], [0, 0], [L * .5, bend * .25], [L, bend]], false, 8);
  line(g, bar, { w: 15 * s, taper: false, seed: 7001, heavy: .2 });
  line(g, bar.slice(2, -2), { w: 6 * s, taper: false, seed: 7002, color: '#8d8a80', boilAmt: .4 });
  for (const d of [-1, 1]) {
    const cx = d * L, cy = bend;
    // the collar, then the globe
    shape(g, rrect(cx - d * gr * .9 - 9 * s, cy - 14 * s, 18 * s, 28 * s, 5 * s), { fill: '#5a5650', form: 'block', w: 4 * s, seed: 7003 + d });
    shape(g, ellipse(cx, cy, gr, gr, 0, 40), { fill: IRON, shade: '#0c0a0a', lit: '#6a645c', form: 'round', cx: .3, cy: .26, k: 1, w: 7 * s, seed: 7005 + d, gloss: { x: .26, y: .2, w: .12, h: .08, col: '#d8d0c4', a: .8 } });
    // a cast seam round the globe's middle
    stroke(g, [[cx - gr * .96, cy + gr * .1], [cx, cy + gr * .26], [cx + gr * .96, cy + gr * .1]], { w: 3 * s, seed: 7007 + d, color: '#141010' });
  }
  g.restore();
}

// Mabel with her barbell. p: the lift, 0 (crouched, gripping the bar on the floor) → .45 (the bar at
// her chest) → 1 (overhead). o: everything mabel() takes, plus load(g, barX, barY, s) to draw riders
// on the bar, bend, and ret (receives Mabel's geometry). Returns the bar's centre.
export function mabelLift(g, x, y, s, p, o = {}) {
  const t = o.t ?? now(), gr = groove(t, o.dance ?? .3, .1);
  const lean = o.lean ?? gr.lean * .3;
  p = clamp(p);
  // the hands' path, in Mabel's arm units (150 px * s from the shoulder)
  const key = [[0, [.42, 1.2], 'grip'], [.45, [.34, -.15], 'grip'], [.7, [.55, -1.2], 'grip'], [1, [.68, -2.0], 'grip']];
  let a = key[0], b = key[key.length - 1];
  for (let i = 0; i < key.length - 1; i++) if (p >= key[i][0] && p <= key[i + 1][0]) { a = key[i]; b = key[i + 1]; break; }
  const u = a === b ? 0 : (p - a[0]) / (b[0] - a[0]);
  const to = [lerp(a[1][0], b[1][0], u), lerp(a[1][1], b[1][1], u)];
  const crouch = o.crouch ?? clamp(1 - p / .4) * 3.2 + (p > .9 ? 0 : 0);
  // where the shoulders are (people.js): the bar sits at the hands' height
  const hipY = y - 150 * s + gr.bob * .4 * s + crouch * 26 * s, th = 236 * s, cy = hipY - th / 2 + 12 * s, shY = cy - th * .3;
  const tw = 280 * s, handX = tw * .48 + to[0] * 150 * s;
  const barY = shY + to[1] * 150 * s, barW = o.barW ?? Math.max(.62, (handX + 72 * s) / 300);
  const front = p < .58;
  // inside mabel() the canvas is already turned by her lean; outside it, turn it here
  const drawBar = (turn) => {
    g.save(); if (turn) { g.translate(x, y); g.rotate(lean); g.translate(-x, -y); }
    barbell(g, x, barY, barW, { bend: o.bend ?? 0, r: s / barW * .95 });
    if (o.load) o.load(g, x, barY, s, barW);
    g.restore();
  };
  if (!front) drawBar(true);
  let saved = null;
  const M = mabel(g, x, y, s, {
    ...o, t, lean, crouch,
    L: { to: [to[0], to[1]], pose: 'grip', ang: front ? Math.PI * .5 : -Math.PI * .5 },
    R: { to: [to[0], to[1]], pose: 'grip', ang: front ? Math.PI * .5 : -Math.PI * .5 },
    hold: front ? { L: () => { drawBar(false); } } : o.hold,
  });
  // in front, redraw her left glove over the bar so both fists hold it
  if (front) {
    g.save(); g.translate(x, y); g.rotate(lean); g.translate(-x, -y);
    glove(g, x - handX, barY, Math.PI * .5, 28 * s, 'grip', { flip: true, seed: 613 });
    g.restore();
  }
  if (o.ret) o.ret(M);
  return { x, y: barY, w: barW * 600, lean, M };
}

// ---------------------------------------------------------------- the gym log, on Mabel's phone
// A small barbell icon, as the log draws one: a bar and two plates each side.
export function barbellIcon(g, x, y, w, col = INK, o = {}) {
  const h = w * .36, lw = Math.max(2, w * .07);
  g.save(); g.fillStyle = C(col); g.strokeStyle = C(col); g.lineCap = 'round';
  g.lineWidth = lw; g.beginPath(); g.moveTo(x - w * .5, y); g.lineTo(x + w * .5, y); g.stroke();
  for (const d of [-1, 1]) {
    pathOf(g, rrect(x + d * w * .3 - w * .055, y - h * .5, w * .11, h, w * .03), true); g.fill();
    pathOf(g, rrect(x + d * w * .41 - w * .04, y - h * .36, w * .08, h * .72, w * .03), true); g.fill();
  }
  g.restore();
}
// A tick, drawn as one swelling stroke (o.big for the badge kind, glossy and inked).
export function tick(g, x, y, r, o = {}) {
  const P = [[x - r * .62, y - r * .02], [x - r * .2, y + r * .45], [x + r * .7, y - r * .55]];
  if (!o.big) { line(g, spline(P, false, 6), { w: r * .32, taper: false, seed: o.seed ?? 7100, color: '!' + (o.col || GREEN), heavy: .2, boilAmt: .5 }); return; }
  // the badge: a fat tick shape with an ink rim, a shade and a gloss
  const T = [[-.78, -.08], [-.52, -.34], [-.22, -.02], [.5, -.78], [.8, -.5], [-.22, .56]].map(([a, b]) => [x + a * r, y + b * r]);
  shape(g, T, { fill: '!' + GREEN, shade: '!' + GREEN_SH, lit: '!#9ad884', form: 'block', w: Math.max(4, r * .09), seed: o.seed ?? 7101, amt: .5, gloss: { x: .62, y: .18, w: .07, h: .05 } });
}
// The reload arrow: a circle nearly closed, with its arrowhead.
export function reloadIcon(g, x, y, r, rot = 0, col = INK) {
  const a0 = rot - Math.PI * .45, a1 = rot + Math.PI * 1.3, P = [];
  for (let i = 0; i <= 24; i++) { const a = lerp(a0, a1, i / 24); P.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
  line(g, P, { w: r * .3, taper: false, seed: 7110, color: col, heavy: .1, boilAmt: .4 });
  const ta = a1, tx = x + Math.cos(ta) * r, ty = y + Math.sin(ta) * r, dx = -Math.sin(ta), dy = Math.cos(ta);
  const nx = Math.cos(ta), ny = Math.sin(ta);
  g.save(); g.fillStyle = C(col); g.beginPath();
  g.moveTo(tx + dx * r * .5, ty + dy * r * .5); g.lineTo(tx + nx * r * .42 - dx * r * .12, ty + ny * r * .42 - dy * r * .12); g.lineTo(tx - nx * r * .42 - dx * r * .12, ty - ny * r * .42 - dy * r * .12); g.closePath(); g.fill(); g.restore();
}
// The net's fan in the log's header, bold enough to read at a glance: three arcs over a dot, ink
// when there's a net; pale and struck through in red when there isn't.
export function netFan(g, x, y, r, on) {
  const lit = on > .5;
  for (let i = 0; i < 3; i++) {
    const rr = r * (.36 + i * .32);
    g.save(); g.lineCap = 'round';
    g.strokeStyle = C(lit ? INK : '#c49aa6'); g.lineWidth = r * .2;
    g.beginPath(); g.arc(x, y, rr, -Math.PI * .76, -Math.PI * .24); g.stroke(); g.restore();
  }
  dot(g, x, y, r * .14, lit ? INK : '#c49aa6');
  if (!lit) {
    const a0 = [x - r * .8, y - r * 1.0], a1 = [x + r * .8, y + r * .16];
    line(g, [a0, a1], { w: r * .3, taper: false, seed: 7096, heavy: 0, boilAmt: .3 });
    line(g, [a0, a1], { w: r * .18, taper: false, seed: 7097, heavy: 0, boilAmt: .3, color: '!' + RED });
  }
}
// A dashed empty outline where a row should be.
export function ghostRow(g, x, y, w, h, s, a = 1) {
  g.save(); g.globalAlpha *= a;
  g.fillStyle = C('#f6e4e4'); pathOf(g, rrect(x, y, w, h, h * .3), true); g.fill();
  g.setLineDash([11 * s, 8 * s]); g.lineDashOffset = 0; g.lineWidth = 4.2 * s; g.strokeStyle = C('#c0566e'); g.lineCap = 'round';
  pathOf(g, rrect(x, y, w, h, h * .3), true); g.stroke(); g.setLineDash([]);
  g.restore();
}
// The log screen, as a phone() screen function. L: rows [{ghost, pop (0..1), tick (0..1), fade}],
// spin (0..1, a reload in progress), press (0..1, the reload icon pressed), big (0..1, the "Saved!"
// tick), bigTick {crack (0..1), gone (0..1)}, hole (0..1, the empty drawer showing through).
export const ROWY = (s, i) => 84 * s + i * 66 * s;     // a row's top, from the screen's top
export function logScreen(L) {
  return (g, sx, sy, sw, shh, s) => {
    const t = now();
    g.fillStyle = C('#fdf5f0'); g.fillRect(sx, sy, sw, shh);
    // the header: the reload arrow, a barbell for the app, room for the Wi-Fi fan
    g.fillStyle = C('#f6c4cf'); g.fillRect(sx, sy, sw, 64 * s);
    g.fillStyle = C('#e2a0b0'); g.fillRect(sx, sy + 62 * s, sw, 4 * s);
    const sp = L.spin ?? 0, pr = L.press ?? 0;
    const rx = sx + 36 * s, ry = sy + 33 * s;
    if (pr > 0) { g.save(); g.globalAlpha *= .5 * pr; g.fillStyle = C(WHITE); g.beginPath(); g.arc(rx, ry, 24 * s, 0, TAU); g.fill(); g.restore(); }
    const isp = L.iconSpin ?? sp;
    reloadIcon(g, rx, ry, 15 * s * (1 - pr * .15), isp * TAU * 2.2, isp > 0 && isp < 1 ? '#b0405a' : INK);
    barbellIcon(g, sx + sw * .5, sy + 33 * s, 54 * s, '#b0405a');
    if (L.wifi != null) netFan(g, sx + sw - 38 * s, sy + 42 * s, 26 * s, L.wifi);
    // the rows, spinning round the screen's middle while it reloads
    const cx = sx + sw / 2, cy = sy + shh * .48;
    g.save();
    if (sp > 0 && sp < 1) {
      const e = easeInOut(sp), k = 1 - Math.sin(sp * Math.PI) * .35;
      g.translate(cx, cy); g.rotate(e * TAU); g.scale(k, k); g.translate(-cx, -cy);
      g.globalAlpha *= 1 - Math.sin(sp * Math.PI) * .25;
    }
    const rw = sw - 30 * s, rh = 54 * s, x0 = sx + 15 * s;
    (L.rows || []).forEach((r, i) => {
      const y0 = sy + ROWY(s, i);
      if (r.ghost) { ghostRow(g, x0, y0, rw, rh, s, clamp(r.ghostA ?? 1)); return; }
      const pop = clamp(r.pop ?? 1);
      if (pop <= 0) return;
      const sc = backOut(pop, 2.4), fade = 1 - clamp(r.fade ?? 0);
      g.save(); g.globalAlpha *= fade;
      g.translate(x0 + rw / 2, y0 + rh / 2); g.scale(sc, sc); g.translate(-(x0 + rw / 2), -(y0 + rh / 2));
      shape(g, rrect(x0, y0, rw, rh, rh * .3), { fill: r.fresh ? '#fff8d8' : WHITE, shade: '#e0d0c8', form: 'block', k: .5, w: 3.4 * s, seed: 7120 + i, amt: .3 });
      barbellIcon(g, x0 + rw * .3, y0 + rh / 2, rw * .36, '#3a2c2c');
      if ((r.tick ?? 1) > 0) { const tk = backOut(clamp(r.tick ?? 1), 3) * (1 + (L.pulse ?? 0) * .45); tick(g, x0 + rw * .8, y0 + rh / 2, 17 * s * tk, { seed: 7130 + i }); }
      g.restore();
    });
    g.restore();
    // a refresh that doesn't spin: the page blinks white and comes back as it was
    if (L.flash > 0) { g.save(); g.globalAlpha *= clamp(L.flash) * .7; g.fillStyle = C(WHITE); g.fillRect(sx, sy + 66 * s, sw, shh - 66 * s); g.restore(); }
    if (L.hole) holeIn(g, cx, sy + shh * .5, sw * .36, L.hole, s, t);
    // the app's big "Saved!" tick, stamped over everything, with a white burst behind
    const big = clamp(L.big ?? 0), bt = L.bigTick || {};
    if (big > 0 && !(bt.gone >= 1)) {
      const sc = backOut(big, 2.6), bx = cx, by = sy + shh * .47, r = sw * .36;
      g.save(); g.translate(bx, by); g.scale(sc, sc); g.translate(-bx, -by);
      g.fillStyle = C('rgba(255,255,255,0.85)'); g.beginPath(); g.arc(bx, by, r * 1.02, 0, TAU); g.fill();
      if (!bt.crack) tick(g, bx, by, r, { big: true });
      else crackedTick(g, bx, by, r, bt.crack, 0);
      g.restore();
    }
  };
}
// The big tick, cracked (0..1 how far the crack has run) and splitting by `apart`; the two halves
// can be drawn falling by the scene, outside the screen's clip.
export function crackedTick(g, x, y, r, crack, apart = 0, which = 0) {
  const T = [[-.78, -.08], [-.52, -.34], [-.22, -.02], [.5, -.78], [.8, -.5], [-.22, .56]].map(([a, b]) => [x + a * r, y + b * r]);
  const cut = [[x - r * .04, y - r * .9], [x + r * .06, y - r * .3], [x - r * .1, y - r * .05], [x + r * .08, y + r * .3], [x - r * .04, y + r * .9]];
  for (const side of which ? [which] : [-1, 1]) {
    g.save();
    g.translate(side * apart * r * .3, apart * r * .2); g.rotate(side * apart * .25);
    g.beginPath(); g.moveTo(x + side * r * 2, y - r * 2); cut.forEach(([a, b]) => g.lineTo(a, b)); g.lineTo(x + side * r * 2, y + r * 2); g.closePath(); g.clip();
    shape(g, T, { fill: '!' + GREEN, shade: '!' + GREEN_SH, lit: '!#9ad884', form: 'block', w: Math.max(4, r * .09), seed: 7101, amt: .5, gloss: { x: .62, y: .18, w: .07, h: .05 } });
    g.restore();
  }
  // the crack itself, running down as it opens
  const n = Math.max(2, Math.round(cut.length * clamp(crack)));
  if (apart < .05) stroke(g, cut.slice(0, n), { w: r * .07, seed: 7140, raw: true, taper: false });
}
// A ragged hole through the screen onto the phone's insides: the store drawer, pulled out, empty.
function holeIn(g, x, y, r, p, s, t) {
  const n = 22, P = [];
  for (let i = 0; i < n; i++) { const a = i / n * TAU, rr = r * (1 + (i % 2 ? -.12 : .1) + noise(i, 7150) * .08) * easeOut(p); P.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * .95]); }
  shape(g, P, { fill: '#2a1c22', form: false, w: 5 * s, seed: 7151, amt: .3 });
  g.save(); pathOf(g, P, true); g.clip();
  drawers(g, x, y - r * .1, r * 1.3, r * 1.2, 1, s, { empty: true, cobweb: true });
  g.restore();
}

// ---------------------------------------------------------------- inside the phone: the store
// A little chest of three drawers centred on (x, y), w by h. pull 0..1 draws the bottom one out,
// toward us. o: empty (no cards in it), cobweb.
export function drawers(g, x, y, w, h, pull, s, o = {}) {
  shape(g, rrect(x - w / 2, y - h / 2, w, h, 8 * s), { fill: WOOD, shade: WOOD_SH, form: 'block', w: 5 * s, seed: 7200 });
  const dh = (h - 24 * s) / 3;
  for (let i = 0; i < 3; i++) {
    const dy = y - h / 2 + 8 * s + i * (dh + 4 * s);
    if (i === 2 && pull > 0) { shape(g, rrect(x - w / 2 + 8 * s, dy, w - 16 * s, dh, 5 * s), { fill: '#1c120c', form: false, w: 3 * s, seed: 7210 }); if (!o.leaveOut) pulledDrawer(g, x, dy, w - 16 * s, dh, pull, s, o); continue; }
    shape(g, rrect(x - w / 2 + 8 * s, dy, w - 16 * s, dh, 5 * s), { fill: '#c48a54', shade: WOOD_SH, form: 'block', w: 3.5 * s, seed: 7220 + i });
    shape(g, ellipse(x, dy + dh / 2, 9 * s, 6 * s), { fill: GOLD, w: 2.6 * s, seed: 7225 + i });
  }
  return { slot: [x, y - h / 2 + 8 * s + 2 * (dh + 4 * s), w - 16 * s, dh] };
}
// The store's bottom drawer, pulled out toward us from its slot (x centre, slotY its top): we look
// down into it, and it is bare wood, nothing in it at all.
export function pulledDrawer(g, x, slotY, w, dh, pull, s, o = {}) {
  const k = 1 + pull * .5, ow = w * k, oh = dh * k, oy = slotY + pull * dh * 1.25;
  const depth = oh * 1.9 * pull, inset = ow * .13, x0 = x - ow / 2, x1 = x + ow / 2, top = oy - depth, mid = top + depth * .3;
  // an open box seen from above: its back wall, its floor, its two sides; nothing in it
  shape(g, [[x0 + inset, top], [x1 - inset, top], [x1 - inset, mid], [x0 + inset, mid]], { fill: '#5e3820', form: false, w: 3 * s, seed: 7211 });
  shape(g, [[x0 + 5 * s, oy], [x1 - 5 * s, oy], [x1 - inset, mid], [x0 + inset, mid]], { fill: '#b98450', shade: '#8a5a30', lit: '#d8a870', form: 'block', w: 3 * s, seed: 7212 });
  for (let i = 1; i < 4; i++) { const u = i / 4; stroke(g, [[lerp(x0 + inset, x0 + 5 * s, u) + 6 * s, lerp(mid, oy, u)], [lerp(x1 - inset, x1 - 5 * s, u) - 6 * s, lerp(mid, oy, u)]], { w: 1.4 * s, seed: 7213 + i, color: '#946236' }); }
  shape(g, [[x0, top - 3 * s], [x0 + inset, top], [x0 + inset, mid], [x0 + 5 * s, oy], [x0, oy]], { fill: '#8a5a34', form: false, w: 3 * s, seed: 7217 });
  shape(g, [[x1, top - 3 * s], [x1 - inset, top], [x1 - inset, mid], [x1 - 5 * s, oy], [x1, oy]], { fill: '#6e4426', form: false, w: 3 * s, seed: 7218 });
  // a cobweb across the back corner, and a little dust
  if (o.cobweb) {
    const cx = x0 + inset, cy = top;
    for (const [a1, r1] of [[.3, 26], [.75, 30], [1.2, 24]]) stroke(g, [[cx, cy], [cx + Math.cos(a1) * r1 * s, cy + Math.sin(a1) * r1 * s]], { w: 1.4 * s, seed: 7220, color: '#f4ece0', raw: true, taper: false });
    for (const r1 of [10, 18]) stroke(g, [[cx + r1 * s, cy + 2 * s], [cx + r1 * s * .7, cy + r1 * s * .55], [cx + 2 * s, cy + r1 * s]], { w: 1.2 * s, seed: 7221 + r1, color: '#f4ece0' });
  }
  // its front, with the knob
  shape(g, rrect(x0, oy, ow, oh, 5 * s), { fill: '#c48a54', shade: WOOD_SH, form: 'block', w: 4.5 * s, seed: 7219, gloss: { x: .1, y: .2, w: .04, h: .1, dot: false } });
  shape(g, ellipse(x, oy + oh * .5, 10 * s * k, 7 * s * k), { fill: GOLD, w: 3 * s, seed: 7222 });
  return [x, lerp(mid, oy, .5)];
}
// The phone seen from behind, standing on (x, y): its back, a camera, a hatch with hinges. It peeks
// round its own edge at whoever is opening it. open 0..1 swings the hatch, pull 0..1 draws out the
// store's bottom drawer. Returns the hatch's centre.
export function phoneBack(g, x, y, s, o = {}) {
  const t = o.t ?? now(), gr = groove(t, .3, .6);
  const w = 300 * s, h = 560 * s, legH = 40 * s, bottom = y - legH + gr.bob * .3 * s, top = bottom - h, col = o.col || PINK;
  g.save(); g.translate(x, y); g.rotate(o.lean ?? gr.lean * .4); g.translate(-x, -y);
  for (const d of [-1, 1]) { hose(g, [x + d * 60 * s, bottom - 10 * s], [x + d * 70 * s, y - 8 * s], { w: 11 * s, bend: .05, seed: 1000 + d }); shoe(g, x + d * 72 * s, y - 8 * s, 20 * s, -d, { seed: 1002 + d }); }
  shape(g, rrect(x - w / 2, top, w, h, 48 * s), { fill: col, shade: sh(col, .3), lit: lt(col, .4), form: 'block', w: 8 * s, seed: 7300, gloss: { x: .82, y: .06, w: .05, h: .035 } });
  // the camera bump
  shape(g, rrect(x + w * .1, top + 30 * s, 96 * s, 96 * s, 26 * s), { fill: sh(col, .12), form: 'block', w: 5 * s, seed: 7301 });
  for (const [cx, cy] of [[x + w * .1 + 30 * s, top + 58 * s], [x + w * .1 + 66 * s, top + 98 * s]]) { shape(g, ellipse(cx, cy, 16 * s, 16 * s), { fill: '#2a2226', lit: '#6a5a66', form: 'round', w: 4 * s, seed: 7302 + cx, gloss: { x: .3, y: .25, w: .16, h: .12, dot: false } }); }
  // one eye peeking round the left edge, worried
  const e = o.eye ?? 0;
  if (e > 0) {
    const ex = x - w / 2 - 4 * s, ey = top + 46 * s;
    g.save(); g.beginPath(); g.rect(ex - 40 * s, ey - 40 * s, 44 * s, 80 * s); g.clip();
    eye(g, ex, ey, 7 * s, 12 * s, { white: 1.8, lx: 1, blink: blinkAt(t, 71), lw: 3 * s, seed: 7305, col });
    g.restore();
    brows(g, ex - 2 * s, ey - 26 * s, 0, 18 * s, { mood: 1, lw: 4 * s, seed: 7306 });
  }
  // the hatch: a door hinged on its left, swinging open toward us
  const hx = x, hy = top + h * .58, hw = 180 * s, hh = 200 * s, op = clamp(o.open ?? 0);
  const x0 = hx - hw / 2, y0 = hy - hh / 2;
  shape(g, rrect(x0, y0, hw, hh, 18 * s), { fill: '#2a1c22', form: false, w: 5 * s, seed: 7310 });
  if (op > 0) {
    g.save(); g.beginPath(); g.rect(x0 + 4 * s, y0 + 4 * s, hw - 8 * s, hh - 8 * s); g.clip();
    g.fillStyle = C('#1a1014'); g.fillRect(x0, y0, hw, hh);
    var slot = drawers(g, hx, hy, hw * .74, hh * .78, o.pull ?? 0, s, { leaveOut: true }).slot;
    g.restore();
  }
  // the door itself: full face when shut; a narrowing then reversed face as it swings
  const c = Math.cos(op * Math.PI * .92), dw = hw * Math.abs(c);
  if (dw > 2) {
    const dx0 = c >= 0 ? x0 : x0 - dw, face = c >= 0 ? sh(col, .06) : sh(col, .3);
    shape(g, rrect(dx0, y0 - (1 - Math.abs(c)) * 10 * s, dw, hh + (1 - Math.abs(c)) * 20 * s, Math.min(18 * s, dw / 2)), { fill: face, form: 'block', w: 5 * s, seed: 7311 });
    if (c > .3) { for (const [sx2, sy2] of [[x0 + 18 * s, y0 + 18 * s], [x0 + hw - 18 * s, y0 + 18 * s], [x0 + 18 * s, y0 + hh - 18 * s], [x0 + hw - 18 * s, y0 + hh - 18 * s]]) { dot(g, sx2, sy2, 5 * s, sh(col, .5)); stroke(g, [[sx2 - 3 * s, sy2 - 3 * s], [sx2 + 3 * s, sy2 + 3 * s]], { w: 1.6 * s, seed: 7312, color: lt(col, .5) }); } }
  }
  // hinges
  for (const hy2 of [y0 + 30 * s, y0 + hh - 30 * s]) shape(g, rrect(x0 - 10 * s, hy2 - 9 * s, 18 * s, 18 * s, 4 * s), { fill: '#b8b0a0', form: 'block', w: 3 * s, seed: 7315 + hy2 });
  let inside = null;
  if (op > 0 && (o.pull ?? 0) > 0 && slot) inside = pulledDrawer(g, slot[0], slot[1], slot[2], slot[3], o.pull, s, { cobweb: true });
  g.restore();
  return { hatch: [hx, hy], top, w, h, inside };
}

// ---------------------------------------------------------------- a moth
// A soft, dusty moth at (x, y), wings beating on t; s = 1 is about 90 px across.
export function moth(g, x, y, s, t, o = {}) {
  const f = Math.abs(Math.sin(t * 22 + (o.phase ?? 0))), d = o.dir ?? 1;
  // a little trail of dust behind it
  if (o.trail) for (let i = 1; i < 5; i++) { g.save(); g.globalAlpha *= .3 * (1 - i / 5); g.fillStyle = C('#e8dcc8'); g.beginPath(); g.arc(x - o.trail[0] * i * 14, y - o.trail[1] * i * 14, (6 - i) * s, 0, TAU); g.fill(); g.restore(); }
  g.save(); g.translate(x, y); g.scale(d, 1); g.rotate(o.rot ?? 0);
  for (const side of [-1, 1]) {
    const k = lerp(.25, 1, f);
    shape(g, spline([[0, -2 * s], [side * 40 * s * k, -30 * s], [side * 48 * s * k, -6 * s], [side * 30 * s * k, 8 * s]], true, 5), { fill: '#d8c8a8', shade: '#9a8a6a', w: 3.2 * s, seed: 7400 + side, k: .8 });
    shape(g, spline([[0, 4 * s], [side * 30 * s * k, 10 * s], [side * 26 * s * k, 26 * s], [side * 8 * s * k, 22 * s]], true, 4), { fill: '#c8b896', w: 3 * s, seed: 7402 + side, k: .8 });
    dot(g, side * 28 * s * k, -12 * s, 4 * s, '#8a7a5a');
  }
  shape(g, ellipse(0, 4 * s, 9 * s, 20 * s), { fill: '#a89878', w: 3 * s, seed: 7404 });
  for (const side of [-1, 1]) stroke(g, [[side * 3 * s, -14 * s], [side * 10 * s, -28 * s], [side * 18 * s, -32 * s]], { w: 2.2 * s, seed: 7405 + side });
  for (const side of [-1, 1]) { dot(g, side * 4 * s, -8 * s, 3.4 * s); dot(g, side * 4 * s - 1, -9 * s, 1.1 * s, WHITE); }
  g.restore();
}
// Dust puffing out of something empty.
export function dust(g, x, y, r, p, seed = 7410) {
  if (p <= 0 || p >= 1) return;
  const R = rng(seed);
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (R() - .5) * 2.4, d = r * (.3 + p * (.6 + R() * .6)), rr = r * (.14 + R() * .1) * (1 + p);
    g.save(); g.globalAlpha *= (1 - p) * .8;
    shape(g, ellipse(x + Math.cos(a) * d, y + Math.sin(a) * d * .7, rr, rr * .8), { fill: '#e8dcc8', w: 2.4, seed: seed + i, form: false });
    g.restore();
  }
}

// ---------------------------------------------------------------- the expedition
// A pith helmet on a crew member: Guess, Press or Stress (r is what their drawing function returned).
// drop 0..1 brings it down from above and claps it on with a squash.
export function crewHelmet(g, who, x, y, s, r, o = {}) {
  const t = o.t ?? now(), drop = clamp(o.drop ?? 1);
  if (drop <= 0) return;
  let hx = x, hy, k;
  if (who === 'guess') { hy = r.cy - 300 * s * .52 + 26 * s; k = .86; hx = x + (o.face ?? 0) * 16 * s; }
  else if (who === 'press') { hy = r.cy - 90 * s + 18 * s; k = .92; }
  else { hy = r.cy - 272 * s * .5 + 10 * s; k = 1.2; }
  const fall = (1 - easeOut(drop, 3)) * 420 * s, squash = drop > .7 && drop < 1 ? Math.sin((drop - .7) / .3 * Math.PI) * .12 : 0;
  g.save(); g.translate(x, y); g.rotate(o.lean ?? 0); g.translate(-x, -y);
  g.translate(hx, hy - fall); g.rotate(o.tilt ?? -.06); g.scale(1 + squash, 1 - squash);
  helmet(g, 0, 0, s * k);
  g.restore();
}
// The idea: a light bulb that pops up over a head and lights.
export function ideaBulb(g, x, y, s, p, t, o = {}) {
  if (p <= 0) return;
  const sc = backOut(clamp(p * 1.6), 2.6) * s, on = clamp((p - .3) / .2);
  g.save(); g.translate(x, y); g.scale(sc, sc);
  if (on > 0) {
    g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(0, -10, 4, 0, -10, 120); gr.addColorStop(0, `rgba(255,236,150,${.7 * on})`); gr.addColorStop(1, 'rgba(255,236,150,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, -10, 120, 0, TAU); g.fill(); g.restore();
    for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + (i - 3.5) * .36, w2 = Math.sin(t * 9 + i) * 4; stroke(g, [[Math.cos(a) * 66, -10 + Math.sin(a) * 66], [Math.cos(a) * (92 + w2), -10 + Math.sin(a) * (92 + w2)]], { w: 7, seed: 7500 + i, color: GOLD_SH }); }
  }
  const P = spline([[-22, 26], [-40, -4], [-42, -36], [-24, -62], [0, -70], [24, -62], [42, -36], [40, -4], [22, 26]], true, 6);
  shape(g, P, { fill: on > .5 ? '#fff2a0' : '#e8eee8', shade: on > .5 ? '#f0c840' : '#b8c4c0', form: 'round', w: 6, seed: 7510, gloss: { x: .28, y: .18, w: .12, h: .08 } });
  stroke(g, [[-10, 20], [-8, -12], [0, -24], [8, -12], [10, 20]], { w: 3.4, seed: 7511, color: on > .5 ? '#c07a10' : '#7a7a70' });
  for (let i = 0; i < 3; i++) shape(g, rrect(-22, 26 + i * 11, 44, 12, 5), { fill: '#a8a498', form: 'block', w: 3.6, seed: 7512 + i });
  shape(g, ellipse(0, 62, 9, 6), { fill: INK, w: 0, seed: 7515, form: false });
  g.restore();
}
// A chalk footprint on the floor (foreshortened), toe pointing along dir (+1 right, -1 left).
export function footprint(g, x, y, s, dir = -1, side = 1, a = 1) {
  if (a <= 0) return;
  g.save(); g.globalAlpha *= a * .85; g.translate(x, y); g.scale(dir, .42);
  g.fillStyle = C('#f2ece0');
  g.beginPath(); g.ellipse(10 * s, side * 6 * s, 24 * s, 15 * s, -.12 * side, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(-24 * s, side * 4 * s, 13 * s, 12 * s, 0, 0, TAU); g.fill();
  // tread marks
  g.fillStyle = C('#8a7a62');
  for (let i = 0; i < 3; i++) { g.fillRect((-2 + i * 10) * s, (side * 6 - 9) * s, 4 * s, 18 * s); }
  g.restore();
}
// Electric sparks bursting at (x, y): p 0..1.
export function sparks(g, x, y, r, p, seed = 7600) {
  if (p <= 0 || p >= 1) return;
  const R = rng(seed);
  for (let i = 0; i < 7; i++) {
    const a = R() * TAU, d0 = r * (.2 + p * .5), d1 = r * (.5 + p * 1.1 + R() * .4);
    const m = [x + Math.cos(a + .25) * (d0 + d1) / 2, y + Math.sin(a + .25) * (d0 + d1) / 2];
    stroke(g, [[x + Math.cos(a) * d0, y + Math.sin(a) * d0], m, [x + Math.cos(a) * d1, y + Math.sin(a) * d1]], { w: 6 * (1 - p) + 2, seed: seed + i, color: '!#f6d040', raw: true, taper: true });
  }
  if (p < .5) star(g, x, y, r * .5 * (1 - p * 2), '#fff4b0', { n: 4, inner: .3, seed: seed + 9, w: 3, gloss: false });
}
// A snapshot with a white border, rotated `rot`, its picture drawn by inside(g, x0, y0, w, h).
export function snapshot(g, x, y, w, h, rot, inside, o = {}) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.save(); g.globalAlpha *= .35; g.fillStyle = '#1a0c06'; g.filter = 'blur(8px)'; g.fillRect(-w / 2 + 12, -h / 2 + 16, w, h); g.restore();
  shape(g, rrect(-w / 2, -h / 2, w, h, 6), { fill: '#fbf6ea', shade: '#d8ccb4', form: 'block', k: .4, w: 5, seed: o.seed ?? 7700, amt: .4 });
  const m = w * .07, iw = w - m * 2, ih = h - m * 2 - h * .12;
  g.save(); g.beginPath(); g.rect(-w / 2 + m, -h / 2 + m, iw, ih); g.clip();
  inside(g, -w / 2 + m, -h / 2 + m, iw, ih);
  g.restore();
  stroke(g, [[-w / 2 + m, -h / 2 + m], [w / 2 - m, -h / 2 + m], [w / 2 - m, -h / 2 + m + ih], [-w / 2 + m, -h / 2 + m + ih], [-w / 2 + m, -h / 2 + m]], { w: 2.6, seed: (o.seed ?? 7700) + 1, raw: true, taper: false, color: '#5a4a3a' });
  g.restore();
}
// Mabel's own little notebook, open, with `n` barbells jotted down it (the last drawing in at `p`).
export function notebook(g, x, y, s, n, p = 1, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0);
  const w = 150 * s, h = 190 * s;
  shape(g, rrect(-w / 2 - 8 * s, -h / 2 - 8 * s, w + 16 * s, h + 16 * s, 10 * s), { fill: '#8a4a3a', shade: '#5a2a1e', form: 'block', w: 5 * s, seed: 7800 });
  shape(g, rrect(-w / 2, -h / 2, w, h, 6 * s), { fill: '#fbf4e2', form: false, w: 3.5 * s, seed: 7801 });
  for (let i = 1; i < 7; i++) { g.fillStyle = C('#b8cce0'); g.fillRect(-w / 2 + 6 * s, -h / 2 + i * h / 7, w - 12 * s, 2 * s); }
  g.fillStyle = C('#e8a0a8'); g.fillRect(-w / 2 + 22 * s, -h / 2, 2 * s, h);
  // the spiral at the top
  for (let i = 0; i < 6; i++) shape(g, ellipse(-w / 2 + 18 * s + i * (w - 36 * s) / 5, -h / 2 - 2 * s, 6 * s, 9 * s), { fill: null, w: 3 * s, seed: 7802 + i, form: false });
  for (let i = 0; i < n; i++) {
    const k = i === n - 1 ? clamp(p) : 1, yy = -h / 2 + (i + .62) * h / 7 + 6 * s;
    if (k <= 0) continue;
    // a hand-drawn barbell: the bar first, then the plates one by one, then a tick
    const x0 = -w * .22, x1 = w * .3, bx = lerp(x0, x1, clamp(k / .5));
    stroke(g, [[x0, yy], [bx, yy + 1 * s]], { w: 3.4 * s, seed: 7810 + i, raw: true, taper: false, color: '#2a2a4a' });
    const plates = [[x0 + 4 * s, 13], [x1 - 4 * s, 13], [x0 + 12 * s, 9], [x1 - 12 * s, 9]];
    plates.forEach(([px, ph], j) => { if ((k - .5) * 8 > j) stroke(g, [[px, yy - ph * s], [px, yy + ph * s]], { w: 3.6 * s, seed: 7820 + i * 4 + j, raw: true, taper: false, color: '#2a2a4a' }); });
    if (k >= 1) stroke(g, [[w * .36, yy - 2 * s], [w * .4, yy + 4 * s], [w * .46, yy - 8 * s]], { w: 3 * s, seed: 7830 + i, color: '#2a2a4a' });
  }
  g.restore();
}
export function pencil(g, x, y, ang, s) {
  g.save(); g.translate(x, y); g.rotate(ang);
  shape(g, rrect(0, -7 * s, 120 * s, 14 * s, 3 * s), { fill: '#e8b830', shade: '#b08010', form: 'block', w: 3.4 * s, seed: 7840 });
  shape(g, [[120 * s, -7 * s], [146 * s, 0], [120 * s, 7 * s]], { fill: '#f0d8b0', w: 3 * s, seed: 7841, form: false });
  shape(g, [[139 * s, -2 * s], [146 * s, 0], [139 * s, 2 * s]], { fill: INK, w: 0, seed: 7842, form: false });
  shape(g, rrect(-14 * s, -7 * s, 16 * s, 14 * s, 4 * s), { fill: '#e89aa8', w: 3 * s, seed: 7843, form: false });
  g.restore();
}

// ---------------------------------------------------------------- passers-by outside the window
// Feet going past on the pavement, seen from below through the glass: drawn in the window's own
// coordinates, clipped by the caller. t drives the walk.
export function passersBy(g, x0, y0, x1, y1, t) {
  const W2 = x1 - x0, ground = y0 + (y1 - y0) * .64;
  const walkers = [
    { v: 110, ph: 0, col: '#3e4252', shoe: '#2a1a14', kind: 'trousers' },
    { v: -80, ph: .45, col: '#d8b8a0', shoe: '#7a2a2a', kind: 'heels', skirt: '#6a3a4a' },
    { v: 140, ph: .8, col: '#5a5040', shoe: '#1a1410', kind: 'trousers' },
  ];
  for (const w of walkers) {
    const span = W2 + 300, pos = (((t * w.v) / span + w.ph) % 1 + 1) % 1, cx = w.v > 0 ? x0 - 150 + pos * span : x1 + 150 - pos * span;
    const dir = Math.sign(w.v), step = t * Math.abs(w.v) / 42;
    for (const d of [0, .5]) {
      const ph = Math.sin((step + d) * TAU), fx = cx + ph * 20 + (d ? 12 : -12), lift = Math.max(0, -Math.cos((step + d) * TAU)) * 7;
      const top = y0 - 20, ft = ground - lift;
      g.fillStyle = C(w.col);
      if (w.kind === 'trousers') {
        g.beginPath(); g.moveTo(fx - 10, top); g.lineTo(fx + 10, top); g.lineTo(fx + 12, ft - 8); g.lineTo(fx - 12, ft - 8); g.closePath(); g.fill();
        g.fillStyle = C('rgba(0,0,0,.25)'); g.fillRect(fx - 1, top, 2, ft - 10 - top);
        g.fillStyle = C(w.col); g.fillRect(fx - 13, ft - 13, 26, 6);
      } else {
        g.beginPath(); g.moveTo(fx - 5, top); g.lineTo(fx + 5, top); g.lineTo(fx + 4, ft - 6); g.lineTo(fx - 4, ft - 6); g.closePath(); g.fill();
      }
      g.fillStyle = C(w.shoe); g.beginPath(); g.ellipse(fx + dir * 7, ft - 3, w.kind === 'heels' ? 13 : 19, 7, 0, 0, TAU); g.fill();
      if (w.kind === 'heels') g.fillRect(fx - dir * 7 - 2, ft - 3, 4, 9);
    }
    if (w.skirt) { g.fillStyle = C(w.skirt); g.beginPath(); g.moveTo(cx - 34, y0 - 10); g.lineTo(cx + 34, y0 - 10); g.lineTo(cx + 26, y0 + 12); g.lineTo(cx - 26, y0 + 12); g.closePath(); g.fill(); }
  }
}

// ---------------------------------------------------------------- down the street
// A little phone propped on a stool, its screen one big Wi-Fi fan (struck through when there's no net).
export function miniPhone(g, x, y, s, on = 0, col = '#9cc2b0', o = {}) {
  if (o.shelf) {
    for (const d of [-1, 1]) shape(g, [[x + d * 40 * s, y + 10 * s], [x + d * 40 * s, y + 46 * s], [x + d * 22 * s, y + 10 * s]], { fill: '#5a3a22', w: 2.6 * s, seed: 7898 + d, form: false });
    shape(g, rrect(x - 60 * s, y, 120 * s, 12 * s, 3 * s), { fill: '#8a5a36', form: 'block', w: 3 * s, seed: 7899 });
  } else {
    shape(g, rrect(x - 34 * s, y - 40 * s, 68 * s, 40 * s, 6 * s), { fill: '#7a5032', form: 'block', w: 3 * s, seed: 7900 });
    for (const d of [-1, 1]) stroke(g, [[x + d * 26 * s, y], [x + d * 30 * s, y + 46 * s]], { w: 5 * s, seed: 7901 + d, taper: false });
    y -= 40 * s;
  }
  shape(g, rrect(x - 30 * s, y - 104 * s, 60 * s, 104 * s, 11 * s), { fill: col, form: 'block', w: 4 * s, seed: 7903 });
  shape(g, rrect(x - 23 * s, y - 92 * s, 46 * s, 78 * s, 5 * s), { fill: '#fdf8ec', form: false, w: 2.6 * s, seed: 7904 });
  wifiIcon(g, x, y - 46 * s, 20 * s, on);
}
// A lifter's phone down the street, on a wall shelf (y the shelf's top): its log shows the same
// trouble as Mabel's: the fan struck through, one row ticked, one dashed and empty.
export function shelfPhone(g, x, y, s, col = '#9cc2b0') {
  for (const d of [-1, 1]) shape(g, [[x + d * 46 * s, y + 10 * s], [x + d * 46 * s, y + 50 * s], [x + d * 26 * s, y + 10 * s]], { fill: '#5a3a22', w: 2.6 * s, seed: 7890 + d, form: false });
  shape(g, rrect(x - 70 * s, y, 140 * s, 12 * s, 3 * s), { fill: '#8a5a36', form: 'block', w: 3 * s, seed: 7891 });
  const w = 74 * s, h = 128 * s, top = y - h;
  shape(g, rrect(x - w / 2, top, w, h, 13 * s), { fill: col, shade: sh(col, .3), form: 'block', w: 4 * s, seed: 7892 });
  for (const d of [-1, 1]) dot(g, x + d * 11 * s, top + 8 * s, 2.6 * s);
  const sx = x - w / 2 + 7 * s, sw = w - 14 * s, sy = top + 16 * s, shh = h - 26 * s;
  shape(g, rrect(sx, sy, sw, shh, 5 * s), { fill: '#fdf5f0', form: false, w: 2.6 * s, seed: 7893 });
  g.fillStyle = C('#f6c4cf'); g.fillRect(sx + 1.5 * s, sy + 1.5 * s, sw - 3 * s, 22 * s);
  netFan(g, x, sy + 19 * s, 11 * s, 0);
  const rw = sw - 10 * s, rh = 20 * s, x0 = sx + 5 * s;
  shape(g, rrect(x0, sy + 32 * s, rw, rh, 5 * s), { fill: WHITE, form: false, w: 2.2 * s, seed: 7894 });
  barbellIcon(g, x0 + rw * .32, sy + 32 * s + rh / 2, rw * .42, '#3a2c2c');
  tick(g, x0 + rw * .8, sy + 32 * s + rh / 2, 7 * s, { seed: 7895 });
  ghostRow(g, x0, sy + 60 * s, rw, rh, s * .55);
}
// A lifter in a basement down the street: 'piglet' and 'bunny' (townsfolk), 'strongman' (a
// moustached showman in a leopard leotard). p 0..1 lifts.
export function lifter(g, kind, x, y, s, t, p) {
  if (kind === 'strongman') return strongman(g, x, y, s, t, p);
  const up = clamp(p);
  const bell2 = (g2, hx, hy, a, sc) => { const r = 18 * s; stroke(g2, [[hx - 22 * s, hy], [hx + 22 * s, hy]], { w: 7 * s, seed: 7950, taper: false }); for (const d of [-1, 1]) shape(g2, ellipse(hx + d * 24 * s, hy, r, r), { fill: IRON, lit: '#6a645c', form: 'round', w: 3.4 * s, seed: 7951 + d, gloss: { x: .3, y: .25, w: .14, h: .1, dot: false } }); };
  return critter(g, x, y, s, { t, kind, L: { to: [.25, lerp(.3, -1.05, up)], pose: 'grip' }, R: { to: [.25, lerp(.3, -1.05, up)], pose: 'grip' }, hold: { L: bell2, R: bell2 }, eyes: { expr: up > .6 ? 'happy' : 'open', lx: .3 }, sing: 0, smile: up > .6 ? 1.2 : .6 });
}
function strongman(g, x, y, s, t, p) {
  const gr = groove(t, .5, .4), up = clamp(p), bob = gr.bob * .5 * s;
  const cy = y - 150 * s + bob;
  for (const d of [-1, 1]) { hose(g, [x + d * 30 * s, cy + 60 * s], [x + d * 44 * s, y - 10 * s], { w: 22 * s, fill: '#e8b48a', seed: 7960 + d, lw: 4 * s }); shoe(g, x + d * 48 * s, y - 10 * s, 22 * s, d, { seed: 7962 + d }); }
  const barY = lerp(cy - 30 * s, cy - 170 * s, up);
  barbell(g, x, barY, .42 * s / .9 * .9, { r: 1.3 });
  for (const d of [-1, 1]) hose(g, [x + d * 70 * s, cy - 40 * s], [x + d * 96 * s, barY + 6 * s], { w: 22 * s, fill: '#e8b48a', seed: 7964 + d, lw: 4 * s, bend: d * .3 });
  const B = spline([[x - 80 * s, cy - 60 * s], [x, cy - 76 * s], [x + 80 * s, cy - 60 * s], [x + 70 * s, cy + 40 * s], [x, cy + 72 * s], [x - 70 * s, cy + 40 * s]], true, 6);
  shape(g, B, { fill: '#e0a050', shade: '#a06a20', form: 'round', w: 6 * s, seed: 7966 });
  g.save(); pathOf(g, B, true); g.clip(); const R = rng(7967); for (let i = 0; i < 24; i++) { g.fillStyle = C('#5a3414'); g.beginPath(); g.ellipse(x + (R() - .5) * 160 * s, cy + (R() - .5) * 130 * s, 7 * s, 5 * s, R() * 3, 0, TAU); g.fill(); } g.restore();
  for (const d of [-1, 1]) glove(g, x + d * 96 * s, barY + 6 * s, -Math.PI / 2, 15 * s, 'grip', { flip: d < 0, seed: 7968 + d });
  const hy = cy - 112 * s;
  shape(g, ellipse(x, hy, 44 * s, 48 * s), { fill: '#e8b48a', shade: '#b07a52', form: 'round', w: 6 * s, seed: 7970 });
  shape(g, spline([[x - 40 * s, hy - 18 * s], [x - 30 * s, hy - 46 * s], [x, hy - 52 * s], [x + 30 * s, hy - 46 * s], [x + 40 * s, hy - 18 * s], [x, hy - 30 * s]], true, 5), { fill: '#2a1a14', w: 4 * s, seed: 7971, form: false });
  for (const d of [-1, 1]) eye(g, x + d * 15 * s, hy - 4 * s, 6 * s, 10 * s, { white: 1.7, lx: .2, blink: blinkAt(t, 7972), lw: 2.6 * s, seed: 7973 + d, col: '#e8b48a' });
  stroke(g, spline([[x - 40 * s, hy + 2 * s], [x - 22 * s, hy + 18 * s], [x, hy + 12 * s], [x + 22 * s, hy + 18 * s], [x + 40 * s, hy + 2 * s]], false, 5), { w: 9 * s, seed: 7975, color: '#2a1a14' });
}

// ---------------------------------------------------------------- the cast in costume
// A crew member, optionally in a pith helmet (o.helmet: 0..1 its drop); leans as the character
// would, so the helmet stays on.
export function crewLean(who, t, o = {}) {
  if (o.lean != null) return o.lean;
  if (who === 'guess') return groove(t, o.dance ?? .6, (o.phase ?? 0) + .25).lean * .8;
  if (who === 'press') return groove(t, (o.dance ?? .7) * 1.3, (o.phase ?? 0) + .5).lean;
  return groove(t, (o.dance ?? .5) * .8, (o.phase ?? 0) + .75).lean * .6;
}
export function member(g, who, x, y, s, o = {}) {
  const t = o.t ?? now(), lean = crewLean(who, t, o);
  const fn = who === 'guess' ? guess : who === 'press' ? press : stress;
  const r = fn(g, x, y, s, { ...o, t, lean });
  if (o.helmet != null && o.helmet > 0) crewHelmet(g, who, x, y, s, r, { t, lean, drop: o.helmet, face: o.face });
  return r;
}
// Mabel's phone with her gym log on it. L as for logScreen, plus wifi (0..1) and eyes.
export function mabelPhone(g, x, y, s, L, o = {}) {
  return phone(g, x, y, s, { col: PINK, screen: logScreen({ wifi: 0, ...L }), ...o, wifi: null });
}

// The arm pose ({to, pose}) that puts a crew member's hand on a world point, allowing for the beat's
// bob and the lean the character will draw with (crewLean). side 'L' or 'R'.
export function reach(who, x, y, s, side, target, o = {}) {
  const t = o.t ?? now(), lean = crewLean(who, t, o), dir = side === 'L' ? -1 : 1;
  let sh, u;
  if (who === 'guess') {
    const gr = groove(t, o.dance ?? .6, (o.phase ?? 0) + .25), bw = 156 * s * (1 + gr.sq), bh = 300 * s * (1 - gr.sq * .8);
    const cy = y - 86 * s - bh / 2 + gr.bob * .6 * s - (o.jump ?? 0) * 60 * s; sh = [x + dir * bw * .47, cy + bh * .06]; u = 100 * s;
  } else if (who === 'press') {
    const gr = groove(t, (o.dance ?? .7) * 1.3, (o.phase ?? 0) + .5), r = 90 * s;
    const cy = y - 50 * s - r * (1 - gr.sq) + gr.bob * .9 * s - (o.jump ?? 0) * 80 * s; sh = [x + dir * r * .92, cy + r * .14]; u = 80 * s;
  } else {
    const gr = groove(t, (o.dance ?? .5) * .8, (o.phase ?? 0) + .75), bw = 250 * s * (1 + gr.sq * .6), bh = 272 * s * (1 - gr.sq * .5);
    const cy = y - 56 * s - bh / 2 + gr.bob * .4 * s - (o.jump ?? 0) * 50 * s; sh = [x + dir * bw * .5, cy - bh * .08]; u = 110 * s;
  }
  // undo the lean: the target in the character's own unturned frame
  const c = Math.cos(-lean), sn = Math.sin(-lean), dx = target[0] - x, dy = target[1] - y;
  const tx = x + dx * c - dy * sn, ty = y + dx * sn + dy * c;
  return { to: [(tx - sh[0]) * dir / u, (ty - sh[1]) / u], pose: o.pose || 'grip', ang: o.ang };
}
