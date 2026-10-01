// The testing crew, a vaudeville trio billed as PRESS, STRESS & GUESS, and the wind-up checks.
//  Guess: tall, rose, a monocle and a question mark for an antenna that straightens into "!" on a
//    clue. The one who second-guesses; carries the magnifying glass and the notebook.
//  Press: small, round, teal, a push-button on his head and a finger always ready. Presses things.
//  Stress: a big brass boiler with a pressure gauge on his belly and a whistle on top. Shakes, loads
//    and leans on things till they show what they're made of.
//  A check: a little tin wind-up toy. One rule card on its chest, one flag. It can't wonder.
import { TAU, clamp, lerp, now, hash, noise } from './kit.js';
import { INK, WHITE, CREAM, TEAL, TEAL_SH, ROSE, ROSE_SH, PLUM, OCHRE, OCHRE_SH, GOLD, RED, RED_SH, GREEN, GREEN_SH, GREY, SLATE, MINT, C } from './palette.js';
import { shape, line, stroke, rrect, ellipse, spline, xf, pieEye, dot, hose, glove, shoe, paint } from './ink.js';
import { blinkAt, arm, leg, mouth, groove } from './rig.js';

// Shared arm handling: `spec` is a pose name, or {to: [dx, dy] (in units of u from the shoulder), pose, ang}.
const POSES = {
  hang: [[.2, 1.1], 'open'], hips: [[.45, .35], 'fist'], up: [[.5, -1.3], 'wave'], out: [[1.25, 0], 'open'],
  present: [[1.1, -.6], 'open'], point: [[1.35, -.35], 'point'], hold: [[.9, .1], 'grip'], cheer: [[.35, -1.5], 'fist'],
  chin: [[-.45, -.45], 'fist'], shrug: [[.75, -.45], 'open'], down: [[.6, .8], 'open'], press: [[1.3, .2], 'point'],
};
function limbs(g, o, sh, u, gs, seed, fill) {
  const hands = {};
  for (const [k, dir] of [['L', -1], ['R', 1]]) {
    const spec = o[k] || 'hang';
    const sp = typeof spec === 'string' ? { to: POSES[spec][0], pose: POSES[spec][1] } : spec;
    const s0 = sh[k];
    hands[k] = { x: s0[0] + dir * sp.to[0] * u, y: s0[1] + sp.to[1] * u, pose: sp.pose || 'open', ang: sp.ang, s0, dir };
  }
  return hands;
}
function drawArms(g, hands, o, s, gs, seed) {
  for (const k of ['L', 'R']) {
    const h = hands[k];
    const ang = h.ang ?? Math.atan2(h.y - h.s0[1], h.x - h.s0[0]);
    arm(g, h.s0[0], h.s0[1], h.x, h.y, { w: 12 * s, gs: gs * s, pose: h.pose, ang, flip: h.dir < 0, seed: seed + (h.dir < 0 ? 1 : 2), bend: h.dir * -.2 });
    if (o.hold && o.hold[k]) o.hold[k](g, h.x, h.y, ang, s);
  }
}
function legsOf(g, x, y, hipY, sep, s, o, seed, ss = 26) {
  const walk = o.walk;
  for (const d of [-1, 1]) {
    const ph = walk == null ? 0 : Math.sin((walk + (d > 0 ? .5 : 0)) * TAU);
    const fx = x + d * sep * (walk == null ? 1.15 : 1) + (walk == null ? 0 : ph * 20 * s), fy = y - Math.max(0, walk == null ? 0 : -ph) * 18 * s - (o.jump ?? 0) * 60 * s;
    leg(g, x + d * sep * .8, hipY, fx, fy - 8 * s, { w: 13 * s, ss: ss * s, dir: d, seed: seed + d });
  }
}

// ---------------------------------------------------------------- Guess
export function guess(g, x, y, s = 1, o = {}) {
  const t = o.t ?? now(), gr = groove(t, o.dance ?? .6, (o.phase ?? 0) + .25);
  const bw = 150 * s * (1 + gr.sq), bh = 300 * s * (1 - gr.sq * .8);
  const legH = 80 * s, cy = y - legH - bh / 2 + gr.bob * .6 * s - (o.jump ?? 0) * 60 * s;
  const lean = o.lean ?? gr.lean * .8;
  g.save(); g.translate(x, cy + bh / 2); g.rotate(lean); g.translate(-x, -(cy + bh / 2));
  legsOf(g, x, y - (o.jump ?? 0) * 60 * s, cy + bh * .45, bw * .26, s, o, 200);
  const sh = { L: [x - bw * .46, cy + bh * .02], R: [x + bw * .46, cy + bh * .02] };
  const hands = limbs(g, o, sh, 100 * s);
  // antenna: a question mark of wire, straightening into "!" as o.bang goes to 1
  const bang = o.bang ?? 0, ax = x + bw * .05, ay = cy - bh * .5;
  const qm = [[ax, ay], [ax, ay - 30 * s], [ax + 30 * s, ay - 52 * s], [ax + 28 * s, ay - 88 * s], [ax, ay - 104 * s], [ax - 26 * s, ay - 90 * s]];
  const ex = [[ax, ay], [ax, ay - 30 * s], [ax, ay - 55 * s], [ax, ay - 80 * s], [ax, ay - 105 * s], [ax, ay - 125 * s]];
  const A = qm.map((p, i) => [lerp(p[0], ex[i][0], bang), lerp(p[1], ex[i][1], bang)]);
  stroke(g, A, { w: 8 * s, seed: 210, taper: false });
  const bulb = bang > .5 ? [ax, ay + 22 * s] : [ax, ay - 20 * s];
  shape(g, ellipse(ax + noise(t * 3, 5) * 2, cy - bh * .5 - (bang > .5 ? 150 : 128) * s, 13 * s, 13 * s), { fill: bang > .5 ? GOLD : ROSE, w: 5 * s, seed: 211 });
  // body: a tall tin with a domed top
  const P = spline([[x - bw * .5, cy - bh * .3], [x - bw * .34, cy - bh * .5], [x, cy - bh * .54], [x + bw * .34, cy - bh * .5], [x + bw * .5, cy - bh * .3], [x + bw * .52, cy + bh * .2], [x + bw * .48, cy + bh * .5], [x, cy + bh * .52], [x - bw * .48, cy + bh * .5], [x - bw * .52, cy + bh * .2]], true, 6);
  shape(g, P, { fill: o.col || ROSE, shade: ROSE_SH, shadeOff: [-10 * s, -10 * s], w: 8 * s, seed: 220, gloss: { x: .24, y: .1, w: .1, h: .05 } });
  // the seam below the head, with rivets
  stroke(g, [[x - bw * .5, cy - bh * .08], [x, cy - bh * .05], [x + bw * .5, cy - bh * .08]], { w: 5 * s, seed: 221 });
  for (let i = -2; i <= 2; i++) dot(g, x + i * bw * .19, cy - bh * .02, 4 * s);
  // a bow tie
  const bt = cy - bh * .02 + 18 * s;
  shape(g, [[x, bt], [x - 34 * s, bt - 18 * s], [x - 34 * s, bt + 18 * s]], { fill: PLUM, w: 5 * s, seed: 222 });
  shape(g, [[x, bt], [x + 34 * s, bt - 18 * s], [x + 34 * s, bt + 18 * s]], { fill: PLUM, w: 5 * s, seed: 223 });
  shape(g, ellipse(x, bt, 10 * s, 11 * s), { fill: PLUM, w: 4 * s, seed: 224 });
  // face: two eyes with whites, the right one in a monocle; one brow up
  const e = o.eyes || {}, blink = blinkAt(t, 3), fy = cy - bh * .28, face = o.face ?? 0;
  const expr = e.expr || 'open';
  for (const d of [-1, 1]) {
    const X = x + d * bw * .18 + face * 14 * s;
    if (expr === 'happy') { stroke(g, [[X - 16 * s, fy + 4 * s], [X, fy - 12 * s], [X + 16 * s, fy + 4 * s]], { w: 6 * s, seed: 230 + d }); continue; }
    pieEye(g, X, fy, 11 * s, 16 * s, { white: 1.7, lx: e.lx ?? 0, ly: e.ly ?? 0, blink: expr === 'wide' ? 0 : blink, lw: 4 * s, seed: 232 + d });
  }
  // monocle on his right eye (viewer's right) and its chain
  const mx = x + bw * .18 + face * 14 * s;
  g.strokeStyle = C(GOLD); g.lineWidth = 6 * s; g.beginPath(); g.arc(mx, fy, 30 * s, 0, TAU); g.stroke();
  line(g, ellipse(mx, fy, 30 * s, 30 * s, 0, 36), { w: 3 * s, closed: true, seed: 236 });
  stroke(g, [[mx + 18 * s, fy + 24 * s], [mx + 30 * s, fy + 60 * s], [mx + 14 * s, fy + 90 * s]], { w: 2.5 * s, seed: 237, color: OCHRE_SH });
  // brows: the left level, the right cocked
  const up = o.brow ?? .6;
  stroke(g, [[x - bw * .3 + face * 14 * s, fy - 34 * s], [x - bw * .07 + face * 14 * s, fy - 32 * s]], { w: 6 * s, seed: 238 });
  stroke(g, [[x + bw * .06 + face * 14 * s, fy - 38 * s - up * 16 * s], [x + bw * .3 + face * 14 * s, fy - 44 * s - up * 20 * s]], { w: 6 * s, seed: 239 });
  // mouth
  if (o.sing) mouth(g, x + face * 14 * s, fy + 50 * s, 40 * s, typeof o.sing === 'number' ? o.sing : .6, { lw: 4 * s });
  else stroke(g, [[x - 16 * s + face * 14 * s, fy + 48 * s], [x + face * 14 * s, fy + 48 * s + (o.smile ?? .3) * 8 * s], [x + 18 * s + face * 14 * s, fy + 44 * s]], { w: 5 * s, seed: 240 });
  drawArms(g, hands, o, s, 24, 250);
  g.restore();
  return { hands, top: cy - bh / 2 - 150 * s, cy };
}

// ---------------------------------------------------------------- Press
export function press(g, x, y, s = 1, o = {}) {
  const t = o.t ?? now(), gr = groove(t, (o.dance ?? .7) * 1.3, (o.phase ?? 0) + .5);
  const r = 88 * s, legH = 52 * s;
  const cy = y - legH - r * (1 - gr.sq) + gr.bob * .9 * s - (o.jump ?? 0) * 80 * s;
  const lean = o.lean ?? gr.lean;
  g.save(); g.translate(x, cy + r); g.rotate(lean); g.translate(-x, -(cy + r));
  legsOf(g, x, y - (o.jump ?? 0) * 80 * s, cy + r * .75, r * .36, s, o, 300, 24);
  const sh = { L: [x - r * .92, cy + r * .12], R: [x + r * .92, cy + r * .12] };
  const hands = limbs(g, o, sh, 80 * s);
  // the push-button on his head, pressed in by o.pressed
  const pr = o.pressed ?? 0;
  shape(g, rrect(x - 30 * s, cy - r - 10 * s, 60 * s, 20 * s, 6 * s), { fill: GREY, w: 5 * s, seed: 301 });
  shape(g, ellipse(x, cy - r - 16 * s + pr * 12 * s, 22 * s, 16 * s), { fill: RED, shade: RED_SH, shadeOff: [-4 * s, -4 * s], w: 5 * s, seed: 302, gloss: { x: .3, y: .25, w: .14, h: .12 } });
  // body: a ball, a little squashed
  const P = ellipse(x, cy, r * (1 + gr.sq * .5), r * (1 - gr.sq * .4), 0, 48);
  shape(g, P, { fill: o.col || TEAL, shade: TEAL_SH, shadeOff: [-10 * s, -10 * s], w: 8 * s, seed: 310, gloss: { x: .26, y: .2, w: .09, h: .07 } });
  // a band of rivets round his middle
  stroke(g, [[x - r * .98, cy + r * .3], [x, cy + r * .44], [x + r * .98, cy + r * .3]], { w: 5 * s, seed: 311 });
  for (let i = -2; i <= 2; i++) dot(g, x + i * r * .36, cy + r * .43 - Math.abs(i) * r * .04, 4 * s);
  // big eager eyes, a wide grin
  const e = o.eyes || {}, blink = blinkAt(t, 9), fy = cy - r * .22, face = o.face ?? 0;
  for (const d of [-1, 1]) {
    const X = x + d * r * .3 + face * 18 * s;
    if ((e.expr || 'open') === 'happy') { stroke(g, [[X - 16 * s, fy + 6 * s], [X, fy - 10 * s], [X + 16 * s, fy + 6 * s]], { w: 6 * s, seed: 320 + d }); continue; }
    pieEye(g, X, fy, 12 * s, 17 * s, { white: 1.75, lx: e.lx ?? 0, ly: e.ly ?? 0, blink: e.expr === 'wide' ? 0 : blink, lw: 4 * s, seed: 322 + d });
  }
  if (o.sing) mouth(g, x + face * 18 * s, fy + 56 * s, 52 * s, typeof o.sing === 'number' ? o.sing : .6, { lw: 4 * s });
  else { const P2 = spline([[x - 34 * s + face * 18 * s, fy + 42 * s], [x + face * 18 * s, fy + 66 * s], [x + 34 * s + face * 18 * s, fy + 42 * s]], false, 6); stroke(g, P2, { w: 6 * s, seed: 330, raw: true }); }
  drawArms(g, hands, o, s, 23, 340);
  g.restore();
  return { hands, top: cy - r - 30 * s, cy };
}

// ---------------------------------------------------------------- Stress
export function stress(g, x, y, s = 1, o = {}) {
  const t = o.t ?? now(), gr = groove(t, (o.dance ?? .5) * .8, (o.phase ?? 0) + .75);
  const bw = 250 * s * (1 + gr.sq * .6), bh = 270 * s * (1 - gr.sq * .5);
  const legH = 58 * s, cy = y - legH - bh / 2 + gr.bob * .4 * s - (o.jump ?? 0) * 50 * s;
  const lean = o.lean ?? gr.lean * .6, shake = (o.shake ?? 0) * Math.sin(t * 70) * 5 * s;
  g.save(); g.translate(x + shake, cy + bh / 2); g.rotate(lean); g.translate(-x, -(cy + bh / 2));
  legsOf(g, x, y - (o.jump ?? 0) * 50 * s, cy + bh * .44, bw * .28, s, o, 400, 32);
  const sh = { L: [x - bw * .5, cy - bh * .1], R: [x + bw * .5, cy - bh * .1] };
  const hands = limbs(g, o, sh, 110 * s);
  // the whistle on top, and its steam when o.steam > 0
  shape(g, rrect(x - 16 * s, cy - bh * .5 - 46 * s, 32 * s, 50 * s, 6 * s), { fill: GOLD, w: 5 * s, seed: 401 });
  shape(g, ellipse(x, cy - bh * .5 - 48 * s, 22 * s, 8 * s), { fill: GOLD, w: 5 * s, seed: 402 });
  if (o.steam) steam(g, x, cy - bh * .5 - 60 * s, s * (.6 + o.steam * .6), t, o.steam);
  // body: a riveted boiler
  const P = spline([[x - bw * .44, cy - bh * .5], [x, cy - bh * .56], [x + bw * .44, cy - bh * .5], [x + bw * .52, cy - bh * .1], [x + bw * .5, cy + bh * .4], [x, cy + bh * .52], [x - bw * .5, cy + bh * .4], [x - bw * .52, cy - bh * .1]], true, 6);
  shape(g, P, { fill: o.col || OCHRE, shade: OCHRE_SH, shadeOff: [-12 * s, -12 * s], w: 9 * s, seed: 410, gloss: { x: .2, y: .14, w: .08, h: .05 } });
  for (const k of [-.28, .12]) {
    stroke(g, [[x - bw * .5, cy + bh * k], [x, cy + bh * (k + .05)], [x + bw * .5, cy + bh * k]], { w: 5 * s, seed: 411 + k });
    for (let i = -3; i <= 3; i++) dot(g, x + i * bw * .13, cy + bh * (k + .05) - Math.abs(i) * 3 * s + 10 * s, 3.8 * s);
  }
  // the pressure gauge on his belly
  const gx = x, gy = cy + bh * .3, gr2 = 44 * s;
  shape(g, ellipse(gx, gy, gr2 + 8 * s, gr2 + 8 * s), { fill: GOLD, w: 6 * s, seed: 420 });
  shape(g, ellipse(gx, gy, gr2, gr2), { fill: CREAM, w: 4 * s, seed: 421 });
  for (let i = 0; i <= 6; i++) { const a = Math.PI * (.8 + i / 6 * 1.4); stroke(g, [[gx + Math.cos(a) * gr2 * .72, gy + Math.sin(a) * gr2 * .72], [gx + Math.cos(a) * gr2 * .9, gy + Math.sin(a) * gr2 * .9]], { w: 3 * s, seed: 422 + i, color: i > 4 ? RED : INK }); }
  const needle = Math.PI * (.8 + clamp(o.gauge ?? .3) * 1.4) + (o.gauge > .85 ? Math.sin(t * 40) * .06 : 0);
  stroke(g, [[gx, gy], [gx + Math.cos(needle) * gr2 * .8, gy + Math.sin(needle) * gr2 * .8]], { w: 5 * s, seed: 430, color: RED, taper: false });
  dot(g, gx, gy, 6 * s);
  // face: small deep-set eyes under one heavy brow, a walrus moustache
  const e = o.eyes || {}, blink = blinkAt(t, 13), fy = cy - bh * .3, face = o.face ?? 0;
  for (const d of [-1, 1]) pieEye(g, x + d * bw * .15 + face * 16 * s, fy, 11 * s, 15 * s, { lx: e.lx ?? 0, ly: e.ly ?? 0, blink: e.expr === 'shut' ? 1 : blink, white: e.expr === 'wide' ? 1.6 : 0, lw: 4 * s, seed: 440 + d });
  stroke(g, [[x - bw * .3 + face * 16 * s, fy - 26 * s], [x + face * 16 * s, fy - 34 * s - (o.frown ? -8 : 0) * s], [x + bw * .3 + face * 16 * s, fy - 26 * s]], { w: 11 * s, seed: 445 });
  if (o.sing) mouth(g, x + face * 16 * s, fy + 60 * s, 46 * s, typeof o.sing === 'number' ? o.sing : .6, { lw: 4 * s });
  const mo = spline([[x - 70 * s + face * 16 * s, fy + 50 * s], [x - 40 * s + face * 16 * s, fy + 22 * s], [x + face * 16 * s, fy + 32 * s], [x + 40 * s + face * 16 * s, fy + 22 * s], [x + 70 * s + face * 16 * s, fy + 50 * s], [x + 30 * s + face * 16 * s, fy + 44 * s], [x + face * 16 * s, fy + 50 * s], [x - 30 * s + face * 16 * s, fy + 44 * s]], true, 5);
  shape(g, mo, { fill: '#5b3a24', w: 5 * s, seed: 446 });
  drawArms(g, hands, o, s, 32, 450);
  g.restore();
  return { hands, top: cy - bh / 2 - 50 * s, cy };
}
export function steam(g, x, y, s, t, k = 1) {
  for (let i = 0; i < 4; i++) {
    const ph = (t * 1.6 + i / 4) % 1;
    const px = x + Math.sin(ph * 5 + i) * 18 * s, py = y - ph * 130 * s, r = (16 + ph * 30) * s;
    g.globalAlpha = (1 - ph) * .9 * k;
    shape(g, ellipse(px, py, r, r * .8), { fill: WHITE, w: 4 * s, seed: 460 + i + Math.floor(t * 6) * .1 });
    g.globalAlpha = 1;
  }
}

// ---------------------------------------------------------------- a check
// A tin wind-up toy on (x, y): card is a function drawing its rule card on its chest (or text),
// flag: 'up-green' | 'up-red' | 'down' | a number 0..1 raising a flag of colour o.flagCol.
export function check(g, x, y, s = 1, o = {}) {
  const t = o.t ?? now();
  const hop = o.hop ?? 0, tick = o.march ? Math.abs(Math.sin((t * 4 + (o.phase ?? 0)) * Math.PI)) : 0;
  const bw = 90 * s, bh = 118 * s, cy = y - 30 * s - bh / 2 - hop * 40 * s - tick * 5 * s;
  // feet: two little tin blocks
  for (const d of [-1, 1]) shape(g, rrect(x + d * 22 * s - 16 * s, y - 28 * s - (o.march && (Math.floor(t * 4 + (o.phase ?? 0)) % 2 === (d > 0 ? 0 : 1)) ? 8 * s : 0), 32 * s, 26 * s, 6 * s), { fill: SLATE, w: 4 * s, seed: 500 + d, amt: .4 });
  // the key in its back, turning
  const kr = (t * 2.2 + (o.phase ?? 0)) % 1, kx = x + bw * .5 + 10 * s;
  const kw = Math.abs(Math.cos(kr * TAU)) * 26 * s + 4 * s;
  stroke(g, [[x + bw * .4, cy + 6 * s], [kx + 8 * s, cy + 6 * s]], { w: 7 * s, seed: 505, taper: false });
  shape(g, ellipse(kx + 18 * s, cy - 10 * s, kw * .5, 14 * s), { fill: GOLD, w: 4 * s, seed: 506, amt: .3 });
  shape(g, ellipse(kx + 18 * s, cy + 22 * s, kw * .5, 14 * s), { fill: GOLD, w: 4 * s, seed: 507, amt: .3 });
  // body: a tin can with a lid
  shape(g, rrect(x - bw / 2, cy - bh / 2, bw, bh, 16 * s), { fill: o.col || '#9fb4b2', shade: '#6f8785', shadeOff: [-7 * s, -7 * s], w: 6 * s, seed: 510 + (o.seed ?? 0), gloss: { x: .2, y: .1, w: .1, h: .06 } });
  shape(g, rrect(x - bw / 2 - 5 * s, cy - bh / 2 - 12 * s, bw + 10 * s, 20 * s, 8 * s), { fill: '#7f9795', w: 5 * s, seed: 511 });
  // eyes: two dots, no pie cut, no brows. It doesn't wonder.
  for (const d of [-1, 1]) dot(g, x + d * 17 * s, cy - bh * .24, 6.5 * s);
  stroke(g, [[x - 12 * s, cy - bh * .08], [x + 12 * s, cy - bh * .08]], { w: 4 * s, seed: 512 });
  // the rule card on its chest
  const cw = 70 * s, ch = 48 * s, cx0 = x - cw / 2, cy0 = cy + bh * .02;
  shape(g, rrect(cx0, cy0, cw, ch, 4 * s), { fill: CREAM, w: 4 * s, seed: 513 + (o.seed ?? 0), amt: .4 });
  if (typeof o.card === 'function') o.card(g, x, cy0 + ch / 2, cw, ch, s);
  else if (o.card) { g.save(); g.fillStyle = C(INK); g.font = `${Math.round(22 * s)}px Lilita`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.card, x, cy0 + ch / 2 + 1 * s); g.restore(); }
  // its arm and flag
  const up = typeof o.flag === 'number' ? o.flag : (o.flag || 'up').startsWith('up') ? 1 : 0;
  const col = o.flagCol || (o.flag === 'up-red' ? RED : GREEN);
  const ang = lerp(.9, -1.35, up), ax = x - bw / 2, ay = cy + 4 * s;
  const px = ax + Math.cos(Math.PI + ang * -1) * 0, stick = 104 * s;
  const tx = ax - Math.cos(ang) * 20 * s, ty = ay;
  const hx = ax - 28 * s, hy = ay + lerp(20, -26, up) * s;
  hose(g, [ax + 6 * s, ay], [hx, hy], { w: 8 * s, bend: .2, seed: 520 });
  const sa = lerp(1.3, -1.35, up) + (o.wave ? Math.sin(t * 9 + (o.phase ?? 0)) * .16 : 0);
  const sx2 = hx + Math.cos(-Math.PI / 2 + (sa + 1.35) * .5 - .15) * stick, sy2 = hy + Math.sin(-Math.PI / 2 + (sa + 1.35) * .5 - .15) * stick;
  if (up > .04) stroke(g, [[hx, hy + 14 * s], [sx2, sy2]], { w: 6 * s, seed: 521, taper: false, raw: true });
  const fl = 62 * s, fh = 42 * s, wv = Math.sin(t * 10 + (o.phase ?? 0)) * 6 * s;
  const dxs = (sx2 - hx) / stick, dys = (sy2 - hy) / stick, nx = dys, ny = -dxs;
  const flagPts = spline([[sx2, sy2], [sx2 - nx * fl * .5 + wv * .3, sy2 - ny * fl * .5 + wv], [sx2 - nx * fl, sy2 - ny * fl], [sx2 - nx * fl - dxs * fh * .5, sy2 - ny * fl - dys * fh * .5 + wv * .5], [sx2 - nx * fl * .5 - dxs * fh, sy2 - ny * fl * .5 - dys * fh - wv], [sx2 - dxs * fh, sy2 - dys * fh]], true, 5);
  if (up > .04) shape(g, flagPts.map(([a, b]) => [a, b]), { fill: '!' + col, w: 4.5 * s, seed: 522 });
  glove(g, hx, hy, -Math.PI / 2, 13 * s, 'grip', { seed: 523 });
  return { cy, top: cy - bh / 2 };
}
