// The people: Mabel, the strongwoman whose workout goes missing, and the small parts (Pat, Sam,
// the customer). Rubber-hose humans: big heads, pie eyes in whites, tube limbs with a bulge.
import { TAU, clamp, lerp, now, hash, noise } from './kit.js';
import { INK, WHITE, CREAM, SKIN, SKIN_SH, CORAL, RED, TEAL, TEAL_SH, ROSE, PLUM, OCHRE, BROWN, GOLD, C } from './palette.js';
import { shape, line, stroke, rrect, ellipse, spline, xf, pieEye, dot, hose, glove, shoe, paint } from './ink.js';
import { blinkAt, groove, mouth } from './rig.js';

const POSES = {
  hang: [[.3, 1.05], 'open'], hips: [[.5, .45], 'fist'], flex: [[.95, -.75], 'fist', [.85, .05]], up: [[.35, -1.25], 'open'], cheer: [[.3, -1.3], 'fist'],
  out: [[1.1, .05], 'open'], hold: [[.75, .35], 'grip'], phone: [[.25, -.05], 'grip'], cry: [[-.35, -.55], 'fist'], present: [[1.0, -.45], 'open'],
  lift: [[.9, -1.15], 'grip'], chest: [[.15, -.1], 'grip'], point: [[1.1, -.3], 'point'],
};
function limb(g, a, b, w, bend, fill, seed) { hose(g, a, b, { w, bend, seed, fill, lw: Math.max(3, w * .1) }); }

// Mabel on (x, y), s = 1 is about 560 px tall.
export function mabel(g, x, y, s = 1, o = {}) {
  const t = o.t ?? now(), gr = groove(t, o.dance ?? .5, (o.phase ?? 0) + .1);
  const lean = o.lean ?? gr.lean * .6;
  const hipY = y - 150 * s + gr.bob * .4 * s, tw = 270 * s, th = 230 * s;
  const cy = hipY - th / 2 + 10 * s;
  g.save(); g.translate(x, y); g.rotate(lean); g.translate(-x, -y);
  // legs and boots
  for (const d of [-1, 1]) {
    const fx = x + d * 70 * s + (o.walk != null ? Math.sin((o.walk + (d > 0 ? .5 : 0)) * TAU) * 18 * s : 0);
    limb(g, [x + d * 52 * s, hipY], [fx, y - 30 * s], 50 * s, d * .05, SKIN, 600 + d);
    shape(g, rrect(fx - 30 * s, y - 62 * s, 60 * s, 44 * s, 10 * s), { fill: BROWN, w: 5 * s, seed: 603 + d });
    shoe(g, fx, y - 14 * s, 30 * s, d, { col: BROWN, seed: 605 + d });
  }
  const sh = { L: [x - tw * .5, cy - th * .3], R: [x + tw * .5, cy - th * .3] };
  const hands = {};
  for (const [k, dir] of [['L', -1], ['R', 1]]) {
    const spec = o[k] || 'hang';
    const sp = typeof spec === 'string' ? { to: POSES[spec][0], pose: POSES[spec][1] } : spec;
    const el = sp.elbow || (typeof spec === 'string' && POSES[spec][2]);
    hands[k] = { x: sh[k][0] + dir * sp.to[0] * 150 * s, y: sh[k][1] + sp.to[1] * 150 * s, pose: sp.pose, dir, s0: sh[k], behind: sp.behind, ang: sp.ang, el: el && [sh[k][0] + dir * el[0] * 150 * s, sh[k][1] + el[1] * 150 * s] };
  }
  const drawArm = h => {
    const from = h.el || h.s0;
    const ang = h.ang ?? Math.atan2(h.y - from[1], h.x - from[0]);
    if (h.el) {
      // an elbow: the upper arm with its bicep bulging, then the forearm
      limb(g, h.s0, h.el, 58 * s, 0, SKIN, 610 + h.dir);
      const mx = (h.s0[0] + h.el[0]) / 2, my = (h.s0[1] + h.el[1]) / 2;
      shape(g, ellipse(mx, my - 24 * s, 46 * s, 34 * s), { fill: SKIN, w: 6 * s, seed: 612 + h.dir, amt: .4 });
      limb(g, h.el, [h.x, h.y], 50 * s, h.dir * .1, SKIN, 616 + h.dir);
      shape(g, ellipse(h.el[0], h.el[1], 27 * s, 27 * s), { fill: SKIN, w: 0, seed: 618 });
    } else limb(g, h.s0, [h.x, h.y], 54 * s, h.dir * -.28, SKIN, 610 + h.dir);
    glove(g, h.x, h.y, ang, 27 * s, h.pose, { flip: h.dir < 0, col: SKIN, seed: 614 + h.dir });
    return ang;
  };
  for (const k of ['L', 'R']) if (hands[k].behind) drawArm(hands[k]);
  // torso: a striped leotard
  const P = spline([[x - tw * .56, cy - th * .4], [x, cy - th * .52], [x + tw * .56, cy - th * .4], [x + tw * .36, cy + th * .08], [x + tw * .38, cy + th * .5], [x, cy + th * .56], [x - tw * .38, cy + th * .5], [x - tw * .36, cy + th * .08]], true, 6);
  shape(g, P, { fill: CREAM, w: 0, seed: 620 });
  g.save(); g.beginPath(); P.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.clip();
  for (let i = -4; i < 8; i++) { const yy = cy - th * .5 + i * 34 * s; paint(g, [[x - tw, yy], [x + tw, yy + 8 * s], [x + tw, yy + 18 * s], [x - tw, yy + 10 * s]], CORAL, { raw: true, off: 0 }); }
  g.restore();
  line(g, P, { w: 8 * s, closed: true, seed: 621 });
  // belt with a buckle
  shape(g, rrect(x - tw * .4, cy + th * .06, tw * .8, 28 * s, 6 * s), { fill: INK, w: 4 * s, seed: 622 });
  shape(g, rrect(x - 22 * s, cy + th * .06 - 4 * s, 44 * s, 36 * s, 6 * s), { fill: GOLD, w: 4 * s, seed: 623 });
  // head
  const hx = x + (o.face ?? 0) * 8 * s, hy = cy - th * .5 - 88 * s, hr = 92 * s;
  shape(g, rrect(hx - 26 * s, hy + hr * .7, 52 * s, 40 * s, 10 * s), { fill: SKIN, w: 5 * s, seed: 624 });
  // hair: a black bob, kiss curl and a red bow
  const hair = spline([[hx - hr * 1.08, hy + hr * .35], [hx - hr * 1.12, hy - hr * .5], [hx - hr * .5, hy - hr * 1.12], [hx + hr * .5, hy - hr * 1.12], [hx + hr * 1.12, hy - hr * .5], [hx + hr * 1.08, hy + hr * .35], [hx + hr * .7, hy + hr * .5], [hx - hr * .7, hy + hr * .5]], true, 6);
  shape(g, hair, { fill: INK, w: 6 * s, seed: 625, gloss: { x: .3, y: .12, w: .12, h: .05, col: '#6d6a74', a: .6 } });
  const face = spline([[hx - hr * .86, hy - hr * .2], [hx - hr * .55, hy - hr * .72], [hx + hr * .55, hy - hr * .72], [hx + hr * .86, hy - hr * .2], [hx + hr * .7, hy + hr * .6], [hx, hy + hr * .9], [hx - hr * .7, hy + hr * .6]], true, 6);
  shape(g, face, { fill: SKIN, shade: SKIN_SH, shadeOff: [-8 * s, -8 * s], w: 7 * s, seed: 626 });
  // fringe with a kiss curl
  shape(g, spline([[hx - hr * .9, hy - hr * .3], [hx - hr * .5, hy - hr * .82], [hx + hr * .5, hy - hr * .82], [hx + hr * .9, hy - hr * .3], [hx + hr * .3, hy - hr * .5], [hx - hr * .1, hy - hr * .42]], true, 6), { fill: INK, w: 5 * s, seed: 627 });
  stroke(g, [[hx - hr * .05, hy - hr * .45], [hx + hr * .12, hy - hr * .3], [hx + hr * .02, hy - hr * .22], [hx - hr * .06, hy - hr * .3]], { w: 5 * s, seed: 628 });
  const bx = hx + hr * .62, by = hy - hr * .92;
  shape(g, [[bx, by], [bx - 38 * s, by - 26 * s], [bx - 38 * s, by + 20 * s]], { fill: RED, w: 5 * s, seed: 629 });
  shape(g, [[bx, by], [bx + 38 * s, by - 26 * s], [bx + 38 * s, by + 20 * s]], { fill: RED, w: 5 * s, seed: 630 });
  shape(g, ellipse(bx, by, 11 * s, 12 * s), { fill: RED, w: 4 * s, seed: 631 });
  // eyes, lashes, cheeks
  const e = o.eyes || {}, blink = blinkAt(t, 21), ey = hy - hr * .05, expr = e.expr || 'open';
  for (const d of [-1, 1]) {
    const X = hx + d * hr * .34;
    if (expr === 'happy') { stroke(g, [[X - 18 * s, ey + 6 * s], [X, ey - 12 * s], [X + 18 * s, ey + 6 * s]], { w: 6 * s, seed: 632 + d }); continue; }
    if (expr === 'cry') { stroke(g, [[X - 18 * s, ey - 4 * s], [X, ey + 8 * s], [X + 18 * s, ey - 4 * s]], { w: 6 * s, seed: 632 + d }); continue; }
    pieEye(g, X, ey, 13 * s, 20 * s, { white: 1.7, lx: e.lx ?? 0, ly: e.ly ?? 0, blink: expr === 'wide' ? 0 : blink, lw: 4 * s, seed: 634 + d });
    for (let i = 0; i < 3; i++) stroke(g, [[X + d * (10 + i * 8) * s, ey - 30 * s], [X + d * (16 + i * 12) * s, ey - 44 * s]], { w: 4 * s, seed: 636 + i + d });
  }
  for (const d of [-1, 1]) { g.fillStyle = C('#ef8f86'); g.globalAlpha = .7; g.beginPath(); g.ellipse(hx + d * hr * .56, hy + hr * .32, 20 * s, 12 * s, 0, 0, TAU); g.fill(); g.globalAlpha = 1; }
  if (expr === 'cry') tears(g, hx, ey, hr, s, t);
  if (o.sing) mouth(g, hx, hy + hr * .48, 58 * s, typeof o.sing === 'number' ? o.sing : .6, { lw: 5 * s, smile: o.smile ?? 1 });
  else {
    const sm = o.smile ?? 1;
    stroke(g, [[hx - 34 * s, hy + hr * .42 - sm * 4 * s], [hx, hy + hr * .42 + sm * 16 * s], [hx + 34 * s, hy + hr * .42 - sm * 4 * s]], { w: 6 * s, seed: 640 });
  }
  for (const k of ['L', 'R']) {
    const h = hands[k];
    if (h.behind) continue;
    const ang = drawArm(h);
    if (o.hold && o.hold[k]) o.hold[k](g, h.x, h.y, ang, s);
  }
  g.restore();
  return { hands, head: [hx, hy], hr };
}
// Cartoon tears: two fountains arcing from the eyes.
export function tears(g, hx, ey, hr, s, t) {
  for (const d of [-1, 1]) for (let i = 0; i < 6; i++) {
    const p = ((t * 2.2 + i / 6) % 1);
    const X = hx + d * hr * .34 + d * p * 120 * s, Y = ey + 10 * s - Math.sin(p * Math.PI) * 50 * s + p * p * 80 * s;
    shape(g, ellipse(X, Y, 9 * s, 12 * s), { fill: '#8fd0e8', w: 3 * s, seed: 650 + i });
  }
}

// A small part: a person from the waist up or whole, told apart by hair and clothes.
// kind: 'pat' | 'sam' | 'me' | 'customer'
export function person(g, x, y, s = 1, o = {}) {
  const t = o.t ?? now(), gr = groove(t, o.dance ?? .4, o.phase ?? 0);
  const k = o.kind || 'pat';
  const look = {
    pat: { top: TEAL, hair: '#c9772b', style: 'curls' },
    sam: { top: OCHRE, hair: INK, style: 'quiff' },
    me: { top: ROSE, hair: BROWN, style: 'bun' },
    customer: { top: PLUM, hair: '#e8e2d6', style: 'hat' },
  }[k];
  const hy = y - 250 * s + gr.bob * .4 * s, hr = 70 * s;
  // body
  const P = spline([[x - 80 * s, y], [x - 90 * s, y - 120 * s], [x - 50 * s, y - 175 * s], [x + 50 * s, y - 175 * s], [x + 90 * s, y - 120 * s], [x + 80 * s, y]], true, 5);
  shape(g, P, { fill: look.top, w: 7 * s, seed: 700 + hash(k.length) * 10 });
  shape(g, rrect(x - 20 * s, hy + hr * .75, 40 * s, 30 * s, 8 * s), { fill: SKIN, w: 5 * s, seed: 701 });
  // hair behind
  if (look.style === 'curls') for (let i = 0; i < 9; i++) { const a = -Math.PI * .1 - i / 8 * Math.PI * .8 - Math.PI * .1; shape(g, ellipse(x + Math.cos(a) * hr * .95, hy + Math.sin(a) * hr * .9, 28 * s, 26 * s), { fill: look.hair, w: 5 * s, seed: 702 + i, amt: .4 }); }
  if (look.style === 'bun') shape(g, ellipse(x, hy - hr * 1.05, 34 * s, 30 * s), { fill: look.hair, w: 5 * s, seed: 703 });
  shape(g, ellipse(x, hy, hr, hr * 1.02), { fill: SKIN, shade: SKIN_SH, shadeOff: [-7 * s, -7 * s], w: 7 * s, seed: 704 });
  if (look.style === 'bun' || look.style === 'quiff') {
    const q = look.style === 'quiff';
    shape(g, spline([[x - hr * .98, hy - hr * .05], [x - hr * .8, hy - hr * .8], [x + (q ? .1 : 0) * hr, hy - hr * (q ? 1.35 : 1.0)], [x + hr * .8, hy - hr * .8], [x + hr * .98, hy - hr * .05], [x + hr * .5, hy - hr * .5], [x - hr * .5, hy - hr * .5]], true, 5), { fill: look.hair, w: 5 * s, seed: 705 });
  }
  if (look.style === 'hat') {
    for (let i = 0; i < 5; i++) shape(g, ellipse(x - hr * .9 + i * hr * .45, hy - hr * .35, 20 * s, 18 * s), { fill: look.hair, w: 4 * s, seed: 706 + i, amt: .3 });
    shape(g, ellipse(x, hy - hr * .72, hr * 1.25, 20 * s), { fill: ROSE, w: 5 * s, seed: 711 });
    shape(g, spline([[x - hr * .7, hy - hr * .75], [x - hr * .6, hy - hr * 1.3], [x + hr * .6, hy - hr * 1.3], [x + hr * .7, hy - hr * .75]], true, 5), { fill: ROSE, w: 5 * s, seed: 712 });
    shape(g, ellipse(x + hr * .45, hy - hr * 1.2, 16 * s, 16 * s), { fill: CREAM, w: 4 * s, seed: 713 });
  }
  const e = o.eyes || {}, blink = blinkAt(t, 30 + k.length);
  for (const d of [-1, 1]) {
    if (e.expr === 'happy') { stroke(g, [[x + d * hr * .36 - 13 * s, hy + 4 * s], [x + d * hr * .36, hy - 9 * s], [x + d * hr * .36 + 13 * s, hy + 4 * s]], { w: 5 * s, seed: 720 + d }); continue; }
    pieEye(g, x + d * hr * .36, hy, 10 * s, 15 * s, { white: 1.7, lx: e.lx ?? 0, ly: e.ly ?? 0, blink: e.expr === 'wide' ? 0 : blink, lw: 3.5 * s, seed: 722 + d });
  }
  if (k === 'customer') for (const d of [-1, 1]) { g.strokeStyle = C(INK); g.lineWidth = 4 * s; g.beginPath(); g.arc(x + d * hr * .36, hy, 24 * s, 0, TAU); g.stroke(); }
  for (const d of [-1, 1]) { g.fillStyle = C('#ef8f86'); g.globalAlpha = .6; g.beginPath(); g.ellipse(x + d * hr * .6, hy + hr * .35, 14 * s, 9 * s, 0, 0, TAU); g.fill(); g.globalAlpha = 1; }
  if (o.sing) mouth(g, x, hy + hr * .5, 40 * s, typeof o.sing === 'number' ? o.sing : .5, { lw: 4 * s });
  else stroke(g, [[x - 22 * s, hy + hr * .45], [x, hy + hr * .45 + (o.smile ?? 1) * 10 * s], [x + 22 * s, hy + hr * .45]], { w: 5 * s, seed: 730 });
  if (o.hold) o.hold(g, x, y - 90 * s, s);
  return { head: [x, hy], hr };
}
