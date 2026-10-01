// Clawd, as a song-and-dance man of about 1930. He keeps what makes him Clawd (the wide terracotta
// block, the two tall black eyes, the stubs at his sides and four little legs) and gains what the
// era gave every star: pie-cut eyes, a singing mouth, black hose arms in white gloves, a straw
// boater and a cane, which he swaps for a magnifying glass once he learns to test.
import { TAU, clamp, lerp, now, hash } from './kit.js';
import { INK, WHITE, CLAWD, CLAWD_SH, OCHRE, OCHRE_SH, CORAL, RED, ROSE, BROWN, GOLD, C, sh, lt } from './palette.js';
import { shape, line, stroke, rrect, ellipse, spline, xf, eye, dot, hose, glove, shoe, form, pathOf } from './ink.js';
import { blinkAt, arm, mouth, mouthAt, groove, brows, cheeks, star } from './rig.js';

// Arm poses: the hand's position from the shoulder, in body widths, and the glove.
const POSES = {
  hang: [[.1, .36], 'open'], hips: [[.16, .1], 'fist'], up: [[.26, -.62], 'wave'], wave: [[.32, -.52], 'wave'],
  out: [[.6, -.04], 'open'], present: [[.56, -.3], 'open'], point: [[.68, -.16], 'point'], hold: [[.44, .02], 'grip'],
  chin: [[-.24, -.12], 'fist'], shrug: [[.36, -.24], 'open'], cheer: [[.2, -.74], 'fist'], cover: [[-.2, -.3], 'open'],
  down: [[.34, .3], 'open'], jazz: [[.5, -.42], 'wave'], kiss: [[-.08, .02], 'fist'], tip: [[-.02, -.62], 'grip'],
};

// Clawd standing on (x, y), s = 1 is 300 px wide. o:
//  t, dance (0..1 bounce), eyes {lx, ly, expr: open|happy|wide|worried|smug|shut|star|sad|cross},
//  sing (true follows the voice, or a number 0..1), smile, hat (boater|beanie|helmet|none), hatTip,
//  hatCol, L, R (pose names or {to: [dx, dy] in body widths, pose, ang, behind}), walk (phase),
//  face (-1..1 turn), hold {L, R}: fn(g, x, y, ang, s), squash, lean, jump, blush, col, kick.
export function clawd(g, x, y, s = 1, o = {}) {
  const t = o.t ?? now();
  const gr = groove(t, o.dance ?? .6, o.phase ?? 0);
  const sq = o.squash ?? gr.sq;
  const bw = 300 * s * (1 + sq), bh = 214 * s * (1 - sq * .9);
  const lean = o.lean ?? gr.lean;
  const legH = 54 * s, lift = (o.jump ?? 0) * 60 * s;
  const cy = y - legH - bh / 2 - lift + gr.bob * .5 * s;
  const face = o.face ?? 0, fx = face * 30 * s;
  const col = o.col || CLAWD;
  g.save();
  g.translate(x, y); g.rotate(lean); g.translate(-x, -y);

  // legs: four little hose legs; with walk they step in pairs, with kick one flies up
  const walk = o.walk;
  for (let i = 0; i < 4; i++) {
    const lx = x + (i - 1.5) * bw * .23;
    const ph = walk == null ? 0 : Math.sin((walk + (i % 2) * .5) * TAU);
    let fx2 = lx + (walk == null ? (i - 1.5) * 7 * s : ph * 16 * s), fy = y - lift - Math.max(0, walk == null ? 0 : -ph) * 14 * s;
    if (o.kick && i === 3) { fx2 += 40 * s * o.kick; fy -= 46 * s * o.kick; }
    hose(g, [lx, cy + bh * .42], [fx2, fy - 7 * s], { w: 12 * s, bend: .05, seed: 60 + i });
    shoe(g, fx2 + (i < 2 ? -5 : 5) * s, fy - 6 * s, 19 * s, i < 2 ? -1 : 1, { seed: 70 + i, w: 3 * s });
  }

  // arms come out of the side stubs
  const shL = [x - bw * .52, cy + bh * .08], shR = [x + bw * .52, cy + bh * .08];
  const handOf = (side, spec) => {
    const sp = typeof spec === 'string' ? { to: POSES[spec][0], pose: POSES[spec][1] } : spec;
    const dir = side === 'L' ? -1 : 1, sh0 = side === 'L' ? shL : shR;
    return { x: sh0[0] + dir * sp.to[0] * bw, y: sh0[1] + sp.to[1] * bw, pose: sp.pose || 'open', ang: sp.ang, sh: sh0, dir, behind: sp.behind };
  };
  const hands = { L: handOf('L', o.L || 'hang'), R: handOf('R', o.R || 'hang') };
  const drawArm = h => {
    const ang = h.ang ?? Math.atan2(h.y - h.sh[1], h.x - h.sh[0]);
    arm(g, h.sh[0], h.sh[1], h.x, h.y, { w: 12.5 * s, gs: 25 * s, pose: h.pose, ang, flip: h.dir < 0, seed: h.dir < 0 ? 11 : 17, bend: h.dir * -.22 });
    return ang;
  };
  for (const k of ['L', 'R']) if (hands[k].behind) { const a = drawArm(hands[k]); if (o.hold && o.hold[k]) o.hold[k](g, hands[k].x, hands[k].y, a, s); }

  // the side stubs, behind the body's edge
  for (const d of [-1, 1]) shape(g, rrect(x + d * bw * .5 - (d < 0 ? bw * .07 : 0) - (d > 0 ? bw * .03 : 0), cy - bh * .04, bw * .1, bh * .26, 8 * s), { fill: col, shade: sh(col, .3), form: 'block', w: 7 * s, seed: 30 + d });
  // the body: a soft, wide block
  const P = spline([
    [x - bw * .47, cy - bh * .5], [x, cy - bh * .53], [x + bw * .47, cy - bh * .5],
    [x + bw * .52, cy - bh * .2], [x + bw * .52, cy + bh * .22], [x + bw * .48, cy + bh * .5],
    [x, cy + bh * .53], [x - bw * .48, cy + bh * .5], [x - bw * .52, cy + bh * .22], [x - bw * .52, cy - bh * .2],
  ], true, 6);
  shape(g, P, { fill: col, shade: sh(col, .34), lit: lt(col, .3), form: 'block', k: 1, w: 8 * s, seed: 31, gloss: { x: .16, y: .14, w: .06, h: .05, a: .8 } });
  cheeks(g, x + fx, cy + bh * .12, bw * .31, 24 * s, (o.blush ?? .35));

  // eyes
  const e = o.eyes || {};
  const expr = e.expr || 'open', bl = (expr === 'open' || expr === 'wide' || expr === 'worried' || expr === 'sad') ? blinkAt(t, 7) : 0;
  const ex = bw * .19, eyY = cy - bh * .1, erx = 17 * s, ery = 37 * s;
  for (const d of [-1, 1]) {
    const X = x + d * ex + fx;
    if (expr === 'happy') stroke(g, [[X - erx * 1.15, eyY + 8 * s], [X, eyY - 16 * s], [X + erx * 1.15, eyY + 8 * s]], { w: 8 * s, seed: 40 + d });
    else if (expr === 'shut') stroke(g, [[X - erx * 1.2, eyY + 2 * s], [X, eyY + 6 * s], [X + erx * 1.2, eyY + 2 * s]], { w: 8 * s, seed: 40 + d });
    else if (expr === 'star') star(g, X, eyY, 30 * s, GOLD, { seed: 45 + d, w: 4 * s, rot: Math.sin(t * 6) * .2 });
    else {
      const wide = expr === 'wide';
      eye(g, X, eyY, erx * (wide ? .8 : 1), ery * (wide ? .78 : 1), { lx: e.lx ?? 0, ly: e.ly ?? 0, blink: bl, white: wide ? 1.75 : 0, lw: 4 * s, seed: 42 + d, col, lid: expr === 'smug' ? .48 : expr === 'sad' ? .3 : 0, tilt: expr === 'sad' ? d * -.4 : 0, cutCol: e.cut });
    }
  }
  if (expr === 'worried' || expr === 'sad') brows(g, x + fx, eyY - ery * 1.25, ex, 34 * s, { mood: 1, lw: 6 * s });
  if (expr === 'cross') brows(g, x + fx, eyY - ery * 1.15, ex, 36 * s, { mood: -1, lw: 7 * s });
  if (e.cock) brows(g, x + fx, eyY - ery * 1.2, ex, 34 * s, { cock: e.cock, lw: 6 * s });
  // mouth
  const m = o.sing === true ? mouthAt(t) : (o.sing || o.mouth || 0);
  mouth(g, x + fx, cy + bh * .23, 64 * s, m, { lw: 5 * s, smile: o.smile ?? 1, seed: 49 });

  // hat
  const hat = o.hat ?? 'boater';
  if (hat !== 'none') {
    const tip = o.hatTip ?? 0;
    const hx = x + bw * .08 + face * 12 * s, hy = cy - bh * .5 - 2 * s - tip * 70 * s;
    g.save(); g.translate(hx, hy); g.rotate(-.1 - tip * .5 + (o.hatRot ?? 0));
    if (hat === 'boater') boater(g, 0, 0, s);
    else if (hat === 'beanie') beanie(g, 0, 0, s, o.hatCol || '#7fc4a8', t);
    else if (hat === 'helmet') helmet(g, 0, 0, s);
    g.restore();
  }

  // front arms and what they hold
  for (const k of ['L', 'R']) {
    const h = hands[k];
    if (h.behind) continue;
    const ang = drawArm(h);
    if (o.hold && o.hold[k]) o.hold[k](g, h.x, h.y, ang, s);
  }
  g.restore();
  return { hands, cy, bw, bh, top: cy - bh / 2, eyY, x };
}

// A straw boater sitting on (0, 0): a flat crown with a coral band on a wide brim.
export function boater(g, x, y, s) {
  const brim = ellipse(x, y, 110 * s, 23 * s, 0, 44);
  shape(g, brim, { fill: '#e2b552', shade: '#a77a26', form: 'round', cy: .2, k: .9, w: 6 * s, seed: 51 });
  const crown = spline([[x - 68 * s, y - 2 * s], [x - 70 * s, y - 50 * s], [x, y - 58 * s], [x + 70 * s, y - 50 * s], [x + 68 * s, y - 2 * s], [x, y + 9 * s]], true, 6);
  shape(g, crown, { fill: '#e8be5e', shade: '#a77a26', form: 'block', w: 6 * s, seed: 52 });
  const band = spline([[x - 69 * s, y - 24 * s], [x, y - 17 * s], [x + 69 * s, y - 24 * s], [x + 68 * s, y - 4 * s], [x, y + 6 * s], [x - 68 * s, y - 4 * s]], true, 6);
  shape(g, band, { fill: CORAL, shade: '#a33a20', form: 'block', w: 5 * s, seed: 53 });
  for (let i = 0; i < 6; i++) stroke(g, [[x - 54 * s + i * 21 * s, y - 46 * s], [x - 49 * s + i * 21 * s, y - 32 * s]], { w: 2.2 * s, seed: 54 + i, color: '#a77a26' });
  for (let i = 0; i < 7; i++) stroke(g, [[x - 90 * s + i * 30 * s, y + 6 * s + Math.abs(i - 3) * -2 * s], [x - 82 * s + i * 30 * s, y + 13 * s - Math.abs(i - 3) * 2 * s]], { w: 2 * s, seed: 58 + i, color: '#a77a26' });
}
// A propeller beanie, for a fresh little bot.
export function beanie(g, x, y, s, col, t = 0) {
  const P = spline([[x - 62 * s, y + 4 * s], [x - 58 * s, y - 38 * s], [x, y - 58 * s], [x + 58 * s, y - 38 * s], [x + 62 * s, y + 4 * s], [x, y + 12 * s]], true, 6);
  shape(g, P, { fill: col, form: 'round', w: 6 * s, seed: 61, gloss: { x: .3, y: .25, w: .1, h: .08, dot: false } });
  for (const a of [-.9, 0, .9]) stroke(g, [[x + Math.sin(a) * 60 * s, y + 4 * s], [x + Math.sin(a) * 30 * s, y - 40 * s], [x, y - 56 * s]], { w: 3 * s, seed: 62 + a, color: sh(col, .4) });
  stroke(g, [[x, y - 56 * s], [x, y - 74 * s]], { w: 6 * s, seed: 64, taper: false });
  const spin = Math.cos(t * 26);
  for (const d of [-1, 1]) shape(g, ellipse(x + d * 26 * s * spin, y - 78 * s, Math.abs(28 * s * spin) + 4 * s, 9 * s), { fill: d > 0 ? '#e8524a' : GOLD, w: 4 * s, seed: 65 + d, form: false });
  dot(g, x, y - 78 * s, 6 * s);
}
// A pith helmet, for exploring.
export function helmet(g, x, y, s) {
  shape(g, ellipse(x, y, 100 * s, 22 * s, 0, 40), { fill: '#e6d3a1', shade: '#a68a52', w: 6 * s, seed: 66 });
  shape(g, spline([[x - 66 * s, y - 2 * s], [x - 60 * s, y - 52 * s], [x, y - 74 * s], [x + 60 * s, y - 52 * s], [x + 66 * s, y - 2 * s], [x, y + 8 * s]], true, 6), { fill: '#efdfb0', shade: '#a68a52', w: 6 * s, seed: 67, gloss: { x: .3, y: .25, w: .08, h: .06 } });
  shape(g, spline([[x - 66 * s, y - 14 * s], [x, y - 8 * s], [x + 66 * s, y - 14 * s], [x + 65 * s, y - 2 * s], [x, y + 6 * s], [x - 65 * s, y - 2 * s]], true, 5), { fill: '#7a6a44', w: 4 * s, seed: 68, form: false });
  dot(g, x, y - 74 * s, 7 * s, '#7a6a44');
}

// A cane, held at (x, y) by its crook, hanging along `ang`.
export function cane(g, x, y, ang, s = 1) {
  const L = 250 * s, c = Math.cos(ang), sn = Math.sin(ang);
  stroke(g, [[x, y], [x + c * L, y + sn * L]], { w: 11 * s, seed: 121, taper: false, raw: true });
  stroke(g, [[x, y], [x - sn * 22 * s + c * -18 * s, y + c * 22 * s + sn * -18 * s], [x - sn * 40 * s, y + c * 40 * s]], { w: 11 * s, seed: 122, taper: false });
  line(g, [[x + c * L * .15, y + sn * L * .15], [x + c * L * .9, y + sn * L * .9]], { w: 2.5 * s, seed: 123, color: '#6b5a4a', taper: true });
  shape(g, ellipse(x + c * L, y + sn * L, 9 * s, 9 * s), { fill: WHITE, w: 3 * s, seed: 124, form: false });
}
