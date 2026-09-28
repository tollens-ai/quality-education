// People: the ones the band built for. They're drawn the way the rest of the film is, with a pen:
// flat colour under a line that swells on the shade side, a few lines for the folds that say what
// the clothes are, hatching where the light doesn't reach, and faces simple enough to read at any
// size. The construction is a figure drawer's: about seven heads, the body turned three-quarters
// when it faces a way, the weight on one leg (the hips tip, the shoulders answer), elbows and
// knees that bend, hands with a thumb. Each named person has their own build and clothes, so their
// silhouette says who they are. Small figures keep only their silhouette and line; big ones get
// faces, fingers and folds.
//
// person(g, x, y, h, spec, pose, t): feet at (x, y), h px tall. Drawn in body units: the figure
// is 100 tall, y up, so every length below is a fraction of the height.
//   spec: { sex, age ('old'), build, shape ('round' | 'sturdy'), skin, hair: { style, col, hat },
//           top: { kind, col, col2 }, legs: { kind, col, pattern }, shoes, heels, glasses, bag,
//           bagKind ('tote' | 'handbag'), veil, seed, height }
//     top.kind: 'shirt' | 'tee' | 'coat' | 'parka' | 'suit' | 'dress' | 'gown' | 'apron'
//     legs.kind: 'trousers' | 'skirt' | 'dress'; legs.pattern: 'plaid'
//     hair.style: 'short' | 'long' | 'bob' | 'bun' | 'curly' | 'bald' | 'cap'
//   pose: { face: 'front' | 'left' | 'right', arms, look: 'phone' | 'ahead', joy, mood, weight,
//           step, screen, head }
//     arms: 'down' | 'phone' | 'phoneFar' | 'cross' | 'pockets' | 'watch' | 'up' | 'cheer'
//           | 'wave' | 'hips' | 'hold' | 'point' | 'strap'
//     mood: 'joy' | 'deadpan' | 'cross' | 'worried' (joy: true means 'joy')
import { clamp, lerp, hash, mix, rgba, noise } from './kit.js';
import { hatch } from './ink.js';

export const SKIN = ['#f3d2b8', '#e8b894', '#c98f68', '#a06a47', '#6e4530', '#4b2f22'];
export const HAIRC = { black: '#1d1716', brown: '#4a2f22', auburn: '#7a3a22', blonde: '#d8b36a', grey: '#a8a4a0', white: '#e8e4de', red: '#a8482a' };

// How dark things read against the light: their own colour, pushed into the shade's violet.
export const SHADE = { col: '#241a2e', k: .72 };
// Against the light, colours sink into the shade; in the sun (SHADE.lit), they're themselves.
export const dim = col => SHADE.lit ? col : mix(col, SHADE.col, SHADE.k);
const inkOf = () => SHADE.lit ? '#2a201b' : mix(SHADE.col, '#000000', .55);

// A smooth closed path through pts (Catmull-Rom as Béziers), and an open one.
function closed(g, pts, k = .2) {
  const n = pts.length;
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k, p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k, p2[0], p2[1]);
  }
  g.closePath();
}
function openPath(g, pts, k = .2) {
  const n = pts.length;
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
    g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k, p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k, p2[0], p2[1]);
  }
}
// A limb's outline through joints, with a width at each: down one side, round the end, back up.
function limbOutline(pts, ws, capEnd = true) {
  const L = [], R = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l, ny = dx / l, w = ws[i] / 2;
    L.push([pts[i][0] + nx * w, pts[i][1] + ny * w]);
    R.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
  }
  if (!capEnd) return [...L, ...R.reverse()];
  const e = pts[pts.length - 1], p = pts[pts.length - 2], dx = e[0] - p[0], dy = e[1] - p[1], l = Math.hypot(dx, dy) || 1;
  const tip = [e[0] + dx / l * ws[ws.length - 1] * .42, e[1] + dy / l * ws[ws.length - 1] * .42];
  return [...L, tip, ...R.reverse()];
}
// The middle joint (elbow, knee) between a root and an end: `side` scales and signs the bend
// (for an arm hanging down, negative sends the left elbow out; raised, positive does).
function joint(a, c, l1, l2, side) {
  const dx = c[0] - a[0], dy = c[1] - a[1], d = Math.max(.01, Math.min(Math.hypot(dx, dy), l1 + l2 - .01));
  const cosA = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const ang = Math.atan2(dy, dx) + side * Math.acos(cosA);
  return [a[0] + Math.cos(ang) * l1, a[1] + Math.sin(ang) * l1];
}

export function person(g, x, y, h, spec, pose = {}, t = 0) {
  if (h < 5) return {};
  const s = h / 100;
  const D = h >= 240 ? 2 : h >= 105 ? 1 : 0;                 // how much detail this size can carry
  const f = spec.sex === 'f', old = spec.age === 'old';
  const b = spec.build ?? 1;
  const seed = spec.seed || 1;
  const turn = pose.face === 'left' ? -1 : pose.face === 'right' ? 1 : 0;
  // Three-quarters: the far side foreshortened, the near side a touch wider, the front's middle
  // line moved towards the way they face.
  const sk = sd => turn === 0 ? 1 : sd === turn ? .78 : 1.04;
  const top = spec.top || {}, legs = spec.legs || {};
  const lw = clamp(h * .0056, .7, 4.8) / s;                 // the pen, in body units
  const INK = inkOf();
  const C = col => dim(col);
  const skin = C(spec.skin || SKIN[1]);
  const mood = pose.mood || (pose.joy ? 'joy' : null);
  const LX = SHADE.lit ? -1 : 0;                             // the light's side, for the pen's weight
  const ink = (w = 1) => { g.strokeStyle = INK; g.lineWidth = lw * w; g.lineJoin = 'round'; g.lineCap = 'round'; };
  const shape = (pts, col, k = .2, w = 1) => {
    g.beginPath(); closed(g, pts, k); g.fillStyle = col; g.fill();
    ink(w); g.stroke();
    if (LX && D) { g.save(); g.translate(-LX * lw * .35, 0); g.lineWidth = lw * w * .75; g.stroke(); g.restore(); }
  };
  const line = (pts, w = .8, a = .9, k = .2) => { if (!D) return; g.save(); g.globalAlpha *= a; ink(w); g.beginPath(); openPath(g, pts, k); g.stroke(); g.restore(); };
  // Hatching in the shade: inside a part's outline, on its far side from the light.
  const shadeIn = (pts, tone, from = .45) => {
    if (D < 2 || !SHADE.lit) return;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const [u, v] of pts) { x0 = Math.min(x0, u); x1 = Math.max(x1, u); y0 = Math.min(y0, v); y1 = Math.max(y1, v); }
    const cut = lerp(x0, x1, from);
    g.save(); g.beginPath(); closed(g, pts); g.clip();
    hatch(g, [[cut, y0 - 1], [x1 + 1, y0 - 1], [x1 + 1, y1 + 1], [cut, y1 + 1]], tone, { max: 13 / s, min: 5 / s, w: .9 / s, col: rgba(INK, .5), dir: [1, .85], t, seed });
    g.restore();
  };

  // Life: breathing, a slow sway, the weight on one leg.
  const breathe = Math.sin(t * 2.1 + seed) * .3;
  const sway = noise(t * .45, seed) * .7;
  const wgt = clamp((pose.weight ?? (hash(seed, 3) - .5) * 1.4) + sway * .25, -1, 1);
  const stoop = old ? 1 : 0;
  const cheer = pose.arms === 'cheer' ? Math.abs(Math.sin(t * Math.PI * 136 / 60 + seed)) : 0;
  const Y = { crotch: 46.4, hip: 50.8, waist: 60.8, chest: 71.2, sh: 79 - stoop * 2 + breathe * .15 + cheer * .8, neck: 81.2 - stoop * 1.8, chin: 84.6 - stoop * 2 };
  const round = spec.shape === 'round', sturdy = spec.shape === 'sturdy';
  const hipW = (f ? 9.6 : 8.8) * b * (sturdy ? 1.08 : round ? 1.1 : 1);
  const waistW = (f ? 6.2 : 7.6) * b * (sturdy ? 1.2 : round ? 1.85 : 1);
  const chestW = (f ? 8 : 9.6) * b * (round ? 1.22 : sturdy ? 1.08 : 1);
  const shW = (f ? 9.3 : 10.9) * b;
  const px = wgt * 1.4, tilt = wgt * .8, shTilt = -wgt * .6;
  const cx = turn * chestW * .28;                           // the front's middle line
  const lean = turn * stoop * 2.4;
  const headX = px * .25 + lean + turn * .8;

  g.save();
  g.translate(x, y); g.scale(s, -s);

  // The veil, behind everything: sheer, from the crown to past the knees; the light shows through.
  if (spec.veil) {
    const vs = Math.sin(t * 1.1 + seed) * 1.2;
    g.fillStyle = rgba(mix(spec.veil, '#fff6e0', .45), SHADE.lit ? .45 : .4);
    g.beginPath(); closed(g, [[headX - 3.5, 99], [headX + 3.5, 99], [13 + vs, 66], [15 + vs, 38], [7 + vs, 26], [-7 - vs, 26], [-15 - vs, 38], [-13 - vs, 66]], .25); g.fill();
    g.save(); g.globalAlpha *= .45; ink(.55); g.stroke(); g.restore();
  }
  // Long hair behind the shoulders.
  const hs = spec.hair?.style || 'short';
  const hairC = C(spec.hair?.col || HAIRC.brown);
  if (hs === 'long') shape([[headX - 5.6, 93], [headX, 100.5], [headX + 5.6, 93], [headX + 6.6, 78], [headX + 5, 68], [headX - 5, 68], [headX - 6.6, 78]], hairC, .22, .9);

  // Legs, the far one first: the weight leg straight, the free one easy, its foot turned out.
  const dressy = ['dress', 'gown'].includes(top.kind) || ['dress', 'skirt'].includes(legs.kind);
  const bare = dressy || (top.kind === 'apron' && legs.kind !== 'trousers');
  const legCol = bare ? C(spec.tights || spec.skin || SKIN[1]) : C(legs.col || '#39405a');
  const weightR = wgt >= 0;
  const stepK = pose.step || 0;
  const legW = bare ? [7.4 * b, 4.9 * b, 5.3 * b, 3.3 * b] : [9.4 * b, 7.1 * b, 6.9 * b, 6.2 * b];
  const drawLeg = side => {
    const onW = side > 0 ? weightR : !weightR;
    const k = sk(side);
    const hip = [side * hipW * .47 * k + px, Y.hip - 2.6 + side * tilt * .5];
    const ank = [side * hipW * (onW ? .45 : .72) * k + px * .25 + turn * 1.5 + side * stepK * 2.5, 4.3 + (onW ? 0 : .6)];
    const kn = joint(hip, ank, 22.3, 22.2, -side * (onW ? .02 : .1));
    const calf = [lerp(kn[0], ank[0], .3) + side * .45, lerp(kn[1], ank[1], .3)];
    const pts = limbOutline([hip, kn, calf, ank], legW.map((w, i) => w * (i ? 1 : k)), false);
    shape(pts, legCol, .18);
    if (!bare) { line([[lerp(kn[0], hip[0], .3) + side * .3, lerp(kn[1], hip[1], .3)], [kn[0] + side * .2, kn[1]], [ank[0] + side * .4, ank[1] + 1.4]], .5, .45); shadeIn(pts, .35, .55); }
    if (legs.jeans && D) line([[hip[0] + side * legW[0] * .42, hip[1]], [ank[0] + side * legW[3] * .48, ank[1] + .6]], .4, .5);
    // The shoe, pointing the way the body faces, the free foot turned out.
    const out = (onW ? .12 : .42) * side + turn * .6;
    const sx = ank[0], sy = ank[1] - 4.3;
    const heel = spec.heels;
    const shoe = heel
      ? [[sx - 1.8, sy + 4.4], [sx + 1.8, sy + 4.4], [sx + 2.4 + out * 2.4, sy + 1.4], [sx + 3.2 + out * 3.2, sy], [sx - 1 + out * 1.4, sy + .3], [sx - 1.9, sy + 1.3], [sx - 2.1, sy]]
      : [[sx - 2.6 - Math.min(0, out) * 1.5, sy + 4.9], [sx + 2.6 + Math.max(0, out) * 1.5, sy + 4.9], [sx + 3.1 + out * 2.2, sy + 2.4], [sx + 2.8 + out * 2.6, sy], [sx - 2.8 + out * 2.6, sy], [sx - 3.1 + out * 1.2, sy + 2]];
    shape(shoe, C(spec.shoes || (heel ? '#8a1f2a' : dressy && f ? '#6a3a36' : '#2a2320')), .25);
    if (!heel) line([[sx - 2.7 + out * 2, sy + .9], [sx + 2.7 + out * 2.4, sy + .9]], .5, .6);
  };
  const far = turn || -1;
  drawLeg(far); drawLeg(-far);

  // Skirts and the lower parts of coats and dresses, over the legs.
  const drawSkirt = (hemY, col, flare, folds, o = {}) => {
    const K = u => sk(Math.sign(u) || 1);
    const pts = [[-waistW * K(-1) + px * .6 + cx * .2, Y.waist], [-hipW * 1.04 * K(-1) + px, Y.hip - tilt * .5]];
    const n = 8;
    for (let i = 0; i <= n; i++) {
      const u = i / n * 2 - 1;
      const sw = top.kind === 'gown' ? Math.sin(t * 1.3 + i) * .35 : 0;
      pts.push([u * hipW * flare * K(u) + px * .7 + cx * .3, hemY - (1 - u * u) * 1.2 + sw]);
    }
    pts.push([hipW * 1.04 * K(1) + px, Y.hip + tilt * .5], [waistW * K(1) + px * .6 + cx * .2, Y.waist]);
    shape(pts, col, .16);
    if (o.plaid && D) {
      g.save(); g.beginPath(); closed(g, pts, .16); g.clip();
      g.globalAlpha *= .5; ink(.35);
      for (let v = hemY + 2; v < Y.waist; v += 4.2) { g.beginPath(); g.moveTo(-hipW * 2, v); g.lineTo(hipW * 2, v); g.stroke(); }
      for (let u = -hipW * 2; u < hipW * 2; u += 4.2) { g.beginPath(); g.moveTo(u, hemY); g.lineTo(u + 1, Y.waist); g.stroke(); }
      g.restore();
    }
    shadeIn(pts, .36, .58);
    // Folds, from the hips down, spreading to the hem.
    for (let i = 0; i < folds; i++) {
      const u = (i + .5) / folds * 2 - 1;
      line([[u * hipW * .6 * K(u) + px + cx * .2, Y.hip - 3], [u * hipW * lerp(.6, flare, .55) * K(u) + px * .8 + (hash(seed, i, 4) - .5), lerp(Y.hip - 3, hemY, .55)], [u * hipW * flare * .92 * K(u) + px * .7 + cx * .3, hemY + .9]], .5, .5);
    }
    if (o.open) line([[px * .4 + cx * .6, Y.waist], [px * .6 + cx * .5, hemY + .4]], .7, .85);
    return pts;
  };
  const topCol = C(top.col || '#5a6f94');

  // The line of action: above the hips the body turns a little about the pelvis, against the
  // hips' tilt (the weight leg's hip up, that shoulder down), so the spine makes a gentle S.
  const spine = -wgt * .055 + (pose.lean || 0) + (old ? turn * -.05 : 0);
  g.save();
  g.translate(px, Y.hip - 2); g.rotate(spine); g.translate(-px, -(Y.hip - 2));
  // The arms: worked out now, drawn in order (the far arm behind the body in three-quarters).
  const armCol = top.kind === 'apron' ? skin : topCol;
  const ua = 15.8, fa = 14.1;
  const shJ = sd => [sd * (shW - 1.9) * sk(sd) + px * .2 + cx * .1, Y.sh - 1.3 - sd * shTilt * .5];
  const aw = f ? [4.6, 3.7, 3.1] : [5.4, 4.4, 3.6];
  const A = (u, v) => [u + px * .3 + lean * .5, v];
  const arms = pose.arms || 'down';
  const specs = { '-1': null, '1': null };
  const set = (sd, target, bend, o = {}) => { specs[sd] = { sd, target, bend, o }; };
  let phoneAt = null;
  const dir = turn || 1;
  if (arms === 'down') { set(-1, A(-shW - 1.3 - wgt * .4, 43 + breathe * .2), -.9); set(1, A(shW + 1.3 - wgt * .4, 43), .9); }
  else if (arms === 'pockets') { set(-1, A(-hipW * .8 + px * .7, 47.6), -.5, { hidden: true }); set(1, A(hipW * .8 + px * .7, 47.6), .5, { hidden: true }); }
  else if (arms === 'hips') { set(-1, A(-waistW - .7 + px * .6, 57), -1, { fist: true, thumb: -1 }); set(1, A(waistW + .7 + px * .6, 57), 1, { fist: true, thumb: -1 }); }
  else if (arms === 'cross') {
    const fs = turn >= 0 ? -1 : 1;
    set(fs, A(-fs * 4.6 + cx * .3, 65.5), fs < 0 ? -1 : 1, { hidden: true });
    set(-fs, A(fs * 5.2 + cx * .3, 64.2), fs < 0 ? 1 : -1, { fist: true });
  } else if (arms === 'phone') { phoneAt = A(dir * 5.2 + cx * .4, 67); set(-dir, A(-dir * (shW + 1.3), 43), dir > 0 ? -.9 : .9); set(dir, phoneAt, dir > 0 ? 1 : -1, { fist: true }); }
  else if (arms === 'phoneFar') { phoneAt = A(dir * 15.5, 91.5); set(-dir, A(-dir * (shW + 1.3), 43), dir > 0 ? -.9 : .9); set(dir, phoneAt, dir > 0 ? -.45 : .45, { fist: true }); }
  else if (arms === 'watch') { set(-1, A(-shW - 1.3, 43), -.9); set(1, A(1.8 + cx * .3, 65), 1.1, { fist: true }); }
  else if (arms === 'up') { set(-1, A(-shW - 7 + Math.sin(t * 7 + seed) * 1.2, 103.5), 1); set(1, A(shW + 7 + Math.sin(t * 7.6 + seed) * 1.2, 103.5), -1); }
  else if (arms === 'cheer') { set(-1, A(-shW - 9 - cheer * .8, 100.5 + cheer * 2.4), .7, { fist: true }); set(1, A(shW + 9 + cheer * .8, 100.5 + cheer * 2.4), -.7, { fist: true }); }
  else if (arms === 'wave') { set(-1, A(-shW - 1.3, 43), -.9); set(1, A(shW + 8 + Math.sin(t * 9 + seed) * 3.2, 100.5 + Math.cos(t * 9 + seed) * 1.2), -.8, { open: true }); }
  else if (arms === 'hold') { set(-1, A(-2.6 + px * .4 + cx * .3, 55), -1.1); set(1, A(2.6 + px * .4 + cx * .3, 55.6), 1.1); }
  else if (arms === 'point') { set(-1, A(-shW - 1.3, 43), -.9); set(1, A(shW + 24, 79), -.6); }
  else if (arms === 'strap') { set(-1, A(-shW * .42 + cx * .2, 71), -1, { fist: true }); set(1, A(hipW * .8 + px * .7, 47.6), .5, { hidden: true }); }
  else { set(-1, A(-shW - 1.3, 43), -.9); set(1, A(shW + 1.3, 43), .9); }
  const hands = [];
  const hand = (el, wrist, o = {}) => {
    const dx = wrist[0] - el[0], dy = wrist[1] - el[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, nx = -uy, ny = ux;
    const L = o.fist ? 3.6 : 5.2, Wd = f ? 3.1 : 3.5;
    const c0 = [wrist[0] + ux * L * .45, wrist[1] + uy * L * .45];
    const P = (a, bb) => [c0[0] + ux * a + nx * bb, c0[1] + uy * a + ny * bb];
    if (o.open) {
      // An open hand, waving: the palm and four fingers spread, the thumb out.
      shape([P(-L * .5, -Wd * .5), P(-L * .5, Wd * .5), P(L * .15, Wd * .6), P(L * .15, -Wd * .6)], skin, .25, .85);
      for (let i = 0; i < 4; i++) { const a = (i - 1.5) * .22; const r0 = P(L * .12, (i - 1.5) * Wd * .32); const e = [r0[0] + (ux * Math.cos(a) - nx * Math.sin(a)) * L * .5, r0[1] + (uy * Math.cos(a) - ny * Math.sin(a)) * L * .5]; shape(limbOutline([r0, e], [Wd * .28, Wd * .24]), skin, .25, .6); }
      shape([P(-L * .2, Wd * .45), P(L * .05, Wd * 1.05), P(L * .2, Wd * .95), P(L * .05, Wd * .45)], skin, .3, .7);
      return;
    }
    const palm = [P(-L * .5, -Wd * .45), P(-L * .5, Wd * .45), P(L * .1, Wd * .55), P(L * .5, Wd * .38), P(L * .56, 0), P(L * .5, -Wd * .4), P(L * .1, -Wd * .52)];
    shape(palm, skin, .25, .85);
    const th = o.thumb ?? 1;
    shape([P(-L * .25, th * Wd * .45), P(L * .05, th * Wd * .95), P(L * .25, th * Wd * .8), P(L * .05, th * Wd * .4)], skin, .3, .7);
    if (D === 2 && !o.fist) for (const kk of [-.18, .1]) line([P(L * .12, kk * Wd), P(L * .48, kk * Wd * 1.1)], .38, .55);
  };
  const sleeveShort = top.kind === 'apron' || top.kind === 'tee';
  const drawArm = spc => {
    if (!spc) return;
    const { sd, target, bend, o } = spc;
    const sh = shJ(sd), el = joint(sh, target, ua, fa, bend), wrist = target;
    if (sleeveShort) {
      // The forearm bare, the sleeve to the elbow (Rosa's rolled up, a T-shirt's short).
      shape(limbOutline([el, wrist], [aw[1] * b * .92, aw[2] * b]), skin, .2, .9);
      const cuffAt = top.kind === 'tee' ? .55 : 1.04;
      const upEnd = [lerp(sh[0], el[0], cuffAt), lerp(sh[1], el[1], cuffAt)];
      if (top.kind === 'tee') shape(limbOutline([[lerp(sh[0], el[0], .5), lerp(sh[1], el[1], .5)], el], [aw[0] * b * .88, aw[1] * b * .92]), skin, .2, .9);
      shape(limbOutline([sh, upEnd], [aw[0] * b * 1.1, aw[1] * b * 1.18], false), top.kind === 'apron' ? C(top.col2 || '#2f6b72') : topCol, .2);
      if (top.kind === 'apron' && D) line([[upEnd[0] - 2.2, upEnd[1] + .6], [upEnd[0] + 2.2, upEnd[1] - .6]], .6, .8);
    } else {
      const m1 = [lerp(sh[0], el[0], .38), lerp(sh[1], el[1], .38)], m2 = [lerp(el[0], wrist[0], .32), lerp(el[1], wrist[1], .32)];
      const pts = limbOutline([sh, m1, el, m2, wrist], [aw[0] * b * 1.04, aw[0] * b * .98, aw[1] * b * .92, aw[1] * b * 1.02, aw[2] * b]);
      shape(pts, armCol, .2);
      if (D && !o.hidden) { const dx = wrist[0] - el[0], dy = wrist[1] - el[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, cw = aw[2] * b * .55; line([[wrist[0] - dx / l * 1.4 + nx * cw, wrist[1] - dy / l * 1.4 + ny * cw], [wrist[0] - dx / l * 1.4 - nx * cw, wrist[1] - dy / l * 1.4 - ny * cw]], .5, .7); }
      if (D === 2) line([[el[0] - .8, el[1] + .6], [el[0] + .6, el[1] - .4]], .45, .45);
    }
    if (!o.hidden) hand(el, wrist, o);
    hands.push({ sd, el, wrist });
  };
  // The far arm goes behind the body when they're turned.
  if (turn) drawArm(specs[String(turn)]);

  // The body: shoulders, chest, waist, hips; the shoulders tip against the hips.
  const torsoCol = top.kind === 'apron' ? C(top.col2 || '#2f6b72') : topCol;
  const side = sd => [
    [sd * hipW * .86 * sk(sd) + px, Y.crotch + .8], [sd * hipW * sk(sd) + px, Y.hip + sd * tilt * .5], [sd * waistW * sk(sd) + px * .6, Y.waist],
    [sd * (chestW + .3) * sk(sd), Y.chest], [sd * shW * sk(sd) + px * .2, Y.sh - .5 - sd * shTilt * .5],
  ];
  const torso = [...side(-1), [-3.3 + headX * .4 + cx * .2, Y.neck + .7], [3.3 + headX * .4 + cx * .2, Y.neck + .7], ...side(1).reverse()];
  shape(torso, torsoCol, .18);
  shadeIn(torso, .32, .6);
  // The skirts and coat hems hang from the hips, over the body's bottom edge, not turned with it.
  g.restore();
  if (top.kind === 'gown') drawSkirt(.6, C(top.col || '#fbf8f2'), 1.72, 5);
  else if (top.kind === 'dress') drawSkirt(27, topCol, 1.3, 3);
  else if (legs.kind === 'skirt' && !['coat', 'parka'].includes(top.kind)) drawSkirt(27, C(legs.col || '#5a4a5e'), 1.28, 3, { plaid: legs.pattern === 'plaid' });
  if (top.kind === 'apron') {
    // Rosa's dress under her apron, then the apron over it.
    drawSkirt(22, C(top.col2 || '#2f6b72'), 1.34, 3);
    drawSkirt(30, C(top.col || '#e7e2d6'), 1.08, 3);
  }
  if (top.kind === 'coat' || top.kind === 'parka') {
    if (legs.kind === 'skirt') drawSkirt(16, C(legs.col || '#5a4a5e'), 1.34, 3, { plaid: legs.pattern === 'plaid' });
    drawSkirt(top.kind === 'coat' ? 29 : 40, topCol, top.kind === 'coat' ? 1.2 : 1.07, 2, { open: true });
  }
  if (top.kind === 'suit') drawSkirt(43.5, topCol, 1.08, 0, { open: true });
  g.save();
  g.translate(px, Y.hip - 2); g.rotate(spine); g.translate(-px, -(Y.hip - 2));
  const mid = v => lerp(px * .6, 0, clamp((v - Y.waist) / (Y.neck - Y.waist))) + cx * .55;
  // What the top is, told by its lines: a shirt's collar and waistband, a coat's opening and
  // lapels, a suit's shirt and tie, a parka's hood and zip, an apron's bib.
  if (['shirt', 'tee'].includes(top.kind) || !top.kind) {
    line([[-waistW - .4 + px * .6, Y.waist - 1.6], [mid(Y.waist) , Y.waist - 2.2], [waistW + .4 + px * .6, Y.waist - 1.6]], .5, .5);
    if (top.kind === 'tee') line([[mid(Y.neck) - 3, Y.neck + .2], [mid(Y.neck), Y.neck - 1.6], [mid(Y.neck) + 3, Y.neck + .2]], .55, .8);
    else { shape([[mid(Y.neck) - 3.2, Y.neck + .6], [mid(Y.neck) - .2, Y.neck - 2.4], [mid(Y.neck) - 2, Y.neck - 3]], mix(topCol, '#ffffff', .15), .1, .6); shape([[mid(Y.neck) + 3.2, Y.neck + .6], [mid(Y.neck) + .2, Y.neck - 2.4], [mid(Y.neck) + 2, Y.neck - 3]], mix(topCol, '#ffffff', .15), .1, .6); }
  }
  if (top.kind === 'coat' || top.kind === 'suit') {
    const vBot = top.kind === 'suit' ? Y.chest - 6 : Y.chest - 7;
    if (top.kind === 'suit') {
      // The shirt in the V, and the tie.
      shape([[mid(Y.neck) - 2.8, Y.neck + .5], [mid(Y.neck) + 2.8, Y.neck + .5], [mid(vBot), vBot]], C('#f1ede6'), .05, .6);
      shape([[mid(Y.neck) - .8, Y.neck - .8], [mid(Y.neck) + .8, Y.neck - .8], [mid(vBot + 3) + .9, vBot + 1.2], [mid(vBot), vBot - .4], [mid(vBot + 3) - .9, vBot + 1.2]], C(top.col2 || '#7a2f3a'), .1, .6);
    }
    line([[mid(vBot), vBot], [mid(Y.waist), Y.waist - (round ? 1.2 : 0)], [mid(Y.hip) + px * .2, Y.hip]], .75, .85);
    if (round && D) line([[-waistW * .7 + px * .6, Y.waist - 3.4], [px * .6 + cx * .5, Y.waist - 5.2], [waistW * .7 + px * .6, Y.waist - 3.4]], .5, .5);
    line([[mid(Y.neck) - 3.2, Y.neck + .3], [mid(Y.chest) - 1.6, Y.chest - 2], [mid(vBot), vBot]], .7, .85);
    line([[mid(Y.neck) + 3.2, Y.neck + .3], [mid(Y.chest) + 1.6, Y.chest - 2], [mid(vBot), vBot]], .7, .85);
    if (D) { g.fillStyle = INK; for (const by of (top.kind === 'suit' ? [vBot - 3, Y.waist + 1] : [vBot, Y.waist, Y.hip - 3])) { g.beginPath(); g.arc(mid(by) + 1.2, by, .42, 0, Math.PI * 2); g.fill(); } }
    line([[-hipW * .82 + px, Y.hip - 3.4], [-hipW * .34 + px, Y.hip - 3.7]], .55, .6);
    line([[hipW * .34 + px, Y.hip - 3.7], [hipW * .82 + px, Y.hip - 3.4]], .55, .6);
    if (top.kind === 'suit' && D) line([[chestW * .45 * sk(-1) * -1 + 1, Y.chest - 1.2], [chestW * .45 * sk(-1) * -1 + 4, Y.chest - 1.5]], .5, .6);
  }
  if (top.kind === 'parka') {
    line([[mid(Y.neck - 1), Y.neck - 1], [mid(Y.waist), Y.waist], [mid(Y.hip), Y.hip - 1]], .75, .85);
    // The hood, down behind the neck, its fur rim.
    const hood = [[mid(Y.neck) - 6, Y.neck - 1.4], [mid(Y.neck) - 6.8, Y.neck + 2.2], [mid(Y.neck), Y.neck + 3.8], [mid(Y.neck) + 6.8, Y.neck + 2.2], [mid(Y.neck) + 6, Y.neck - 1.4], [mid(Y.neck), Y.neck + .5]];
    shape(hood, mix(topCol, '#000000', .12), .3, .8);
    if (D) { g.save(); g.globalAlpha *= .8; ink(.4); for (let i = 0; i < 9; i++) { const u = i / 8 * 2 - 1; g.beginPath(); g.arc(mid(Y.neck) + u * 5.6, Y.neck + 1.6 - Math.abs(u) * 2.2, .7, 0, Math.PI * 2); g.stroke(); } g.restore(); }
    line([[-hipW * .82 + px, Y.hip - 4.2], [-hipW * .3 + px, Y.hip - 4.4]], .55, .6);
    line([[hipW * .3 + px, Y.hip - 4.4], [hipW * .82 + px, Y.hip - 4.2]], .55, .6);
  }
  if (top.kind === 'apron') {
    const bib = [[mid(Y.chest + 3) - 4.4, Y.chest + 3.4], [mid(Y.chest + 3) + 4.4, Y.chest + 3.4], [mid(Y.waist) + 5.4, Y.waist - .5], [mid(Y.waist) - 5.4, Y.waist - .5]];
    shape(bib, C(top.col || '#e7e2d6'), .1, .8);
    line([[-waistW + px * .6, Y.waist - .6], [waistW + px * .6, Y.waist - .6]], .6, .8);
    line([[mid(Y.chest + 3) - 4, Y.chest + 3.3], [mid(Y.neck) - 3.1, Y.neck + .3]], .5, .8);
    line([[mid(Y.chest + 3) + 4, Y.chest + 3.3], [mid(Y.neck) + 3.1, Y.neck + .3]], .5, .8);
    line([[waistW + px * .6, Y.waist - .6], [waistW + px * .6 + 1.2, Y.waist - 5]], .5, .7);
  }
  if (top.kind === 'gown') line([[mid(Y.neck) - 4.4, Y.neck - .4], [mid(Y.neck) - 4.2, Y.chest + 3], [mid(Y.neck) + 4.2, Y.chest + 3], [mid(Y.neck) + 4.4, Y.neck - .4]], .5, .6, .05);
  if (top.kind === 'dress') line([[mid(Y.neck) - 4.2, Y.neck], [mid(Y.chest + 2.5), Y.chest + 1.5], [mid(Y.neck) + 4.2, Y.neck]], .5, .6);
  // A tote on its strap over the shoulder.
  const bagKind = spec.bag ? (spec.bagKind || (old ? 'handbag' : 'tote')) : null;
  if (bagKind === 'tote') {
    const bx = -hipW * 1.1 * sk(-1) + px, by = Y.hip + 2;
    line([[-shW * .5 * sk(-1), Y.sh + .6], [bx + 1.8, by + 8]], .95, .95);
    const tote = [[bx - 4.6, by + 8.2], [bx + 4.6, by + 8.2], [bx + 5.4, by - 6.5], [bx - 5.4, by - 6.5]];
    shape(tote, C(spec.bag), .12, .9);
    if (D === 2) line([[bx - 3.4, by - 3], [bx + 3.4, by - 3.3]], .4, .5);
  }

  // The near arm (or both, face on).
  if (turn) drawArm(specs[String(-turn)]); else { drawArm(specs['-1']); drawArm(specs['1']); }
  // Gran's handbag, hung from her forearm.
  if (bagKind === 'handbag' && hands.length) {
    const hnd = hands.find(hd => !phoneAt || hd.wrist !== phoneAt) || hands[0];
    // On a raised arm it slides down to the crook of the elbow.
    const up = hnd.wrist[1] > hnd.el[1];
    const mx = up ? hnd.el[0] : lerp(hnd.el[0], hnd.wrist[0], .4), my = up ? hnd.el[1] - 1 : lerp(hnd.el[1], hnd.wrist[1], .4);
    line([[mx - 1.8, my], [mx - 2.6, my - 4.6]], .7, .95); line([[mx + 1.8, my], [mx + 2.6, my - 4.6]], .7, .95);
    shape([[mx - 4.6, my - 4.4], [mx + 4.6, my - 4.4], [mx + 5.2, my - 11.5], [mx - 5.2, my - 11.5]], C(spec.bag), .15, .9);
    if (D === 2) line([[mx - 4.4, my - 6.6], [mx + 4.4, my - 6.6]], .45, .6);
  }
  // The phone, lit: the only light on this side of them.
  if (phoneAt) {
    g.save(); g.translate(phoneAt[0], phoneAt[1] + 2.4); g.rotate(.18 * dir);
    g.fillStyle = '#0d0e11'; g.fillRect(-1.75, -3, 3.5, 6);
    g.fillStyle = pose.screen || '#dcefff'; g.fillRect(-1.4, -2.65, 2.8, 5.3);
    g.restore();
  }

  // The neck, the head, the ears, the hair and the face.
  const look = pose.look === 'phone' ? 1 : 0;
  const hw = f ? 5.15 : 5.45, hh = 7.7;
  const hy = Y.chin + hh;
  const hx = headX + (phoneAt ? dir * look * .7 : 0);
  const tiltH = (pose.head || 0) * .12 + look * (arms === 'phoneFar' ? -.1 : .12) * dir + (mood === 'joy' ? Math.sin(t * 3 + seed) * .03 : 0);
  shape([[hx - 2.4, Y.chin + 1.6], [hx + 2.4, Y.chin + 1.6], [hx + 3.1 + cx * .1, Y.neck - .3], [hx - 3.1 + cx * .1, Y.neck - .3]], skin, .1, .85);
  if (D) { g.save(); g.fillStyle = rgba(SHADE.lit ? '#6a3f38' : '#000000', SHADE.lit ? .28 : .2); g.beginPath(); closed(g, [[hx - 2.4, Y.chin + 1.7], [hx + 2.4, Y.chin + 1.7], [hx + 2.7, Y.chin - .1], [hx - 2.7, Y.chin - .1]], .3); g.fill(); g.restore(); }
  g.save();
  g.translate(hx, hy); g.rotate(-tiltH);
  const fx = turn * hw * .3;                                 // the face's middle line, turned
  if (hs === 'bob') shape([[-hw * 1.2, 1.2], [0, hh * 1.18], [hw * 1.2, 1.2], [hw * 1.22, -hh * .78], [-hw * 1.22, -hh * .78]], hairC, .25, .9);
  if (hs === 'bun') shape([[-fx * .5 - 3, hh * .9], [-fx * .5 + 3, hh * .9], [-fx * .5 + 3.3, hh * 1.28], [-fx * .5 + 1.4, hh * 1.5], [-fx * .5 - 1.4, hh * 1.5], [-fx * .5 - 3.3, hh * 1.28]], hairC, .35, .85);
  // The ears (the near one only, turned).
  for (const sd of [-1, 1]) {
    if (turn && sd === turn) continue;
    const ex = sd * hw * .98 - turn * hw * .12;
    shape([[ex, -.6], [ex + sd * 1.15, -.1], [ex + sd * 1.3, 1.7], [ex + sd * .45, 2.2], [ex, 1.9]], skin, .3, .7);
  }
  // The head: a cranium over a jaw that narrows to the chin, turned a little to the face.
  const jw = round ? 1.06 : 1;
  const head = [[-hw, .4], [-hw * .9, 3.9], [-hw * .55, hh * .94], [fx * .3, hh], [hw * .55, hh * .94], [hw * .9, 3.9], [hw, .4], [hw * .92 * jw + fx * .12, -2.6], [hw * .64 * jw + fx * .2, -4.9], [fx + hw * .22, -hh * .98], [fx - hw * .22, -hh * .98], [-hw * .64 * jw + fx * .2, -4.9], [-hw * .92 * jw + fx * .12, -2.6]];
  shape(head, skin, .2);
  if (D === 2 && SHADE.lit) { g.save(); g.beginPath(); closed(g, head); g.clip(); g.fillStyle = rgba('#7a4a3a', .16); g.beginPath(); closed(g, [[hw * .35 + fx, hh], [hw * 1.1, hh], [hw * 1.1, -hh], [hw * .55 + fx, -hh]], .2); g.fill(); g.restore(); }
  // The face.
  if (D) {
    const ey = .9, esp = hw * .43, ew = D === 2 ? .82 : .95, eh = D === 2 ? 1.08 : 1.12;
    const eyeCol = SHADE.lit ? '#231a18' : mix(skin, '#000000', .72);
    for (const sd of [-1, 1]) {
      const ex = fx + sd * esp * (turn && sd === turn ? .8 : 1);
      g.fillStyle = eyeCol; g.strokeStyle = eyeCol; g.lineCap = 'round';
      if (mood === 'joy') { g.lineWidth = lw * .9; g.beginPath(); g.arc(ex, ey - .2, ew * .95, .3, Math.PI - .3); g.stroke(); }
      else {
        g.beginPath(); g.ellipse(ex, ey, ew * .55, eh * .6, 0, 0, Math.PI * 2); g.fill();
        if (mood === 'deadpan') { g.fillStyle = skin; g.fillRect(ex - ew, ey + .12, ew * 2, eh); g.lineWidth = lw * .7; g.beginPath(); g.moveTo(ex - ew * .78, ey + .12); g.lineTo(ex + ew * .78, ey + .12); g.stroke(); }
        if (D === 2 && SHADE.lit) { g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.arc(ex + .22, ey + .28, .2, 0, Math.PI * 2); g.fill(); }
      }
      const bA = mood === 'cross' ? -.38 * sd : mood === 'worried' ? .3 * sd : mood === 'joy' ? .08 * sd : 0;
      const by = ey + 1.9 + (mood === 'joy' ? .28 : 0);
      g.lineWidth = lw * (D === 2 ? .82 : .7); g.strokeStyle = SHADE.lit ? mix(hairC, '#000000', .35) : eyeCol;
      g.beginPath(); g.moveTo(ex - ew * 1.05, by + bA * .9); g.lineTo(ex + ew * 1.05, by - bA * .9); g.stroke();
    }
    g.strokeStyle = SHADE.lit ? rgba('#5a3228', .8) : mix(skin, '#000000', .5); g.lineWidth = lw * .6;
    g.beginPath(); g.moveTo(fx + .35 + turn * .45, ey - .1); g.lineTo(fx + .62 + turn * .95, -1.9); g.lineTo(fx - .15 + turn * .5, -2.2); g.stroke();
    const my = -3.9;
    g.strokeStyle = SHADE.lit ? '#4a2622' : mix(skin, '#000000', .6); g.lineWidth = lw * .75;
    if (mood === 'joy' || arms === 'cheer') {
      g.fillStyle = SHADE.lit ? '#6b2a2a' : mix(skin, '#000000', .6);
      g.beginPath(); g.moveTo(fx - 1.55, my + .3); g.quadraticCurveTo(fx, my - 2, fx + 1.55, my + .3); g.closePath(); g.fill(); g.stroke();
    } else if (mood === 'cross') { g.beginPath(); g.moveTo(fx - 1.15, my - .35); g.quadraticCurveTo(fx, my + .4, fx + 1.15, my - .35); g.stroke(); }
    else { g.beginPath(); g.moveTo(fx - 1.05, my); g.quadraticCurveTo(fx, my - (mood === 'deadpan' ? 0 : .35), fx + 1.05, my); g.stroke(); }
    if (old && D === 2) { g.lineWidth = lw * .45; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(fx + sd * 1.95, -1.8); g.quadraticCurveTo(fx + sd * 2.45, -3.4, fx + sd * 1.85, -4.8); g.stroke(); } }
    if (round && D === 2) { g.lineWidth = lw * .45; g.beginPath(); g.moveTo(fx - 2.2, -hh * .9); g.quadraticCurveTo(fx, -hh * 1.12, fx + 2.2, -hh * .9); g.stroke(); }
    if (mood === 'joy' && SHADE.lit) { g.fillStyle = 'rgba(230,110,110,.3)'; for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(fx + sd * esp * 1.3, -1.6, 1.1, .6, 0, 0, Math.PI * 2); g.fill(); } }
    if (spec.glasses) {
      g.strokeStyle = SHADE.lit ? '#3a3230' : mix(skin, '#ffffff', .2); g.lineWidth = lw * .7;
      for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(fx + sd * esp, ey, 1.6, 1.35, 0, 0, Math.PI * 2); g.stroke(); }
      g.beginPath(); g.moveTo(fx - esp + 1.55, ey + .2); g.quadraticCurveTo(fx, ey + .8, fx + esp - 1.55, ey + .2); g.stroke();
    }
  } else if (spec.glasses && h > 60) {
    g.strokeStyle = SHADE.lit ? '#3a3230' : mix(skin, '#ffffff', .25); g.lineWidth = lw * .8;
    for (const sd of [-1, 1]) { g.beginPath(); g.arc(fx + sd * hw * .43, .9, 1.45, 0, Math.PI * 2); g.stroke(); }
  }
  // The hair on top: a mass, a fringe, a few strands.
  const capFront = [[-hw * 1.06, -.2], [-hw * 1.02, 3.6], [-hw * .72, hh * .92], [fx * .4, hh * 1.1], [hw * .72, hh * .92], [hw * 1.02, 3.6], [hw * 1.06, -.2], [hw * .82, 2.4], [hw * .45 + fx * .3, 3.6], [fx, 3.1], [-hw * .45 + fx * .3, 3.6], [-hw * .82, 2.4]];
  if (['short', 'long', 'bob', 'bun'].includes(hs)) shape(hs === 'short' ? capFront.map(([u, v]) => [u, v > 2 ? v : v + .9]) : capFront, hairC, .22, .9);
  if (hs === 'curly') {
    for (let i = 0; i < 11; i++) { const a = Math.PI * (-.1 + i / 10 * 1.2); const cr = hw * (.36 + hash(seed, i) * .08); shape(Array.from({ length: 7 }, (_, kk) => { const q = kk / 7 * Math.PI * 2; return [Math.cos(a) * hw * .92 + Math.cos(q) * cr, Math.sin(a) * hh * .9 + .8 + Math.sin(q) * cr]; }), hairC, .3, .6); }
  }
  if (hs === 'bald') {
    for (const sd of [-1, 1]) shape([[sd * hw * 1.02, .2], [sd * hw * 1.05, 2.8], [sd * hw * .75, 2], [sd * hw * .8, .1]], C(spec.hair?.col || HAIRC.grey), .3, .7);
    if (SHADE.lit && D) { g.strokeStyle = 'rgba(255,250,235,.75)'; g.lineWidth = lw * .8; g.beginPath(); g.arc(fx - hw * .2, 1.5, hw * .6, 1.9, 2.6); g.stroke(); }
  }
  if (hs === 'cap') shape([[-hw * 1.08, 2.6], [-hw * .95, hh * 1.02], [hw * .95, hh * 1.02], [hw * 1.08, 2.6], [hw * 1.08 + dir * hw * .9, 1.9]], C(spec.hair?.hat || '#3b5a8a'), .15);
  if (D && ['short', 'long', 'bob', 'bun'].includes(hs)) {
    for (let i = 0; i < (D === 2 ? 4 : 2); i++) { const u = (i + .5) / (D === 2 ? 4 : 2) * 2 - 1; line([[u * hw * .7 + fx * .3, hh * .95], [u * hw * .85 + fx * .2, hh * .5], [u * hw * .95, 3.2]], .42, .5); }
  }
  g.restore();
  g.restore();
  g.restore();
  return { head: [x + hx * s, y - hy * s], phone: phoneAt ? [x + phoneAt[0] * s, y - phoneAt[1] * s] : null, top: [x, y - 100 * s] };
}

// A stranger from a seed: varied build, colours, hair, clothes, height.
const TOPS = ['#c0492f', '#2f5d8a', '#e3b04b', '#3f7a5a', '#8a4f7d', '#d9d2c3', '#48505e', '#a05a2c', '#6d8fb3', '#b8b24a', '#7a2f3a', '#2a2e38'];
const LEGS = ['#2e3446', '#3d3a36', '#5a5f6e', '#20242c', '#6b5a48', '#394c6b'];
export function stranger(seed) {
  const r = k => hash(seed, k);
  const sex = r(1) < .5 ? 'f' : 'm';
  const styles = sex === 'f' ? ['long', 'bob', 'bun', 'curly', 'short'] : ['short', 'short', 'curly', 'bald', 'cap'];
  const kinds = sex === 'f' ? ['shirt', 'coat', 'parka', 'dress', 'tee'] : ['shirt', 'coat', 'parka', 'tee', 'shirt'];
  const kind = kinds[Math.floor(r(6) * kinds.length)];
  return {
    sex, seed, build: .92 + r(3) * .24, shape: r(16) < .12 ? 'round' : null,
    skin: SKIN[Math.floor(r(4) * SKIN.length)],
    hair: { style: styles[Math.floor(r(2) * styles.length)], col: Object.values(HAIRC)[Math.floor(r(5) * 6)], hat: TOPS[Math.floor(r(11) * TOPS.length)] },
    top: { kind, col: TOPS[Math.floor(r(7) * TOPS.length)] },
    legs: { kind: kind === 'dress' ? 'dress' : sex === 'f' && r(10) < .3 ? 'skirt' : 'trousers', col: LEGS[Math.floor(r(12) * LEGS.length)], jeans: r(17) < .35 },
    bag: r(13) < .3 ? TOPS[Math.floor(r(14) * TOPS.length)] : null,
    height: .92 + r(15) * .14,
  };
}
