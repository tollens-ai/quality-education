// The characters, drawn as a talented child draws: Clawd, who sings, and Bruce, the dachshund.
//
// Each is a handful of shapes in their own local space (feet on y = 0, facing right or the
// camera), coloured by hatching and outlined twice. A pose is a few numbers, so the same drawing
// can bob, lean, squash, blink, sing and walk.
import { clamp, lerp, hash, TAU } from './kit.js';
import { blob, line, dot, hatch, wash, outline, spline } from './pencil.js';
import { rrect, ellipse, move, scale, rotate } from './shapes.js';
import { GRAPHITE, CLAWD, C } from './palette.js';

const ink = GRAPHITE;

// ---------------------------------------------------------------- Clawd
// The mascot's own block: a wide body, two tall eyes set high and far apart, a stub of an arm on
// each side, four short legs. Terracotta, hatched. No mouth until he sings.
//   eyes   'open' 'happy' 'wide' 'squint' 'sad' 'x' 'shut'       mouth  0..1 (how open)
//   look   [-1..1, -1..1]  where the eyes look      armL/armR  {up: -1..1, out: 0..1} or {to: [x, y]}
//   squash 0..1, lean radians, bob px, flip -1 for facing left, blink 0..1, sweat drops
export function clawd(g, o = {}) {
  const { x = 540, y = 1200, s = 1, t = 0, seed = 1, eyes = 'open', mouth = 0, look = [0, 0], armL = { up: .1 }, armR = { up: .1 },
    squash = 0, lean = 0, bob = 0, flip = 1, blink = 0, legs = 0, prop = null, cheeks = false, brow = 0 } = o;
  g.save();
  g.translate(x, y - bob);
  g.rotate(lean);
  g.scale(s * flip * (1 + squash * .1), s * (1 - squash * .13));
  const sd = seed * 97;
  const BW = 300, BH = 196, LH = 46;
  const bodyC = [0, -LH - BH / 2];
  // Legs: four stubs, the outer pair a little apart. `legs` swings them (a walk, 0..1 phase).
  [-108, -40, 40, 108].forEach((lx, i) => {
    const sw = legs ? Math.sin((legs + (i % 2) * .5) * TAU) * 9 : 0;
    blob(g, rrect(lx + sw * .4, -LH / 2 - Math.max(0, sw) * .3, 36, LH + 4, 14), { fill: CLAWD.fill, shade: CLAWD.shade, line: ink, lw: 6, seed: sd + i, t, hw: 5, sh: .4 });
  });
  // The body.
  const body = rrect(bodyC[0], bodyC[1], BW, BH, 38, 4);
  blob(g, body, { fill: CLAWD.fill, shade: CLAWD.shade, line: ink, lw: 7, seed: sd + 11, t, hw: 5.4, sh: .36, tone: .38 });
  // Arms: small blocks on the sides at about five-eighths height. up: -1 hangs, 1 raised; out: how far they lift away.
  const arm = (side, a) => {
    const base = [side * (BW / 2 - 2), bodyC[1] + 22];
    if (a.to) {
      // Sent to a point (in body space): a stub pointing there.
      const dx = a.to[0] - base[0], dy = a.to[1] - base[1];
      const ang = Math.atan2(dy, dx);
      const len = Math.min(58 + (a.reach || 0), Math.hypot(dx, dy));
      const c = [base[0] + Math.cos(ang) * len / 2, base[1] + Math.sin(ang) * len / 2];
      blob(g, rotate(rrect(c[0], c[1], len + 24, 34, 13), ang, c[0], c[1]), { fill: CLAWD.fill, shade: CLAWD.shade, line: ink, lw: 4.6, seed: sd + 20 + side, t, gap: 6, hw: 4.4, sh: .3 });
      return;
    }
    const up = a.up ?? .1, out = a.out ?? 0;
    const ang = -up * 1.05 + (side < 0 ? Math.PI : 0) * 0;
    const ax = base[0] + side * (14 + out * 22), ay = base[1] - up * 40;
    const w = 58, h = 40;
    const shape = rotate(rrect(ax + side * 6, ay, w, h, 13), side * (-up * .7), ax + side * 6, ay);
    blob(g, shape, { fill: CLAWD.fill, shade: CLAWD.shade, line: ink, lw: 4.6, seed: sd + 30 + side, t, gap: 6, hw: 4.4, sh: .3 });
  };
  arm(-1, armL); arm(1, armR);
  // Eyes.
  const ey = bodyC[1] - BH * .17;
  const bl = clamp(blink);
  [-1, 1].forEach((side, i) => {
    const ex = side * 80 + look[0] * 8, eyy = ey + look[1] * 7;
    switch (eyes) {
      case 'happy':
        line(g, [[ex - 26, eyy + 14], [ex, eyy - 20], [ex + 26, eyy + 14]], { w: 9, col: ink, seed: sd + 40 + i, t, spline: true, passes: 1, wob: 1 });
        break;
      case 'squint':
        line(g, [[ex - 26, eyy], [ex + 26, eyy]], { w: 9, col: ink, seed: sd + 40 + i, t, spline: false, passes: 1 });
        break;
      case 'shut':
        line(g, [[ex - 26, eyy + 4], [ex, eyy + 12], [ex + 26, eyy + 4]], { w: 8, col: ink, seed: sd + 40 + i, t, spline: true, passes: 1 });
        break;
      case 'x':
        line(g, [[ex - 20, eyy - 24], [ex + 20, eyy + 24]], { w: 9, col: ink, seed: sd + 40 + i, t, spline: false, passes: 1 });
        line(g, [[ex + 20, eyy - 24], [ex - 20, eyy + 24]], { w: 9, col: ink, seed: sd + 44 + i, t, spline: false, passes: 1 });
        break;
      default: {
        const wide = eyes === 'wide';
        const h = (wide ? 78 : eyes === 'sad' ? 58 : 66) * (1 - bl * .9), w = wide ? 34 : 28;
        const sh = rrect(ex, eyy, w, Math.max(6, h), 13);
        blob(g, sh, { fill: ink, line: null, seed: sd + 40 + i, t, gap: 3.6, hw: 4.4, tone: .95, dens: 1 });
        if (bl < .3) dot(g, ex + look[0] * 3 - 5, eyy - h * .22 + look[1] * 3, wide ? 6.5 : 5, { col: '#fbf8ef', seed: sd + 50 + i, t, alpha: .95 });
      }
    }
  });
  if (brow) {
    // Worried or cross brows over the eyes: brow > 0 slopes them in (worried), < 0 out (cross).
    line(g, [[-104, ey - 58 - brow * 10], [-56, ey - 58 + brow * 10]], { w: 7, col: ink, seed: sd + 60, t, spline: false, passes: 1 });
    line(g, [[104, ey - 58 - brow * 10], [56, ey - 58 + brow * 10]], { w: 7, col: ink, seed: sd + 61, t, spline: false, passes: 1 });
  }
  if (cheeks) {
    [-1, 1].forEach((side, i) => hatch(g, ellipse(side * 112, ey + 52, 24, 15, 8), { col: C.pink, seed: sd + 70 + i, t, gap: 5, w: 4, alpha: .8, spill: 2 }));
  }
  // The mouth: a stroke, opening to a round-cornered O when he sings.
  const my = bodyC[1] + BH * .17;
  if (mouth > .08) {
    const mh = 8 + mouth * 46, mw = 40 + mouth * 26;
    blob(g, rrect(0, my + mh / 2 - 6, mw, mh, Math.min(20, mh / 2)), { fill: '#7a2e2a', line: ink, lw: 4.4, seed: sd + 80, t, gap: 4, hw: 4, tone: .85 });
    if (mouth > .45) blob(g, ellipse(0, my + mh - 8, mw * .32, mh * .18, 7), { fill: C.pink, line: null, seed: sd + 81, t, gap: 4, hw: 3.5, tone: .8 });
  } else {
    line(g, [[-20, my + 4], [0, my + 9], [20, my + 4]], { w: 6, col: ink, seed: sd + 82, t, spline: true, passes: 1 });
  }
  if (prop) prop(g, { sd, t, BW, BH, LH, bodyC });
  g.restore();
}

// ---------------------------------------------------------------- Bruce
// A dachshund facing right: a long sausage of a body, four short legs, a big round head with a long
// nose, one long soft ear.
//   walk: a phase 0..1 swinging the legs      tail: wag phase          ear: flop amount
//   mouth: 0..1 open (0 closed smile)         eyes: 'open' 'happy' 'sad' 'wide' 'x'
//   coat/shade/muzzle: colours, so other dogs can borrow the drawing.
export function dachshund(g, o = {}) {
  const { x = 540, y = 1200, s = 1, t = 0, seed = 2, walk = 0, tail = 0, ear = 0, mouth = 0, eyes = 'open', flip = 1, lean = 0, bob = 0, squash = 0,
    coat = '#c9772f', shade = '#8f4a1c', muzzle = '#f0c48f', collar = C.blue, tag = C.yellow, length = 1, look = 0, tongue = false, brow = 0, legH = 64, bodyH = 122, headS = 1, snoutL = 1, earS = 1, tailS = 1 } = o;
  g.save();
  g.translate(x, y - bob);
  g.rotate(lean);
  g.scale(s * flip * (1 + squash * .1), s * (1 - squash * .13));
  const sd = seed * 131;
  const LEN = 400 * length, LH = legH, BH = bodyH;
  const bc = [-LEN * .1, -LH - BH * .46];
  const legAt = (lx, ph, far) => {
    const sw = walk ? Math.sin((walk + ph) * TAU) * 22 : 0;
    const lift = walk ? Math.max(0, Math.sin((walk + ph) * TAU)) * 14 : 0;
    const shp = rotate(rrect(lx + sw * .6, -LH / 2 - lift * .5, 40, LH + 12, 16), sw * (walk ? 22 / Math.max(22, LH) * 0.012 : .012), lx, -LH / 2);
    blob(g, shp, { fill: far ? shade : coat, shade, line: ink, lw: 6, seed: sd + (far ? 5 : 1) + lx, t, hw: 5, sh: .35 });
    blob(g, ellipse(lx + sw * .6 + 10, -5 - lift, 31, 14, 8), { fill: far ? shade : coat, line: ink, lw: 5.4, seed: sd + 9 + lx, t, hw: 4.6, tone: .3 });
  };
  legAt(-LEN * .38, .5, true); legAt(LEN * .26, 0, true);
  // Tail: a thin curl at the back.
  const tw = Math.sin(tail * TAU) * 16;
  const tl = [[-LEN * .5, bc[1] - 6], [-LEN * .58, bc[1] - 44 + tw * .2], [-LEN * .62 + tw * .4, bc[1] - 96 - tw * .4]];
  line(g, tl, { w: 18, col: coat, seed: sd + 3, t, spline: true, passes: 1, taper: [.04, .5], tooth: .5, wob: 2 });
  line(g, tl, { w: 6.5, col: ink, seed: sd + 4, t, spline: true, passes: 1, taper: [.02, .6] });
  // Body: a long bean, deeper at the chest.
  const body = spline([
    [bc[0] - LEN * .5, bc[1] - 4], [bc[0] - LEN * .44, bc[1] - BH * .5], [bc[0] - LEN * .1, bc[1] - BH * .52], [bc[0] + LEN * .3, bc[1] - BH * .56],
    [bc[0] + LEN * .5, bc[1] - BH * .3], [bc[0] + LEN * .55, bc[1] + BH * .08], [bc[0] + LEN * .4, bc[1] + BH * .46], [bc[0] + LEN * .05, bc[1] + BH * .5],
    [bc[0] - LEN * .3, bc[1] + BH * .42], [bc[0] - LEN * .48, bc[1] + BH * .2]], true, 6);
  blob(g, body, { fill: coat, shade, line: ink, lw: 6.6, seed: sd + 11, t, hw: 5.4, sh: .34 });
  legAt(-LEN * .3, 0, false); legAt(LEN * .33, .5, false);
  // Head: a big round one, with a long snout out of its lower half.
  const hc = [bc[0] + LEN * .6, bc[1] - BH * .5];
  const HR = 80 * headS;
  blob(g, ellipse(hc[0], hc[1], HR, HR * .94, 12), { fill: coat, shade, line: ink, lw: 6.4, seed: sd + 21, t, hw: 5.2, sh: .28 });
  const sn = [hc[0] + 78 * snoutL, hc[1] + 22];
  blob(g, rrect(sn[0], sn[1], 138 * snoutL, 62 * headS, 28), { fill: muzzle, shade: coat, line: ink, lw: 5.8, seed: sd + 22, t, hw: 4.8, tone: .4, sh: .22 });
  // Nose and mouth.
  blob(g, ellipse(sn[0] + 64 * snoutL, sn[1] - 14, 21, 16, 8), { fill: ink, line: null, seed: sd + 23, t, gap: 3.2, hw: 4.4, tone: .95 });
  if (mouth > .08) {
    const mh = 8 + mouth * 38;
    blob(g, [[sn[0] + 2, sn[1] + 12], [sn[0] + 52, sn[1] + 12 + mh * .3], [sn[0] + 40, sn[1] + 12 + mh], [sn[0] + 4, sn[1] + 12 + mh * .7]], { fill: '#7a2e2a', line: ink, lw: 5, seed: sd + 24, t, gap: 4, hw: 4.2, tone: .85 });
    if (tongue || mouth > .5) blob(g, ellipse(sn[0] + 26, sn[1] + 12 + mh * .85, 18, 12, 7), { fill: C.pink, line: ink, lw: 4.4, seed: sd + 25, t, gap: 4, hw: 4, tone: .7 });
  } else {
    line(g, [[sn[0] + 60 * snoutL, sn[1] + 16], [sn[0] + 22 * snoutL, sn[1] + 24], [sn[0] + 2, sn[1] + 14]], { w: 6.6, col: ink, seed: sd + 24, t, spline: true, passes: 1 });
  }
  // Eye: big and round, set well forward of the ear.
  const ex = hc[0] + 30 * headS + look * 4, eyy = hc[1] - 16 * headS;
  if (eyes === 'happy') line(g, [[ex - 17, eyy + 8], [ex, eyy - 9], [ex + 17, eyy + 8]], { w: 8.5, col: ink, seed: sd + 26, t, spline: true, passes: 1 });
  else if (eyes === 'x') { line(g, [[ex - 13, eyy - 13], [ex + 13, eyy + 13]], { w: 8, col: ink, seed: sd + 26, t, spline: false, passes: 1 }); line(g, [[ex + 13, eyy - 13], [ex - 13, eyy + 13]], { w: 8, col: ink, seed: sd + 27, t, spline: false, passes: 1 }); }
  else if (eyes === 'wide') {
    const r = 22;
    blob(g, ellipse(ex, eyy, r, r * 1.06, 8), { fill: '#fbf8ef', line: ink, lw: 5, seed: sd + 26, t, gap: 6, hw: 4.6, tone: .95 });
    dot(g, ex + 4 + look * 4, eyy + 2, r * .58, { col: ink, seed: sd + 27, t });
    dot(g, ex + 1 + look * 4, eyy - 3, r * .2, { col: '#fbf8ef', seed: sd + 28, t });
  } else {
    const r = 17;
    dot(g, ex + look * 3, eyy, r, { col: ink, seed: sd + 27, t });
    dot(g, ex - 4 + look * 3, eyy - 6, r * .3, { col: '#fbf8ef', seed: sd + 28, t });
  }
  if (eyes === 'sad' || brow) line(g, [[ex - 24, eyy - 26 - brow * 4], [ex + 18, eyy - 36 + brow * 8]], { w: 7, col: ink, seed: sd + 28, t, spline: false, passes: 1 });
  // The ear: long and soft, hanging from the back of the head and swinging.
  const es = ear * 16 + (walk ? Math.sin(walk * TAU + 1) * 7 : 0);
  const ea = [hc[0] - 12, hc[1] - 70 * headS];
  const K = earS;
  const earShape = spline([[ea[0] - 26 * K, ea[1] + 8], [ea[0] + 22 * K, ea[1]], [ea[0] + (34 + es * .6) * K, ea[1] + 70 * K], [ea[0] + (22 + es) * K, ea[1] + 148 * K], [ea[0] + (-12 + es * 1.2) * K, ea[1] + 160 * K], [ea[0] + (-40 + es) * K, ea[1] + 110 * K], [ea[0] + (-42 + es * .5) * K, ea[1] + 50 * K]], true, 6);
  blob(g, earShape, { fill: shade, shade: '#5d331a', line: ink, lw: 6, seed: sd + 29, t, hw: 5, tone: .4, sh: .32 });
  // Collar and tag.
  const cx = hc[0] - 26, cy = hc[1] + 66;
  const cl = [[cx - 28, cy - 14], [cx + 8, cy + 6], [cx + 42, cy - 8]];
  line(g, cl, { w: 22, col: collar, seed: sd + 30, t, spline: true, passes: 1, taper: [.02, .02], tooth: .45 });
  line(g, cl, { w: 5, col: ink, seed: sd + 31, t, spline: true, passes: 1, taper: [.02, .02], alpha: .7 });
  blob(g, ellipse(cx + 12, cy + 30, 17, 17, 8), { fill: tag, line: ink, lw: 4.6, seed: sd + 32, t, hw: 4.4, tone: .55 });
  g.restore();
}
