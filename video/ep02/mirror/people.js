// The people the band built apps for, drawn as a 90s anime key animator draws ordinary people:
// real proportions, one clear silhouette each, G-pen outlines, flat cel colour with one shadow
// tone. They wear the film's palette (bone, ink, steel, glass-blue, a little red), so they belong
// to it; their skin is their own.
//
// person(g, x, y, h, spec, pose, t): feet at (x, y), h tall.
//   spec: { skin, hair: {style, col}, top: {type, col, col2}, bottom: {type, col}, sex, build,
//           old, glasses, beard }
//   pose: { turn (-1..1, face to our left or right), expr, armL, armR, phone, lean, tilt }
//   arm types: 'down', 'phone', 'phoneFar', 'cross', 'point', 'wave', 'up', 'hip', 'press'
import { C, TAU, clamp, lerp, mix, noise, twos, hash } from './kit.js';
import { P, ink, gpen } from './pen.js';
import { layer, put } from './world.js';

export const SKIN = {
  a: ['#eccdb3', '#c99b80'], b: ['#d9a882', '#a8775a'], c: ['#b07c5a', '#7f5439'], d: ['#7c5238', '#553523'], e: ['#f1d6c2', '#cfa48c'],
};
export const HAIRC = { black: '#16131b', brown: '#3a2519', auburn: '#6b2a1a', grey: '#bdb7ae', white: '#e8e3da', blonde: '#cfae6e' };

const shade = (col) => mix(col, '#0b0a0e', .32);

export function person(g, x, y, h, sp, po = {}, t = 0) {
  const old = !!sp.old;
  const hh = h / (old ? 6.2 : 6.7);
  const f = sp.sex === 'f', bd = sp.build ?? 1;
  const lw = Math.max(1.8, hh * .045);
  const seed = sp.seed ?? 1;
  const skin = sp.skin || SKIN.a;
  const sil = po.silhouette || 0;
  const S = col => sil > .5 ? '#15131a' : col;
  const rim = po.rim;
  const L = po.light || { x: .5, y: -.8 };
  const sh = (s = 1) => sil > .5 ? null : { dx: L.x * hh * .12 * s, dy: L.y * hh * .12 * s, col: null };
  const inkIt = (p, col, o = {}) => ink(g, p, {
    fill: S(col), line: sil > .5 ? 0 : lw * (o.w ?? 1), seed: seed + (o.k ?? 0), t, corner: o.corner ?? .8,
    shade: sil > .5 || o.noShade ? null : { ...sh(o.sd ?? 1), col: o.sc || shade(col) },
    rim: rim && !o.noRim && sil <= .5 ? { dx: -Math.sign(L.x || 1) * -hh * .06, dy: 0, col: rim } : null,
  });

  g.save();
  g.translate(x, y);
  if (po.tilt) g.rotate(po.tilt);
  // Nobody stands dead still: a slow sway and a breath, different for everyone.
  if (!po.still) {
    g.rotate(noise(t * .7, seed * 3) * .018);
    const br = 1 + .008 * Math.sin(t * 2.4 + seed);
    g.scale(1, br);
  }
  const stoop = old ? .35 : 0;
  // Vertical landmarks (y up is negative).
  const Yhip = -3.35 * hh, Ywaist = -4.15 * hh, Ysh = -5.55 * hh, Ychin = -5.95 * hh, Yhead = -6.5 * hh + stoop * hh * .3;
  const swd = (f ? .8 : .96) * bd * hh, wst = (f ? .52 : .62) * bd * hh, hip = (f ? .74 : .66) * bd * hh;
  const top = sp.top || { type: 'tee', col: C.bone }, bot = sp.bottom || { type: 'trousers', col: C.ink2 };

  // Legs and shoes (a long gown or skirt covers them).
  if (bot.type !== 'gown') {
    for (const s of [-1, 1]) {
      const lx = s * hip * .5, ang = po.stride ? s * po.stride : 0;
      const leg = P().poly([[lx - .24 * hh * s, Yhip], [lx + .26 * hh * s, Yhip], [lx + .18 * hh * s + ang * hh, -.35 * hh], [lx - .12 * hh * s + ang * hh, -.35 * hh]]);
      if (bot.type === 'skirt') {
        inkIt(P().poly([[lx - .12 * hh, -1.9 * hh], [lx + .12 * hh, -1.9 * hh], [lx + .1 * hh + ang * hh, -.35 * hh], [lx - .1 * hh + ang * hh, -.35 * hh]]), skin[0], { k: 1 + s, sc: skin[1] });
      } else inkIt(leg, bot.col, { k: 2 + s });
      inkIt(P().poly([[lx - .2 * hh + ang * hh, -.4 * hh], [lx + .3 * hh * (s > 0 ? 1.3 : .6) + ang * hh, -.4 * hh], [lx + .36 * hh * (s > 0 ? 1.3 : .6) + ang * hh, 0], [lx - .24 * hh + ang * hh, 0]]), sp.shoes || C.ink, { k: 4 + s, noShade: true });
    }
  }
  // Skirt or gown.
  if (bot.type === 'skirt') inkIt(P().poly([[-hip * 1.02, Ywaist + .2 * hh], [hip * 1.02, Ywaist + .2 * hh], [hip * 1.45, -1.9 * hh], [-hip * 1.45, -1.9 * hh]]), bot.col, { k: 6 });
  if (bot.type === 'gown') {
    inkIt(P().S([[-wst, Ywaist], [wst, Ywaist], [hip * 1.3, -2.2 * hh], [hip * 2.2, -.05 * hh], [0, .08 * hh], [-hip * 2.2, -.05 * hh], [-hip * 1.3, -2.2 * hh]]), bot.col, { k: 7, corner: 1.4 });
    for (const s of [-.6, 0, .6]) gpen(g, [[s * hip * .6, Ywaist + hh], [s * hip * 1.6, -.2 * hh]], lw * .8, { col: shade(bot.col), t, seed: seed + s * 10, taper: [.3, .5] });
  } else if (bot.type !== 'skirt') {
    // Trousers' top: hips.
    inkIt(P().poly([[-hip, Yhip - .1 * hh], [-wst, Ywaist + .15 * hh], [wst, Ywaist + .15 * hh], [hip, Yhip - .1 * hh], [hip * .95, Yhip + .6 * hh], [-hip * .95, Yhip + .6 * hh]]), bot.col, { k: 8 });
  }

  // Arms behind the torso (for crossed arms they come in front, below).
  const arms = [['L', -1, po.armL || 'down'], ['R', 1, po.armR || 'down']];
  const armPath = (s, type) => {
    const shx = s * swd * .95, shy = Ysh + .15 * hh;
    let el, hd;
    switch (type) {
      case 'phone': el = [s * swd * 1.05, Ysh + 1.25 * hh]; hd = [s * .35 * hh, Ysh + 1.1 * hh]; break;
      case 'phoneFar': el = [s * swd * 1.3, Ysh + .7 * hh]; hd = [s * swd * 1.1, Ysh - .55 * hh]; break;
      case 'cross': el = [s * swd * 1.05, Ysh + 1.45 * hh]; hd = [-s * swd * .55, Ysh + .95 * hh]; break;
      case 'point': el = [s * swd * 1.7, Ysh + .15 * hh]; hd = [s * swd * 2.5, Ysh - .15 * hh]; break;
      case 'wave': el = [s * swd * 1.5, Ysh - .6 * hh]; hd = [s * swd * 1.6, Ysh - 1.7 * hh]; break;
      case 'up': el = [s * swd * 1.3, Ysh - .9 * hh]; hd = [s * swd * 1.25, Ysh - 2.1 * hh]; break;
      case 'hip': el = [s * swd * 1.65, Ysh + 1.1 * hh]; hd = [s * wst * 1.05, Ywaist + .1 * hh]; break;
      case 'press': el = [s * swd * 1.2, Ysh + .5 * hh]; hd = [s * swd * .7, Ysh - .5 * hh]; break;
      default: el = [s * swd * 1.12, Ysh + 1.3 * hh]; hd = [s * swd * 1.12, Ysh + 2.5 * hh];
    }
    return { sh: [shx, shy], el, hd };
  };
  const limb = (a, b, w0, w1) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, nx = -uy, ny = ux;
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], wm = (w0 + w1) / 2 * 1.06;
    return P().S([[a[0] + nx * w0, a[1] + ny * w0], [m[0] + nx * wm, m[1] + ny * wm], [b[0] + nx * w1, b[1] + ny * w1],
      [b[0] + ux * w1 * .8, b[1] + uy * w1 * .8], [b[0] - nx * w1, b[1] - ny * w1], [m[0] - nx * wm, m[1] - ny * wm],
      [a[0] - nx * w0, a[1] - ny * w0], [a[0] - ux * w0 * .6, a[1] - uy * w0 * .6]], true, .5);
  };
  const sleeve = top.sleeve ?? (top.type === 'tee' ? 'short' : 'long');
  const drawArm = (s, type) => {
    const A_ = armPath(s, type);
    const upperCol = sleeve === 'none' ? skin[0] : top.col;
    inkIt(limb(A_.sh, A_.el, .23 * hh, .19 * hh), upperCol, { k: 10 + s, sc: sleeve === 'none' ? skin[1] : undefined, corner: 1.3 });
    const foreCol = sleeve === 'long' ? top.col : skin[0];
    inkIt(limb(A_.el, A_.hd, .19 * hh, .14 * hh), foreCol, { k: 12 + s, sc: sleeve === 'long' ? undefined : skin[1], corner: 1.3 });
    // A crease at the elbow.
    if (sil < .5 && sleeve === 'long') gpen(g, [[A_.el[0] - .1 * hh, A_.el[1] - .04 * hh], [A_.el[0] + .06 * hh, A_.el[1] + .03 * hh]], lw * .8, { col: shade(top.col), t, seed: seed + 13 + s, taper: [.3, .3] });
    // A cuff, then the hand: a mitten with a thumb, or a pointing finger.
    const [hx, hy] = A_.hd;
    const ang = Math.atan2(A_.hd[1] - A_.el[1], A_.hd[0] - A_.el[0]);
    g.save(); g.translate(hx, hy); g.rotate(ang);
    if (type === 'wave' || type === 'up') {
      inkIt(P().S([[-.1 * hh, -.16 * hh], [.14 * hh, -.18 * hh], [.24 * hh, -.02 * hh], [.14 * hh, .17 * hh], [-.1 * hh, .15 * hh]]), skin[0], { k: 14 + s, sc: skin[1], noRim: true });
      for (let fi = 0; fi < 4; fi++) {
        const fy = -.13 * hh + fi * .085 * hh;
        inkIt(P().S([[.18 * hh, fy - .03 * hh], [.44 * hh, fy - .03 * hh + fi * .005 * hh], [.46 * hh, fy + .02 * hh], [.18 * hh, fy + .035 * hh]], true), skin[0], { k: 60 + fi + s, sc: skin[1], noRim: true, w: .7 });
      }
      inkIt(P().S([[0, -.14 * hh], [.12 * hh, -.32 * hh], [.18 * hh, -.28 * hh], [.1 * hh, -.1 * hh]], true), skin[0], { k: 66 + s, sc: skin[1], noRim: true, w: .7 });
    } else if (type === 'point') {
      inkIt(P().S([[-.1 * hh, -.14 * hh], [.18 * hh, -.13 * hh], [.25 * hh, .05 * hh], [.05 * hh, .16 * hh], [-.12 * hh, .12 * hh]]), skin[0], { k: 14 + s, sc: skin[1], noRim: true });
      inkIt(P().poly([[.15 * hh, -.1 * hh], [.52 * hh, -.08 * hh], [.52 * hh, 0], [.15 * hh, .02 * hh]]), skin[0], { k: 16 + s, sc: skin[1], noRim: true, w: .8 });
    } else {
      inkIt(P().S([[-.08 * hh, -.15 * hh], [.2 * hh, -.16 * hh], [.3 * hh, 0], [.2 * hh, .17 * hh], [-.08 * hh, .15 * hh]]), skin[0], { k: 14 + s, sc: skin[1], noRim: true });
    }
    g.restore();
    return A_;
  };
  const front = [], back = [];
  for (const [n, s, type] of arms) (type === 'cross' || type === 'phone' || type === 'press' ? front : back).push([s, type]);
  const handAt = {};
  for (const [s, type] of back) handAt[s] = drawArm(s, type);

  // Torso and top.
  const torso = P().M(-.28 * hh, Ysh - .2 * hh).Q(-swd * .8, Ysh - .12 * hh, -swd * 1.02, Ysh + .25 * hh).Q(-swd * .95, Ysh + .9 * hh, -wst * 1.05, Ywaist)
    .Q(-hip * 1.02, Ywaist + .5 * hh, -hip * .98, Yhip).L(hip * .98, Yhip).Q(hip * 1.02, Ywaist + .5 * hh, wst * 1.05, Ywaist)
    .Q(swd * .95, Ysh + .9 * hh, swd * 1.02, Ysh + .25 * hh).Q(swd * .8, Ysh - .12 * hh, .28 * hh, Ysh - .2 * hh).Z();
  if (top.type === 'wedding') {
    inkIt(P().poly([[-swd * .9, Ysh + .1 * hh], [swd * .9, Ysh + .1 * hh], [wst, Ywaist], [-wst, Ywaist]]), top.col, { k: 20 });
    // Bare shoulders above a straight neckline.
    inkIt(P().poly([[-swd, Ysh], [-swd * .5, Ysh - .12 * hh], [swd * .5, Ysh - .12 * hh], [swd, Ysh], [swd * .9, Ysh + .12 * hh], [-swd * .9, Ysh + .12 * hh]]), skin[0], { k: 21, sc: skin[1] });
  } else inkIt(torso, top.col, { k: 22 });
  if (sil < .5 && top.type !== 'wedding') {
    gpen(g, [[-wst * .9, Ywaist - .2 * hh], [-wst * .4, Ywaist - .05 * hh]], lw * .8, { col: shade(top.col), t, seed: seed + 29, taper: [.3, .4] });
    gpen(g, [[swd * .6, Ysh + .7 * hh], [swd * .8, Ysh + 1.2 * hh]], lw * .8, { col: shade(top.col), t, seed: seed + 31, taper: [.3, .4] });
  }
  if (top.type === 'cardigan' || top.type === 'suit' || top.type === 'coat') {
    // An open front showing what's under it.
    inkIt(P().poly([[-swd * .28, Ysh - .08 * hh], [swd * .28, Ysh - .08 * hh], [wst * .3, Yhip + .2 * hh], [-wst * .3, Yhip + .2 * hh]]), top.col2 || C.bone, { k: 23, noRim: true });
    if (top.type === 'suit') {
      inkIt(P().poly([[-.07 * hh, Ysh + .05 * hh], [.07 * hh, Ysh + .05 * hh], [.12 * hh, Ywaist + .3 * hh], [0, Ywaist + .5 * hh], [-.12 * hh, Ywaist + .3 * hh]]), top.tie || C.red, { k: 24, noRim: true, w: .8 });
      for (const s of [-1, 1]) inkIt(P().poly([[s * swd * .28, Ysh - .08 * hh], [s * swd * .6, Ysh + .15 * hh], [s * swd * .22, Ysh + 1.3 * hh]]), top.col, { k: 25 + s });
    }
    if (top.type === 'cardigan') for (let i = 0; i < 4; i++) { g.fillStyle = C.bone2; g.beginPath(); g.arc(-swd * .3, Ysh + (.5 + i * .5) * hh, hh * .05, 0, TAU); g.fill(); }
  }
  if (top.type === 'apron') {
    inkIt(P().poly([[-swd * .55, Ysh + .3 * hh], [swd * .55, Ysh + .3 * hh], [hip * 1.05, -1.6 * hh], [-hip * 1.05, -1.6 * hh]]), top.col2 || C.bone, { k: 26 });
    gpen(g, [[-swd * .55, Ysh + .3 * hh], [-swd * .3, Ysh - .1 * hh]], lw * 1.2, { col: C.ink, t, seed: seed + 5 });
    gpen(g, [[swd * .55, Ysh + .3 * hh], [swd * .3, Ysh - .1 * hh]], lw * 1.2, { col: C.ink, t, seed: seed + 6 });
  }
  if (top.type === 'hoodie') inkIt(P().S([[-swd * .75, Ysh - .05 * hh], [0, Ysh + .55 * hh], [swd * .75, Ysh - .05 * hh], [swd * .4, Ysh - .35 * hh], [-swd * .4, Ysh - .35 * hh]]), shade(top.col), { k: 27 });
  if (po.lanyard) {
    gpen(g, [[-swd * .3, Ysh], [0, Ysh + 1.3 * hh], [swd * .3, Ysh]], lw * 1.3, { col: C.red, t, seed: seed + 7 });
    inkIt(P().rect(-.22 * hh, Ysh + 1.25 * hh, .44 * hh, .55 * hh), C.bone, { k: 28, noRim: true, w: .8 });
  }

  // Neck and head.
  const turn = po.turn || 0;
  inkIt(P().poly([[-.13 * hh, Ychin - .05 * hh], [.13 * hh, Ychin - .05 * hh], [.15 * hh, Ysh - .12 * hh], [-.15 * hh, Ysh - .12 * hh]]), skin[0], { k: 30, sc: skin[1], sd: 1.5, noRim: true, w: .8 });
  head(g, turn * .08 * hh + (old ? .15 * hh : 0), Yhead, hh, sp, po, { t, lw, seed, sil, skin, rim, L, S });

  for (const [s, type] of front) handAt[s] = drawArm(s, type);
  // Something held: a phone, lit.
  if (po.phone) {
    const s = po.phone === 'L' ? -1 : 1;
    const A_ = handAt[s];
    if (A_) {
      const [hx, hy] = A_.hd;
      g.save(); g.translate(hx - s * .05 * hh, hy - .35 * hh);
      if (po.armR === 'phoneFar' || po.armL === 'phoneFar') g.rotate(-s * .2);
      const pw = .5 * hh, ph = .9 * hh;
      inkIt(P().rect(-pw / 2, -ph / 2, pw, ph), C.ink, { k: 40, noShade: true, noRim: true });
      g.fillStyle = po.screen || C.glass; g.fillRect(-pw / 2 + .05 * hh, -ph / 2 + .07 * hh, pw - .1 * hh, ph - .14 * hh);
      g.restore();
    }
  }
  g.restore();
  return { hh, head: [x, y + Yhead], hands: handAt };
}

// ---------------------------------------------------------------- heads
function head(g, cx, cy, hh, sp, po, k) {
  const { t, lw, seed, sil, skin, S } = k;
  const hw = hh * .8, f = sp.sex === 'f', old = !!sp.old;
  const turn = po.turn || 0, tx = turn * hw * .14;
  const expr = po.expr || 'neutral';
  const inkIt = (p, col, o = {}) => ink(g, p, { fill: S(col), line: sil > .5 ? 0 : lw * (o.w ?? 1), seed: seed + (o.k ?? 50), t, corner: o.corner ?? .9,
    shade: sil > .5 || o.noShade ? null : { dx: k.L.x * hh * .1, dy: k.L.y * hh * .1, col: o.sc || shade(col) },
    rim: k.rim && !o.noRim && sil <= .5 ? { dx: hh * .05, dy: 0, col: k.rim } : null });
  g.save(); g.translate(cx, cy);
  if (po.headTilt) g.rotate(po.headTilt);
  const hair = sp.hair || { style: 'short', col: HAIRC.brown };
  // Hair behind the head.
  hairBack(g, hair, hw, hh, inkIt, f);
  // The face: a skull and a jaw that narrows to the chin.
  const face = P().S([[-hw * .5, -hh * .05], [-hw * .47, -hh * .33], [-hw * .25, -hh * .5], [hw * .25, -hh * .5], [hw * .47, -hh * .33], [hw * .5, -hh * .05],
    [hw * .45, hh * .2], [hw * .22, hh * .42], [tx, hh * .52], [-hw * .22, hh * .42], [-hw * .45, hh * .2]], true, .45);
  inkIt(face, skin[0], { k: 52, sc: skin[1] });
  // Ears.
  for (const s of [-1, 1]) inkIt(P().S([[s * hw * .47, -hh * .06], [s * hw * .6, -hh * .1], [s * hw * .6, hh * .1], [s * hw * .48, hh * .14]], true), skin[0], { k: 53 + s, sc: skin[1], w: .8 });
  if (sil < .5) {
    face_(g, hw, hh, tx, expr, sp, k);
    if (sp.glasses) {
      g.strokeStyle = C.ink; g.lineWidth = lw * 1.1;
      for (const s of [-1, 1]) { g.beginPath(); g.ellipse(tx + s * hw * .2, hh * .04, hw * .15, hh * .1, 0, 0, TAU); g.stroke(); }
      g.beginPath(); g.moveTo(tx - hw * .05, hh * .03); g.lineTo(tx + hw * .05, hh * .03); g.stroke();
    }
  }
  hairFront(g, hair, hw, hh, inkIt, f, tx, k);
  g.restore();
}

function face_(g, hw, hh, tx, expr, sp, k) {
  const lw = k.lw, t = k.t, seed = k.seed;
  const ey = hh * .04, ex = hw * .2;
  const brow = expr === 'angry' ? .1 : expr === 'shock' ? -.07 : expr === 'sweat' ? -.05 : 0;
  for (const s of [-1, 1]) {
    const x = tx + s * ex;
    // Brows.
    gpen(g, [[x - s * hw * .12, -hh * .12 + s * 0 + (expr === 'angry' ? hh * .03 : 0)], [x + s * hw * .1, -hh * .14 + (expr === 'angry' ? -hh * .0 : 0) + brow * hh * s * 0 - (expr === 'angry' ? -hh * .04 : 0)]],
      lw * 1.3, { col: C.ink, t, seed: seed + 60 + s, taper: [.2, .4] });
    if (expr === 'squint' || expr === 'love' || expr === 'deadpanShut') {
      gpen(g, [[x - hw * .09, ey], [x, ey + (expr === 'love' ? -hh * .04 : hh * .01)], [x + hw * .09, ey]], lw * 1.4, { col: C.ink, t, seed: seed + 62 + s, taper: [.2, .2] });
      continue;
    }
    const eh = expr === 'shock' ? hh * .13 : expr === 'deadpan' ? hh * .05 : hh * .09;
    g.fillStyle = C.bone;
    g.beginPath(); g.ellipse(x, ey, hw * .085, eh * .75, 0, 0, TAU); g.fill();
    g.fillStyle = C.ink;
    g.beginPath(); g.ellipse(x + (sp.lookX ?? 0) * hw * .03, ey + (expr === 'deadpan' ? eh * .2 : 0), hw * .05, eh * .62, 0, 0, TAU); g.fill();
    g.fillStyle = C.bone; g.fillRect(x + hw * .005, ey - eh * .35, hw * .025, hw * .025);
    // The upper lid line (and lashes).
    gpen(g, [[x - hw * .1, ey - eh * .55 + (expr === 'deadpan' ? eh * .5 : 0)], [x + hw * .1, ey - eh * .6 + (expr === 'deadpan' ? eh * .5 : 0)]], lw * (sp.sex === 'f' ? 1.6 : 1.2), { col: C.ink, t, seed: seed + 64 + s, taper: [.1, .3] });
  }
  // Nose: a small shadow stroke.
  gpen(g, [[tx + hw * .02, hh * .12], [tx + hw * .05, hh * .22], [tx - hw * .01, hh * .24]], lw * .9, { col: k.skin[1], t, seed: seed + 70, taper: [.2, .3] });
  // Mouth.
  const my = hh * .33;
  if (expr === 'shock') { g.fillStyle = C.ink; g.beginPath(); g.ellipse(tx, my + hh * .02, hw * .08, hh * .07, 0, 0, TAU); g.fill(); }
  else if (expr === 'smile' || expr === 'love') {
    const mp = P().S([[tx - hw * .15, my - hh * .02], [tx, my + hh * .06], [tx + hw * .15, my - hh * .02], [tx, my + hh * .09]], true);
    ink(g, mp, { fill: C.red3, line: lw, seed: seed + 72, t });
  } else if (expr === 'angry') {
    gpen(g, [[tx - hw * .12, my + hh * .03], [tx, my - hh * .01], [tx + hw * .12, my + hh * .03]], lw * 1.3, { col: C.ink, t, seed: seed + 73, taper: [.2, .2] });
  } else if (expr === 'sweat') {
    gpen(g, [[tx - hw * .12, my], [tx - hw * .04, my + hh * .02], [tx + hw * .04, my - hh * .01], [tx + hw * .12, my + hh * .01]], lw * 1.2, { col: C.ink, t, seed: seed + 74, taper: [.2, .2] });
    // A bead of sweat, the anime sign.
    ink(g, P().S([[hw * .44, -hh * .28], [hw * .5, -hh * .15], [hw * .44, -hh * .1], [hw * .38, -hh * .15]], true), { fill: C.glass, line: lw * .8, seed: seed + 75, t });
  } else {
    gpen(g, [[tx - hw * .1, my], [tx + hw * .1, my + (expr === 'deadpan' ? 0 : hh * .01)]], lw * 1.2, { col: C.ink, t, seed: seed + 76, taper: [.2, .2] });
  }
  if (sp.old) for (const s of [-1, 1]) gpen(g, [[tx + s * hw * .22, hh * .22], [tx + s * hw * .16, hh * .34]], lw * .7, { col: k.skin[1], t, seed: seed + 77 + s, taper: [.3, .3] });
  if (sp.beard) ink(g, P().S([[-hw * .4, hh * .15], [0, hh * .6], [hw * .4, hh * .15], [hw * .2, hh * .38], [0, hh * .44], [-hw * .2, hh * .38]], true), { fill: sp.hair.col, line: lw, seed: seed + 78, t });
}

function hairBack(g, hair, hw, hh, inkIt, f) {
  const c = hair.col;
  switch (hair.style) {
    case 'long': inkIt(P().S([[-hw * .56, -hh * .3], [0, -hh * .62], [hw * .56, -hh * .3], [hw * .66, hh * .9], [hw * .4, hh * 1.3], [-hw * .4, hh * 1.3], [-hw * .66, hh * .9]], true), c, { k: 80 }); break;
    case 'bob': inkIt(P().S([[-hw * .6, -hh * .3], [0, -hh * .64], [hw * .6, -hh * .3], [hw * .66, hh * .3], [hw * .5, hh * .42], [-hw * .5, hh * .42], [-hw * .66, hh * .3]], true), c, { k: 81 }); break;
    case 'updo': inkIt(P().ell(0, -hh * .62, hw * .36, hh * .24), c, { k: 82 }); break;
    case 'bun': inkIt(P().ell(0, -hh * .66, hw * .26, hh * .2), c, { k: 83 }); break;
    case 'curly': inkIt(P().S([[-hw * .7, -hh * .2], [-hw * .5, -hh * .6], [0, -hh * .72], [hw * .5, -hh * .6], [hw * .7, -hh * .2], [hw * .72, hh * .28], [-hw * .72, hh * .28]], true), c, { k: 84 }); break;
    case 'pony': inkIt(P().S([[hw * .2, -hh * .45], [hw * .6, -hh * .2], [hw * .75, hh * .5], [hw * .5, hh * .9], [hw * .4, hh * .2]], true), c, { k: 85 }); break;
    default: break;
  }
}
function hairFront(g, hair, hw, hh, inkIt, f, tx, k) {
  const c = hair.col;
  switch (hair.style) {
    case 'bald':
      for (const s of [-1, 1]) inkIt(P().S([[s * hw * .5, -hh * .25], [s * hw * .56, hh * .02], [s * hw * .42, hh * .05], [s * hw * .38, -hh * .2]], true), c, { k: 90 + s });
      break;
    case 'short':
      inkIt(P().S([[-hw * .54, -hh * .08], [-hw * .5, -hh * .45], [-hw * .1, -hh * .62], [hw * .4, -hh * .55], [hw * .56, -hh * .12], [hw * .4, -hh * .28], [0, -hh * .35], [-hw * .35, -hh * .3]], true), c, { k: 92 });
      break;
    case 'curly':
      inkIt(P().S([[-hw * .6, -hh * .05], [-hw * .55, -hh * .5], [0, -hh * .66], [hw * .55, -hh * .5], [hw * .6, -hh * .05], [hw * .3, -hh * .3], [-hw * .3, -hh * .3]], true), c, { k: 93 });
      break;
    case 'bun': case 'updo':
      inkIt(P().S([[-hw * .52, -hh * .05], [-hw * .5, -hh * .4], [0, -hh * .56], [hw * .5, -hh * .4], [hw * .52, -hh * .05], [hw * .35, -hh * .32], [0, -hh * .4], [-hw * .35, -hh * .32]], true), c, { k: 94 });
      if (hair.style === 'updo') {
        // A veil falling from the crown.
        ink(g, P().S([[-hw * .3, -hh * .55], [hw * .3, -hh * .55], [hw * 1.1, hh * 1.8], [-hw * 1.1, hh * 1.8]], true), { fill: 'rgba(238,232,220,.35)', line: k.lw * .7, seed: k.seed + 95, t: k.t });
      }
      break;
    case 'long': case 'bob':
      inkIt(P().S([[-hw * .56, hh * .1], [-hw * .52, -hh * .42], [0, -hh * .58], [hw * .52, -hh * .42], [hw * .56, hh * .1], [hw * .38, -hh * .2], [hw * .05, -hh * .3], [-hw * .2, -hh * .18], [-hw * .38, -hh * .22]], true), c, { k: 96 });
      break;
    case 'pony':
      inkIt(P().S([[-hw * .52, -hh * .05], [-hw * .5, -hh * .42], [0, -hh * .58], [hw * .5, -hh * .42], [hw * .52, -hh * .05], [hw * .3, -hh * .3], [-hw * .3, -hh * .32]], true), c, { k: 97 });
      break;
    default: break;
  }
}

// A quick person for crowds: the same construction, in silhouette with a rim, varied by seed.
export function stranger(g, x, y, h, seed, o = {}) {
  const r = n => hash(seed, n);
  const styles = ['short', 'long', 'bun', 'curly', 'bob', 'pony', 'bald'];
  const tops = ['coat', 'hoodie', 'tee', 'shirt', 'cardigan'];
  const skins = Object.values(SKIN), hairs = Object.values(HAIRC);
  const f = r(1) < .5;
  return person(g, x, y, h * lerp(.9, 1.08, r(2)), {
    sex: f ? 'f' : 'm', build: lerp(.85, 1.2, r(3)), skin: skins[Math.floor(r(4) * skins.length)],
    hair: { style: styles[Math.floor(r(5) * styles.length)], col: hairs[Math.floor(r(6) * hairs.length)] },
    top: { type: tops[Math.floor(r(7) * tops.length)], col: [C.ink2, C.steel2, C.bone2, C.glass2, C.red2][Math.floor(r(8) * 5)], col2: C.bone },
    bottom: { type: r(9) < .25 && f ? 'skirt' : 'trousers', col: [C.ink2, C.ink3, C.steel2][Math.floor(r(10) * 3)] }, seed,
  }, { armL: o.armL || (r(11) < .3 ? 'phone' : 'down'), armR: o.armR || 'down', phone: r(11) < .3 ? 'L' : null, turn: (r(12) - .5) * .8, silhouette: o.silhouette, rim: o.rim, expr: o.expr }, o.t);
}

// Figures in silhouette, edged with light: drawn flat into a layer under the caller's transform,
// then laid down twice, a copy in the rim colour nudged up and left, and the dark shapes over it.
export function rimmed(g, name, rim, draw, o = {}) {
  const L = layer(g, name);
  L.setTransform(g.getTransform());
  draw(L);
  put(g, L, { tint: { col: rim, a: 1 }, dx: o.dx ?? -5, dy: o.dy ?? -4, alpha: o.alpha ?? 1 });
  put(g, L, { alpha: o.alpha ?? 1, tint: o.fill ? { col: o.fill, a: 1 } : undefined });
}
