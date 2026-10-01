// Clawd, as a 1930s song-and-dance man. He keeps what makes him Clawd (the wide terracotta body,
// the two tall black eyes, the stubs at his sides and four little legs) and gains what the era
// gave every star: white gloves on hose arms, pie-cut eyes, a straw boater and a cane.
import { TAU, clamp, lerp, now, hash } from './kit.js';
import { INK, WHITE, CLAWD, CLAWD_SH, OCHRE, OCHRE_SH, CORAL, RED, ROSE, BROWN, C } from './palette.js';
import { shape, line, stroke, rrect, ellipse, spline, xf, pieEye, dot, hose, glove, shoe } from './ink.js';
import { blinkAt, arm, mouth, groove } from './rig.js';

// Arm poses: the hand's position relative to the shoulder, in body widths, and the glove.
const POSES = {
  hang: [[.12, .38], 'open'], hips: [[.2, .08], 'fist'], up: [[.28, -.62], 'wave'], wave: [[.3, -.55], 'wave'],
  out: [[.62, -.05], 'open'], present: [[.58, -.3], 'open'], point: [[.7, -.18], 'point'], hold: [[.46, .02], 'grip'],
  chin: [[-.25, -.15], 'fist'], shrug: [[.34, -.22], 'open'], cheer: [[.2, -.72], 'fist'], cover: [[-.2, -.3], 'open'],
  down: [[.35, .3], 'open'],
};

// Clawd standing on (x, y), s = 1 is 300 px wide. Options:
//  t, dance (0..1 groove), eyes: {lx, ly, expr: 'open'|'happy'|'wide'|'worried'|'smug'|'closed'|'shut'},
//  sing (mouth 0..1 or true to follow the voice), hat: 'boater'|'none', hatTip (0..1),
//  L, R: arm pose names or {to: [dx, dy] in body widths, pose, ang}, walk (phase), face (-1..1 turn),
//  hold: {R: fn(g, x, y, ang)} draws a prop in a hand, squash, lean, blush.
export function clawd(g, x, y, s = 1, o = {}) {
  const t = o.t ?? now();
  const gr = groove(t, o.dance ?? .6, o.phase ?? 0);
  const bw = 300 * s * (1 + (o.squash ?? gr.sq)), bh = 212 * s * (1 - (o.squash ?? gr.sq) * .9);
  const lean = (o.lean ?? gr.lean);
  const legH = 58 * s, lift = (o.jump ?? 0) * 60 * s;
  const cy = y - legH - bh / 2 - lift + gr.bob * .5 * s;
  const face = o.face ?? 0;
  g.save();
  g.translate(x, cy); g.rotate(lean); g.translate(-x, -cy);

  // legs: four little hose legs; the outer pair step on the beat
  const walk = o.walk;
  for (let i = 0; i < 4; i++) {
    const lx = x + (i - 1.5) * bw * .24;
    const ph = walk == null ? 0 : Math.sin((walk + (i % 2) * .5) * TAU);
    const fx = lx + (walk == null ? (i - 1.5) * 6 * s : ph * 16 * s), fy = y - lift - Math.max(0, walk == null ? 0 : -ph) * 14 * s;
    hose(g, [lx, cy + bh * .42], [fx, fy - 6 * s], { w: 13 * s, bend: .05, seed: 60 + i });
    shoe(g, fx + (i < 2 ? -6 : 6) * s, fy - 5 * s, 20 * s, i < 2 ? -1 : 1, { seed: 70 + i, w: 3 * s });
  }

  // arms: shoulders sit in the side stubs
  const shL = [x - bw * .5, cy + bh * .06], shR = [x + bw * .5, cy + bh * .06];
  const handOf = (side, spec) => {
    const sp = typeof spec === 'string' ? { to: POSES[spec][0], pose: POSES[spec][1] } : spec;
    const dir = side === 'L' ? -1 : 1;
    const sh = side === 'L' ? shL : shR;
    return { x: sh[0] + dir * sp.to[0] * bw, y: sh[1] + sp.to[1] * bw, pose: sp.pose || 'open', ang: sp.ang, sh, dir, behind: sp.behind };
  };
  const hands = { L: handOf('L', o.L || 'hang'), R: handOf('R', o.R || 'hang') };
  const drawArm = h => {
    const ang = h.ang ?? Math.atan2(h.y - h.sh[1], h.x - h.sh[0]);
    arm(g, h.sh[0], h.sh[1], h.x, h.y, { w: 13 * s, gs: 27 * s, pose: h.pose, ang, flip: h.dir < 0, seed: h.dir < 0 ? 11 : 17, bend: h.dir * -.2 });
    return ang;
  };
  for (const k of ['L', 'R']) if (hands[k].behind) drawArm(hands[k]);

  // the body: a soft wide block with its stubs, the rim in shade
  const P = spline([
    [x - bw * .46, cy - bh * .5], [x, cy - bh * .53], [x + bw * .46, cy - bh * .5],
    [x + bw * .5, cy - bh * .08], [x + bw * .58, cy - bh * .06], [x + bw * .6, cy + bh * .16], [x + bw * .5, cy + bh * .18],
    [x + bw * .49, cy + bh * .5], [x, cy + bh * .52], [x - bw * .49, cy + bh * .5],
    [x - bw * .5, cy + bh * .18], [x - bw * .6, cy + bh * .16], [x - bw * .58, cy - bh * .06], [x - bw * .5, cy - bh * .08],
  ], true, 5);
  shape(g, P, { fill: o.col || CLAWD, shade: CLAWD_SH, shadeOff: [-9 * s, -11 * s], w: 8 * s, seed: 31, gloss: { x: .2, y: .16, w: .07, h: .06, a: .75 } });
  if (o.blush) for (const d of [-1, 1]) { g.fillStyle = C('#ef8f86'); g.globalAlpha = .55 * o.blush; g.beginPath(); g.ellipse(x + d * bw * .3 + face * 20 * s, cy + bh * .12, 26 * s, 13 * s, 0, 0, TAU); g.fill(); g.globalAlpha = 1; }

  // eyes
  const e = o.eyes || {};
  const expr = e.expr || 'open', blink = expr === 'open' || expr === 'wide' ? blinkAt(t, 7) : 0;
  const ex = bw * .19, eyY = cy - bh * .12, erx = 15 * s, ery = 34 * s;
  for (const d of [-1, 1]) {
    const X = x + d * ex + face * 28 * s;
    if (expr === 'happy' || expr === 'closed') {
      stroke(g, [[X - erx * 1.1, eyY + (expr === 'happy' ? 6 : 0) * s], [X, eyY - (expr === 'happy' ? 16 : -6) * s], [X + erx * 1.1, eyY + (expr === 'happy' ? 6 : 0) * s]], { w: 7 * s, seed: 40 + d });
    } else if (expr === 'shut') {
      stroke(g, [[X - erx * 1.2, eyY], [X + erx * 1.2, eyY + 2 * s]], { w: 7 * s, seed: 40 + d });
    } else {
      const wide = expr === 'wide';
      pieEye(g, X, eyY, erx * (wide ? 1.15 : 1), ery * (wide ? 1.15 : 1), { lx: e.lx ?? 0, ly: e.ly ?? 0, blink, white: wide ? 1.55 : 0, lw: 4 * s, seed: 42 + d });
      if (expr === 'worried') stroke(g, [[X - erx * 1.4, eyY - ery * 1.2 + d * 7 * s], [X + erx * 1.3, eyY - ery * 1.3 - d * 7 * s]], { w: 6 * s, seed: 46 + d });
      if (expr === 'smug') { g.fillStyle = C(o.col || CLAWD); g.fillRect(X - erx * 1.3, eyY - ery * 1.15, erx * 2.6, ery * .95); stroke(g, [[X - erx * 1.3, eyY - ery * .25], [X + erx * 1.3, eyY - ery * .15]], { w: 6 * s, seed: 48 + d }); }
    }
  }
  // mouth
  const m = o.sing === true ? null : o.sing;
  if (o.sing || o.mouth) {
    const open = o.mouth ?? (m ?? 0);
    mouth(g, x + face * 28 * s, cy + bh * .2, 58 * s, open, { lw: 5 * s, smile: o.smile ?? 1 });
  } else if (o.smile !== 0) {
    const sm = o.smile ?? 1;
    stroke(g, [[x - 26 * s + face * 28 * s, cy + bh * .16 - sm * 4 * s], [x + face * 28 * s, cy + bh * .16 + sm * 10 * s], [x + 26 * s + face * 28 * s, cy + bh * .16 - sm * 4 * s]], { w: 6 * s, seed: 49 });
  }

  // hat
  if ((o.hat ?? 'boater') === 'boater') {
    const tip = o.hatTip ?? 0;
    const hx = x + bw * .1 + face * 10 * s, hy = cy - bh * .5 - 4 * s - tip * 70 * s;
    g.save(); g.translate(hx, hy); g.rotate(-.12 - tip * .5 + (o.hatRot ?? 0));
    boater(g, 0, 0, s);
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
  return { hands, cy, bw, bh, top: cy - bh / 2 };
}

// A straw boater sitting on (0, 0): a flat crown with a coral band on a wide brim.
export function boater(g, x, y, s) {
  const brim = ellipse(x, y, 112 * s, 24 * s, 0, 40);
  shape(g, brim, { fill: OCHRE, shade: OCHRE_SH, shadeOff: [-6 * s, -5 * s], w: 6 * s, seed: 51 });
  const crown = spline([[x - 70 * s, y - 2 * s], [x - 72 * s, y - 52 * s], [x, y - 60 * s], [x + 72 * s, y - 52 * s], [x + 70 * s, y - 2 * s], [x, y + 10 * s]], true, 5);
  shape(g, crown, { fill: OCHRE, shade: OCHRE_SH, shadeOff: [-8 * s, -4 * s], w: 6 * s, seed: 52 });
  const band = spline([[x - 71 * s, y - 24 * s], [x, y - 17 * s], [x + 71 * s, y - 24 * s], [x + 70 * s, y - 4 * s], [x, y + 6 * s], [x - 70 * s, y - 4 * s]], true, 5);
  shape(g, band, { fill: CORAL, w: 5 * s, seed: 53 });
  // straw weave: a few short strokes
  for (let i = 0; i < 5; i++) stroke(g, [[x - 50 * s + i * 24 * s, y - 45 * s], [x - 44 * s + i * 24 * s, y - 32 * s]], { w: 2.5 * s, seed: 54 + i, color: OCHRE_SH });
}

// A cane, held at (x, y) by its crook, hanging along `ang`.
export function cane(g, x, y, ang, s = 1, col = INK) {
  const L = 250 * s, c = Math.cos(ang), sn = Math.sin(ang);
  stroke(g, [[x, y], [x + c * L, y + sn * L]], { w: 11 * s, seed: 121, taper: false, raw: true });
  stroke(g, [[x, y], [x - sn * 22 * s + c * -18 * s, y + c * 22 * s + sn * -18 * s], [x - sn * 40 * s, y + c * 40 * s]], { w: 11 * s, seed: 122, taper: false });
  line(g, [[x + c * L * .15, y + sn * L * .15], [x + c * L * .95, y + sn * L * .95]], { w: 3 * s, seed: 123, color: '#6b5a4a', taper: true });
}
