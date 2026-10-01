// The townsfolk. Mabel, the strongwoman whose workout goes missing, drawn as a 1930s cartoon star;
// and the small parts as animal folk, so each reads at a glance: Pat the tabby cat (the friend in
// the private chat), Sam the puppy (a brand-new account), the goose who shops, and the pupils.
import { TAU, clamp, lerp, now, hash, noise } from './kit.js';
import { INK, WHITE, CREAM, SKIN, SKIN_SH, CORAL, RED, RED_SH, TEAL, TEAL_SH, ROSE, PLUM, OCHRE, BROWN, GOLD, LILAC, C, sh, lt } from './palette.js';
import { shape, line, stroke, rrect, ellipse, spline, xf, eye, dot, hose, glove, shoe, paint, pathOf, bbox, form } from './ink.js';
import { blinkAt, groove, mouth, mouthAt, brows, cheeks, arm, leg } from './rig.js';

const MP = {
  hang: [[.28, 1.0], 'open'], hips: [[.32, .5], 'fist'], flex: [[.95, -.7], 'fist', [.8, .08]], up: [[.3, -1.25], 'open'], cheer: [[.3, -1.3], 'fist'],
  out: [[1.1, .05], 'open'], hold: [[.72, .35], 'grip'], phone: [[.3, -.05], 'grip'], cry: [[-.32, -.55], 'fist'], present: [[1.0, -.45], 'open'],
  lift: [[.62, -1.3], 'grip'], chest: [[.15, -.1], 'grip'], point: [[1.1, -.3], 'point'], hug: [[-.1, .2], 'open'], wave: [[.55, -1.05], 'wave'],
};
// A strong arm: a capsule from shoulder a to elbow e with a bicep swelling on its upper side, a
// forearm tapering to the wrist, or (with no elbow) one soft tube with a bend.
function capsule(a, b, wa, wb, bulge = 0, side = 1) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), nx = -Math.sin(ang), ny = Math.cos(ang), L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const at = (u, off) => [a[0] + (b[0] - a[0]) * u + nx * off, a[1] + (b[1] - a[1]) * u + ny * off];
  const top = [at(0, -wa / 2), at(.3, -wa / 2 - bulge * side * .6), at(.55, -lerp(wa, wb, .55) / 2 - bulge * side), at(.85, -wb / 2 - bulge * side * .3), at(1, -wb / 2)];
  const bot = [at(1, wb / 2), at(.7, lerp(wa, wb, .7) / 2 + bulge * (1 - side) * .2), at(.35, wa / 2), at(0, wa / 2)];
  const capB = [], capA = [];
  for (let i = 1; i < 6; i++) { const q = -Math.PI / 2 + i / 6 * Math.PI; capB.push([b[0] + Math.cos(ang + q) * wb / 2, b[1] + Math.sin(ang + q) * wb / 2]); capA.push([a[0] + Math.cos(ang + Math.PI + q) * wa / 2, a[1] + Math.sin(ang + Math.PI + q) * wa / 2]); }
  return spline([...top, ...capB, ...bot, ...capA], true, 3);
}
function strongArm(g, a, e, h, w, col, seed, dir = 1) {
  if (e) {
    const up = -Math.sign((e[0] - a[0]) * (h[1] - e[1]) - (e[1] - a[1]) * (h[0] - e[0])) || 1;
    shape(g, capsule(e, h, w * .95, w * .78, 0), { fill: col, shade: sh(col, .3), w: Math.max(3, w * .1), seed: seed + 2, k: .8 });
    shape(g, capsule(a, e, w * 1.05, w * .95, w * .42, up), { fill: col, shade: sh(col, .3), w: Math.max(3, w * .1), seed, k: .8, gloss: { x: .4, y: .25, w: .1, h: .06, a: .4, dot: false } });
  } else shape(g, capsule(a, h, w * 1.05, w * .82, w * .12, dir), { fill: col, shade: sh(col, .3), w: Math.max(3, w * .1), seed, k: .8 });
}

// Mabel standing on (x, y); s = 1 is about 600 px tall. o: L, R (poses or {to, pose, elbow}),
// eyes {lx, ly, expr: open|happy|wide|cry|worried}, sing, smile, hold {L, R}, lift (0..1 knees bend).
export function mabel(g, x, y, s = 1, o = {}) {
  const t = o.t ?? now(), gr = groove(t, o.dance ?? .5, (o.phase ?? 0) + .1);
  const lean = o.lean ?? gr.lean * .5, crouch = (o.crouch ?? 0) * 26 * s;
  const hipY = y - 150 * s + gr.bob * .4 * s + crouch, tw = 280 * s, th = 236 * s;
  const cy = hipY - th / 2 + 12 * s;
  g.save(); g.translate(x, y); g.rotate(lean); g.translate(-x, -y);
  // legs and boots
  for (const d of [-1, 1]) {
    const fx = x + d * 72 * s + (o.walk != null ? Math.sin((o.walk + (d > 0 ? .5 : 0)) * TAU) * 18 * s : 0);
    hose(g, [x + d * 52 * s, hipY], [fx, y - 40 * s], { w: 54 * s, bend: d * .06, seed: 600 + d, fill: SKIN, lw: 5 * s });
    shape(g, rrect(fx - 31 * s, y - 70 * s, 62 * s, 52 * s, 12 * s), { fill: BROWN, form: 'block', w: 5 * s, seed: 603 + d });
    shoe(g, fx + d * 4 * s, y - 14 * s, 31 * s, d, { col: BROWN, seed: 605 + d });
  }
  const shY = cy - th * .3;
  const shL = [x - tw * .48, shY], shR = [x + tw * .48, shY];
  const hands = {};
  for (const [k, dir, s0] of [['L', -1, shL], ['R', 1, shR]]) {
    const spec = o[k] || 'hang';
    const sp = typeof spec === 'string' ? { to: MP[spec][0], pose: MP[spec][1], elbow: MP[spec][2] } : spec;
    hands[k] = { x: s0[0] + dir * sp.to[0] * 150 * s, y: s0[1] + sp.to[1] * 150 * s, pose: sp.pose || 'open', dir, s0, behind: sp.behind, ang: sp.ang, el: sp.elbow && [s0[0] + dir * sp.elbow[0] * 150 * s, s0[1] + sp.elbow[1] * 150 * s] };
  }
  const drawArm = (h, k) => {
    const from = h.el || h.s0, ang = h.ang ?? Math.atan2(h.y - from[1], h.x - from[0]);
    strongArm(g, h.s0, h.el, [h.x, h.y], 56 * s, SKIN, 610 + h.dir * 10, h.dir);
    glove(g, h.x, h.y, ang, 28 * s, h.pose, { flip: h.dir < 0, seed: 614 + h.dir });
    if (o.hold && o.hold[k]) o.hold[k](g, h.x, h.y, ang, s);
  };
  for (const k of ['L', 'R']) if (hands[k].behind) drawArm(hands[k], k);
  // torso: a striped leotard over a barrel chest
  const P = spline([[x - tw * .55, cy - th * .38], [x - tw * .2, cy - th * .5], [x + tw * .2, cy - th * .5], [x + tw * .55, cy - th * .38], [x + tw * .42, cy + th * .06], [x + tw * .4, cy + th * .5], [x, cy + th * .56], [x - tw * .4, cy + th * .5], [x - tw * .42, cy + th * .06]], true, 6);
  paint(g, P, CREAM);
  g.save(); pathOf(g, P, true); g.clip();
  for (let i = -4; i < 9; i++) { const yy = cy - th * .52 + i * 33 * s; paint(g, spline([[x - tw, yy], [x, yy + 10 * s], [x + tw, yy], [x + tw, yy + 16 * s], [x, yy + 26 * s], [x - tw, yy + 16 * s]], true, 3), CORAL); }
  g.restore();
  // the leotard's form: shade on the right, a strap over the shoulder
  form(g, P, { fill: CREAM, shade: '#b27a5a', lit: '#fff6e0', form: 'round', cx: .35, cy: .3, k: .7 });
  line(g, P, { w: 8 * s, closed: true, seed: 621 });
  // belt with a buckle
  shape(g, rrect(x - tw * .43, cy + th * .1, tw * .86, 30 * s, 7 * s), { fill: '#2a1e18', form: 'block', w: 4 * s, seed: 622 });
  shape(g, rrect(x - 24 * s, cy + th * .1 - 5 * s, 48 * s, 40 * s, 7 * s), { fill: GOLD, w: 4 * s, seed: 623, gloss: { x: .3, y: .25, w: .14, h: .1, dot: false } });
  // neck and head
  const hx = x + (o.face ?? 0) * 10 * s, hy = cy - th * .5 - 92 * s, hr = 96 * s;
  shape(g, rrect(hx - 30 * s, hy + hr * .62, 60 * s, 46 * s, 12 * s), { fill: SKIN, form: 'block', w: 5 * s, seed: 624 });
  // the back of the bob
  const hair = spline([[hx - hr * 1.12, hy + hr * .42], [hx - hr * 1.16, hy - hr * .5], [hx - hr * .5, hy - hr * 1.14], [hx + hr * .5, hy - hr * 1.14], [hx + hr * 1.16, hy - hr * .5], [hx + hr * 1.12, hy + hr * .42], [hx + hr * .72, hy + hr * .56], [hx - hr * .72, hy + hr * .56]], true, 6);
  shape(g, hair, { fill: '#241a1c', lit: '#5c5060', form: 'round', w: 6 * s, seed: 625, gloss: { x: .32, y: .1, w: .14, h: .045, col: '#8c8296', a: .7, dot: false } });
  const faceP = spline([[hx - hr * .86, hy - hr * .18], [hx - hr * .56, hy - hr * .74], [hx + hr * .56, hy - hr * .74], [hx + hr * .86, hy - hr * .18], [hx + hr * .74, hy + hr * .58], [hx, hy + hr * .92], [hx - hr * .74, hy + hr * .58]], true, 6);
  shape(g, faceP, { fill: SKIN, shade: SKIN_SH, form: 'round', cx: .4, cy: .35, k: .8, w: 7 * s, seed: 626 });
  // fringe with a kiss curl
  shape(g, spline([[hx - hr * .92, hy - hr * .26], [hx - hr * .52, hy - hr * .86], [hx + hr * .52, hy - hr * .86], [hx + hr * .92, hy - hr * .26], [hx + hr * .36, hy - hr * .5], [hx - hr * .04, hy - hr * .44], [hx - hr * .42, hy - hr * .5]], true, 6), { fill: '#241a1c', lit: '#5c5060', form: 'round', w: 5 * s, seed: 627 });
  stroke(g, [[hx - hr * .04, hy - hr * .46], [hx + hr * .12, hy - hr * .3], [hx + hr * .01, hy - hr * .21], [hx - hr * .07, hy - hr * .3]], { w: 5 * s, seed: 628 });
  // the bow
  const bx = hx + hr * .6, by = hy - hr * .96;
  for (const d of [-1, 1]) shape(g, spline([[bx, by], [bx + d * 40 * s, by - 28 * s], [bx + d * 46 * s, by], [bx + d * 38 * s, by + 22 * s]], true, 4), { fill: RED, shade: RED_SH, w: 5 * s, seed: 629 + d, k: .8 });
  shape(g, ellipse(bx, by, 12 * s, 13 * s), { fill: RED, w: 4 * s, seed: 631 });
  // eyes, lashes, cheeks, mouth
  const e = o.eyes || {}, bl = blinkAt(t, 21), ey = hy - hr * .06, expr = e.expr || 'open';
  for (const d of [-1, 1]) {
    const X = hx + d * hr * .34;
    if (expr === 'happy') { stroke(g, [[X - 20 * s, ey + 8 * s], [X, ey - 14 * s], [X + 20 * s, ey + 8 * s]], { w: 7 * s, seed: 632 + d }); }
    else if (expr === 'cry') { stroke(g, [[X - 20 * s, ey - 2 * s], [X, ey + 10 * s], [X + 20 * s, ey - 2 * s]], { w: 7 * s, seed: 632 + d }); }
    else eye(g, X, ey, 12 * s, 21 * s, { white: 1.7, lx: e.lx ?? 0, ly: e.ly ?? 0, blink: bl, lw: 4.5 * s, seed: 634 + d, col: SKIN });
    // lashes
    if (expr !== 'cry') for (let i = 0; i < 3; i++) stroke(g, [[X + d * (10 + i * 7) * s, ey - 30 * s + i * 4 * s], [X + d * (18 + i * 10) * s, ey - 42 * s + i * 7 * s]], { w: 4 * s, seed: 636 + i + d });
  }
  if (expr === 'worried' || expr === 'cry') brows(g, hx, ey - 44 * s, hr * .34, 32 * s, { mood: 1, lw: 5 * s });
  cheeks(g, hx, ey + 40 * s, hr * .55, 22 * s, .5);
  mouth(g, hx, hy + hr * .5, 62 * s, o.sing === true ? mouthAt(t) : (o.sing || 0), { lw: 5 * s, smile: o.smile ?? 1, seed: 640, tongue: '#d9505a' });
  // tears
  if (o.tears) for (const d of [-1, 1]) for (let i = 0; i < 3; i++) { const ph = (t * 1.4 + i / 3 + (d > 0 ? .5 : 0)) % 1; shape(g, ellipse(hx + d * (hr * .34 + 8 * s + ph * 30 * s), ey + 24 * s + ph * 120 * s, 7 * s, 10 * s), { fill: '#9fd6ef', w: 3 * s, seed: 650 + i, form: false }); }
  for (const k of ['L', 'R']) if (!hands[k].behind) drawArm(hands[k], k);
  g.restore();
  return { hands, top: hy - hr * 1.15, head: [hx, hy], hr };
}

// ---------------------------------------------------------------- animal folk
// A small cartoon animal on (x, y), s = 1 is about 360 px tall: kind 'cat' (Pat), 'pup' (Sam),
// 'goose' (the customer), 'bunny', 'piglet' (pupils). o: L, R arm poses ({to: [dx, dy], pose}),
// eyes {lx, ly, expr}, sing, smile, hold, walk.
const AP = { hang: [[.12, .7], 'open'], up: [[.25, -.9], 'wave'], out: [[.8, -.05], 'open'], hold: [[.55, .15], 'grip'], cheer: [[.2, -1], 'fist'], hips: [[.25, .3], 'fist'], phone: [[.35, -.15], 'grip'], point: [[.85, -.2], 'point'], cover: [[-.1, -.5], 'open'] };
const KINDS = {
  cat: { fur: '#e3a25c', belly: '#f6dfba', shirt: TEAL, ear: 'cat', stripes: true, nose: '#d0606b' },
  pup: { fur: '#a8724a', belly: '#f0d6ae', shirt: '#d9b13e', ear: 'pup', nose: INK, cap: '#3d7f7a' },
  goose: { fur: '#f7f1e2', belly: '#ffffff', shirt: LILAC, ear: 'none', bill: '#f0922e', scarf: '#d9506a' },
  bunny: { fur: '#efe6da', belly: '#ffffff', shirt: '#7aa7d8', ear: 'bunny', nose: '#e58a9a' },
  piglet: { fur: '#f2b4b4', belly: '#f8d0cc', shirt: '#9cc28a', ear: 'pig', nose: '#e08c8c' },
};
export function critter(g, x, y, s = 1, o = {}) {
  const t = o.t ?? now(), K = KINDS[o.kind || 'cat'], gr = groove(t, o.dance ?? .55, (o.phase ?? 0) + .3);
  const lean = o.lean ?? gr.lean * .7, face = o.face ?? 0, fxo = face * 14 * s;
  const hipY = y - 70 * s + gr.bob * .5 * s, bodyH = 120 * s, bodyW = 118 * s;
  const cy = hipY - bodyH * .42;
  const hx = x + fxo * .5, hy = cy - bodyH * .5 - 72 * s, hr = 80 * s;
  g.save(); g.translate(x, y); g.rotate(lean); g.translate(-x, -y);
  // legs
  const goose = o.kind === 'goose';
  for (const d of [-1, 1]) {
    const ph = o.walk == null ? 0 : Math.sin((o.walk + (d > 0 ? .5 : 0)) * TAU);
    const fx = x + d * 30 * s + ph * 16 * s, fy = y - Math.max(0, -ph) * 14 * s;
    if (goose) { hose(g, [x + d * 24 * s, hipY], [fx, fy - 10 * s], { w: 10 * s, fill: K.bill, seed: 700 + d, lw: 3.5 * s }); shape(g, spline([[fx - 26 * s, fy], [fx, fy - 18 * s], [fx + 26 * s, fy], [fx, fy + 6 * s]], true, 4), { fill: K.bill, w: 4 * s, seed: 702 + d }); }
    else { hose(g, [x + d * 26 * s, hipY], [fx, fy - 8 * s], { w: 12 * s, seed: 700 + d }); shoe(g, fx, fy - 7 * s, 22 * s, d, { seed: 703 + d }); }
  }
  // tail
  if (o.kind === 'cat') stroke(g, [[x + bodyW * .4, hipY - 10 * s], [x + bodyW * .8, hipY - 30 * s], [x + bodyW * .9, hipY - 90 * s + Math.sin(t * 3) * 10 * s], [x + bodyW * .75, hipY - 120 * s]], { w: 16 * s, seed: 710, taper: true, color: INK }), stroke(g, [[x + bodyW * .4, hipY - 10 * s], [x + bodyW * .8, hipY - 30 * s], [x + bodyW * .9, hipY - 90 * s + Math.sin(t * 3) * 10 * s], [x + bodyW * .75, hipY - 120 * s]], { w: 9 * s, seed: 711, taper: true, color: K.fur });
  if (o.kind === 'pup') stroke(g, [[x + bodyW * .4, hipY - 20 * s], [x + bodyW * .7, hipY - 50 * s + Math.sin(t * 14) * 12 * s]], { w: 14 * s, seed: 712 });
  // arms (behind)
  const sh0 = { L: [x - bodyW * .45, cy - bodyH * .2], R: [x + bodyW * .45, cy - bodyH * .2] };
  const hands = {};
  for (const [k, dir] of [['L', -1], ['R', 1]]) { const spec = o[k] || 'hang'; const sp = typeof spec === 'string' ? { to: AP[spec][0], pose: AP[spec][1] } : spec; hands[k] = { x: sh0[k][0] + dir * sp.to[0] * 110 * s, y: sh0[k][1] + sp.to[1] * 110 * s, pose: sp.pose || 'open', ang: sp.ang, dir, s0: sh0[k] }; }
  // body with a little waistcoat or shirt
  const B = spline([[x - bodyW * .42, cy - bodyH * .5], [x + bodyW * .42, cy - bodyH * .5], [x + bodyW * .56, cy + bodyH * .2], [x + bodyW * .4, cy + bodyH * .55], [x - bodyW * .4, cy + bodyH * .55], [x - bodyW * .56, cy + bodyH * .2]], true, 6);
  shape(g, B, { fill: K.fur, form: 'round', w: 6 * s, seed: 720 });
  if (!goose) shape(g, spline([[x - bodyW * .44, cy - bodyH * .46], [x - bodyW * .12, cy - bodyH * .5], [x - bodyW * .02, cy + bodyH * .1], [x + bodyW * .02, cy + bodyH * .1], [x + bodyW * .12, cy - bodyH * .5], [x + bodyW * .44, cy - bodyH * .46], [x + bodyW * .54, cy + bodyH * .22], [x + bodyW * .36, cy + bodyH * .5], [x - bodyW * .36, cy + bodyH * .5], [x - bodyW * .54, cy + bodyH * .22]], true, 4), { fill: K.shirt, form: 'block', w: 5 * s, seed: 721 });
  else shape(g, ellipse(x, cy + bodyH * .1, bodyW * .5, bodyH * .5), { fill: K.belly, form: 'round', w: 5 * s, seed: 721 });
  for (const k of ['L', 'R']) { const h = hands[k]; const ang = h.ang ?? Math.atan2(h.y - h.s0[1], h.x - h.s0[0]); arm(g, h.s0[0], h.s0[1], h.x, h.y, { w: 11 * s, gs: 17 * s, pose: h.pose, ang, flip: h.dir < 0, seed: 730 + h.dir, bend: h.dir * -.25, fill: goose ? K.fur : undefined }); if (o.hold && o.hold[k]) o.hold[k](g, h.x, h.y, ang, s); }
  // ears behind the head
  if (K.ear === 'cat') for (const d of [-1, 1]) shape(g, [[hx + d * hr * .2, hy - hr * .7], [hx + d * hr * .86, hy - hr * 1.2], [hx + d * hr * .86, hy - hr * .3]], { fill: K.fur, w: 6 * s, seed: 740 + d, k: .6 });
  if (K.ear === 'bunny') for (const d of [-1, 1]) shape(g, ellipse(hx + d * hr * .36, hy - hr * 1.3, hr * .22, hr * .62, d * .2), { fill: K.fur, w: 6 * s, seed: 740 + d, k: .6 });
  if (K.ear === 'pig') for (const d of [-1, 1]) shape(g, [[hx + d * hr * .3, hy - hr * .8], [hx + d * hr * .86, hy - hr * 1.05], [hx + d * hr * .74, hy - hr * .4]], { fill: K.fur, w: 6 * s, seed: 740 + d, k: .6 });
  // head
  const Hd = goose ? ellipse(hx, hy, hr * .78, hr * .86, 0, 40) : spline([[hx - hr, hy - hr * .1], [hx - hr * .7, hy - hr * .8], [hx, hy - hr * .92], [hx + hr * .7, hy - hr * .8], [hx + hr, hy - hr * .1], [hx + hr * .8, hy + hr * .6], [hx, hy + hr * .82], [hx - hr * .8, hy + hr * .6]], true, 6);
  shape(g, Hd, { fill: K.fur, form: 'round', w: 7 * s, seed: 750, k: .8 });
  if (K.stripes) for (const d of [-1, 0, 1]) stroke(g, [[hx + d * hr * .25, hy - hr * .88], [hx + d * hr * .22, hy - hr * .6]], { w: 7 * s, seed: 751 + d, color: '#b06a2c' });
  // muzzle
  if (!goose) shape(g, ellipse(hx + fxo, hy + hr * .3, hr * .55, hr * .4, 0, 30), { fill: K.belly, form: 'round', k: .5, w: 5 * s, seed: 752 });
  if (K.ear === 'pup') for (const d of [-1, 1]) shape(g, spline([[hx + d * hr * .6, hy - hr * .7], [hx + d * hr * 1.25, hy - hr * .5], [hx + d * hr * 1.3, hy + hr * .25], [hx + d * hr * .95, hy + hr * .2]], true, 5), { fill: '#6e4428', w: 6 * s, seed: 760 + d, k: .6 });
  if (o.kind === 'pup' && K.cap) { shape(g, spline([[hx - hr * .9, hy - hr * .5], [hx - hr * .6, hy - hr * 1.08], [hx + hr * .5, hy - hr * 1.12], [hx + hr * .92, hy - hr * .55]], true, 6), { fill: K.cap, form: 'round', w: 6 * s, seed: 762 }); shape(g, ellipse(hx + hr * .7, hy - hr * .55, hr * .55, hr * .14, -.1), { fill: sh(K.cap, .2), w: 5 * s, seed: 763 }); }
  if (goose && K.scarf) shape(g, spline([[hx - hr * .82, hy - hr * .1], [hx - hr * .7, hy - hr * .8], [hx, hy - hr * 1.02], [hx + hr * .7, hy - hr * .8], [hx + hr * .82, hy - hr * .1], [hx + hr * .6, hy - hr * .5], [hx, hy - hr * .7], [hx - hr * .6, hy - hr * .5]], true, 6), { fill: K.scarf, form: 'round', w: 6 * s, seed: 764 });
  // eyes
  const e = o.eyes || {}, bl = blinkAt(t, 30 + (o.kind || '').length), ey = hy - hr * .14, expr = e.expr || 'open';
  for (const d of [-1, 1]) {
    const X = hx + d * hr * .3 + fxo;
    if (expr === 'happy') { stroke(g, [[X - 15 * s, ey + 6 * s], [X, ey - 10 * s], [X + 15 * s, ey + 6 * s]], { w: 6 * s, seed: 770 + d }); continue; }
    eye(g, X, ey, 10 * s, 17 * s, { white: 1.75, lx: e.lx ?? 0, ly: e.ly ?? 0, blink: expr === 'wide' ? 0 : bl, lw: 4 * s, seed: 772 + d, col: K.fur });
  }
  if (expr === 'worried') brows(g, hx + fxo, ey - 32 * s, hr * .3, 24 * s, { mood: 1, lw: 4.5 * s });
  // nose / bill and mouth
  if (goose) {
    shape(g, spline([[hx - hr * .3 + fxo, hy + hr * .2], [hx + fxo, hy + hr * .06], [hx + hr * .3 + fxo, hy + hr * .2], [hx + hr * .26 + fxo, hy + hr * .44], [hx + fxo, hy + hr * .55], [hx - hr * .26 + fxo, hy + hr * .44]], true, 5), { fill: K.bill, w: 5 * s, seed: 780, gloss: { x: .3, y: .2, w: .12, h: .08, dot: false } });
    if (o.sing) mouth(g, hx + fxo, hy + hr * .44, 40 * s, o.sing === true ? mouthAt(t) : o.sing, { lw: 4 * s, seed: 781 });
  } else {
    shape(g, ellipse(hx + fxo, hy + hr * .16, hr * .14, hr * .1), { fill: K.nose, w: 4 * s, seed: 782, form: false });
    mouth(g, hx + fxo, hy + hr * .42, 46 * s, o.sing === true ? mouthAt(t) : (o.sing || 0), { lw: 4 * s, smile: o.smile ?? 1, seed: 783 });
    if (o.kind === 'cat') for (const d of [-1, 1]) for (let i = 0; i < 2; i++) stroke(g, [[hx + d * hr * .35 + fxo, hy + hr * (.26 + i * .1)], [hx + d * hr * .9 + fxo, hy + hr * (.18 + i * .16)]], { w: 2.5 * s, seed: 784 + i + d });
  }
  cheeks(g, hx + fxo, ey + 34 * s, hr * .48, 13 * s, .35);
  // a bow tie for Pat
  if (o.kind === 'cat') for (const d of [-1, 1]) shape(g, [[x, cy - bodyH * .46], [x + d * 26 * s, cy - bodyH * .58], [x + d * 26 * s, cy - bodyH * .34]], { fill: '#2f8f88', w: 4 * s, seed: 790 + d });
  g.restore();
  return { hands, top: hy - hr, head: [hx, hy], hr };
}
