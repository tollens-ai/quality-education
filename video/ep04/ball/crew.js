// The testing crew, a vaudeville trio billed as Press, Stress & Guess, and the wind-up checks.
//  Guess: tall, a tin detective in a violet Inverness coat and a tweed deerstalker, a monocle and a
//    waxed moustache, and a question mark for an antenna that springs straight into "!" on a clue.
//    The one who second-guesses; carries the magnifying glass. (He was a rose tin with a domed
//    head until Qing saw what that silhouette looked like.)
//  Press: small, round, teal, a push-button on his head and a finger always ready. Presses things.
//  Stress: a big brass boiler with a pressure gauge on his belly and a whistle on top. Loads, shakes
//    and squeezes things till they show what they're made of.
//  A check: a little tin wind-up toy. One card on its chest, one flag. Dot eyes, no brows: it can't
//    wonder.
import { TAU, clamp, lerp, now, hash, noise } from './kit.js';
import { INK, WHITE, CREAM, TEAL, TEAL_SH, ROSE, ROSE_SH, PLUM, OCHRE, OCHRE_SH, GOLD, GOLD_SH, RED, RED_SH, GREEN, GREEN_SH, GREY, SLATE, TIN, TIN_SH, C, sh, lt } from './palette.js';
import { shape, line, stroke, rrect, ellipse, spline, xf, eye, dot, hose, glove, shoe, paint, bbox, pathOf } from './ink.js';
// Guess's colours: the coat, its cape's tweed, the tin of his face, the deerstalker
export const GUESS = '#7a58a8', GUESS_FACE = '#d8cbe6', TWEED = '#9a7a4e';
import { blinkAt, arm, leg, mouth, mouthAt, groove, brows, cheeks, pops } from './rig.js';

const POSES = {
  hang: [[.2, 1.1], 'open'], hips: [[.45, .35], 'fist'], up: [[.5, -1.3], 'wave'], out: [[1.25, 0], 'open'],
  present: [[1.1, -.6], 'open'], point: [[1.35, -.35], 'point'], hold: [[.9, .1], 'grip'], cheer: [[.35, -1.5], 'fist'],
  chin: [[-.45, -.45], 'fist'], shrug: [[.75, -.45], 'open'], down: [[.6, .8], 'open'], press: [[1.3, .2], 'point'],
  lift: [[.55, -1.4], 'grip'], hug: [[-.2, .1], 'open'], four: [[.7, -.9], 'four'], two: [[.7, -.9], 'two'],
};
function handsOf(o, shoulders, u) {
  const hands = {};
  for (const [k, dir] of [['L', -1], ['R', 1]]) {
    const spec = o[k] || 'hang';
    const sp = typeof spec === 'string' ? { to: POSES[spec][0], pose: POSES[spec][1] } : spec;
    const s0 = shoulders[k];
    hands[k] = { x: s0[0] + dir * sp.to[0] * u, y: s0[1] + sp.to[1] * u, pose: sp.pose || 'open', ang: sp.ang, s0, dir, behind: sp.behind };
  }
  return hands;
}
function drawArm(g, h, o, k, s, gs, seed, w = 12) {
  const ang = h.ang ?? Math.atan2(h.y - h.s0[1], h.x - h.s0[0]);
  arm(g, h.s0[0], h.s0[1], h.x, h.y, { w: w * s, gs: gs * s, pose: h.pose, ang, flip: h.dir < 0, seed: seed + (h.dir < 0 ? 1 : 2), bend: h.dir * -.22 });
  if (o.hold && o.hold[k]) o.hold[k](g, h.x, h.y, ang, s);
}
function arms(g, hands, o, s, gs, seed, w, front) {
  for (const k of ['L', 'R']) if (!!hands[k].behind !== front) drawArm(g, hands[k], o, k, s, gs, seed, w);
}
function legsOf(g, x, y, hipY, sep, s, o, seed, ss = 26, w = 13) {
  const walk = o.walk;
  for (const d of [-1, 1]) {
    const ph = walk == null ? 0 : Math.sin((walk + (d > 0 ? .5 : 0)) * TAU);
    let fx = x + d * sep * (walk == null ? 1.2 : 1) + (walk == null ? 0 : ph * 20 * s), fy = y - Math.max(0, walk == null ? 0 : -ph) * 18 * s;
    if (o.kick && d > 0) { fx += 50 * s * o.kick; fy -= 60 * s * o.kick; }
    leg(g, x + d * sep * .7, hipY, fx, fy - 8 * s, { w: w * s, ss: ss * s, dir: d, seed: seed + d });
  }
}

// ---------------------------------------------------------------- Guess
export function guess(g, x, y, s = 1, o = {}) {
  const t = o.t ?? now(), gr = groove(t, o.dance ?? .6, (o.phase ?? 0) + .25);
  const bw = 156 * s * (1 + gr.sq), bh = 300 * s * (1 - gr.sq * .8);
  const legH = 86 * s, lift = (o.jump ?? 0) * 60 * s;
  const cy = y - legH - bh / 2 + gr.bob * .6 * s - lift;
  const lean = o.lean ?? gr.lean * .8, face = o.face ?? 0, fx = face * 16 * s;
  g.save(); g.translate(x, y); g.rotate(lean); g.translate(-x, -y);
  legsOf(g, x, y - lift, cy + bh * .45, bw * .26, s, o, 200, 27, 12);
  const shoulders = { L: [x - bw * .47, cy + bh * .06], R: [x + bw * .47, cy + bh * .06] };
  const hands = handsOf(o, shoulders, 100 * s);
  arms(g, hands, o, s, 24, 250, 12, false);
  // the antenna: a question mark of wire that springs into "!" as o.bang goes to 1
  const bang = clamp(o.bang ?? 0), ax = x + bw * .04, ay = cy - bh * .5 + 4 * s;
  const qm = [[ax, ay], [ax, ay - 28 * s], [ax + 30 * s, ay - 52 * s], [ax + 30 * s, ay - 88 * s], [ax, ay - 106 * s], [ax - 28 * s, ay - 92 * s]];
  const ex = [[ax, ay], [ax, ay - 30 * s], [ax, ay - 56 * s], [ax, ay - 82 * s], [ax, ay - 108 * s], [ax, ay - 130 * s]];
  // (with his cap on, the wire comes up through its button)
  if (o.hat !== 'none') for (const P of [qm, ex]) for (const p of P) p[1] -= 30 * s;
  const wob = Math.sin(t * 9) * (1 - bang) * 4 * s;
  const A = qm.map((p, i) => [lerp(p[0], ex[i][0], bang) + wob * i / 5, lerp(p[1], ex[i][1], bang)]);
  stroke(g, A, { w: 7 * s, seed: 210, taper: false });
  const tip = A[A.length - 1];
  const bulbY = bang > .5 ? cy - bh * .5 - 156 * s - (o.hat !== 'none' ? 30 * s : 0) : tip[1];
  shape(g, ellipse(bang > .5 ? ax : tip[0], bang > .5 ? bulbY : tip[1] + 6 * s, 14 * s, 14 * s), { fill: bang > .5 ? GOLD : '#f2a0b2', w: 5 * s, seed: 211, gloss: { x: .3, y: .25, w: .14, h: .12, dot: false } });
  if (bang > .5) for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + t; stroke(g, [[ax + Math.cos(a) * 24 * s, bulbY + Math.sin(a) * 24 * s], [ax + Math.cos(a) * 36 * s, bulbY + Math.sin(a) * 36 * s]], { w: 4 * s, seed: 212 + i, color: GOLD_SH }); }
  // body: a tin detective. A violet Inverness coat, its cape broad over the shoulders; a pale tin face,
  // flat-topped; a tweed deerstalker, its ear flaps down. Broad at the top: a detective's silhouette.
  const col = o.col || GUESS, fc = o.faceCol || GUESS_FACE;
  const headB = cy - bh * .06, headT = cy - bh * .5;
  const body = spline([[x - bw * .43, headB + 8 * s], [x + bw * .43, headB + 8 * s], [x + bw * .47, cy + bh * .2], [x + bw * .54, cy + bh * .45], [x, cy + bh * .52], [x - bw * .54, cy + bh * .45], [x - bw * .47, cy + bh * .2]], true, 6);
  shape(g, body, { fill: col, shade: sh(col, .38), lit: lt(col, .3), form: 'block', w: 8 * s, seed: 220, gloss: { x: .18, y: .12, w: .07, h: .05 } });
  // the coat's brass buttons, and the line where it closes
  stroke(g, [[x + 2 * s, cy + bh * .16], [x, cy + bh * .5]], { w: 3 * s, seed: 219, color: sh(col, .5), taper: false });
  for (let i = 0; i < 3; i++) dot(g, x + 9 * s, cy + bh * (.22 + i * .09), 4.2 * s, GOLD_SH);
  // the cape over the shoulders, wider than the coat, its hem in two soft swags, in a faint tweed check
  const cw = bw * .66, hemY = cy + bh * .15;
  const cape = spline([[x - bw * .3, headB + 2 * s], [x + bw * .3, headB + 2 * s], [x + cw * .9, cy + bh * .0], [x + cw, hemY], [x + cw * .5, hemY + 12 * s], [x, hemY + 2 * s], [x - cw * .5, hemY + 12 * s], [x - cw, hemY], [x - cw * .9, cy + bh * .0]], true, 6);
  shape(g, cape, { fill: sh(col, .1), shade: sh(col, .45), lit: lt(col, .22), form: 'block', w: 7 * s, seed: 226 });
  g.save(); pathOf(g, cape, true); g.clip(); g.globalAlpha *= .22; g.strokeStyle = C(lt(col, .55)); g.lineWidth = 2 * s;
  for (let k = -6; k <= 6; k++) { g.beginPath(); g.moveTo(x + k * 18 * s, headB - 10 * s); g.lineTo(x + k * 18 * s, hemY + 20 * s); g.stroke(); }
  for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(x - cw, headB + k * 16 * s); g.lineTo(x + cw, headB + k * 16 * s); g.stroke(); }
  g.restore();
  // the face: a tin can, flat-topped, under the cap
  const head = spline([[x - bw * .46, headB], [x - bw * .48, cy - bh * .3], [x - bw * .44, headT + 6 * s], [x, headT], [x + bw * .44, headT + 6 * s], [x + bw * .48, cy - bh * .3], [x + bw * .46, headB]], true, 6);
  shape(g, head, { fill: fc, shade: sh(fc, .3), lit: lt(fc, .4), form: 'round', cx: .32, cy: .3, w: 8 * s, seed: 221, gloss: { x: .24, y: .3, w: .1, h: .06 } });
  // the collar between them
  shape(g, rrect(x - bw * .4, headB - 6 * s, bw * .8, 18 * s, 8 * s), { fill: sh(col, .3), form: 'block', w: 5 * s, seed: 222 });
  // a bow tie at the neck, mustard
  const bt = headB + 24 * s;
  for (const d of [-1, 1]) shape(g, spline([[x, bt], [x + d * 34 * s, bt - 18 * s], [x + d * 38 * s, bt], [x + d * 34 * s, bt + 18 * s]], true, 4), { fill: '#d9a83c', shade: GOLD_SH, w: 4.5 * s, seed: 223 + d });
  shape(g, ellipse(x, bt, 10 * s, 12 * s), { fill: '#c08a24', w: 4 * s, seed: 225 });
  // the deerstalker: a tweed crown wider than it's tall, a peak over the brow, and its ear flaps down;
  // the antenna comes up through its button
  if (o.hat !== 'none') {
    const capB = headT + 18 * s, capT = headT - 36 * s, cwid = bw * .54;
    // the ear flaps, down: rounded, hanging over where ears would be
    for (const d of [-1, 1]) shape(g, spline([[x + d * cwid * .74, capB - 18 * s], [x + d * cwid * 1.04, capB - 12 * s], [x + d * cwid * 1.08, capB + 22 * s], [x + d * cwid * .96, capB + 44 * s], [x + d * cwid * .8, capB + 30 * s]], true, 5), { fill: sh(TWEED, .08), shade: sh(TWEED, .4), form: 'block', w: 5 * s, seed: 260 + d });
    const crown = spline([[x - cwid, capB], [x - cwid * .96, capB - 30 * s], [x - cwid * .6, capT + 6 * s], [x, capT], [x + cwid * .6, capT + 6 * s], [x + cwid * .96, capB - 30 * s], [x + cwid, capB]], true, 6);
    shape(g, crown, { fill: TWEED, shade: sh(TWEED, .38), lit: lt(TWEED, .3), form: 'round', cx: .35, cy: .3, w: 7 * s, seed: 262 });
    g.save(); pathOf(g, crown, true); g.clip(); g.globalAlpha *= .3; g.strokeStyle = C(sh(TWEED, .5)); g.lineWidth = 2.2 * s;
    for (let k = -5; k <= 5; k++) { g.beginPath(); g.moveTo(x + k * 15 * s, capT - 4 * s); g.lineTo(x + k * 15 * s, capB + 4 * s); g.stroke(); }
    for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(x - cwid, capT + 10 * s + k * 14 * s); g.lineTo(x + cwid, capT + 10 * s + k * 14 * s); g.stroke(); }
    g.restore();
    // the seams to the button, and the peak over the brow
    for (const d of [-1, 0, 1]) stroke(g, [[x + d * cwid * .62, capB - 4 * s], [x + d * cwid * .3, capT + 10 * s], [x, capT + 2 * s]], { w: 2.4 * s, seed: 263 + d, color: sh(TWEED, .5) });
    shape(g, spline([[x - cwid * .82, capB - 4 * s], [x, capB - 10 * s], [x + cwid * .82, capB - 4 * s], [x + cwid * .6, capB + 12 * s], [x, capB + 16 * s], [x - cwid * .6, capB + 12 * s]], true, 5), { fill: sh(TWEED, .12), shade: sh(TWEED, .42), form: 'block', w: 5 * s, seed: 266 });
    dot(g, x, capT + 2 * s, 7 * s, sh(TWEED, .3));

  }
  // face: two big eyes in whites; the right behind a gold monocle; brows; a waxed moustache
  const e = o.eyes || {}, bl = blinkAt(t, 3), fy = cy - bh * .31, expr = e.expr || 'open';
  for (const d of [-1, 1]) {
    const X = x + d * bw * .19 + fx;
    if (expr === 'happy') { stroke(g, [[X - 17 * s, fy + 5 * s], [X, fy - 13 * s], [X + 17 * s, fy + 5 * s]], { w: 6 * s, seed: 230 + d }); continue; }
    eye(g, X, fy, 10 * s, 17 * s, { white: 1.75, lx: e.lx ?? 0, ly: e.ly ?? 0, blink: expr === 'wide' ? 0 : bl, lw: 4 * s, seed: 232 + d, lid: expr === 'smug' ? .4 : 0, col: o.col || GUESS_FACE });
  }
  const mx = x + bw * .19 + fx;
  shape(g, ellipse(mx, fy, 29 * s, 29 * s, 0, 40), { fill: null, w: 5 * s, seed: 236, line: GOLD_SH });
  g.save(); g.strokeStyle = C(GOLD); g.lineWidth = 3 * s; g.beginPath(); g.arc(mx, fy, 29 * s, 0, TAU); g.stroke(); g.restore();
  stroke(g, [[mx + 22 * s, fy + 20 * s], [mx + 34 * s, fy + 58 * s], [mx + 18 * s, fy + 92 * s]], { w: 2.4 * s, seed: 237, color: GOLD_SH });
  brows(g, x + fx, fy - 34 * s, bw * .19, 30 * s, { mood: e.mood ?? 0, cock: o.brow ?? .7, lw: 5.5 * s, seed: 238 });
  // moustache (waxed, curling up) and the mouth under it
  const my = fy + 36 * s;
  if (o.sing) mouth(g, x + fx, my + 16 * s, 40 * s, o.sing === true ? mouthAt(t) : o.sing, { lw: 4 * s, seed: 241 });
  else if ((o.smile ?? .4) !== 0) mouth(g, x + fx, my + 14 * s, 34 * s, 0, { lw: 4 * s, smile: o.smile ?? .4, seed: 241 });
  for (const d of [-1, 1]) stroke(g, [[x + fx + d * 2 * s, my], [x + fx + d * 18 * s, my + 5 * s], [x + fx + d * 33 * s, my - 1 * s], [x + fx + d * 38 * s, my - 13 * s]], { w: 8 * s, seed: 242 + d, color: '#3a1a2c' });
  arms(g, hands, o, s, 24, 250, 12, true);
  g.restore();
  return { hands, top: cy - bh / 2 - 150 * s, cy, eye: [mx, fy] };
}

// ---------------------------------------------------------------- Press
export function press(g, x, y, s = 1, o = {}) {
  const t = o.t ?? now(), gr = groove(t, (o.dance ?? .7) * 1.3, (o.phase ?? 0) + .5);
  const r = 90 * s, legH = 50 * s, lift = (o.jump ?? 0) * 80 * s;
  const cy = y - legH - r * (1 - gr.sq) + gr.bob * .9 * s - lift;
  const lean = o.lean ?? gr.lean, face = o.face ?? 0, fx = face * 20 * s;
  g.save(); g.translate(x, y); g.rotate(lean); g.translate(-x, -y);
  legsOf(g, x, y - lift, cy + r * .72, r * .36, s, o, 300, 24, 12);
  const shoulders = { L: [x - r * .92, cy + r * .14], R: [x + r * .92, cy + r * .14] };
  const hands = handsOf(o, shoulders, 80 * s);
  arms(g, hands, o, s, 23, 340, 12, false);
  // the push-button on his head, pressed in by o.pressed
  const pr = clamp(o.pressed ?? 0);
  shape(g, rrect(x - 30 * s, cy - r - 8 * s, 60 * s, 20 * s, 7 * s), { fill: '#9a978d', form: 'block', w: 5 * s, seed: 301 });
  shape(g, ellipse(x, cy - r - 16 * s + pr * 11 * s, 23 * s, 17 * s), { fill: RED, shade: RED_SH, w: 5 * s, seed: 302, gloss: { x: .3, y: .22, w: .14, h: .12 } });
  // body: a ball, a little squashed
  const P = ellipse(x, cy, r * (1 + gr.sq * .5), r * (1 - gr.sq * .4), 0, 56);
  shape(g, P, { fill: o.col || TEAL, shade: sh(o.col || TEAL, .4), lit: lt(o.col || TEAL, .35), form: 'round', w: 8 * s, seed: 310, gloss: { x: .27, y: .2, w: .09, h: .065 } });
  // a band of rivets round his middle
  stroke(g, [[x - r * .98, cy + r * .3], [x - r * .5, cy + r * .42], [x, cy + r * .46], [x + r * .5, cy + r * .42], [x + r * .98, cy + r * .3]], { w: 5 * s, seed: 311 });
  for (let i = -2; i <= 2; i++) dot(g, x + i * r * .36, cy + r * .54 - Math.abs(i) * r * .05, 4 * s);
  // big eager eyes, a wide grin
  const e = o.eyes || {}, bl = blinkAt(t, 9), fy = cy - r * .24, expr = e.expr || 'open';
  for (const d of [-1, 1]) {
    const X = x + d * r * .31 + fx;
    if (expr === 'happy') { stroke(g, [[X - 17 * s, fy + 6 * s], [X, fy - 11 * s], [X + 17 * s, fy + 6 * s]], { w: 6.5 * s, seed: 320 + d }); continue; }
    eye(g, X, fy, 11 * s, 18 * s, { white: 1.8, lx: e.lx ?? 0, ly: e.ly ?? -.2, blink: expr === 'wide' ? 0 : bl, lw: 4 * s, seed: 322 + d, col: o.col || TEAL, lid: expr === 'smug' ? .4 : 0 });
  }
  if (expr === 'worried') brows(g, x + fx, fy - 34 * s, r * .31, 26 * s, { mood: 1, lw: 5 * s });
  cheeks(g, x + fx, fy + 36 * s, r * .52, 15 * s, .3);
  mouth(g, x + fx, fy + 52 * s, 56 * s, o.sing === true ? mouthAt(t) : (o.sing || 0), { lw: 4.5 * s, seed: 330, smile: o.smile ?? 1.2 });
  arms(g, hands, o, s, 23, 340, 12, true);
  g.restore();
  return { hands, top: cy - r - 30 * s, cy };
}

// ---------------------------------------------------------------- Stress
export function stress(g, x, y, s = 1, o = {}) {
  const t = o.t ?? now(), gr = groove(t, (o.dance ?? .5) * .8, (o.phase ?? 0) + .75);
  const bw = 250 * s * (1 + gr.sq * .6), bh = 272 * s * (1 - gr.sq * .5);
  const legH = 56 * s, lift = (o.jump ?? 0) * 50 * s;
  const cy = y - legH - bh / 2 + gr.bob * .4 * s - lift;
  const lean = o.lean ?? gr.lean * .6, shake = (o.shake ?? 0) * Math.sin(t * 70) * 5 * s, face = o.face ?? 0, fx = face * 18 * s;
  g.save(); g.translate(x + shake, y); g.rotate(lean); g.translate(-x, -y);
  legsOf(g, x, y - lift, cy + bh * .44, bw * .28, s, o, 400, 33, 16);
  const shoulders = { L: [x - bw * .5, cy - bh * .08], R: [x + bw * .5, cy - bh * .08] };
  const hands = handsOf(o, shoulders, 110 * s);
  arms(g, hands, o, s, 32, 450, 18, false);
  // the whistle on top, and its steam
  shape(g, rrect(x - 16 * s, cy - bh * .5 - 46 * s, 32 * s, 50 * s, 6 * s), { fill: GOLD, form: 'block', w: 5 * s, seed: 401 });
  shape(g, ellipse(x, cy - bh * .5 - 48 * s, 23 * s, 8 * s), { fill: GOLD, w: 5 * s, seed: 402 });
  if (o.steam) steam(g, x, cy - bh * .5 - 60 * s, s * (.6 + o.steam * .6), t, o.steam);
  // body: a riveted boiler
  const P = spline([[x - bw * .44, cy - bh * .5], [x, cy - bh * .56], [x + bw * .44, cy - bh * .5], [x + bw * .53, cy - bh * .1], [x + bw * .5, cy + bh * .4], [x, cy + bh * .52], [x - bw * .5, cy + bh * .4], [x - bw * .53, cy - bh * .1]], true, 6);
  shape(g, P, { fill: o.col || OCHRE, shade: sh(o.col || OCHRE, .42), lit: lt(o.col || OCHRE, .45), form: 'round', cx: .34, cy: .28, w: 9 * s, seed: 410, gloss: { x: .2, y: .14, w: .07, h: .05 } });
  for (const k of [-.3, .1]) {
    stroke(g, [[x - bw * .5, cy + bh * k], [x, cy + bh * (k + .05)], [x + bw * .5, cy + bh * k]], { w: 5 * s, seed: 411 + k });
    for (let i = -3; i <= 3; i++) dot(g, x + i * bw * .13, cy + bh * (k + .05) - Math.abs(i) * 3 * s + 10 * s, 3.8 * s);
  }
  // the pressure gauge on his belly
  const gx = x, gy = cy + bh * .3, R = 44 * s;
  shape(g, ellipse(gx, gy, R + 9 * s, R + 9 * s), { fill: GOLD, form: 'round', w: 6 * s, seed: 420 });
  shape(g, ellipse(gx, gy, R, R), { fill: CREAM, form: false, w: 4 * s, seed: 421 });
  g.save(); g.fillStyle = C('#f0b7a8'); g.beginPath(); g.moveTo(gx, gy); g.arc(gx, gy, R * .92, Math.PI * (.8 + 1.0 * 1.4 / 1.4 * .78), Math.PI * 2.2); g.closePath(); g.fill(); g.restore();
  for (let i = 0; i <= 6; i++) { const a = Math.PI * (.8 + i / 6 * 1.4); stroke(g, [[gx + Math.cos(a) * R * .7, gy + Math.sin(a) * R * .7], [gx + Math.cos(a) * R * .9, gy + Math.sin(a) * R * .9]], { w: 3 * s, seed: 422 + i, color: i > 4 ? RED : INK }); }
  const gv = clamp(o.gauge ?? .3), needle = Math.PI * (.8 + gv * 1.4) + (gv > .85 ? Math.sin(t * 40) * .06 : 0);
  stroke(g, [[gx, gy], [gx + Math.cos(needle) * R * .82, gy + Math.sin(needle) * R * .82]], { w: 5 * s, seed: 430, color: RED, taper: false });
  dot(g, gx, gy, 6 * s);
  // face: deep-set eyes under one heavy brow, a walrus moustache
  const e = o.eyes || {}, bl = blinkAt(t, 13), fy = cy - bh * .28, expr = e.expr || 'open';
  for (const d of [-1, 1]) {
    const X = x + d * bw * .15 + fx;
    if (expr === 'happy') { stroke(g, [[X - 14 * s, fy + 4 * s], [X, fy - 10 * s], [X + 14 * s, fy + 4 * s]], { w: 6 * s, seed: 440 + d }); continue; }
    eye(g, X, fy, 11 * s, 16 * s, { lx: e.lx ?? 0, ly: e.ly ?? 0, blink: expr === 'shut' ? 1 : bl, white: expr === 'wide' ? 1.6 : 1.45, lw: 4 * s, seed: 440 + d, col: o.col || OCHRE });
  }
  const fr = o.frown ?? 0;
  shape(g, spline([[x - bw * .32 + fx, fy - 22 * s + fr * 6 * s], [x + fx, fy - 38 * s + fr * 10 * s], [x + bw * .32 + fx, fy - 22 * s + fr * 6 * s], [x + bw * .3 + fx, fy - 14 * s], [x + fx, fy - 26 * s + fr * 10 * s], [x - bw * .3 + fx, fy - 14 * s]], true, 5), { fill: '#5b3a24', w: 4 * s, seed: 445, form: false });
  if (o.sing) mouth(g, x + fx, fy + 62 * s, 48 * s, o.sing === true ? mouthAt(t) : o.sing, { lw: 4 * s, seed: 447 });
  const mo = spline([[x - 72 * s + fx, fy + 52 * s], [x - 42 * s + fx, fy + 22 * s], [x + fx, fy + 32 * s], [x + 42 * s + fx, fy + 22 * s], [x + 72 * s + fx, fy + 52 * s], [x + 30 * s + fx, fy + 46 * s], [x + fx, fy + 52 * s], [x - 30 * s + fx, fy + 46 * s]], true, 5);
  shape(g, mo, { fill: '#6a4329', shade: '#3e2414', w: 5 * s, seed: 446, k: .6 });
  arms(g, hands, o, s, 32, 450, 18, true);
  g.restore();
  return { hands, top: cy - bh / 2 - 50 * s, cy };
}
export function steam(g, x, y, s, t, k = 1) {
  for (let i = 0; i < 4; i++) {
    const ph = (t * 1.6 + i / 4) % 1;
    const px = x + Math.sin(ph * 5 + i) * 18 * s, py = y - ph * 130 * s, r = (16 + ph * 30) * s;
    g.save(); g.globalAlpha *= (1 - ph) * .9 * k;
    shape(g, ellipse(px, py, r, r * .8), { fill: WHITE, w: 4 * s, seed: 460 + i + Math.floor(t * 6) * .1, k: .4 });
    g.restore();
  }
}

// ---------------------------------------------------------------- a check
// A tin wind-up toy on (x, y). o: card (fn(g, x, y, w, h, s) drawing its card's picture), flag
// ('up-green' | 'up-red' | 'down' | a number 0..1 raising a flag of colour o.flagCol), march, hop,
// wave, phase, look (-1..1 eyes), key (turn speed).
export function check(g, x, y, s = 1, o = {}) {
  const t = o.t ?? now();
  const hop = o.hop ?? 0, tick = o.march ? Math.abs(Math.sin((t * 4 + (o.phase ?? 0)) * Math.PI)) : 0;
  const sq = o.squash ?? 0, bw = 92 * s * (1 + sq * .5), bh = 118 * s * (1 - sq * .4), cy = y - 30 * s - bh / 2 - hop * 40 * s - tick * 5 * s;
  // feet: two little tin blocks
  for (const d of [-1, 1]) shape(g, rrect(x + d * 23 * s - 16 * s, y - 28 * s - (o.march && (Math.floor(t * 4 + (o.phase ?? 0)) % 2 === (d > 0 ? 0 : 1)) ? 8 * s : 0), 32 * s, 26 * s, 7 * s), { fill: SLATE, form: 'block', w: 4 * s, seed: 500 + d, amt: .3 });
  // the key in its back, turning
  const kr = (t * (o.key ?? 2.2) + (o.phase ?? 0)) % 1, kx = x + bw * .5 + 10 * s;
  const kw = Math.abs(Math.cos(kr * TAU)) * 26 * s + 4 * s;
  stroke(g, [[x + bw * .4, cy + 6 * s], [kx + 8 * s, cy + 6 * s]], { w: 7 * s, seed: 505, taper: false });
  for (const d of [-1, 1]) shape(g, ellipse(kx + 18 * s, cy + 6 * s + d * 16 * s, kw * .5, 14 * s), { fill: GOLD, w: 4 * s, seed: 506 + d, amt: .2, k: .7 });
  // body: a tin can with a lid
  const col = o.col || TIN;
  shape(g, rrect(x - bw / 2, cy - bh / 2, bw, bh, 18 * s), { fill: col, shade: sh(col, .38), lit: lt(col, .45), form: 'block', w: 6 * s, seed: 510 + (o.seed ?? 0), gloss: { x: .18, y: .1, w: .1, h: .05 } });
  shape(g, rrect(x - bw / 2 - 6 * s, cy - bh / 2 - 13 * s, bw + 12 * s, 21 * s, 9 * s), { fill: sh(col, .15), form: 'block', w: 5 * s, seed: 511 });
  // an alarm clock's two bells on its head (the screenshot check), the hammer shaking between them
  if (o.bells != null) {
    const ring = o.bells, sh2 = ring * Math.sin(t * 70) * .18, top = cy - bh / 2 - 12 * s;
    for (const d of [-1, 1]) { g.save(); g.translate(x + d * 30 * s, top - 18 * s); g.rotate(d * .35 + sh2); shape(g, spline([[-24 * s, 8 * s], [-20 * s, -14 * s], [0, -24 * s], [20 * s, -14 * s], [24 * s, 8 * s]], true, 5), { fill: GOLD, shade: GOLD_SH, w: 4 * s, seed: 530 + d, gloss: { x: .3, y: .25, w: .12, h: .1, dot: false } }); g.restore(); stroke(g, [[x + d * 18 * s, top], [x + d * 26 * s, top - 10 * s]], { w: 4 * s, seed: 532 + d }); }
    const hx = x + Math.sin(t * 70) * 16 * s * ring;
    stroke(g, [[x, top + 2 * s], [hx, top - 34 * s]], { w: 4 * s, seed: 534, taper: false });
    dot(g, hx, top - 36 * s, 6 * s);
    if (ring > .1) { pops(g, x - 64 * s, top - 30 * s, 18 * s, 3, { a0: Math.PI * .8, span: Math.PI * .4, w: 4 * s }); pops(g, x + 64 * s, top - 30 * s, 18 * s, 3, { a0: -Math.PI * .2, span: Math.PI * .4, w: 4 * s }); }
  }
  // eyes: two dots, no pie cut, no brows. It doesn't wonder.
  const look = (o.look ?? 0) * 6 * s;
  for (const d of [-1, 1]) { dot(g, x + d * 17 * s + look, cy - bh * .25, 7 * s); dot(g, x + d * 17 * s + look - 2 * s, cy - bh * .25 - 3 * s, 2 * s, WHITE); }
  stroke(g, [[x - 12 * s + look, cy - bh * .08], [x + 12 * s + look, cy - bh * .08]], { w: 4 * s, seed: 512 });
  // the card on its chest
  const cw = 78 * s, ch = 56 * s, cx0 = x - cw / 2, cy0 = cy + bh * .0;
  shape(g, rrect(cx0, cy0, cw, ch, 5 * s), { fill: CREAM, form: false, w: 4 * s, seed: 513 + (o.seed ?? 0), amt: .3 });
  if (typeof o.card === 'function') { g.save(); g.beginPath(); g.rect(cx0 + 2 * s, cy0 + 2 * s, cw - 4 * s, ch - 4 * s); g.clip(); o.card(g, x, cy0 + ch / 2, cw, ch, s); g.restore(); }
  // its arm and flag
  const up = typeof o.flag === 'number' ? clamp(o.flag) : (o.flag || 'up').startsWith('up') ? 1 : 0;
  const fc = o.flagCol || (o.flag === 'up-red' ? RED : GREEN);
  const ax = x - bw / 2, ay = cy + 4 * s, stick = 104 * s;
  const hx = ax - 28 * s, hy = ay + lerp(20, -26, up) * s;
  hose(g, [ax + 6 * s, ay], [hx, hy], { w: 8 * s, bend: .2, seed: 520 });
  const sa = -Math.PI / 2 + lerp(1.5, 0, up) * .9 + (o.wave ? Math.sin(t * 9 + (o.phase ?? 0)) * .14 : 0) - .1;
  const sx2 = hx + Math.cos(sa) * stick, sy2 = hy + 14 * s + Math.sin(sa) * stick;
  if (up > .04) {
    stroke(g, [[hx, hy + 14 * s], [sx2, sy2]], { w: 6 * s, seed: 521, taper: false, raw: true });
    const fl = 64 * s, fh = 44 * s, wv = Math.sin(t * 10 + (o.phase ?? 0)) * 6 * s;
    const dxs = Math.cos(sa), dys = Math.sin(sa), nx = dys, ny = -dxs;
    // a flag, not a leaf: straight along the stick, its top and bottom edges waving, a notch in its fly
    const A = [sx2, sy2], B = [sx2 - nx * fl, sy2 - ny * fl], Cc = [B[0] - dxs * fh, B[1] - dys * fh], D = [sx2 - dxs * fh, sy2 - dys * fh];
    const F = [], edge = (p, q, bulge, n0, k0 = 0) => { for (let k = k0; k <= 8; k++) { const u = k / 8, bb = Math.sin(u * Math.PI) * bulge; F.push([lerp(p[0], q[0], u) + n0[0] * bb, lerp(p[1], q[1], u) + n0[1] * bb]); } };
    edge(A, B, wv * .9, [dxs, dys]);
    F.push([(B[0] + Cc[0]) / 2 + nx * fl * .2, (B[1] + Cc[1]) / 2 + ny * fl * .2]);
    edge(Cc, D, -wv * .9, [-dxs, -dys]);
    shape(g, F, { fill: '!' + fc, shade: '!' + sh(fc, .35), lit: '!' + lt(fc, .3), form: 'block', w: 4.5 * s, seed: 522 });
    shape(g, ellipse(sx2, sy2, 6 * s, 6 * s), { fill: GOLD, w: 3 * s, seed: 524, form: false });
  }
  glove(g, hx, hy, -Math.PI / 2, 13 * s, 'grip', { seed: 523 });
  return { cy, top: cy - bh / 2, card: [x, cy0 + ch / 2, cw, ch], flagTip: up > .04 ? [sx2, sy2] : null };
}
